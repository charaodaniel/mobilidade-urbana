import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Car, MapPin, Clock, DollarSign, Star, Bell, Settings } from 'lucide-react';
import { mockUsers, mockRides } from '../data/mockData';

const DriverDashboard = ({ user, onLogout }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [driverProfile, setDriverProfile] = useState(null);
  const [pendingRides, setPendingRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Carregar perfil do motorista
    const driver = mockUsers.drivers.find(d => d.email === user.email);
    setDriverProfile(driver);

    // Carregar corridas pendentes (simulação)
    const pending = mockRides.filter(ride => ride.status === 'pending');
    setPendingRides(pending);

    // Verificar se há corrida ativa
    const active = mockRides.find(ride => 
      ride.driverId === driver?.id && ride.status === 'in_progress'
    );
    setActiveRide(active);
  }, [user.email]);

  const handleAcceptRide = (rideId) => {
    alert(`Corrida ${rideId} aceita! Em um sistema real, o passageiro seria notificado.`);
    setPendingRides(prev => prev.filter(ride => ride.id !== rideId));
  };

  const handleRejectRide = (rideId) => {
    alert(`Corrida ${rideId} rejeitada.`);
    setPendingRides(prev => prev.filter(ride => ride.id !== rideId));
  };

  const updateProfile = (field, value) => {
    setDriverProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!driverProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Carregando perfil...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Olá, {user.name}!</h1>
              <p className="text-gray-600">
                Status: {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="online-status">Online</Label>
              <Switch
                id="online-status"
                checked={isOnline}
                onCheckedChange={setIsOnline}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowProfile(!showProfile)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Perfil
            </Button>
            <Button variant="outline" onClick={onLogout}>
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{driverProfile.rating}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                Avaliação
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">R$ {driverProfile.pricePerKm.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Por km</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">15</div>
              <div className="text-sm text-gray-600">Corridas hoje</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">R$ 280,50</div>
              <div className="text-sm text-gray-600">Ganhos hoje</div>
            </CardContent>
          </Card>
        </div>

        {/* Corrida Ativa */}
        {activeRide && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Car className="w-5 h-5" />
                Corrida em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Origem:</strong> {activeRide.origin.address}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Destino:</strong> {activeRide.destination.address}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Valor:</strong> R$ {activeRide.price?.toFixed(2) || 'Negociado'}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Finalizar Corrida
                </Button>
                <Button size="sm" variant="outline">
                  Contatar Passageiro
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Solicitações de Corrida */}
        {isOnline && pendingRides.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Novas Solicitações
              </CardTitle>
              <CardDescription>
                Corridas disponíveis na sua região
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="border rounded-lg p-4 bg-blue-50"
                  >
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          <strong>Origem:</strong> {ride.origin.address}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          <strong>Destino:</strong> {ride.destination.address}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          <strong>Distância:</strong> {ride.distance} km
                        </span>
                      </div>
                      {ride.isInterior && (
                        <Badge variant="secondary">Viagem para interior</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRide(ride.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Aceitar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRide(ride.id)}
                      >
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Perfil do Motorista */}
        {showProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle-model">Modelo do Veículo</Label>
                  <Input
                    id="vehicle-model"
                    value={driverProfile.vehicle.model}
                    onChange={(e) => updateProfile('vehicle', {
                      ...driverProfile.vehicle,
                      model: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle-plate">Placa</Label>
                  <Input
                    id="vehicle-plate"
                    value={driverProfile.vehicle.plate}
                    onChange={(e) => updateProfile('vehicle', {
                      ...driverProfile.vehicle,
                      plate: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle-color">Cor</Label>
                  <Input
                    id="vehicle-color"
                    value={driverProfile.vehicle.color}
                    onChange={(e) => updateProfile('vehicle', {
                      ...driverProfile.vehicle,
                      color: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price-per-km">Preço por km (R$)</Label>
                  <Input
                    id="price-per-km"
                    type="number"
                    step="0.10"
                    value={driverProfile.pricePerKm}
                    onChange={(e) => updateProfile('pricePerKm', parseFloat(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="accepts-interior"
                  checked={driverProfile.acceptsInterior}
                  onCheckedChange={(checked) => updateProfile('acceptsInterior', checked)}
                />
                <Label htmlFor="accepts-interior">
                  Aceito viagens para o interior
                </Label>
              </div>
              <Button className="w-full">
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Estado Offline */}
        {!isOnline && (
          <Card className="border-gray-300 bg-gray-50">
            <CardContent className="p-8 text-center">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Você está offline
              </h3>
              <p className="text-gray-500 mb-4">
                Ative o status online para receber solicitações de corrida
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;

