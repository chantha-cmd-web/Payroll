/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Employee, PayrollResult, SystemSettings } from './types';
import { calculatePayroll, DEFAULT_SETTINGS, INITIAL_EMPLOYEES } from './utils/calculations';
import DashboardView from './components/DashboardView';
import EmployeeMasterView from './components/EmployeeMasterView';
import PayrollProcessingView from './components/PayrollProcessingView';
import PayslipCenterView from './components/PayslipCenterView';
import TaxExportView from './components/TaxExportView';
import ExpenseReportView from './components/ExpenseReportView';
import SettingsView from './components/SettingsView';
import { initAuth, googleSignIn, logout, getAccessToken } from './utils/googleAuth';
import { backupDataToDrive, restoreDataFromDrive } from './utils/googleDrive';
import { 
  syncFirestore, 
  saveSettingsToFirestore, 
  saveEmployeeToFirestore, 
  deleteEmployeeFromFirestore,
  saveAllEmployeesToFirestore
} from './utils/firebaseSync';
import { User } from 'firebase/auth';
import { 
  LayoutDashboard, Users, Calculator, Receipt, DownloadCloud, 
  Settings, Sun, Moon, Sparkles, ChevronLeft, ChevronRight, Menu, Building2
} from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [aiMode, setAiMode] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Core App State
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);

  // Apply dark mode styling to html tag
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      // Adding larger text scale base for dark mode and bold text as requested
      document.documentElement.classList.add('text-lg', 'font-bold');
    } else {
      document.documentElement.classList.remove('dark', 'text-lg', 'font-bold');
    }
  }, [darkMode]);

  // Init Google Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (loggedInUser) => {
        setUser(loggedInUser);
        setNeedsAuth(false);
      },
      () => {
        setUser((prevUser) => {
          if (prevUser && prevUser.uid === 'admin_local') {
            return prevUser; // Keep local admin
          }
          setTimeout(() => setNeedsAuth(true), 0);
          return null;
        });
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync to Firebase whenever user logs in
  useEffect(() => {
    if (user) {
      // Skip Firestore sync for local admin to prevent permission denied errors
      if (user.uid === 'admin_local') {
        return;
      }
      
      let unsub = () => {};
      try {
        unsub = syncFirestore(
          user.uid,
          (syncedEmployees, syncedSettings) => {
            if (syncedEmployees.length > 0) {
              setEmployees(syncedEmployees);
            }
            if (syncedSettings) {
              setSettings(syncedSettings);
            }
          },
          (error) => console.error("Firebase sync error:", error)
        );
      } catch (err) {
        console.error("Failed to initialize Firebase sync:", err);
      }
      
      return () => unsub();
    }
  }, [user]);

  // Recalculated payroll results whenever employees list or settings change
  const processedData: PayrollResult[] = useMemo(() => {
    return employees.map((emp) => calculatePayroll(emp, settings));
  }, [employees, settings]);

  // Callback to append a manually added employee
  const handleAddEmployee = async (newEmp: Employee) => {
    setEmployees((prev) => [...prev, newEmp]);
    if (user && user.uid !== 'admin_local') {
      await saveEmployeeToFirestore(user.uid, newEmp);
    }
  };

  // Callback to update an edited employee
  const handleUpdateEmployee = async (updatedEmp: Employee) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === updatedEmp.id ? updatedEmp : emp))
    );
    if (user && user.uid !== 'admin_local') {
      await saveEmployeeToFirestore(user.uid, updatedEmp);
    }
  };

  // Callback to delete an employee
  const handleDeleteEmployee = async (id: number) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    if (user && user.uid !== 'admin_local') {
      await deleteEmployeeFromFirestore(user.uid, id);
    }
  };

  // Callback to append multiple employees from Excel
  const handleImportEmployees = async (imported: Employee[]) => {
    let newEmployees: Employee[] = [];
    setEmployees((prev) => {
      // Find the maximum current numerical ID to continue numbering
      const maxId = prev.length > 0 ? Math.max(...prev.map((e) => e.id)) : 0;
      
      newEmployees = imported.map((emp, idx) => ({
        ...emp,
        id: maxId + idx + 1,
      }));

      return [...prev, ...newEmployees];
    });
    if (user && user.uid !== 'admin_local' && newEmployees.length > 0) {
      await saveAllEmployeesToFirestore(user.uid, newEmployees);
    }
  };

  // Callback for inline sheet cell changes
  const handleUpdateValue = async (id: number, key: string, value: any) => {
    let updatedEmp: Employee | null = null;
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === id) {
          updatedEmp = {
            ...emp,
            [key]: value,
          };
          return updatedEmp;
        }
        return emp;
      })
    );
    if (user && user.uid !== 'admin_local' && updatedEmp) {
      await saveEmployeeToFirestore(user.uid, updatedEmp);
    }
  };

  // Callback for GDT setting updates
  const handleUpdateSettings = async (newSettings: SystemSettings) => {
    setSettings(newSettings);
    if (user && user.uid !== 'admin_local') {
      await saveSettingsToFirestore(user.uid, newSettings);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
  };

  const handleBackupToDrive = async () => {
    try {
      setIsSyncing(true);
      await backupDataToDrive({ employees, settings });
      alert('Successfully backed up to Google Drive!');
    } catch (err) {
      console.error(err);
      alert('Failed to backup to Google Drive.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestoreFromDrive = async () => {
    const confirmed = window.confirm('Are you sure you want to restore from Google Drive? This will overwrite your current employees and settings. This action cannot be undone.');
    if (!confirmed) return;
    
    try {
      setIsSyncing(true);
      const data = await restoreDataFromDrive();
      if (data.employees) setEmployees(data.employees);
      if (data.settings) setSettings(data.settings);
      alert('Successfully restored from Google Drive!');
    } catch (err) {
      console.error(err);
      alert('Failed to restore from Google Drive. No backup found or error occurred.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Render correct view based on active tab
  const renderActiveView = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <DashboardView 
            data={processedData} 
            exchangeRate={settings.exchangeRate} 
            aiMode={aiMode} 
          />
        );
      case 'employees':
        return (
          <EmployeeMasterView
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onImportEmployees={handleImportEmployees}
            aiMode={aiMode}
          />
        );
      case 'payroll':
        return (
          <PayrollProcessingView
            data={processedData}
            onUpdateValue={handleUpdateValue}
            exchangeRate={settings.exchangeRate}
            aiMode={aiMode}
          />
        );
      case 'payslips':
        return (
          <PayslipCenterView 
            data={processedData} 
            exchangeRate={settings.exchangeRate} 
          />
        );
      case 'reports':
        return (
          <TaxExportView 
            data={processedData} 
            exchangeRate={settings.exchangeRate} 
          />
        );
      case 'expense-report':
        return (
          <ExpenseReportView 
            payrollData={processedData}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            settings={settings} 
            onUpdateSettings={handleUpdateSettings}
            user={user}
            needsAuth={needsAuth}
            isSyncing={isSyncing}
            onGoogleLogin={handleGoogleLogin}
            onGoogleLogout={handleGoogleLogout}
            onBackup={handleBackupToDrive}
            onRestore={handleRestoreFromDrive}
          />
        );
      default:
        return null;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employee Master', icon: Users },
    { id: 'payroll', label: 'Payroll Processing', icon: Calculator },
    { id: 'payslips', label: 'Payslip Center', icon: Receipt },
    { id: 'reports', label: 'Tax & Bank Export', icon: DownloadCloud },
    { id: 'expense-report', label: 'Expense Report', icon: Building2 },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  if (!user && needsAuth) {
    return (
      <div className="flex h-screen items-center justify-center relative bg-slate-50 text-slate-900 dark:bg-[#000033] dark:text-white dark:font-bold overflow-hidden font-sans text-lg md:text-xl">
        {/* Dark mode background ambient glows */}
        {darkMode && (
          <>
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
          </>
        )}
        
        <div className="z-10 w-full max-w-md p-10 rounded-3xl border border-white/40 dark:border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-[20px] flex flex-col items-center space-y-6 animate-fade-in bg-white/40 dark:bg-[#000033]/40 relative overflow-hidden">
          {/* Subtle reflection overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent dark:from-white/5 pointer-events-none rounded-3xl"></div>
          
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-4xl shadow-[0_0_40px_rgba(37,99,235,0.6)] transform hover:scale-105 transition-transform duration-500">
            W
          </div>
          <div className="space-y-3 text-center relative z-10 w-full">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-blue-200 drop-shadow-sm">Payroll Portal</h1>
            <p className="text-sm text-slate-600 dark:text-blue-100/80 font-semibold tracking-wide mb-4">Secure access to your enterprise</p>
            
            {loginError && (
              <div className="text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-2 rounded-lg font-semibold animate-fade-in">
                {loginError}
              </div>
            )}

            <div className="space-y-4 w-full mt-4 text-left">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">User ID</label>
                <input 
                  type="text" 
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  placeholder="Enter your user ID"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  placeholder="Enter your password"
                />
              </div>
              <button 
                onClick={() => {
                  if (loginId.trim() === 'admin' && password.trim() === 'admin123') {
                    setUser({ uid: 'admin_local', email: 'admin@system.local', displayName: 'System Administrator' } as any);
                    setNeedsAuth(false);
                    setLoginError('');
                  } else {
                    setLoginError('Invalid credentials');
                  }
                }}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-brand-500/30"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen relative bg-slate-50 text-slate-900 dark:bg-[#000033] dark:text-white dark:font-bold min-h-screen overflow-hidden font-sans text-lg md:text-xl">
      {/* Dark mode background ambient glows */}
      {darkMode && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
        </>
      )}

      {/* Sidebar */}
      <aside className={`glass border-r border-slate-200 dark:border-white/10 flex flex-col transition-all duration-300 z-20 print:hidden ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Sidebar Header */}
        <div className="px-4 py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(37,99,235,0.3)]">W</div>
              <span className="font-extrabold text-sm tracking-tight">Payroll Portal</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition text-slate-500 dark:text-slate-400"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-left text-sm font-medium transition-all duration-300 border border-transparent ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 py-4 border-t border-slate-200 dark:border-white/10 text-center">
          {!sidebarCollapsed ? (
            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Cambodia Systems v2.4</span>
          ) : (
            <span className="text-[10px] text-slate-400 font-extrabold font-mono">v2.4</span>
          )}
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex flex-col flex-1 overflow-hidden z-10">
        {/* Header */}
        <header className="glass px-6 py-4 flex justify-between items-center border-b border-slate-200 dark:border-white/10 print:hidden">
          <div>
            <h1 className="text-base font-extrabold tracking-tight md:text-lg flex items-center gap-2">
              Cambodia Payroll & Tax System
            </h1>
            <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium">GDT Compliant Standard Engine</p>
          </div>

          <div className="flex items-center gap-4">
            {/* AI Assistant Mode Toggle */}
            <button 
              onClick={() => setAiMode(!aiMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-semibold transition-all duration-300 border ${
                aiMode 
                  ? 'bg-violet-500/10 text-violet-600 dark:text-violet-300 border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${aiMode ? 'animate-pulse text-violet-500' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">AI Assistant {aiMode ? 'ON' : 'OFF'}</span>
            </button>

            {/* Light/Dark Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
            
            {/* User Profile Info */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-brand-500/10 border border-brand-500/20 overflow-hidden flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xs">
                AD
              </div>
              <span className="text-xs font-semibold hidden md:block">HR Administrator</span>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Main Panel */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col print:p-0 print:overflow-visible">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
