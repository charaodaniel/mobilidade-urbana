# Configuração do Backend Supabase

## Visão Geral

Este documento descreve como configurar o backend Supabase para o sistema MobiUrban de mobilidade urbana.

## Pré-requisitos

- Conta no GitHub (para login no Supabase)
- Acesso ao [Supabase Dashboard](https://supabase.com/dashboard)

## Passo 1: Criar Organização e Projeto

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login com sua conta GitHub
3. Clique em "New organization"
4. Configure a organização:
   - **Nome:** MobiUrban
   - **Tipo:** Personal (ou conforme sua necessidade)
   - **Plano:** Free - $0/month
5. Clique em "Create organization"
6. Crie um novo projeto:
   - **Nome do Projeto:** MobiUrban Backend
   - **Senha do Banco:** Use uma senha forte (ex: MobiUrban2025!)
   - **Região:** South America (São Paulo) - para melhor performance no Brasil

## Passo 2: Configurar o Banco de Dados

### Tabelas Necessárias

Execute os seguintes comandos SQL no SQL Editor do Supabase:

#### 1. Tabela de Usuários (users)

```sql
-- Criar tabela de usuários
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL CHECK (role IN ('passenger', 'driver', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios dados
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Política para usuários atualizarem apenas seus próprios dados
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

#### 2. Tabela de Perfis de Motoristas (driver_profiles)

```sql
-- Criar tabela de perfis de motoristas
CREATE TABLE driver_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vehicle_model VARCHAR(100) NOT NULL,
  vehicle_plate VARCHAR(20) NOT NULL,
  vehicle_color VARCHAR(50) NOT NULL,
  vehicle_year INTEGER NOT NULL,
  price_per_km DECIMAL(5,2) NOT NULL DEFAULT 2.50,
  accepts_interior BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 5.0,
  is_online BOOLEAN DEFAULT false,
  current_lat DECIMAL(10,8),
  current_lng DECIMAL(11,8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;

-- Política para motoristas verem apenas seu próprio perfil
CREATE POLICY "Drivers can view own profile" ON driver_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Política para motoristas atualizarem apenas seu próprio perfil
CREATE POLICY "Drivers can update own profile" ON driver_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para passageiros verem perfis de motoristas online
CREATE POLICY "Passengers can view online drivers" ON driver_profiles
  FOR SELECT USING (is_online = true);
```

#### 3. Tabela de Corridas (rides)

```sql
-- Criar tabela de corridas
CREATE TABLE rides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  passenger_id UUID REFERENCES users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  origin_address TEXT NOT NULL,
  origin_lat DECIMAL(10,8) NOT NULL,
  origin_lng DECIMAL(11,8) NOT NULL,
  destination_address TEXT NOT NULL,
  destination_lat DECIMAL(10,8) NOT NULL,
  destination_lng DECIMAL(11,8) NOT NULL,
  distance_km DECIMAL(8,2),
  estimated_duration_minutes INTEGER,
  price DECIMAL(8,2),
  is_interior BOOLEAN DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;

-- Política para passageiros verem suas próprias corridas
CREATE POLICY "Passengers can view own rides" ON rides
  FOR SELECT USING (auth.uid() = passenger_id);

-- Política para motoristas verem corridas atribuídas a eles
CREATE POLICY "Drivers can view assigned rides" ON rides
  FOR SELECT USING (auth.uid() = driver_id);

-- Política para motoristas verem corridas pendentes
CREATE POLICY "Drivers can view pending rides" ON rides
  FOR SELECT USING (status = 'pending');

-- Política para passageiros criarem corridas
CREATE POLICY "Passengers can create rides" ON rides
  FOR INSERT WITH CHECK (auth.uid() = passenger_id);

-- Política para motoristas atualizarem corridas
CREATE POLICY "Drivers can update rides" ON rides
  FOR UPDATE USING (auth.uid() = driver_id);
```

#### 4. Tabela de Avaliações (ratings)

```sql
-- Criar tabela de avaliações
CREATE TABLE ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  passenger_id UUID REFERENCES users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem avaliações relacionadas a eles
CREATE POLICY "Users can view related ratings" ON ratings
  FOR SELECT USING (auth.uid() = passenger_id OR auth.uid() = driver_id);

-- Política para passageiros criarem avaliações
CREATE POLICY "Passengers can create ratings" ON ratings
  FOR INSERT WITH CHECK (auth.uid() = passenger_id);
```

## Passo 3: Configurar Autenticação

1. No Supabase Dashboard, vá para "Authentication" > "Settings"
2. Configure os provedores de autenticação:
   - **Email:** Habilitado
   - **GitHub:** Opcional (para login social)
3. Configure as URLs:
   - **Site URL:** http://localhost:5173 (desenvolvimento)
   - **Redirect URLs:** http://localhost:5173/auth/callback

## Passo 4: Obter Credenciais

1. Vá para "Settings" > "API"
2. Anote as seguintes informações:
   - **Project URL:** `https://[seu-projeto].supabase.co`
   - **API Key (anon public):** Para uso no frontend
   - **API Key (service_role):** Para operações administrativas (manter segura)

## Passo 5: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto React:

```env
VITE_SUPABASE_URL=https://[seu-projeto].supabase.co
VITE_SUPABASE_ANON_KEY=[sua-chave-publica]
```

## Passo 6: Instalar Cliente Supabase

No projeto React, instale o cliente Supabase:

```bash
npm install @supabase/supabase-js
```

## Passo 7: Configurar Cliente no Frontend

Crie o arquivo `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Passo 8: Implementar Autenticação

Exemplo de hook para autenticação:

```javascript
// src/hooks/useAuth.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signUp = async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }
}
```

## Passo 9: Configurar Realtime (Opcional)

Para atualizações em tempo real:

```javascript
// Escutar mudanças em corridas
const subscription = supabase
  .channel('rides')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'rides' },
    (payload) => {
      console.log('Mudança detectada:', payload)
      // Atualizar estado da aplicação
    }
  )
  .subscribe()

