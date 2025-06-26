# MobiUrban - Sistema de Mobilidade Urbana

Sistema completo de mobilidade urbana desenvolvido com React + Vite e backend Supabase.

## 🚀 Funcionalidades

### 👥 Perfis de Usuário

- **Passageiro**: Solicita corridas, visualiza motoristas online, escolhe tipo de corrida
- **Motorista**: Recebe solicitações, edita perfil, configura valores, aceita/rejeita corridas
- **Administrador**: Gerencia cadastros, ativa/desativa contas, painel de controle

### 📱 Funcionalidades do Frontend

- ✅ Tela de login com seleção de perfil
- ✅ Localização automática do passageiro (Geolocation API)
- ✅ Campo de destino com busca inteligente (Nominatim/OpenStreetMap)
- ✅ Opção "Destino no interior" com valor negociado
- ✅ Estimativa de corrida (valor, tempo, distância)
- ✅ Lista de motoristas online com cálculo de distância (Haversine)
- ✅ Atualização manual da lista de motoristas
- ✅ Painel do motorista com edição de perfil e configurações
- ✅ Painel do administrador com gerenciamento completo
- ✅ Design responsivo e moderno

## 🛠 Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **React + Vite** | Frontend moderno e rápido |
| **Tailwind CSS + shadcn/ui** | Estilização e componentes |
| **Geolocation API** | Localização do usuário |
| **Nominatim (OSM)** | Geocodificação gratuita |
| **Fórmula de Haversine** | Cálculo de distância |
| **LocalStorage** | Dados offline/local |
| **Supabase** | Backend completo (Auth, PostgreSQL, API REST, Realtime) |
| **Vercel** | Deploy do frontend |

## 🏗 Arquitetura

```
Frontend (React + Vite)
├── Tela de Login
├── Dashboard do Passageiro
├── Dashboard do Motorista
├── Dashboard do Administrador
└── Serviços de Geolocalização

Backend (Supabase)
├── Autenticação
├── PostgreSQL Database
├── API REST
├── Realtime WebSockets
└── Row Level Security (RLS)
```

## 📦 Instalação e Execução

### Pré-requisitos

- Node.js 18+
- pnpm (recomendado) ou npm
- Conta no Supabase

### 1. Clone o repositório

```bash
git clone [URL_DO_REPOSITORIO]
cd mobilidade-urbana
```

### 2. Instale as dependências

```bash
pnpm install
# ou
npm install
```

### 3. Configure o Supabase

Siga as instruções detalhadas no arquivo `supabase-setup.md` para:
- Criar organização e projeto no Supabase
- Configurar banco de dados e tabelas
- Obter credenciais de API

### 4. Configure variáveis de ambiente

Crie um arquivo `.env.local`:

```env
VITE_SUPABASE_URL=https://[seu-projeto].supabase.co
VITE_SUPABASE_ANON_KEY=[sua-chave-publica]
```

### 5. Execute o projeto

```bash
pnpm run dev
# ou
npm run dev
```

Acesse: http://localhost:5173

## 🚀 Deploy na Vercel

### Via GitHub (Recomendado)

1. Faça push do código para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Conecte sua conta GitHub
4. Importe o repositório
5. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy automático!

### Via CLI

```bash
npm i -g vercel
vercel --prod
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- **users**: Usuários do sistema (passageiros, motoristas, admins)
- **driver_profiles**: Perfis específicos dos motoristas
- **rides**: Informações das corridas
- **ratings**: Avaliações das corridas

### Segurança

- Row Level Security (RLS) habilitado
- Políticas de acesso por tipo de usuário
- Autenticação via Supabase Auth

## 🧪 Dados de Teste

O sistema inclui dados simulados (mock) para demonstração:

### Usuários de Teste

- **Passageiro**: joao@email.com
- **Motorista**: carlos@email.com
- **Admin**: admin@mobiurban.com

Use o botão "Login Rápido (Demo)" para acesso direto.

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm run dev

# Build de produção
pnpm run build

# Preview do build
pnpm run preview

# Lint
pnpm run lint
```

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- 📱 Dispositivos móveis
- 📱 Tablets
- 💻 Desktops

## 🌟 Próximas Funcionalidades

- [ ] Integração completa com Supabase
- [ ] Notificações em tempo real
- [ ] Histórico de corridas
- [ ] Sistema de avaliações
- [ ] Chat entre passageiro e motorista
- [ ] Pagamento integrado
- [ ] Aplicativo móvel nativo

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- 📧 Email: dev@mobiurban.com
- 📱 WhatsApp: (11) 99999-0000

---

Desenvolvido com ❤️ para revolucionar a mobilidade urbana no Brasil.

