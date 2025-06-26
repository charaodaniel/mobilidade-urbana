// Serviço de geolocalização e geocodificação

// Função para obter localização atual do usuário
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não é suportada neste navegador'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // Cache por 1 minuto
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada pelo usuário';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Informações de localização não disponíveis';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tempo limite para obter localização excedido';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

// Função para geocodificação reversa usando Nominatim (OpenStreetMap)
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MobiUrban/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erro na geocodificação reversa');
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return {
      address: data.display_name,
      details: {
        road: data.address?.road,
        house_number: data.address?.house_number,
        neighbourhood: data.address?.neighbourhood,
        city: data.address?.city || data.address?.town || data.address?.village,
        state: data.address?.state,
        postcode: data.address?.postcode,
        country: data.address?.country
      }
    };
  } catch (error) {
    console.error('Erro na geocodificação reversa:', error);
    throw error;
  }
};

// Função para geocodificação direta (endereço para coordenadas)
export const geocode = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&countrycodes=br`,
      {
        headers: {
          'User-Agent': 'MobiUrban/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erro na geocodificação');
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('Endereço não encontrado');
    }

    return data.map(result => ({
      address: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      importance: result.importance,
      type: result.type,
      class: result.class
    }));
  } catch (error) {
    console.error('Erro na geocodificação:', error);
    throw error;
  }
};

// Função para buscar endereços com sugestões
export const searchAddresses = async (query) => {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=br&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MobiUrban/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erro na busca de endereços');
    }

    const data = await response.json();
    
    return data.map(result => ({
      id: result.place_id,
      address: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      type: result.type,
      importance: result.importance
    }));
  } catch (error) {
    console.error('Erro na busca de endereços:', error);
    return [];
  }
};

// Função para calcular distância usando fórmula de Haversine
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distância em km
};

// Função auxiliar para converter graus para radianos
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Função para estimar tempo de viagem
export const estimateTravelTime = (distance, averageSpeed = 30) => {
  // averageSpeed em km/h (padrão: 30 km/h para cidade)
  const timeInHours = distance / averageSpeed;
  return Math.round(timeInHours * 60); // retorna em minutos
};

// Função para calcular preço da corrida
export const calculateRidePrice = (distance, pricePerKm, isInterior = false, minimumFare = 5.00) => {
  if (isInterior) {
    return null; // Preço negociado para interior
  }
  
  const calculatedPrice = distance * pricePerKm;
  return Math.max(calculatedPrice, minimumFare); // Garantir tarifa mínima
};

// Função para formatar endereço de forma mais legível
export const formatAddress = (address) => {
  if (!address) return '';
  
  // Remover informações desnecessárias e formatar
  const parts = address.split(',');
  
  // Pegar as primeiras 3-4 partes mais relevantes
  const relevantParts = parts.slice(0, 4);
  
  return relevantParts.join(', ').trim();
};

// Função para validar coordenadas
export const isValidCoordinate = (lat, lng) => {
  return (
    typeof lat === 'number' && 
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
};

// Função para obter localização com fallback
export const getLocationWithFallback = async () => {
  try {
    const location = await getCurrentLocation();
    const addressInfo = await reverseGeocode(location.lat, location.lng);
    
    return {
      ...location,
      address: formatAddress(addressInfo.address),
      fullAddress: addressInfo.address,
      details: addressInfo.details
    };
  } catch (error) {
    console.warn('Não foi possível obter localização atual:', error.message);
    
    // Fallback para localização padrão (São Paulo - Av. Paulista)
    return {
      lat: -23.5505,
      lng: -46.6333,
      address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
      fullAddress: 'Avenida Paulista, 1000, Bela Vista, São Paulo, São Paulo, Brasil',
      details: {
        road: 'Avenida Paulista',
        house_number: '1000',
        neighbourhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'São Paulo',
        country: 'Brasil'
      },
      isDefault: true
    };
  }
};

