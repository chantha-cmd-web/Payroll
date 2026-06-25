/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PayrollResult } from '../types';
import { 
  FileSpreadsheet, HelpCircle, Save, Info, Sparkles, 
  ChevronRight, Calculator, RefreshCw, AlertTriangle
} from 'lucide-react';

interface PayrollProcessingViewProps {
  data: PayrollResult[];
  onUpdateValue: (id: number, key: string, value: any) => void;
  exchangeRate: number;
  aiMode: boolean;
}

export default function PayrollProcessingView({
  data,
  onUpdateValue,
  exchangeRate,
  aiMode,
}: PayrollProcessingViewProps) {
  const [selectedCell, setSelectedCell] = useState<{ id: number; key: string } | null>(null);

  // Currency Formatter
  const formatUSD = (val: number) => 
    `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const formatKHR = (val: number) => 
    `${val.toLocaleString('en-US', { maximumFractionDigits: 0 })} ៛`;

  const handleCellBlur = () => {
    setSelectedCell(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Information Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-slate-900/40">
        <div className="space-y-1">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-500" />
            Automatic Payroll Processing Sheet
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Double-click any salary or deduction parameter cell to edit values inline. Column formulas recalculate tax and bank transfers automatically.
          </p>
        </div>

        {/* Currency details */}
        <div className="flex gap-4 text-xs font-mono">
          <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
            <span className="text-slate-400">GDT Exchange Rate:</span>
            <p className="font-bold text-slate-700 dark:text-slate-200">1 USD = {exchangeRate} KHR</p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
            <span className="text-slate-400">Spouse & Kids Relief:</span>
            <p className="font-bold text-slate-700 dark:text-slate-200">150,000 KHR each</p>
          </div>
        </div>
      </div>

      {/* Spreadsheet container */}
      <div className="glass rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden bg-white/50 dark:bg-transparent flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Process Status: Idle & Calculated</span>
          </div>

          <div className="flex gap-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Blue columns represent automatic calculations.
            </span>
          </div>
        </div>

        {/* Interactive scrollable table */}
        <div className="overflow-x-auto table-container">
          <table className="w-max min-w-full text-left border-collapse border-spacing-0">
            <thead className="bg-slate-100 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-20 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-2.5 sticky left-0 bg-slate-100 dark:bg-slate-800 z-30 font-semibold border-b border-slate-200 dark:border-slate-700">1. No</th>
                <th className="p-2.5 sticky left-12 bg-slate-100 dark:bg-slate-800 z-30 font-semibold border-b border-slate-200 dark:border-slate-700">2. Staff ID</th>
                <th className="p-2.5 sticky left-32 bg-slate-100 dark:bg-slate-800 z-30 font-semibold border-b border-r border-slate-200 dark:border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">3. Name</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700">4. Nat.</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700">5. Position</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700">6. Dept</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700">7. Campus</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700">8. DOJ</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700">9. Emp Date</th>
                
                {/* Earnings */}
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700 bg-brand-500/10 dark:bg-brand-900/10">10. Basic ($)</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700 bg-brand-500/10 dark:bg-brand-900/10">11. Prepay %</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700 bg-red-500/10 dark:bg-red-950/20 text-red-600 dark:text-red-400">12. Abs (-)</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700 bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">13. Mat (+)</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700 bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">14. OT (+)</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700 bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">15. Adv (+)</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700 bg-red-500/10 dark:bg-red-950/20 text-red-600 dark:text-red-400">16. Adv (-)</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700 bg-red-500/10 dark:bg-red-950/20 text-red-600 dark:text-red-400">17. NSSF (-)</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700">18. Seniority</th>
                
                {/* Calculated Gross */}
                <th className="p-2.5 font-bold border-b border-slate-200 dark:border-slate-700 bg-blue-500/20 dark:bg-blue-950/40 text-brand-600 dark:text-brand-400 text-center">19. Gross ($) *</th>
                <th className="p-2.5 font-bold border-b border-slate-200 dark:border-slate-700 bg-blue-500/20 dark:bg-blue-950/40 text-brand-600 dark:text-brand-400 text-center">20. Paid (KHR) *</th>
                
                {/* Tax reliefs */}
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700">21. Spouse</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700">22. Kids</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700">23. Allowance ($)</th>
                
                {/* Tax Calculations */}
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700 bg-indigo-500/10 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">24. Tax Base (KHR) *</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700 bg-indigo-500/10 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">25. Rate *</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700 bg-indigo-500/10 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">26. Tax (KHR) *</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700 bg-indigo-500/10 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">27. Tax ($) *</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700 text-center">28. After Tax ($) *</th>
                
                {/* Other Banking Adj */}
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700">29. Visa/SD (+)</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700 text-red-500 dark:text-red-400">30. Prov Fund</th>
                
                {/* Ultimate Net Payout */}
                <th className="p-2.5 font-bold border-b border-slate-200 dark:border-slate-700 bg-emerald-500/20 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-center">31. Bank Net ($) *</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700">32. Bank Acc</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700">33. Email</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700">34. Remarks</th>
                <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-700">35. Summary Gross *</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-xs font-medium">
              {data.map((emp, idx) => (
                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition h-11">
                  {/* Sticky identity columns */}
                  <td className="p-2.5 sticky left-0 bg-white dark:bg-[#0B0F19] z-10 text-slate-500">{idx + 1}</td>
                  <td className="p-2.5 sticky left-12 bg-white dark:bg-[#0B0F19] z-10 font-mono text-[10px] text-indigo-500">{emp.staffId}</td>
                  <td className="p-2.5 sticky left-32 bg-white dark:bg-[#0B0F19] z-10 border-r border-slate-200 dark:border-white/5 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] font-semibold max-w-[130px] truncate">
                    {emp.name}
                    {aiMode && emp.netBankUSD < 0 && (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 ml-1.5 inline animate-bounce" title="Error: Negative Net Transfer" />
                    )}
                  </td>

                  {/* Meta details */}
                  <td className="p-2.5 text-slate-500 text-[10px]">{emp.nat}</td>
                  <td className="p-2.5 text-slate-500 text-[10px] max-w-[100px] truncate">{emp.pos}</td>
                  <td className="p-2.5 text-slate-500 text-[10px]">{emp.dept}</td>
                  <td className="p-2.5 text-slate-500 text-[10px]">{emp.campus}</td>
                  <td className="p-2.5 text-slate-500 text-[10px]">{emp.doj}</td>
                  <td className="p-2.5 text-slate-500 text-[10px]">{emp.empDate}</td>

                  {/* Earnings (Editable Cells) */}
                  
                  {/* 10. Basic */}
                  <td 
                    onClick={() => setSelectedCell({ id: emp.id, key: 'basic' })}
                    className={`p-2.5 font-mono cursor-pointer transition ${selectedCell?.id === emp.id && selectedCell?.key === 'basic' ? 'bg-slate-100 dark:bg-slate-800 p-1' : 'hover:bg-brand-500/10'}`}
                  >
                    {selectedCell?.id === emp.id && selectedCell?.key === 'basic' ? (
                      <input
                        type="number"
                        defaultValue={emp.basic}
                        onBlur={handleCellBlur}
                        onChange={(e) => onUpdateValue(emp.id, 'basic', parseFloat(e.target.value) || 0)}
                        autoFocus
                        className="w-16 px-1 py-0.5 rounded border border-brand-500 bg-white dark:bg-slate-900 focus:outline-none"
                      />
                    ) : (
                      formatUSD(emp.basic)
                    )}
                  </td>

                  {/* 11. Prepay */}
                  <td 
                    onClick={() => setSelectedCell({ id: emp.id, key: 'prePayPct' })}
                    className={`p-2.5 font-mono cursor-pointer transition ${selectedCell?.id === emp.id && selectedCell?.key === 'prePayPct' ? 'bg-slate-100 dark:bg-slate-800 p-1' : 'hover:bg-brand-500/10'}`}
                  >
                    {selectedCell?.id === emp.id && selectedCell?.key === 'prePayPct' ? (
                      <input
                        type="number"
                        defaultValue={emp.prePayPct}
                        onBlur={handleCellBlur}
                        onChange={(e) => onUpdateValue(emp.id, 'prePayPct', parseFloat(e.target.value) || 0)}
                        autoFocus
                        className="w-12 px-1 py-0.5 rounded border border-brand-500 bg-white dark:bg-slate-900 focus:outline-none"
                      />
                    ) : (
                      `${emp.prePayPct}%`
                    )}
                  </td>

                  {/* 12. Absence */}
                  <td 
                    onClick={() => setSelectedCell({ id: emp.id, key: 'absence' })}
                    className={`p-2.5 font-mono cursor-pointer text-red-500 transition ${selectedCell?.id === emp.id && selectedCell?.key === 'absence' ? 'bg-slate-100 dark:bg-slate-800 p-1' : 'hover:bg-red-500/10'}`}
                  >
                    {selectedCell?.id === emp.id && selectedCell?.key === 'absence' ? (
                      <input
                        type="number"
                        defaultValue={emp.absence}
                        onBlur={handleCellBlur}
                        onChange={(e) => onUpdateValue(emp.id, 'absence', parseFloat(e.target.value) || 0)}
                        autoFocus
                        className="w-16 px-1 py-0.5 rounded border border-brand-500 bg-white dark:bg-slate-900 focus:outline-none"
                      />
                    ) : (
                      emp.absence > 0 ? `-${formatUSD(emp.absence)}` : '-'
                    )}
                  </td>

                  {/* 13. Maternity */}
                  <td 
                    onClick={() => setSelectedCell({ id: emp.id, key: 'maternity' })}
                    className={`p-2.5 font-mono cursor-pointer text-emerald-500 transition ${selectedCell?.id === emp.id && selectedCell?.key === 'maternity' ? 'bg-slate-100 dark:bg-slate-800 p-1' : 'hover:bg-emerald-500/10'}`}
                  >
                    {selectedCell?.id === emp.id && selectedCell?.key === 'maternity' ? (
                      <input
                        type="number"
                        defaultValue={emp.maternity}
                        onBlur={handleCellBlur}
                        onChange={(e) => onUpdateValue(emp.id, 'maternity', parseFloat(e.target.value) || 0)}
                        autoFocus
                        className="w-16 px-1 py-0.5 rounded border border-brand-500 bg-white dark:bg-slate-900 focus:outline-none"
                      />
                    ) : (
                      emp.maternity > 0 ? `+${formatUSD(emp.maternity)}` : '-'
                    )}
                  </td>

                  {/* 14. Overtime */}
                  <td 
                    onClick={() => setSelectedCell({ id: emp.id, key: 'ot' })}
                    className={`p-2.5 font-mono cursor-pointer text-emerald-500 transition ${selectedCell?.id === emp.id && selectedCell?.key === 'ot' ? 'bg-slate-100 dark:bg-slate-800 p-1' : 'hover:bg-emerald-500/10'}`}
                  >
                    {selectedCell?.id === emp.id && selectedCell?.key === 'ot' ? (
                      <input
                        type="number"
                        defaultValue={emp.ot}
                        onBlur={handleCellBlur}
                        onChange={(e) => onUpdateValue(emp.id, 'ot', parseFloat(e.target.value) || 0)}
                        autoFocus
                        className="w-16 px-1 py-0.5 rounded border border-brand-500 bg-white dark:bg-slate-900 focus:outline-none"
                      />
                    ) : (
                      emp.ot > 0 ? `+${formatUSD(emp.ot)}` : '-'
                    )}
                  </td>

                  {/* 15. caAdd */}
                  <td 
                    onClick={() => setSelectedCell({ id: emp.id, key: 'caAdd' })}
                    className={`p-2.5 font-mono cursor-pointer text-emerald-500 transition ${selectedCell?.id === emp.id && selectedCell?.key === 'caAdd' ? 'bg-slate-100 dark:bg-slate-800 p-1' : 'hover:bg-emerald-500/10'}`}
                  >
                    {selectedCell?.id === emp.id && selectedCell?.key === 'caAdd' ? (
                      <input
                        type="number"
                        defaultValue={emp.caAdd}
                        onBlur={handleCellBlur}
                        onChange={(e) => onUpdateValue(emp.id, 'caAdd', parseFloat(e.target.value) || 0)}
                        autoFocus
                        className="w-16 px-1 py-0.5 rounded border border-brand-500 bg-white dark:bg-slate-900 focus:outline-none"
                      />
                    ) : (
                      emp.caAdd > 0 ? `+${formatUSD(emp.caAdd)}` : '-'
                    )}
                  </td>

                  {/* 16. caDed */}
                  <td 
                    onClick={() => setSelectedCell({ id: emp.id, key: 'caDed' })}
                    className={`p-2.5 font-mono cursor-pointer text-red-500 transition ${selectedCell?.id === emp.id && selectedCell?.key === 'caDed' ? 'bg-slate-100 dark:bg-slate-800 p-1' : 'hover:bg-red-500/10'}`}
                  >
                    {selectedCell?.id === emp.id && selectedCell?.key === 'caDed' ? (
                      <input
                        type="number"
                        defaultValue={emp.caDed}
                        onBlur={handleCellBlur}
                        onChange={(e) => onUpdateValue(emp.id, 'caDed', parseFloat(e.target.value) || 0)}
                        autoFocus
                        className="w-16 px-1 py-0.5 rounded border border-brand-500 bg-white dark:bg-slate-900 focus:outline-none"
                      />
                    ) : (
                      emp.caDed > 0 ? `-${formatUSD(emp.caDed)}` : '-'
                    )}
                  </td>

                  {/* 17. NSSF */}
                  <td 
                    onClick={() => setSelectedCell({ id: emp.id, key: 'nssf' })}
                    className={`p-2.5 font-mono cursor-pointer text-red-500 transition ${selectedCell?.id === emp.id && selectedCell?.key === 'nssf' ? 'bg-slate-100 dark:bg-slate-800 p-1' : 'hover:bg-red-500/10'}`}
                  >
                    {selectedCell?.id === emp.id && selectedCell?.key === 'nssf' ? (
                      <input
                        type="number"
                        defaultValue={emp.nssf}
                        onBlur={handleCellBlur}
                        onChange={(e) => onUpdateValue(emp.id, 'nssf', parseFloat(e.target.value) || 0)}
                        autoFocus
                        className="w-16 px-1 py-0.5 rounded border border-brand-500 bg-white dark:bg-slate-900 focus:outline-none"
                      />
                    ) : (
                      emp.nssf > 0 ? `-${formatUSD(emp.nssf)}` : '-'
                    )}
                  </td>

                  {/* 18. Seniority */}
                  <td 
                    onClick={() => setSelectedCell({ id: emp.id, key: 'seniority' })}
                    className={`p-2.5 font-mono cursor-pointer transition ${selectedCell?.id === emp.id && selectedCell?.key === 'seniority' ? 'bg-slate-100 dark:bg-slate-800 p-1' : 'hover:bg-slate-500/10'}`}
                  >
                    {selectedCell?.id === emp.id && selectedCell?.key === 'seniority' ? (
                      <input
                        type="number"
                        defaultValue={emp.seniority}
                        onBlur={handleCellBlur}
                        onChange={(e) => onUpdateValue(emp.id, 'seniority', parseFloat(e.target.value) || 0)}
                        autoFocus
                        className="w-16 px-1 py-0.5 rounded border border-brand-500 bg-white dark:bg-slate-900 focus:outline-none"
                      />
                    ) : (
                      emp.seniority > 0 ? formatUSD(emp.seniority) : '-'
                    )}
                  </td>

                  {/* AUTOMATIC FORMULA-BASED COLUMNS (HIGHLIGHTED BLUE) */}
                  {/* 19. Gross Salary */}
                  <td className="p-2.5 font-bold font-mono text-indigo-600 dark:text-indigo-400 bg-blue-500/5 text-right">{formatUSD(emp.grossSalaryUSD)}</td>
                  
                  {/* 20. Paid KHR */}
                  <td className="p-2.5 font-mono text-right bg-blue-500/5 text-slate-700 dark:text-slate-300">{formatKHR(emp.salaryPaidKHR)}</td>

                  {/* 21. Spouse Relief (Toggleable) */}
                  <td className="p-2.5 text-center">
                    {emp.nat === 'Khmer' ? (
                      <input
                        type="checkbox"
                        checked={emp.spouse}
                        onChange={(e) => onUpdateValue(emp.id, 'spouse', e.target.checked)}
                        className="rounded text-brand-600 focus:ring-0 cursor-pointer w-4 h-4"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Expat</span>
                    )}
                  </td>

                  {/* 22. Kids Relief (Editable Number) */}
                  <td className="p-2.5 font-mono text-center">
                    {emp.nat === 'Khmer' ? (
                      <input
                        type="number"
                        min="0"
                        value={emp.kids}
                        onChange={(e) => onUpdateValue(emp.id, 'kids', parseInt(e.target.value) || 0)}
                        className="w-10 px-1 py-0.5 text-center bg-transparent border border-slate-200 dark:border-white/5 rounded text-[11px]"
                      />
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* 23. Allowance (Editable) */}
                  <td 
                    onClick={() => setSelectedCell({ id: emp.id, key: 'allowance' })}
                    className={`p-2.5 font-mono cursor-pointer transition ${selectedCell?.id === emp.id && selectedCell?.key === 'allowance' ? 'bg-slate-100 dark:bg-slate-800 p-1' : 'hover:bg-slate-500/10'}`}
                  >
                    {selectedCell?.id === emp.id && selectedCell?.key === 'allowance' ? (
                      <input
                        type="number"
                        defaultValue={emp.allowance}
                        onBlur={handleCellBlur}
                        onChange={(e) => onUpdateValue(emp.id, 'allowance', parseFloat(e.target.value) || 0)}
                        autoFocus
                        className="w-16 px-1 py-0.5 rounded border border-brand-500 bg-white dark:bg-slate-900 focus:outline-none"
                      />
                    ) : (
                      emp.allowance > 0 ? formatUSD(emp.allowance) : '-'
                    )}
                  </td>

                  {/* 24. Tax Base KHR */}
                  <td className="p-2.5 font-mono text-right text-indigo-600 dark:text-indigo-400 bg-indigo-500/5">{formatKHR(emp.taxBaseKHR)}</td>

                  {/* 25. Tax Rate */}
                  <td className="p-2.5 font-mono text-center bg-indigo-500/5 text-amber-500 font-bold">{emp.taxRate}</td>

                  {/* 26. Tax KHR */}
                  <td className="p-2.5 font-mono text-right text-red-500 bg-indigo-500/5">{formatKHR(emp.taxKHR)}</td>

                  {/* 27. Tax USD */}
                  <td className="p-2.5 font-mono text-right text-red-500 bg-indigo-500/5">{formatUSD(emp.taxUSD)}</td>

                  {/* 28. After Tax */}
                  <td className="p-2.5 font-mono text-right font-bold text-slate-700 dark:text-slate-300">{formatUSD(emp.salaryAfterTaxUSD)}</td>

                  {/* 29. Visa/SD add */}
                  <td 
                    onClick={() => setSelectedCell({ id: emp.id, key: 'sdReturn' })}
                    className={`p-2.5 font-mono cursor-pointer text-emerald-500 transition ${selectedCell?.id === emp.id && selectedCell?.key === 'sdReturn' ? 'bg-slate-100 dark:bg-slate-800 p-1' : 'hover:bg-emerald-500/10'}`}
                  >
                    {selectedCell?.id === emp.id && selectedCell?.key === 'sdReturn' ? (
                      <input
                        type="number"
                        defaultValue={emp.sdReturn}
                        onBlur={handleCellBlur}
                        onChange={(e) => onUpdateValue(emp.id, 'sdReturn', parseFloat(e.target.value) || 0)}
                        autoFocus
                        className="w-16 px-1 py-0.5 rounded border border-brand-500 bg-white dark:bg-slate-900 focus:outline-none"
                      />
                    ) : (
                      emp.sdReturn > 0 ? `+${formatUSD(emp.sdReturn)}` : '-'
                    )}
                  </td>

                  {/* 30. Prov Fund Deduct */}
                  <td 
                    onClick={() => setSelectedCell({ id: emp.id, key: 'provFund' })}
                    className={`p-2.5 font-mono cursor-pointer text-red-500 transition ${selectedCell?.id === emp.id && selectedCell?.key === 'provFund' ? 'bg-slate-100 dark:bg-slate-800 p-1' : 'hover:bg-red-500/10'}`}
                  >
                    {selectedCell?.id === emp.id && selectedCell?.key === 'provFund' ? (
                      <input
                        type="number"
                        defaultValue={emp.provFund}
                        onBlur={handleCellBlur}
                        onChange={(e) => onUpdateValue(emp.id, 'provFund', parseFloat(e.target.value) || 0)}
                        autoFocus
                        className="w-16 px-1 py-0.5 rounded border border-brand-500 bg-white dark:bg-slate-900 focus:outline-none"
                      />
                    ) : (
                      emp.provFund > 0 ? `-${formatUSD(emp.provFund)}` : '-'
                    )}
                  </td>

                  {/* 31. Bank Net USD */}
                  <td className="p-2.5 font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/20 text-right text-sm">
                    {formatUSD(emp.netBankUSD)}
                  </td>

                  {/* Meta edit keys */}
                  
                  {/* 32. Bank Acc */}
                  <td 
                    onClick={() => setSelectedCell({ id: emp.id, key: 'bankAcc' })}
                    className={`p-2.5 font-mono text-[10px] cursor-pointer transition ${selectedCell?.id === emp.id && selectedCell?.key === 'bankAcc' ? 'bg-slate-100 dark:bg-slate-800 p-1' : 'hover:bg-slate-500/10'}`}
                  >
                    {selectedCell?.id === emp.id && selectedCell?.key === 'bankAcc' ? (
                      <input
                        type="text"
                        defaultValue={emp.bankAcc}
                        onBlur={handleCellBlur}
                        onChange={(e) => onUpdateValue(emp.id, 'bankAcc', e.target.value)}
                        autoFocus
                        className="w-24 px-1 py-0.5 rounded border border-brand-500 bg-white dark:bg-slate-900 focus:outline-none"
                      />
                    ) : (
                      emp.bankAcc || '-'
                    )}
                  </td>

                  {/* 33. Email */}
                  <td 
                    onClick={() => setSelectedCell({ id: emp.id, key: 'email' })}
                    className={`p-2.5 text-[10px] text-brand-600 dark:text-brand-400 cursor-pointer transition ${selectedCell?.id === emp.id && selectedCell?.key === 'email' ? 'bg-slate-100 dark:bg-slate-800 p-1' : 'hover:bg-slate-500/10'}`}
                  >
                    {selectedCell?.id === emp.id && selectedCell?.key === 'email' ? (
                      <input
                        type="email"
                        defaultValue={emp.email}
                        onBlur={handleCellBlur}
                        onChange={(e) => onUpdateValue(emp.id, 'email', e.target.value)}
                        autoFocus
                        className="w-28 px-1 py-0.5 rounded border border-brand-500 bg-white dark:bg-slate-900 focus:outline-none"
                      />
                    ) : (
                      emp.email || '-'
                    )}
                  </td>

                  {/* 34. Remarks */}
                  <td 
                    onClick={() => setSelectedCell({ id: emp.id, key: 'remarks' })}
                    className={`p-2.5 text-[10px] max-w-[150px] truncate cursor-pointer transition ${selectedCell?.id === emp.id && selectedCell?.key === 'remarks' ? 'bg-slate-100 dark:bg-slate-800 p-1' : 'hover:bg-slate-500/10'}`}
                    title={emp.remarks}
                  >
                    {selectedCell?.id === emp.id && selectedCell?.key === 'remarks' ? (
                      <input
                        type="text"
                        defaultValue={emp.remarks}
                        onBlur={handleCellBlur}
                        onChange={(e) => onUpdateValue(emp.id, 'remarks', e.target.value)}
                        autoFocus
                        className="w-32 px-1 py-0.5 rounded border border-brand-500 bg-white dark:bg-slate-900 focus:outline-none"
                      />
                    ) : (
                      emp.remarks || '-'
                    )}
                  </td>

                  {/* 35. Summary Gross */}
                  <td className="p-2.5 font-mono text-right text-slate-500">{formatUSD(emp.grossForSummary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
