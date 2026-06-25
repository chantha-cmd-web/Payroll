/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Employee } from '../types';
import * as XLSX from 'xlsx';
import { 
  Plus, Upload, Download, Search, Edit2, Trash2, CheckCircle2, 
  X, Filter, FileSpreadsheet, Sparkles, HelpCircle, Users
} from 'lucide-react';

interface EmployeeMasterViewProps {
  employees: Employee[];
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: number) => void;
  onImportEmployees: (imported: Employee[]) => void;
  aiMode: boolean;
}

export default function EmployeeMasterView({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onImportEmployees,
  aiMode
}: EmployeeMasterViewProps) {
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [natFilter, setNatFilter] = useState<'All' | 'Khmer' | 'Expat'>('All');
  const [deptFilter, setDeptFilter] = useState('All');

  // Modal / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    staffId: '',
    name: '',
    nat: 'Khmer',
    pos: 'Staff',
    dept: 'Operations',
    campus: 'Main',
    doj: new Date().toISOString().split('T')[0],
    empDate: new Date().toISOString().split('T')[0],
    basic: 500,
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
    allowance: 0,
    sdReturn: 0,
    provFund: 0,
    bankAcc: '',
    email: '',
    remarks: '',
  });

  // Excel Upload Preview States
  const [isImportPreviewOpen, setIsImportPreviewOpen] = useState(false);
  const [previewImportData, setPreviewImportData] = useState<Employee[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // List of unique departments for filtering
  const departments = ['All', ...Array.from(new Set(employees.map((e) => e.dept)))];

  // Filter and search logic
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.pos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.dept.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesNat = natFilter === 'All' || emp.nat === natFilter;
    const matchesDept = deptFilter === 'All' || emp.dept === deptFilter;

    return matchesSearch && matchesNat && matchesDept;
  });

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const headers = [
      'Staff ID', 'Name', 'Nationality (Khmer/Expat)', 'Position', 'Department', 'Campus', 
      'DOJ (YYYY-MM-DD)', 'Employment Date', 'Basic Salary (USD)', 'Prepayment %', 
      'Absence (USD)', 'Maternity (USD)', 'Overtime (USD)', 'Allowance Add (USD)', 
      'Allowance Ded (USD)', 'NSSF (USD)', 'Seniority (USD)', 'Has Spouse (Yes/No)', 
      'Number of Kids', 'Taxable Allowance (USD)', 'Short Deposit Return (USD)', 
      'Provident Fund (USD)', 'Bank Account', 'Email', 'Remarks'
    ];

    const sampleRow = [
      'C004', 'Phalla Kim', 'Khmer', 'Supervisor', 'Production', 'Main', 
      '2025-02-15', '2025-02-15', '1100', '100', 
      '0', '0', '75', '15', 
      '0', '0', '0', 'Yes', 
      '3', '50', '0', '0', '012998877', 'phalla.kim@sys.com', 'Imported via template'
    ];

    const wsData = [headers, sampleRow];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths for better readability
    ws['!cols'] = headers.map(() => ({ wch: 22 }));

    XLSX.utils.book_append_sheet(wb, ws, 'Cambodian Payroll Template');
    XLSX.writeFile(wb, 'Cambodian_Payroll_Template.xlsx');
  };

  // Parsing excel and CSV files
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[];

        if (rawRows.length < 2) {
          setImportError('The uploaded file must contain a header row and at least one data row.');
          return;
        }

        // Find the header row (first row with at least 3 non-empty string cells)
        let headerRowIdx = 0;
        for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
          const stringCells = rawRows[i].filter((c: any) => typeof c === 'string' && c.trim().length > 0);
          if (stringCells.length >= 3) {
            headerRowIdx = i;
            break;
          }
        }

        const headers = rawRows[headerRowIdx].map((h: any) => String(h || '').trim().toLowerCase());
        const dataRows = rawRows.slice(headerRowIdx + 1).filter(row => row && row.length > 0 && row.some((c: any) => c !== undefined && c !== ''));

        // Map column headers to Employee properties
        const mappedData: Employee[] = dataRows.map((row, idx) => {
          const getVal = (colNames: string[], defaultVal: any = '') => {
            const foundIdx = headers.findIndex((h: string) => {
              return colNames.some(c => 
                h === c || 
                h.startsWith(c + ' ') || 
                h.endsWith(' ' + c) || 
                h.includes(' ' + c + ' ') || 
                (h.includes(c) && c.length > 3)
              );
            });
            if (foundIdx !== -1 && row[foundIdx] !== undefined && row[foundIdx] !== '') {
              return row[foundIdx];
            }
            return defaultVal;
          };

          const parseBoolean = (val: any) => {
            if (typeof val === 'boolean') return val;
            const s = String(val).toLowerCase().trim();
            return s === 'yes' || s === 'true' || s === '1' || s === 'y' || s === 'spouse';
          };

          const parseNum = (val: any) => {
            const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
            return isNaN(num) ? 0 : num;
          };

          const natVal = String(getVal(['nationality', 'nat'], 'Khmer')).trim().toLowerCase();
          const nat: 'Khmer' | 'Expat' = natVal.includes('expat') || natVal.includes('foreign') ? 'Expat' : 'Khmer';

          return {
            id: Date.now() + idx, // temporary unique ID
            staffId: String(getVal(['staff id', 'staffid', 'code', 'id'], `C${100 + employees.length + idx + 1}`)).trim(),
            name: String(getVal(['name', 'full name', 'names'], 'Unnamed Employee')).trim(),
            nat,
            pos: String(getVal(['position', 'pos', 'role'], 'Staff')).trim(),
            dept: String(getVal(['department', 'dept', 'section'], 'Operations')).trim(),
            campus: String(getVal(['campus', 'branch', 'location'], 'Main')).trim(),
            doj: String(getVal(['doj', 'join date', 'date of join'], new Date().toISOString().split('T')[0])).trim(),
            empDate: String(getVal(['employment date', 'emp date', 'hire date'], new Date().toISOString().split('T')[0])).trim(),
            basic: parseNum(getVal(['basic', 'salary', 'base'], 500)),
            prePayPct: parseNum(getVal(['prepayment', 'pre pay', 'pct'], 100)),
            absence: parseNum(getVal(['absence', 'abs'], 0)),
            maternity: parseNum(getVal(['maternity', 'mat'], 0)),
            ot: parseNum(getVal(['overtime', 'ot'], 0)),
            caAdd: parseNum(getVal(['allowance add', 'caadd', 'addition'], 0)),
            caDed: parseNum(getVal(['allowance ded', 'ceded', 'deduction'], 0)),
            nssf: parseNum(getVal(['nssf', 'social security'], 0)),
            seniority: parseNum(getVal(['seniority'], 0)),
            spouse: parseBoolean(getVal(['spouse', 'has spouse', 'wife', 'husband'], false)),
            kids: parseNum(getVal(['kids', 'children', 'dependents'], 0)),
            allowance: parseNum(getVal(['allowance', 'taxable allowance'], 0)),
            sdReturn: parseNum(getVal(['short deposit', 'sd return', 'visa'], 0)),
            provFund: parseNum(getVal(['provident', 'prov fund', 'pf'], 0)),
            bankAcc: String(getVal(['bank account', 'bank acc', 'account'], '')).trim(),
            email: String(getVal(['email', 'mail'], '')).trim(),
            remarks: String(getVal(['remarks', 'comment', 'note'], 'Imported via Excel')).trim(),
          };
        });

        setPreviewImportData(mappedData);
        setIsImportPreviewOpen(true);
      } catch (err: any) {
        setImportError(`Failed to parse Excel file: ${err.message || err}`);
      }
    };

    reader.readAsBinaryString(file);
  };

  const confirmImport = () => {
    onImportEmployees(previewImportData);
    setIsImportPreviewOpen(false);
    setPreviewImportData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle individual employee Save/Edit
  const handleOpenForm = (emp?: Employee) => {
    if (emp) {
      setEditingEmployee(emp);
      setFormData({ ...emp });
    } else {
      setEditingEmployee(null);
      setFormData({
        staffId: `C00${employees.length + 1}`,
        name: '',
        nat: 'Khmer',
        pos: 'Staff',
        dept: 'Operations',
        campus: 'Main',
        doj: new Date().toISOString().split('T')[0],
        empDate: new Date().toISOString().split('T')[0],
        basic: 500,
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
        allowance: 0,
        sdReturn: 0,
        provFund: 0,
        bankAcc: '',
        email: '',
        remarks: '',
      });
    }
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      onUpdateEmployee({
        ...formData,
        id: editingEmployee.id,
      });
    } else {
      onAddEmployee({
        ...formData,
        id: Date.now(),
      });
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* File uploader controls & actions header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-slate-900/40">
        <div className="space-y-1">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-500" />
            Employee Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Import Excel datasets or manually append employee information to trigger automatic payroll calculations.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Download template */}
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-2 border border-slate-200 dark:border-white/5"
            title="Download the GDT calculation standard Excel sheet template"
          >
            <Download className="w-4 h-4" />
            Template.xlsx
          </button>

          {/* Upload Excel */}
          <label className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-2 border border-slate-200 dark:border-white/5 cursor-pointer">
            <Upload className="w-4 h-4" />
            Import Excel
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleExcelUpload}
              className="hidden"
            />
          </label>

          {/* Add Manual Employee */}
          <button
            onClick={() => handleOpenForm()}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {importError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2">
          <X className="w-5 h-5 cursor-pointer" onClick={() => setImportError(null)} />
          <span>{importError}</span>
        </div>
      )}

      {/* Filters & search panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass p-4 rounded-xl border border-slate-200 dark:border-white/10">
        {/* Search bar */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, name, position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        {/* Filters dropdowns */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Nationality Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Nat:</span>
            <select
              value={natFilter}
              onChange={(e) => setNatFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-medium focus:outline-none"
            >
              <option value="All">All</option>
              <option value="Khmer">Khmer</option>
              <option value="Expat">Expat</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Dept:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-medium focus:outline-none"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employees grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            No employees match the current filters. Click "Add Employee" to enter data.
          </div>
        ) : (
          filteredEmployees.map((emp) => (
            <div 
              key={emp.id} 
              className="glass p-5 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col justify-between shadow-sm bg-white/30 dark:bg-slate-900/30 hover:shadow-md transition duration-300"
            >
              <div>
                {/* ID & nationality tag */}
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono text-xs text-brand-600 dark:text-brand-400 font-bold bg-brand-500/10 px-2.5 py-1 rounded-md">{emp.staffId}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${emp.nat === 'Khmer' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {emp.nat}
                  </span>
                </div>

                {/* Name & Position */}
                <h3 className="font-bold text-base tracking-tight">{emp.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{emp.pos}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                    {emp.dept}
                  </span>
                  <span className="text-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20">
                    {emp.campus}
                  </span>
                </div>

                {/* Main figures */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Basic Salary:</span>
                    <p className="font-bold text-slate-700 dark:text-slate-200">${emp.basic.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Prepayment %:</span>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{emp.prePayPct}%</p>
                  </div>
                  <div className="col-span-2 mt-1">
                    <span className="text-slate-400">Reliefs:</span>
                    <p className="text-slate-600 dark:text-slate-300">
                      {emp.nat === 'Khmer' 
                        ? `${emp.spouse ? 'Spouse ' : ''}${emp.kids > 0 ? `• ${emp.kids} kids` : ''}` 
                        : 'No reliefs (Expat)'}
                      {!emp.spouse && emp.kids === 0 && emp.nat === 'Khmer' ? 'None' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-2.5">
                <button
                  onClick={() => onDeleteEmployee(emp.id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                  title="Delete employee"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenForm(emp)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manual Add/Edit Form Drawer (Modal) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl p-6 flex flex-col justify-between animate-fade-in">
            {/* Header */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">{editingEmployee ? 'Edit Employee Record' : 'Add New Employee'}</h3>
                <button onClick={() => setIsFormOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-5 text-sm">
                {/* ID & Name & Nat */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Staff ID *</label>
                    <input
                      type="text"
                      required
                      value={formData.staffId}
                      onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Nationality *</label>
                    <select
                      value={formData.nat}
                      onChange={(e) => setFormData({ ...formData, nat: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none"
                    >
                      <option value="Khmer">Khmer</option>
                      <option value="Expat">Expat</option>
                    </select>
                  </div>
                </div>

                {/* Position & Dept & Campus */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Position</label>
                    <input
                      type="text"
                      value={formData.pos}
                      onChange={(e) => setFormData({ ...formData, pos: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Department</label>
                    <input
                      type="text"
                      value={formData.dept}
                      onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Campus / Location</label>
                    <input
                      type="text"
                      value={formData.campus}
                      onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Dates & Bank & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Date of Join (DOJ)</label>
                    <input
                      type="date"
                      value={formData.doj}
                      onChange={(e) => setFormData({ ...formData, doj: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Employment Date</label>
                    <input
                      type="date"
                      value={formData.empDate}
                      onChange={(e) => setFormData({ ...formData, empDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      value={formData.bankAcc}
                      onChange={(e) => setFormData({ ...formData, bankAcc: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Main Salary & Allowances (Numeric) */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-full">
                    <span className="font-bold text-xs text-brand-600 dark:text-brand-400 uppercase tracking-wider">Salary & Base Pay Settings</span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1">Basic Salary ($)</label>
                    <input
                      type="number"
                      value={formData.basic}
                      onChange={(e) => setFormData({ ...formData, basic: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 focus:outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1">Prepay %</label>
                    <input
                      type="number"
                      value={formData.prePayPct}
                      onChange={(e) => setFormData({ ...formData, prePayPct: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 focus:outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1">Overtime ($)</label>
                    <input
                      type="number"
                      value={formData.ot}
                      onChange={(e) => setFormData({ ...formData, ot: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 focus:outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1">Maternity ($)</label>
                    <input
                      type="number"
                      value={formData.maternity}
                      onChange={(e) => setFormData({ ...formData, maternity: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 focus:outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1">Absences (-$)</label>
                    <input
                      type="number"
                      value={formData.absence}
                      onChange={(e) => setFormData({ ...formData, absence: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 focus:outline-none text-xs text-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1">NSSF Contribution</label>
                    <input
                      type="number"
                      value={formData.nssf}
                      onChange={(e) => setFormData({ ...formData, nssf: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 focus:outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1">Seniority ($)</label>
                    <input
                      type="number"
                      value={formData.seniority}
                      onChange={(e) => setFormData({ ...formData, seniority: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 focus:outline-none text-xs text-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1">Taxable Allowance</label>
                    <input
                      type="number"
                      value={formData.allowance}
                      onChange={(e) => setFormData({ ...formData, allowance: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Dependents and adjustments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tax reliefs block */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-white/10 space-y-3">
                    <span className="font-bold text-xs text-slate-500 uppercase tracking-wider block">GDT Tax Relief Declarations</span>
                    
                    {formData.nat === 'Expat' ? (
                      <p className="text-xs text-amber-500">Expat employee is treated as non-resident. Flat tax structure applies without dependents relief.</p>
                    ) : (
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={formData.spouse}
                            onChange={(e) => setFormData({ ...formData, spouse: e.target.checked })}
                            className="rounded text-brand-600 focus:ring-0 w-4 h-4"
                          />
                          <span>Spouse Relief (150,000 KHR deduction)</span>
                        </label>

                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Number of Children Reliefs</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.kids}
                            onChange={(e) => setFormData({ ...formData, kids: parseInt(e.target.value) || 0 })}
                            className="w-24 px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bank payout adjustments */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-white/10 space-y-3">
                    <span className="font-bold text-xs text-slate-500 uppercase tracking-wider block">Bank Transfer Settings</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Visa/SD Additions</label>
                        <input
                          type="number"
                          value={formData.sdReturn}
                          onChange={(e) => setFormData({ ...formData, sdReturn: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Provident Fund Deduct</label>
                        <input
                          type="number"
                          value={formData.provFund}
                          onChange={(e) => setFormData({ ...formData, provFund: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Remarks / Internal Comments</label>
                  <textarea
                    rows={2}
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none"
                    placeholder="Enter notes about visa, NSSF changes, etc."
                  />
                </div>
              </form>
            </div>

            {/* Footer Buttons */}
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3 bg-white dark:bg-slate-900 sticky bottom-0">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFormSubmit}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg transition shadow-[0_0_15px_rgba(37,99,235,0.2)]"
              >
                {editingEmployee ? 'Update Profile' : 'Add Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Confirmation Preview Modal */}
      {isImportPreviewOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[85vh] rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col justify-between overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
                <div>
                  <h3 className="font-bold text-lg">Excel Import Data Preview</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Review mapped columns and rows before finalizing the run.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsImportPreviewOpen(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Import rows preview */}
            <div className="flex-1 overflow-auto p-6 table-container">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold">Staff ID</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold">Name</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold">Nationality</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold">Position</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold">Department</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold">Campus</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold">Basic ($)</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold">Allowance ($)</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold">Reliefs</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold">Bank Acc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  {previewImportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="p-3 font-mono font-semibold">{row.staffId}</td>
                      <td className="p-3 font-medium">{row.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${row.nat === 'Khmer' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {row.nat}
                        </span>
                      </td>
                      <td className="p-3">{row.pos}</td>
                      <td className="p-3">{row.dept}</td>
                      <td className="p-3">{row.campus}</td>
                      <td className="p-3 font-mono">${row.basic.toLocaleString()}</td>
                      <td className="p-3 font-mono">${row.allowance.toLocaleString()}</td>
                      <td className="p-3 text-slate-500">
                        {row.nat === 'Khmer' 
                          ? `${row.spouse ? 'Spouse ' : ''}${row.kids > 0 ? `• ${row.kids} kids` : ''}` 
                          : 'None'}
                        {!row.spouse && row.kids === 0 && row.nat === 'Khmer' ? 'None' : ''}
                      </td>
                      <td className="p-3 font-mono text-[11px]">{row.bankAcc || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Parsed {previewImportData.length} valid employee records from spreadsheet.
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsImportPreviewOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Discard
                </button>
                <button
                  onClick={confirmImport}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  Confirm Import & Process
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
