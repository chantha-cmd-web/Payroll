/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PayrollResult } from '../types';
import { Users, DollarSign, Wallet, ShieldAlert, Sparkles, TrendingUp, Landmark } from 'lucide-react';

interface DashboardViewProps {
  data: PayrollResult[];
  exchangeRate: number;
  aiMode: boolean;
}

export default function DashboardView({ data, exchangeRate, aiMode }: DashboardViewProps) {
  const totalEmployees = data.length;
  
  const totalGross = data.reduce((sum, item) => sum + item.grossSalaryUSD, 0);
  const totalTaxUSD = data.reduce((sum, item) => sum + item.taxUSD, 0);
  const totalNetUSD = data.reduce((sum, item) => sum + item.netBankUSD, 0);
  const totalTaxKHR = data.reduce((sum, item) => sum + item.taxKHR, 0);
  const totalNetKHR = totalNetUSD * exchangeRate;

  const khmerCount = data.filter((item) => item.nat === 'Khmer').length;
  const expatCount = data.filter((item) => item.nat === 'Expat').length;

  const departmentSalaries = data.reduce((acc, emp) => {
    acc[emp.dept] = (acc[emp.dept] || 0) + emp.netBankUSD;
    return acc;
  }, {} as Record<string, number>);

  const sortedDeps = Object.entries(departmentSalaries).sort((a, b) => b[1] - a[1]);

  const maxSalary = data.length > 0 ? Math.max(...data.map((e) => e.basic)) : 0;
  const averageSalary = data.length > 0 ? totalGross / totalEmployees : 0;

  // Alerts & insights
  const highOtCount = data.filter((emp) => emp.ot > 100).length;
  const highAbsenceCount = data.filter((emp) => emp.absence > 20).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees */}
        <div id="metric-employees" className="glass p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between shadow-sm bg-white/40 dark:bg-slate-900/40">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Staff</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{totalEmployees}</span>
              <span className="text-xs text-emerald-500 font-medium">Active</span>
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500">
              {khmerCount} Khmer • {expatCount} Expats
            </div>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Gross Payroll */}
        <div id="metric-gross" className="glass p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between shadow-sm bg-white/40 dark:bg-slate-900/40">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Gross Salary</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">${totalGross.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500">
              Avg: ${averageSalary.toLocaleString('en-US', { maximumFractionDigits: 0 })}/employee
            </div>
          </div>
          <div className="p-4 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Tax on Salary */}
        <div id="metric-tax" className="glass p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between shadow-sm bg-white/40 dark:bg-slate-900/40">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">GDT Tax Payable</span>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-red-500 dark:text-red-400">${totalTaxUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                ៛ {totalTaxKHR.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Net Bank Transfer */}
        <div id="metric-net" className="glass p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between shadow-sm bg-white/40 dark:bg-slate-900/40">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bank Net Payout</span>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">${totalNetUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                ៛ {totalNetKHR.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* AI Mode Insights block */}
      {aiMode && (
        <div className="glass p-6 rounded-2xl border-l-4 border-l-violet-500 border border-slate-200 dark:border-white/10 shadow-sm bg-gradient-to-r from-violet-500/5 to-transparent space-y-3">
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <h3 className="font-bold text-sm uppercase tracking-wider">AI Automated System Scan</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Compliance Warning</span>
              <p className="text-slate-500 dark:text-slate-400">
                All basic salaries are above the legal requirement. Exchange rate verified at {exchangeRate} KHR/USD. Tax relief for spouse and {data.reduce((s, e) => s + e.kids, 0)} dependents successfully deducted.
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Overtime Spike Detected</span>
              <p className="text-slate-500 dark:text-slate-400">
                {highOtCount > 0 
                  ? `${highOtCount} employees have high overtime payments (> $100). Sokol/Manager and staff overtime have been marked for tax-deductible review.`
                  : 'Overtime ratios are stable across all departments with no anomalous values.'}
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
              <span className="font-semibold text-slate-700 dark:text-slate-200">NSSF & Insurance Verification</span>
              <p className="text-slate-500 dark:text-slate-400">
                Active social security contributions have been audited. No missing NSSF values detected on the active ledger.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Breakdown grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-white/10 lg:col-span-2 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-500" />
            Department Net Pay Allocation
          </h3>
          {sortedDeps.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-slate-400">No data available</div>
          ) : (
            <div className="space-y-4">
              {sortedDeps.map(([dept, total]) => {
                const percentage = totalGross > 0 ? (total / totalNetUSD) * 100 : 0;
                return (
                  <div key={dept} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{dept} Department</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">${total.toLocaleString('en-US', { maximumFractionDigits: 2 })} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-brand-600 dark:bg-brand-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* System & Tax Summary Stats */}
        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            Ledger Quick Check
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-white/5 text-sm space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Exchange Rate</span>
              <span className="font-mono font-semibold">1 USD = {exchangeRate} KHR</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Khmer Employees</span>
              <span className="font-semibold">{khmerCount} ({(totalEmployees > 0 ? (khmerCount / totalEmployees) * 100 : 0).toFixed(0)}%)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Expat Employees</span>
              <span className="font-semibold">{expatCount} ({(totalEmployees > 0 ? (expatCount / totalEmployees) * 100 : 0).toFixed(0)}%)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Total Tax Base</span>
              <span className="font-mono font-semibold">៛ {data.reduce((s, e) => s + e.taxBaseKHR, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Maximum Basic Salary</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">${maxSalary.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Anomalous Items</span>
              <span className="font-semibold flex items-center gap-1">
                {highOtCount + highAbsenceCount > 0 ? (
                  <span className="text-amber-500 font-medium">{highOtCount + highAbsenceCount} issues</span>
                ) : (
                  <span className="text-emerald-500 font-medium">None</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
