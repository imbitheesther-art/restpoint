import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Package,
  TrendingUp,
  TrendingDown,
  Plus,
  AlertTriangle,
  CheckCircle,
  Search,
  BarChart3,
  Beaker,
  Edit3,
  X,
  Save,
  History,
  Syringe,
  Shield,
  RefreshCw,
  Clock,
  Target,
  Zap,
  Download,
  Upload,
  ArrowRightLeft,
  Eye,
  Printer,
  DollarSign,
  Trash2,
  User,
  Warehouse,
  FileText,
  Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  fetchChemicals,
  createChemical,
  updateChemical,
  deleteChemical,
  receiveStock,
  adjustStock,
  fetchTransactions,
  recordUsage,
  fetchBranchUsage,
  fetchChemicalAnalytics,
  fetchDashboardSummary,
  fetchLowStockAlerts,
  createPPERequest,
  fetchPPERequests,
  updatePPERequest,
  createTransfer,
  fetchTransfers,
  approveTransfer
} from '../../api/chemicalsApi';

// Colors
const COLORS = {
  primaryDark: '#1E293B',
  accentRed: '#EF4444',
  accentBlue: '#3B82F6',
  successGreen: '#10B981',
  dangerRed: '#DC2626',
  warningYellow: '#F59E0B',
  infoBlue: '#0EA5E9',
  darkGray: '#334155',
  light: '#F8FAFC',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#1E293B',
  textSecondary: '#64748B'
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const modalIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

// Styled Components
const DashboardContainer = styled.div`
  padding: 24px;
  background: ${COLORS.light};
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  color: ${COLORS.primaryDark};
  font-size: 28px;
  font-weight: 800;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  background: ${({ variant }) =>
    variant === 'primary' ? COLORS.accentBlue :
      variant === 'success' ? COLORS.successGreen :
        variant === 'warning' ? COLORS.warningYellow : COLORS.cardBg};
  color: ${({ variant }) => variant ? 'white' : COLORS.textPrimary};
  border: ${({ variant }) => variant ? 'none' : `1px solid ${COLORS.border}`};
  border-radius: 8px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: ${COLORS.cardBg};
  border-radius: 12px;
  padding: 20px;
  border: 1px solid ${COLORS.border};
  animation: ${fadeIn} 0.6s ease-out;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const StatTitle = styled.div`
  color: ${COLORS.textSecondary};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatValue = styled.div`
  color: ${COLORS.textPrimary};
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 6px;
`;

const StatTrend = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ trend }) => trend === 'up' ? COLORS.successGreen : COLORS.accentRed};
`;

const ContentSection = styled.div`
  background: ${COLORS.cardBg};
  border-radius: 12px;
  padding: 24px;
  border: 1px solid ${COLORS.border};
  margin-bottom: 24px;
  animation: ${fadeIn} 0.6s ease-out;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  color: ${COLORS.textPrimary};
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChemicalTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  background: ${COLORS.light};
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${COLORS.textSecondary};
  border-bottom: 1px solid ${COLORS.border};
`;

const TableCell = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid ${COLORS.border};
  font-size: 14px;
  color: ${COLORS.textPrimary};
`;

const TableRow = styled.tr`
  transition: background 0.2s ease;
  
  &:hover {
    background: ${COLORS.light};
  }
  
  &:last-child ${TableCell} {
    border-bottom: none;
  }
`;

const StockLevel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BatteryBar = styled.div`
  width: 60px;
  height: 6px;
  background: ${COLORS.border};
  border-radius: 3px;
  overflow: hidden;
`;

const BatteryFill = styled.div`
  height: 100%;
  background: ${({ level }) =>
    level > 70 ? COLORS.successGreen :
      level > 30 ? COLORS.warningYellow : COLORS.accentRed};
  border-radius: 3px;
  width: ${({ level }) => level}%;
  transition: width 0.5s ease;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
`;

const IconButton = styled.button`
  background: transparent;
  color: ${COLORS.textSecondary};
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${COLORS.light};
    color: ${COLORS.accentBlue};
    transform: translateY(-1px);
  }
  
  &.danger:hover {
    color: ${COLORS.accentRed};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: ${COLORS.cardBg};
  border-radius: 16px;
  padding: 0;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0,0,0,0.3);
  animation: ${modalIn} 0.3s ease-out;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 24px 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  color: ${COLORS.textPrimary};
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModalContent = styled.div`
  padding: 0 24px 24px;
  overflow-y: auto;
  flex: 1;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
`;

const FormSection = styled.div`
  margin-bottom: 20px;
