/**
 * Cost Calculator untuk estimasi biaya proyek
 * Berdasarkan spesifikasi di cost.md
 */

export interface EstimateLineData {
  id?: string;
  type: 'BLP' | 'BLNP' | 'CUSTOM';
  refId?: string;
  description: string;
  unit: 'man-days' | 'man-months' | 'unit' | 'hari';
  qty: number;
  unitPrice: number;
  isAtCost: boolean;
  meta?: any;
  lineTotal: number;
  sort: number;
}

export interface EstimateTotals {
  subtotal: number;
  escalation: number;
  overhead: number;
  contingency: number;
  discount: number;
  dpp: number;
  ppn: number;
  grandTotal: number;
}

export interface ProjectAssumptions {
  workingDaysPerMonth?: number;
  roundToThousand?: boolean;
}

export interface ProjectSettings {
  markUpPct: number;
  contingencyPct: number;
  discountPct: number;
  ppnPct: number;
  escalationPct: number;
  assumptions?: ProjectAssumptions;
}

/**
 * Menghitung total biaya per baris
 */
export function calculateLineTotal(line: Partial<EstimateLineData>): number {
  if (!line.qty || !line.unitPrice) return 0;
  return line.qty * line.unitPrice;
}

/**
 * Konversi antara man-days dan man-months
 */
export function convertUnit(
  value: number, 
  fromUnit: 'man-days' | 'man-months', 
  toUnit: 'man-days' | 'man-months',
  workingDaysPerMonth: number = 20
): number {
  if (fromUnit === toUnit) return value;
  
  if (fromUnit === 'man-days' && toUnit === 'man-months') {
    return value / workingDaysPerMonth;
  } else {
    return value * workingDaysPerMonth;
  }
}

/**
 * Menghitung total keseluruhan estimasi
 */
export function calculateEstimateTotals(
  lines: EstimateLineData[],
  settings: ProjectSettings
): EstimateTotals {
  // Default values
  const markUpPct = settings.markUpPct / 100;
  const contingencyPct = settings.contingencyPct / 100;
  const discountPct = settings.discountPct / 100;
  const ppnPct = settings.ppnPct / 100;
  const escalationPct = settings.escalationPct / 100;
  const roundToThousand = settings.assumptions?.roundToThousand || false;

  // Hitung subtotal dari semua baris
  const subtotal = lines.reduce((sum, line) => sum + (line.lineTotal || 0), 0);
  
  // Hitung komponen lainnya
  const escalation = subtotal * escalationPct;
  const overhead = (subtotal + escalation) * markUpPct;
  const contingency = (subtotal + escalation + overhead) * contingencyPct;
  const discount = -((subtotal + escalation + overhead + contingency) * discountPct);
  const dpp = subtotal + escalation + overhead + contingency + discount;
  const ppn = dpp * ppnPct;
  const grandTotal = dpp + ppn;

  // Fungsi pembulatan
  const roundValue = (value: number): number => {
    if (roundToThousand) {
      return Math.round(value / 1000) * 1000;
    }
    return Math.round(value);
  };

  return {
    subtotal: roundValue(subtotal),
    escalation: roundValue(escalation),
    overhead: roundValue(overhead),
    contingency: roundValue(contingency),
    discount: roundValue(discount),
    dpp: roundValue(dpp),
    ppn: roundValue(ppn),
    grandTotal: roundValue(grandTotal)
  };
}

/**
 * Format angka ke format rupiah
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format persentase
 */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(value / 100);
}

/**
 * Parse string rupiah ke number
 * Contoh: "1.000.000" -> 1000000
 */
export function parseRupiahString(value: string): number {
  if (!value) return 0;
  // Hapus semua karakter non-digit
  const numericString = value.replace(/\D/g, '');
  return parseInt(numericString, 10) || 0;
}