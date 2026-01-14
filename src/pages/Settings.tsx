import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Settings as SettingsIcon,
  Users,
  Target,
  Clock,
  Link2,
  Database,
  Plus,
  Trash2,
  Save,
  Download,
  Upload,
  Eye,
  EyeOff,
  Store,
} from 'lucide-react';

interface AuthorizedEmail {
  id: string;
  email: string;
  created_at: string;
}

interface UserSettings {
  id?: string;
  monthly_revenue_goal: number;
  max_expense_goal: number;
  sync_frequency: string;
}

interface ApiConnection {
  id: string;
  platform: string;
  api_key: string;
  api_secret: string;
  access_token: string;
  is_active: boolean;
  last_sync_at: string | null;
}

const platforms = [
  { name: 'Mercado Livre', value: 'mercado_livre', icon: Store },
  { name: 'Shopee', value: 'shopee', icon: Store },
  { name: 'Magalu', value: 'magalu', icon: Store },
  { name: 'Loja Integrada', value: 'loja_integrada', icon: Store },
];

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // States
  const [authorizedEmails, setAuthorizedEmails] = useState<AuthorizedEmail[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  
  const [settings, setSettings] = useState<UserSettings>({
    monthly_revenue_goal: 0,
    max_expense_goal: 0,
    sync_frequency: 'manual',
  });
  
  const [apiConnections, setApiConnections] = useState<ApiConnection[]>([]);
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<ApiConnection | null>(null);
  const [formPlatform, setFormPlatform] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [formApiSecret, setFormApiSecret] = useState('');
  const [formAccessToken, setFormAccessToken] = useState('');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch authorized emails
      const { data: emailsData, error: emailsError } = await supabase
        .from('authorized_emails')
        .select('*')
        .order('created_at', { ascending: false });

      if (emailsError) throw emailsError;
      setAuthorizedEmails(emailsData || []);

      // Fetch user settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (settingsError) throw settingsError;
      if (settingsData) {
        setSettings(settingsData);
      }

      // Fetch API connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('api_connections')
        .select('*')
        .eq('user_id', user?.id)
        .order('platform');

      if (connectionsError) throw connectionsError;
      setApiConnections(connectionsData || []);
    } catch (error) {
      console.error('Error fetching settings data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Email management
  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      const { error } = await supabase
        .from('authorized_emails')
        .insert({ email: newEmail.toLowerCase().trim() });

      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Email autorizado adicionado.',
      });
      setNewEmail('');
      setEmailDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível adicionar o email.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEmail = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este email autorizado?')) return;

    try {
      const { error } = await supabase
        .from('authorized_emails')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Email removido.',
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível remover o email.',
        variant: 'destructive',
      });
    }
  };

  // Settings management
  const handleSaveSettings = async () => {
    try {
      const settingsData = {
        user_id: user?.id,
        monthly_revenue_goal: settings.monthly_revenue_goal,
        max_expense_goal: settings.max_expense_goal,
        sync_frequency: settings.sync_frequency,
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert(settingsData, { onConflict: 'user_id' });

      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Configurações salvas.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    }
  };

  // API connections management
  const resetApiForm = () => {
    setFormPlatform('');
    setFormApiKey('');
    setFormApiSecret('');
    setFormAccessToken('');
    setEditingConnection(null);
  };

  const openEditApiDialog = (connection: ApiConnection) => {
    setEditingConnection(connection);
    setFormPlatform(connection.platform);
    setFormApiKey(connection.api_key || '');
    setFormApiSecret(connection.api_secret || '');
    setFormAccessToken(connection.access_token || '');
    setApiDialogOpen(true);
  };

  const handleSaveApiConnection = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const connectionData = {
        user_id: user?.id,
        platform: formPlatform,
        api_key: formApiKey,
        api_secret: formApiSecret,
        access_token: formAccessToken,
        is_active: true,
      };

      if (editingConnection) {
        const { error } = await supabase
          .from('api_connections')
          .update(connectionData)
          .eq('id', editingConnection.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('api_connections')
          .insert([connectionData]);

        if (error) throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Conexão de API salva.',
      });
      setApiDialogOpen(false);
      resetApiForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar a conexão.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteApiConnection = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta conexão?')) return;

    try {
      const { error } = await supabase
        .from('api_connections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Conexão removida.',
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível remover a conexão.',
        variant: 'destructive',
      });
    }
  };

  const toggleConnectionStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('api_connections')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error toggling connection status:', error);
    }
  };

  // Backup functions
  const handleExportBackup = async () => {
    try {
      const [transactionsRes, categoriesRes, settingsRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user?.id),
        supabase.from('categories').select('*').eq('user_id', user?.id),
        supabase.from('user_settings').select('*').eq('user_id', user?.id),
      ]);

      const backupData = {
        exportedAt: new Date().toISOString(),
        transactions: transactionsRes.data || [],
        categories: categoriesRes.data || [],
        settings: settingsRes.data || [],
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sh-financas-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Sucesso',
        description: 'Backup exportado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível exportar o backup.',
        variant: 'destructive',
      });
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      // This is a simplified restore - in production you'd want more validation
      toast({
        title: 'Atenção',
        description: 'Funcionalidade de restauração em desenvolvimento.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Arquivo de backup inválido.',
        variant: 'destructive',
      });
    }
    e.target.value = '';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const toggleSecretVisibility = (id: string) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const maskSecret = (value: string | null) => {
    if (!value) return '-';
    return value.substring(0, 4) + '****' + value.substring(value.length - 4);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Configurações
        </h1>
        <p className="text-muted-foreground">
          Configure o sistema e preferências
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Usuários</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Metas</span>
          </TabsTrigger>
          <TabsTrigger value="sync" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Sincronização</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">APIs</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Backup</span>
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Usuários Autorizados</CardTitle>
                <CardDescription>
                  Gerencie os emails que podem acessar o sistema
                </CardDescription>
              </div>
              <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Email Autorizado</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddEmail} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="usuario@email.com"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setEmailDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Adicionar</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authorizedEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">{email.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(email.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEmail(email.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {authorizedEmails.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        Nenhum email autorizado cadastrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Metas Financeiras</CardTitle>
              <CardDescription>
                Defina suas metas mensais de faturamento e gastos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="revenue_goal">Meta de Faturamento Mensal</Label>
                  <Input
                    id="revenue_goal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.monthly_revenue_goal}
                    onChange={(e) => setSettings({ ...settings, monthly_revenue_goal: parseFloat(e.target.value) || 0 })}
                    placeholder="0,00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Meta atual: {formatCurrency(settings.monthly_revenue_goal)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense_goal">Meta de Gastos Máxima</Label>
                  <Input
                    id="expense_goal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.max_expense_goal}
                    onChange={(e) => setSettings({ ...settings, max_expense_goal: parseFloat(e.target.value) || 0 })}
                    placeholder="0,00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Limite atual: {formatCurrency(settings.max_expense_goal)}
                  </p>
                </div>
              </div>
              <Button onClick={handleSaveSettings} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Metas
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Tab */}
        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle>Frequência de Sincronização</CardTitle>
              <CardDescription>
                Configure a periodicidade de sincronização automática com as APIs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 max-w-xs">
                <Label htmlFor="sync_frequency">Frequência</Label>
                <Select
                  value={settings.sync_frequency}
                  onValueChange={(value) => setSettings({ ...settings, sync_frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">A cada 1 hora</SelectItem>
                    <SelectItem value="6h">A cada 6 horas</SelectItem>
                    <SelectItem value="24h">A cada 24 horas</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveSettings} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Configuração
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Conexões de API</CardTitle>
                <CardDescription>
                  Configure as credenciais para integração com marketplaces
                </CardDescription>
              </div>
              <Dialog open={apiDialogOpen} onOpenChange={(open) => {
                setApiDialogOpen(open);
                if (!open) resetApiForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Conexão
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingConnection ? 'Editar Conexão' : 'Nova Conexão de API'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveApiConnection} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Plataforma</Label>
                      <Select value={formPlatform} onValueChange={setFormPlatform} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {platforms.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="api_key">API Key</Label>
                      <Input
                        id="api_key"
                        type="password"
                        value={formApiKey}
                        onChange={(e) => setFormApiKey(e.target.value)}
                        placeholder="Sua API Key"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="api_secret">API Secret</Label>
                      <Input
                        id="api_secret"
                        type="password"
                        value={formApiSecret}
                        onChange={(e) => setFormApiSecret(e.target.value)}
                        placeholder="Seu API Secret"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="access_token">Access Token</Label>
                      <Input
                        id="access_token"
                        type="password"
                        value={formAccessToken}
                        onChange={(e) => setFormAccessToken(e.target.value)}
                        placeholder="Seu Access Token"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setApiDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Salvar</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plataforma</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Sincronização</TableHead>
                    <TableHead className="w-[120px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiConnections.map((conn) => (
                    <TableRow key={conn.id}>
                      <TableCell className="font-medium capitalize">
                        {platforms.find(p => p.value === conn.platform)?.name || conn.platform}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {showSecrets[conn.id] ? conn.api_key : maskSecret(conn.api_key)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleSecretVisibility(conn.id)}
                          >
                            {showSecrets[conn.id] ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={conn.is_active}
                            onCheckedChange={() => toggleConnectionStatus(conn.id, conn.is_active)}
                          />
                          <Badge variant={conn.is_active ? 'default' : 'secondary'}>
                            {conn.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {conn.last_sync_at
                          ? new Date(conn.last_sync_at).toLocaleString('pt-BR')
                          : 'Nunca'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditApiDialog(conn)}
                          >
                            <SettingsIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteApiConnection(conn.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {apiConnections.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Nenhuma conexão de API configurada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup e Restauração</CardTitle>
              <CardDescription>
                Exporte ou restaure seus dados do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Exportar Backup</h3>
                  <p className="text-sm text-muted-foreground">
                    Baixe uma cópia completa dos seus dados em formato JSON.
                  </p>
                  <Button onClick={handleExportBackup} className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Dados
                  </Button>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Restaurar Backup</h3>
                  <p className="text-sm text-muted-foreground">
                    Restaure seus dados a partir de um arquivo de backup.
                  </p>
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                      id="backup-file"
                    />
                    <Button variant="outline" asChild className="gap-2">
                      <label htmlFor="backup-file" className="cursor-pointer">
                        <Upload className="h-4 w-4" />
                        Restaurar Dados
                      </label>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
