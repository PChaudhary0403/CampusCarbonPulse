import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale
);

const API_BASE = "http://localhost:8000/api";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ total_co2: 0, avg_co2: 0, count: 0, breakdown: {} });
  const [formData, setFormData] = useState({ elec: "", commute: "", waste: "", water: "", paper: "" });
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("idle");

  const fetchData = useCallback(async () => {
    try {
      const [resData, resStats] = await Promise.all([
        axios.get(`${API_BASE}/emissions`),
        axios.get(`${API_BASE}/stats`)
      ]);
      setData(resData.data);
      setStats(resStats.data);
      setSyncStatus("live");
    } catch (err) {
      setSyncStatus("offline");
      console.error("Backend offline, using local cache or empty state");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSyncStatus("syncing");
    const payload = {
      dept_electricity: parseFloat(formData.elec) || 0,
      student_commute: parseFloat(formData.commute) || 0,
      canteen_waste: parseFloat(formData.waste) || 0,
      water_consumption: parseFloat(formData.water) || 0,
      paper_usage: parseFloat(formData.paper) || 0
    };

    try {
      await axios.post(`${API_BASE}/emissions`, payload);
      setSyncStatus("success");
      fetchData();
      setFormData({ elec: "", commute: "", waste: "", water: "", paper: "" });
    } catch (err) {
      setSyncStatus("error");
    }
    setTimeout(() => setSyncStatus("live"), 3000);
  };

  const lineData = useMemo(() => ({
    labels: data.slice(-12).map(d => new Date(d.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
    datasets: [{
      label: "CO2 (kg)",
      data: data.slice(-12).map(d => d.total_co2),
      fill: true,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.05)',
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 4,
      pointBackgroundColor: '#10b981'
    }]
  }), [data]);

  const doughnutData = useMemo(() => {
    const b = stats.breakdown || {};
    return {
      labels: ['Elec', 'Commute', 'Waste', 'Water', 'Paper'],
      datasets: [{
        data: [b.electricity || 0, b.transport || 0, b.waste || 0, b.water || 0, b.paper || 0],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
        borderWidth: 0,
        hoverOffset: 10
      }]
    };
  }, [stats]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#020617] text-emerald-500 font-black text-2xl tracking-tighter animate-pulse">
      INITIALIZING PULSE ENGINE...
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-reveal max-w-7xl mx-auto">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard label="Total Footprint" value={stats.total_co2} unit="kg CO2" color="text-emerald-400" />
        <StatCard label="Mean Intensity" value={stats.avg_co2} unit="kg / Entry" color="text-blue-400" />
        <StatCard label="Active Audit Logs" value={stats.count} unit="Entries" color="text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-8 glass-card p-10 h-[500px] flex flex-col bg-slate-900/40 rounded-[2.5rem] border border-white/5 relative group">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold font-syne tracking-tighter">Carbon Pulse Timeline</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Real-time optimization metrics</p>
            </div>
            <SyncIndicator status={syncStatus} />
          </div>
          <div className="flex-1 relative">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>

        {/* Audit Form */}
        <div className="lg:col-span-4 glass-card p-10 bg-slate-900/40 rounded-[2.5rem] border border-white/5">
          <h2 className="text-2xl font-bold font-syne mb-2 tracking-tighter">New Audit Entry</h2>
          <p className="text-xs text-slate-500 mb-8">Manual sync for off-grid sensors</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField placeholder="Electricity (kWh)" value={formData.elec} onChange={v => setFormData({...formData, elec: v})} />
            <InputField placeholder="Commute (km)" value={formData.commute} onChange={v => setFormData({...formData, commute: v})} />
            <InputField placeholder="Waste (kg)" value={formData.waste} onChange={v => setFormData({...formData, waste: v})} />
            <InputField placeholder="Water (m³)" value={formData.water} onChange={v => setFormData({...formData, water: v})} />
            <InputField placeholder="Paper (kg)" value={formData.paper} onChange={v => setFormData({...formData, paper: v})} />
            <button type="submit" className="w-full bg-emerald-500 text-slate-950 font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 shadow-lg shadow-emerald-500/20">
              {syncStatus === "syncing" ? "Syncing..." : "Publish Audit Log"}
            </button>
          </form>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 glass-card p-10 bg-slate-900/40 rounded-[2.5rem] border border-white/5 flex flex-col items-center">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em] mb-10 w-full">Impact Breakdown</h2>
          <div className="w-full h-64 relative">
             <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        <div className="lg:col-span-8 glass-card p-10 bg-slate-900/40 rounded-[2.5rem] border border-white/5">
           <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em] mb-8">Recent Activity Log</h2>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                   <th className="pb-4">Timestamp</th>
                   <th className="pb-4">Total CO2</th>
                   <th className="pb-4">Status</th>
                 </tr>
               </thead>
               <tbody className="text-xs">
                 {data.slice(-5).reverse().map((d, i) => (
                   <tr key={i} className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
                     <td className="py-4 text-slate-400 font-medium">{new Date(d.date).toLocaleString()}</td>
                     <td className="py-4 font-bold text-emerald-400">{d.total_co2} kg</td>
                     <td className="py-4"><span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-bold uppercase">Verified</span></td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, unit, color }) => (
  <div className="glass-card p-10 bg-slate-900/40 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all group">
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-3">{label}</p>
    <div className="flex items-baseline gap-2">
      <h3 className={`text-5xl font-black tracking-tighter ${color}`}>{value}</h3>
      <span className="text-[10px] font-bold text-slate-700 uppercase">{unit}</span>
    </div>
  </div>
);

const InputField = ({ placeholder, value, onChange }) => (
  <input 
    required 
    type="number" 
    step="any" 
    value={value} 
    onChange={e => onChange(e.target.value)} 
    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white text-sm outline-none focus:border-emerald-500 focus:bg-white/[0.07] transition-all" 
    placeholder={placeholder} 
  />
);

const SyncIndicator = ({ status }) => {
  const configs = {
    idle: { color: "bg-slate-500", text: "Idle" },
    live: { color: "bg-emerald-500 animate-pulse", text: "Live Sync" },
    syncing: { color: "bg-blue-500 animate-spin", text: "Syncing" },
    success: { color: "bg-emerald-400", text: "Published" },
    error: { color: "bg-red-500", text: "Offline" },
    offline: { color: "bg-amber-500", text: "Recovery" }
  };
  const config = configs[status] || configs.idle;
  return (
    <div className={`px-4 py-2 rounded-full border border-white/5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 bg-slate-900/50`}>
      <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
      {config.text}
    </div>
  );
};

const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { 
    y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#475569', font: { size: 10, family: 'Outfit' } } }, 
    x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 10, family: 'Outfit' } } } 
  }
};

const doughnutOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { 
    legend: { 
      position: 'bottom', 
      labels: { color: '#64748b', font: { size: 10, family: 'Outfit' }, usePointStyle: true, padding: 20 } 
    } 
  },
  cutout: '75%'
};

export default Dashboard;

