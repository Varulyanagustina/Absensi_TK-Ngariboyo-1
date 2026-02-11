
import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { CheckCircle, AlertCircle, Clock, XCircle, Users, Inbox } from 'lucide-react';
import { supabase } from '../supabase';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({ hadir: 0, sakit: 0, izin: 0, alfa: 0, total: 0 });
  const [classData, setClassData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Stats for today
      const { data: attData } = await supabase.from('attendance').select('*').eq('date', today);
      if (attData) {
        const s = attData.reduce((acc, curr) => {
          const status = curr.status.toLowerCase();
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, { hadir: 0, sakit: 0, izin: 0, alfa: 0 });
        setStats({ ...s, total: attData.length });
      }

      // Class data (students per class)
      const { data: students } = await supabase.from('students').select('class_name');
      if (students) {
        const counts = students.reduce((acc: any, curr: any) => {
          acc[curr.class_name] = (acc[curr.class_name] || 0) + 1;
          return acc;
        }, {});
        setClassData(Object.entries(counts).map(([name, count]) => ({ name, count })));
      }

      // Trend dummy data
      setTrendData([
        { day: 'Sen', count: 45 },
        { day: 'Sel', count: 52 },
        { day: 'Rab', count: 48 },
        { day: 'Kam', count: 61 },
        { day: 'Jum', count: 55 },
        { day: 'Sab', count: 30 },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const COLORS = ['#0EA5E9', '#FBBF24', '#A855F7', '#EF4444'];
  const pieData = [
    { name: 'Hadir', value: stats.hadir },
    { name: 'Izin', value: stats.izin },
    { name: 'Sakit', value: stats.sakit },
    { name: 'Alfa', value: stats.alfa },
  ].filter(d => d.value > 0);

  const StatCard = ({ title, value, color, icon: Icon }: any) => (
    <div className={`bg-white p-6 rounded-ultra shadow-sm border-l-4 border-${color}-400 flex items-center justify-between`}>
      <div>
        <p className="text-gray-500 text-sm font-semibold mb-1">{title}</p>
        <h3 className={`text-3xl font-bold text-${color}-600`}>{loading ? '...' : value}</h3>
      </div>
      <div className={`p-3 bg-${color}-50 rounded-2xl`}>
        <Icon className={`w-8 h-8 text-${color}-500`} />
      </div>
    </div>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <Inbox className="w-12 h-12 text-sky-100 mb-2" />
      <p className="text-sky-300 font-medium">{message}</p>
    </div>
  );

  return (
    <div className="space-y-8 page-transition">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-sky-900">Halo, Selamat Datang! 👋</h2>
          <p className="text-sky-600">Berikut adalah ringkasan absensi hari ini.</p>
        </div>
        <div className="bg-sky-100 text-sky-700 px-4 py-2 rounded-full font-bold flex items-center gap-2 w-fit">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Hadir" value={stats.hadir} color="sky" icon={CheckCircle} />
        <StatCard title="Sakit" value={stats.sakit} color="amber" icon={AlertCircle} />
        <StatCard title="Izin" value={stats.izin} color="purple" icon={Clock} />
        <StatCard title="Alfa" value={stats.alfa} color="red" icon={XCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart Siswa per Kelas */}
        <div className="bg-white p-6 rounded-ultra shadow-sm min-h-[350px]">
          <h3 className="text-lg font-bold text-sky-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5" /> Jumlah Siswa per Kelas
          </h3>
          <div className="h-64">
            {loading ? (
              <div className="w-full h-full bg-sky-50 animate-pulse rounded-2xl"></div>
            ) : classData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f9ff" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f0f9ff' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" fill="#0EA5E9" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Belum ada data siswa & kelas." />
            )}
          </div>
        </div>

        {/* Pie Chart Global Status */}
        <div className="bg-white p-6 rounded-ultra shadow-sm min-h-[350px]">
          <h3 className="text-lg font-bold text-sky-900 mb-6">Status Absensi Hari Ini</h3>
          <div className="h-64 flex flex-col md:flex-row items-center">
            {loading ? (
              <div className="w-full h-full bg-sky-50 animate-pulse rounded-2xl"></div>
            ) : pieData?.length > 0 ? (
              <>
                <div className="w-full md:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-2 mt-4 md:mt-0">
                  {pieData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span className="text-gray-600 font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-sky-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState message="Belum ada absensi hari ini." />
            )}
          </div>
        </div>

        {/* Area Chart Trend */}
        <div className="bg-white p-6 rounded-ultra shadow-sm lg:col-span-2 min-h-[350px]">
          <h3 className="text-lg font-bold text-sky-900 mb-6">Tren Kehadiran Mingguan</h3>
          <div className="h-64">
            {loading ? (
              <div className="w-full h-full bg-sky-50 animate-pulse rounded-2xl"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f9ff" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#0EA5E9" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
