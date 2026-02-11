
import React, { useEffect, useState } from 'react';
import { Calendar, Search, UserCheck, Plus, Trash2, Edit } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../supabase';
import { Teacher, TeacherAttendance } from '../types';

const AbsensiGuru: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<TeacherAttendance[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    // Fetch all teachers
    const { data: tData } = await supabase.from('teachers').select('*').order('name');
    if (tData) setTeachers(tData);

    // Fetch attendance for selected date
    const { data: attData } = await supabase.from('teacher_attendance')
      .select('*, teachers(*)')
      .eq('date', selectedDate);
    
    if (attData) setAttendance(attData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleAddLog = async () => {
    if (teachers.length === 0) {
      // Create initial dummy teacher if empty
      await supabase.from('teachers').insert([
        { nip: '123', name: 'Guru Contoh', role: 'Wali Kelas' }
      ]);
      fetchData();
      return;
    }

    const teacherOptions = teachers.reduce((acc: any, t) => {
      acc[t.id] = t.name;
      return acc;
    }, {});

    const { value: formValues } = await Swal.fire({
      title: 'Tambah Log Guru',
      input: 'select',
      inputOptions: teacherOptions,
      inputPlaceholder: 'Pilih Guru',
      html: `
        <select id="swal-status" class="swal2-select w-full m-0 mt-4">
          <option value="Hadir">Hadir</option>
          <option value="Sakit">Sakit</option>
          <option value="Izin">Izin</option>
          <option value="Alfa">Alfa</option>
        </select>
        <textarea id="swal-note" class="swal2-textarea w-full m-0 mt-4" placeholder="Keterangan (Opsional)"></textarea>
      `,
      showCancelButton: true,
      confirmButtonColor: '#0EA5E9',
      preConfirm: (teacher_id) => {
        return {
          teacher_id,
          status: (document.getElementById('swal-status') as HTMLSelectElement).value,
          note: (document.getElementById('swal-note') as HTMLTextAreaElement).value,
          date: selectedDate
        };
      }
    });

    if (formValues && formValues.teacher_id) {
      const { error } = await supabase.from('teacher_attendance').insert([formValues]);
      if (!error) {
        Swal.fire('Berhasil!', 'Log guru telah dicatat.', 'success');
        fetchData();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Hapus log?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444'
    });

    if (isConfirmed) {
      await supabase.from('teacher_attendance').delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6 page-transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-sky-900">Absensi Guru</h2>
          <p className="text-sky-600">Pantau kehadiran tenaga pendidik.</p>
        </div>
        <button 
          onClick={handleAddLog}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-purple-100 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Tambah Log
        </button>
      </div>

      <div className="bg-white p-6 rounded-ultra shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-full md:w-1/3">
          <label className="text-sm font-bold text-sky-900 flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-sky-500" /> Pilih Tanggal
          </label>
          <input 
            type="date" 
            className="w-full px-4 py-3 bg-sky-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 outline-none font-bold text-sky-900"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <p className="text-sky-900 font-bold text-lg">Total Guru Absen</p>
          <p className="text-sky-500 text-3xl font-black">{attendance.length} <span className="text-sm font-normal">Orang</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center animate-pulse text-sky-300">Memuat data...</div>
        ) : attendance.length > 0 ? (
          attendance.map((log) => (
            <div key={log.id} className="bg-white p-6 rounded-ultra shadow-sm border border-sky-50 relative group">
              <button 
                onClick={() => handleDelete(log.id)}
                className="absolute top-4 right-4 p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sky-900">{log.teachers?.name}</h4>
                  <p className="text-xs text-gray-400 font-medium">NIP: {log.teachers?.nip}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                   log.status === 'Hadir' ? 'bg-green-100 text-green-700' :
                   log.status === 'Sakit' ? 'bg-amber-100 text-amber-700' :
                   log.status === 'Izin' ? 'bg-purple-100 text-purple-700' :
                   'bg-red-100 text-red-700'
                }`}>
                  {log.status}
                </span>
                {log.note && (
                  <span className="text-[10px] italic text-gray-400 truncate max-w-[120px]" title={log.note}>
                    {log.note}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-ultra border-2 border-dashed border-sky-100">
            <UserCheck className="w-16 h-16 text-sky-200 mx-auto mb-4" />
            <p className="text-sky-400 font-medium">Belum ada log guru hari ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbsensiGuru;
