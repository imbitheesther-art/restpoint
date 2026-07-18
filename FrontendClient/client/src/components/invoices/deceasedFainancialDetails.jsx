// components/DeceasedFinancialDetails.jsx
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import AdvancedPdfViewer from './pdfviewer';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import env from '../../utils/config/env';

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

  // Sweet Alert configuration
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

  // Enhanced PDF View Function
  const handleViewInvoice = async (invoiceId) => {
    try {
      showToast('info', 'Loading invoice...');
      
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice) throw new Error('Invoice not found');

      let pdfUrl = invoice.pdf_url;
      
      // Convert Windows file path to URL format
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
      console.log('Loading PDF from:', fullPdfUrl); // Debug log
      
      setCurrentInvoice(invoice);
      setCurrentPdfUrl(fullPdfUrl);
      setCurrentViewer('advanced');
      
    } catch (error) {
      console.error('Error viewing invoice:', error);
      showToast('error', 'Failed to load invoice: ' + error.message);
    }
  };

  // Download PDF function
  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      let pdfUrl = invoice.pdf_url;
      
      // Convert file path to URL format
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
      
      // Use axios to download the file
      const response = await axios({
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

  // Print PDF function
  const handlePrintInvoice = async (invoiceId) => {
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      let pdfUrl = invoice.pdf_url;
      
      // Convert file path to URL format
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
      
      // Open PDF in new window and print
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

  // WhatsApp Send Functionality
  const handleSendInvoice = async (invoiceId) => {
    try {
      showToast('info', 'Preparing to send invoice...');
      
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice) throw new Error('Invoice not found');

      // Get next of kin information
      let phoneNumber = null;
      let nextOfKinName = 'Next of Kin';

      try {
        const nextOfKinResponse = await api.get(`${ENDPOINTS.DECEASED.BASE}/${deceased.id}/next-of-kin`);
        if (nextOfKinResponse.data.status === 'success' && nextOfKinResponse.data.data && nextOfKinResponse.data.data.length > 0) {
          const nextOfKin = nextOfKinResponse.data.data[0];
          phoneNumber = nextOfKin.phone_number || nextOfKin.mobile_number || nextOfKin.phone;
          nextOfKinName = nextOfKin.full_name || nextOfKin.name || 'Next of Kin';
        }
      } catch (error) {
        console.log('No next of kin data found, will ask for number');
      }

      // If no phone number found, ask user to enter one
      if (!phoneNumber) {
        const { value: enteredNumber } = await Swal.fire({
          title: 'Enter WhatsApp Number',
          input: 'text',
          inputLabel: `Please enter WhatsApp number to send invoice:`,
          inputPlaceholder: '2547XXXXXXXX or 07XXXXXXXX',
          showCancelButton: true,
          confirmButtonText: 'Send via WhatsApp',
          cancelButtonText: 'Cancel',
          inputValidator: (value) => {
            if (!value) {
              return 'Please enter a phone number';
            }
            // Basic phone number validation for Kenyan numbers
            const cleaned = value.replace(/\s/g, '');
            if (!/^(\+?254|0)?[17]\d{8}$/.test(cleaned)) {
              return 'Please enter a valid Kenyan phone number';
            }
          }
        });

        if (enteredNumber) {
          phoneNumber = enteredNumber;
        } else {
          showToast('info', 'Send cancelled');
          return; // User cancelled
        }
      }

      // Format phone number for WhatsApp
      const formattedNumber = formatPhoneNumberForWhatsApp(phoneNumber);
      
      // Get PDF file
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
      
      // Download the PDF file using axios
      const response = await axios({
        url: fullPdfUrl,
        method: 'GET',
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const file = new File([blob], `${invoice.invoice_number}.pdf`, { type: 'application/pdf' });
      
      // Create WhatsApp message
      const message = createWhatsAppMessage(invoice, deceased);
      
      // Send via WhatsApp Web with file attachment
      await sendViaWhatsAppWeb(formattedNumber, message, file, invoice);
      
      showToast('success', `WhatsApp opened! Please send to ${nextOfKinName}`);
      
    } catch (error) {
      console.error('Error sending invoice:', error);
      showToast('error', `Failed to send invoice: ${error.message}`);
    }
  };

  // Format phone number for WhatsApp
  const formatPhoneNumberForWhatsApp = (phoneNumber) => {
    let cleaned = phoneNumber.replace(/\s/g, '').replace(/^0/, '254').replace(/^\+/, '');
    
    // Ensure it starts with 254
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  };

  // Create WhatsApp message
  const createWhatsAppMessage = (invoice, deceased) => {
    const invoiceAmount = parseFloat(invoice.total_amount || 0).toLocaleString();
    const balance = totals.balance > 0 ? `Balance Due: KES ${totals.balance.toLocaleString()}` : 'Fully Paid';
    
    return `*INVOICE NOTIFICATION*

*Deceased:* ${deceased.full_name}
*Invoice Number:* ${invoice.invoice_number}
*Total Amount:* KES ${invoiceAmount}
*Status:* ${balance}

Please find the attached invoice for all mortuary services and charges.

*Payment Instructions:*
- M-Pesa Paybill: 123456
- Account Number: ${invoice.invoice_number}
- Cash payments at our office

For any queries, contact us at:
Phone: +254 XXX XXX XXX
Email: info@mortuary.com

Thank you for choosing our services.`;
  };

  // Send via WhatsApp Web with file attachment
  const sendViaWhatsAppWeb = async (phoneNumber, message, file, invoice) => {
    // Method 1: Try Web Share API first (works on mobile and some desktop browsers)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `Invoice - ${invoice.invoice_number}`,
          text: message,
          files: [file]
        });
        return;
      } catch (shareError) {
        console.log('Web Share API failed, falling back to WhatsApp Web');
      }
    }

    // Method 2: For desktop - download file and open WhatsApp Web
    if (!isMobileDevice()) {
      // Download the file first
      const downloadUrl = URL.createObjectURL(file);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = file.name;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Open WhatsApp Web with phone number
      const whatsappUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      // Show instructions
      Swal.fire({
        title: 'Manual File Attachment Required',
        html: `
          <p>The invoice PDF has been downloaded to your device.</p>
          <p>Please follow these steps:</p>
          <ol style="text-align: left; padding-left: 20px; margin: 10px 0;">
            <li>WhatsApp Web has been opened</li>
            <li>Attach the downloaded file: <strong>${file.name}</strong></li>
            <li>Click send</li>
          </ol>
          <p><small>File location: Your browser's downloads folder</small></p>
        `,
        icon: 'info',
        confirmButtonText: 'OK, I understand'
      });
    } else {
      // Method 3: For mobile - use WhatsApp API
      const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
      window.location.href = whatsappUrl;
      
      // Show instructions for mobile
      setTimeout(() => {
        Swal.fire({
          title: 'Attach PDF File',
          html: `
            <p>WhatsApp has been opened.</p>
            <p>Please attach the PDF file manually:</p>
            <ol style="text-align: left; padding-left: 20px; margin: 10px 0;">
              <li>Tap the attachment icon (📎)</li>
              <li>Select "Document"</li>
              <li>Choose the invoice PDF file</li>
              <li>Send the message</li>
            </ol>
          `,
          icon: 'info',
          confirmButtonText: 'OK'
        });
      }, 2000);
    }
  };

  // Check if device is mobile
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Simple Send - Direct WhatsApp without backend API
  const handleSimpleSend = async (invoiceId) => {
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice) throw new Error('Invoice not found');

      // Get phone number (same logic as above)
      let phoneNumber = null;
      
      try {
        const nextOfKinResponse = await api.get(`${ENDPOINTS.DECEASED.BASE}/${deceased.id}/next-of-kin`);
        if (nextOfKinResponse.data.status === 'success' && nextOfKinResponse.data.data && nextOfKinResponse.data.data.length > 0) {
          const nextOfKin = nextOfKinResponse.data.data[0];
          phoneNumber = nextOfKin.phone_number || nextOfKin.mobile_number || nextOfKin.phone;
        }
      } catch (error) {
        console.log('No next of kin data found');
      }

      if (!phoneNumber) {
        const { value: enteredNumber } = await Swal.fire({
          title: 'Enter WhatsApp Number',
          input: 'text',
          inputLabel: 'Enter WhatsApp number:',
          inputPlaceholder: '2547XXXXXXXX',
          showCancelButton: true,
          confirmButtonText: 'Open WhatsApp',
          inputValidator: (value) => {
            if (!value) return 'Please enter a phone number';
            const cleaned = value.replace(/\s/g, '');
            if (!/^(\+?254|0)?[17]\d{8}$/.test(cleaned)) {
              return 'Please enter a valid Kenyan phone number';
            }
          }
        });

        if (!enteredNumber) {
          showToast('info', 'Send cancelled');
          return;
        }
        phoneNumber = enteredNumber;
      }

      const formattedNumber = formatPhoneNumberForWhatsApp(phoneNumber);
      
      // Get PDF URL
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
      
      // Download file using axios
      const response = await axios({
        url: fullPdfUrl,
        method: 'GET',
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const fileUrl = URL.createObjectURL(blob);
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = fileUrl;
      downloadLink.download = `${invoice.invoice_number}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Open WhatsApp
      const message = `Invoice ${invoice.invoice_number} for ${deceased.full_name}`;
      const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      showToast('success', 'WhatsApp opened! Please attach the downloaded PDF file.');
      
    } catch (error) {
      console.error('Error in simple send:', error);
      showToast('error', 'Failed to send invoice');
    }
  };

  // System invoice generation
  const handleCreateSystemInvoice = async () => {
    try {
      const result = await Swal.fire({
        title: 'Generate System Invoice?',
        text: 'This will create an automatic invoice with all charges and coffin details',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, generate!'
      });

      if (result.isConfirmed) {
        const systemInvoiceEndpoint = `${ENDPOINTS.INVOICE.BASE}/system-invoice`;
        const response = await api.post(systemInvoiceEndpoint, {
          deceased_id: deceased.id
        });
        
        if (response.data.status === 'success') {
          showToast('success', 'System invoice created successfully!');
          window.location.reload();
        } else {
          throw new Error(response.data.message);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'Error creating system invoice');
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

  const handleEditExtraCharge = (charge) => {
    onEditExtraCharge(charge);
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

  // Calculate dynamic heights for tables
  const getTableHeight = (items, minHeight = 200, maxHeight = 400, itemHeight = 50) => {
    const calculatedHeight = Math.min(maxHeight, Math.max(minHeight, items.length * itemHeight));
    return `${calculatedHeight}px`;
  };

  // Calculate totals safely
  const safeTotals = {
    total_charges: totals?.total_charges || 0,
    mortuary_charges: totals?.mortuary_charges || 0,
    extra_charges: totals?.extra_charges || 0,
    total_payments: totals?.total_payments || 0,
    balance: totals?.balance || 0
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      marginBottom: '24px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '16px 24px',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <h5 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            📊 Financial Details - {deceased?.full_name || 'N/A'}
          </h5>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>
            Deceased ID: {deceased?.deceased_id || 'N/A'} | Database ID: {deceased?.id || 'N/A'}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'white',
              color: '#2563eb',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            ← Back to Overview
          </button>
        </div>
      </div>
      
      {/* Body */}
      <div style={{ padding: '16px 24px' }}>
        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderLeft: '4px solid #2563eb',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Total Charges
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
              KES {safeTotals.total_charges.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
              Base: KES {safeTotals.mortuary_charges.toLocaleString()}<br/>
              Extra: KES {safeTotals.extra_charges.toLocaleString()}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderLeft: '4px solid #059669',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Total Payments
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
              KES {safeTotals.total_payments.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
              {payments?.length || 0} payment(s)
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderLeft: '4px solid ' + (safeTotals.balance > 0 ? '#f59e0b' : '#3b82f6'),
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              color: safeTotals.balance > 0 ? '#f59e0b' : '#3b82f6',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '4px'
            }}>
              Balance
            </div>
            <div style={{ 
              fontSize: '20px',
              fontWeight: 'bold',
              color: safeTotals.balance > 0 ? '#dc2626' : '#059669',
              marginBottom: '4px'
            }}>
              KES {Math.abs(safeTotals.balance).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
              {safeTotals.balance > 0 ? 'Amount due' : 'Fully paid'}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderLeft: '4px solid #6b7280',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Status
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
              <span style={{
                backgroundColor: safeTotals.balance > 0 ? '#fef3c7' : '#d1fae5',
                color: safeTotals.balance > 0 ? '#92400e' : '#065f46',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {safeTotals.balance > 0 ? 'Pending' : 'Paid'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
              {invoices?.length || 0} inv • {extraCharges?.length || 0} charges
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '24px'
        }}>
          <button
            onClick={onCreatePayment}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            💰 Record Payment
          </button>
          <button
            onClick={onAddCharge}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            ➕ Add Extra Charge
          </button>
          <button
            onClick={handleCreateSystemInvoice}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            📄 Generate System Invoice
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {/* Payments History */}
          <div>
            <div style={{
              backgroundColor: '#f9fafb',
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h6 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                💳 Payment History
              </h6>
              <span style={{
                backgroundColor: '#d1fae5',
                color: '#065f46',
                padding: '4px 8px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {payments?.length || 0} payments
              </span>
            </div>
            <div style={{ 
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderTop: 'none',
              borderBottomLeftRadius: '8px',
              borderBottomRightRadius: '8px'
            }}>
              {(!payments || payments.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <p style={{ color: '#6b7280' }}>No payments recorded</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#059669', color: 'white' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Amount</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Method</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.payment_id || payment.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px', fontSize: '14px' }}>
                          {new Date(payment.payment_date || payment.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#059669', fontWeight: '500' }}>
                          KES {parseFloat(payment.amount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>
                          <span style={{
                            backgroundColor: '#e5e7eb',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {payment.payment_method}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                          {payment.reference_code || payment.reference_number || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Extra Charges */}
          <div>
            <div style={{
              backgroundColor: '#f9fafb',
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h6 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                📋 Extra Charges
              </h6>
              <span style={{
                backgroundColor: '#fef3c7',
                color: '#92400e',
                padding: '4px 8px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {extraCharges?.length || 0} charges
              </span>
            </div>
            <div style={{ 
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderTop: 'none',
              borderBottomLeftRadius: '8px',
              borderBottomRightRadius: '8px'
            }}>
              {(!extraCharges || extraCharges.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <p style={{ color: '#6b7280' }}>No extra charges</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f59e0b', color: 'white' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Type</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Amount</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Description</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extraCharges.map((charge) => (
                      <tr key={charge.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>
                          {charge.charge_type}
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#f59e0b', fontWeight: '500' }}>
                          KES {parseFloat(charge.amount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', maxWidth: '200px' }}>
                          <div>{charge.description}</div>
                          {charge.notes && (
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                              {charge.notes}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>
                          {new Date(charge.service_date || charge.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleEditExtraCharge(charge)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                              title="Edit Charge"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteExtraCharge(charge.id)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                              title="Delete Charge"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Invoices Section */}
          <div>
            <div style={{
              backgroundColor: '#f9fafb',
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h6 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                🧾 Invoices
              </h6>
              <span style={{
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                padding: '4px 8px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {invoices?.length || 0} invoices
              </span>
            </div>
            <div style={{ 
              border: '1px solid #e5e7eb',
              borderTop: 'none',
              borderBottomLeftRadius: '8px',
              borderBottomRightRadius: '8px',
              overflowX: 'auto'
            }}>
              {(!invoices || invoices.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '32px' }}>
                  <div style={{ fontSize: '32px', color: '#d1d5db', marginBottom: '8px' }}>🧾</div>
                  <p style={{ color: '#6b7280', marginBottom: '16px' }}>No invoices generated yet</p>
                  <button
                    onClick={handleCreateSystemInvoice}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Generate First Invoice
                  </button>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#1e293b', color: 'white' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Invoice #</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Amount</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Type</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px', fontSize: '14px' }}>
                          <div style={{ fontWeight: '500' }}>{invoice.invoice_number}</div>
                          {invoice.system_generated && (
                            <span style={{
                              backgroundColor: '#6b7280',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              marginLeft: '4px'
                            }}>
                              System
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#2563eb', fontWeight: '500' }}>
                          KES {parseFloat(invoice.total_amount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>
                          <span style={{
                            backgroundColor: invoice.system_generated ? '#dbeafe' : '#fef3c7',
                            color: invoice.system_generated ? '#1e40af' : '#92400e',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {invoice.system_generated ? 'System' : 'Manual'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>
                          <span style={{
                            backgroundColor: invoice.payment_status === 'paid' ? '#d1fae5' : 
                                         invoice.payment_status === 'partial' ? '#fef3c7' : '#fee2e2',
                            color: invoice.payment_status === 'paid' ? '#065f46' : 
                                  invoice.payment_status === 'partial' ? '#92400e' : '#dc2626',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {invoice.payment_status || 'unpaid'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            <button
                              onClick={() => handleViewInvoice(invoice.id)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#dbeafe',
                                color: '#2563eb',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                              title="View Invoice"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => onEditInvoice && onEditInvoice(invoice.id)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                              title="Edit Invoice"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDownloadInvoice(invoice.id)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#d1fae5',
                                color: '#059669',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                              title="Download PDF"
                            >
                              ⬇️
                            </button>
                            <button
                              onClick={() => handlePrintInvoice(invoice.id)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#e5e7eb',
                                color: '#374151',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                              title="Print Invoice"
                            >
                              🖨️
                            </button>
                            <button
                              onClick={() => handleSendInvoice(invoice.id)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#d1fae5',
                                color: '#059669',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                              title="Send via WhatsApp"
                            >
                              📱
                            </button>
                            <button
                              onClick={() => handleDeleteInvoiceConfirm(invoice.id)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                              title="Delete Invoice"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div style={{ 
          marginTop: '24px',
          backgroundColor: '#f3f4f6',
          padding: '16px',
          borderRadius: '8px'
        }}>
          <h6 style={{ 
            color: '#2563eb',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            📊 Financial Summary
          </h6>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Base Charges</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb' }}>
                KES {safeTotals.mortuary_charges.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Extra Charges</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' }}>
                KES {safeTotals.extra_charges.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Total Paid</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>
                KES {safeTotals.total_payments.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>
                {safeTotals.balance > 0 ? 'Balance Due' : 'Fully Paid'}
              </div>
              <div style={{ 
                fontSize: '18px',
                fontWeight: 'bold',
                color: safeTotals.balance > 0 ? '#dc2626' : '#059669'
              }}>
                KES {Math.abs(safeTotals.balance).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced PDF Viewer */}
      {currentViewer === 'advanced' && (
        <AdvancedPdfViewer
          pdfUrl={currentPdfUrl}
          invoice={currentInvoice}
          onClose={() => setCurrentViewer(null)}
          onDownload={() => handleDownloadInvoice(currentInvoice.id)}
          onPrint={() => handlePrintInvoice(currentInvoice.id)}
        />
      )}
    </div>
  );
};

export default DeceasedFinancialDetails;