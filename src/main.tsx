import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { project } from './project';
import './styles.css';

type ExportRow = Record<string, string | number | boolean>;
type SerialPortLike = {
  open: (options: { baudRate: number }) => Promise<void>;
  close?: () => Promise<void>;
};
type SerialNavigator = Navigator & {
  serial?: {
    requestPort: () => Promise<SerialPortLike>;
  };
};

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows: ExportRow[]) {
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const quote = (value: unknown) => String(value ?? '').replace(/"/g, '""');
  return [headers.join(','), ...rows.map((row) => headers.map((h) => '"' + quote(row[h]) + '"').join(','))].join('\n');
}

function parseCsv(text: string): ExportRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    return Object.fromEntries(headers.map((h, index) => [h, values[index] ?? '']));
  });
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <section className="hero">
        <div>
          <h1>{project.title}</h1>
          <p>{project.tagline}</p>
        </div>
        <aside className="notice">
          <strong>EETEPA Vilhena Alves</strong>
          <span>Protótipo educacional de portfólio</span>
          <small>Não é sistema oficial institucional. Apenas dados sintéticos.</small>
        </aside>
      </section>
      {children}
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Metric({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'ok' | 'warn' }) {
  return (
    <div className={'metric ' + tone}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Bar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const width = Math.max(4, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="barRow">
      <span>{label}</span>
      <div><i style={{ width: width + '%' }} /></div>
      <strong>{value}</strong>
    </div>
  );
}

function SubnetTrainer() {
  const [prefix, setPrefix] = useState(26);
  const [vlans, setVlans] = useState(4);
  const hosts = Math.max(2, Math.pow(2, 32 - prefix) - 2);
  const blocks = Array.from({ length: vlans }, (_, index) => ({
    vlan: 10 + index * 10,
    network: '192.168.' + index + '.0/' + prefix,
    first: '192.168.' + index + '.1',
    last: '192.168.' + index + '.' + Math.min(254, hosts),
    hosts,
  }));
  const report = '# Subnet Plan\n\n' + blocks.map((block) => '- VLAN ' + block.vlan + ': ' + block.network + ' hosts=' + block.hosts).join('\n');
  return (
    <Shell>
      <div className="grid">
        <Panel title="Laboratório CIDR">
          <label>Prefix /{prefix}<input type="range" min="24" max="30" value={prefix} onChange={(event) => setPrefix(Number(event.currentTarget.value))} /></label>
          <label>Quantidade de VLANs {vlans}<input type="range" min="2" max="8" value={vlans} onChange={(event) => setVlans(Number(event.currentTarget.value))} /></label>
          <div className="metrics"><Metric label="Hosts por sub-rede" value={String(hosts)} /><Metric label="Máscara de sub-rede" value={'/' + prefix} /><Metric label="VLANs" value={String(vlans)} tone="ok" /></div>
          <button onClick={() => downloadText('eetepa-subnet-plan.md', report)}>Exportar Markdown</button>
        </Panel>
        <Panel title="Plano Visual de Endereçamento">
          <div className="subnetGrid">{blocks.map((block) => <article key={block.vlan}><strong>VLAN {block.vlan}</strong><span>{block.network}</span><small>{block.first} - {block.last}</small></article>)}</div>
        </Panel>
      </div>
    </Shell>
  );
}

function PacketPathVisualizer() {
  const steps = [
    { name: 'Clienteeee', detail: 'Student workstation prepares a request.', latency: 2 },
    { name: 'ARP', detail: 'Local MAC address is resolved inside the LAN.', latency: 5 },
    { name: 'DNS', detail: 'Name is translated to an IP address.', latency: 18 },
    { name: 'TCP', detail: 'Three-way handshake establishes transport.', latency: 28 },
    { name: 'HTTP', detail: 'Request reaches the learning service.', latency: 40 },
    { name: 'Resposta', detail: 'Packets return and the browser renders data.', latency: 52 },
  ];
  const [active, setActive] = useState(0);
  const total = steps.slice(0, active + 1).reduce((sum, step) => sum + step.latency, 0);
  const report = '# Packet Path\n\n' + steps.map((step, index) => (index + 1) + '. ' + step.name + ' - ' + step.detail).join('\n');
  return (
    <Shell>
      <div className="grid">
        <Panel title="Linha do Tempo de Protocolos">
          <div className="path">{steps.map((step, index) => <button key={step.name} className={index <= active ? 'active' : ''} onClick={() => setActive(index)}>{step.name}</button>)}</div>
          <p className="note">{steps[active].detail}</p>
          <div className="metrics"><Metric label="Camada atual" value={steps[active].name} /><Metric label="Latência sintética" value={String(total) + ' ms'} tone="ok" /></div>
          <button onClick={() => downloadText('packet-path-report.md', report)}>Exportar Markdown</button>
        </Panel>
        <Panel title="Latência Budget">
          {steps.map((step, index) => <Bar key={step.name} label={step.name} value={index <= active ? step.latency : 0} max={60} />)}
        </Panel>
      </div>
    </Shell>
  );
}

const defaultCsv = 'item,course,status,score\nCSV basics,Data Science,ready,92\nSubnet lab,Networks,ready,87\nSerial sensor,Computing,revisar,74\nDashboard,Data Science,,81\nDashboard,Data Science,,81';

function DataEtlPlayground() {
  const [text, setText] = useState(defaultCsv);
  const [rows, setRows] = useState<ExportRow[]>(parseCsv(defaultCsv));
  const cleaned = useMemo<ExportRow[]>(() => {
    const seen = new Set<string>();
    return rows.map((row): ExportRow => ({ ...row, status: row.status || 'needs-revisar' })).filter((row) => {
      const key = JSON.stringify(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [rows]);
  const ready = cleaned.filter((row) => row.status === 'ready').length;
  function loadLocalFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = String(reader.result ?? '');
      setText(next);
      setRows(parseCsv(next));
    };
    reader.readAsText(file);
  }
  return (
    <Shell>
      <div className="grid">
        <Panel title="Local Data Input">
          <textarea value={text} onChange={(event) => setText(event.currentTarget.value)} />
          <div className="actions">
            <button onClick={() => setRows(parseCsv(text))}>Parse CSV</button>
            <label className="fileButton">Import CSV<input type="file" accept=".csv,text/csv" onChange={(event) => loadLocalFile(event.currentTarget.files?.[0])} /></label>
          </div>
          <div className="metrics"><Metric label="Raw rows" value={String(rows.length)} /><Metric label="Clean rows" value={String(cleaned.length)} tone="ok" /><Metric label="Pronto" value={String(ready)} /></div>
        </Panel>
        <Panel title="Cleaned Table">
          <div className="table">{cleaned.map((row, index) => <article key={index}><strong>{String(row.item)}</strong><span>{String(row.course)}</span><small>{String(row.status)} - score {String(row.score)}</small></article>)}</div>
          <button onClick={() => downloadText('eetepa-clean-data.csv', toCsv(cleaned))}>Exportar CSV</button>
          <button onClick={() => downloadText('eetepa-clean-data.json', JSON.stringify(cleaned, null, 2))}>Exportar JSON</button>
        </Panel>
      </div>
    </Shell>
  );
}

function MakerSerialDashboard() {
  const [connected, setConnected] = useState(false);
  const [mode, setMode] = useState('synthetic');
  const [seed, setSeed] = useState(12);
  const samples = Array.from({ length: 18 }, (_, index) => ({
    t: index,
    temperature: 24 + Math.round(Math.sin((index + seed) / 3) * 4),
    distance: 35 + Math.round(Math.cos((index + seed) / 4) * 12),
    light: 60 + Math.round(Math.sin((index + seed) / 5) * 24),
  }));
  async function connectSerial() {
    const nav = navigator as SerialNavigator;
    if (!nav.serial) {
      setMode('demo-only');
      setConnected(false);
      return;
    }
    try {
      const port = await nav.serial.requestPort();
      await port.open({ baudRate: 9600 });
      setConnected(true);
      setMode('web-serial');
    } catch {
      setMode('connection-cancelled');
    }
  }
  return (
    <Shell>
      <div className="grid">
        <Panel title="Sensor Stream">
          <div className="chart">{samples.map((sample) => <span key={sample.t} style={{ height: sample.light * 2 + 'px' }} />)}</div>
          <div className="metrics"><Metric label="Mode" value={mode} /><Metric label="Connected" value={connected ? 'yes' : 'no'} tone={connected ? 'ok' : 'warn'} /></div>
          <button onClick={() => setSeed(seed + 3)}>Generate synthetic frame</button>
          <button onClick={connectSerial}>Connect Web Serial</button>
        </Panel>
        <Panel title="Latest Reading">
          {samples.slice(-1).map((sample) => <div className="metrics" key={sample.t}><Metric label="Temp" value={sample.temperature + ' C'} /><Metric label="Distância" value={sample.distance + ' cm'} /><Metric label="Light" value={sample.light + '%'} tone="ok" /></div>)}
          <p className="note">Serial data stays in the browser. Sintético mode supports classes without hardware.</p>
          <button onClick={() => downloadText('maker-serial-samples.csv', toCsv(samples))}>Exportar CSV</button>
        </Panel>
      </div>
    </Shell>
  );
}

function HelpdeskAnalytics() {
  const tickets = [
    { id: 'LAB-101', category: 'network', priority: 'high', hours: 3, status: 'open' },
    { id: 'LAB-102', category: 'software', priority: 'medium', hours: 5, status: 'closed' },
    { id: 'LAB-103', category: 'hardware', priority: 'high', hours: 9, status: 'open' },
    { id: 'LAB-104', category: 'account', priority: 'low', hours: 2, status: 'closed' },
    { id: 'LAB-105', category: 'network', priority: 'medium', hours: 7, status: 'open' },
  ];
  const [filter, setFilter] = useState('all');
  const visible = tickets.filter((ticket) => filter === 'all' || ticket.category === filter);
  const breached = visible.filter((ticket) => ticket.hours > 6).length;
  return (
    <Shell>
      <div className="grid">
        <Panel title="Operations Metrics">
          <select value={filter} onChange={(event) => setFilter(event.currentTarget.value)}>
            <option value="all">All categories</option>
            <option value="network">Network</option>
            <option value="software">Software</option>
            <option value="hardware">Hardware</option>
            <option value="account">Account</option>
          </select>
          <div className="metrics"><Metric label="Tickets" value={String(visible.length)} /><Metric label="Risco de SLA" value={String(breached)} tone={breached > 0 ? 'warn' : 'ok'} /><Metric label="Open" value={String(visible.filter((ticket) => ticket.status === 'open').length)} /></div>
          {['network', 'software', 'hardware', 'account'].map((category) => <Bar key={category} label={category} value={tickets.filter((ticket) => ticket.category === category).length} max={4} />)}
        </Panel>
        <Panel title="Ticket Queue">
          <div className="table">{visible.map((ticket) => <article key={ticket.id}><strong>{ticket.id}</strong><span>{ticket.category} - {ticket.priority}</span><small>{ticket.hours} h - {ticket.status}</small></article>)}</div>
          <button onClick={() => downloadText('helpdesk-analytics.csv', toCsv(visible))}>Exportar CSV</button>
        </Panel>
      </div>
    </Shell>
  );
}

function LabInventoryLite() {
  const [items, setItems] = useState([
    { asset: 'LAB-PC-01', room: 'Maker Lab', os: 'Linux', port: 'SW1-01', status: 'ready' },
    { asset: 'LAB-PC-02', room: 'Networks Lab', os: 'Windows', port: 'SW1-02', status: 'revisar' },
    { asset: 'KIT-IOT-01', room: 'Maker Lab', os: 'Firmware', port: 'USB', status: 'ready' },
  ]);
  function addAsset() {
    const next = items.length + 1;
    setItems([...items, { asset: 'LAB-ASSET-' + String(next).padStart(2, '0'), room: 'Data Lab', os: 'Linux', port: 'SW2-' + String(next).padStart(2, '0'), status: 'planned' }]);
  }
  return (
    <Shell>
      <div className="grid">
        <Panel title="Inventory Summary">
          <div className="metrics"><Metric label="Assets" value={String(items.length)} /><Metric label="Pronto" value={String(items.filter((item) => item.status === 'ready').length)} tone="ok" /><Metric label="Review" value={String(items.filter((item) => item.status !== 'ready').length)} tone="warn" /></div>
          <button onClick={addAsset}>Add synthetic asset</button>
          <button onClick={() => downloadText('lab-inventory.json', JSON.stringify(items, null, 2))}>Exportar JSON</button>
          <button onClick={() => downloadText('lab-inventory.csv', toCsv(items))}>Exportar CSV</button>
        </Panel>
        <Panel title="Lab Assets">
          <div className="table">{items.map((item) => <article key={item.asset}><strong>{item.asset}</strong><span>{item.room} - {item.os}</span><small>{item.port} - {item.status}</small></article>)}</div>
        </Panel>
      </div>
    </Shell>
  );
}

function ScheduleOptimizer() {
  const [rooms, setRooms] = useState(3);
  const classes = ['P1 Data', 'P3 Computing', 'P5 Networks', 'Maker Lab', 'Robotics'];
  const slots = ['Mon AM', 'Tue AM', 'Wed PM', 'Thu AM', 'Fri PM'];
  const plan = classes.map((klass, index) => ({
    className: klass,
    slot: slots[index % slots.length],
    room: 'Lab ' + ((index % rooms) + 1),
    score: 80 + ((index * 7) % 18),
  }));
  return (
    <Shell>
      <div className="grid">
        <Panel title="Planning Controls">
          <label>Available labs {rooms}<input type="range" min="1" max="5" value={rooms} onChange={(event) => setRooms(Number(event.currentTarget.value))} /></label>
          <div className="metrics"><Metric label="Classes" value={String(classes.length)} /><Metric label="Labs" value={String(rooms)} /><Metric label="Average fit" value={Math.round(plan.reduce((sum, item) => sum + item.score, 0) / plan.length) + '%'} tone="ok" /></div>
          <button onClick={() => downloadText('schedule-plan.csv', toCsv(plan))}>Exportar CSV</button>
        </Panel>
        <Panel title="Heuristic Schedule">
          <div className="schedule">{plan.map((item) => <article key={item.className}><strong>{item.className}</strong><span>{item.slot}</span><small>{item.room} - fit {item.score}%</small></article>)}</div>
        </Panel>
      </div>
    </Shell>
  );
}

function CyberRangeLite() {
  const [password, setPassword] = useState('Eetepa@2026');
  const [selected, setSelected] = useState('phishing');
  const score = Math.min(100, (password.length * 7) + (/[A-Z]/.test(password) ? 12 : 0) + (/[0-9]/.test(password) ? 12 : 0) + (/[^A-Za-z0-9]/.test(password) ? 16 : 0));
  const events = [
    { type: 'phishing', log: 'User clicked a suspicious shortened link', risk: 78 },
    { type: 'password', log: 'Weak password detected in lab exercise', risk: 64 },
    { type: 'network', log: 'Repeated login attempts from unknown host', risk: 82 },
    { type: 'safe', log: 'Backup completed with expected checksum', risk: 10 },
  ];
  const visible = events.filter((event) => selected === 'all' || event.type === selected);
  return (
    <Shell>
      <div className="grid">
        <Panel title="Awareness Lab">
          <label>Password strength demo<input value={password} onChange={(event) => setPassword(event.currentTarget.value)} /></label>
          <div className="metrics"><Metric label="Strength" value={String(score) + '/100'} tone={score > 70 ? 'ok' : 'warn'} /><Metric label="Scenario" value={selected} /></div>
          <select value={selected} onChange={(event) => setSelected(event.currentTarget.value)}>
            <option value="all">All events</option>
            <option value="phishing">Phishing</option>
            <option value="password">Password</option>
            <option value="network">Network</option>
            <option value="safe">Safe</option>
          </select>
          <button onClick={() => downloadText('cyber-range-report.json', JSON.stringify({ score, visible }, null, 2))}>Exportar JSON</button>
        </Panel>
        <Panel title="Sintético Logs">
          <div className="table">{visible.map((event) => <article key={event.log}><strong>{event.type}</strong><span>{event.log}</span><small>risk {event.risk}/100</small></article>)}</div>
        </Panel>
      </div>
    </Shell>
  );
}

function App() {
  switch (project.type) {
    case 'subnet': return <SubnetTrainer />;
    case 'packet': return <PacketPathVisualizer />;
    case 'etl': return <DataEtlPlayground />;
    case 'serial': return <MakerSerialDashboard />;
    case 'helpdesk': return <HelpdeskAnalytics />;
    case 'inventory': return <LabInventoryLite />;
    case 'schedule': return <ScheduleOptimizer />;
    case 'cyber': return <CyberRangeLite />;
    default: return <SubnetTrainer />;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
