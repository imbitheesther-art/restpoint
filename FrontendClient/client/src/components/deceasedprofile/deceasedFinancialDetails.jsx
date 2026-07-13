import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    DollarSign,
    Calendar,
    FileText,
    CreditCard,
    AlertCircle,
    Trash2,
    Download,
    Printer,
    Eye,
    Edit,
    Plus,
    Receipt,
    TrendingUp,
    Wallet,
    CheckCircle,
    XCircle,
    Clock,
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import env from '../../config/env';

const Container = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #E3DDD0;

  h3 {
    margin: 0;
    font-size: 1rem;
    color: #15171A;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      color: #8B7355;
    }
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

const SummaryCard = styled.div`
  background: ${props => props.$bgColor || '#FAF8F4'};
  border-left: 4px solid ${props => props.$borderColor || '#8B7355'};
  padding: 0.875rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .label {
    font-size: 0.75rem;
    color: #6B6862;
    margin-bottom: 0.25rem;
    font-weight: 500;
  }

  .value {
    font-size: 1.125rem;
    font-weight: 700;
    color: #15171A;
  }

  .subtext {
    font-size: 0.6875rem;
    color: #8B8882;
    margin-top: 0.25rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  border: none;
  background: ${props => props.$bgColor};
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    filter: brightness(1.1);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Section = styled.div`
  margin-bottom: 1.25rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #FAF8F4;
  border-bottom: 1px solid #E3DDD0;
  margin-bottom: 0;

  h4 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #15171A;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .badge {
    background: ${props => props.$badgeColor || '#8B7355'};
    color: white;
    padding: 0.25rem 0.625rem;
    border-radius: 1rem;
    font-size: 0.6875rem;
    font-weight: 600;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;

  thead {
    position: sticky;
    top: 0;
    background: ${props => props.$headerColor || '#8B7355'};
    color: white;

    th {
      padding: 0.625rem 0.75rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #E3DDD0;
      transition: background 0.2s ease;

      &:hover {
        background: #FAF8F4;
      }

      td {
        padding: 0.625rem 0.75rem;
        color: #15171A;
      }
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: #6B6862;

  .icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
    opacity: 0.5;
  }

  p {
    margin: 0.25rem 0;
    font-size: 0.875rem;
  }

  .subtext {
    font-size: 0.75rem;
    color: #8B8882;
  }
`;

const ActionIconButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.$color || '#8B7355'};
  cursor: pointer;
  padding: 0.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border-radius: 0.25rem;

  &:hover:not(:disabled) {
    background: ${props => props.$bgColor || '#FAF8F4'};
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 600;
  background: ${props => {
        if (props.$status === 'paid') return '#D1FAE5';
        if (props.$status === 'partial') return '#FEF3C7';
        if (props.$status === 'pending') return '#FEE2E2';
        return '#E5E7EB';
    }};
  color: ${props => {
        if (props.$status === 'paid') return '#065F46';
        if (props.$status === 'partial') return '#92400E';
        if (props.$status === 'pending') return '#DC2626';
        return '#374151';
    }};

  svg {
    width: 12px;
    height: 12px;
  }
`;

const DeceasedFinancialDetails = ({
    financialDetails,
    selectedDeceased,
    onBack,
    onCreatePayment,
    onAddCharge,
    onDownloadInvoice,
    onViewInvoice,
    onEditInvoice,
    onDeleteInvoice,
    onPrintInvoice,
    onEditExtraCharge,
    onDeleteExtraCharge
}) => {
    const { deceased, payments, extraCharges, invoices, totals } = financialDetails;
    const [currentViewer, setCurrentViewer] = useState(null);
    const [currentPdfUrl, setCurrentPdfUrl] = useState('');
    const [currentInvoice, setCurrentInvoice] = useState(null);

    const showToast = (icon, title, position = 'top-end') => {
        const Toast = Swal.mixin({
            toast: true,
            position: position,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });

        Toast.fire({
            icon: icon,
            title: title
        });
    };

    const handleViewInvoice = async (invoiceId) => {
        try {
            showToast('info', 'Loading invoice...');

            const invoice = invoices.find(inv => inv.id === invoiceId);
            if (!invoice) throw new Error('Invoice not found');

            let pdfUrl = invoice.pdf_url;

            if (pdfUrl && pdfUrl.includes('\\')) {
                pdfUrl = pdfUrl.replace(/\\/g, '/');
                const uploadsIndex = pdfUrl.indexOf('uploads/');
                if (uploadsIndex !== -1) {
                    pdfUrl = pdfUrl.substring(uploadsIndex);
                }
            }

            if (!pdfUrl) {
                throw new Error('PDF URL not found for this invoice');
            }

            const fullPdfUrl = `${env.API_GATEWAY_URL}/${pdfUrl}`;
            console.log('Loading PDF from:', fullPdfUrl);

            setCurrentInvoice(invoice);
            setCurrentPdfUrl(fullPdfUrl);
            setCurrentViewer('advanced');

        } catch (error) {
            console.error('Error viewing invoice:', error);
            showToast('error', 'Failed to load invoice: ' + error.message);
        }
    };

    const handleDownloadInvoice = async (invoiceId) => {
        try {
            const invoice = invoices.find(inv => inv.id === invoiceId);
            if (!invoice) {
                throw new Error('Invoice not found');
            }

            let pdfUrl = invoice.pdf_url;

            if (pdfUrl && pdfUrl.includes('\\')) {
                pdfUrl = pdfUrl.replace(/\\/g, '/');
                const uploadsIndex = pdfUrl.indexOf('uploads/');
                if (uploadsIndex !== -1) {
                    pdfUrl = pdfUrl.substring(uploadsIndex);
                }
            }

            if (!pdfUrl) {
                throw new Error('PDF URL not found');
            }

            const fullPdfUrl = `${env.API_GATEWAY_URL}/${pdfUrl}`;

            const response = await api({
                url: fullPdfUrl,
                method: 'GET',
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `${invoice.invoice_number}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showToast('success', 'Invoice downloaded successfully!');

        } catch (error) {
            console.error('Error downloading invoice:', error);
            showToast('error', 'Failed to download invoice');
        }
    };

    const handlePrintInvoice = async (invoiceId) => {
        try {
            const invoice = invoices.find(inv => inv.id === invoiceId);
            if (!invoice) {
                throw new Error('Invoice not found');
            }

            let pdfUrl = invoice.pdf_url;

            if (pdfUrl && pdfUrl.includes('\\')) {
                pdfUrl = pdfUrl.replace(/\\/g, '/');
                const uploadsIndex = pdfUrl.indexOf('uploads/');
                if (uploadsIndex !== -1) {
                    pdfUrl = pdfUrl.substring(uploadsIndex);
                }
            }

            if (!pdfUrl) {
                throw new Error('PDF URL not found');
            }

            const fullPdfUrl = `${env.API_GATEWAY_URL}/${pdfUrl}`;

            const printWindow = window.open(fullPdfUrl, '_blank');
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                };
            }

        } catch (error) {
            console.error('Error printing invoice:', error);
            showToast('error', 'Failed to print invoice');
        }
    };

    const handleDeleteExtraCharge = async (chargeId) => {
        try {
            const result = await Swal.fire({
                title: 'Delete Extra Charge?',
                text: "This charge will be permanently removed from the system",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                await onDeleteExtraCharge(chargeId);
                showToast('success', 'Extra charge deleted successfully!');
            }
        } catch (error) {
            console.error('Error deleting charge:', error);
            showToast('error', 'Error deleting extra charge');
        }
    };

    const handleDeleteInvoiceConfirm = async (invoiceId) => {
        try {
            const result = await Swal.fire({
                title: 'Delete Invoice?',
                text: "This invoice will be permanently removed from the system",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                await onDeleteInvoice(invoiceId);
                showToast('success', 'Invoice deleted successfully!');
            }
        } catch (error) {
            console.error('Error deleting invoice:', error);
            showToast('error', 'Error deleting invoice');
        }
    };

    const safeTotals = {
        total_charges: totals?.total_charges || 0,
        mortuary_charges: totals?.mortuary_charges || 0,
        extra_charges: totals?.extra_charges || 0,
        total_payments: totals?.total_payments || 0,
        balance: totals?.balance || 0
    };

    return (
        <Container>
            <Header>
                <h3>
                    <Receipt size={20} />
                    {deceased?.full_name ? `Financial Details - ${deceased.full_name}` : 'Financial Details'}
                </h3>
                {deceased?.deceased_id && (
                    <div style={{ fontSize: '0.75rem', color: '#6B6862' }}>
                        {deceased.deceased_id}
                    </div>
                )}
            </Header>

            {/* Summary Cards */}
            <SummaryGrid>
                <SummaryCard $borderColor="#8B7355">
                    <div className="label">Total Charges</div>
                    <div className="value">KES {safeTotals.total_charges.toLocaleString()}</div>
                    <div className="subtext">Base: KES {safeTotals.mortuary_charges.toLocaleString()}</div>
                </SummaryCard>

                <SummaryCard $borderColor="#059669">
                    <div className="label">Total Payments</div>
                    <div className="value">KES {safeTotals.total_payments.toLocaleString()}</div>
                    <div className="subtext">{payments?.length || 0} payment(s)</div>
                </SummaryCard>

                <SummaryCard $borderColor={safeTotals.balance > 0 ? '#f59e0b' : '#3b82f6'}>
                    <div className="label" style={{ color: safeTotals.balance > 0 ? '#f59e0b' : '#3b82f6' }}>
                        {safeTotals.balance > 0 ? 'Balance Due' : 'Fully Paid'}
                    </div>
                    <div className="value" style={{ color: safeTotals.balance > 0 ? '#dc2626' : '#059669' }}>
                        KES {Math.abs(safeTotals.balance).toLocaleString()}
                    </div>
                    <div className="subtext">{invoices?.length || 0} invoices</div>
                </SummaryCard>

                <SummaryCard $borderColor="#6B6862">
                    <div className="label">Status</div>
                    <div className="value">
                        <StatusBadge $status={safeTotals.balance > 0 ? 'pending' : 'paid'}>
                            {safeTotals.balance > 0 ? <Clock size={12} /> : <CheckCircle size={12} />}
                            {safeTotals.balance > 0 ? 'Pending' : 'Paid'}
                        </StatusBadge>
                    </div>
                    <div className="subtext">{extraCharges?.length || 0} extra charges</div>
                </SummaryCard>
            </SummaryGrid>

            {/* Action Buttons */}
            <ActionButtons>
                <ActionButton onClick={onCreatePayment} $bgColor="#059669">
                    <Wallet size={14} />
                    Record Payment
                </ActionButton>
                <ActionButton onClick={onAddCharge} $bgColor="#f59e0b">
                    <Plus size={14} />
                    Add Extra Charge
                </ActionButton>
            </ActionButtons>

            {/* Payments History */}
            <Section>
                <SectionHeader $badgeColor="#059669">
                    <h4>
                        <CreditCard size={16} />
                        Payment History
                    </h4>
                    <span className="badge">{payments?.length || 0} payments</span>
                </SectionHeader>
                <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #E3DDD0', borderTop: 'none', borderRadius: '0 0 0.5rem 0.5rem' }}>
                    {(!payments || payments.length === 0) ? (
                        <EmptyState>
                            <div className="icon">💳</div>
                            <p>No payments recorded</p>
                            <p className="subtext">Record a payment to see it here</p>
                        </EmptyState>
                    ) : (
                        <Table $headerColor="#059669">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Reference</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment.payment_id || payment.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                <Calendar size={12} color="#8B7355" />
                                                {new Date(payment.payment_date || payment.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>
                                            <strong style={{ color: '#059669' }}>
                                                KES {parseFloat(payment.amount || 0).toLocaleString()}
                                            </strong>
                                        </td>
                                        <td>
                                            <span style={{
                                                background: '#E5E7EB',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.375rem',
                                                fontSize: '0.6875rem',
                                                fontWeight: '500'
                                            }}>
                                                {payment.payment_method}
                                            </span>
                                        </td>
                                        <td style={{ color: '#6B6862', fontSize: '0.75rem' }}>
                                            {payment.reference_code || payment.reference_number || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            </Section>

            {/* Extra Charges */}
            <Section>
                <SectionHeader $badgeColor="#f59e0b">
                    <h4>
                        <TrendingUp size={16} />
                        Extra Charges
                    </h4>
                    <span className="badge">{extraCharges?.length || 0} charges</span>
                </SectionHeader>
                <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #E3DDD0', borderTop: 'none', borderRadius: '0 0 0.5rem 0.5rem' }}>
                    {(!extraCharges || extraCharges.length === 0) ? (
                        <EmptyState>
                            <div className="icon">📋</div>
                            <p>No extra charges</p>
                            <p className="subtext">Add extra charges for additional services</p>
                        </EmptyState>
                    ) : (
                        <Table $headerColor="#f59e0b">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Description</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {extraCharges.map((charge) => (
                                    <tr key={charge.id}>
                                        <td>
                                            <strong>{charge.charge_type}</strong>
                                        </td>
                                        <td>
                                            <strong style={{ color: '#f59e0b' }}>
                                                KES {parseFloat(charge.amount || 0).toLocaleString()}
                                            </strong>
                                        </td>
                                        <td>
                                            <div>{charge.description}</div>
                                            {charge.notes && (
                                                <div style={{ fontSize: '0.6875rem', color: '#6B6862', marginTop: '0.125rem' }}>
                                                    {charge.notes}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ fontSize: '0.75rem' }}>
                                            {new Date(charge.service_date || charge.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                <ActionIconButton
                                                    onClick={() => onEditExtraCharge && onEditExtraCharge(charge)}
                                                    $color="#92400E"
                                                    $bgColor="#FEF3C7"
                                                    title="Edit Charge"
                                                >
                                                    <Edit size={14} />
                                                </ActionIconButton>
                                                <ActionIconButton
                                                    onClick={() => handleDeleteExtraCharge(charge.id)}
                                                    $color="#DC2626"
                                                    $bgColor="#FEE2E2"
                                                    title="Delete Charge"
                                                >
                                                    <Trash2 size={14} />
                                                </ActionIconButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            </Section>

            {/* Invoices */}
            <Section>
                <SectionHeader $badgeColor="#1e293b">
                    <h4>
                        <FileText size={16} />
                        Invoices
                    </h4>
                    <span className="badge">{invoices?.length || 0} invoices</span>
                </SectionHeader>
                <div style={{ border: '1px solid #E3DDD0', borderTop: 'none', borderRadius: '0 0 0.5rem 0.5rem', overflowX: 'auto' }}>
                    {(!invoices || invoices.length === 0) ? (
                        <EmptyState>
                            <div className="icon">🧾</div>
                            <p>No invoices generated yet</p>
                            <p className="subtext">Generate an invoice to see it here</p>
                        </EmptyState>
                    ) : (
                        <Table $headerColor="#1e293b">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id}>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{invoice.invoice_number}</div>
                                            {invoice.system_generated && (
                                                <span style={{
                                                    background: '#6B7280',
                                                    color: 'white',
                                                    padding: '0.125rem 0.375rem',
                                                    borderRadius: '0.25rem',
                                                    fontSize: '0.625rem',
                                                    marginLeft: '0.25rem'
                                                }}>
                                                    System
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ fontSize: '0.75rem' }}>
                                            {new Date(invoice.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <strong style={{ color: '#2563eb' }}>
                                                KES {parseFloat(invoice.total_amount || 0).toLocaleString()}
                                            </strong>
                                        </td>
                                        <td>
                                            <span style={{
                                                background: invoice.system_generated ? '#DBEAFE' : '#FEF3C7',
                                                color: invoice.system_generated ? '#1E40AF' : '#92400E',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.375rem',
                                                fontSize: '0.6875rem',
                                                fontWeight: '500'
                                            }}>
                                                {invoice.system_generated ? 'System' : 'Manual'}
                                            </span>
                                        </td>
                                        <td>
                                            <StatusBadge $status={invoice.payment_status || 'unpaid'}>
                                                {invoice.payment_status === 'paid' ? <CheckCircle size={12} /> :
                                                    invoice.payment_status === 'partial' ? <Clock size={12} /> :
                                                        <XCircle size={12} />}
                                                {invoice.payment_status || 'unpaid'}
                                            </StatusBadge>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                                <ActionIconButton
                                                    onClick={() => handleViewInvoice(invoice.id)}
                                                    $color="#2563eb"
                                                    $bgColor="#DBEAFE"
                                                    title="View Invoice"
                                                >
                                                    <Eye size={14} />
                                                </ActionIconButton>
                                                <ActionIconButton
                                                    onClick={() => onEditInvoice && onEditInvoice(invoice.id)}
                                                    $color="#92400E"
                                                    $bgColor="#FEF3C7"
                                                    title="Edit Invoice"
                                                >
                                                    <Edit size={14} />
                                                </ActionIconButton>
                                                <ActionIconButton
                                                    onClick={() => handleDownloadInvoice(invoice.id)}
                                                    $color="#059669"
                                                    $bgColor="#D1FAE5"
                                                    title="Download PDF"
                                                >
                                                    <Download size={14} />
                                                </ActionIconButton>
                                                <ActionIconButton
                                                    onClick={() => handlePrintInvoice(invoice.id)}
                                                    $color="#374151"
                                                    $bgColor="#E5E7EB"
                                                    title="Print Invoice"
                                                >
                                                    <Printer size={14} />
                                                </ActionIconButton>
                                                <ActionIconButton
                                                    onClick={() => handleDeleteInvoiceConfirm(invoice.id)}
                                                    $color="#DC2626"
                                                    $bgColor="#FEE2E2"
                                                    title="Delete Invoice"
                                                >
                                                    <Trash2 size={14} />
                                                </ActionIconButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            </Section>
        </Container>
    );
};

export default DeceasedFinancialDetails;