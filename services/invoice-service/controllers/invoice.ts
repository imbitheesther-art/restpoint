// controllers/invoice.ts
import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { AppError } from '../middlewares/errorHandler';

const { safeQuery } = require('../../configurations/sqlConfig/db');
const { getKenyaTimeISO, getKenyaTimeFormatted } = require('../../../packages/shared-utils/dist/timestamps');
const { loadTenantBranding } = require('./tenantBranding');

// Redis client for caching
let redisClient: Redis.Redis | null = null;

/**
 * Get tenant slug from request headers
 */
const getTenantSlug = (req: Request): string => {
  return (req.get('x-tenant-slug') || req.get('x-tenant-id') || 'system_shared') as string;
};

/**
 * Tenant-aware query helper - automatically passes tenant context
 */
const tenantQuery = async (req: Request, sql: string, params: any[] = []): Promise<any> => {
  return safeQuery(sql, params, getTenantSlug(req));
};

async function getRedisClient(): Promise<Redis> {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });
    redisClient.on('error', (err: Error) => console.error('Redis Client Error:', err));
  }
  return redisClient;
}

// Redis cache helper functions
async function getCachedInvoice(invoiceNumber: string): Promise<any | null> {
  try {
    const client = await getRedisClient();
    const cached = await client.get(`invoice:${invoiceNumber}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    return null;
  }
}

async function setCachedInvoice(invoiceNumber: string, data: any): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.setex(`invoice:${invoiceNumber}`, 3600, JSON.stringify(data));
  } catch (error) {
    console.error('Redis cache error:', error);
  }
}

async function deleteCachedInvoice(invoiceNumber: string): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.del(`invoice:${invoiceNumber}`);
  } catch (error) {
    console.error('Redis cache error:', error);
  }
}

export interface InvoiceItem {
  service?: string;
  description?: string;
  qty?: number;
  quantity?: number;
  unit_price?: number;
  amount?: number;
}

export interface InvoiceData {
  deceased_name: string;
  nok: string;
  admission_number: string;
  id_number: string;
  dod: string;
  date_of_admission: string;
  address: string;
  phone: string;
  items: InvoiceItem[];
  total_amount: number;
  subtotal: number;
  amount_paid: number;
  tax_amount: number;
  tax_rate: number;
  mortuary_name: string;
  mortuary_phone: string;
  stamp_hash: string;
  signature_url: string;
  created_at: string;
  invoice_number: string;
  deceased_id?: number;
  tenant_slug?: string;
  // Payment options
  payment_options?: {
    mpesa?: { business_number: string; account_number: string };
    bank_transfer?: { bank_name: string; account_name: string; account_number: string; branch: string };
    cash_cheque?: string;
    installment_plan?: boolean;
  };
}

export interface DeceasedFinancialDetails {
  deceased: any;
  nextOfKin: any[];
  payments: any[];
  extraCharges: any[];
  invoices: any[];
  coffinInfo: any;
  vehicleDispatchInfo: any;
  availableCoffins: any[];
  totals: {
    mortuary_charges: string;
    extra_charges: string;
    coffin_charges: string;
    total_charges: string;
    total_payments: string;
    balance: string;
  };
}

const generateStampHash = (prefix: string = 'LFH'): string => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${prefix}-INV-${dd}-${mm}-${yyyy}`;
};

const generateInvoicePDFBuffer = async (invoice: InvoiceData, branding: any = null): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const tenantName = branding?.tenant_name || 'Montezuma Monalisa Funeral Home';
      const tenantAddress = branding?.company_address || branding?.location || 'Mbagathi Way, Opp. Forces Memorial Hospital';
      const tenantPhone = branding?.company_phone || branding?.phone || '+254 722 268 566';
      const tenantEmail = branding?.company_email || branding?.email || 'monte2lisa@yahoo.com';
      const tenantLogo = branding?.logo_path || null;
      const tenantSignature = branding?.signature_path || null;

      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Invoice ${invoice.invoice_number}`,
          Author: tenantName,
        },
      });
      
      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const headerTop = 40;
      const logoPath = tenantLogo || path.join(__dirname, '../../public/logo/montezuma.png');

      if (logoPath && fs.existsSync(logoPath)) {
        doc.rect(45, headerTop - 5, 90, 45)
          .fill('#ffffff')
          .stroke('#e0e0e0');
        doc.image(logoPath, 50, headerTop, { width: 80 });
      } else {
        const initials = tenantName.split(' ').map((w: string) => w[0]).filter(Boolean).slice(0, 4).join('').toUpperCase() || 'FH';
        doc.rect(45, headerTop - 5, 90, 45)
          .fill('#1a5276')
          .stroke('#0f172a');
        doc.fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#ffffff')
          .text(initials, 60, headerTop + 10);
      }

      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text(tenantName.toUpperCase(), 50, headerTop + 50);

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#0f172a')
        .text(tenantAddress, 300, headerTop + 10)
        .text(tenantEmail, 300, headerTop + 25)
        .text(tenantPhone, 300, headerTop + 40);

      const detailsTop = headerTop + 100;
      const leftColumn = 50;
      const rightColumn = 300;

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#1a5276')
        .text('INVOICE DETAILS', leftColumn, detailsTop);

      doc
        .font('Helvetica')
        .fillColor('#2c3e50')
        .text(`Invoice #: ${invoice.invoice_number}`, leftColumn, detailsTop + 20)
        .text(
          `Date: ${new Date(invoice.created_at || Date.now()).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}`,
          leftColumn,
          detailsTop + 35,
        );

      doc
        .font('Helvetica-Bold')
        .fillColor('#1a5276')
        .text('CLIENT INFORMATION', rightColumn, detailsTop);

      doc
        .font('Helvetica')
        .fillColor('#2c3e50')
        .text(`Deceased: ${invoice.deceased_name || 'N/A'}`, rightColumn, detailsTop + 20)
        .text(`Admission #: ${invoice.admission_number || invoice.id_number || 'N/A'}`, rightColumn, detailsTop + 35)
        .text(`Next of Kin: ${invoice.nok || 'N/A'}`, rightColumn, detailsTop + 50)
        .text(`Date of Admission: ${invoice.date_of_admission || invoice.dod || 'N/A'}`, rightColumn, detailsTop + 65);

      const tableX = 50;
      const tableWidth = 495;
      const colServiceWidth = 230;
      const colQtyWidth = 50;
      const colUnitWidth = 90;
      const colAmountWidth = 90;
      const colServiceX = tableX + 5;
      const colQtyX = colServiceX + colServiceWidth + 5;
      const colUnitX = colQtyX + colQtyWidth + 5;
      const colAmountX = colUnitX + colUnitWidth + 5;
      const tableTop = detailsTop + 90;

      doc.rect(tableX, tableTop, tableWidth, 20).fill('#1a5276');
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#ffffff')
        .text('SERVICE / DESCRIPTION', colServiceX, tableTop + 6)
        .text('QTY', colQtyX, tableTop + 6, { width: colQtyWidth, align: 'right' })
        .text('UNIT PRICE', colUnitX, tableTop + 6, { width: colUnitWidth, align: 'right' })
        .text('AMOUNT', colAmountX, tableTop + 6, { width: colAmountWidth, align: 'right' });

      let currentY = tableTop + 20;
      const items = Array.isArray(invoice.items) ? invoice.items : [];
      const rowHeight = 22;
      const maxRowsPerPage = 15;
      let rowCount = 0;

      const drawTableRow = (item: InvoiceItem, index: number, yPos: number): number => {
        const rowColor = index % 2 === 0 ? '#f8f9f9' : '#ffffff';
        doc.rect(tableX, yPos, tableWidth, rowHeight).fill(rowColor);

        const unitPrice = parseFloat(String(item.unit_price || item.amount || 0));
        const quantity = parseFloat(String(item.qty || item.quantity || 1));
        const amount = quantity * unitPrice;

        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#000000')
          .text(item.service || item.description || 'Service', colServiceX, yPos + 6, { width: colServiceWidth, ellipsis: true })
          .text(quantity.toString(), colQtyX, yPos + 6, { width: colQtyWidth, align: 'right' })
          .text(`KES ${unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, colUnitX, yPos + 6, { width: colUnitWidth, align: 'right' })
          .text(`KES ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, colAmountX, yPos + 6, { width: colAmountWidth, align: 'right' });

        return yPos + rowHeight;
      };

      items.forEach((item, index) => {
        if (rowCount >= maxRowsPerPage) {
          doc.addPage();
          currentY = 50;
          rowCount = 0;
          doc.rect(tableX, currentY, tableWidth, 20).fill('#1a5276');
          doc
            .fontSize(9)
            .font('Helvetica-Bold')
            .fillColor('#ffffff')
            .text('SERVICE / DESCRIPTION', colServiceX, currentY + 6)
            .text('QTY', colQtyX, currentY + 6, { width: colQtyWidth, align: 'right' })
            .text('UNIT PRICE', colUnitX, currentY + 6, { width: colUnitWidth, align: 'right' })
            .text('AMOUNT', colAmountX, currentY + 6, { width: colAmountWidth, align: 'right' });
          currentY += 20;
        }
        currentY = drawTableRow(item, index, currentY);
        rowCount++;
      });

      if (items.length < 3) {
        for (let i = items.length; i < 3; i++) {
          const rowColor = i % 2 === 0 ? '#f8f9f9' : '#ffffff';
          doc.rect(tableX, currentY, tableWidth, rowHeight).fill(rowColor);
          currentY += rowHeight;
          rowCount++;
        }
      }

      const totalsTop = currentY + 20;
      const pageWidth = 595;
      const margin = 50;
      const usableWidth = pageWidth - margin * 2;
      const columnWidth = usableWidth / 2;
      const leftBoxX = margin;
      const leftBoxWidth = columnWidth;
      const leftBoxHeight = 100;
      const rightBoxX = margin + columnWidth;
      const rightBoxWidth = columnWidth;
      const rightBoxHeight = 100;

      doc.rect(leftBoxX, totalsTop, leftBoxWidth, leftBoxHeight).fill('#f8f9f9').stroke('#bdc3c7');
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#1a5276').text('PAYMENT STATUS', leftBoxX + 10, totalsTop + 10);

      const totalAmount = parseFloat(String(invoice.total_amount || 0));
      const amountPaid = parseFloat(String(invoice.amount_paid || 0));
      const balance = totalAmount - amountPaid;

      let paymentStatus = 'PENDING';
      let statusColor = '#e23b28';
      let statusBg = '#fadbd8';

      if (balance <= 0) {
        paymentStatus = 'FULLY PAID';
        statusColor = '#27ae60';
        statusBg = '#d5f4e6';
      } else if (amountPaid > 0) {
        paymentStatus = 'PARTIAL';
        statusColor = '#f39c12';
        statusBg = '#fef9e7';
      }

      doc.rect(leftBoxX + 10, totalsTop + 22, 50, 15).fill(statusBg);
      doc.fontSize(8).font('Helvetica-Bold').fillColor(statusColor).text(paymentStatus, leftBoxX + 15, totalsTop + 26);
      doc.fontSize(8).font('Helvetica').fillColor('#2c3e50')
        .text(`Paid: KES ${amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, leftBoxX + 10, totalsTop + 45)
        .text(`Balance: KES ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, leftBoxX + 10, totalsTop + 60);

      doc.rect(rightBoxX, totalsTop, rightBoxWidth, rightBoxHeight).fill('#f8f9f9').stroke('#bdc3c7');
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#1a5276').text('INVOICE TOTALS', rightBoxX + 10, totalsTop + 10);

      const subtotal = parseFloat(String(invoice.subtotal || invoice.total_amount || 0));
      doc.fontSize(8).font('Helvetica').fillColor('#2c3e50').text('SUBTOTAL:', rightBoxX + 10, totalsTop + 30);
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#2c3e50')
        .text(`KES ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, rightBoxX + 80, totalsTop + 30, { width: 80, align: 'right' });

      // Tax line
      const taxAmount = parseFloat(String(invoice.tax_amount || 0));
      if (taxAmount > 0) {
        doc.fontSize(8).font('Helvetica').fillColor('#2c3e50')
          .text(`TAX (${(invoice.tax_rate || 0)}%):`, rightBoxX + 10, totalsTop + 45)
          .text(`KES ${taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, rightBoxX + 80, totalsTop + 45, { width: 80, align: 'right' });
        doc.strokeColor('#1a5276').lineWidth(0.5).moveTo(rightBoxX + 10, totalsTop + 58).lineTo(rightBoxX + 170, totalsTop + 58).stroke();
      } else {
        doc.strokeColor('#1a5276').lineWidth(0.5).moveTo(rightBoxX + 10, totalsTop + 45).lineTo(rightBoxX + 170, totalsTop + 45).stroke();
      }

      doc.fontSize(9).font('Helvetica-Bold').fillColor('#1a5276').text('TOTAL:', rightBoxX + 10, totalsTop + 55);
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#1a5276')
        .text(`KES ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, rightBoxX + 80, totalsTop + 55, { width: 80, align: 'right' });

      const footerTop = Math.max(totalsTop + leftBoxHeight, totalsTop + rightBoxHeight) + 30;
      const pageHeight = 842;
      if (footerTop > pageHeight - 120) {
        doc.addPage();
        currentY = 50;
      }

      doc.strokeColor('#001EFF').lineWidth(1).moveTo(50, footerTop).lineTo(545, footerTop).stroke();

      const stamp = invoice.stamp_hash || generateStampHash().toUpperCase();
      doc.fontSize(6).font('Helvetica').fillColor('#001EFF')
        .text(`Verification: ${stamp.substring(0, 24)}`, 50, footerTop + 8)
        .text(`Generated: ${new Date().toLocaleString('en-GB')}`, 50, footerTop + 18);

      doc.fontSize(7).font('Helvetica').fillColor('#2c3e50')
        .text(`Thank you for choosing ${tenantName}. For inquiries:`, 50, footerTop + 35, { width: 300 });
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#1a5276')
        .text(`${tenantPhone} | ${tenantEmail}`, 50, footerTop + 50, { width: 300 });

      const signaturePath = tenantSignature || path.join(__dirname, '../../uploads/signature/signature.png');
      if (signaturePath && fs.existsSync(signaturePath)) {
        doc.image(signaturePath, 400, footerTop + 25, { width: 50, height: 25 });
      } else {
        doc.strokeColor('#1a5276').lineWidth(0.5).moveTo(400, footerTop + 37).lineTo(450, footerTop + 37).stroke();
      }

      doc.fontSize(7).fillColor('#1a5276')
        .text('Authorized Signature', 400, footerTop + 55)
        .fontSize(6).text(tenantName, 400, footerTop + 65);

      const termsY = footerTop + 80;
      
      // Payment Options Section
      const paymentOptionsY = termsY + 30;
      if (paymentOptionsY < pageHeight - 80) {
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#1a5276')
          .text('PAYMENT OPTIONS', 50, paymentOptionsY);
        
        let optionY = paymentOptionsY + 15;
        const optionLineHeight = 12;
        
        // MPESA
        if (invoice.payment_options?.mpesa) {
          doc.fontSize(7).font('Helvetica').fillColor('#2c3e50')
            .text(`MPESA Paybill: ${invoice.payment_options.mpesa.business_number} | Account: ${invoice.payment_options.mpesa.account_number}`, 50, optionY);
          optionY += optionLineHeight;
        }
        
        // Bank Transfer
        if (invoice.payment_options?.bank_transfer) {
          const bank = invoice.payment_options.bank_transfer;
          doc.fontSize(7).font('Helvetica').fillColor('#2c3e50')
            .text(`Bank: ${bank.bank_name} | A/C: ${bank.account_number} (${bank.account_name}) | Branch: ${bank.branch}`, 50, optionY);
          optionY += optionLineHeight;
        }
        
        // Cash/Cheque
        if (invoice.payment_options?.cash_cheque) {
          doc.fontSize(7).font('Helvetica').fillColor('#2c3e50')
            .text(`Cash/Cheque: ${invoice.payment_options.cash_cheque}`, 50, optionY);
          optionY += optionLineHeight;
        }
        
        // Installment Plan
        if (invoice.payment_options?.installment_plan) {
          doc.fontSize(7).font('Helvetica').fillColor('#2c3e50')
            .text('Installment Plan: Available - Please contact us for flexible payment arrangements', 50, optionY);
          optionY += optionLineHeight;
        }
        
        // Default payment info if no options specified
        if (!invoice.payment_options || Object.keys(invoice.payment_options).length === 0) {
          doc.fontSize(7).font('Helvetica').fillColor('#2c3e50')
            .text(`MPESA Paybill: ${tenantPhone} | Bank: Contact us for details | Cash: Accepted at our office`, 50, optionY);
          optionY += optionLineHeight;
        }
      }

      if (termsY < pageHeight - 20) {
        doc.fontSize(6).fillColor('#2c3e50')
          .text('This invoice is computer generated and does not require a physical signature.', 50, termsY, { align: 'center', width: 495 })
          .text(`All payments should be made to ${tenantName} bank account as indicated above.`, 50, termsY + 8, { align: 'center', width: 495 })
          .text('Please retain this invoice for your records.', 50, termsY + 16, { align: 'center', width: 495 });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export const getAllDeceasedWithFinancials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const sql = `
    SELECT 
      d.id, d.deceased_id, d.full_name, d.date_of_death, d.cause_of_death, d.place_of_death,
      d.gender, d.county, d.location, d.billing, d.status, d.date_admitted, d.admission_number,
      nk.full_name as nok_name, nk.relationship as nok_relationship, nk.contact as nok_contact,
      dc.coffin_id, c.custom_id AS coffin_custom_id, c.type AS coffin_type, c.exact_price AS coffin_price,
      vd.dispatch_id, vd.vehicle_plate, vd.dispatch_date, vd.status AS vehicle_status,
      COALESCE(SUM(p.amount), 0) AS total_payments,
      COALESCE(SUM(ec.amount), 0) + COALESCE(c.exact_price, 0) + COALESCE(d.billing, 0) AS total_charges,
      (COALESCE(d.billing, 0) + COALESCE(SUM(ec.amount), 0) + COALESCE(c.exact_price, 0) - COALESCE(SUM(p.amount), 0)) AS balance
    FROM deceased d
    LEFT JOIN next_of_kin nk ON d.deceased_id = nk.deceased_id
    LEFT JOIN payments p ON d.id = p.deceased_id
    LEFT JOIN extra_charges ec ON d.deceased_id = ec.deceased_id
    LEFT JOIN deceased_coffin dc ON d.deceased_id = dc.deceased_id
    LEFT JOIN coffins c ON dc.coffin_id = c.coffin_id
    LEFT JOIN vehicle_dispatch vd ON d.deceased_id = vd.deceased_id
    GROUP BY d.id
    ORDER BY d.date_registered DESC;
  `;
  const deceased = await tenantQuery(req, sql);
  res.json({ status: 'success', data: deceased });
};

export const getDeceasedFinancialDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { deceased_id } = req.params;

  const deceasedSql = `
    SELECT d.*, nk.full_name as nok_name, nk.relationship, nk.contact, nk.email
    FROM deceased d
    LEFT JOIN next_of_kin nk ON d.deceased_id = nk.deceased_id
    WHERE d.id = ?
  `;
  const [deceased] = await tenantQuery(req, deceasedSql, [deceased_id]);

  if (!deceased) {
    throw new AppError('Deceased not found', 404);
  }

  const stringDeceasedId = deceased.deceased_id;
  const payments = await tenantQuery(req, 'SELECT * FROM payments WHERE deceased_id = ? ORDER BY payment_date DESC', [deceased_id]);
  const invoices = await tenantQuery(req, 'SELECT * FROM invoices WHERE deceased_id = ? ORDER BY created_at DESC', [deceased_id]);
  const extraCharges = await tenantQuery(req, 'SELECT * FROM extra_charges WHERE deceased_id = ? ORDER BY created_at DESC', [stringDeceasedId]);
  const nextOfKin = await tenantQuery(req, 'SELECT * FROM next_of_kin WHERE deceased_id = ?', [stringDeceasedId]);

  let coffinInfo: any = null;
  const coffinDetails = await tenantQuery(req, `
    SELECT dc.*, c.custom_id, c.type, c.category, c.material, c.exact_price,
           c.currency, c.status AS coffin_status, c.color, c.size, c.supplier, c.origin
    FROM deceased_coffin dc
    LEFT JOIN coffins c ON dc.coffin_id = c.coffin_id
    WHERE dc.deceased_id = ?
  `, [stringDeceasedId]);
  if (coffinDetails && coffinDetails.length > 0) coffinInfo = coffinDetails[0];

  let vehicleDispatchInfo: any = null;
  const vehicleDetails = await tenantQuery(req, 'SELECT * FROM vehicle_dispatch WHERE deceased_id = ?', [stringDeceasedId]);
  if (vehicleDetails && vehicleDetails.length > 0) vehicleDispatchInfo = vehicleDetails[0];

  const availableCoffins = await tenantQuery(req, `
    SELECT coffin_id, custom_id, type, category, material, exact_price, currency, status
    FROM coffins WHERE status = 'in-stock' ORDER BY created_at DESC
  `);

  const totalPayments = payments.reduce((sum: number, payment: any) => sum + parseFloat(String(payment.amount || 0)), 0);
  const totalExtraCharges = extraCharges.reduce((sum: number, charge: any) => sum + parseFloat(String(charge.amount || 0)), 0);
  const mortuaryCharges = parseFloat(String(deceased.billing || 0));
  const coffinCharge = parseFloat(String(coffinInfo?.exact_price || 0));
  const totalCharges = mortuaryCharges + totalExtraCharges + coffinCharge;
  const balance = totalCharges - totalPayments;

  const financialSummary: DeceasedFinancialDetails = {
    deceased,
    nextOfKin,
    payments,
    extraCharges,
    invoices: invoices.map((inv: any) => ({
      ...inv,
      items: typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items,
    })),
    coffinInfo,
    vehicleDispatchInfo,
    availableCoffins,
    totals: {
      mortuary_charges: mortuaryCharges.toFixed(2),
      extra_charges: totalExtraCharges.toFixed(2),
      coffin_charges: coffinCharge.toFixed(2),
      total_charges: totalCharges.toFixed(2),
      total_payments: totalPayments.toFixed(2),
      balance: balance.toFixed(2),
    },
  };

  res.json({ status: 'success', data: financialSummary });
};

export const createPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { deceased_id, amount, payment_method, reference_code, description } = req.body;

  if (!deceased_id || !amount || !payment_method) {
    throw new AppError('Missing required payment fields', 400);
  }

  const result = await tenantQuery(req, `
    INSERT INTO payments (deceased_id, amount, payment_method, reference_code, description, payment_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    deceased_id,
    amount,
    payment_method,
    reference_code || `PAY-${Date.now()}`,
    description || 'Mortuary Services Payment',
    getKenyaTimeISO(),
  ]);

  res.status(201).json({
    status: 'success',
    message: 'Payment recorded successfully',
    payment_id: (result as any).insertId,
  });
};

export const createExtraCharge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { deceased_id, charge_type, amount, description, notes, service_date } = req.body;

  if (!deceased_id || !charge_type || !amount) {
    throw new AppError('Missing required charge fields', 400);
  }

  const [deceased] = await tenantQuery(req, 'SELECT deceased_id FROM deceased WHERE id = ?', [deceased_id]);
  if (!deceased) {
    throw new AppError('Deceased not found', 404);
  }

  const result = await tenantQuery(req, `
    INSERT INTO extra_charges (deceased_id, charge_type, amount, description, notes, service_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    (deceased as any).deceased_id,
    charge_type,
    amount,
    description,
    notes || '',
    service_date || getKenyaTimeISO(),
    getKenyaTimeISO(),
  ]);

  res.status(201).json({
    status: 'success',
    message: 'Extra charge added successfully',
    charge_id: (result as any).insertId,
  });
};

export const createSystemInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { deceased_id } = req.body;

  if (!deceased_id) {
    throw new AppError('Deceased ID is required', 400);
  }

  const [deceased] = await tenantQuery(req, `
    SELECT d.*, nk.full_name as nok_name, nk.relationship, nk.contact, nk.email
    FROM deceased d
    LEFT JOIN next_of_kin nk ON d.deceased_id = nk.deceased_id
    WHERE d.id = ?
  `, [deceased_id]);

  if (!deceased) {
    throw new AppError('Deceased not found', 404);
  }

  const [paymentResult] = await tenantQuery(req, 'SELECT SUM(amount) as total_paid FROM payments WHERE deceased_id = ?', [deceased_id]);
  const amountPaid = parseFloat((paymentResult as any)?.total_paid || 0);

  const extraCharges = await tenantQuery(req, `
    SELECT * FROM extra_charges 
    WHERE deceased_id = ? AND (status IS NULL OR status != "Paid")
  `, [(deceased as any).deceased_id]);

  const systemItems: InvoiceItem[] = [];
  let systemTotal = 0;

  if ((deceased as any).billing && (deceased as any).billing > 0) {
    systemItems.push({
      service: 'Basic Mortuary Services',
      qty: 1,
      amount: parseFloat(String((deceased as any).billing)),
      description: 'Standard mortuary care and maintenance',
    });
    systemTotal += parseFloat(String((deceased as any).billing));
  }

  extraCharges.forEach((charge: any) => {
    systemItems.push({
      service: charge.charge_type,
      qty: 1,
      amount: parseFloat(String(charge.amount)),
      description: charge.description || charge.notes || charge.charge_type,
    });
    systemTotal += parseFloat(String(charge.amount));
  });

  const coffinDetails = await tenantQuery(req, `
    SELECT dc.*, c.type, c.category, c.exact_price
    FROM deceased_coffin dc
    LEFT JOIN coffins c ON dc.coffin_id = c.coffin_id
    WHERE dc.deceased_id = ?
  `, [(deceased as any).deceased_id]);

  if (coffinDetails.length > 0) {
    const coffin = coffinDetails[0];
    const coffinPrice = parseFloat(String(coffin.exact_price || 0));
    if (coffinPrice > 0) {
      systemItems.push({
        service: `Coffin: ${coffin.type} (${coffin.category})`,
        qty: 1,
        amount: coffinPrice,
        description: 'Assigned coffin',
      });
      systemTotal += coffinPrice;
    }
  }

  const vehicleDispatch = await tenantQuery(req, 'SELECT * FROM vehicle_dispatch WHERE deceased_id = ?', [(deceased as any).deceased_id]);
  if (vehicleDispatch.length > 0) {
    vehicleDispatch.forEach((vd: any) => {
      const dispatchCost = 5000;
      systemItems.push({
        service: `Vehicle Dispatch: ${vd.vehicle_plate}`,
        qty: 1,
        amount: dispatchCost,
        description: `Driver: ${vd.driver_name || 'N/A'}`,
      });
      systemTotal += dispatchCost;
    });
  }

  if (systemItems.length === 0) {
    systemItems.push(
      { service: 'Mortuary Services', qty: 1, amount: 0, description: 'Basic mortuary care' },
      { service: 'Default Care and Maintenance', qty: 1, amount: 0, description: 'Daily maintenance' }
    );
    systemTotal = 0;
  }

  const tenantSlug = getTenantSlug(req);
  const branding = await loadTenantBranding(tenantSlug, null);

  const stampPrefix = branding.invoice_prefix?.split('-')[0] || 'SYS';
  const stamp_hash = generateStampHash(stampPrefix);
  const invoice_number = `${branding.invoice_prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  const invoiceData: InvoiceData = {
    deceased_name: (deceased as any).full_name,
    nok: (deceased as any).nok_name || 'N/A',
    admission_number: (deceased as any).admission_number || (deceased as any).deceased_id,
    id_number: (deceased as any).national_id || 'N/A',
    dod: (deceased as any).date_of_death ? new Date((deceased as any).date_of_death).toLocaleDateString('en-GB') : 'N/A',
    date_of_admission: (deceased as any).date_admitted ? new Date((deceased as any).date_admitted).toLocaleDateString('en-GB') : 'N/A',
    address: `${(deceased as any).location || 'N/A'}, ${(deceased as any).county || 'N/A'}`,
    phone: (deceased as any).nok_contact || 'N/A',
    items: systemItems,
    total_amount: systemTotal,
    subtotal: systemTotal,
    amount_paid: amountPaid,
    tax_amount: 0,
    tax_rate: 0,
    mortuary_name: branding.tenant_name,
    mortuary_phone: branding.phone,
    stamp_hash,
    signature_url: branding.signature_path || '/uploads/signature/signature.png',
    created_at: getKenyaTimeISO(),
    invoice_number,
    deceased_id: (deceased as any).id,
    tenant_slug: tenantSlug,
  };

  const pdfBuffer = await generateInvoicePDFBuffer(invoiceData, branding);
  const baseInvoicesDir = path.join(__dirname, '../../uploads/invoices');
  if (!fs.existsSync(baseInvoicesDir)) fs.mkdirSync(baseInvoicesDir, { recursive: true });

  const deceasedFolderName = `${(deceased as any).full_name.replace(/[^a-zA-Z0-9]/g, '_')}_${(deceased as any).id}`;
  const deceasedInvoicesDir = path.join(baseInvoicesDir, deceasedFolderName);
  if (!fs.existsSync(deceasedInvoicesDir)) fs.mkdirSync(deceasedInvoicesDir, { recursive: true });

  const pdfPath = path.join(deceasedInvoicesDir, `${invoice_number}.pdf`);
  await fs.promises.writeFile(pdfPath, pdfBuffer);

  const result = await tenantQuery(req, `
    INSERT INTO invoices (deceased_id, invoice_number, items, total_amount, pdf_url, stamp_hash, signature_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    (deceased as any).id,
    invoice_number,
    JSON.stringify(invoiceData.items),
    invoiceData.total_amount,
    pdfPath,
    invoiceData.stamp_hash,
    invoiceData.signature_url,
    invoiceData.created_at,
  ]);

  await tenantQuery(req, `
    UPDATE extra_charges SET status = 'Paid' 
    WHERE deceased_id = ? AND (status IS NULL OR status = "Pending")
  `, [(deceased as any).deceased_id]);

  await setCachedInvoice(invoice_number, invoiceData);

  res.status(201).json({
    status: 'success',
    message: 'System invoice created successfully',
    invoice_number,
    pdf_url: pdfPath,
    invoice_id: (result as any).insertId,
    deceased_folder: deceasedFolderName,
    system_generated: true,
  });
};

export const createInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const {
    deceased_id,
    invoice_number,
    items,
    total_amount,
    subtotal,
    tax_amount,
    tax_rate,
    signature_url,
    deceased_name,
    nok,
    admission_number,
    dod,
    address,
    phone,
  } = req.body;

  if (!deceased_name || !invoice_number || !items || !total_amount) {
    throw new AppError('Missing required invoice fields', 400);
  }

  const stamp_hash = generateStampHash();

  const invoiceData: InvoiceData = {
    deceased_name,
    nok: nok || 'N/A',
    admission_number: admission_number || 'N/A',
    id_number: admission_number || 'N/A',
    dod: dod || 'N/A',
    date_of_admission: 'N/A',
    address: address || 'N/A',
    phone: phone || 'N/A',
    items: Array.isArray(items) ? items : JSON.parse(items),
    total_amount: parseFloat(String(total_amount)),
    subtotal: parseFloat(String(subtotal || total_amount)),
    amount_paid: 0,
    tax_amount: parseFloat(String(tax_amount || 0)),
    tax_rate: parseFloat(String(tax_rate || 0)),
    mortuary_name: 'Lee Funeral Home',
    mortuary_phone: '+254 740 045 355',
    stamp_hash,
    signature_url: signature_url || '/uploads/signature/signature.png',
    created_at: getKenyaTimeISO(),
    invoice_number,
  };

  const pdfBuffer = await generateInvoicePDFBuffer(invoiceData);
  const baseInvoicesDir = path.join(__dirname, '../../uploads/invoices');
  if (!fs.existsSync(baseInvoicesDir)) fs.mkdirSync(baseInvoicesDir, { recursive: true });

  const deceasedFolderName = `${deceased_name.replace(/[^a-zA-Z0-9]/g, '_')}_${admission_number || Date.now()}`;
  const deceasedInvoicesDir = path.join(baseInvoicesDir, deceasedFolderName);
  if (!fs.existsSync(deceasedInvoicesDir)) fs.mkdirSync(deceasedInvoicesDir, { recursive: true });

  const pdfPath = path.join(deceasedInvoicesDir, `${invoice_number}.pdf`);
  await fs.promises.writeFile(pdfPath, pdfBuffer);

  const result = await tenantQuery(req, `
    INSERT INTO invoices (deceased_id, invoice_number, items, total_amount, pdf_url, stamp_hash, signature_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    deceased_id || null,
    invoice_number,
    JSON.stringify(invoiceData.items),
    invoiceData.total_amount,
    pdfPath,
    stamp_hash,
    invoiceData.signature_url,
    invoiceData.created_at,
  ]);

  await setCachedInvoice(invoice_number, invoiceData);

  res.status(201).json({
    status: 'success',
    message: 'Invoice created successfully',
    invoice_number,
    pdf_url: pdfPath,
    invoice_id: (result as any).insertId,
    deceased_folder: deceasedFolderName,
  });
};

export const getAllInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const invoices = await tenantQuery(req, `
    SELECT i.*, d.full_name as deceased_name, d.deceased_id, d.admission_number, d.date_of_death, nk.full_name as nok_name
    FROM invoices i
    LEFT JOIN deceased d ON i.deceased_id = d.id
    LEFT JOIN next_of_kin nk ON d.deceased_id = nk.deceased_id
    ORDER BY i.created_at DESC
  `);

  const parsedInvoices = invoices.map((invoice: any) => ({
    ...invoice,
    items: typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items,
    deceased_name: invoice.deceased_name || 'Unknown',
    admission_number: invoice.admission_number || invoice.deceased_id || 'N/A',
    nok: invoice.nok_name || 'N/A',
  }));

  res.json({ status: 'success', data: parsedInvoices });
};

export const getInvoicesByDeceased = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { deceased_id } = req.params;
  const invoices = await tenantQuery(req, `
    SELECT i.*, d.full_name as deceased_name, d.deceased_id, d.admission_number, d.date_of_death, nk.full_name as nok_name
    FROM invoices i
    LEFT JOIN deceased d ON i.deceased_id = d.id
    LEFT JOIN next_of_kin nk ON d.deceased_id = nk.deceased_id
    WHERE i.deceased_id = ? ORDER BY i.created_at DESC
  `, [deceased_id]);

  const parsedInvoices = invoices.map((invoice: any) => ({
    ...invoice,
    items: typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items,
    deceased_name: invoice.deceased_name || 'Unknown',
    admission_number: invoice.admission_number || invoice.deceased_id || 'N/A',
    nok: invoice.nok_name || 'N/A',
  }));

  res.json({ status: 'success', data: parsedInvoices });
};

