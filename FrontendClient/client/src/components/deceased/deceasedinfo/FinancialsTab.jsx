import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { C, formatDate } from './theme';
import axios from 'axios';
import { getTenantSlug, getAuthToken } from '../../../utils/globalAuth';
import { showToast } from '../../../utils/toast';

const SectionHead = styled.div`
  background: ${C.black}; color: white; padding: 8px 16px;
  font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; margin-bottom: 24px; border-radius: 2px;
  display: flex; align-items: center; gap: 8px;
  span { opacity: 0.5; font-size: 10px; }
  ${p => p.$mt0 && 'margin-top: 0;'}
  ${p => p.$mt4 && 'margin-top: 32px;'}
`;

const DetailGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const DetailBox = styled.div`
  background: ${C.bgSection}; border: 1px solid ${C.borderLight};
  border-radius: 6px; padding: 16px; min-width: 0;
  ${p => p.$full && 'grid-column: span 2;'}
  @media (max-width: 768px) { grid-column: span 1 !important; }
`;

const DetailLabel = styled.span`
  font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: ${p => p.$color || C.gray}; margin-bottom: 6px; display: block;
`;

const DetailValue = styled.div`
  font-size: ${p => p.$lg ? '24px' : '15px'};
  font-weight: ${p => p.$lg ? 700 : 600};
  color: ${p => p.$color || C.black}; word-break: break-word;
`;

const FormRow = styled.div`display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;`;
const FormGroup = styled.div`flex: 1; min-width: 150px;`;
const FormLabel = styled.label`
  display: block; font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: ${C.gray}; margin-bottom: 6px;
`;
const FormInput = styled.input`
  height: 38px; width: 100%; border: 1px solid ${C.border}; border-radius: 4px;
  padding: 0 12px; font-family: 'Source Sans 3', sans-serif; font-size: 14px;
  color: ${C.dark}; background: ${C.bgField}; box-sizing: border-box;
  &:focus { outline: none; border-color: ${C.black}; background: white; }
`;
const FormSelect = styled.select`
  height: 38px; width: 100%; border: 1px solid ${C.border}; border-radius: 4px;
  padding: 0 12px; font-family: 'Source Sans 3', sans-serif; font-size: 14px;
  color: ${C.dark}; background: ${C.bgField}; box-sizing: border-box;
  &:focus { outline: none; border-color: ${C.black}; background: white; }
`;

const Btn = styled.button`
  padding: 10px 16px; border-radius: 4px; font-weight: 600; font-size: 13px;
  cursor: pointer; border: 1px solid ${C.border}; background: white; color: ${C.dark};
  transition: 0.15s; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font-family: 'Source Sans 3', sans-serif;
  &:hover { background: ${C.bgField}; border-color: ${C.gray}; }
  ${p => p.$primary && `background: ${C.black}; color: white; border-color: ${C.black};
    &:hover { background: ${C.dark}; }`}
`;

const DataTable = styled.table`
  width: 100%; border-collapse: collapse;
  th { text-align: left; font-size: 11px; text-transform: uppercase; color: ${C.gray}; padding: 8px 12px; border-bottom: 2px solid ${C.borderLight}; white-space: nowrap; }
  td { padding: 12px; font-size: 13px; border-bottom: 1px solid ${C.borderLight}; vertical-align: middle; }
`;

const StatusTag = styled.span`
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
  border-radius: 4px; font-size: 12px; font-weight: 700;
  background: ${p => p.$success ? C.successBg : p.$warning ? C.warningBg : p.$info ? C.infoBg : C.bgField};
  color: ${p => p.$success ? C.success : p.$warning ? C.warning : p.$info ? C.info : C.gray};
  border: 1px solid ${p => p.$success ? '#a7f3d0' : p.$warning ? '#fde68a' : p.$info ? '#bfdbfe' : C.borderLight};
`;

