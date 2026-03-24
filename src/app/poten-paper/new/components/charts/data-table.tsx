'use client';

import type { ChartData } from '@/lib/poten-paper/types';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

interface DataTableProps {
  chart: ChartData;
}

export function DataTable({ chart }: DataTableProps) {
  const columns = chart.columns ?? [];
  const rows = chart.rows ?? chart.data ?? [];

  if (columns.length === 0 && rows.length === 0) return null;

  // If no explicit columns, derive from row keys
  const effectiveColumns =
    columns.length > 0
      ? columns
      : rows.length > 0
        ? Object.keys(rows[0])
        : [];

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
                className="text-xs font-semibold text-gray-700"
              >
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="border-gray-100">
              {effectiveColumns.map((col) => (
                <TableCell
                  key={col}
                  className="text-xs text-gray-600"
                >
                  {row[col] != null ? String(row[col]) : ''}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
