import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Clock, DollarSign, Car, User, Calendar, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  getCurrentLocation,
  reverseGeocode,
  geocode,
  calculateDistance,
  calculateFare,
  estimateTravelTime,
} from '../services/locationService';
import { rideService, userService } from '../services/supabaseService';
import AddressSearch from './AddressSearch';

const CreateRideForm = ({ currentUser, onClose, onRideCreated }) => {
  const [formData, setFormData] = useState({
    passenger_id: currentUser.role === 'passenger' ? currentUser.id : '',
    driver_id: currentUser.role === 'driver' ? currentUser.id : '',
    pickup_address: '',
    pickup_latitude: null,
    pickup_longitude: null,
    destination_address: '',
    destination_latitude: null,
    destination_longitude: null,
    is_interior: false,
    estimated_fare: 0,
    estimated_distance: 0,
    estimated_duration: 0,
    notes: '',
    scheduled_for: '',
    priority: 'normal'
  });

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingEstimates, setLoadingEstimates] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser.role === 'admin') {
      loadUsers();
    }
    loadCurrentLocation();
  }, [currentUser.role]);

  useEffect(() => {
    if (formData.pickup_latitude && formData.pickup_longitude && 
        formData.destination_latitude && formData.destination_longitude) {
      calculateEstimates();
    }
  }, [formData.pickup_latitude, formData.pickup_longitude, 
      formData.destination_latitude, formData.destination_longitude, formData.is_interior]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      const address = await reverseGeocode(location.lat, location.lng);
      
      setFormData(prev => ({
        ...prev,
        pickup_latitude: location.lat,
        pickup_longitude: location.lng,
        pickup_address: address.address || address
      }));
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      // Fallback para São Paulo
      setFormData(prev => ({
        ...prev,
        pickup_latitude: -23.5505,
        pickup_longitude: -46.6333,
        pickup_address: 'Av. Paulista, 1000 - São Paulo'
      }));
    }
  };

  const calculateEstimates = async () => {
    setLoadingEstimates(true);
    try {
      const distance = calculateDistance(
        formData.pickup_latitude,
        formData.pickup_longitude,
        formData.destination_latitude,
        formData.destination_longitude
      );
      
      const duration = estimateTravelTime(distance);
      const fare = calculateFare(distance, 5.00, formData.is_interior);

      setFormData(prev => ({
        ...prev,
        estimated_distance: distance,
        estimated_duration: duration,
        estimated_fare: fare
      }));
    } catch (error) {
      console.error('Erro ao calcular estimativas:', error);
    } finally {
      setLoadingEstimates(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePickupAddressSelect = (address, coords) => {
    setFormData(prev => ({
      ...prev,
      pickup_address: address,
      pickup_latitude: coords.lat,
      pickup_longitude: coords.lng
    }));
  };

  const handleDestinationAddressSelect = (address, coords) => {
    setFormData(prev => ({
      ...prev,
      destination_address: address,
      destination_latitude: coords.lat,
      destination_longitude: coords.lng
    }));
  };

  const validateForm = () => {
    if (!formData.pickup_address || !formData.pickup_latitude) {
      alert('Por favor, selecione o endereço de origem.');
      return false;
    }

    if (currentUser.role === 'admin' && !formData.passenger_id) {
      alert('Por favor, selecione um passageiro.');
      return false;
    }

    // Destino é opcional para alguns casos
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const rideData = {
        ...formData,
        passenger_id: formData.passenger_id || currentUser.id,
        status: currentUser.role === 'admin' ? 'pending' : 'pending',
        created_by: currentUser.id,
        scheduled_for: formData.scheduled_for || null
      };

      const newRide = await rideService.createRide(rideData);
      alert('Viagem criada com sucesso!');
      onRideCreated && onRideCreated(newRide);
      onClose && onClose();
    } catch (error) {
      console.error('Erro ao criar viagem:', error);
      alert(`Erro ao criar viagem: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleTitle = () => {
    switch (currentUser.role) {
      case 'passenger': return 'Passageiro';
      case 'driver': return 'Motorista';
      case 'admin': return 'Administrador';
      default: return 'Usuário';
    }
  };

  const passengers = users.filter(u => u.role === 'passenger');
  const drivers = users.filter(u => u.role === 'driver');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Criar Nova Viagem - {getRoleTitle()}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção de Passageiro (apenas para Admin) */}
          {currentUser.role === 'admin' && (
            <div>
              <Label htmlFor="passenger">Passageiro *</Label>
              <Select value={formData.passenger_id} onValueChange={(value) => handleInputChange('passenger_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um passageiro" />
                </SelectTrigger>
                <SelectContent>
                  {passengers.map((passenger) => (
                    <SelectItem key={passenger.id} value={passenger.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {passenger.name} - {passenger.email}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Seleção de Motorista (apenas para Admin) */}
          {currentUser.role === 'admin' && (
            <div>
              <Label htmlFor="driver">Motorista (Opcional)</Label>
              <Select value={formData.driver_id} onValueChange={(value) => handleInputChange('driver_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Deixe vazio para atribuição automática" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Atribuição automática</SelectItem>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        {driver.name} - {driver.email}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Endereço de Origem */}
          <div>
            <Label htmlFor="pickup">Endereço de Origem *</Label>
            <AddressSearch
              onSelectAddress={handlePickupAddressSelect}
              initialAddress={formData.pickup_address}
              placeholder="De onde você está saindo?"
            />
          </div>

          {/* Endereço de Destino */}
          <div>
            <Label htmlFor="destination">Endereço de Destino</Label>
            <AddressSearch
              onSelectAddress={handleDestinationAddressSelect}
              initialAddress={formData.destination_address}
              placeholder="Para onde você quer ir? (Opcional)"
            />
          </div>

          {/* Opções da Viagem */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-interior"
                checked={formData.is_interior}
                onCheckedChange={(checked) => handleInputChange('is_interior', checked)}
              />
              <Label htmlFor="is-interior">Destino no interior</Label>
            </div>

            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Agendamento */}
          <div>
            <Label htmlFor="scheduled">Agendar para (Opcional)</Label>
            <Input
              id="scheduled"
              type="datetime-local"
              value={formData.scheduled_for}
              onChange={(e) => handleInputChange('scheduled_for', e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Informações adicionais sobre a viagem..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Estimativas */}
          {formData.destination_latitude && (
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Estimativas da Viagem</h4>
                {loadingEstimates ? (
                  <p className="text-center text-gray-500">Calculando estimativas...</p>
                ) : (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Distância</p>
                      <p className="font-semibold text-lg flex items-center justify-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {formData.estimated_distance.toFixed(1)} km
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tempo</p>
                      <p className="font-semibold text-lg flex items-center justify-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formData.estimated_duration} min
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Preço Estimado</p>
                      <p className="font-semibold text-lg flex items-center justify-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formData.is_interior ? 'A negociar' : `R$ ${formData.estimated_fare.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={submitting || loadingEstimates}
              className="flex-1"
            >
              {submitting ? 'Criando...' : 'Criar Viagem'}
              <Car className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={submitting}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateRideForm;

