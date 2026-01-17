import { useState } from 'react';
import { useCompany } from '@/hooks/useCompany';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Building2, Loader2, Check, Shield, BarChart3, FileSpreadsheet, Users, Wifi } from 'lucide-react';

const benefits = [
  { icon: BarChart3, text: 'Dashboard em tempo real' },
  { icon: FileSpreadsheet, text: 'Importação e exportação CSV/XLSX/PDF' },
  { icon: BarChart3, text: 'Relatórios completos' },
  { icon: Shield, text: 'Integração com Marketplaces' },
  { icon: Check, text: 'Alertas e auditoria' },
  { icon: Users, text: 'Múltiplos usuários' },
  { icon: Wifi, text: 'Modo offline' },
];

export function CompanySetup() {
  const { createCompany, loading: contextLoading } = useCompany();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('');
  const [document, setDocument] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome da empresa é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await createCompany(companyName.trim(), document.trim() || undefined);
    setLoading(false);

    if (error) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar a empresa.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Empresa criada!',
        description: 'Sua empresa foi configurada com sucesso.',
      });
    }
  };

  if (contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left side - Subscription info */}
      <div className="lg:w-1/2 gradient-bg p-8 lg:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-primary-foreground mb-4">
            Plano SH Finanças Completo
          </h1>
          
          <div className="mb-8">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-bold text-primary-foreground">R$ 99,90</span>
              <span className="text-primary-foreground/70">/mês</span>
            </div>
            <p className="text-primary-foreground/80">
              Acesso completo a todas as funcionalidades
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-foreground/10">
                  <benefit.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-primary-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary-foreground" />
              <span className="font-semibold text-primary-foreground">Segurança Total</span>
            </div>
            <p className="text-sm text-primary-foreground/80">
              Apenas a sua empresa acessa seus dados. Isolamento completo garantido.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Company setup form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-display">Configure sua Empresa</CardTitle>
            <CardDescription>
              Crie o espaço da sua empresa para começar a usar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Nome da Empresa *</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Minha Empresa Ltda"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document">CNPJ (opcional)</Label>
                <Input
                  id="document"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Assinar e Começar
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Ao assinar, você concorda com os termos de uso do SH Finanças.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
