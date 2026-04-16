import React, {useMemo, useState} from 'react';
import {
  Button,
  Card,
  Checkbox,
  Label,
  Pagination,
  Select,
  Switch,
  Tab,
  TabList,
  Table,
  Text,
  TextInput,
} from '@gravity-ui/uikit';

const objects = [
  {
    id: 'srv-lon-004',
    name: 'London server 4',
    role: 'Compute',
    location: 'LON-1 / R14 / U22',
    network: '10.24.4.17 · VLAN 310',
    tags: ['prod', 'payments'],
    status: 'critical',
    problem: 'Needs replacement: ECC error bursts on memory bank B.',
    peers: ['edge-sw-14', 'db-cluster-2'],
    ip: '10.24.4.17/24',
    nat: '203.0.113.24 → 10.24.4.17',
    ports: 'xe-0/0/11, xe-0/0/12',
  },
  {
    id: 'pdu-fra-a2',
    name: 'PDU FRA A2',
    role: 'Power',
    location: 'FRA-1 / R02 / U40',
    network: '10.80.2.9 · VLAN 870',
    tags: ['infra'],
    status: 'warning',
    problem: 'Load > 85% for 17 minutes.',
    peers: ['sensor-bus-2'],
    ip: '10.80.2.9/24',
    nat: 'n/a',
    ports: 'mgmt-1',
  },
  {
    id: 'patch-ams-33',
    name: 'Patch panel AMS 33',
    role: 'PatchPanel',
    location: 'AMS-2 / R08 / U12',
    network: 'No IP',
    tags: ['cabling'],
    status: 'ok',
    problem: '',
    peers: ['tor-8a', 'tor-8b'],
    ip: '-',
    nat: '-',
    ports: 'pp-01..pp-48',
  },
  {
    id: 'db-par-11',
    name: 'Paris DB 11',
    role: 'Database',
    location: 'PAR-1 / R10 / U09',
    network: '10.52.10.11 · VLAN 440',
    tags: ['prod', 'db'],
    status: 'ok',
    problem: '',
    peers: ['app-par-5', 'backup-node-3'],
    ip: '10.52.10.11/24',
    nat: '198.51.100.11 → 10.52.10.11',
    ports: 'xe-0/1/8',
  },
  {
    id: 'fw-nyc-2',
    name: 'NYC firewall 2',
    role: 'Security',
    location: 'NYC-1 / R03 / U30',
    network: '10.64.3.2 · VLAN 100',
    tags: ['edge', 'security'],
    status: 'warning',
    problem: 'Session table growth anomaly.',
    peers: ['isp-link-b', 'core-nyc-1'],
    ip: '10.64.3.2/24',
    nat: 'Multiple static NAT rules',
    ports: 'ge-0/0/0..3',
  },
];

const statusMeta = {
  critical: {dot: '🔴', label: 'Critical', theme: 'danger'},
  warning: {dot: '🟠', label: 'Warning', theme: 'warning'},
  ok: {dot: '🟢', label: 'OK', theme: 'success'},
};

const locationOptions = [
  {value: 'all', content: 'All locations'},
  {value: 'LON', content: 'LON'},
  {value: 'FRA', content: 'FRA'},
  {value: 'AMS', content: 'AMS'},
  {value: 'PAR', content: 'PAR'},
  {value: 'NYC', content: 'NYC'},
];

const tagOptions = [
  {value: 'all', content: 'All tags'},
  {value: 'prod', content: 'prod'},
  {value: 'payments', content: 'payments'},
  {value: 'infra', content: 'infra'},
  {value: 'security', content: 'security'},
  {value: 'db', content: 'db'},
];

