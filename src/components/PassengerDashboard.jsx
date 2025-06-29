import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock, DollarSign, Star, Phone, Car } from 'lucide-react';
import { getCurrentLocation, reverseGeocode, calculateDistance, calculateFare, calculateDuration } from '../services/locationService';
import { driverService, rideService } from '../services/supabaseService';
import AddressSearch from './AddressSearch';

const PassengerDashboard = ({ user, onLogout }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [isInterior, setIsInterior] = useState(false);
  const [rideEstimate, setRideEstimate] = useState(null);
  const [onlineDrivers, setOnlineDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myRides, setMyRides] = useState([]);

  useEffect(() => {
    loadCurrentLocation();
    loadOnlineDrivers();
    loadMyRides();
  }, []);

  const loadCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setCurrentLocation({ latitude: location.lat, longitude: location.lng });
      
      const address = await reverseGeocode(location.lat, location.lng);
      setCurrentAddress(address.address || address);
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      // Fallback para São Paulo
      const fallbackLocation = { latitude: -23.5505, longitude: -46.6333 };
      setCurrentLocation(fallbackLocation);
      setCurrentAddress('São Paulo, SP, Brasil');
    }
  };

  const loadOnlineDrivers = async () => {
    try {
      const drivers = await driverService.getOnlineDrivers();
      
      // Calcular distância para cada motorista
      if (currentLocation) {
        const driversWithDistance = drivers.map(driver => ({
          ...driver,
          distance: calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            driver.current_latitude || -23.5505,
            driver.current_longitude || -46.6333
          )
        })).sort((a, b) => a.distance - b.distance);
        
        setOnlineDrivers(driversWithDistance);
      } else {
        setOnlineDrivers(drivers);
      }
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      // Fallback para dados mock se houver erro
      setOnlineDrivers([]);
    }
  };

  const loadMyRides = async () => {
    try {
      const rides = await rideService.getPassengerRides(user.id);
      setMyRides(rides);
    } catch (error) {
      console.error('Erro ao carregar minhas corridas:', error);
      setMyRides([]);
    }
  };

  const calculateRideEstimate = () => {
    if (!currentLocation || !destinationCoords) return;

    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      destinationCoords.latitude,
      destinationCoords.longitude
    );

    const duration = calculateDuration(distance);
    const fare = isInterior ? null : calculateFare(distance);

    setRideEstimate({
      distance: distance.toFixed(1),
      duration,
      fare
    });
  };

  const requestRide = async () => {
    if (!currentLocation || !destinationCoords || !destination) {
      alert('Por favor, preencha todos os campos necessários.');
      return;
    }

    setLoading(true);
    try {
      const rideData = {
        passenger_id: user.id,
        pickup_latitude: currentLocation.latitude,
        pickup_longitude: currentLocation.longitude,
        pickup_address: currentAddress,
        destination_latitude: destinationCoords.latitude,
        destination_longitude: destinationCoords.longitude,
        destination_address: destination,
        is_interior: isInterior,
        estimated_distance: rideEstimate?.distance,
        estimated_duration: rideEstimate?.duration,
        estimated_fare: rideEstimate?.fare,
        status: 'pending'
      };

      const newRide = await rideService.createRide(rideData);
      
      alert('Corrida solicitada com sucesso! Aguarde um motorista aceitar.');
      
      // Limpar formulário
      setDestination('');
      setDestinationCoords(null);
      setRideEstimate(null);
      setIsInterior(false);
      
      // Recarregar corridas
      loadMyRides();
    } catch (error) {
      console.error('Erro ao solicitar corrida:', error);
      alert('Erro ao solicitar corrida. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDestinationSelect = (address, coords) => {
    setDestination(address);
    setDestinationCoords(coords);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pendente', variant: 'secondary' },
      accepted: { label: 'Aceita', variant: 'default' },
      in_progress: { label: 'Em Andamento', variant: 'default' },
      completed: { label: 'Concluída', variant: 'success' },
      cancelled: { label: 'Cancelada', variant: 'destructive' }
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel do Passageiro</h1>
            <p className="text-gray-600">Bem-vindo, {user.name}!</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Solicitar Corrida */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Solicitar Corrida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Localização Atual */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Localização Atual
                </label>
                <Input
                  value={currentAddress}
                  readOnly
                  className="bg-gray-50"
                />
              </div>

              {/* Destino */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Navigation className="inline h-4 w-4 mr-1" />
                  Destino
                </label>
                <AddressSearch
                  onAddressSelect={handleDestinationSelect}
                  placeholder="Digite o endereço de destino..."
                />
              </div>

              {/* Checkbox Interior */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="interior"
                  checked={isInterior}
                  onCheckedChange={setIsInterior}
                />
                <label htmlFor="interior" className="text-sm">
                  Destino no interior (valor negociado)
                </label>
              </div>

              {/* Botão Calcular */}
              <Button
                onClick={calculateRideEstimate}
                disabled={!destination || !destinationCoords}
                className="w-full"
                variant="outline"
              >
                Calcular Estimativa
              </Button>

              {/* Estimativa */}
              {rideEstimate && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Navigation className="h-4 w-4" />
                      Distância:
                    </span>
                    <span className="font-semibold">{rideEstimate.distance} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Tempo estimado:
                    </span>
                    <span className="font-semibold">{rideEstimate.duration} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Valor estimado:
                    </span>
                    <span className="font-semibold">
                      {isInterior ? 'A negociar' : `R$ ${rideEstimate.fare?.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Botão Solicitar */}
              <Button
                onClick={requestRide}
                disabled={!rideEstimate || loading}
                className="w-full"
              >
                {loading ? 'Solicitando...' : 'Solicitar Corrida'}
              </Button>
            </CardContent>
          </Card>

          {/* Motoristas Online */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Motoristas Online</span>
                <Button variant="outline" size="sm" onClick={loadOnlineDrivers}>
                  Atualizar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {onlineDrivers.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum motorista online no momento
                  </p>
                ) : (
                  onlineDrivers.map((driver) => (
                    <div key={driver.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{driver.users?.name || 'Motorista'}</h4>
                          <p className="text-sm text-gray-600">
                            {driver.vehicle_model} - {driver.vehicle_plate}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{driver.rating || '5.0'}</span>
                          </div>
                          {driver.distance && (
                            <p className="text-xs text-gray-500">
                              {driver.distance.toFixed(1)} km
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Valor base: R$ {driver.base_fare?.toFixed(2) || '5.00'}/km
                        </span>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Minhas Corridas */}
        <Card>
          <CardHeader>
            <CardTitle>Minhas Corridas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myRides.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Você ainda não tem corridas
                </p>
              ) : (
                myRides.slice(0, 5).map((ride) => (
                  <div key={ride.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{ride.pickup_address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-red-600" />
                          <span className="text-sm">{ride.destination_address}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(ride.status)}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(ride.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    {ride.driver && (
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm text-gray-600">
                          Motorista: {ride.driver.name}
                        </span>
                        <span className="text-sm font-semibold">
                          {ride.final_fare ? `R$ ${ride.final_fare.toFixed(2)}` : 
                           ride.estimated_fare ? `R$ ${ride.estimated_fare.toFixed(2)}` : 
                           'A negociar'}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PassengerDashboard;

