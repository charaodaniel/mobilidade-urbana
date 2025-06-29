import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, RefreshCw, Save, X, Navigation } from 'lucide-react';
import { getCurrentLocation, reverseGeocode, geocode } from '../services/locationService';
import { userService } from '../services/supabaseService';
import AddressSearch from './AddressSearch';

const LocationEditor = ({ user, onClose, onLocationUpdated }) => {
  const [currentLocation, setCurrentLocation] = useState({
    latitude: user.current_latitude || null,
    longitude: user.current_longitude || null,
    address: user.current_address || ''
  });
  const [newLocation, setNewLocation] = useState({
    latitude: null,
    longitude: null,
    address: ''
  });
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentLocation.latitude && currentLocation.longitude && !currentLocation.address) {
      loadAddressFromCoords(currentLocation.latitude, currentLocation.longitude, 'current');
    }
  }, []);

  const loadAddressFromCoords = async (lat, lng, type) => {
    try {
      const address = await reverseGeocode(lat, lng);
      if (type === 'current') {
        setCurrentLocation(prev => ({ ...prev, address: address.address || address }));
      } else {
        setNewLocation(prev => ({ ...prev, address: address.address || address }));
      }
    } catch (error) {
      console.error('Erro ao obter endereço:', error);
    }
  };

  const handleGetCurrentLocation = async () => {
    setLoadingCurrent(true);
    try {
      const location = await getCurrentLocation();
      const address = await reverseGeocode(location.lat, location.lng);
      
      setNewLocation({
        latitude: location.lat,
        longitude: location.lng,
        address: address.address || address
      });
    } catch (error) {
      console.error('Erro ao obter localização atual:', error);
      alert('Erro ao obter localização. Verifique as permissões do navegador.');
    } finally {
      setLoadingCurrent(false);
    }
  };

  const handleAddressSelect = async (address, coords) => {
    setNewLocation({
      latitude: coords.lat,
      longitude: coords.lng,
      address: address
    });
  };

  const handleSaveLocation = async () => {
    if (!newLocation.latitude || !newLocation.longitude) {
      alert('Por favor, selecione uma localização válida.');
      return;
    }

    setSaving(true);
    try {
      const updates = {
        current_latitude: newLocation.latitude,
        current_longitude: newLocation.longitude,
        current_address: newLocation.address
      };

      await userService.updateUser(user.id, updates);
      
      alert('Localização atualizada com sucesso!');
      onLocationUpdated && onLocationUpdated({
        ...user,
        ...updates
      });
      onClose && onClose();
    } catch (error) {
      console.error('Erro ao salvar localização:', error);
      alert('Erro ao salvar localização. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Editar Localização
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Localização Atual */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Localização Atual</Label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              {currentLocation.address ? (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{currentLocation.address}</span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">Nenhuma localização definida</span>
              )}
            </div>
          </div>

          {/* Nova Localização */}
          <div>
            <Label htmlFor="new-location">Nova Localização</Label>
            <AddressSearch
              onSelectAddress={handleAddressSelect}
              initialAddress={newLocation.address}
              placeholder="Digite o novo endereço..."
            />
          </div>

          {/* Botão para Obter Localização Atual */}
          <Button
            onClick={handleGetCurrentLocation}
            disabled={loadingCurrent}
            variant="outline"
            className="w-full"
          >
            {loadingCurrent ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Obtendo localização...
              </>
            ) : (
              <>
                <Navigation className="mr-2 h-4 w-4" />
                Usar Minha Localização Atual
              </>
            )}
          </Button>

          {/* Preview da Nova Localização */}
          {newLocation.address && (
            <div>
              <Label className="text-sm font-medium text-gray-700">Nova Localização Selecionada</Label>
              <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-700">{newLocation.address}</span>
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  Lat: {newLocation.latitude?.toFixed(6)}, Lng: {newLocation.longitude?.toFixed(6)}
                </div>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSaveLocation}
              disabled={saving || !newLocation.latitude}
              className="flex-1"
            >
              {saving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Localização
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>

          {/* Informações Adicionais */}
          <div className="text-xs text-gray-500 text-center">
            <p>Sua localização será usada para calcular distâncias e encontrar motoristas próximos.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationEditor;

