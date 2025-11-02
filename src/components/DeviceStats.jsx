import React, { useMemo } from 'react';
import { Activity, Wifi, AlertTriangle, Gauge } from 'lucide-react';

export default function DeviceStats({ devices }) {
  const stats = useMemo(() => {
    const total = devices.length;
    let online = 0;
    let withErrors = 0;
    let cpu = 0;
    let mem = 0;

    devices.forEach((d) => {
      const status = getDeviceStatus(d);
      if (status === 'online') online += 1;
      if (status === 'error') withErrors += 1;
      cpu += d.resources?.cpu_pct ?? 0;
      mem += d.resources?.mem_pct ?? 0;
    });

    return {
      total,
      online,
      withErrors,
      avgCpu: total ? (cpu / total).toFixed(1) : 0,
      avgMem: total ? (mem / total).toFixed(1) : 0,
    };
  }, [devices]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={<Activity className="w-5 h-5" />} title="Total Devices" value={stats.total} color="indigo" />
      <StatCard icon={<Wifi className="w-5 h-5" />} title="Online" value={stats.online} color="emerald" />
      <StatCard icon={<AlertTriangle className="w-5 h-5" />} title="With Errors" value={stats.withErrors} color="amber" />
      <StatCard icon={<Gauge className="w-5 h-5" />} title="Avg CPU / MEM" value={`${stats.avgCpu}% / ${stats.avgMem}%`} color="purple" />
    </div>
  );
}

function StatCard({ icon, title, value, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-white">
      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg ${colorMap[color]}`}>
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

export function getDeviceStatus(d) {
  const hasError = Array.isArray(d.data)
    ? d.data.some((x) => x?.quality?.status === 'error')
    : false;
  if (hasError) return 'error';
  if (d.network?.conn && d.resources?.uptime_s > 0) return 'online';
  return 'offline';
}
