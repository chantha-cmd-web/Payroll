/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PayrollResult } from '../types';
import { Download, FileText, CheckCircle, Landmark, ShieldCheck, Sparkles } from 'lucide-react';

interface TaxExportViewProps {
  data: PayrollResult[];
  exchangeRate: number;
}

export default function TaxExportView({ data, exchangeRate }: TaxExportViewProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const formatUSD = (val: number) => 
    `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const formatKHR = (val: number) => 
    `${val.toLocaleString('en-US', { maximumFractionDigits: 0 })} ៛`;

  // GDT Tax Report Exporter
  const exportGDTReport = () => {
    if (data.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Cambodia GDT Salary Tax Declaration Summary\r\n';
    csvContent += `Exchange Rate: 1 USD = ${exchangeRate} KHR\r\n\r\n`;
    csvContent += 'Staff ID,Name,Nationality,Gross Salary (USD),Gross Salary (KHR),Spouse Relief (KHR),Dependent Kids,Kids Relief (KHR),Taxable Base (KHR),Rate %,Tax KHR,Tax USD,Remarks\r\n';

    data.forEach((emp) => {
      const spouseRelief = emp.nat === 'Khmer' && emp.spouse ? 150000 : 0;
      const kidsRelief = emp.nat === 'Khmer' ? emp.kids * 150000 : 0;
      const row = [
        emp.staffId,
        `"${emp.name}"`,
        emp.nat,
        emp.grossSalaryUSD.toFixed(2),
        emp.salaryPaidKHR.toFixed(0),
        spouseRelief,
        emp.kids,
        kidsRelief,
        emp.taxBaseKHR.toFixed(0),
        emp.taxRate,
        emp.taxKHR.toFixed(0),
        emp.taxUSD.toFixed(2),
        `"${emp.remarks || ''}"`
      ];
      csvContent += row.join(',') + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GDT_Salary_Tax_Declaration_June_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('GDT Tax Declaration Report exported successfully!');
  };

  // ABA Bank Transfer Exporter
  const exportABATransfers = () => {
    if (data.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Bank account number,Beneficiary Name,Net USD,Net KHR,Currency,Narrative\r\n';

    data.forEach((emp) => {
      const row = [
        `"${emp.bankAcc || ''}"`,
        `"${emp.name.toUpperCase()}"`,
        emp.netBankUSD.toFixed(2),
        (emp.netBankUSD * exchangeRate).toFixed(0),
        'USD',
        `"June 2026 Salary Transfer - ID ${emp.staffId}"`
      ];
      csvContent += row.join(',') + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ABA_Bank_Bulk_Transfer_List.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('ABA Bank Transfer CSV exported successfully!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notice */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-2xl border border-emerald-500 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Export Widgets Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GDT Tax Box */}
        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4 bg-white/40 dark:bg-slate-900/40">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg inline-block">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-base mt-2">GDT Salary Tax Declaration</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Generate the monthly official GDT compliant Tax on Salary spreadsheet declarations.</p>
            </div>
          </div>
          
          <div className="pt-2 text-xs divide-y divide-slate-100 dark:divide-white/5 space-y-2">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Declared Exchange Rate</span>
              <span className="font-mono font-bold">1 USD = {exchangeRate} KHR</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Total Tax Base (KHR)</span>
              <span className="font-mono font-bold">{formatKHR(data.reduce((s, e) => s + e.taxBaseKHR, 0))}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Cumulative Tax Payable (KHR)</span>
              <span className="font-mono font-bold text-red-500">{formatKHR(data.reduce((s, e) => s + e.taxKHR, 0))}</span>
            </div>
          </div>

          <button
            onClick={exportGDTReport}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
          >
            <Download className="w-4 h-4" />
            Download GDT Declaration (CSV)
          </button>
        </div>

        {/* Bank Transfer Box */}
        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4 bg-white/40 dark:bg-slate-900/40">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg inline-block">
                <Landmark className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-base mt-2">Bank Bulk Transfer File</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Generate ABA Bank compliant bulk file transfer CSV format for corporate payroll processing.</p>
            </div>
          </div>

          <div className="pt-2 text-xs divide-y divide-slate-100 dark:divide-white/5 space-y-2">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Total Receiver Accounts</span>
              <span className="font-bold">{data.filter((e) => e.bankAcc).length} Accounts</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Bank Net Outflow (USD)</span>
              <span className="font-mono font-bold text-emerald-500">{formatUSD(data.reduce((s, e) => s + e.netBankUSD, 0))}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Bank Net Outflow (KHR Equivalent)</span>
              <span className="font-mono font-bold text-emerald-500">{formatKHR(data.reduce((s, e) => s + e.netBankUSD * exchangeRate, 0))}</span>
            </div>
          </div>

          <button
            onClick={exportABATransfers}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Download className="w-4 h-4" />
            Export ABA Transfer List (CSV)
          </button>
        </div>
      </div>

      {/* Preview Table of Export Records */}
      <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Corporate Export Preview List</h3>
        
        <div className="overflow-x-auto table-container">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 font-semibold">Staff ID</th>
                <th className="p-3 font-semibold">Receiver Name</th>
                <th className="p-3 font-semibold">Bank Account</th>
                <th className="p-3 font-semibold">Net Pay (USD)</th>
                <th className="p-3 font-semibold">Net Pay (KHR)</th>
                <th className="p-3 font-semibold">GDT Tax (USD)</th>
                <th className="p-3 font-semibold">Tax Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
              {data.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="p-3 font-mono text-brand-600 dark:text-brand-400 font-bold">{emp.staffId}</td>
                  <td className="p-3 font-bold">{emp.name}</td>
                  <td className="p-3 font-mono">{emp.bankAcc || <span className="text-red-500">Missing Account</span>}</td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400 font-mono">{formatUSD(emp.netBankUSD)}</td>
                  <td className="p-3 font-mono">{formatKHR(emp.netBankUSD * exchangeRate)}</td>
                  <td className="p-3 font-mono text-red-500">{formatUSD(emp.taxUSD)}</td>
                  <td className="p-3 font-mono text-slate-400">{emp.taxRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
