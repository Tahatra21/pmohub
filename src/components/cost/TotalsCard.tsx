'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercent } from '@/lib/cost-calculator';
import { EstimateTotals, ProjectSettings } from '@/lib/cost-calculator';

interface TotalsCardProps {
  totals: EstimateTotals;
  settings: ProjectSettings;
  className?: string;
}

export function TotalsCard({ totals, settings, className }: TotalsCardProps) {
  const calculationSteps = [
    {
      label: 'Subtotal',
      value: totals.subtotal,
      formula: 'Σ lineTotal',
      description: 'Total dari semua baris estimasi'
    },
    {
      label: 'Escalation',
      value: totals.escalation,
      formula: `Subtotal × ${formatPercent(settings.escalationPct)}`,
      description: 'Kenaikan harga berdasarkan inflasi'
    },
    {
      label: 'Overhead',
      value: totals.overhead,
      formula: `(Subtotal + Escalation) × ${formatPercent(settings.markUpPct)}`,
      description: 'Biaya overhead dan markup'
    },
    {
      label: 'Contingency',
      value: totals.contingency,
      formula: `(Subtotal + Escalation + Overhead) × ${formatPercent(settings.contingencyPct)}`,
      description: 'Cadangan untuk risiko'
    },
    {
      label: 'Discount',
      value: totals.discount,
      formula: `-(Total Sebelumnya × ${formatPercent(settings.discountPct)})`,
      description: 'Potongan harga'
    },
    {
      label: 'DPP',
      value: totals.dpp,
      formula: 'Subtotal + Escalation + Overhead + Contingency + Discount',
      description: 'Dasar Pengenaan Pajak'
    },
    {
      label: 'PPN',
      value: totals.ppn,
      formula: `DPP × ${formatPercent(settings.ppnPct)}`,
      description: 'Pajak Pertambahan Nilai'
    },
    {
      label: 'Grand Total',
      value: totals.grandTotal,
      formula: 'DPP + PPN',
      description: 'Total akhir estimasi',
      isTotal: true
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Perhitungan Total</span>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Live Calculation
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {calculationSteps.map((step, index) => (
          <div
            key={step.label}
            className={`flex items-center justify-between p-3 rounded-lg ${
              step.isTotal
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${step.isTotal ? 'text-green-800' : 'text-gray-800'}`}>
                  {step.label}
                </span>
                {step.isTotal && (
                  <Badge className="bg-green-100 text-green-800">
                    Final
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {step.formula}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {step.description}
              </div>
            </div>
            <div className={`text-right ${step.isTotal ? 'text-green-800 font-bold' : 'text-gray-800'}`}>
              <div className="text-lg">
                {formatCurrency(step.value)}
              </div>
              {step.value > 0 && (
                <div className="text-xs text-gray-500">
                  {((step.value / totals.grandTotal) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Baris:</span>
              <span className="ml-2 font-medium">-</span>
            </div>
            <div>
              <span className="text-gray-600">Working Days/Month:</span>
              <span className="ml-2 font-medium">
                {settings.assumptions?.workingDaysPerMonth || 20}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
