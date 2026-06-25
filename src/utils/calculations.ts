/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Employee, PayrollResult, SystemSettings } from '../types';

export const DEFAULT_SETTINGS: SystemSettings = {
  exchangeRate: 4050,
  spouseReliefKHR: 150000,
  childReliefKHR: 150000,
};

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 1,
    staffId: 'C001',
    name: 'Sokha Chea',
    nat: 'Khmer',
    pos: 'Manager',
    dept: 'HR',
    campus: 'Main',
    doj: '2022-01-15',
    empDate: '2022-01-15',
    basic: 2000,
    prePayPct: 100,
    absence: 0,
    maternity: 0,
    ot: 150,
    caAdd: 0,
    caDed: 50,
    nssf: 0,
    seniority: 0,
    spouse: true,
    kids: 2,
    allowance: 100,
    sdReturn: 0,
    provFund: 0,
    bankAcc: '012345678',
    email: 'sokha@sys.com',
    remarks: 'Standard Run',
  },
  {
    id: 2,
    staffId: 'C002',
    name: 'John Doe',
    nat: 'Expat',
    pos: 'Director',
    dept: 'IT',
    campus: 'North',
    doj: '2023-03-01',
    empDate: '2023-03-01',
    basic: 3500,
    prePayPct: 100,
    absence: 0,
    maternity: 0,
    ot: 0,
    caAdd: 0,
    caDed: 0,
    nssf: 0,
    seniority: 0,
    spouse: false,
    kids: 0,
    allowance: 300,
    sdReturn: 150,
    provFund: 0,
    bankAcc: '876543210',
    email: 'john@sys.com',
    remarks: 'Visa included',
  },
  {
    id: 3,
    staffId: 'C003',
    name: 'Bopha Nguon',
    nat: 'Khmer',
    pos: 'Staff',
    dept: 'Finance',
    campus: 'Main',
    doj: '2024-05-10',
    empDate: '2024-05-10',
    basic: 800,
    prePayPct: 100,
    absence: 20,
    maternity: 0,
    ot: 45,
    caAdd: 0,
    caDed: 0,
    nssf: 0,
    seniority: 0,
    spouse: true,
    kids: 1,
    allowance: 50,
    sdReturn: 0,
    provFund: 0,
    bankAcc: '112233445',
    email: 'bopha@sys.com',
    remarks: 'Absence deducted',
  },
];

export function calculatePayroll(emp: Employee, settings: SystemSettings): PayrollResult {
  const { exchangeRate, spouseReliefKHR, childReliefKHR } = settings;

  // 19. Gross Salary ($)
  // (Basic * (PrePayPct / 100)) - Absence + Maternity + Overtime + caAdd - caDed - Nssf + Seniority
  const grossSalaryUSD =
    emp.basic * (emp.prePayPct / 100) -
    emp.absence +
    emp.maternity +
    emp.ot +
    emp.caAdd -
    emp.caDed -
    emp.nssf +
    emp.seniority;

  // 20. Salary to be Paid (KHR)
  const salaryPaidKHR = grossSalaryUSD * exchangeRate;

  // 21 & 22. Relief Calculation (Only for Khmer)
  let reliefKHR = 0;
  if (emp.nat === 'Khmer') {
    if (emp.spouse) {
      reliefKHR += spouseReliefKHR;
    }
    reliefKHR += emp.kids * childReliefKHR;
  }

  // 23. Taxable Allowance in KHR
  const allowanceKHR = emp.allowance * exchangeRate;

  // 24. Salary Tax Calculation Base (KHR)
  const taxBaseKHR = Math.max(0, salaryPaidKHR - reliefKHR + allowanceKHR);

  // 25 & 26. Tax rate and Tax amount in KHR
  let taxKHR = 0;
  let taxRate = '0%';

  if (emp.nat !== 'Khmer') {
    // Non-resident: flat 20%
    taxKHR = taxBaseKHR * 0.2;
    taxRate = '20%';
  } else {
    // Resident (Khmer) tax brackets
    if (taxBaseKHR <= 1500000) {
      taxKHR = 0;
      taxRate = '0%';
    } else if (taxBaseKHR <= 2000000) {
      taxKHR = taxBaseKHR * 0.05 - 75000;
      taxRate = '5%';
    } else if (taxBaseKHR <= 8500000) {
      taxKHR = taxBaseKHR * 0.1 - 175000;
      taxRate = '10%';
    } else if (taxBaseKHR <= 12500000) {
      taxKHR = taxBaseKHR * 0.15 - 600000;
      taxRate = '15%';
    } else {
      taxKHR = taxBaseKHR * 0.2 - 1225000;
      taxRate = '20%';
    }
  }

  taxKHR = Math.max(0, taxKHR);

  // 27. Tax in USD
  const taxUSD = taxKHR / exchangeRate;

  // 28. Total Salary After Tax ($)
  const salaryAfterTaxUSD = grossSalaryUSD + emp.allowance - taxUSD;

  // 31. Salary into Bank ($)
  // After Tax ($) + Short Deposit Return - Provident Fund
  const netBankUSD = salaryAfterTaxUSD + emp.sdReturn - emp.provFund;

  // 35. Gross for Summary ($)
  const grossForSummary = grossSalaryUSD + emp.allowance + emp.sdReturn;

  return {
    ...emp,
    grossSalaryUSD,
    salaryPaidKHR,
    taxBaseKHR,
    taxRate,
    taxKHR,
    taxUSD,
    salaryAfterTaxUSD,
    netBankUSD,
    grossForSummary,
  };
}