// Limpar subscription
return () => subscription.unsubscribe()
```

## Passo 10: Dados de Teste

Para popular o banco com dados de teste, execute:

```sql
-- Inserir usuários de teste
INSERT INTO users (email, name, phone, role) VALUES
('joao@email.com', 'João Silva', '(11) 99999-1111', 'passenger'),
('maria@email.com', 'Maria Santos', '(11) 99999-2222', 'passenger'),
('carlos@email.com', 'Carlos Oliveira', '(11) 99999-3333', 'driver'),
('ana@email.com', 'Ana Costa', '(11) 99999-4444', 'driver'),
('admin@mobiurban.com', 'Admin Sistema', '(11) 99999-0000', 'admin');

-- Inserir perfis de motoristas
INSERT INTO driver_profiles (user_id, vehicle_model, vehicle_plate, vehicle_color, vehicle_year, price_per_km, accepts_interior, is_online, current_lat, current_lng)
SELECT 
  id,
  CASE 
    WHEN email = 'carlos@email.com' THEN 'Honda Civic'
    WHEN email = 'ana@email.com' THEN 'Toyota Corolla'
  END,
  CASE 
    WHEN email = 'carlos@email.com' THEN 'ABC-1234'
    WHEN email = 'ana@email.com' THEN 'DEF-5678'
  END,
  CASE 
    WHEN email = 'carlos@email.com' THEN 'Prata'
    WHEN email = 'ana@email.com' THEN 'Branco'
  END,
  CASE 
    WHEN email = 'carlos@email.com' THEN 2020
    WHEN email = 'ana@email.com' THEN 2021
  END,
  CASE 
    WHEN email = 'carlos@email.com' THEN 2.50
    WHEN email = 'ana@email.com' THEN 2.30
  END,
  CASE 
    WHEN email = 'carlos@email.com' THEN true
    WHEN email = 'ana@email.com' THEN false
  END,
  true,
  -23.5505,
  -46.6333
FROM users 
WHERE role = 'driver';
```

## Segurança

- **Row Level Security (RLS):** Habilitado em todas as tabelas
- **Políticas de Acesso:** Configuradas para cada tipo de usuário
- **Chaves de API:** Mantenha a service_role key segura
- **HTTPS:** Sempre use HTTPS em produção

## Monitoramento

- Use o Dashboard do Supabase para monitorar:
  - Uso da API
  - Performance do banco
  - Logs de erro
  - Métricas de autenticação

## Backup

- O Supabase faz backup automático no plano gratuito
- Para backups customizados, use o pg_dump via SQL Editor

## Próximos Passos

1. Integrar o cliente Supabase no frontend React
2. Substituir dados mock pelas chamadas reais da API
3. Implementar autenticação completa
4. Configurar Realtime para atualizações em tempo real
5. Testar todas as funcionalidades
6. Deploy na Vercel com variáveis de ambiente configuradas

