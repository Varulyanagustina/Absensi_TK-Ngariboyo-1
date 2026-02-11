
import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, Users } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '../supabase';

/* Removed invalid module augmentation as it was causing compilation errors. 
   Instead, we use explicit 'any' casting on instances where autoTable is called. */

const Laporan: React.FC<{ schoolName: string }> = ({ schoolName }) => {
  const [reportType, setReportType] = useState<'harian' | 'bulanan'>('harian');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [classes, setClasses] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      const { data } = await supabase.from('classes').select('*').order('name');
      if (data) setClasses(data);
    };
    fetchClasses();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from('attendance').select('*, students(*)');

    if (reportType === 'harian') {
      query = query.eq('date', date);
    } else {
      query = query.gte('date', `${month}-01`).lte('date', `${month}-31`);
    }

    const { data: attData } = await query;

    if (attData) {
      let filtered = attData;
      if (selectedClass !== 'Semua') {
        filtered = attData.filter(d => d.students?.class_name === selectedClass);
      }
      setData(filtered);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [reportType, date, month, selectedClass]);

  const exportPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.text(schoolName.toUpperCase(), pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('LAPORAN KEHADIRAN SISWA', pageWidth / 2, 28, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.text(`Periode: ${reportType === 'harian' ? date : month}`, pageWidth / 2, 34, { align: 'center' });
    
    doc.line(20, 38, pageWidth - 20, 38);

    const tableData = data.map((item, index) => [
      index + 1,
      item.students?.nis,
      item.students?.name,
      item.students?.class_name,
      item.status,
      item.date,
      item.note || '-'
    ]);

    /* Using cast to any to call autoTable which is added to the jsPDF prototype by jspdf-autotable */
    (doc as any).autoTable({
      startY: 45,
      head: [['No', 'NIS', 'Nama Siswa', 'Kelas', 'Status', 'Tanggal', 'Keterangan']],
      body: tableData,
      theme: 'grid',
      styles: { font: 'times', fontSize: 9 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, halign: 'center' },
      columnStyles: {
        0: { halign: 'center' },
        4: { fontStyle: 'bold' }
      }
    });

    // Signatures
    const finalY = (doc as any).lastAutoTable.finalY + 30;
    doc.text('Mengetahui,', 40, finalY);
    doc.text('Kepala Sekolah', 40, finalY + 7);
    doc.text('____________________', 40, finalY + 35);
    
    doc.text('Guru Wali Kelas,', pageWidth - 80, finalY);
    doc.text('____________________', pageWidth - 80, finalY + 35);

    doc.save(`Laporan_${schoolName}_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="space-y-6 page-transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-sky-900">Laporan Absensi</h2>
          <p className="text-sky-600">Unduh data kehadiran dalam format PDF.</p>
        </div>
        <button 
          onClick={exportPDF}
          className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-sky-100 transition-all active:scale-95"
        >
          <Download className="w-5 h-5" /> Cetak PDF
        </button>
      </div>

      <div className="bg-white p-6 rounded-ultra shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-sky-400 uppercase">Jenis Laporan</label>
          <select 
            className="w-full p-3 bg-sky-50 rounded-xl font-bold text-sky-900 border-none outline-none"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
          >
            <option value="harian">Harian</option>
            <option value="bulanan">Bulanan</option>
          </select>
        </div>

        {reportType === 'harian' ? (
          <div className="space-y-1">
            <label className="text-xs font-bold text-sky-400 uppercase">Pilih Tanggal</label>
            <input 
              type="date" 
              className="w-full p-3 bg-sky-50 rounded-xl font-bold text-sky-900 border-none outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-xs font-bold text-sky-400 uppercase">Pilih Bulan</label>
            <input 
              type="month" 
              className="w-full p-3 bg-sky-50 rounded-xl font-bold text-sky-900 border-none outline-none"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-sky-400 uppercase">Filter Kelas</label>
          <select 
            className="w-full p-3 bg-sky-50 rounded-xl font-bold text-sky-900 border-none outline-none"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="Semua">Semua Kelas</option>
            {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex items-end">
          <div className="w-full p-3 bg-sky-900 text-white rounded-xl text-center">
            <span className="text-xs font-bold opacity-60 mr-2 uppercase">Total Data:</span>
            <span className="font-bold">{data.length} Baris</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-ultra shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            <thead className="bg-sky-50 text-sky-900 border-b-2 border-sky-100">
              <tr>
                <th className="p-4 pl-8 font-bold text-sm uppercase">NIS</th>
                <th className="p-4 font-bold text-sm uppercase">Nama Siswa</th>
                <th className="p-4 font-bold text-sm uppercase">Kelas</th>
                <th className="p-4 font-bold text-sm uppercase">Status</th>
                <th className="p-4 pr-8 font-bold text-sm uppercase">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-50">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center animate-pulse">Memproses data...</td></tr>
              ) : data.length > 0 ? (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-sky-50/20">
                    <td className="p-4 pl-8">{row.students?.nis}</td>
                    <td className="p-4 font-bold">{row.students?.name}</td>
                    <td className="p-4">{row.students?.class_name}</td>
                    <td className={`p-4 font-bold ${
                      row.status === 'Hadir' ? 'text-green-600' :
                      row.status === 'Sakit' ? 'text-amber-600' :
                      row.status === 'Izin' ? 'text-purple-600' : 'text-red-600'
                    }`}>{row.status}</td>
                    <td className="p-4 pr-8">{row.date}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="p-20 text-center text-gray-400 italic">Data tidak ditemukan untuk kriteria ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Laporan;
