'use client';

import type { ChartData } from '@/lib/poten-paper/types';
import { BRAND_COLOR } from '@/lib/poten-paper/constants';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

interface TimelineTableProps {
  chart: ChartData;
}

export function TimelineTable({ chart }: TimelineTableProps) {
  const columns = chart.columns ?? [];
  const rows = chart.rows ?? chart.data ?? [];

  if (columns.length === 0 && rows.length === 0) return null;

  const effectiveColumns =
    columns.length > 0
      ? columns
      : rows.length > 0
        ? Object.keys(rows[0])
        : [];

  const isFilled = (value: string | number | undefined | null): boolean => {
    if (value == null) return false;
    const str = String(value).trim();
    return str !== '' && str !== '-' && str !== '0';
  };

  return (
    <div className="my-4 rounded-lg border border-gray-200 bg-white p-4">
      <h4 className="mb-3 text-sm font-semibold text-gray-800">
        {chart.title}
      </h4>
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200">
            {effectiveColumns.map((col) => (
              <TableHead
                key={col}
                className="text-center text-xs font-semibold text-gray-700"
              >
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="border-gray-100">
              {effectiveColumns.map((col, colIndex) => {
                const value = row[col];
                const filled = colIndex > 0 && isFilled(value);

                return (
                  <TableCell
                    key={col}
                    className="text-center text-xs text-gray-600"
                    style={
                      filled
                        ? {
                            backgroundColor: `${BRAND_COLOR}18`,
                            color: BRAND_COLOR,
                            fontWeight: 600,
                          }
                        : undefined
                    }
                  >
                    {value != null ? String(value) : ''}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
