import React, { useMemo, useState } from 'react';
import Header from './components/Header';
import DeviceStats from './components/DeviceStats';
import DeviceTable from './components/DeviceTable';
import DeviceDetailModal from './components/DeviceDetailModal';

// Generate realistic demo devices (600+) following the provided JSON schema
function generateDevices(count = 600) {
  const tenants = ['hospital-abc', 'hospital-xyz', 'clinic-01'];
  const rooms = ['ICU-01', 'ICU-02', 'ER-01', 'Ward-12', 'Ward-08', 'Lab-03', 'OR-02'];
  const types = ['esp32', 'raspberrypi', 'arduino'];

  const devices = [];
  for (let i = 1; i <= count; i++) {
    const id = `esp32-energy-meter-${String(i).padStart(3, '0')}`;
    const temp = +(30 + Math.random() * 20).toFixed(1);
    const cpu = +(Math.random() * 80).toFixed(1);
    const mem = +(20 + Math.random() * 70).toFixed(1);
    const hasPowerSensors = Math.random() > 0.1;
    const powerOk = Math.random() > 0.15;

    const powerSensors = hasPowerSensors
      ? [
          {
            sensor: 'zmpt101b',
            category: 'power',
            iface: 'analog',
            unit_system: 'SI',
            observations: { voltage_v: powerOk ? +(210 + Math.random() * 30).toFixed(1) : 0 },
            quality: {
              status: powerOk ? 'ok' : 'error',
              calibrated: true,
              errors: powerOk ? '' : 'sensor_read_failed',
              notes: 'ZMPT101B voltage sensor',
            },
          },
          {
            sensor: 'sct-013',
            category: 'power',
            iface: 'analog',
            unit_system: 'SI',
            observations: { current_a: powerOk ? +(Math.random() * 10).toFixed(2) : 0 },
            quality: {
              status: powerOk ? 'ok' : 'error',
              calibrated: true,
              errors: powerOk ? '' : 'sensor_read_failed',
              notes: 'SCT-013 current sensor',
            },
          },
          {
            sensor: 'calculated-power',
            category: 'power',
            iface: 'computed',
            unit_system: 'SI',
            observations: {
              voltage_v: powerOk ? +(210 + Math.random() * 30).toFixed(1) : 0,
              current_a: powerOk ? +(Math.random() * 10).toFixed(2) : 0,
              power_w: powerOk ? +(100 + Math.random() * 900).toFixed(0) : 0,
              energy_kwh: powerOk ? +(Math.random() * 100).toFixed(2) : 0,
            },
            quality: {
              status: powerOk ? 'ok' : 'error',
              calibrated: powerOk,
              errors: powerOk ? '' : 'sensors_not_active',
              notes: 'Calculated power from ZMPT + SCT',
            },
          },
        ]
      : [];

    const data = [
      ...powerSensors,
      {
        sensor: 'hc-sr501',
        category: 'motion',
        iface: 'digital',
        unit_system: 'SI',
        observations: { motion_detected: Math.random() > 0.8 },
        quality: { status: 'ok', calibrated: true, errors: '', notes: 'HC-SR501 PIR motion sensor' },
      },
      {
        sensor: 'dht22',
        category: 'env',
        iface: 'digital',
        unit_system: 'SI',
        observations: { temperature_c: +(temp + (Math.random() - 0.5) * 2).toFixed(1), humidity_pct: +(20 + Math.random() * 70).toFixed(1) },
        quality: { status: 'ok', calibrated: true, errors: '', notes: 'DHT22 temperature and humidity sensor' },
      },
      {
        sensor: 'rcwl-0516',
        category: 'motion',
        iface: 'digital',
        unit_system: 'SI',
        observations: { motion_detected: Math.random() > 0.85 },
        quality: { status: 'ok', calibrated: true, errors: '', notes: 'RCWL-0516 microwave radar sensor' },
      },
    ];

    const item = {
      version: '1.2',
      ts: Math.floor(Date.now() / 1000),
      seq: 100000 + i,
      tenant: tenants[i % tenants.length],
      device: {
        id,
        type: types[i % types.length],
        fw: '2.1.0',
        name: `IoT Multi-Board ${String.fromCharCode(65 + (i % 26))}`,
        location: {
          room: rooms[i % rooms.length],
          lat: -6.2 + Math.random() * 0.05,
          lng: 106.8 + Math.random() * 0.05,
          alt_m: 40 + Math.floor(Math.random() * 15),
        },
        tags: 'demo,multisensor,realistic-sim',
      },
      network: {
        conn: Math.random() > 0.05 ? 'wifi' : 'offline',
        ip: `10.${100 + (i % 100)}.${10 + (i % 200)}.${(i % 250) + 1}`,
        rssi_dbm: -30 - Math.floor(Math.random() * 50),
        snr_db: null,
        mac: `34:86:5D:B7:${String((i % 255).toString(16)).padStart(2, '0')}:${String(((i * 7) % 255).toString(16)).padStart(2, '0')}`.toUpperCase(),
      },
      power: { battery_pct: null, voltage_v: 5, charging: true },
      resources: {
        uptime_s: Math.floor(Math.random() * 100000),
        cpu_pct: cpu,
        mem_pct: mem,
        fs_used_pct: +(Math.random() * 80).toFixed(1),
        heap_free_kb: 100 + Math.floor(Math.random() * 500),
        flash_free_kb: 500 + Math.floor(Math.random() * 2000),
        temp_c: temp,
      },
      agg: { window_s: 5, method: 'raw' },
      data,
    };

    devices.push(item);
  }
  return devices;
}

export default function App() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [devices, setDevices] = useState(() => generateDevices(620));

  const filtered = useMemo(() => {
    if (!search) return devices;
    const q = search.toLowerCase();
    return devices.filter((d) => {
      const dev = d.device || {};
      const loc = dev.location || {};
      return (
        (dev.id || '').toLowerCase().includes(q) ||
        (dev.name || '').toLowerCase().includes(q) ||
        (dev.type || '').toLowerCase().includes(q) ||
        (loc.room || '').toLowerCase().includes(q) ||
        (d.tenant || '').toLowerCase().includes(q) ||
        (dev.tags || '').toLowerCase().includes(q)
      );
    });
  }, [devices, search]);

  const handleImportJSON = (json) => {
    // Basic validation for shape using required top-level fields
    if (!json || !json.device || !json.device.id) {
      alert('JSON must include a device.id');
      return;
    }
    setDevices((prev) => {
      const i = prev.findIndex((x) => x.device.id === json.device.id);
      if (i >= 0) {
        const next = prev.slice();
        next[i] = json;
        return next;
      }
      return [json, ...prev];
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <Header search={search} onSearchChange={setSearch} onImportJSON={handleImportJSON} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <DeviceStats devices={filtered} />
        <DeviceTable devices={filtered} onSelect={setSelected} />
      </main>

      <DeviceDetailModal device={selected} onClose={() => setSelected(null)} />

      <footer className="py-6 text-center text-xs text-gray-500">
        Built for large IoT fleets • Example schema compatible • Import a device JSON to add/update
      </footer>
    </div>
  );
}
