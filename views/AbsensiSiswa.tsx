
import React, { useEffect, useState } from 'react';
import { Calendar, Search, Filter, Save, FileCheck } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../supabase';
import { Student, ClassData, Attendance } from '../types';

const AbsensiSiswa: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, { status: string; note: string }>>({});
  const [loading, setLoading] = useState(false);

  const fetchBaseData = async () => {
    const { data: clsData } = await supabase.from('classes').select('*').order('name');
    if (clsData) {
      setClasses(clsData);
      if (clsData.length > 0) setSelectedClass(clsData[0].name);
    }
  };

  useEffect(() => {
    fetchBaseData();
  }, []);

  const fetchAttendanceData = async () => {
    if (!selectedClass) return;
    setLoading(true);

    const { data: stuData } = await supabase.from('students')
      .select('*')
      .eq('class_name', selectedClass)
      .order('name');
    
    if (stuData) {
      setStudents(stuData);

      const { data: attData } = await supabase.from('attendance')
        .select('*')
        .eq('date', selectedDate)
        .in('student_id', stuData.map(s => s.id));

      const attMap: Record<string, { status: string; note: string }> = {};
      
      // Initialize with Hadir as default
      stuData.forEach(s => {
        attMap[s.id] = { status: 'Hadir', note: '' };
      });

      // Update with existing data
      attData?.forEach(a => {
        attMap[a.student_id] = { status: a.status, note: a.note || '' };
      });

      setAttendance(attMap);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedClass, selectedDate]);

  const updateStatus = async (studentId: string, status: string) => {
    let note = attendance[studentId].note;

    if (status === 'Sakit' || status === 'Izin') {
      const { value: text } = await Swal.fire({
        title: `Keterangan ${status}`,
        input: 'textarea',
        inputPlaceholder: 'Masukkan alasan...',
        showCancelButton: true,
        confirmButtonColor: '#0EA5E9'
      });
      if (text !== undefined) note = text;
    }

    setAttendance(prev => ({
      ...prev,
      [studentId]: { status, note }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    /* Cast data to any to handle cases where TypeScript infers it as unknown in Object.entries.map */
    const updates = Object.entries(attendance).map(([studentId, data]) => ({
      student_id: studentId,
      date: selectedDate,
      status: (data as any).status,
      note: (data as any).note
    }));

    // Upsert logic: delete old ones for this date/class and insert new ones
    // Or simpler with Supabase upsert using a unique constraint on (student_id, date)
    const { error } = await supabase.from('attendance').upsert(updates, { onConflict: 'student_id, date' });

    if (!error) {
      Swal.fire({
        icon: 'success',
        title: 'Tersimpan!',
        text: 'Data absensi berhasil disinkronkan ke cloud.',
        timer: 1500,
        showConfirmButton: false,
        background: '#f0f9ff',
        color: '#0369a1'
      });
    } else {
      Swal.fire('Error', 'Gagal menyimpan absensi.', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 page-transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-sky-900">Input Absensi Siswa</h2>
          <p className="text-sky-600">Lakukan pencatatan kehadiran harian.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-green-100 transition-all active:scale-95 disabled:opacity-50"
        >
          <Save className="w-5 h-5" /> Simpan Absensi
        </button>
      </div>

      <div className="bg-white p-6 rounded-ultra shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-sky-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-500" /> Pilih Tanggal
          </label>
          <input 
            type="date" 
            className="w-full px-4 py-3 bg-sky-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 outline-none font-bold text-sky-900"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-sky-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-sky-500" /> Pilih Kelas
          </label>
          <select 
            className="w-full px-4 py-3 bg-sky-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 outline-none appearance-none font-bold text-sky-900"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-ultra shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-sky-400">Memuat data siswa...</div>
        ) : students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-sky-50 text-sky-900">
                  <th className="p-4 pl-8 font-bold text-sm uppercase">Nama Siswa</th>
                  <th className="p-4 font-bold text-sm uppercase text-center">Kehadiran</th>
                  <th className="p-4 pr-8 font-bold text-sm uppercase">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-sky-50/20 transition-colors">
                    <td className="p-4 pl-8">
                      <div className="font-bold text-sky-900">{s.name}</div>
                      <div className="text-xs text-gray-400">NIS: {s.nis}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2 bg-sky-50/50 p-2 rounded-2xl">
                        {['Hadir', 'Sakit', 'Izin', 'Alfa'].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateStatus(s.id, status)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                              attendance[s.id]?.status === status
                                ? status === 'Hadir' ? 'bg-green-500 text-white' :
                                  status === 'Sakit' ? 'bg-amber-500 text-white' :
                                  status === 'Izin' ? 'bg-purple-500 text-white' :
                                  'bg-red-500 text-white'
                                : 'bg-white text-gray-400 hover:bg-sky-100'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 pr-8">
                      {attendance[s.id]?.note ? (
                        <div className="text-xs italic text-sky-600 bg-sky-50 p-2 rounded-lg max-w-[200px] truncate">
                          {attendance[s.id].note}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs italic">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center text-sky-400 italic">Tidak ada siswa terdaftar di kelas ini.</div>
        )}
      </div>
    </div>
  );
};

export default AbsensiSiswa;
