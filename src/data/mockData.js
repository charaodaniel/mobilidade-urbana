// Dados simulados para o sistema de mobilidade urbana

export const mockUsers = {
  passengers: [
    {
      id: 1,
      name: "João Silva",
      email: "joao@email.com",
      phone: "(11) 99999-1111",
      role: "passenger"
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria@email.com",
      phone: "(11) 99999-2222",
      role: "passenger"
    }
  ],
  drivers: [
    {
      id: 3,
      name: "Carlos Oliveira",
      email: "carlos@email.com",
      phone: "(11) 99999-3333",
      role: "driver",
      vehicle: {
        model: "Honda Civic",
        plate: "ABC-1234",
        color: "Prata",
        year: 2020
      },
      rating: 4.8,
      isOnline: true,
      location: {
        lat: -23.5505,
        lng: -46.6333
      },
      pricePerKm: 2.50,
      acceptsInterior: true
    },
    {
      id: 4,
      name: "Ana Costa",
      email: "ana@email.com",
      phone: "(11) 99999-4444",
      role: "driver",
      vehicle: {
        model: "Toyota Corolla",
        plate: "DEF-5678",
        color: "Branco",
        year: 2021
      },
      rating: 4.9,
      isOnline: true,
      location: {
        lat: -23.5489,
        lng: -46.6388
      },
      pricePerKm: 2.30,
      acceptsInterior: false
    },
    {
      id: 5,
      name: "Pedro Ferreira",
      email: "pedro@email.com",
      phone: "(11) 99999-5555",
      role: "driver",
      vehicle: {
        model: "Volkswagen Jetta",
        plate: "GHI-9012",
        color: "Preto",
        year: 2019
      },
      rating: 4.7,
      isOnline: false,
      location: {
        lat: -23.5520,
        lng: -46.6300
      },
      pricePerKm: 2.40,
      acceptsInterior: true
    }
  ],
  admins: [
    {
      id: 6,
      name: "Admin Sistema",
      email: "admin@mobiurban.com",
      phone: "(11) 99999-0000",
      role: "admin"
    }
  ]
};

export const mockRides = [
  {
    id: 1,
    passengerId: 1,
    driverId: 3,
    origin: {
      address: "Av. Paulista, 1000 - São Paulo, SP",
      lat: -23.5505,
      lng: -46.6333
    },
    destination: {
      address: "Shopping Ibirapuera - São Paulo, SP",
      lat: -23.5755,
      lng: -46.6520
    },
    status: "completed",
    price: 15.50,
    distance: 6.2,
    duration: 18,
    isInterior: false,
    createdAt: "2025-06-26T10:30:00Z",
    completedAt: "2025-06-26T10:48:00Z"
  },
  {
    id: 2,
    passengerId: 2,
    driverId: 4,
    origin: {
      address: "Estação da Luz - São Paulo, SP",
      lat: -23.5344,
      lng: -46.6358
    },
    destination: {
      address: "Aeroporto de Congonhas - São Paulo, SP",
      lat: -23.6266,
      lng: -46.6556
    },
    status: "in_progress",
    price: 28.75,
    distance: 12.5,
    duration: 35,
    isInterior: false,
    createdAt: "2025-06-26T14:15:00Z"
  },
  {
    id: 3,
    passengerId: 1,
    driverId: null,
    origin: {
      address: "Terminal Rodoviário Tietê - São Paulo, SP",
      lat: -23.5156,
      lng: -46.6219
    },
    destination: {
      address: "Campinas, SP",
      lat: -22.9056,
      lng: -47.0608
    },
    status: "pending",
    price: null,
    distance: 95.0,
    duration: null,
    isInterior: true,
    createdAt: "2025-06-26T16:00:00Z"
  }
];

export const rideStatuses = {
  pending: "Aguardando",
  accepted: "Aceita",
  in_progress: "Em andamento",
  completed: "Concluída",
  cancelled: "Cancelada"
};

export const userRoles = {
  passenger: "Passageiro",
  driver: "Motorista",
  admin: "Administrador"
};

// Função para calcular distância usando fórmula de Haversine
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Função para estimar tempo de viagem (baseado em velocidade média de 30 km/h na cidade)
export function estimateTravelTime(distance) {
  const averageSpeed = 30; // km/h
  return Math.round((distance / averageSpeed) * 60); // retorna em minutos
}

// Função para calcular preço da corrida
export function calculateRidePrice(distance, pricePerKm, isInterior = false) {
  if (isInterior) {
    return null; // Preço negociado para interior
  }
  return distance * pricePerKm;
}

