import ExcelJS from 'exceljs';

export interface ITenantTheme {
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
  accentColor?: string;
  headerBgColor?: string;
  footerBgColor?: string;
}

export interface IExportOptions {
  period: 'month' | 'quarter' | 'half_year' | 'year' | 'custom' | 'all';
  startDate?: string;
  endDate?: string;
  tenantTheme?: ITenantTheme;
  format?: 'xlsx' | 'csv';
}

export class ExcelExportService {
  private static instance: ExcelExportService;
  private tenantThemes: Map<string, ITenantTheme> = new Map();

  private constructor() {
    this.initializeTenantThemes();
  }

  public static getInstance(): ExcelExportService {
    if (!ExcelExportService.instance) {
      ExcelExportService.instance = new ExcelExportService();
    }
    return ExcelExportService.instance;
  }

  private initializeTenantThemes(): void {
    this.tenantThemes.set('abc-mortuary', {
      primaryColor: '#1E293B',
      secondaryColor: '#3B82F6',
      companyName: 'ABC Mortuary Services',
      accentColor: '#EF4444',
      headerBgColor: '#1E293B',
      footerBgColor: '#334155'
    });

    this.tenantThemes.set('xyz-funeral', {
      primaryColor: '#2D3748',
      secondaryColor: '#805AD5',
      companyName: 'XYZ Funeral Home',
      accentColor: '#E53E3E',
      headerBgColor: '#2D3748',
      footerBgColor: '#4A5568'
    });

    this.tenantThemes.set('lee-funeral', {
      primaryColor: '#0F172A',
      secondaryColor: '#0EA5E9',
      companyName: 'Lee Funeral Home',
      accentColor: '#10B981',
      headerBgColor: '#0F172A',
      footerBgColor: '#1E293B'
    });
  }

  getTenantTheme(tenantSlug: string): ITenantTheme {
    return this.tenantThemes.get(tenantSlug) || {
      primaryColor: '#1E293B',
      secondaryColor: '#3B82F6',
      companyName: tenantSlug.replace(/-/g, ' ').toUpperCase(),
      accentColor: '#EF4444',
      headerBgColor: '#1E293B',
      footerBgColor: '#334155'
    };
  }

  private hexToExcelColor(hexColor: string | undefined): string {
    if (!hexColor) return 'FF1E293B';
    return hexColor.replace('#', 'FF');
  }

