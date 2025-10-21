import * as XLSX from 'xlsx';

export class SecureExcelService {
  static async createWorkbook(data: any[], filename: string): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    const buffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });
    
    return buffer;
  }
  
  static async createWorkbookFromArray(data: any[][], filename: string): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    const buffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });
    
    return buffer;
  }
}
