/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SystemSettings } from '../types';
import { User } from 'firebase/auth';
import { 
  Settings, Landmark, DollarSign, HelpCircle, Save, CheckCircle, 
  BookOpen, Percent, RefreshCw, Cloud, LogOut
} from 'lucide-react';

interface SettingsViewProps {
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  user: User | null;
  needsAuth: boolean;
  isSyncing: boolean;
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
  onBackup: () => void;
  onRestore: () => void;
}

export default function SettingsView({ 
  settings, 
  onUpdateSettings,
  user,
  needsAuth,
  isSyncing,
  onGoogleLogin,
  onGoogleLogout,
  onBackup,
  onRestore
}: SettingsViewProps) {
  const [success, setSuccess] = React.useState(false);

  const handleExchangeRateChange = (val: number) => {
    onUpdateSettings({ ...settings, exchangeRate: val });
    triggerSuccess();
  };

  const handleSpouseReliefChange = (val: number) => {
    onUpdateSettings({ ...settings, spouseReliefKHR: val });
    triggerSuccess();
  };

  const handleChildReliefChange = (val: number) => {
    onUpdateSettings({ ...settings, childReliefKHR: val });
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Toast */}
      {success && (
        <div className="fixed top-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-2xl border border-emerald-500 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">Settings Saved & Re-calculated on Live Ledger!</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Drive Integration */}
        <div className="md:col-span-2 glass p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4 bg-white/40 dark:bg-slate-900/40">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-500" />
            Google Drive Data Sync
          </h3>
          <div className="space-y-4 text-xs">
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Connect your Google Drive account to backup and restore your employee and payroll data. 
              Data is saved as a secure JSON file in your personal Drive.
            </p>
            
            {!user ? (
              <button 
                onClick={onGoogleLogin}
                className="gsi-material-button inline-block bg-white text-gray-700 border border-gray-300 rounded shadow-sm hover:bg-gray-50 px-4 py-2 flex items-center gap-2"
              >
                <div className="w-5 h-5">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="font-semibold text-sm">Sign in with Google</span>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {user.photoURL && <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200" />}
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{user.displayName || 'Google User'}</div>
                    <div className="text-[10px] text-slate-500">{user.email}</div>
                  </div>
                  <button onClick={onGoogleLogout} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="font-semibold text-[10px]">Sign out</span>
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-3 pt-2">
                  <button 
                    onClick={onBackup}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span className="font-semibold">{isSyncing ? 'Syncing...' : 'Backup to Google Drive'}</span>
                  </button>
                  <button 
                    onClick={onRestore}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span className="font-semibold">{isSyncing ? 'Loading...' : 'Restore from Google Drive'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Core Parameters */}
        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4 bg-white/40 dark:bg-slate-900/40">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-500" />
            Core GDT Parameters
          </h3>

          <div className="space-y-4 text-xs">
            {/* Exchange Rate */}
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Standard Exchange Rate (KHR per USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">៛</span>
                <input
                  type="number"
                  value={settings.exchangeRate}
                  onChange={(e) => handleExchangeRateChange(parseFloat(e.target.value) || 4050)}
                  className="w-full pl-8 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none font-mono font-bold"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Official GDT exchange rate for translating USD salaries into KHR base. Typically 4,050 or 4,100.</p>
            </div>

            {/* Spouse Relief */}
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Spousal Tax Relief (KHR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">៛</span>
                <input
                  type="number"
                  value={settings.spouseReliefKHR}
                  onChange={(e) => handleSpouseReliefChange(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none font-mono font-bold"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Monthly deduction amount allowed for employee's spouse who is a homemaker (non-working). Standard 150,000 KHR.</p>
            </div>

            {/* Child Relief */}
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Child Dependent Tax Relief (KHR per Child)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">៛</span>
                <input
                  type="number"
                  value={settings.childReliefKHR}
                  onChange={(e) => handleChildReliefChange(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none font-mono font-bold"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Monthly deduction amount allowed per dependent child under 18 (or under 25 if studying). Standard 150,000 KHR.</p>
            </div>
          </div>
        </div>

        {/* Informational Cambodian Tax Brackets */}
        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4 bg-white/40 dark:bg-slate-900/40">
          <h3 className="font-bold text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Cambodian Resident Tax Brackets
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-slate-500 dark:text-slate-300 leading-relaxed">
              Resident salary tax brackets as mandated by the General Department of Taxation, Cambodia (GDT):
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/5 space-y-2">
              <div className="flex justify-between py-1">
                <span>0 to 1,500,000 KHR</span>
                <span className="font-mono font-bold text-emerald-500">0% (Deduct 0 KHR)</span>
              </div>
              <div className="flex justify-between py-1 pt-2">
                <span>1,500,001 to 2,000,000 KHR</span>
                <span className="font-mono font-bold text-indigo-500">5% (Deduct 75,000 KHR)</span>
              </div>
              <div className="flex justify-between py-1 pt-2">
                <span>2,000,001 to 8,500,000 KHR</span>
                <span className="font-mono font-bold text-indigo-500">10% (Deduct 175,000 KHR)</span>
              </div>
              <div className="flex justify-between py-1 pt-2">
                <span>8,500,001 to 12,500,000 KHR</span>
                <span className="font-mono font-bold text-indigo-500">15% (Deduct 600,000 KHR)</span>
              </div>
              <div className="flex justify-between py-1 pt-2">
                <span>Over 12,500,000 KHR</span>
                <span className="font-mono font-bold text-red-500">20% (Deduct 1,225,000 KHR)</span>
              </div>
            </div>

            <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400">
              * Non-resident employees (Expats) are subject to a flat 20% tax on their taxable base salary with no dependent relief deductions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
