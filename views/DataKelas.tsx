
import React, { useEffect, useState } from 'react';
/* Added School to imports */
import { Plus, Edit, Trash2, User, UserCheck, School } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../supabase';
import { ClassData } from '../types';

const DataKelas: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('classes').select('*').order('name');
    if (!error && data) setClasses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAdd = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Tambah Kelas Baru',
      html: `
        <div class="space-y-4">
          <input id="swal-name" class="swal2-input w-full m-0" placeholder="Nama Kelas (Contoh: TK A)">
          <input id="swal-teacher" class="swal2-input w-full m-0" placeholder="Nama Guru Wali">
          <input id="swal-teacher-nip" class="swal2-input w-full m-0" placeholder="NIP Guru Wali">
          <input id="swal-head" class="swal2-input w-full m-0" placeholder="Nama Kepala Sekolah">
          <input id="swal-head-nip" class="swal2-input w-full m-0" placeholder="NIP Kepala Sekolah">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0EA5E9',
      preConfirm: () => {
        return {
          name: (document.getElementById('swal-name') as HTMLInputElement).value,
          teacher_name: (document.getElementById('swal-teacher') as HTMLInputElement).value,
          teacher_nip: (document.getElementById('swal-teacher-nip') as HTMLInputElement).value,
          headmaster_name: (document.getElementById('swal-head') as HTMLInputElement).value,
          headmaster_nip: (document.getElementById('swal-head-nip') as HTMLInputElement).value,
        };
      }
    });

    if (formValues && formValues.name) {
      const { error } = await supabase.from('classes').insert([formValues]);
      if (!error) {
        Swal.fire('Berhasil!', 'Kelas telah ditambahkan.', 'success');
        fetchClasses();
      }
    }
  };

  const handleEdit = async (item: ClassData) => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Kelas',
      html: `
        <div class="space-y-4">
          <input id="swal-name" class="swal2-input w-full m-0" value="${item.name}" placeholder="Nama Kelas">
          <input id="swal-teacher" class="swal2-input w-full m-0" value="${item.teacher_name}" placeholder="Nama Guru Wali">
          <input id="swal-teacher-nip" class="swal2-input w-full m-0" value="${item.teacher_nip}" placeholder="NIP Guru Wali">
          <input id="swal-head" class="swal2-input w-full m-0" value="${item.headmaster_name}" placeholder="Nama Kepala Sekolah">
          <input id="swal-head-nip" class="swal2-input w-full m-0" value="${item.headmaster_nip}" placeholder="NIP Kepala Sekolah">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update',
      confirmButtonColor: '#0EA5E9',
      preConfirm: () => {
        return {
          name: (document.getElementById('swal-name') as HTMLInputElement).value,
          teacher_name: (document.getElementById('swal-teacher') as HTMLInputElement).value,
          teacher_nip: (document.getElementById('swal-teacher-nip') as HTMLInputElement).value,
          headmaster_name: (document.getElementById('swal-head') as HTMLInputElement).value,
          headmaster_nip: (document.getElementById('swal-head-nip') as HTMLInputElement).value,
        };
      }
    });

    if (formValues && formValues.name) {
      const { error } = await supabase.from('classes').update(formValues).eq('id', item.id);
      if (!error) {
        Swal.fire('Updated!', 'Data kelas telah diperbarui.', 'success');
        fetchClasses();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Kelas?',
      text: "Data ini tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (!error) {
        Swal.fire('Terhapus!', 'Kelas telah dihapus.', 'success');
        fetchClasses();
      }
    }
  };

  return (
    <div className="space-y-6 page-transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-sky-900">Data Kelas</h2>
          <p className="text-sky-600">Manajemen unit kelas dan tenaga pengajar.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-sky-100 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Tambah Kelas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="bg-white h-48 rounded-ultra animate-pulse shadow-sm"></div>)
        ) : classes.length > 0 ? (
          classes.map((cls) => (
            <div key={cls.id} className="bg-white p-6 rounded-ultra shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-sky-900">{cls.name}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(cls)} className="p-2 text-sky-500 hover:bg-sky-50 rounded-xl transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cls.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-sky-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Guru Wali</p>
                      <p className="text-gray-700 font-bold">{cls.teacher_name}</p>
                      <p className="text-xs text-gray-400">NIP: {cls.teacher_nip || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <UserCheck className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Kepala Sekolah</p>
                      <p className="text-gray-700 font-bold">{cls.headmaster_name}</p>
                      <p className="text-xs text-gray-400">NIP: {cls.headmaster_nip || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-ultra border-2 border-dashed border-sky-100">
            <School className="w-16 h-16 text-sky-200 mx-auto mb-4" />
            <p className="text-sky-400 font-medium">Belum ada data kelas. Silakan tambah data baru.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataKelas;
