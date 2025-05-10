import * as XLSX from 'xlsx';

export class CommonUtils {
  static getBase64(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  static exportExcel(data: any[], nameSheet: string, nameFile: string): Promise<string> {
    return new Promise((resolve) => {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, nameSheet);
      XLSX.writeFile(wb, `${nameFile}.xlsx`);
      resolve('oke');
    });
  }
}
