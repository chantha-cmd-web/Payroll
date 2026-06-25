import React, { useMemo, useState } from 'react';
import { PayrollResult } from '../types';
import { Building2, Calendar, FileText, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExpenseReportViewProps {
  payrollData: PayrollResult[];
}

export default function ExpenseReportView({ payrollData }: ExpenseReportViewProps) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = [
    currentDate.getFullYear() - 1,
    currentDate.getFullYear(),
    currentDate.getFullYear() + 1,
  ];

  // Group by campus
  const campusStats = useMemo(() => {
    const stats: Record<string, {
      headcount: number;
      totalBasic: number;
      totalAllowances: number;
      totalGross: number;
      totalTax: number;
      totalNssf: number;
      totalNet: number;
    }> = {};

    payrollData.forEach((res) => {
      const campus = res.campus || 'Main';
      if (!stats[campus]) {
        stats[campus] = {
          headcount: 0,
          totalBasic: 0,
          totalAllowances: 0,
          totalGross: 0,
          totalTax: 0,
          totalNssf: 0,
          totalNet: 0
        };
      }
      
      stats[campus].headcount += 1;
      stats[campus].totalBasic += res.basic;
      stats[campus].totalAllowances += (res.allowance + res.caAdd + res.maternity + res.ot + res.seniority + res.sdReturn);
      stats[campus].totalGross += res.grossSalaryUSD; // Gross Salary
      stats[campus].totalTax += res.taxUSD;
      stats[campus].totalNssf += res.nssf;
      stats[campus].totalNet += res.netBankUSD;
    });

    return stats;
  }, [payrollData]);

  const campusArray = Object.entries(campusStats as any).map(([campus, data]: [string, any]) => ({
    campus,
    headcount: data.headcount,
    totalBasic: data.totalBasic,
    totalAllowances: data.totalAllowances,
    totalGross: data.totalGross,
    totalTax: data.totalTax,
    totalNssf: data.totalNssf,
    totalNet: data.totalNet
  }));

  const grandTotal = campusArray.reduce((acc, curr) => ({
    headcount: acc.headcount + curr.headcount,
    totalBasic: acc.totalBasic + curr.totalBasic,
    totalAllowances: acc.totalAllowances + curr.totalAllowances,
    totalGross: acc.totalGross + curr.totalGross,
    totalTax: acc.totalTax + curr.totalTax,
    totalNssf: acc.totalNssf + curr.totalNssf,
    totalNet: acc.totalNet + curr.totalNet,
  }), {
    headcount: 0, totalBasic: 0, totalAllowances: 0, totalGross: 0, totalTax: 0, totalNssf: 0, totalNet: 0
  });

  const handleExport = () => {
    const exportData = campusArray.map(c => ({
      'Campus': c.campus,
      'Headcount': c.headcount,
      'Total Basic ($)': c.totalBasic.toFixed(2),
      'Total Allowances ($)': c.totalAllowances.toFixed(2),
      'Gross Salary ($)': c.totalGross.toFixed(2),
      'Total Tax ($)': c.totalTax.toFixed(2),
      'Total NSSF ($)': c.totalNssf.toFixed(2),
      'Total Net Pay ($)': c.totalNet.toFixed(2),
    }));

    exportData.push({
      'Campus': 'GRAND TOTAL',
      'Headcount': grandTotal.headcount,
      'Total Basic ($)': grandTotal.totalBasic.toFixed(2) as any,
      'Total Allowances ($)': grandTotal.totalAllowances.toFixed(2) as any,
      'Gross Salary ($)': grandTotal.totalGross.toFixed(2) as any,
      'Total Tax ($)': grandTotal.totalTax.toFixed(2) as any,
      'Total NSSF ($)': grandTotal.totalNssf.toFixed(2) as any,
      'Total Net Pay ($)': grandTotal.totalNet.toFixed(2) as any,
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expense Report");
    
    XLSX.writeFile(wb, `Campus_Expense_Report_${selectedYear}_${selectedMonth}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-slate-900/40">
        <div className="space-y-1">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-500" />
            Expense Report by Campus
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Summary of payroll expenses grouped by campus locations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-slate-500" />
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer outline-none"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer outline-none"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-lg shadow-brand-500/20"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/40 dark:bg-slate-900/40">
        <div className="overflow-x-auto table-container">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold">Campus</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-center">Headcount</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-right">Basic Salary</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-right">Allowances</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-right">Gross Salary</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-right">Total Tax</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-right">Total NSSF</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-right">Total Net Pay</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800/50">
              {campusArray.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No payroll data available
                  </td>
                </tr>
              ) : (
                campusArray.map((c, i) => (
                  <tr key={i} className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">{c.campus}</td>
                    <td className="p-4 text-center">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-xs font-semibold">
                        {c.headcount}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono">${c.totalBasic.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="p-4 text-right font-mono">${c.totalAllowances.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="p-4 text-right font-mono">${c.totalGross.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="p-4 text-right font-mono text-red-500">${c.totalTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="p-4 text-right font-mono text-orange-500">${c.totalNssf.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="p-4 text-right font-mono font-bold text-green-600 dark:text-green-400">
                      ${c.totalNet.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {campusArray.length > 0 && (
              <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-bold border-t-2 border-slate-200 dark:border-slate-700">
                <tr>
                  <td className="p-4 text-slate-900 dark:text-white">GRAND TOTAL</td>
                  <td className="p-4 text-center text-brand-600 dark:text-brand-400">{grandTotal.headcount}</td>
                  <td className="p-4 text-right font-mono">${grandTotal.totalBasic.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td className="p-4 text-right font-mono">${grandTotal.totalAllowances.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td className="p-4 text-right font-mono">${grandTotal.totalGross.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td className="p-4 text-right font-mono text-red-500">${grandTotal.totalTax.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td className="p-4 text-right font-mono text-orange-500">${grandTotal.totalNssf.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td className="p-4 text-right font-mono text-green-600 dark:text-green-400">${grandTotal.totalNet.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