  async generateDeceasedReport(records: any[], options: IExportOptions): Promise<Buffer> {
    const theme = options.tenantTheme || this.getTenantTheme('default');
    const workbook = new ExcelJS.Workbook();
    const periodLabel = this.getPeriodLabel(options);

    const worksheet = workbook.addWorksheet('Deceased Records', {
      pageSetup: {
        orientation: 'landscape',
        fitToPage: true,
        margins: {
          left: 0.7,
          right: 0.7,
          top: 0.75,
          bottom: 0.75,
          header: 0.3,
          footer: 0.3
        }
      }
    });

    this.addHeader(worksheet, theme, periodLabel);
    this.addSummarySection(worksheet, records, theme);
    this.addDataTable(worksheet, records, theme);
    this.addFooter(worksheet, theme, periodLabel);

    worksheet.columns.forEach(column => {
      column.width = column.width || 15;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private addHeader(worksheet: ExcelJS.Worksheet, theme: ITenantTheme, periodLabel: string): void {
    const titleRow = worksheet.addRow([]);
    worksheet.mergeCells(`A${titleRow.number}:U${titleRow.number}`);
    titleRow.height = 50;

    const titleCell = titleRow.getCell(1);
    titleCell.value = `${theme.companyName} | DECEASED RECORDS REPORT`;
    titleCell.font = {
      name: 'Arial',
      size: 20,
      bold: true,
      color: { argb: this.hexToExcelColor('#FFFFFF') }
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: this.hexToExcelColor(theme.primaryColor) }
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    const subHeaderRow = worksheet.addRow([]);
    worksheet.mergeCells(`A${subHeaderRow.number}:U${subHeaderRow.number}`);
    subHeaderRow.height = 30;

    const subHeaderCell = subHeaderRow.getCell(1);
    subHeaderCell.value = `Period: ${periodLabel} | Generated: ${new Date().toLocaleString()}`;
    subHeaderCell.font = {
      name: 'Arial',
      size: 12,
      bold: true,
      color: { argb: this.hexToExcelColor('#FFFFFF') }
    };
    subHeaderCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: this.hexToExcelColor(theme.headerBgColor || theme.primaryColor) }
    };
    subHeaderCell.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.addRow([]);
  }

  private addSummarySection(worksheet: ExcelJS.Worksheet, records: any[], theme: ITenantTheme): void {
    const totalRecords = records.length;
    const totalCharges = records.reduce((sum, r) => sum + (parseFloat(r.total_mortuary_charge) || 0), 0);
    const totalExtraCharges = records.reduce((sum, r) => sum + (parseFloat(r.extra_charges_amount) || 0), 0);
    const dispatched = records.filter(r => r.status === 'dispatched').length;
    const embalmed = records.filter(r => r.is_embalmed).length;
    const withNextOfKin = records.filter(r => r.next_of_kin_count > 0).length;

    const summaryData = [
      { label: 'TOTAL RECORDS', value: totalRecords.toLocaleString(), color: theme.secondaryColor },
      { label: 'TOTAL REVENUE', value: `KES ${totalCharges.toLocaleString()}`, color: theme.accentColor || '#EF4444' },
      { label: 'EXTRA CHARGES', value: `KES ${totalExtraCharges.toLocaleString()}`, color: '#F59E0B' },
      { label: 'DISPATCHED', value: `${dispatched}/${totalRecords}`, color: '#10B981' },
      { label: 'EMBALMED', value: `${embalmed}/${totalRecords}`, color: '#8B5CF6' },
      { label: 'NEXT OF KIN', value: `${withNextOfKin}/${totalRecords}`, color: '#EC4899' }
    ];

    const summaryRow = worksheet.addRow([]);
    summaryRow.height = 40;

    summaryData.forEach((item, idx) => {
      const startCol = idx * 4 + 1;
      const endCol = startCol + 3;
      
      if (endCol <= 25) {
        worksheet.mergeCells(`${this.getColumnLetter(startCol)}${summaryRow.number}:${this.getColumnLetter(endCol)}${summaryRow.number}`);
        
        const cell = summaryRow.getCell(startCol);
        cell.value = `${item.label}\n${item.value}`;
        cell.font = {
          name: 'Arial',
          size: 11,
          bold: true,
          color: { argb: this.hexToExcelColor(item.color) }
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: this.hexToExcelColor('#F8FAFC') }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    });

    worksheet.addRow([]);
  }

  private addDataTable(worksheet: ExcelJS.Worksheet, records: any[], theme: ITenantTheme): void {
    const headers = [
      'ID', 'Deceased ID', 'Full Name', 'Gender', 'Date of Birth',
      'Date of Death', 'Cause of Death', 'County', 'Status',
      'Base Charges', 'Extra Charges', 'Total', 'Next of Kin'
    ];

    const headerRow = worksheet.addRow(headers);
    headerRow.height = 25;

    headerRow.eachCell((cell) => {
      cell.font = {
        name: 'Arial',
        size: 10,
        bold: true,
        color: { argb: this.hexToExcelColor('#FFFFFF') }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: this.hexToExcelColor(theme.primaryColor) }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'medium' },
        bottom: { style: 'medium' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    records.forEach((record, idx) => {
      const row = worksheet.addRow([
        record.id,
        record.deceased_id,
        record.full_name,
        record.gender || 'N/A',
        record.date_of_birth ? new Date(record.date_of_birth).toLocaleDateString() : 'N/A',
        record.date_of_death ? new Date(record.date_of_death).toLocaleDateString() : 'N/A',
        record.cause_of_death || 'N/A',
        record.county || 'N/A',
        record.status || 'Active',
        this.formatCurrency(parseFloat(record.total_mortuary_charge || 0)),
        this.formatCurrency(parseFloat(record.extra_charges_amount || 0)),
        this.formatCurrency(parseFloat(record.total_mortuary_charge || 0) + parseFloat(record.extra_charges_amount || 0)),
        record.next_of_kin_count || 0
      ]);

      row.height = 22;
      const bgColor = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';

      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: this.hexToExcelColor(bgColor) }
        };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    worksheet.addRow([]);
  }

  private addFooter(worksheet: ExcelJS.Worksheet, theme: ITenantTheme, periodLabel: string): void {
    const footerRow = worksheet.addRow([]);
    worksheet.mergeCells(`A${footerRow.number}:U${footerRow.number}`);
    footerRow.height = 30;

    const footerCell = footerRow.getCell(1);
    footerCell.value = `© ${new Date().getFullYear()} ${theme.companyName}. CONFIDENTIAL REPORT - Authorized Personnel Only`;
    footerCell.font = {
      name: 'Arial',
      size: 9,
      italic: true,
      color: { argb: this.hexToExcelColor('#FFFFFF') }
    };
    footerCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: this.hexToExcelColor(theme.footerBgColor || theme.primaryColor) }
    };
    footerCell.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  private getPeriodLabel(options: IExportOptions): string {
    const period = options.period;
    const now = new Date();
    const year = now.getFullYear();

    switch (period) {
      case 'month':
        return `${now.toLocaleString('default', { month: 'long' })} ${year}`;
      case 'quarter': {
        const quarter = Math.floor(now.getMonth() / 3);
        const quarters = ['First', 'Second', 'Third', 'Fourth'];
        return `${quarters[quarter]} Quarter ${year}`;
      }
      case 'half_year': {
        const half = now.getMonth() < 6 ? 'First' : 'Second';
        return `${half} Half ${year}`;
      }
      case 'year':
        return `Year ${year}`;
      case 'custom':
        if (options.startDate && options.endDate) {
          return `${new Date(options.startDate).toLocaleDateString()} to ${new Date(options.endDate).toLocaleDateString()}`;
        }
        return 'Custom Period';
      default:
        return 'All Records';
    }
  }

  private getColumnLetter(columnNumber: number): string {
    let letter = '';
    while (columnNumber > 0) {
      columnNumber--;
      letter = String.fromCharCode(65 + (columnNumber % 26)) + letter;
      columnNumber = Math.floor(columnNumber / 26);
    }
    return letter;
  }

  private formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

export default ExcelExportService;
