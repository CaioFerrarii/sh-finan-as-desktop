import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  TrendingUp, 
  Shield, 
  BarChart3, 
  CheckCircle2, 
  Crown,
  FileSpreadsheet,
  Bell,
  Users,
  Wifi,
  Store
} from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const planFeatures = [
  { icon: BarChart3, text: 'Dashboard em tempo real' },
  { icon: FileSpreadsheet, text: 'Importação e exportação CSV/XLSX/PDF' },
  { icon: TrendingUp, text: 'Relatórios completos (DRE, Fluxo de Caixa, Curva ABC)' },
  { icon: Store, text: 'Integração com Marketplaces' },
  { icon: Bell, text: 'Alertas e auditoria' },
  { icon: Users, text: 'Múltiplos usuários por empresa' },
  { icon: Wifi, text: 'Modo offline' },
  { icon: Shield, text: 'Segurança total - seus dados isolados' },
];

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validation = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
      if (!validation.success) {
        toast({
          title: 'Erro de validação',
          description: validation.error.errors[0].message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const { error } = await signIn(loginEmail, loginPassword);
      
      if (error) {
        toast({
          title: 'Erro ao entrar',
          description: error.message === 'Invalid login credentials' 
            ? 'Email ou senha incorretos' 
            : error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Bem-vindo!',
          description: 'Login realizado com sucesso.',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validation = signupSchema.safeParse({ 
        fullName: signupName,
        email: signupEmail, 
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
      });
      
      if (!validation.success) {
        toast({
          title: 'Erro de validação',
          description: validation.error.errors[0].message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const { error } = await signUp(signupEmail, signupPassword, signupName);
      
      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('already registered')) {
          errorMessage = 'Este email já está cadastrado.';
        }
        toast({
          title: 'Erro ao cadastrar',
          description: errorMessage,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Conta criada!',
          description: 'Sua conta foi criada com sucesso.',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-primary-foreground">
            SH Finanças
          </h1>
          <p className="mt-2 text-primary-foreground/80">
            Gestão financeira inteligente
          </p>
        </div>
        
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary-foreground/10">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-foreground">Controle Total</h3>
              <p className="text-sm text-primary-foreground/70">
                Acompanhe receitas e despesas em tempo real
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary-foreground/10">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-foreground">Relatórios Inteligentes</h3>
              <p className="text-sm text-primary-foreground/70">
                Visualize seus dados com gráficos interativos
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary-foreground/10">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-foreground">Segurança</h3>
              <p className="text-sm text-primary-foreground/70">
                Seus dados protegidos com criptografia
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-primary-foreground/60">
          © 2024 SH Finanças. Todos os direitos reservados.
        </p>
      </div>
      
      {/* Right side - Auth form + Plan */}
      <div className="flex-1 flex flex-col items-center justify-start p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-3xl font-display font-bold text-primary">
              SH Finanças
            </h1>
            <p className="text-muted-foreground">
              Gestão financeira inteligente
            </p>
          </div>
          
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-display">
                {activeTab === 'login' ? 'Entrar' : 'Criar conta'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'login' 
                  ? 'Entre com seu email e senha' 
                  : 'Preencha os dados para criar sua conta'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="signup">Cadastrar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Senha</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        'Entrar'
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nome completo</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="João Silva"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirmar senha</Label>
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        'Criar conta'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Apenas emails autorizados podem acessar o sistema.
              </p>
            </CardContent>
          </Card>

          {/* Subscription Plan Section */}
          <Card className="mt-8 border-2 border-primary/20 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-display font-bold">Plano SH Finanças Completo</h2>
                  <p className="text-primary-foreground/80">Tudo que você precisa para sua gestão financeira</p>
                </div>
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-foreground">R$ 99,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>

              <div className="space-y-3 mb-6">
                {planFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-muted rounded-lg mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-medium">Apenas a sua empresa acessa seus dados.</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Segurança total com isolamento de dados por empresa.
                </p>
              </div>

              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={() => setActiveTab('signup')}
              >
                <Crown className="h-5 w-5" />
                Assinar agora
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Cancele a qualquer momento. Sem taxas escondidas.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
