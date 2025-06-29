import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Car, Shield, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/supabaseService';

const RegisterForm = ({ onLogin, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const { name, email, phone, password, confirmPassword, role } = formData;
    
    if (!name.trim()) {
      alert('Por favor, preencha seu nome completo.');
      return false;
    }
    
    if (!email.trim() || !email.includes('@')) {
      alert('Por favor, preencha um email válido.');
      return false;
    }
    
    if (!phone.trim()) {
      alert('Por favor, preencha seu telefone.');
      return false;
    }
    
    if (!password || password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    
    if (password !== confirmPassword) {
      alert('As senhas não coincidem.');
      return false;
    }
    
    if (!role) {
      alert('Por favor, selecione um tipo de perfil.');
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { name, email, phone, password, role } = formData;
      
      const user = await authService.signUp(email, password, name, role, phone);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      alert('Conta criada com sucesso! Bem-vindo ao MobiUrban!');
      onLogin(user);
    } catch (error) {
      console.error('Erro no registro:', error);
      alert(`Erro ao criar conta: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find(r => r.id === formData.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {selectedRole && (
            <div className={`w-16 h-16 ${selectedRole.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <selectedRole.icon className="h-8 w-8 text-white" />
            </div>
          )}
          <CardTitle className="text-2xl">
            Criar Nova Conta
          </CardTitle>
          <p className="text-gray-600">
            Preencha os dados para se cadastrar no MobiUrban
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="role">Tipo de Perfil *</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu perfil" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <role.icon className="h-4 w-4" />
                      {role.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="password">Senha *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
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

          <div>
            <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Digite a senha novamente"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button
            onClick={handleRegister}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </Button>

          <Button
            onClick={onBackToLogin}
            variant="ghost"
            className="w-full"
          >
            Já tem uma conta? Faça login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;

