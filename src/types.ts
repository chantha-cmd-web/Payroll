/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Employee {
  id: number;
  staffId: string;
  name: string;
  nat: 'Khmer' | 'Expat';
  pos: string;
  dept: string;
  campus: string;
  doj: string; // Date of Join (YYYY-MM-DD)
  empDate: string; // Employment Date (YYYY-MM-DD)
  basic: number; // Basic Salary in USD
  prePayPct: number; // Prepayment % (typically 100)
  absence: number; // Absence deduction in USD
  maternity: number; // Maternity allowance in USD
  ot: number; // Overtime amount in USD
  caAdd: number; // Cash Allowance Added in USD
  caDed: number; // Cash Allowance Deducted in USD
  nssf: number; // NSSF contribution in USD
  seniority: number; // Seniority pay in USD
  spouse: boolean; // Has spouse for relief
  kids: number; // Number of kids for relief
  allowance: number; // Taxable Allowance in USD
  sdReturn: number; // Short Deposit or Visa return in USD
  provFund: number; // Provident Fund deduction in USD
  bankAcc: string; // Bank account number
  email: string; // Email address
  remarks: string; // Comments / Remarks
}

export interface PayrollResult extends Employee {
  grossSalaryUSD: number; // 19. Gross Salary
  salaryPaidKHR: number; // 20. Salary to be Paid (KHR)
  taxBaseKHR: number; // 24. Salary Tax Calculation Base (KHR)
  taxRate: string; // 25. Tax Rate %
  taxKHR: number; // 26. Tax on Salary (KHR)
  taxUSD: number; // 27. Tax on Salary (USD)
  salaryAfterTaxUSD: number; // 28. Salary After Tax ($)
  netBankUSD: number; // 31. Salary into Bank ($)
  grossForSummary: number; // 35. Gross for Summary ($)
}

export interface SystemSettings {
  exchangeRate: number; // KHR per USD
  spouseReliefKHR: number; // Spouse tax deduction amount (150,000 KHR)
  childReliefKHR: number; // Child tax deduction amount (150,000 KHR)
}
