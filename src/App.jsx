import React from 'react';
import {
  Button,
  Card,
  Checkbox,
  Label,
  Progress,
  Select,
  Switch,
  Tab,
  TabList,
  Table,
  Text,
  TextInput,
} from '@gravity-ui/uikit';

const racks = [
  {id: 'R-101', zone: 'DC-1 / A1', occupancy: 88, power: '7.1 / 8.0 kW', alerts: '1 критично'},
  {id: 'R-104', zone: 'DC-1 / A2', occupancy: 64, power: '5.0 / 8.0 kW', alerts: 'ОК'},
  {id: 'R-221', zone: 'DC-2 / B7', occupancy: 93, power: '7.6 / 8.0 kW', alerts: '2 предупреждения'},
  {id: 'R-314', zone: 'DC-3 / C3', occupancy: 52, power: '3.8 / 8.0 kW', alerts: 'ОК'},
];

const changes = [
  {time: '09:14', event: 'Добавлен сервер app-prod-17', user: 'NOC-bot'},
  {time: '08:52', event: 'Резервирование порта SW-2/11', user: 'm.kuznetsov'},
  {time: '08:31', event: 'Алерт: температура R-221', user: 'sensor-edge-3'},
];

const rackColumns = [
  {id: 'id', name: 'Стойка'},
  {id: 'zone', name: 'Локация'},
  {
    id: 'occupancy',
    name: 'Заполненность',
    template: (row) => (
      <div className="cell-progress">
        <Progress value={row.occupancy} size="s" theme={row.occupancy > 90 ? 'danger' : 'info'} />
        <Text variant="caption-2">{row.occupancy}%</Text>
      </div>
    ),
  },
  {id: 'power', name: 'Питание'},
  {
    id: 'alerts',
    name: 'События',
    template: (row) =>
      row.alerts === 'ОК' ? <Label theme="success" size="s">ОК</Label> : <Label theme="danger" size="s">Нужно внимание</Label>,
  },
];

const eventColumns = [
  {id: 'time', name: 'Время', width: 90},
  {id: 'event', name: 'Изменение'},
  {id: 'user', name: 'Источник', width: 180},
];

export default function App() {
  return (
    <div className="page">
      <header className="header">
        <div>
          <Text variant="display-1">RackTables Next</Text>
          <Text variant="subheader-2" color="secondary">
            Концепт редизайна интерфейса управления дата-центром на Gravity UI
          </Text>
        </div>
        <div className="header-actions">
          <TextInput placeholder="Поиск: стойка, сервер, VLAN" size="l" />
          <Button view="action" size="l">Добавить объект</Button>
        </div>
      </header>

      <TabList>
        <Tab id="overview" selected>Обзор</Tab>
        <Tab id="racks">Стойки</Tab>
        <Tab id="network">Сеть</Tab>
        <Tab id="power">Энергия</Tab>
      </TabList>

      <section className="stats-grid">
        <Card className="stat-card" view="filled">
          <Text variant="header-1">742</Text>
          <Text color="secondary">Активных устройств</Text>
          <Label theme="success" size="s">+18 за неделю</Label>
        </Card>
        <Card className="stat-card" view="filled">
          <Text variant="header-1">96.4%</Text>
          <Text color="secondary">Доступность сервисов</Text>
          <Progress value={96.4} theme="success" size="s" />
        </Card>
        <Card className="stat-card" view="filled">
          <Text variant="header-1">11</Text>
          <Text color="secondary">Инцидентов в работе</Text>
          <Label theme="danger" size="s">3 критичных</Label>
        </Card>
      </section>

      <section className="workspace-grid">
        <Card className="panel" view="raised">
          <div className="panel-head">
            <Text variant="subheader-3">Стойки и нагрузка</Text>
            <Select
              width="max"
              defaultValue={['dc1']}
              options={[
                {value: 'dc1', content: 'DC-1'},
                {value: 'dc2', content: 'DC-2'},
                {value: 'dc3', content: 'DC-3'},
              ]}
            />
          </div>
          <Table data={racks} columns={rackColumns} />
        </Card>

        <Card className="panel" view="raised">
          <Text variant="subheader-3">Операции и фильтры</Text>
          <div className="controls-list">
            <Checkbox defaultChecked>Показывать сервисные порты</Checkbox>
            <Checkbox defaultChecked>Группировать по дата-центру</Checkbox>
            <div className="line-between">
              <Text>Автообновление телеметрии</Text>
              <Switch defaultChecked size="l" />
            </div>
            <div className="line-between">
              <Text color="secondary">Период обновления</Text>
              <Select
                defaultValue={['30s']}
                options={[
                  {value: '15s', content: '15 сек'},
                  {value: '30s', content: '30 сек'},
                  {value: '60s', content: '60 сек'},
                ]}
              />
            </div>
          </div>
          <Button view="outlined" width="max" size="l">Применить профиль оператора</Button>
        </Card>
      </section>

      <Card className="panel" view="raised">
        <Text variant="subheader-3">Лента изменений</Text>
        <Table data={changes} columns={eventColumns} />
      </Card>
    </div>
  );
}
