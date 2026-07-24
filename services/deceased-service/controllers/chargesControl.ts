import { Request, Response } from 'express';
import { query, execute, resolveDatabase, safeTenantExecute, safeTenantQuery } from '../../../shared/dbConfig';


// Mock data for development - will be replaced with actual DB queries
let mockCharges: any[] = [];
let mockPayments: any[] = [];

/**     
 * GET /charges/:deceased_id
 * Get all charges for a deceased
 */    


export const getCharges = async (req: Request, res: Response) => {
  try {
    const { deceased_id } = req.params;
    const tenantSlug = (req as any).headers['x-slug'] || (req as any).headers['x-tenant-slug'] || 'system_shared';
    
    // Filter charges for this deceased
    const charges = mockCharges.filter(c => c.deceased_id === deceased_id);
    
    return res.json({
      success: true,
      data: charges,
      message: 'Charges retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error getting charges:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve charges'
    });
  }
};

/**
 * POST /charges
 * Add a new charge
 */

export const addCharge = async (req: Request, res: Response) => {
  try {
    const chargeData = req.body;
    const newCharge = {
      id: Date.now().toString(),
      ...chargeData,
      created_at: new Date().toISOString()
    };
    mockCharges.push(newCharge);
    
    return res.status(201).json({
      success: true,
      data: newCharge,
      message: 'Charge added successfully'
    });
  } catch (error: any) {
    console.error('Error adding charge:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to add charge'
    });
  }
};

/**
 * PUT /charges/:id
 * Update an existing charge
 */
export const updateCharge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const index = mockCharges.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Charge not found'
      });
    }
    
    mockCharges[index] = {
      ...mockCharges[index],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    return res.json({
      success: true,
      data: mockCharges[index],
      message: 'Charge updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating charge:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update charge'
    });
  }
}; 







/**
 * DELETE /charges/:id
 * Delete a charge
 */
export const deleteCharge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const index = mockCharges.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Charge not found'
      });
    }
    
    mockCharges.splice(index, 1);
    
    return res.json({
      success: true,
      message: 'Charge deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting charge:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete charge'
    });
  }
};

/**
 * GET /payments/:deceased_id
 * Get all payments for a deceased
 */
export const getPayments = async (req: Request, res: Response) => {
  try {
    const { deceased_id } = req.params;
    const tenantSlug = (req as any).headers['x-slug'] || (req as any).headers['x-tenant-slug'] || 'system_shared';
    
    // Filter payments for this deceased
    const payments = mockPayments.filter(p => p.deceased_id === deceased_id);
    
    return res.json({
      success: true,
      data: payments,
      message: 'Payments retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error getting payments:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve payments'
    });
  }
};

/**
 * POST /payments
 * Record a new payment
 */
export const recordPayment = async (req: Request, res: Response) => {
  try {
    const tenantSlug = (req as any).headers['x-slug'] || (req as any).headers['x-tenant-slug'] || 'system_shared';
    const paymentData = req.body;
    
    // Validate required fields
    if (!paymentData.deceased_id || !paymentData.amount || !paymentData.payment_method) {
      return res.status(400).json({
        success: false,
        message: 'deceased_id, amount, and payment_method are required'
      });
    }
    
    const newPayment = {
      id: Date.now().toString(),
      ...paymentData,
      recorded_by: paymentData.recorded_by || (req as any).user?.name || (req as any).user?.username || 'System',
      payment_date: paymentData.payment_date || new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    mockPayments.push(newPayment);
    
    return res.status(201).json({
      success: true,
      data: newPayment,
      message: 'Payment recorded successfully'
    });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to record payment'
    });
  }
};
