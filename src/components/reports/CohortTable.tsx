
import { CohortAnalysis } from "@/types/report";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface CohortTableProps {
  data: CohortAnalysis[];
}

export function CohortTable({ data }: CohortTableProps) {
  // Format currency
  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cohort Month</TableHead>
            <TableHead className="text-right">Users</TableHead>
            <TableHead className="text-right">Total Spend</TableHead>
            <TableHead className="text-right">Avg Spend</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.cohort_month}>
              <TableCell className="font-medium">
                {format(new Date(row.cohort_month), 'MMM yyyy')}
              </TableCell>
              <TableCell className="text-right">{row.total_users}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.total_spend)}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.avg_spend)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
