import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Car, Shield } from 'lucide-react';

const LoginScreen = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const roles = [
    {
      id: 'passenger',
      title: 'Passageiro',
      description: 'Solicitar corridas e acompanhar viagens',
      icon: User,
      color: 'bg-blue-500'
    },
    {
      id: 'driver',
      title: 'Motorista',
      description: 'Receber e aceitar solicitações de corrida',
      icon: Car,
      color: 'bg-green-500'
    },
    {
      id: 'admin',
      title: 'Administrador',
      description: 'Gerenciar sistema e usuários',
      icon: Shield,
      color: 'bg-purple-500'
    }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    if (selectedRole && email && password) {
      // Simulação de login - em produção seria validado com backend
      onLogin({
        role: selectedRole,
        email: email,
        name: email.split('@')[0] // Nome simples baseado no email
      });
    }
  };

  const handleQuickLogin = (role) => {
    // Login rápido para demonstração
    const mockUsers = {
      passenger: { email: 'joao@email.com', name: 'João Silva' },
      driver: { email: 'carlos@email.com', name: 'Carlos Oliveira' },
      admin: { email: 'admin@mobiurban.com', name: 'Admin Sistema' }
    };
    
    onLogin({
      role: selectedRole, // Usar selectedRole em vez de role
      email: mockUsers[selectedRole].email,
      name: mockUsers[selectedRole].name
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo e Título */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">MobiUrban</h1>
          <p className="text-gray-600 mt-2">Sistema de Mobilidade Urbana</p>
        </div>

        {/* Seleção de Perfil */}
        {!selectedRole && (
          <Card>
            <CardHeader>
              <CardTitle>Selecione seu perfil</CardTitle>
              <CardDescription>
                Escolha como você deseja acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {roles.map((role) => {
                const IconComponent = role.icon;
                return (
                  <div
                    key={role.id}
                    className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <div className={`w-12 h-12 ${role.color} rounded-full flex items-center justify-center mr-4`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{role.title}</h3>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Formulário de Login */}
        {selectedRole && (
          <Card>
            <CardHeader>
              <CardTitle>
                Login como {roles.find(r => r.id === selectedRole)?.title}
              </CardTitle>
              <CardDescription>
                Entre com suas credenciais para acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Button type="submit" className="w-full">
                    Entrar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleQuickLogin(selectedRole)}
                  >
                    Login Rápido (Demo)
                  </Button>
                </div>
              </form>
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedRole('')}
                  className="text-sm"
                >
                  ← Voltar à seleção de perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;

