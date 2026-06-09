import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FlaskConical, Save, X, DollarSign, User, Ruler, Weight, Beaker, Droplets, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const Card = styled.div`
  background-color: #FFFFFF;
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 1px solid #E5E7EB;
  color: #374151;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #F3F4F6;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #111827;

  svg {
    color: #2563EB;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const Input = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: #FFFFFF;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563EB;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.5rem 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: #FFFFFF;
  transition: all 0.2s ease;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #2563EB;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: #FFFFFF;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563EB;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
`;

const PrimaryButton = styled.button`
  padding: 0.5rem 1rem;
  background: #2563EB;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.375rem;

  &:hover:not(:disabled) {
    background: #1D4ED8;
  }

  &:disabled {
    background: #9CA3AF;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  padding: 0.5rem 1rem;
  background: transparent;
  color: #6B7280;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.375rem;

  &:hover {
    background-color: #F9FAFB;
    color: #374151;
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 1rem;
  background-color: ${props => props.embalmed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(156, 163, 175, 0.1)'};
  color: ${props => props.embalmed ? '#059669' : '#6B7280'};
  border: 1px solid ${props => props.embalmed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(156, 163, 175, 0.2)'};
`;

const PhysicalInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const TimeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ChemicalUsageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const OptionalText = styled.span`
  font-size: 0.75rem;
  color: #6B7280;
  font-style: italic;
  margin-left: 0.25rem;
`;

const InfoDisplay = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  
  strong {
    color: #374151;
    font-weight: 500;
    min-width: 120px;
  }
  
  span {
    color: #6B7280;
    font-size: 0.875rem;
  }
`;

const ChemicalUsageSection = styled.div`
  background: #F8FAFC;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  border: 1px solid #E2E8F0;
`;

const SectionTitle = styled.h5`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChemicalItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #E2E8F0;

  &:last-child {
    border-bottom: none;
  }
`;

const ChemicalName = styled.span`
  font-weight: 500;
  color: #374151;
`;

const ChemicalAmount = styled.span`
  color: #2563EB;
  font-weight: 600;
`;

const ChemicalFormRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 0.75rem;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RemoveButton = styled.button`
  padding: 0.5rem;
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #DC2626;
  }
`;

const AddChemicalButton = styled.button`
  padding: 0.5rem 1rem;
  background: transparent;
  color: #2563EB;
  border: 1px dashed #2563EB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.5rem;

  &:hover {
    background: rgba(37, 99, 235, 0.05);
  }
