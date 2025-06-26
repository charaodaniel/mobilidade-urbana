import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock, DollarSign, Star, RefreshCw, Car } from 'lucide-react';
import { mockUsers } from '../data/mockData';
import { 
  getLocationWithFallback, 
  calculateDistance, 
  estimateTravelTime, 
  calculateRidePrice,
  geocode 
} from '../services/locationService';
import AddressSearch from './AddressSearch';

const PassengerDashboard = ({ user, onLogout }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [isInterior, setIsInterior] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [rideEstimate, setRideEstimate] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Carregar localização atual ao inicializar
  useEffect(() => {
    loadCurrentLocation();
    loadAvailableDrivers();
  }, []);

  const loadCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await getLocationWithFallback();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Erro ao carregar localização:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const loadAvailableDrivers = () => {
    const drivers = mockUsers.drivers.filter(driver => driver.isOnline);
    setAvailableDrivers(drivers);
  };

  const handleLocationRequest = async () => {
    await loadCurrentLocation();
  };

  const handleDestinationSelect = (addressData) => {
    setDestination(addressData);
  };

  const calculateRideEstimate = async () => {
    if (!currentLocation || !destination) return;

    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      destination.lat,
      destination.lng
    );

    const duration = estimateTravelTime(distance);

    // Calcular preços dos motoristas disponíveis
    const driversWithPrices = availableDrivers.map(driver => {
      const driverDistance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        driver.location.lat,
        driver.location.lng
      );

      return {
        ...driver,
        distanceToPassenger: driverDistance,
        ridePrice: calculateRidePrice(distance, driver.pricePerKm, isInterior)
      };
    }).sort((a, b) => a.distanceToPassenger - b.distanceToPassenger);

    setRideEstimate({
      distance: distance.toFixed(1),
      duration,
      destination: destination,
      driversWithPrices
    });
  };

  const requestRide = (driver) => {
    setSelectedDriver(driver);
    alert(`Corrida solicitada para ${driver.name}! Em um sistema real, o motorista seria notificado.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Olá, {user.name}!</h1>
            <p className="text-gray-600">Onde você gostaria de ir hoje?</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            Sair
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Localização e Destino */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Solicitar Corrida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Localização Atual */}
            <div className="space-y-2">
              <Label>Localização Atual</Label>
              <div className="flex gap-2">
                <Input
                  value={currentLocation?.address || 'Detectando localização...'}
                  readOnly
                  className="flex-1"
                />
                <Button variant="outline" onClick={handleLocationRequest}>
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Destino */}
            <div className="space-y-2">
              <Label htmlFor="destination">Destino</Label>
              <AddressSearch
                placeholder="Digite o endereço ou nome do local"
                onAddressSelect={handleDestinationSelect}
                className="w-full"
              />
            </div>

            {/* Opção Interior */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="interior"
                checked={isInterior}
                onCheckedChange={setIsInterior}
              />
              <Label htmlFor="interior">
                Destino no interior (valor negociado)
              </Label>
            </div>

            <Button
              onClick={calculateRideEstimate}
              disabled={!currentLocation || !destination || isLoadingLocation}
              className="w-full"
            >
              {isLoadingLocation ? 'Carregando localização...' : 'Calcular Corrida'}
            </Button>
          </CardContent>
        </Card>

        {/* Estimativa da Corrida */}
        {rideEstimate && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Estimativa da Corrida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {rideEstimate.distance} km
                  </div>
                  <div className="text-sm text-gray-600">Distância</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {rideEstimate.duration} min
                  </div>
                  <div className="text-sm text-gray-600">Tempo estimado</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Motoristas Disponíveis */}
        {rideEstimate && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Motoristas Disponíveis
                </CardTitle>
                <Button variant="outline" size="sm" onClick={loadAvailableDrivers}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>
                Motoristas online próximos à sua localização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rideEstimate.driversWithPrices.map((driver) => (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{driver.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">{driver.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {driver.vehicle.model} {driver.vehicle.color} - {driver.vehicle.plate}
                      </p>
                      <p className="text-xs text-gray-500">
                        {driver.distanceToPassenger.toFixed(1)} km de distância
                      </p>
                    </div>
                    <div className="text-right">
                      {isInterior || driver.ridePrice === null ? (
                        <Badge variant="secondary">Valor negociado</Badge>
                      ) : (
                        <div className="text-lg font-bold text-green-600">
                          R$ {driver.ridePrice?.toFixed(2)}
                        </div>
                      )}
                      <Button
                        size="sm"
                        onClick={() => requestRide(driver)}
                        className="mt-2"
                        disabled={isInterior && !driver.acceptsInterior}
                      >
                        {isInterior && !driver.acceptsInterior ? 'Não aceita interior' : 'Solicitar'}
                      </Button>
                    </div>
                  </div>
                ))}
                {rideEstimate.driversWithPrices.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum motorista disponível no momento
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Corrida Selecionada */}
        {selectedDriver && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Corrida Solicitada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700">
                Sua solicitação foi enviada para <strong>{selectedDriver.name}</strong>.
                Aguarde a confirmação do motorista.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PassengerDashboard;

