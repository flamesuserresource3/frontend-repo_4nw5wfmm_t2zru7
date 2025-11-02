import React from 'react';
import { X, Download } from 'lucide-react';

export default function DeviceDetailModal({ device, onClose }) {
  if (!device) return null;

  const download = () => {
    const blob = new Blob([JSON.stringify(device, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${device.device?.id || 'device'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full sm:w-[720px] max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{device.device?.name}</h3>
            <p className="text-sm text-gray-500">{device.device?.id} • {device.device?.type} • {device.device?.location?.room}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={download} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
              <Download className="w-4 h-4" /> Export JSON
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto space-y-4">
          <Section title="Overview">
            <KeyValue label="Tenant" value={device.tenant} />
            <KeyValue label="Firmware" value={device.device?.fw} />
            <KeyValue label="Tags" value={device.device?.tags} />
            <KeyValue label="Uptime" value={`${device.resources?.uptime_s}s`} />
          </Section>

          <Section title="Network">
            <KeyValue label="Conn" value={device.network?.conn} />
            <KeyValue label="IP" value={device.network?.ip} />
            <KeyValue label="MAC" value={device.network?.mac} />
            <KeyValue label="RSSI" value={`${device.network?.rssi_dbm} dBm`} />
          </Section>

          <Section title="Resources">
            <KeyValue label="CPU" value={`${device.resources?.cpu_pct}%`} />
            <KeyValue label="Memory" value={`${device.resources?.mem_pct}%`} />
            <KeyValue label="Temp" value={`${device.resources?.temp_c} °C`} />
            <KeyValue label="Heap Free" value={`${device.resources?.heap_free_kb} KB`} />
            <KeyValue label="Flash Free" value={`${device.resources?.flash_free_kb} KB`} />
          </Section>

          <Section title="Sensors">
            <div className="space-y-3">
              {device.data?.map((s, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-800">{s.sensor} <span className="text-gray-400">• {s.category}</span></div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${s.quality?.status === 'error' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{s.quality?.status}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                    {s.observations && Object.entries(s.observations).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-medium text-gray-800">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900 mb-2">{title}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {children}
      </div>
    </div>
  );
}

function KeyValue({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-800 break-all">{value ?? '-'}</div>
    </div>
  );
}
