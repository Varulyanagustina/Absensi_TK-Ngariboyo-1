
import React, { useState, useEffect } from 'react';
import { Save, School, Info } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../supabase';

const Pengaturan: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('school_settings').select('*').single();
      if (data) setSchoolName(data.school_name);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('school_settings').upsert({ id: '1', school_name: schoolName });
    
    if (!error) {
      Swal.fire('Berhasil!', 'Pengaturan sekolah telah diperbarui.', 'success');
      onUpdate();
    } else {
      Swal.fire('Error', 'Gagal memperbarui pengaturan.', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-transition">
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold text-sky-900">Pengaturan Aplikasi</h2>
        <p className="text-sky-600">Sesuaikan identitas sekolah Anda.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-mega shadow-sm space-y-6 border border-sky-50">
        <div className="flex items-center gap-4 p-4 bg-sky-50 rounded-2xl mb-4">
          <div className="p-3 bg-sky-500 rounded-xl text-white">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sky-900">Identitas Sekolah</h4>
            <p className="text-xs text-sky-600">Gunakan nama resmi untuk keperluan laporan.</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-sky-900 ml-2">Nama Taman Kanak-Kanak (TK)</label>
          <input 
            type="text" 
            required
            className="w-full px-6 py-4 bg-sky-50/50 border-2 border-sky-50 rounded-2xl focus:border-sky-500 transition-all outline-none font-bold text-sky-900 text-lg"
            placeholder="Contoh: TK Ultra Responsive"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />
        </div>

        <div className="bg-amber-50 p-4 rounded-2xl flex gap-3">
          <Info className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700 leading-relaxed font-medium">
            Nama sekolah yang diinputkan akan muncul secara otomatis di Header Aplikasi, Judul Laporan PDF, dan Kop Surat.
          </p>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-sky-100 transition-all active:scale-95 disabled:opacity-50"
        >
          <Save className="w-5 h-5" /> {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
};

export default Pengaturan;