`;

const FormTitle = styled.h4`
  color: ${COLORS.textPrimary};
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  color: ${COLORS.textPrimary};
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${COLORS.accentBlue};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${COLORS.accentBlue};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${COLORS.accentBlue};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const PrimaryButton = styled.button`
  background: ${COLORS.accentBlue};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #9CA3AF;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled.button`
  background: ${COLORS.light};
  color: ${COLORS.textPrimary};
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${COLORS.border};
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: ${COLORS.cardBg};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 8px 12px;
  gap: 8px;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
  
  &::placeholder {
    color: ${COLORS.textSecondary};
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: ${COLORS.textSecondary};
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Tab navigation
const TabBar = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  background: ${COLORS.cardBg};
  border-radius: 12px;
  padding: 4px;
  border: 1px solid ${COLORS.border};
`;

const Tab = styled.button`
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: ${({ $active }) => $active ? COLORS.accentBlue : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : COLORS.textSecondary};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover {
    background: ${({ $active }) => $active ? COLORS.accentBlue : COLORS.light};
  }
`;

// ============================================
// MAIN COMPONENT
// ============================================
const ChemicalManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [chemicals, setChemicals] = useState([]);
  const [usageData, setUsageData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [ppeRequests, setPpeRequests] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChemical, setSelectedChemical] = useState(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showPPEModal, setShowPPEModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedChemicalDetail, setSelectedChemicalDetail] = useState(null);

  // Get branch ID
  const getBranchId = () => {
    return localStorage.getItem('branch_id') || null;
  };

  // ============================================
  // DATA FETCHING
  // ============================================
  const loadAllData = async () => {
    setLoading(true);
    try {
      const branchId = getBranchId();

      const [chemResult, analyticsResult, usageResult, ppeResult, transferResult] = await Promise.all([
        fetchChemicals(),
        fetchChemicalAnalytics(branchId),
        branchId ? fetchBranchUsage(branchId).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        fetchPPERequests(branchId).catch(() => ({ data: [] })),
        fetchTransfers(branchId).catch(() => ({ data: [] }))
      ]);

      setChemicals(chemResult.data || []);
      setAnalyticsData(analyticsResult.data || []);
      setUsageData(usageResult.data || []);
      setPpeRequests(ppeResult.data || []);
      setTransfers(transferResult.data || []);
    } catch (error) {
      console.error('Error loading chemical data:', error);
      toast.error('Failed to load chemical data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // ============================================
  // HANDLERS
  // ============================================
  const handleAddChemical = async (formData) => {
    setActionLoading(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        current_stock: parseFloat(formData.initialQuantity) || 0,
        min_stock_level: parseFloat(formData.minStockLevel) || 0,
        reorder_level: parseFloat(formData.reorderLevel) || 0,
        unit_cost: parseFloat(formData.unitCost) || 0,
        hazard_level: formData.hazardLevel || 'low',
        supplier: formData.supplier || null,
        batch_number: formData.batchNumber || null,
        expiry_date: formData.expiryDate || null,
        notes: formData.notes || null
      };

      await createChemical(payload);
      toast.success('Chemical added successfully');
      setShowAddModal(false);
      await loadAllData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateChemical = async (id, formData) => {
    setActionLoading(true);
    try {
      await updateChemical(id, formData);
      toast.success('Chemical updated successfully');
      setShowEditModal(false);
      await loadAllData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteChemical = async (id) => {
    if (!window.confirm('Are you sure you want to remove this chemical?')) return;
    try {
      await deleteChemical(id);
      toast.success('Chemical removed');
      await loadAllData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReceiveStock = async (id, quantity, notes) => {
    setActionLoading(true);
    try {
      await receiveStock(id, quantity, notes);
      toast.success('Stock received successfully');
      setShowReceiveModal(false);
      await loadAllData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordUsage = async (formData) => {
    setActionLoading(true);
    try {
      await recordUsage({
        deceased_id: parseInt(formData.deceasedId),
        chemical_id: parseInt(formData.chemicalId),
        quantity_used: parseFloat(formData.quantity),
        usage_notes: formData.notes || ''
      });
      toast.success('Usage recorded successfully');
      setShowUsageModal(false);
      await loadAllData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePPERequest = async (formData) => {
    setActionLoading(true);
    try {
      await createPPERequest({
        item_name: formData.itemName,
        quantity_requested: parseInt(formData.quantity),
        requested_by: formData.requestedBy
      });
      toast.success('PPE request submitted');
      setShowPPEModal(false);
      await loadAllData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTransfer = async (formData) => {
    setActionLoading(true);
    try {
      await createTransfer({
        chemical_id: parseInt(formData.chemicalId),
        to_branch_id: parseInt(formData.toBranchId),
        quantity: parseFloat(formData.quantity),
        notes: formData.notes || ''
      });
      toast.success('Transfer request created');
      setShowTransferModal(false);
      await loadAllData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // CALCULATIONS
  // ============================================
  const calculateStockLevel = (chemical) => {
    const currentStock = parseFloat(chemical.quantity_available || chemical.current_stock || 0);
    const reorderLevel = parseFloat(chemical.reorder_level || 0);
    const maxLevel = reorderLevel * 3 || 100;
    const percentage = (currentStock / maxLevel) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  const filteredChemicals = chemicals.filter(chemical =>
    (chemical.chemical_name || chemical.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (chemical.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalChemicals = chemicals.length;
  const lowStockCount = chemicals.filter(c => c.is_low_stock === 1 || c.is_low_stock === true).length;
  const totalUsageToday = analyticsData.reduce((sum, item) => sum + parseFloat(item.used_today || 0), 0);

  // ============================================
  // MODAL RENDERERS
  // ============================================
  const renderAddModal = () => (
    <ModalOverlay onClick={() => setShowAddModal(false)}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle><Plus size={20} /> Add New Chemical</ModalTitle>
          <IconButton onClick={() => setShowAddModal(false)} disabled={actionLoading}>
            <X size={18} />
          </IconButton>
        </ModalHeader>
        <ModalContent>
          <FormGrid>
            <div>
              <FormSection>
                <FormTitle><Package size={16} /> Basic Information</FormTitle>
                <FormGroup>
                  <Label>Chemical Name *</Label>
                  <Input id="addName" placeholder="Enter chemical name" disabled={actionLoading} />
                </FormGroup>
                <FormGroup>
                  <Label>Category *</Label>
                  <Select id="addCategory" disabled={actionLoading}>
                    <option value="">Select Category</option>
                    <option value="preservative">Preservative</option>
                    <option value="disinfectant">Disinfectant</option>
                    <option value="humectant">Humectant</option>
                    <option value="solvent">Solvent</option>
                    <option value="other">Other</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Unit *</Label>
                  <Select id="addUnit" disabled={actionLoading}>
                    <option value="">Select Unit</option>
                    <option value="liters">Liters (L)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="units">Units</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="g">Grams (g)</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Supplier</Label>
                  <Input id="addSupplier" placeholder="Supplier name" disabled={actionLoading} />
                </FormGroup>
                <FormGroup>
                  <Label>Batch Number</Label>
                  <Input id="addBatch" placeholder="Batch number" disabled={actionLoading} />
                </FormGroup>
                <FormGroup>
                  <Label>Expiry Date</Label>
                  <Input id="addExpiry" type="date" disabled={actionLoading} />
                </FormGroup>
              </FormSection>
            </div>
            <div>
              <FormSection>
                <FormTitle><AlertTriangle size={16} /> Stock & Safety</FormTitle>
                <FormGroup>
                  <Label>Initial Quantity</Label>
                  <Input id="addInitialQty" type="number" step="0.1" placeholder="0" disabled={actionLoading} />
                </FormGroup>
                <FormGroup>
                  <Label>Min Stock Level *</Label>
                  <Input id="addMinStock" type="number" step="0.1" placeholder="Minimum stock" disabled={actionLoading} />
                </FormGroup>
                <FormGroup>
                  <Label>Reorder Level *</Label>
                  <Input id="addReorder" type="number" step="0.1" placeholder="Reorder when stock reaches" disabled={actionLoading} />
                </FormGroup>
                <FormGroup>
                  <Label>Unit Cost (KES)</Label>
                  <Input id="addCost" type="number" step="0.01" placeholder="0.00" disabled={actionLoading} />
                </FormGroup>
                <FormGroup>
                  <Label>Hazard Level *</Label>
                  <Select id="addHazard" disabled={actionLoading}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Notes</Label>
                  <TextArea id="addNotes" placeholder="Additional notes..." disabled={actionLoading} />
                </FormGroup>
              </FormSection>
            </div>
          </FormGrid>
          <ButtonGroup>
            <SecondaryButton onClick={() => setShowAddModal(false)} disabled={actionLoading}>
              <X size={16} /> Cancel
            </SecondaryButton>
            <PrimaryButton onClick={() => {
              const name = document.getElementById('addName').value;
              const category = document.getElementById('addCategory').value;
              const unit = document.getElementById('addUnit').value;
              if (name && category && unit) {
                handleAddChemical({
                  name,
                  category,
                  unit,
                  initialQuantity: document.getElementById('addInitialQty').value,
                  minStockLevel: document.getElementById('addMinStock').value,
                  reorderLevel: document.getElementById('addReorder').value,
                  unitCost: document.getElementById('addCost').value,
                  hazardLevel: document.getElementById('addHazard').value,
                  supplier: document.getElementById('addSupplier').value,
                  batchNumber: document.getElementById('addBatch').value,
                  expiryDate: document.getElementById('addExpiry').value,
                  notes: document.getElementById('addNotes').value
                });
              } else {
                toast.error('Please fill in all required fields');
              }
            }} disabled={actionLoading}>
              <Save size={16} /> {actionLoading ? 'Adding...' : 'Add Chemical'}
            </PrimaryButton>
          </ButtonGroup>
        </ModalContent>
      </Modal>
    </ModalOverlay>
  );

  const renderEditModal = () => (
    <ModalOverlay onClick={() => setShowEditModal(false)}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle><Edit3 size={20} /> Edit Chemical</ModalTitle>
          <IconButton onClick={() => setShowEditModal(false)} disabled={actionLoading}>
            <X size={18} />
          </IconButton>
        </ModalHeader>
        <ModalContent>
          {selectedChemical && (
            <FormGrid>
              <div>
                <FormSection>
                  <FormTitle><Package size={16} /> Basic Information</FormTitle>
                  <FormGroup>
                    <Label>Chemical Name *</Label>
                    <Input id="editName" defaultValue={selectedChemical.chemical_name || selectedChemical.name} disabled={actionLoading} />
                  </FormGroup>
                  <FormGroup>
                    <Label>Category *</Label>
                    <Select id="editCategory" defaultValue={selectedChemical.category} disabled={actionLoading}>
                      <option value="preservative">Preservative</option>
                      <option value="disinfectant">Disinfectant</option>
                      <option value="humectant">Humectant</option>
                      <option value="solvent">Solvent</option>
                      <option value="other">Other</option>
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label>Unit *</Label>
                    <Select id="editUnit" defaultValue={selectedChemical.unit} disabled={actionLoading}>
                      <option value="liters">Liters (L)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="units">Units</option>
                      <option value="ml">Milliliters (ml)</option>
                      <option value="g">Grams (g)</option>
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label>Supplier</Label>
                    <Input id="editSupplier" defaultValue={selectedChemical.supplier || ''} disabled={actionLoading} />
                  </FormGroup>
                  <FormGroup>
                    <Label>Batch Number</Label>
                    <Input id="editBatch" defaultValue={selectedChemical.batch_number || ''} disabled={actionLoading} />
                  </FormGroup>
                  <FormGroup>
                    <Label>Expiry Date</Label>
                    <Input id="editExpiry" type="date" defaultValue={selectedChemical.expiry_date ? selectedChemical.expiry_date.split('T')[0] : ''} disabled={actionLoading} />
                  </FormGroup>
                </FormSection>
              </div>
              <div>
                <FormSection>
                  <FormTitle><AlertTriangle size={16} /> Stock & Safety</FormTitle>
                  <FormGroup>
                    <Label>Min Stock Level</Label>
                    <Input id="editMinStock" type="number" step="0.1" defaultValue={selectedChemical.min_stock_level || 0} disabled={actionLoading} />
                  </FormGroup>
                  <FormGroup>
                    <Label>Reorder Level</Label>
                    <Input id="editReorder" type="number" step="0.1" defaultValue={selectedChemical.reorder_level || 0} disabled={actionLoading} />
                  </FormGroup>
                  <FormGroup>
                    <Label>Unit Cost (KES)</Label>
                    <Input id="editCost" type="number" step="0.01" defaultValue={selectedChemical.unit_cost || 0} disabled={actionLoading} />
                  </FormGroup>
                  <FormGroup>
                    <Label>Hazard Level</Label>
                    <Select id="editHazard" defaultValue={selectedChemical.hazard_level || 'low'} disabled={actionLoading}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label>Notes</Label>
                    <TextArea id="editNotes" defaultValue={selectedChemical.notes || ''} disabled={actionLoading} />
                  </FormGroup>
                </FormSection>
              </div>
            </FormGrid>
          )}
          <ButtonGroup>
            <SecondaryButton onClick={() => setShowEditModal(false)} disabled={actionLoading}>
              <X size={16} /> Cancel
            </SecondaryButton>
            <PrimaryButton onClick={() => {
              if (selectedChemical) {
                const id = selectedChemical.chemical_id || selectedChemical.id;
                handleUpdateChemical(id, {
                  name: document.getElementById('editName').value,
                  category: document.getElementById('editCategory').value,
                  unit: document.getElementById('editUnit').value,
                  min_stock_level: document.getElementById('editMinStock').value,
                  reorder_level: document.getElementById('editReorder').value,
                  unit_cost: document.getElementById('editCost').value,
                  hazard_level: document.getElementById('editHazard').value,
                  supplier: document.getElementById('editSupplier').value,
                  batch_number: document.getElementById('editBatch').value,
                  expiry_date: document.getElementById('editExpiry').value,
                  notes: document.getElementById('editNotes').value
                });
              }
            }} disabled={actionLoading}>
              <Save size={16} /> {actionLoading ? 'Updating...' : 'Update Chemical'}
            </PrimaryButton>
          </ButtonGroup>
        </ModalContent>
      </Modal>
    </ModalOverlay>
  );

  const renderReceiveModal = () => (
    <ModalOverlay onClick={() => setShowReceiveModal(false)}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle><Download size={20} /> Receive Stock</ModalTitle>
          <IconButton onClick={() => setShowReceiveModal(false)} disabled={actionLoading}>
            <X size={18} />
          </IconButton>
        </ModalHeader>
        <ModalContent>
          {selectedChemical && (
            <>
              <p style={{ marginBottom: 16, color: COLORS.textSecondary }}>
                Adding stock for: <strong>{selectedChemical.chemical_name || selectedChemical.name}</strong>
                <br />
                Current stock: <strong>{selectedChemical.quantity_available || selectedChemical.current_stock || 0} {selectedChemical.unit}</strong>
              </p>
              <FormGroup>
                <Label>Quantity to Receive *</Label>
                <Input id="receiveQty" type="number" step="0.1" placeholder="Enter quantity" disabled={actionLoading} />
              </FormGroup>
              <FormGroup>
                <Label>Notes</Label>
                <TextArea id="receiveNotes" placeholder="Optional notes..." disabled={actionLoading} />
              </FormGroup>
              <ButtonGroup>
                <SecondaryButton onClick={() => setShowReceiveModal(false)} disabled={actionLoading}>
                  <X size={16} /> Cancel
                </SecondaryButton>
                <PrimaryButton onClick={() => {
                  const qty = document.getElementById('receiveQty').value;
                  if (qty && parseFloat(qty) > 0) {
                    const id = selectedChemical.chemical_id || selectedChemical.id;
                    handleReceiveStock(id, qty, document.getElementById('receiveNotes').value);
                  } else {
                    toast.error('Please enter a valid quantity');
                  }
                }} disabled={actionLoading}>
                  <Download size={16} /> {actionLoading ? 'Receiving...' : 'Receive Stock'}
                </PrimaryButton>
              </ButtonGroup>
            </>
          )}
        </ModalContent>
      </Modal>
    </ModalOverlay>
  );

  const renderUsageModal = () => (
    <ModalOverlay onClick={() => setShowUsageModal(false)}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle><Syringe size={20} /> Record Chemical Usage</ModalTitle>
          <IconButton onClick={() => setShowUsageModal(false)} disabled={actionLoading}>
            <X size={18} />
          </IconButton>
        </ModalHeader>
        <ModalContent>
          <FormGroup>
            <Label>Deceased ID *</Label>
            <Input id="usageDeceasedId" type="number" placeholder="Enter deceased ID" disabled={actionLoading} />
          </FormGroup>
          <FormGroup>
            <Label>Chemical *</Label>
            <Select id="usageChemicalId" disabled={actionLoading}>
              <option value="">Select Chemical</option>
              {chemicals.map(c => (
                <option key={c.chemical_id || c.id} value={c.chemical_id || c.id}>
                  {c.chemical_name || c.name} - Stock: {c.quantity_available || c.current_stock || 0} {c.unit}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Quantity Used *</Label>
            <Input id="usageQty" type="number" step="0.1" placeholder="Enter quantity used" disabled={actionLoading} />
          </FormGroup>
          <FormGroup>
            <Label>Notes</Label>
            <TextArea id="usageNotes" placeholder="Usage notes..." disabled={actionLoading} />
          </FormGroup>
          <ButtonGroup>
            <SecondaryButton onClick={() => setShowUsageModal(false)} disabled={actionLoading}>
              <X size={16} /> Cancel
            </SecondaryButton>
            <PrimaryButton onClick={() => {
              const deceasedId = document.getElementById('usageDeceasedId').value;
              const chemicalId = document.getElementById('usageChemicalId').value;
              const qty = document.getElementById('usageQty').value;
              if (deceasedId && chemicalId && qty && parseFloat(qty) > 0) {
                handleRecordUsage({
                  deceasedId,
                  chemicalId,
                  quantity: qty,
                  notes: document.getElementById('usageNotes').value
                });
              } else {
                toast.error('Please fill in all required fields');
              }
            }} disabled={actionLoading}>
              <Save size={16} /> {actionLoading ? 'Recording...' : 'Record Usage'}
            </PrimaryButton>
          </ButtonGroup>
        </ModalContent>
      </Modal>
    </ModalOverlay>
  );

  const renderPPEModal = () => (
    <ModalOverlay onClick={() => setShowPPEModal(false)}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle><Shield size={20} /> Request PPE Equipment</ModalTitle>
          <IconButton onClick={() => setShowPPEModal(false)} disabled={actionLoading}>
            <X size={18} />
          </IconButton>
        </ModalHeader>
        <ModalContent>
          <FormGroup>
            <Label>Item Name *</Label>
            <Input id="ppeItem" placeholder="e.g., Gloves, Masks, Aprons" disabled={actionLoading} />
          </FormGroup>
          <FormGroup>
            <Label>Quantity Requested *</Label>
            <Input id="ppeQty" type="number" placeholder="Enter quantity" disabled={actionLoading} />
          </FormGroup>
          <FormGroup>
            <Label>Requested By *</Label>
            <Input id="ppeRequestor" placeholder="Your name" disabled={actionLoading} />
          </FormGroup>
          <ButtonGroup>
            <SecondaryButton onClick={() => setShowPPEModal(false)} disabled={actionLoading}>
              <X size={16} /> Cancel
            </SecondaryButton>
            <PrimaryButton onClick={() => {
              const item = document.getElementById('ppeItem').value;
              const qty = document.getElementById('ppeQty').value;
              const requestor = document.getElementById('ppeRequestor').value;
              if (item && qty && requestor) {
                handlePPERequest({ itemName: item, quantity: qty, requestedBy: requestor });
              } else {
                toast.error('Please fill in all required fields');
              }
            }} disabled={actionLoading}>
              <Save size={16} /> {actionLoading ? 'Submitting...' : 'Submit Request'}
            </PrimaryButton>
          </ButtonGroup>
        </ModalContent>
      </Modal>
    </ModalOverlay>
  );

  const renderTransferModal = () => (
    <ModalOverlay onClick={() => setShowTransferModal(false)}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle><ArrowRightLeft size={20} /> Transfer Chemical to Branch</ModalTitle>
          <IconButton onClick={() => setShowTransferModal(false)} disabled={actionLoading}>
            <X size={18} />
          </IconButton>
        </ModalHeader>
        <ModalContent>
          <FormGroup>
            <Label>Chemical *</Label>
            <Select id="transferChemical" disabled={actionLoading}>
              <option value="">Select Chemical</option>
              {chemicals.filter(c => parseFloat(c.quantity_available || c.current_stock || 0) > 0).map(c => (
                <option key={c.chemical_id || c.id} value={c.chemical_id || c.id}>
                  {c.chemical_name || c.name} - {c.quantity_available || c.current_stock || 0} {c.unit}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Destination Branch ID *</Label>
            <Input id="transferBranch" type="number" placeholder="Enter branch ID" disabled={actionLoading} />
          </FormGroup>
          <FormGroup>
            <Label>Quantity *</Label>
            <Input id="transferQty" type="number" step="0.1" placeholder="Enter quantity" disabled={actionLoading} />
          </FormGroup>
          <FormGroup>
            <Label>Notes</Label>
            <TextArea id="transferNotes" placeholder="Transfer notes..." disabled={actionLoading} />
          </FormGroup>
          <ButtonGroup>
            <SecondaryButton onClick={() => setShowTransferModal(false)} disabled={actionLoading}>
              <X size={16} /> Cancel
            </SecondaryButton>
            <PrimaryButton onClick={() => {
              const chemId = document.getElementById('transferChemical').value;
              const branchId = document.getElementById('transferBranch').value;
              const qty = document.getElementById('transferQty').value;
              if (chemId && branchId && qty && parseFloat(qty) > 0) {
                handleCreateTransfer({
                  chemicalId: chemId,
                  toBranchId: branchId,
                  quantity: qty,
                  notes: document.getElementById('transferNotes').value
                });
              } else {
                toast.error('Please fill in all required fields');
              }
            }} disabled={actionLoading}>
              <ArrowRightLeft size={16} /> {actionLoading ? 'Creating...' : 'Create Transfer'}
            </PrimaryButton>
          </ButtonGroup>
        </ModalContent>
      </Modal>
    </ModalOverlay>
  );

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <DashboardContainer>
        <LoadingSpinner>
          <RefreshCw size={24} />
          <span style={{ marginLeft: '12px' }}>Loading chemical inventory...</span>
        </LoadingSpinner>
      </DashboardContainer>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <DashboardContainer>
      <Header>
        <Title>
          <Beaker size={28} />
          Chemical Inventory Management
        </Title>
        <HeaderActions>
          <ActionButton onClick={loadAllData} disabled={loading}>
            <RefreshCw size={16} /> Refresh
          </ActionButton>
          <ActionButton onClick={() => setShowTransferModal(true)} variant="primary">
            <ArrowRightLeft size={16} /> Transfer
          </ActionButton>
          <ActionButton onClick={() => setShowPPEModal(true)} variant="warning">
            <Shield size={16} /> Request PPE
          </ActionButton>
          <ActionButton onClick={() => setShowUsageModal(true)} variant="primary">
            <Syringe size={16} /> Record Usage
          </ActionButton>
          <ActionButton onClick={() => setShowAddModal(true)} variant="success">
            <Plus size={16} /> Add Chemical
          </ActionButton>
        </HeaderActions>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatTitle>Total Chemicals</StatTitle>
            <Package size={20} color={COLORS.accentBlue} />
          </StatHeader>
          <StatValue>{totalChemicals}</StatValue>
          <StatTrend trend="up"><TrendingUp size={14} /> Active</StatTrend>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>Low Stock Items</StatTitle>
            <AlertTriangle size={20} color={COLORS.warningYellow} />
          </StatHeader>
          <StatValue>{lowStockCount}</StatValue>
          <StatTrend trend={lowStockCount > 0 ? 'down' : 'up'}>
            {lowStockCount > 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
            {lowStockCount > 0 ? 'Need attention' : 'All good'}
          </StatTrend>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>Today's Usage</StatTitle>
            <Syringe size={20} color={COLORS.infoBlue} />
          </StatHeader>
          <StatValue>{totalUsageToday.toFixed(1)}</StatValue>
          <StatTrend trend="up"><TrendingUp size={14} /> Today</StatTrend>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>PPE Requests</StatTitle>
            <Shield size={20} color={COLORS.warningYellow} />
          </StatHeader>
          <StatValue>{ppeRequests.filter(r => r.status === 'pending').length}</StatValue>
          <StatTrend trend={ppeRequests.filter(r => r.status === 'pending').length > 0 ? 'down' : 'up'}>
            Pending
          </StatTrend>
        </StatCard>
      </StatsGrid>

      <TabBar>
        <Tab $active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')}>
          <Package size={16} /> Inventory
        </Tab>
        <Tab $active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>
          <BarChart3 size={16} /> Analytics
        </Tab>
        <Tab $active={activeTab === 'usage'} onClick={() => setActiveTab('usage')}>
          <History size={16} /> Usage History
        </Tab>
        <Tab $active={activeTab === 'ppe'} onClick={() => setActiveTab('ppe')}>
          <Shield size={16} /> PPE Requests
        </Tab>
        <Tab $active={activeTab === 'transfers'} onClick={() => setActiveTab('transfers')}>
          <ArrowRightLeft size={16} /> Transfers
        </Tab>
      </TabBar>

      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <ContentSection>
          <SectionHeader>
            <SectionTitle><Package size={18} /> Chemical Inventory</SectionTitle>
            <SearchBar>
              <Search size={16} color={COLORS.textSecondary} />
              <SearchInput
                placeholder="Search chemicals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBar>
          </SectionHeader>

          <ChemicalTable>
            <thead>
              <tr>
                <TableHeader>Chemical</TableHeader>
                <TableHeader>Category</TableHeader>
                <TableHeader>Stock</TableHeader>
                <TableHeader>Level</TableHeader>
                <TableHeader>Reorder</TableHeader>
                <TableHeader>Hazard</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {filteredChemicals.map(chemical => {
                const chemId = chemical.chemical_id || chemical.id;
                const chemName = chemical.chemical_name || chemical.name;
                const stock = chemical.quantity_available || chemical.current_stock || 0;
                const unit = chemical.unit || 'units';
                const reorder = chemical.reorder_level || 0;
                const hazard = chemical.hazard_level || 'low';
                const category = chemical.category || 'other';
                const stockLevel = calculateStockLevel(chemical);

                return (
                  <TableRow key={chemId}>
                    <TableCell>
                      <div style={{ fontWeight: '600' }}>{chemName}</div>
                      <div style={{ fontSize: '12px', color: COLORS.textSecondary }}>
                        ID: CH-{String(chemId).padStart(4, '0')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span style={{
                        textTransform: 'capitalize',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: category === 'preservative' ? '#FEF3C7' :
                          category === 'disinfectant' ? '#DBEAFE' : '#F3E8FF',
                        color: category === 'preservative' ? '#92400E' :
                          category === 'disinfectant' ? '#1E40AF' : '#6B21A8'
                      }}>
                        {category}
                      </span>
                    </TableCell>
                    <TableCell>{stock} {unit}</TableCell>
                    <TableCell>
                      <StockLevel>
                        <BatteryBar>
                          <BatteryFill level={stockLevel} />
                        </BatteryBar>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: stockLevel > 30 ? COLORS.successGreen : COLORS.accentRed,
                          minWidth: '30px'
                        }}>
                          {Math.round(stockLevel)}%
                        </span>
                      </StockLevel>
                    </TableCell>
                    <TableCell>{reorder} {unit}</TableCell>
                    <TableCell>
                      <span style={{
                        textTransform: 'capitalize',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: hazard === 'high' ? '#FEE2E2' :
                          hazard === 'medium' ? '#FEF3C7' : '#D1FAE5',
                        color: hazard === 'high' ? '#DC2626' :
                          hazard === 'medium' ? '#92400E' : '#059669'
                      }}>
                        {hazard}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ActionButtons>
                        <IconButton onClick={() => {
                          setSelectedChemical(chemical);
                          setShowReceiveModal(true);
                        }} disabled={actionLoading} title="Receive Stock">
                          <Download size={14} />
                        </IconButton>
                        <IconButton onClick={() => {
                          setSelectedChemical(chemical);
                          setShowEditModal(true);
                        }} disabled={actionLoading} title="Edit">
                          <Edit3 size={14} />
                        </IconButton>
                        <IconButton className="danger" onClick={() => handleDeleteChemical(chemId)} disabled={actionLoading} title="Delete">
                          <Trash2 size={14} />
                        </IconButton>
                      </ActionButtons>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredChemicals.length === 0 && (
                <tr>
                  <TableCell colSpan={7} style={{ textAlign: 'center', color: COLORS.textSecondary }}>
                    No chemicals found
                  </TableCell>
                </tr>
              )}
            </tbody>
          </ChemicalTable>
        </ContentSection>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <ContentSection>
          <SectionHeader>
            <SectionTitle><BarChart3 size={18} /> Chemical Analytics</SectionTitle>
          </SectionHeader>
          {analyticsData.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {analyticsData.map(item => (
                <div key={item.chemical_id} style={{
                  background: COLORS.light,
                  borderRadius: 12,
                  padding: 20,
                  border: `1px solid ${COLORS.border}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ margin: 0, fontWeight: 700 }}>{item.chemical_name}</h4>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: item.is_low_stock ? '#FEF2F2' : '#F0F9FF',
                      color: item.is_low_stock ? '#DC2626' : '#0369A1'
                    }}>
                      {item.is_low_stock ? 'Low Stock' : 'Good'}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 12, color: COLORS.textSecondary }}>Current Stock</div>
                      <div style={{ fontWeight: 700 }}>{item.current_stock} {item.unit}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: COLORS.textSecondary }}>Used Today</div>
                      <div style={{ fontWeight: 700 }}>{item.used_today} {item.unit}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: COLORS.textSecondary }}>Avg/Embalming</div>
                      <div style={{ fontWeight: 700 }}>{item.avg_usage_per_embalming} {item.unit}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: COLORS.textSecondary }}>Days Remaining</div>
                      <div style={{ fontWeight: 700, color: parseFloat(item.estimate_days_remaining) < 7 ? COLORS.accentRed : COLORS.successGreen }}>
                        {item.estimate_days_remaining}d
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: COLORS.textSecondary, textAlign: 'center' }}>No analytics data available</p>
          )}
        </ContentSection>
      )}

      {/* USAGE TAB */}
      {activeTab === 'usage' && (
        <ContentSection>
          <SectionHeader>
            <SectionTitle><History size={18} /> Recent Chemical Usage</SectionTitle>
          </SectionHeader>
          {usageData.length > 0 ? (
            <ChemicalTable>
              <thead>
                <tr>
                  <TableHeader>Deceased</TableHeader>
                  <TableHeader>Chemical</TableHeader>
                  <TableHeader>Quantity</TableHeader>
                  <TableHeader>Used By</TableHeader>
                  <TableHeader>Date & Time</TableHeader>
                </tr>
              </thead>
              <tbody>
                {usageData.slice(0, 20).map(usage => (
                  <TableRow key={usage.usage_id || usage.id}>
                    <TableCell>
                      <div style={{ fontWeight: '600' }}>{usage.deceased_name || `Deceased #${usage.deceased_id}`}</div>
                    </TableCell>
                    <TableCell>{usage.chemical_name}</TableCell>
                    <TableCell><strong>{usage.quantity_used} {usage.unit}</strong></TableCell>
                    <TableCell>{usage.used_by || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(usage.used_at || usage.created_at).toLocaleString('en-KE', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </ChemicalTable>
          ) : (
            <p style={{ color: COLORS.textSecondary, textAlign: 'center' }}>No usage data available</p>
          )}
        </ContentSection>
      )}

      {/* PPE TAB */}
      {activeTab === 'ppe' && (
        <ContentSection>
          <SectionHeader>
            <SectionTitle><Shield size={18} /> PPE Requests</SectionTitle>
          </SectionHeader>
          {ppeRequests.length > 0 ? (
            <ChemicalTable>
              <thead>
                <tr>
                  <TableHeader>Item</TableHeader>
                  <TableHeader>Quantity</TableHeader>
                  <TableHeader>Requested By</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Date</TableHeader>
                </tr>
              </thead>
              <tbody>
                {ppeRequests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell style={{ fontWeight: 600 }}>{req.item_name}</TableCell>
                    <TableCell>{req.quantity_requested}</TableCell>
                    <TableCell>{req.requested_by}</TableCell>
                    <TableCell>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: req.status === 'pending' ? '#FEF3C7' :
                          req.status === 'approved' ? '#D1FAE5' : '#FEE2E2',
                        color: req.status === 'pending' ? '#92400E' :
                          req.status === 'approved' ? '#059669' : '#DC2626'
                      }}>
                        {req.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </ChemicalTable>
          ) : (
            <p style={{ color: COLORS.textSecondary, textAlign: 'center' }}>No PPE requests</p>
          )}
        </ContentSection>
      )}

      {/* TRANSFERS TAB */}
      {activeTab === 'transfers' && (
        <ContentSection>
          <SectionHeader>
            <SectionTitle><ArrowRightLeft size={18} /> Branch Transfers</SectionTitle>
          </SectionHeader>
          {transfers.length > 0 ? (
            <ChemicalTable>
              <thead>
                <tr>
                  <TableHeader>Chemical</TableHeader>
                  <TableHeader>From Branch</TableHeader>
                  <TableHeader>To Branch</TableHeader>
                  <TableHeader>Quantity</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Date</TableHeader>
                </tr>
              </thead>
              <tbody>
                {transfers.map(t => (
                  <TableRow key={t.id}>
                    <TableCell style={{ fontWeight: 600 }}>{t.chemical_name}</TableCell>
                    <TableCell>Branch #{t.from_branch_id}</TableCell>
                    <TableCell>Branch #{t.to_branch_id}</TableCell>
                    <TableCell>{t.quantity} {t.unit}</TableCell>
                    <TableCell>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: t.status === 'completed' ? '#D1FAE5' :
                          t.status === 'pending' ? '#FEF3C7' : '#FEE2E2',
                        color: t.status === 'completed' ? '#059669' :
                          t.status === 'pending' ? '#92400E' : '#DC2626'
                      }}>
                        {t.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(t.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </ChemicalTable>
          ) : (
            <p style={{ color: COLORS.textSecondary, textAlign: 'center' }}>No transfers yet</p>
          )}
        </ContentSection>
      )}

      {/* MODALS */}
      {showAddModal && renderAddModal()}
      {showEditModal && renderEditModal()}
      {showReceiveModal && renderReceiveModal()}
      {showUsageModal && renderUsageModal()}
      {showPPEModal && renderPPEModal()}
      {showTransferModal && renderTransferModal()}
    </DashboardContainer>
  );
};

export default ChemicalManagementDashboard;