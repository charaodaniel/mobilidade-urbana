import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Car, BarChart3, Settings, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { mockUsers, mockRides, userRoles, rideStatuses } from '../data/mockData';

const AdminDashboard = ({ user, onLogout }) => {
  const [drivers, setDrivers] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [rides, setRides] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [editingDriver, setEditingDriver] = useState(null);

  useEffect(() => {
    setDrivers(mockUsers.drivers);
    setPassengers(mockUsers.passengers);
    setRides(mockRides);
  }, []);

  const toggleDriverStatus = (driverId) => {
    setDrivers(prev => prev.map(driver => 
      driver.id === driverId 
        ? { ...driver, isOnline: !driver.isOnline }
        : driver
    ));
  };

  const deleteDriver = (driverId) => {
    if (confirm('Tem certeza que deseja remover este motorista?')) {
      setDrivers(prev => prev.filter(driver => driver.id !== driverId));
    }
  };

  const saveDriver = (driverData) => {
    if (editingDriver) {
      setDrivers(prev => prev.map(driver => 
        driver.id === editingDriver.id ? { ...driver, ...driverData } : driver
      ));
    } else {
      const newDriver = {
        id: Date.now(),
        role: 'driver',
        isOnline: false,
        rating: 5.0,
        location: { lat: -23.5505, lng: -46.6333 },
        ...driverData
      };
      setDrivers(prev => [...prev, newDriver]);
    }
    setEditingDriver(null);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{drivers.length}</div>
            <div className="text-sm text-gray-600">Motoristas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{passengers.length}</div>
            <div className="text-sm text-gray-600">Passageiros</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{rides.length}</div>
            <div className="text-sm text-gray-600">Total de Corridas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {drivers.filter(d => d.isOnline).length}
            </div>
            <div className="text-sm text-gray-600">Motoristas Online</div>
          </CardContent>
        </Card>
      </div>

      {/* Corridas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Corridas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rides.slice(0, 5).map((ride) => {
              const passenger = passengers.find(p => p.id === ride.passengerId);
              const driver = drivers.find(d => d.id === ride.driverId);
              
              return (
                <div key={ride.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      {passenger?.name || 'Passageiro'} → {driver?.name || 'Motorista'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {ride.origin.address} → {ride.destination.address}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      ride.status === 'completed' ? 'default' :
                      ride.status === 'in_progress' ? 'secondary' :
                      ride.status === 'pending' ? 'outline' : 'destructive'
                    }>
                      {rideStatuses[ride.status]}
                    </Badge>
                    <div className="text-sm text-gray-600 mt-1">
                      R$ {ride.price?.toFixed(2) || 'Negociado'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDrivers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gerenciar Motoristas</h2>
        <Button onClick={() => setEditingDriver({})}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Motorista
        </Button>
      </div>

      <div className="grid gap-4">
        {drivers.map((driver) => (
          <Card key={driver.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="font-semibold">{driver.name}</div>
                    <div className="text-sm text-gray-600">{driver.email}</div>
                    <div className="text-sm text-gray-600">
                      {driver.vehicle.model} - {driver.vehicle.plate}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{driver.rating}</div>
                    <div className="text-xs text-gray-600">Avaliação</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">R$ {driver.pricePerKm.toFixed(2)}</div>
                    <div className="text-xs text-gray-600">Por km</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`driver-${driver.id}`} className="text-sm">
                      {driver.isOnline ? 'Online' : 'Offline'}
                    </Label>
                    <Switch
                      id={`driver-${driver.id}`}
                      checked={driver.isOnline}
                      onCheckedChange={() => toggleDriverStatus(driver.id)}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingDriver(driver)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteDriver(driver.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderDriverForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingDriver?.id ? 'Editar Motorista' : 'Novo Motorista'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              defaultValue={editingDriver?.name || ''}
              placeholder="Nome completo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue={editingDriver?.email || ''}
              placeholder="email@exemplo.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              defaultValue={editingDriver?.phone || ''}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicle-model">Modelo do Veículo</Label>
            <Input
              id="vehicle-model"
              defaultValue={editingDriver?.vehicle?.model || ''}
              placeholder="Honda Civic"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicle-plate">Placa</Label>
            <Input
              id="vehicle-plate"
              defaultValue={editingDriver?.vehicle?.plate || ''}
              placeholder="ABC-1234"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicle-color">Cor do Veículo</Label>
            <Input
              id="vehicle-color"
              defaultValue={editingDriver?.vehicle?.color || ''}
              placeholder="Prata"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price-per-km">Preço por km (R$)</Label>
            <Input
              id="price-per-km"
              type="number"
              step="0.10"
              defaultValue={editingDriver?.pricePerKm || '2.50'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicle-year">Ano do Veículo</Label>
            <Input
              id="vehicle-year"
              type="number"
              defaultValue={editingDriver?.vehicle?.year || new Date().getFullYear()}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="accepts-interior"
            defaultChecked={editingDriver?.acceptsInterior || false}
          />
          <Label htmlFor="accepts-interior">
            Aceita viagens para o interior
          </Label>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              // Aqui você coletaria os dados do formulário e chamaria saveDriver
              const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                vehicle: {
                  model: document.getElementById('vehicle-model').value,
                  plate: document.getElementById('vehicle-plate').value,
                  color: document.getElementById('vehicle-color').value,
                  year: parseInt(document.getElementById('vehicle-year').value)
                },
                pricePerKm: parseFloat(document.getElementById('price-per-km').value),
                acceptsInterior: document.getElementById('accepts-interior').checked
              };
              saveDriver(formData);
            }}
          >
            Salvar
          </Button>
          <Button variant="outline" onClick={() => setEditingDriver(null)}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600">Bem-vindo, {user.name}</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            Sair
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Navegação */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={selectedTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setSelectedTab('overview')}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Visão Geral
          </Button>
          <Button
            variant={selectedTab === 'drivers' ? 'default' : 'ghost'}
            onClick={() => setSelectedTab('drivers')}
          >
            <Car className="w-4 h-4 mr-2" />
            Motoristas
          </Button>
          <Button
            variant={selectedTab === 'passengers' ? 'default' : 'ghost'}
            onClick={() => setSelectedTab('passengers')}
          >
            <Users className="w-4 h-4 mr-2" />
            Passageiros
          </Button>
        </div>

        {/* Conteúdo */}
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'drivers' && !editingDriver && renderDrivers()}
        {selectedTab === 'drivers' && editingDriver && renderDriverForm()}
        {selectedTab === 'passengers' && (
          <Card>
            <CardHeader>
              <CardTitle>Passageiros Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {passengers.map((passenger) => (
                  <div key={passenger.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{passenger.name}</div>
                      <div className="text-sm text-gray-600">{passenger.email}</div>
                    </div>
                    <div className="text-sm text-gray-600">{passenger.phone}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

