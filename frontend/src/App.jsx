app.jsx
import React, { useEffect, useState } from "react";
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
  Filler
} from 'chart.js';
import { Line } from "react-chartjs-2";
import { Leaf, Zap, Car, Trash2, Activity, PlusCircle, AlertCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE = "http://localhost:5000/api";

function App() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ total_co2: 0, avg_co2: 0, count: 0 });
  const [formData, setFormData] = useState({
    dept_electricity: "",
    student_commute: "",
    canteen_waste: ""
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    try {
      const [resData, resStats] = await Promise.all([
        axios.get(`${API_BASE}/emissions`),
        axios.get(`${API_BASE}/stats`)
      ]);
      setData(resData.data);
      setStats(resStats.data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/emissions`, {
        dept_electricity: Number(formData.dept_electricity),
        student_commute: Number(formData.student_commute),
        canteen_waste: Number(formData.canteen_waste)
      });
      setMessage("✅ Campus Pulse updated!");
      setFormData({ dept_electricity: "", student_commute: "", canteen_waste: "" });
      fetchData();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ Sync error");
    }
  };

  const chartData = {
    labels: data.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: "Campus CO2 Pulse (kg)",
        data: data.map(d => d.total_co2),
        fill: true,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#22c55e',
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f1a10',
        borderColor: '#22c55e',
        borderWidth: 1,
        titleColor: '#e8f5e8',
        bodyColor: '#e8f5e8',
      }
    },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#4a7a4c' } },
      x: { grid: { display: false }, ticks: { color: '#4a7a4c' } }
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 animate-reveal">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-16 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-[1.5rem] animate-orbit">
            <Leaf className="text-green-500 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold gradient-text tracking-tighter">Campus Carbon Pulse</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">TCET ECS Sustainability Monitor</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="glass-card px-6 py-3 flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Campus Live</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Stats & Chart */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Emissions" value={`${stats.total_co2.toFixed(1)} kg`} sub="Campus Cumulative" icon={<Zap className="text-green-400" />} />
            <StatCard title="Avg / Update" value={`${stats.avg_co2.toFixed(1)} kg`} sub="Daily Heartbeat" icon={<Activity className="text-sky-400" />} />
            <StatCard title="Audit Points" value={stats.count} sub="Records Verified" icon={<AlertCircle className="text-amber-400" />} />
          </div>

          <div className="glass-card p-8 animate-reveal" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-bold font-syne">Emissions Timeline</h2>
              <div className="text-[10px] text-slate-500 flex items-center gap-2 uppercase font-bold tracking-widest">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                CO2 Pulse (kg)
              </div>
            </div>
            {data.length > 0 ? (
              <div className="h-[350px]">
                <Line data={chartData} options={options} />
              </div>
            ) : (
              <div className="h-[350px] flex flex-col items-center justify-center text-slate-500 italic">
                <Activity className="w-12 h-12 mb-4 opacity-20" />
                Waiting for Campus Data Pulse...
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Add Data Form */}
        <div className="space-y-8">
          <div className="glass-card p-8 sticky top-8 animate-reveal" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-xl font-bold font-syne mb-8 flex items-center gap-3">
              <PlusCircle className="text-green-500 w-6 h-6" />
              New Log
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <InputGroup label="Dept. Electricity (kWh)" icon={<Zap className="w-4 h-4 text-green-400" />} value={formData.dept_electricity} onChange={(e) => setFormData({ ...formData, dept_electricity: e.target.value })} placeholder="1200" />
              <InputGroup label="Student Commute (km)" icon={<Car className="w-4 h-4 text-green-400" />} value={formData.student_commute} onChange={(e) => setFormData({ ...formData, student_commute: e.target.value })} placeholder="50" />
              <InputGroup label="Canteen Waste (kg)" icon={<Trash2 className="w-4 h-4 text-green-400" />} value={formData.canteen_waste} onChange={(e) => setFormData({ ...formData, canteen_waste: e.target.value })} placeholder="20" />

              <button type="submit" className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
                Sync Pulse Update
                <PlusCircle className="w-4 h-4" />
              </button>
            </form>

            {message && (
              <div className={`mt-6 p-4 rounded-xl text-center text-[10px] font-bold uppercase tracking-widest ${message.includes('✅') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, sub, icon }) {
  return (
    <div className="glass-card p-6 flex flex-col justify-between group animate-reveal">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-green-500/10 transition-colors">{icon}</div>
      </div>
      <div>
        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-bold font-syne tracking-tight">{value}</h3>
        <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-tighter opacity-70">{sub}</p>
      </div>
    </div>
  );
}

function InputGroup({ label, icon, value, onChange, placeholder }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
        {icon}
        {label}
      </label>
      <input required type="number" value={value} onChange={onChange} placeholder={placeholder} className="input-field w-full text-white placeholder:text-slate-700 text-sm font-medium" />
    </div>
  );
}

export default App;