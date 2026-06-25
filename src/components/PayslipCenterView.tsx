/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PayrollResult } from '../types';
import { 
  Printer, Mail, ChevronLeft, ChevronRight, CheckCircle, 
  FileText, ArrowLeftRight, Landmark, FileCheck
} from 'lucide-react';

interface PayslipCenterViewProps {
  data: PayrollResult[];
  exchangeRate: number;
}

export default function PayslipCenterView({ data, exchangeRate }: PayslipCenterViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  if (data.length === 0) {
    return (
      <div className="glass p-12 text-center text-slate-500 rounded-2xl">
        No active payroll data available. Please add or import employees.
      </div>
    );
  }

  const emp = data[currentIndex];

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    triggerToast(`Payslip successfully queued & emailed to ${emp.email || 'employee'}!`);
  };

  // Calculations for display
  const totalEarnings = 
    (emp.basic * (emp.prePayPct / 100)) + 
    emp.maternity + 
    emp.ot + 
    emp.caAdd + 
    emp.allowance + 
    emp.sdReturn + 
    emp.seniority;

  const totalDeductions = 
    emp.absence + 
    emp.caDed + 
    emp.nssf + 
    emp.taxUSD + 
    emp.provFund;

  const formatUSD = (val: number) => 
    `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatKHR = (val: number) => 
    `${val.toLocaleString('en-US', { maximumFractionDigits: 0 })} ៛`;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Selector and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 print:hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0}
            className="p-2 bg-slate-100 dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center sm:text-left">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active Payslip ({currentIndex + 1} of {data.length})</span>
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{emp.name} ({emp.staffId})</p>
          </div>

          <button 
            onClick={handleNext} 
            disabled={currentIndex === data.length - 1}
            className="p-2 bg-slate-100 dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2">
          {/* Email button */}
          <button
            onClick={handleEmail}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 border border-slate-200 dark:border-white/5"
          >
            <Mail className="w-4 h-4" />
            Email Payslip
          </button>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
          >
            <Printer className="w-4 h-4" />
            Print Payslip
          </button>
        </div>
      </div>

      {/* Toast Notice */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-2xl border border-emerald-500 flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Printable Payslip Card */}
      <div className="glass p-8 md:p-12 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white print:text-black">
        {/* Header logo & company */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-200 dark:border-slate-800 pb-6 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base print:bg-black">W</div>
              <span className="font-extrabold text-lg tracking-tight uppercase">CAMBODIA PAYROLL SYSTEMS CO., LTD</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">No. 120 Russian Boulevard, Phnom Penh, Kingdom of Cambodia</p>
          </div>

          <div className="mt-4 md:mt-0 text-left md:text-right">
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">Official Payslip</span>
            <p className="text-xl font-mono font-bold">JUNE 2026</p>
            <p className="text-[10px] text-slate-400">GDT Complaint Calculation Standard</p>
          </div>
        </div>

        {/* Employee Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 text-xs mb-6">
          <div>
            <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">Staff Name</span>
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5">{emp.name}</p>
          </div>
          <div>
            <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">Staff ID</span>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">{emp.staffId}</p>
          </div>
          <div>
            <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">Nationality</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{emp.nat}</p>
          </div>
          <div>
            <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">Position</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{emp.pos}</p>
          </div>
          <div>
            <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">Department</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{emp.dept}</p>
          </div>
          <div>
            <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">Campus / Location</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{emp.campus}</p>
          </div>
          <div>
            <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">Bank Account</span>
            <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{emp.bankAcc || '-'}</p>
          </div>
          <div>
            <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">Joining Date</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{emp.doj}</p>
          </div>
        </div>

        {/* Payslip Items Breakdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-xs">
          {/* Earnings Column */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-indigo-600 dark:text-indigo-400 border-b border-indigo-100 dark:border-indigo-950 pb-1 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-4 h-4" />
              Earnings (ប្រាក់ចំណូល)
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-white/5 space-y-1.5">
              <div className="flex justify-between pt-1.5">
                <span className="text-slate-500 dark:text-slate-400">Basic Salary (ប្រាក់ខែគោល)</span>
                <span className="font-mono">{formatUSD(emp.basic)}</span>
              </div>
              <div className="flex justify-between pt-1.5">
                <span className="text-slate-500 dark:text-slate-400">Prepayment Factor ({emp.prePayPct}%)</span>
                <span className="font-mono">{formatUSD(emp.basic * (emp.prePayPct / 100))}</span>
              </div>
              {emp.maternity > 0 && (
                <div className="flex justify-between pt-1.5 text-emerald-500">
                  <span>Maternity Allowance (ប្រាក់មាតុភាព)</span>
                  <span className="font-mono">+{formatUSD(emp.maternity)}</span>
                </div>
              )}
              {emp.ot > 0 && (
                <div className="flex justify-between pt-1.5 text-emerald-500">
                  <span>Overtime (ថែមម៉ោង)</span>
                  <span className="font-mono">+{formatUSD(emp.ot)}</span>
                </div>
              )}
              {emp.caAdd > 0 && (
                <div className="flex justify-between pt-1.5 text-emerald-500">
                  <span>Cash Allowance (ប្រាក់ឧបត្ថម្ភបន្ថែម)</span>
                  <span className="font-mono">+{formatUSD(emp.caAdd)}</span>
                </div>
              )}
              {emp.seniority > 0 && (
                <div className="flex justify-between pt-1.5 text-emerald-500">
                  <span>Seniority Payment (ប្រាក់បំណាច់អតីតភាព)</span>
                  <span className="font-mono">+{formatUSD(emp.seniority)}</span>
                </div>
              )}
              {emp.allowance > 0 && (
                <div className="flex justify-between pt-1.5 text-emerald-500">
                  <span>Taxable Allowance (ប្រាក់សោធននិវត្តន៍)</span>
                  <span className="font-mono">+{formatUSD(emp.allowance)}</span>
                </div>
              )}
              {emp.sdReturn > 0 && (
                <div className="flex justify-between pt-1.5 text-emerald-500">
                  <span>Visa/SD Return (ត្រឡប់ប្រាក់កក់)</span>
                  <span className="font-mono">+{formatUSD(emp.sdReturn)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Deductions Column */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-red-500 border-b border-red-100 dark:border-red-950/40 pb-1 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowLeftRight className="w-4 h-4" />
              Deductions (ការកាត់កង)
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-white/5 space-y-1.5">
              <div className="flex justify-between pt-1.5">
                <span className="text-slate-500 dark:text-slate-400">Absences (អវត្តមាន)</span>
                <span className="font-mono text-red-500">{emp.absence > 0 ? `-${formatUSD(emp.absence)}` : '$0.00'}</span>
              </div>
              {emp.caDed > 0 && (
                <div className="flex justify-between pt-1.5 text-red-500">
                  <span>Allowance Deduction (ការកាត់ឧបត្ថម្ភ)</span>
                  <span className="font-mono">-{formatUSD(emp.caDed)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1.5">
                <span className="text-slate-500 dark:text-slate-400">NSSF Contribution (ប.ស.ស)</span>
                <span className="font-mono text-red-500">{emp.nssf > 0 ? `-${formatUSD(emp.nssf)}` : '$0.00'}</span>
              </div>
              <div className="flex justify-between pt-1.5">
                <span className="text-slate-500 dark:text-slate-400">GDT Salary Tax on Base (ពន្ធលើប្រាក់បៀវត្ស)</span>
                <span className="font-mono text-red-500">{emp.taxUSD > 0 ? `-${formatUSD(emp.taxUSD)}` : '$0.00'}</span>
              </div>
              {emp.provFund > 0 && (
                <div className="flex justify-between pt-1.5 text-red-500">
                  <span>Provident Fund Deduction</span>
                  <span className="font-mono">-{formatUSD(emp.provFund)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Aggregate summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t-2 border-slate-200 dark:border-slate-800 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 text-xs">
            <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">Gross Earnings</span>
            <span className="text-base font-bold font-mono text-slate-700 dark:text-slate-300 mt-1 block">{formatUSD(totalEarnings)}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 text-xs">
            <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">Total Deductions</span>
            <span className="text-base font-bold font-mono text-red-500 mt-1 block">{formatUSD(totalDeductions)}</span>
          </div>

          {/* Highlight Net Transfer */}
          <div className="p-4 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/20 text-xs border border-emerald-500/20">
            <span className="text-emerald-600 dark:text-emerald-400 block uppercase font-extrabold text-[9px] tracking-wider">Net Bank Transfer (ប្រាក់ខែសុទ្ធទទួលបាន)</span>
            <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">{formatUSD(emp.netBankUSD)}</span>
            <span className="text-[10px] text-slate-400 block font-semibold font-mono mt-0.5">{formatKHR(emp.netBankUSD * exchangeRate)}</span>
          </div>
        </div>

        {/* Cambodia Authorized signatures lines */}
        <div className="grid grid-cols-2 gap-6 mt-12 text-center text-xs border-t border-slate-100 dark:border-white/5 pt-8 print:mt-16">
          <div className="space-y-12">
            <p className="text-slate-500 font-semibold uppercase tracking-wider">Prepared By (អ្នករៀបចំ)</p>
            <div className="space-y-1">
              <div className="mx-auto w-36 h-px bg-slate-300 dark:bg-slate-700"></div>
              <p className="font-bold text-slate-700 dark:text-slate-300">HR Department</p>
            </div>
          </div>
          <div className="space-y-12">
            <p className="text-slate-500 font-semibold uppercase tracking-wider">Acknowledged By (អ្នកទទួល)</p>
            <div className="space-y-1">
              <div className="mx-auto w-36 h-px bg-slate-300 dark:bg-slate-700"></div>
              <p className="font-bold text-slate-700 dark:text-slate-300">{emp.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