export default function App() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState(['all']);
  const [tagFilter, setTagFilter] = useState(['all']);
  const [compactMode, setCompactMode] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);
  const [selectedId, setSelectedId] = useState(objects[0].id);

  const filtered = useMemo(() => {
    const location = locationFilter[0];
    const tag = tagFilter[0];
    const query = search.trim().toLowerCase();

    return objects.filter((obj) => {
      if (statusFilter !== 'all' && obj.status !== statusFilter) return false;
      if (location !== 'all' && !obj.location.includes(location)) return false;
      if (tag !== 'all' && !obj.tags.includes(tag)) return false;
      if (!query) return true;
      const haystack = `${obj.name} ${obj.id} ${obj.location} ${obj.network} ${obj.tags.join(' ')}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [search, statusFilter, locationFilter, tagFilter]);

  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;
  const selectedIndex = selected ? filtered.findIndex((item) => item.id === selected.id) : -1;

  const tableData = filtered.map((obj) => ({
    ...obj,
    statusCell: `${statusMeta[obj.status].dot} ${statusMeta[obj.status].label}`,
    tagsCell: obj.tags.join(', '),
  }));

  const columns = [
    {
      id: 'statusCell',
      name: 'Status',
      template: (row) => <Label theme={statusMeta[row.status].theme}>{row.statusCell}</Label>,
      width: 140,
    },
    {
      id: 'name',
      name: 'Name',
      template: (row) => (
        <button className="name-link" type="button" onClick={() => setSelectedId(row.id)}>
          {row.name}
        </button>
      ),
    },
    {id: 'role', name: 'Role', width: 130},
    {id: 'location', name: 'Location', width: 210},
    {id: 'network', name: 'Network', width: 220},
    {id: 'tagsCell', name: 'Tags', width: 180},
  ];

  const nextObject = () => {
    if (selectedIndex >= 0 && selectedIndex < filtered.length - 1) setSelectedId(filtered[selectedIndex + 1].id);
  };

  const prevObject = () => {
    if (selectedIndex > 0) setSelectedId(filtered[selectedIndex - 1].id);
  };

  return (
    <div className={`page ${compactMode ? 'compact' : ''}`}>
      <header className="header">
        <div>
          <Text variant="display-1">RackTables Operations UI</Text>
          <Text color="secondary">Primary task: Find object → assess status → jump to action.</Text>
        </div>
        <div className="header-actions">
          <Button view="flat" size="l">Cmd+K</Button>
          <Button view="action" size="l">Create change</Button>
        </div>
      </header>

      <TabList>
        <Tab id="objects" selected>Objects</Tab>
        <Tab id="racks">Racks</Tab>
        <Tab id="network">Network</Tab>
        <Tab id="audit">Audit</Tab>
      </TabList>

      <Card className="filters" view="raised">
        <TextInput
          size="l"
          placeholder="Quick search by name, id, location, VLAN, tags (/)"
          value={search}
          onUpdate={setSearch}
        />
        <TabList>
          <Tab id="all" selected={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>All</Tab>
          <Tab id="critical" selected={statusFilter === 'critical'} onClick={() => setStatusFilter('critical')}>🔴 Critical</Tab>
          <Tab id="warning" selected={statusFilter === 'warning'} onClick={() => setStatusFilter('warning')}>🟠 Warning</Tab>
          <Tab id="ok" selected={statusFilter === 'ok'} onClick={() => setStatusFilter('ok')}>🟢 OK</Tab>
        </TabList>
        <div className="filter-row">
          <Select value={locationFilter} onUpdate={setLocationFilter} options={locationOptions} />
          <Select value={tagFilter} onUpdate={setTagFilter} options={tagOptions} />
          <Checkbox>Saved filter preset</Checkbox>
          <div className="inline-toggle">
            <Text color="secondary">Compact mode</Text>
            <Switch checked={compactMode} onUpdate={setCompactMode} />
          </div>
        </div>
      </Card>

      <div className="workspace-grid">
        <Card className="panel" view="raised">
          <div className="panel-head">
            <Text variant="subheader-3">Objects ({filtered.length})</Text>
            <div className="bulk-actions">
              <Button view="outlined">Bulk tag</Button>
              <Button view="outlined">Bulk move</Button>
              <Button view="outlined">Bulk audit</Button>
            </div>
          </div>
          <Table data={tableData} columns={columns} />
          <Pagination page={1} pageSize={10} total={filtered.length} onUpdate={() => {}} />
        </Card>

        <Card className="panel" view="raised">
          {selected ? (
            <>
              <div className="detail-header">
                <div>
                  <Text variant="header-2">{selected.name}</Text>
                  <Text color="secondary">{selected.id} · {selected.location}</Text>
                </div>
                <Label theme={statusMeta[selected.status].theme}>{statusMeta[selected.status].dot} {statusMeta[selected.status].label}</Label>
              </div>

              {selected.status !== 'ok' && (
                <Card className="critical-strip" view="filled">
                  <Text variant="subheader-2">⚠ Has problems</Text>
                  <Text>{selected.problem}</Text>
                </Card>
              )}

              <div className="detail-grid">
                <Card className="inner-card" view="outlined">
                  <Text variant="subheader-2">Summary</Text>
                  <Text>ID: {selected.id}</Text>
                  <Text>Role: {selected.role}</Text>
                  <Text>Ports: {selected.ports}</Text>
                </Card>
                <Card className="inner-card" view="outlined">
                  <Text variant="subheader-2">Network</Text>
                  <Text>IP: {selected.ip}</Text>
                  <Text>NAT: {selected.nat}</Text>
                  <Text>Peers: {selected.peers.join(', ')}</Text>
                </Card>
              </div>

              <div className="inline-nav">
                <Button onClick={prevObject} disabled={selectedIndex <= 0}>← Previous</Button>
                <Button onClick={nextObject} disabled={selectedIndex === filtered.length - 1 || selectedIndex === -1}>Next →</Button>
                <Button view="action">Run diagnostics</Button>
              </div>

              <div className="line-between">
                <Text variant="subheader-2">Secondary data</Text>
                <Switch checked={showSecondary} onUpdate={setShowSecondary} />
              </div>
              {showSecondary && (
                <Card className="inner-card" view="outlined">
                  <Text>NAT logs and extended telemetry are collapsed by default to reduce cognitive load.</Text>
                </Card>
              )}
            </>
          ) : (
            <Text color="secondary">No objects match current filters.</Text>
          )}
        </Card>
      </div>
    </div>
  );
}
