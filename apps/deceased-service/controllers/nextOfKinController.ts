import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { INextOfKin, INextOfKinCreateDTO, INextOfKinQueryParams } from '../models/NextOfKin';
import { safeQuery } from '../../../configurations/sqlConfig/db';
import { getKenyaTimeISO } from '../../../utilities/timeStamps/timeStamps';
import { logger } from '../../../global/logger/logger';

// Validation function for Next of Kin data
const validateNextOfKinData = (data: INextOfKinCreateDTO): string[] => {
  const errors: string[] = [];
  
  if (!data.deceased_id) errors.push('deceased_id is required');
  if (!data.full_name) errors.push('full_name is required');
  if (!data.relationship) errors.push('relationship is required');
  if (!data.contact) errors.push('contact is required');
  
  // Validate email format if provided
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  // Validate phone number (Kenyan format)
  if (data.contact && !/^(\+254|0)[17]\d{8}$/.test(data.contact)) {
    errors.push('Invalid contact number format. Use Kenyan format (e.g., 0712345678 or +254712345678)');
  }
  
  return errors;
};

// Register Next of Kin
export const registerNextOfKin = async (req: Request, res: Response): Promise<Response> => {
  const { 
    deceased_id, 
    full_name, 
    relationship, 
    contact, 
    email,
    is_primary = false,
    address,
    alternative_contact
  }: INextOfKinCreateDTO & { address?: string; alternative_contact?: string } = req.body;

  // Validate required fields
  const validationErrors = validateNextOfKinData({ deceased_id, full_name, relationship, contact, email });
  
  if (validationErrors.length > 0) {
    logger.warn('Next of kin validation failed', { errors: validationErrors, body: req.body });
    return res.status(400).json({
      message: 'Validation failed',
      errors: validationErrors
    });
  }

  try {
    // Check if deceased exists
    const deceasedCheck = await safeQuery<RowDataPacket[]>(
      'SELECT deceased_id FROM deceased WHERE deceased_id = ? AND is_deleted = FALSE',
      [deceased_id]
    );

    if (deceasedCheck.length === 0) {
      logger.warn(`Deceased not found for next of kin registration: ${deceased_id}`);
      return res.status(404).json({
        message: 'Deceased person not found'
      });
    }

    // If this is primary, ensure no other primary exists
    if (is_primary) {
      const primaryCheck = await safeQuery<RowDataPacket[]>(
        `SELECT id FROM next_of_kin 
         WHERE deceased_id = ? AND is_primary = TRUE AND is_deleted = FALSE`,
        [deceased_id]
      );
      
      if (primaryCheck.length > 0) {
        logger.warn(`Attempt to add duplicate primary next of kin for deceased: ${deceased_id}`);
        return res.status(400).json({
          message: 'Only one primary next of kin is allowed per deceased person. Please update the existing one or set is_primary to false.'
        });
      }
    }

    const insertQuery = `
      INSERT INTO next_of_kin (
        deceased_id, 
        full_name, 
        relationship, 
        contact, 
        email, 
        is_primary,
        address,
        alternative_contact,
        created_by,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await safeQuery<ResultSetHeader>(insertQuery, [
      deceased_id,
      full_name,
      relationship,
      contact,
      email || null,
      is_primary ? 1 : 0,
      address || null,
      alternative_contact || null,
      req.user?.userId || null,
      getKenyaTimeISO(),
    ]);

    const kin_id = result.insertId;

    logger.info(`Next of kin registered successfully`, {
      kin_id,
      deceased_id,
      full_name,
      relationship,
      is_primary
    });

    // Queue email notification if email provided
    if (email) {
      // TODO: Implement email queueing for notifications
      logger.info(`Email notification queued for: ${email}`);
      // await queueEmailNotification({ to: email, type: 'next_of_kin_registered', data: { kin_id, deceased_id, full_name } });
    }

    return res.status(201).json({
      message: 'Next of kin registered successfully',
      kin_id,
      is_primary
    });
    
  } catch (error: any) {
    logger.error('Error inserting next of kin:', {
      error: error.message,
      stack: error.stack,
      deceased_id,
      full_name
    });
    
    // Handle duplicate primary key error from trigger
    if (error.message.includes('Only one primary next of kin')) {
      return res.status(400).json({
        message: error.message
      });
    }
    
    return res.status(500).json({
      message: 'Failed to register next of kin',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Fetch Next of Kin By Deceased ID
export const getNextOfKinByDeceasedId = async (req: Request, res: Response): Promise<Response> => {
  const { deceased_id } = req.query as INextOfKinQueryParams;
  
  if (!deceased_id) {
    logger.warn('getNextOfKinByDeceasedId called without deceased_id');
    return res.status(400).json({ 
      message: 'deceased_id is required' 
    });
  }

  try {
    const rows = await safeQuery<INextOfKin[]>(
      `SELECT 
        id, 
        deceased_id,
        full_name, 
        relationship, 
        contact, 
        email,
        is_primary,
        is_notified,
        notified_at,
        address,
        alternative_contact,
        created_at,
        updated_at
       FROM next_of_kin 
       WHERE deceased_id = ? AND is_deleted = FALSE
       ORDER BY is_primary DESC, created_at ASC`,
      [deceased_id],
    );

    logger.info(`Next of kin fetched for deceased ${deceased_id}`, { count: rows.length });

    return res.status(200).json({
      message: 'Next of kin fetched successfully',
      count: rows.length,
      data: rows,
    });
    
  } catch (error: any) {
    logger.error('Error fetching next of kin:', {
      error: error.message,
      stack: error.stack,
      deceased_id
    });
    
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update Next of Kin
export const updateNextOfKin = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const updates = req.body;
  
  if (!id) {
    return res.status(400).json({ message: 'Next of kin ID is required' });
  }
  
  try {
    // Check if next of kin exists
    const existing = await safeQuery<INextOfKin[]>(
      'SELECT id, deceased_id FROM next_of_kin WHERE id = ? AND is_deleted = FALSE',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Next of kin record not found' });
    }
    
    // Build dynamic update query
    const allowedFields = ['full_name', 'relationship', 'contact', 'email', 'is_primary', 'address', 'alternative_contact'];
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updates[field]);
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    
    // If updating to primary, check for conflicts
    if (updates.is_primary === true) {
      const primaryCheck = await safeQuery<RowDataPacket[]>(
        `SELECT id FROM next_of_kin 
         WHERE deceased_id = ? AND is_primary = TRUE AND is_deleted = FALSE AND id != ?`,
        [existing[0].deceased_id, id]
      );
      
      if (primaryCheck.length > 0) {
        return res.status(400).json({
          message: 'Only one primary next of kin is allowed per deceased person'
        });
      }
    }
    
    updateValues.push(id);
    const updateQuery = `
      UPDATE next_of_kin 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND is_deleted = FALSE
    `;
    
    await safeQuery(updateQuery, updateValues);
    
    logger.info(`Next of kin updated: ${id}`);
    
    return res.status(200).json({
      message: 'Next of kin updated successfully'
    });
    
  } catch (error: any) {
    logger.error('Error updating next of kin:', {
      error: error.message,
      stack: error.stack,
      id
    });
    
    return res.status(500).json({
      message: 'Failed to update next of kin',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete Next of Kin (Soft Delete)
export const deleteNextOfKin = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ message: 'Next of kin ID is required' });
  }
  
  try {
    const deleteQuery = `
      UPDATE next_of_kin 
      SET is_deleted = TRUE, 
          deleted_at = ?,
          deleted_by = ?
      WHERE id = ? AND is_deleted = FALSE
    `;
    
    const result = await safeQuery<ResultSetHeader>(deleteQuery, [
      getKenyaTimeISO(),
      req.user?.userId || null,
      id
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Next of kin record not found' });
    }
    
    logger.info(`Next of kin deleted: ${id}`);
    
    return res.status(200).json({
      message: 'Next of kin deleted successfully'
    });
    
  } catch (error: any) {
    logger.error('Error deleting next of kin:', {
      error: error.message,
      stack: error.stack,
      id
    });
    
    return res.status(500).json({
      message: 'Failed to delete next of kin',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Mark as Notified
export const markAsNotified = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ message: 'Next of kin ID is required' });
  }
  
  try {
    const updateQuery = `
      UPDATE next_of_kin 
      SET is_notified = TRUE, notified_at = ?
      WHERE id = ? AND is_deleted = FALSE
    `;
    
    const result = await safeQuery<ResultSetHeader>(updateQuery, [getKenyaTimeISO(), id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Next of kin record not found' });
    }
    
    return res.status(200).json({
      message: 'Next of kin marked as notified successfully'
    });
    
  } catch (error: any) {
    logger.error('Error marking next of kin as notified:', {
      error: error.message,
      stack: error.stack,
      id
    });
    
    return res.status(500).json({
      message: 'Failed to mark as notified'
    });
  }
};