
import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, UserRound, Inbox } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../supabase';
import { Student, ClassData } from '../types';

const DataSiswa: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: clsData } = await supabase.from('classes').select('*').order('name');
      if (clsData) setClasses(clsData);

      const { data: stuData } = await supabase.from('students').select('*').order('name');
      if (stuData) setStudents(stuData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (classes.length === 0) {
      Swal.fire('Oops!', 'Silakan tambah data kelas terlebih dahulu.', 'warning');
      return;
    }

    const classOptions = (classes || []).reduce((acc: any, cls) => {
      acc[cls.name] = cls.name;
      return acc;
    }, {});

    const { value: formValues } = await Swal.fire({
      title: 'Tambah Siswa',
      html: `
        <div class="space-y-4">
          <input id="swal-nis" class="swal2-input w-full m-0" placeholder="Nomor Induk Siswa (NIS)">
          <input id="swal-name" class="swal2-input w-full m-0" placeholder="Nama Lengkap">
        </div>
      `,
      input: 'select',
      inputOptions: {
        '': '-- Pilih Kelas --',
        ...classOptions
      },
      inputValidator: (value) => {
        if (!value) return 'Anda harus memilih kelas!';
        return null;
      },
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      confirmButtonColor: '#0EA5E9',
      preConfirm: (class_name) => {
        const nis = (document.getElementById('swal-nis') as HTMLInputElement).value;
        const name = (document.getElementById('swal-name') as HTMLInputElement).value;
        if (!nis || !name) {
          Swal.showValidationMessage('Mohon isi semua field!');
          return false;
        }
        return { nis, name, class_name };
      }
    });

    if (formValues && formValues.name) {
      const { error } = await supabase.from('students').insert([formValues]);
      if (!error) {
        Swal.fire('Berhasil!', 'Siswa telah ditambahkan.', 'success');
        fetchData();
      } else {
        Swal.fire('Gagal', error.message, 'error');
      }
    }
  };

  const handleEdit = async (item: Student) => {
    const classOptions = (classes || []).reduce((acc: any, cls) => {
      acc[cls.name] = cls.name;
      return acc;
    }, {});

    const { value: formValues } = await Swal.fire({
      title: 'Edit Data Siswa',
      html: `
        <div class="space-y-4">
          <input id="swal-nis" class="swal2-input w-full m-0" value="${item.nis}" placeholder="NIS">
          <input id="swal-name" class="swal2-input w-full m-0" value="${item.name}" placeholder="Nama Lengkap">
        </div>
      `,
      input: 'select',
      inputPlaceholder: 'Pilih Kelas',
      inputValue: item.class_name,
      inputOptions: classOptions,
      showCancelButton: true,
      confirmButtonText: 'Update',
      confirmButtonColor: '#0EA5E9',
      preConfirm: (class_name) => {
        return {
          nis: (document.getElementById('swal-nis') as HTMLInputElement).value,
          name: (document.getElementById('swal-name') as HTMLInputElement).value,
          class_name
        };
      }
    });

    if (formValues && formValues.name) {
      const { error } = await supabase.from('students').update(formValues).eq('id', item.id);
      if (!error) {
        Swal.fire('Updated!', 'Data siswa telah diperbarui.', 'success');
        fetchData();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Siswa?',
      text: "Data kehadiran siswa ini juga akan hilang!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonText: 'Batal',
      confirmButtonText: 'Ya, Hapus'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (!error) {
        Swal.fire('Terhapus!', 'Siswa telah dihapus.', 'success');
        fetchData();
      }
    }
  };

  const filteredStudents = (students || []).filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.nis.includes(searchTerm);
    const matchesClass = selectedClass === 'Semua' || s.class_name === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 page-transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-sky-900">Data Siswa</h2>
          <p className="text-sky-600">Daftar siswa TK berdasarkan unit kelas.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-sky-100 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Tambah Siswa
        </button>
      </div>

      <div className="bg-white p-6 rounded-ultra shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-300 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Cari Nama atau NIS..." 
            className="w-full pl-12 pr-4 py-3 bg-sky-50/50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 transition-all outline-none text-sky-900 placeholder:text-sky-300 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-300 w-5 h-5" />
          <select 
            className="w-full pl-12 pr-4 py-3 bg-sky-50/50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 transition-all outline-none appearance-none text-sky-900 font-medium"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="Semua">Semua Kelas</option>
            {classes?.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-ultra shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
             <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
             <p className="text-sky-400 font-medium">Sedang memuat data...</p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sky-500 text-white">
                  <th className="p-4 font-bold text-sm uppercase tracking-widest pl-8">NIS</th>
                  <th className="p-4 font-bold text-sm uppercase tracking-widest">Nama Lengkap</th>
                  <th className="p-4 font-bold text-sm uppercase tracking-widest">Kelas</th>
                  <th className="p-4 font-bold text-sm uppercase tracking-widest pr-8 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-sky-50/30 transition-colors group">
                    <td className="p-4 font-medium text-sky-900 pl-8">{s.nis}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all">
                          <UserRound className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sky-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-bold">{s.class_name}</span>
                    </td>
                    <td className="p-4 pr-8">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(s)} className="p-2 text-sky-500 hover:bg-sky-100 rounded-xl transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 text-center gap-2">
            <Inbox className="w-16 h-16 text-sky-100" />
            <p className="text-sky-400 font-bold text-lg">Data Tidak Ditemukan</p>
            <p className="text-sky-300">Belum ada data siswa atau hasil pencarian tidak tersedia.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataSiswa;
