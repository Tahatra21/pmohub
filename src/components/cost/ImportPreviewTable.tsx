'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ImportPreviewTableProps {
  data: any[];
  headers: string[];
}

export function ImportPreviewTable({ data, headers }: ImportPreviewTableProps) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8">Tidak ada data untuk ditampilkan</div>;
  }

  // Hanya tampilkan maksimal 10 baris untuk preview
  const previewData = data.slice(0, 10);
  
  // Fungsi untuk validasi tipe data
  const validateCell = (value: any, index: number) => {
    // Validasi khusus berdasarkan indeks kolom
    if (headers[index] === 'Harga Satuan Bulanan (man months)' || 
        headers[index] === 'Harga Satuan Harian (man days)') {
      // Harus berupa angka atau "at cost"
      if (value === "at cost") return { valid: true, type: "at-cost" };
      const numValue = parseFloat(String(value).replace(/\./g, ''));
      return { valid: !isNaN(numValue), type: "number" };
    }
    
    if (headers[index] === 'KHS 2022') {
      // Harus berupa angka atau "at cost"
      if (value === "at cost") return { valid: true, type: "at-cost" };
      const numValue = parseFloat(String(value).replace(/\./g, ''));
      return { valid: !isNaN(numValue), type: "number" };
    }
    
    // Validasi umum
    return { valid: value !== undefined && value !== null && value !== '', type: "text" };
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header, index) => (
              <TableHead key={index}>{header}</TableHead>
            ))}
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {previewData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {Object.values(row).map((cell: any, cellIndex) => {
                const validation = validateCell(cell, cellIndex);
                return (
                  <TableCell key={cellIndex} className={!validation.valid ? "text-red-500" : ""}>
                    {cell}
                  </TableCell>
                );
              })}
              <TableCell>
                {Object.values(row).every((cell: any, idx) => validateCell(cell, idx).valid) ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Valid
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    Error
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {data.length > 10 && (
        <div className="text-center py-2 text-sm text-gray-500">
          Menampilkan 10 dari {data.length} baris
        </div>
      )}
    </div>
  );
}