export const getInvoiceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const invoices = await tenantQuery(req, `
    SELECT i.*, d.full_name as deceased_name, d.deceased_id, d.admission_number, d.date_of_death,
           d.date_admitted, d.location, d.county, d.national_id, nk.full_name as nok_name,
           nk.contact as nok_contact, COALESCE(SUM(p.amount), 0) as amount_paid
    FROM invoices i
    LEFT JOIN deceased d ON i.deceased_id = d.id
    LEFT JOIN next_of_kin nk ON d.deceased_id = nk.deceased_id
    LEFT JOIN payments p ON d.id = p.deceased_id
    WHERE i.id = ? GROUP BY i.id
  `, [id]);

  if (invoices.length === 0) {
    throw new AppError('Invoice not found', 404);
  }

  const invoice = invoices[0];
  invoice.items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items;
  invoice.amount_paid = parseFloat(String(invoice.amount_paid || 0));
  invoice.deceased_name = invoice.deceased_name || 'Unknown';
  invoice.admission_number = invoice.admission_number || invoice.deceased_id || 'N/A';
  invoice.nok = invoice.nok_name || 'N/A';
  invoice.id_number = invoice.national_id || 'N/A';
  invoice.dod = invoice.date_of_death ? new Date(invoice.date_of_death).toLocaleDateString('en-GB') : 'N/A';
  invoice.date_of_admission = invoice.date_admitted ? new Date(invoice.date_admitted).toLocaleDateString('en-GB') : 'N/A';
  invoice.address = `${invoice.location || 'N/A'}, ${invoice.county || 'N/A'}`;
  invoice.phone = invoice.nok_contact || 'N/A';

  res.json({ status: 'success', data: invoice });
};

