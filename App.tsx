
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  School, 
  ClipboardCheck, 
  FileBarChart, 
  Settings, 
  RefreshCw,
  UserCheck
} from 'lucide-react';
import Dashboard from './views/Dashboard';
import DataKelas from './views/DataKelas';
import DataSiswa from './views/DataSiswa';
import AbsensiSiswa from './views/AbsensiSiswa';
import AbsensiGuru from './views/AbsensiGuru';
import Laporan from './views/Laporan';
import Pengaturan from './views/Pengaturan';
import { supabase } from './supabase';
import { SchoolSettings } from './types';

const App: React.FC = () => {
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSettings = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.from('school_settings').select('*').single();
      if (!error && data) {
        setSchoolSettings(data);
      } else {
        // Default fallback if table empty or error
        setSchoolSettings({ id: '1', school_name: 'TK DIGITAL INDONESIA' });
      }
    } catch (e) {
      setSchoolSettings({ id: '1', school_name: 'TK DIGITAL INDONESIA' });
    }
    setTimeout(() => setIsRefreshing(false), 800);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const navItems = [
    { to: '/', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Beranda' },
    { to: '/kelas', icon: <School className="w-5 h-5" />, label: 'Kelas' },
    { to: '/siswa', icon: <Users className="w-5 h-5" />, label: 'Siswa' },
    { to: '/absensi-siswa', icon: <ClipboardCheck className="w-5 h-5" />, label: 'Absen Siswa' },
    { to: '/absensi-guru', icon: <UserCheck className="w-5 h-5" />, label: 'Absen Guru' },
    { to: '/laporan', icon: <FileBarChart className="w-5 h-5" />, label: 'Laporan' },
    { to: '/pengaturan', icon: <Settings className="w-5 h-5" />, label: 'Pengaturan' },
  ];

  return (
    <Router>
      <div className="min-h-screen pb-20 md:pb-0 md:pl-64 flex flex-col bg-sky-50 transition-all duration-300">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-white border-r border-sky-100 p-6 z-40">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-sky-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-sky-200">
              U
            </div>
            <h1 className="text-xl font-bold text-sky-900 leading-tight truncate">
              {schoolSettings?.school_name || 'TK Digital'}
            </h1>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => 
                  `flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${
                    isActive 
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-200 translate-x-1' 
                    : 'text-sky-600 hover:bg-sky-50 hover:text-sky-700'
                  }`
                }
              >
                {item.icon}
                <span className="font-semibold">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <button 
            onClick={fetchSettings}
            className="mt-4 flex items-center gap-3 px-4 py-3 text-sky-500 hover:bg-sky-50 rounded-2xl transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="font-medium">Sinkronisasi</span>
          </button>
        </aside>

        {/* Header Mobile */}
        <header className="md:hidden bg-white border-b border-sky-100 p-4 sticky top-0 z-40 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-sky-200">
              U
            </div>
            <h1 className="text-lg font-bold text-sky-900 truncate max-w-[150px]">
              {schoolSettings?.school_name || 'TK Digital'}
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={fetchSettings} className="p-2 text-sky-500">
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <NavLink to="/pengaturan" className="p-2 text-sky-500">
              <Settings className="w-5 h-5" />
            </NavLink>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/kelas" element={<DataKelas />} />
            <Route path="/siswa" element={<DataSiswa />} />
            <Route path="/absensi-siswa" element={<AbsensiSiswa />} />
            <Route path="/absensi-guru" element={<AbsensiGuru />} />
            <Route path="/laporan" element={<Laporan schoolName={schoolSettings?.school_name || 'TK DIGITAL INDONESIA'} />} />
            <Route path="/pengaturan" element={<Pengaturan onUpdate={fetchSettings} />} />
          </Routes>
        </main>

        {/* Mobile Bottom Bar - Optimized for 7 items */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-sky-100 flex justify-around items-center py-2 px-0 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-40 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center min-w-[50px] flex-1 gap-1 p-1 rounded-xl transition-all ${
                  isActive ? 'text-sky-500 scale-110' : 'text-sky-300'
                }`
              }
            >
              {item.icon}
              <span className="text-[8px] font-bold uppercase tracking-tighter whitespace-nowrap">
                {item.label === 'Absen Siswa' ? 'Siswa' : item.label === 'Absen Guru' ? 'Guru' : item.label.split(' ')[0]}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    </Router>
  );
};

export default App;
