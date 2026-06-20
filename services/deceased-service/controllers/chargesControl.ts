import { Request, Response } from 'express';

// Mock data for development - will be replaced with actual DB queries
let mockCharges: any[] = [];

/**     
 * GET /charges/:deceased_id
 * Get all charges for a deceased
 */    


export const getCharges = async (req: Request, res: Response) => {
  try {
    const { deceased_id } = req.params;
    const tenantSlug = (req as any).tenantSlug || 'system_shared';
    
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
