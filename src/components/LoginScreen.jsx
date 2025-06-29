import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Car, Shield, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/supabaseService';
import RegisterForm from './RegisterForm';

const LoginScreen = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

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
      description: 'Receber solicitações e realizar corridas',
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

  const handleQuickLogin = async (role) => {
    setLoading(true);
    try {
      const demoEmail = `demo.${role}@mobiurban.com`;
      const user = await authService.loginDemo(demoEmail, role);
      localStorage.setItem('currentUser', JSON.stringify(user));
      onLogin(user);
    } catch (error) {
      console.error('Erro no login rápido:', error);
      alert('Erro ao fazer login rápido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      // Primeiro, tente obter o email a partir do identificador
      const emailToLogin = await authService.getEmailByIdentifier(identifier);
      if (!emailToLogin) {
        alert('Identificador (email, nome de usuário ou telefone) não encontrado.');
        setLoading(false);
        return;
      }

      const user = await authService.signIn(emailToLogin, password);
      localStorage.setItem('currentUser', JSON.stringify(user));
      onLogin(user);
    } catch (error) {
      console.error('Erro no login:', error);
      alert(`Erro ao fazer login: ${error.message}. Verifique suas credenciais.`);
    } finally {
      setLoading(false);
    }
  };

  // Se estiver mostrando o formulário de registro
  if (showRegister) {
    return (
      <RegisterForm 
        onLogin={onLogin}
        onBackToLogin={() => setShowRegister(false)}
      />
    );
  }

  if (selectedRole) {
    const role = roles.find(r => r.id === selectedRole);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className={`w-16 h-16 ${role.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <role.icon className="h-8 w-8 text-white" />
            </div>
            <CardTitle>
              Login como {role.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="identifier">Email, Nome de Usuário ou Telefone</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="seu@email.com, seu_usuario ou (XX) XXXXX-XXXX"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={handleLogin}
                disabled={loading || !identifier || !password}
                className="w-full"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
              
              <div className="text-center text-sm text-gray-500">ou</div>
              
              <Button
                onClick={() => handleQuickLogin(selectedRole)}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Entrando...' : 'Login Rápido (Demo)'}
              </Button>
            </div>
            
            <Button
              onClick={() => setShowRegister(true)}
              variant="ghost"
              className="w-full"
            >
              Não tem uma conta? Crie uma
            </Button>

            <Button
              onClick={() => setSelectedRole(null)}
              variant="ghost"
              className="w-full"
            >
              Voltar à seleção de perfil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">
            MobiUrban
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Sistema de Mobilidade Urbana
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((role) => (
              <Card
                key={role.id}
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
                onClick={() => setSelectedRole(role.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${role.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <role.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{role.title}</h3>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Selecione seu perfil para continuar
            </p>
            <Button
              onClick={() => setShowRegister(true)}
              variant="outline"
              className="mx-auto"
            >
              Criar Nova Conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;