export const updateInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { items, total_amount, signature_url } = req.body;

  const [currentInvoice] = await tenantQuery(req, 'SELECT * FROM invoices WHERE id = ?', [id]);
  if (!currentInvoice) {
    throw new AppError('Invoice not found', 404);
  }

  const [deceased] = await tenantQuery(req, `
    SELECT d.*, nk.full_name as nok_name, nk.contact as nok_contact
    FROM deceased d
    LEFT JOIN next_of_kin nk ON d.deceased_id = nk.deceased_id
    WHERE d.id = ?
  `, [(currentInvoice as any).deceased_id]);

  const stamp_hash = generateStampHash();

  const updatedInvoice = {
    ...(currentInvoice as any),
    items: items || JSON.parse((currentInvoice as any).items),
    total_amount: total_amount || (currentInvoice as any).total_amount,
    signature_url: signature_url || (currentInvoice as any).signature_url,
    stamp_hash,
    updated_at: getKenyaTimeISO(),
  };

  const pdfData = {
    ...updatedInvoice,
    deceased_name: (deceased as any)?.full_name || 'Unknown',
    admission_number: (deceased as any)?.admission_number || (deceased as any)?.deceased_id || 'N/A',
    nok: (deceased as any)?.nok_name || 'N/A',
    id_number: (deceased as any)?.national_id || 'N/A',
    dod: (deceased as any)?.date_of_death ? new Date((deceased as any).date_of_death).toLocaleDateString('en-GB') : 'N/A',
    date_of_admission: (deceased as any)?.date_admitted ? new Date((deceased as any).date_admitted).toLocaleDateString('en-GB') : 'N/A',
    address: `${(deceased as any)?.location || 'N/A'}, ${(deceased as any)?.county || 'N/A'}`,
    phone: (deceased as any)?.nok_contact || 'N/A',
    mortuary_name: 'Lee Funeral Home',
    mortuary_phone: '+254 740 045 355',
  };

  const pdfBuffer = await generateInvoicePDFBuffer(pdfData);
  await fs.promises.writeFile((currentInvoice as any).pdf_url, pdfBuffer);

  await tenantQuery(req, `
    UPDATE invoices SET items = ?, total_amount = ?, signature_url = ?, stamp_hash = ?, updated_at = ?
    WHERE id = ?
  `, [
    JSON.stringify(updatedInvoice.items),
    updatedInvoice.total_amount,
    updatedInvoice.signature_url,
    updatedInvoice.stamp_hash,
    updatedInvoice.updated_at,
    id,
  ]);

  await deleteCachedInvoice((currentInvoice as any).invoice_number);

  res.json({
    status: 'success',
    message: 'Invoice updated successfully',
    invoice: updatedInvoice,
  });
};