const FinancialsTab = ({ charges, payments: initialPayments, deceasedId }) => {
  const [payments, setPayments] = useState(initialPayments || []);
  const [isRecording, setIsRecording] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    date: new Date().toISOString().split('T')[0],
    payment_method: 'M-Pesa',
    reference: '',
    amount: '',
    description: ''
  });

  const totalCharges = charges.reduce((s, c) => s + (parseFloat(c.amount || c.charge_amount || 0)), 0);
  const totalPaid = payments.reduce((s, p) => s + (parseFloat(p.amount || 0)), 0);
  const balance = totalCharges - totalPaid;
  const isOverpaid = balance < 0;

  // Load payments from API
  useEffect(() => {
    if (deceasedId) {
      loadPayments();
    }
  }, [deceasedId]);

  const loadPayments = async () => {
    try {
      const tenantSlug = getTenantSlug();
      const token = getAuthToken ? getAuthToken() : localStorage.getItem('token') || localStorage.getItem('authToken') || '';
      const API_GATEWAY_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${API_GATEWAY_URL}/payments/${deceasedId}`,
        { 
          headers: { 
            'x-tenant-slug': tenantSlug,
            'Authorization': `Bearer ${token}`
          } 
        }
      );
      if (response.data?.success) {
        setPayments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    
    if (!paymentForm.amount || !paymentForm.reference) {
      showToast.error('Please fill in all required fields');
      return;
    }

    setIsRecording(true);
    try {
      const tenantSlug = getTenantSlug();
      const token = getAuthToken ? getAuthToken() : localStorage.getItem('token') || localStorage.getItem('authToken') || '';
      
      // Get user email for recorded_by field
      const userEmail = (() => {
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            return user.email || user.username || 'Unknown';
          }
        } catch (e) {
          console.error('Error getting user email:', e);
        }
        return 'Unknown';
      })();
      
      const API_GATEWAY_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(
        `${API_GATEWAY_URL}/payments`,
        {
          deceased_id: deceasedId,
          amount: parseFloat(paymentForm.amount),
          payment_method: paymentForm.payment_method,
          reference: paymentForm.reference,
          payment_date: paymentForm.date,
          description: paymentForm.description || null,
          recorded_by: userEmail
        },
        { 
          headers: { 
            'x-tenant-slug': tenantSlug,
            'Authorization': `Bearer ${token}`
          } 
        }
      );

      if (response.data?.success) {
        showToast.success('Payment recorded successfully');
        setPaymentForm({
          date: new Date().toISOString().split('T')[0],
          payment_method: 'M-Pesa',
          reference: '',
          amount: '',
          description: ''
        });
        await loadPayments();
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      showToast.error('Failed to record payment');
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <>
      <SectionHead $mt0><span>01</span> Financial Summary</SectionHead>
      <DetailGrid>
        <DetailBox $bg={C.infoBg} $bc="#bfdbfe">
          <DetailLabel $color="#1e40af">Total Charges</DetailLabel>
          <DetailValue $lg $color="#1e3a8a">KES {totalCharges.toLocaleString()}</DetailValue>
        </DetailBox>
        <DetailBox $bg={C.successBg} $bc="#a7f3d0">
          <DetailLabel $color="#047857">Amount Paid</DetailLabel>
          <DetailValue $lg $color="#064e3b">KES {totalPaid.toLocaleString()}</DetailValue>
        </DetailBox>
        <DetailBox $full $bg={isOverpaid ? C.successBg : C.dangerBg} $bc={isOverpaid ? '#a7f3d0' : '#fecaca'}>
          <DetailLabel $color={isOverpaid ? '#047857' : '#b91c1c'}>
            {isOverpaid ? 'Credit / Overpayment' : 'Balance Due'}
          </DetailLabel>
          <DetailValue $lg $color={isOverpaid ? '#064e3b' : '#7f1d1d'}>
            KES {Math.abs(balance).toLocaleString()}
          </DetailValue>
        </DetailBox>
      </DetailGrid>

      <SectionHead><span>02</span> Record Payment</SectionHead>
      <DetailBox $full style={{ padding: 24 }}>
        <form onSubmit={handleRecordPayment}>
          <FormRow>
            <FormGroup>
              <FormLabel>Date</FormLabel>
              <FormInput 
                type="date" 
                value={paymentForm.date}
                onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>Payment Method</FormLabel>
              <FormSelect 
                value={paymentForm.payment_method}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
              >
                <option>Cash</option>
                <option>M-Pesa</option>
                <option>Card</option>
                <option>Bank Transfer</option>
              </FormSelect>
            </FormGroup>
            <FormGroup>
              <FormLabel>Reference Number</FormLabel>
              <FormInput 
                placeholder="e.g. QXR89YU72"
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>Amount (KES)</FormLabel>
              <FormInput 
                type="number" 
                placeholder="0.00"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup style={{ flex: 2, minWidth: '200px' }}>
              <FormLabel>Description / Notes (Optional)</FormLabel>
              <FormInput 
                placeholder="e.g. Facility fee, Coffin, Embalming, etc."
                value={paymentForm.description}
                onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
              />
            </FormGroup>
          </FormRow>
          <div style={{ textAlign: 'right' }}>
            <Btn $primary type="submit" disabled={isRecording}>
              {isRecording ? 'Recording...' : '+ Record Payment'}
            </Btn>
          </div>
        </form>
      </DetailBox>

      <SectionHead $mt4><span>03</span> Payment History</SectionHead>
      <div style={{ overflowX: 'auto', border: `1px solid ${C.borderLight}`, borderRadius: 6 }}>
        <DataTable style={{ marginTop: 0 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Recorded By</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: C.gray, padding: 20 }}>No payments recorded</td></tr>
            ) : payments.map((p, i) => (
              <tr key={i}>
                <td>{formatDate(p.created_at || p.payment_date)}</td>
                <td><StatusTag $info={p.payment_method === 'M-Pesa'} $warning={p.payment_method === 'Cash'}>{p.payment_method || '—'}</StatusTag></td>
                <td>{p.reference || '—'}</td>
                <td>{p.description || p.notes || '—'}</td>
                <td><strong>KES {parseFloat(p.amount || 0).toLocaleString()}</strong></td>
                <td>{p.recorded_by || '—'}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
    </>
  );
};

export default FinancialsTab;