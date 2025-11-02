import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, MinusCircle } from 'lucide-react';
import { getDeviceStatus } from './DeviceStats';

export default function DeviceTable({ devices, onSelect, pageSize = 20 }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(devices.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return devices.slice(start, start + pageSize);
  }, [devices, page, pageSize]);

  const go = (p) => setPage(Math.min(totalPages, Math.max(1, p)));

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Room</Th>
              <Th>IP</Th>
              <Th>CPU</Th>
              <Th>MEM</Th>
              <Th>Temp</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageData.map((d) => (
              <tr key={d.device.id} className="hover:bg-indigo-50/40 cursor-pointer" onClick={() => onSelect?.(d)}>
                <Td className="font-mono text-xs text-gray-700">{d.device.id}</Td>
                <Td className="font-medium">{d.device.name}</Td>
                <Td>{d.device.type}</Td>
                <Td>{d.device.location?.room || '-'}</Td>
                <Td className="font-mono text-xs">{d.network?.ip || '-'}</Td>
                <Td>{(d.resources?.cpu_pct ?? 0).toFixed ? d.resources.cpu_pct.toFixed(1) : d.resources?.cpu_pct}%</Td>
                <Td>{(d.resources?.mem_pct ?? 0).toFixed ? d.resources.mem_pct.toFixed(1) : d.resources?.mem_pct}%</Td>
                <Td>{d.resources?.temp_c ?? '-'}°C</Td>
                <Td>
                  <StatusBadge status={getDeviceStatus(d)} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, devices.length)} of {devices.length}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => go(1)} className="px-2 py-1 text-sm rounded border bg-white hover:bg-gray-50">First</button>
          <button onClick={() => go(page - 1)} className="p-1 rounded border bg-white hover:bg-gray-50" disabled={page === 1}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
          <button onClick={() => go(page + 1)} className="p-1 rounded border bg-white hover:bg-gray-50" disabled={page === totalPages}>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => go(totalPages)} className="px-2 py-1 text-sm rounded border bg-white hover:bg-gray-50">Last</button>
        </div>
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
      {children}
    </th>
  );
}

function Td({ children, className = '' }) {
  return <td className={`px-4 py-2 text-sm text-gray-700 ${className}`}>{children}</td>;
}

function StatusBadge({ status }) {
  const map = {
    online: { text: 'Online', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-4 h-4" /> },
    error: { text: 'Error', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: <AlertTriangle className="w-4 h-4" /> },
    offline: { text: 'Offline', cls: 'bg-gray-100 text-gray-700 border-gray-200', icon: <MinusCircle className="w-4 h-4" /> },
  };
  const m = map[status] || map.offline;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs ${m.cls}`}>
      {m.icon}
      {m.text}
    </span>
  );
}