export const deleteInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  const [invoice] = await tenantQuery(req, 'SELECT * FROM invoices WHERE id = ?', [id]);
  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  // Delete PDF file if it exists
  if ((invoice as any).pdf_url && fs.existsSync((invoice as any).pdf_url)) {
    fs.unlinkSync((invoice as any).pdf_url);
  }

  await tenantQuery(req, 'DELETE FROM invoices WHERE id = ?', [id]);
  await deleteCachedInvoice((invoice as any).invoice_number);

  res.json({
    status: 'success',
    message: 'Invoice deleted successfully',
  });
};

export const getInvoicePDF = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  const invoices = await tenantQuery(req, `
    SELECT i.*, d.full_name as deceased_name, d.deceased_id, d.admission_number, d.date_of_death,
           d.date_admitted, d.location, d.county, d.national_id, nk.full_name as nok_name,
           nk.contact as nok_contact, COALESCE(SUM(p.amount), 0) as amount_paid
    FROM invoices i
    LEFT JOIN deceased d ON i.deceased_id = d.id
    LEFT JOIN next_of_kin nk ON d.deceased_id = nk.deceased_id
    LEFT JOIN payments p ON d.id = p.deceased_id
    WHERE i.id = ? GROUP BY i.id
  `, [id]);

  if (invoices.length === 0) {
    throw new AppError('Invoice not found', 404);
  }

  const invoice = invoices[0];
  invoice.items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items;

  const branding = await loadTenantBranding(getTenantSlug(req), null);

  const pdfData: InvoiceData = {
    deceased_name: invoice.deceased_name || 'Unknown',
    nok: invoice.nok_name || 'N/A',
    admission_number: invoice.admission_number || invoice.deceased_id || 'N/A',
    id_number: invoice.national_id || 'N/A',
    dod: invoice.date_of_death ? new Date(invoice.date_of_death).toLocaleDateString('en-GB') : 'N/A',
    date_of_admission: invoice.date_admitted ? new Date(invoice.date_admitted).toLocaleDateString('en-GB') : 'N/A',
    address: `${invoice.location || 'N/A'}, ${invoice.county || 'N/A'}`,
    phone: invoice.nok_contact || 'N/A',
    items: invoice.items,
    total_amount: parseFloat(String(invoice.total_amount || 0)),
    subtotal: parseFloat(String(invoice.total_amount || 0)),
    amount_paid: parseFloat(String(invoice.amount_paid || 0)),
    tax_amount: 0,
    tax_rate: 0,
    mortuary_name: branding.tenant_name,
    mortuary_phone: branding.phone,
    stamp_hash: invoice.stamp_hash,
    signature_url: invoice.signature_url,
    created_at: invoice.created_at,
    invoice_number: invoice.invoice_number,
  };

  const pdfBuffer = await generateInvoicePDFBuffer(pdfData, branding);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${invoice.invoice_number}.pdf"`);
  res.send(pdfBuffer);
};