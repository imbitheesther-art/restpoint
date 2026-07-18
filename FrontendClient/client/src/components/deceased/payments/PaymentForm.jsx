import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { X, DollarSign, Calendar, CreditCard, FileText, AlertCircle } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
  padding: 1rem;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Modal = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #E3DDD0;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #15171A;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      color: #059669;
    }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6B6862;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: #C77B5E;
    transform: rotate(90deg);
  }
`;

const Alert = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.25rem;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  color: #1E40AF;
  font-size: 0.875rem;

  svg {
    flex-shrink: 0;
    color: #3B82F6;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$columns || '1fr 1fr'};
  gap: 1rem;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #15171A;
    display: flex;
    align-items: center;
    gap: 0.375rem;

    svg {
      color: #8B7355;
      width: 14px;
      height: 14px;
    }

    .required {
      color: #C77B5E;
    }
  }

  input,
  select,
  textarea {
    padding: 0.625rem 0.875rem;
    border: 1px solid #E3DDD0;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-family: inherit;
    transition: all 0.2s ease;
    background: white;

    &:focus {
      outline: none;
      border-color: #8B7355;
      box-shadow: 0 0 0 3px rgba(139, 115, 85, 0.1);
    }

    &::placeholder {
      color: #8B8882;
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #E3DDD0;

  @media (max-width: 576px) {
    flex-direction: column-reverse;
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid ${props => props.$variant === 'primary' ? '#059669' : props.$variant === 'danger' ? '#C77B5E' : '#E3DDD0'};
  background: ${props => props.$variant === 'primary' ? '#059669' : props.$variant === 'danger' ? '#C77B5E' : 'white'};
  color: ${props => props.$variant === 'primary' || props.$variant === 'danger' ? 'white' : '#15171A'};
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 40px;
  font-family: inherit;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: ${props => props.$variant === 'primary' ? '#047857' : props.$variant === 'danger' ? '#A66B52' : '#FAF8F4'};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const PaymentForm = ({ deceased, onClose, onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        deceased_id: deceased?.id || deceased?.deceased_id,
        amount: '',
        payment_method: 'Cash',
        reference_code: '',
        description: `Payment for ${deceased?.full_name || 'deceased'}`
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (deceased) {
            setFormData(prev => ({
                ...prev,
                deceased_id: deceased.id || deceased.deceased_id,
                description: `Payment for ${deceased.full_name || 'deceased'}`
            }));
        }
    }, [deceased]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const submitData = {
            ...formData,
            amount: parseFloat(formData.amount)
        };

        onSubmit(submitData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <h3>
                        <DollarSign size={20} />
                        Record Payment
                    </h3>
                    <CloseButton onClick={onClose}>
                        <X size={20} />
                    </CloseButton>
                </ModalHeader>

                <Alert>
                    <AlertCircle size={18} />
                    <div>
                        <strong>Recording payment for:</strong> {deceased?.full_name || 'Unknown'} ({deceased?.deceased_id || 'N/A'})
                    </div>
                </Alert>

                <Form onSubmit={handleSubmit}>
                    <FormRow $columns="1fr 1fr">
                        <FormGroup>
                            <label>
                                Amount (KES) <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className={errors.amount ? 'error' : ''}
                            />
                            {errors.amount && (
                                <span style={{ color: '#C77B5E', fontSize: '0.75rem' }}>{errors.amount}</span>
                            )}
                        </FormGroup>

                        <FormGroup>
                            <label>
                                <CreditCard size={14} />
                                Payment Method <span className="required">*</span>
                            </label>
                            <select
                                name="payment_method"
                                value={formData.payment_method}
                                onChange={handleChange}
                            >
                                <option value="Cash">Cash</option>
                                <option value="M-Pesa">M-Pesa</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Card">Card</option>
                            </select>
                        </FormGroup>
                    </FormRow>

                    <FormRow $columns="1fr 1fr">
                        <FormGroup>
                            <label>Reference Code</label>
                            <input
                                type="text"
                                name="reference_code"
                                value={formData.reference_code}
                                onChange={handleChange}
                                placeholder="Enter reference code (optional)"
                            />
                            <small style={{ color: '#8B8882', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                Leave blank for automatic system generation
                            </small>
                        </FormGroup>

                        <FormGroup>
                            <label>
                                <FileText size={14} />
                                Description
                            </label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Payment description"
                            />
                        </FormGroup>
                    </FormRow>

                    <ButtonGroup>
                        <Button type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" $variant="primary" disabled={isLoading}>
                            <DollarSign size={16} />
                            {isLoading ? 'Recording...' : 'Record Payment'}
                        </Button>
                    </ButtonGroup>
                </Form>
            </Modal>
        </Overlay>
    );
};

export default PaymentForm;