`;

const EmbalmingInfoSection = ({ deceased, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableChemicals, setAvailableChemicals] = useState([]);
  const [formData, setFormData] = useState({
    height_cm: deceased.height_cm || '',
    weight_kg: deceased.weight_kg || '',
    embalming_cost: deceased.embalming_cost || '',
    start_time: deceased.start_time || '',
    end_time: deceased.end_time || '',
    notes: deceased.embalming_notes || '',
    chemicalUsage: deceased.chemicalUsage || []
  });

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data from localStorage:', error);
      return null;
    }
  };

  // Fetch available chemicals
  const fetchAvailableChemicals = async () => {
    try {
      const response = await fetch(' http://localhost:8009/api/v1/restpoint/chemicals');
      const result = await response.json();
      
      if (result.success) {
        setAvailableChemicals(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch chemicals');
      }
    } catch (error) {
      console.error('Error fetching chemicals:', error);
      toast.error('Failed to load available chemicals');
    }
  };

  useEffect(() => {
    if (isEditing) {
      fetchAvailableChemicals();
    }
  }, [isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChemicalUsageChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      chemicalUsage: prev.chemicalUsage.map((chem, i) => 
        i === index ? { ...chem, [field]: value } : chem
      )
    }));
  };

  const handleChemicalSelection = (index, chemicalId) => {
    const selectedChemical = availableChemicals.find(chem => chem.chemical_id === parseInt(chemicalId));
    setFormData(prev => ({
      ...prev,
      chemicalUsage: prev.chemicalUsage.map((chem, i) => 
        i === index ? { 
          ...chem, 
          chemical_id: selectedChemical?.chemical_id || null,
          chemical_name: selectedChemical?.chemical_name || '',
          unit: selectedChemical?.unit || 'L'
        } : chem
      )
    }));
  };

  const addChemicalUsage = () => {
    setFormData(prev => ({
      ...prev,
      chemicalUsage: [
        ...prev.chemicalUsage,
        { chemical_id: null, chemical_name: '', amount_used: '', unit: 'L' }
      ]
    }));
  };

  const removeChemicalUsage = (index) => {
    setFormData(prev => ({
      ...prev,
      chemicalUsage: prev.chemicalUsage.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userData = getUserData();
      const branch_id = userData?.branch_id || 1;
      const embalmed_by = userData?.id || 3;

      // Prepare chemical usage data - filter out empty amounts and invalid entries
      const chemicalUsageData = formData.chemicalUsage
        .filter(chem => chem.chemical_id && chem.amount_used && parseFloat(chem.amount_used) > 0)
        .map(chem => ({
          chemical_id: chem.chemical_id,
          chemical_name: chem.chemical_name,
          amount_used: parseFloat(chem.amount_used),
          unit: chem.unit
        }));

      // Prepare the embalming payload
      const payload = {
        deceased_id: deceased.deceased_id,
        embalmed_by: embalmed_by,
        branch_id: branch_id,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        embalming_cost: formData.embalming_cost ? parseFloat(formData.embalming_cost) : null,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        notes: formData.notes || '',
        chemicalUsage: chemicalUsageData,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      console.log('Sending embalming data:', payload);

      // Send embalming data
      const response = await fetch('http://localhost:8009/api/v1/restpoint/embalming', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Embalming recorded successfully');
        setIsEditing(false);
        
        // Update chemical inventory for each chemical used
        if (chemicalUsageData.length > 0) {
          await updateChemicalInventory(chemicalUsageData, deceased.deceased_id, branch_id, embalmed_by);
        }
        
        if (onUpdate) onUpdate();
      } else {
        throw new Error(result.message || 'Failed to record embalming');
      }
    } catch (error) {
      console.error('Error recording embalming:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateChemicalInventory = async (chemicalUsageData, deceased_id, branch_id, embalmed_by) => {
    try {
      // For each chemical used, record the usage
      for (const chemical of chemicalUsageData) {
        const usagePayload = {
          embalming_id: deceased_id, // This should be the actual embalming record ID
          chemical_id: chemical.chemical_id,
          branch_id: branch_id,
          quantity_used: chemical.amount_used,
          unit: chemical.unit,
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
          updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };

        const response = await fetch('http://localhost:8009/api/v1/restpoint/chemicals/use', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(usagePayload)
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.message || `Failed to update inventory for ${chemical.chemical_name}`);
        }
      }
      
      toast.success('Chemical inventory updated successfully');
    } catch (error) {
      console.error('Error updating chemical inventory:', error);
      toast.error(`Embalming recorded but chemical update failed: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setFormData({
      height_cm: deceased.height_cm || '',
      weight_kg: deceased.weight_kg || '',
      embalming_cost: deceased.embalming_cost || '',
      start_time: deceased.start_time || '',
      end_time: deceased.end_time || '',
      notes: deceased.embalming_notes || '',
      chemicalUsage: deceased.chemicalUsage || []
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not recorded';
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `Ksh ${parseFloat(amount || 0).toLocaleString()}`;
  };

  return (
    <Card>
      <CardTitle>
        <FlaskConical size={18} />
        Embalming & Chemical Usage
      </CardTitle>

      <StatusBadge embalmed={deceased.is_embalmed}>
        <FlaskConical size={14} />
        {deceased.is_embalmed ? 'Embalmed' : 'Not Embalmed'}
        {deceased.embalmed_at && ` on ${formatDate(deceased.embalmed_at)}`}
      </StatusBadge>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          {/* Physical Information */}
          <PhysicalInfoGrid>
            <FormGroup>
              <Label>
                <Ruler size={14} />
                Height (cm) *
              </Label>
              <Input
                type="number"
                name="height_cm"
                value={formData.height_cm}
                onChange={handleInputChange}
                placeholder="Enter height in cm"
                step="0.1"
                min="0"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Weight size={14} />
                Weight (kg) <OptionalText>optional</OptionalText>
              </Label>
              <Input
                type="number"
                name="weight_kg"
                value={formData.weight_kg}
                onChange={handleInputChange}
                placeholder="Enter weight in kg"
                step="0.1"
                min="0"
              />
            </FormGroup>
          </PhysicalInfoGrid>

          {/* Time Information */}
          <TimeGrid>
            <FormGroup>
              <Label>
                <Clock size={14} />
                Start Time *
              </Label>
              <Input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Clock size={14} />
                End Time <OptionalText>optional</OptionalText>
              </Label>
              <Input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
              />
            </FormGroup>
          </TimeGrid>

          {/* Cost Information */}
          <FormGroup>
            <Label>
              <DollarSign size={14} />
              Embalming Cost (Ksh) <OptionalText>optional</OptionalText>
            </Label>
            <Input
              type="number"
              name="embalming_cost"
              value={formData.embalming_cost}
              onChange={handleInputChange}
              placeholder="Enter cost"
              step="0.01"
              min="0"
            />
          </FormGroup>

          {/* Chemical Usage Section */}
          <ChemicalUsageSection>
            <SectionTitle>
              <Beaker size={16} />
              Chemical Usage
            </SectionTitle>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1rem' }}>
              Record chemicals used during embalming for inventory tracking
            </p>
            
            <ChemicalUsageGrid>
              {formData.chemicalUsage.map((chemical, index) => (
                <ChemicalFormRow key={index}>
                  <FormGroup>
                    <Label>Chemical</Label>
                    <Select
                      value={chemical.chemical_id || ''}
                      onChange={(e) => handleChemicalSelection(index, e.target.value)}
                      required
                    >
                      <option value="">Select Chemical</option>
                      {availableChemicals.map(chem => (
                        <option key={chem.chemical_id} value={chem.chemical_id}>
                          {chem.chemical_name} ({chem.quantity_available} {chem.unit})
                        </option>
                      ))}
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>Amount Used</Label>
                    <Input
                      type="number"
                      placeholder="Amount"
                      step="0.1"
                      min="0"
                      value={chemical.amount_used}
                      onChange={(e) => handleChemicalUsageChange(index, 'amount_used', e.target.value)}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Unit</Label>
                    <Input
                      type="text"
                      value={chemical.unit || 'L'}
                      disabled
                      style={{ background: '#F9FAFB' }}
                    />
                  </FormGroup>

                  {formData.chemicalUsage.length > 1 && (
                    <RemoveButton 
                      type="button" 
                      onClick={() => removeChemicalUsage(index)}
                      title="Remove chemical"
                    >
                      <X size={14} />
                    </RemoveButton>
                  )}
                </ChemicalFormRow>
              ))}
            </ChemicalUsageGrid>

            <AddChemicalButton type="button" onClick={addChemicalUsage}>
              <Beaker size={14} />
              Add Another Chemical
            </AddChemicalButton>
          </ChemicalUsageSection>

          {/* Notes */}
          <FormGroup>
            <Label>Notes & Remarks</Label>
            <TextArea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add any remarks about the embalming process, chemical usage, or special procedures"
            />
          </FormGroup>

          <ButtonGroup>
            <PrimaryButton type="submit" disabled={isLoading}>
              {isLoading ? 'Recording Embalming...' : 'Record Embalming'}
              {!isLoading && <Save size={14} />}
            </PrimaryButton>
            <SecondaryButton type="button" onClick={handleCancel}>
              Cancel
              <X size={14} />
            </SecondaryButton>
          </ButtonGroup>
        </form>
      ) : (
        <>
          {/* Display Physical Information */}
          <InfoDisplay>
            <InfoRow>
              <strong>Height:</strong>
              <span>{deceased.height_cm ? `${deceased.height_cm} cm` : 'Not recorded'}</span>
            </InfoRow>
            
            <InfoRow>
              <strong>Weight:</strong>
              <span>{deceased.weight_kg ? `${deceased.weight_kg} kg` : 'Not recorded'}</span>
            </InfoRow>

            {deceased.is_embalmed && (
              <>
                <InfoRow>
                  <strong>Start Time:</strong>
                  <span>{formatDate(deceased.start_time)}</span>
                </InfoRow>

                <InfoRow>
                  <strong>End Time:</strong>
                  <span>{formatDate(deceased.end_time)}</span>
                </InfoRow>

                <InfoRow>
                  <strong>Embalming Cost:</strong>
                  <span>{formatCurrency(deceased.embalming_cost)}</span>
                </InfoRow>

                {/* Display Chemical Usage */}
                {deceased.chemicalUsage && deceased.chemicalUsage.length > 0 && (
                  <ChemicalUsageSection>
                    <SectionTitle>
                      <Beaker size={16} />
                      Chemicals Used
                    </SectionTitle>
                    {deceased.chemicalUsage.map((chem, index) => (
                      <ChemicalItem key={index}>
                        <ChemicalName>{chem.chemical_name}</ChemicalName>
                        <ChemicalAmount>{chem.amount_used} {chem.unit}</ChemicalAmount>
                      </ChemicalItem>
                    ))}
                  </ChemicalUsageSection>
                )}

                <InfoRow>
                  <strong>Notes:</strong>
                  <span>{deceased.embalming_notes || 'No remarks'}</span>
                </InfoRow>

                <InfoRow>
                  <strong>Embalmed At:</strong>
                  <span>{formatDate(deceased.embalmed_at)}</span>
                </InfoRow>
              </>
            )}
          </InfoDisplay>

          {!deceased.is_embalmed && (
            <PrimaryButton onClick={() => setIsEditing(true)}>
              Record Embalming
              <FlaskConical size={14} />
            </PrimaryButton>
          )}
        </>
      )}
    </Card>
  );
};

export default EmbalmingInfoSection;