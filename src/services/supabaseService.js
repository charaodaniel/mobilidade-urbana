import { supabase } from '../lib/supabase.js'

// Serviços de Usuário
export const userService = {
  // Criar usuário
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Buscar usuário por ID
  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Atualizar usuário
  async updateUser(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Listar todos os usuários (admin)
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// Serviços de Motorista
export const driverService = {
  // Criar perfil de motorista
  async createDriverProfile(driverData) {
    const { data, error } = await supabase
      .from('driver_profiles')
      .insert([driverData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Buscar perfil de motorista
  async getDriverProfile(userId) {
    const { data, error } = await supabase
      .from('driver_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  // Atualizar perfil de motorista
  async updateDriverProfile(userId, updates) {
    const { data, error } = await supabase
      .from('driver_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Listar motoristas online
  async getOnlineDrivers() {
    const { data, error } = await supabase
      .from('driver_profiles')
      .select(`
        *,
        users (
          id,
          name,
          email,
          phone
        )
      `)
      .eq('is_online', true)
      .eq('is_active', true)
    
    if (error) throw error
    return data
  },

  // Atualizar status online do motorista
  async updateDriverStatus(userId, isOnline) {
    const { data, error } = await supabase
      .from('driver_profiles')
      .update({ 
        is_online: isOnline,
        last_location_update: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Atualizar localização do motorista
  async updateDriverLocation(userId, latitude, longitude) {
    const { data, error } = await supabase
      .from('driver_profiles')
      .update({ 
        current_latitude: latitude,
        current_longitude: longitude,
        last_location_update: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
    
    if (error) throw error
    return data[0]
  }
}

// Serviços de Corrida
export const rideService = {
  // Criar nova corrida
  async createRide(rideData) {
    const { data, error } = await supabase
      .from('rides')
      .insert([{
        ...rideData,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Solicitar corrida (alias para createRide para compatibilidade)
  async requestRide(rideData) {
    return this.createRide(rideData);
  },

  // Buscar corrida por ID
  async getRideById(id) {
    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        passenger:users!rides_passenger_id_fkey (
          id,
          name,
          email,
          phone
        ),
        driver:users!rides_driver_id_fkey (
          id,
          name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Listar corridas do passageiro
  async getPassengerRides(passengerId) {
    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        driver:users!rides_driver_id_fkey (
          id,
          name,
          email,
          phone
        )
      `)
      .eq('passenger_id', passengerId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Listar corridas do motorista
  async getDriverRides(driverId) {
    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        passenger:users!rides_passenger_id_fkey (
          id,
          name,
          email,
          phone
        )
      `)
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Atualizar status da corrida
  async updateRideStatus(id, status, updates = {}) {
    const { data, error } = await supabase
      .from('rides')
      .update({ 
        status,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Aceitar corrida (motorista)
  async acceptRide(rideId, driverId) {
    const { data, error } = await supabase
      .from('rides')
      .update({ 
        driver_id: driverId,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', rideId)
      .eq('status', 'pending')
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Listar corridas pendentes para motoristas
  async getPendingRides() {
    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        passenger:users!rides_passenger_id_fkey (
          id,
          name,
          email,
          phone
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  }
}

// Serviços de Avaliação
export const reviewService = {
  // Criar avaliação
  async createReview(reviewData) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        ...reviewData,
        created_at: new Date().toISOString()
      }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Buscar avaliações de um motorista
  async getDriverReviews(driverId) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        passenger:users!reviews_passenger_id_fkey (
          id,
          name
        ),
        ride:rides (
          id,
          pickup_address,
          destination_address
        )
      `)
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Calcular média de avaliações do motorista
  async getDriverRating(driverId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('driver_id', driverId)
    
    if (error) throw error
    
    if (data.length === 0) return { average: 0, count: 0 }
    
    const average = data.reduce((sum, review) => sum + review.rating, 0) / data.length
    return { average: Math.round(average * 10) / 10, count: data.length }
  }
}

// Serviços de Autenticação
export const authService = {
  // Registro de novo usuário
  async signUp(email, password, name, role, phone = null) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: role }
      }
    });

    if (authError) throw authError;

    if (authData.user) {
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            name: name,
            email: email,
            role: role,
            phone: phone
          }
        ])
        .select()
        .single();

      if (profileError) throw profileError;

      return userProfile;
    } else {
      throw new Error('Erro ao criar usuário: dados de autenticação incompletos.');
    }
  },

  // Login de usuário existente
  async signIn(email, password) {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) throw profileError;

    return userProfile;
  },

  // Nova função para obter email por identificador (nome de usuário ou telefone)
  async getEmailByIdentifier(identifier) {
    try {
      const { data, error } = await supabase.rpc('get_email_by_identifier', { identifier });
      if (error) {
        console.error('Erro ao buscar email por identificador:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Erro na função getEmailByIdentifier:', error);
      // Fallback: tentar buscar diretamente na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .or(`email.eq.${identifier},phone.eq.${identifier},name.eq.${identifier}`)
        .single();
      
      if (userError || !userData) {
        return null;
      }
      return userData.email;
    }
  },

  // Login simples (demo)
  async loginDemo(email, role) {
    // Buscar ou criar usuário demo
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error && error.code === 'PGRST116') {
      // Usuário não existe, criar um novo
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          email,
          name: `Demo ${role}`,
          role,
          phone: '(11) 99999-9999',
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (createError) throw createError
      user = newUser
    } else if (error) {
      throw error
    }
    
    return user
  },

  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem('currentUser');
    return true;
  },

  // Obter sessão atual
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Obter usuário logado
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    if (user) {
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      return userProfile;
    }
    return null;
  }
}

// Serviços de Realtime
export const realtimeService = {
  // Subscrever a atualizações de corridas
  subscribeToRides(callback) {
    return supabase
      .channel('rides')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rides' }, 
        callback
      )
      .subscribe()
  },

  // Subscrever a atualizações de motoristas online
  subscribeToDrivers(callback) {
    return supabase
      .channel('drivers')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'driver_profiles' }, 
        callback
      )
      .subscribe()
  },

  // Remover subscrição
  unsubscribe(subscription) {
    return supabase.removeChannel(subscription)
  }
}

