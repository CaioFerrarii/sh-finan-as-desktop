import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Company {
  id: string;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  company_id: string;
  role: 'admin' | 'financeiro' | 'leitura';
  created_at: string;
}

interface Subscription {
  id: string;
  company_id: string;
  plano: string;
  valor: number;
  data_ativacao: string;
  data_renovacao: string;
  status: 'ativo' | 'suspenso' | 'cancelado';
}

interface CompanyContextType {
  company: Company | null;
  userRole: UserRole | null;
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isFinanceiro: boolean;
  canEdit: boolean;
  isSubscriptionActive: boolean;
  createCompany: (data: CreateCompanyData) => Promise<{ error: Error | null; company: Company | null }>;
  refreshCompany: () => Promise<void>;
}

interface CreateCompanyData {
  name: string;
  document: string;
  email?: string;
  phone?: string;
  address?: string;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = userRole?.role === 'admin';
  const isFinanceiro = userRole?.role === 'financeiro';
  const canEdit = isAdmin || isFinanceiro;
  const isSubscriptionActive = subscription?.status === 'ativo';

  useEffect(() => {
    if (user) {
      fetchCompanyData();
    } else {
      setCompany(null);
      setUserRole(null);
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchCompanyData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      // Fetch user's role and company
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleError) throw roleError;

      if (!roleData) {
        // User doesn't have a company yet
        setCompany(null);
        setUserRole(null);
        setSubscription(null);
        setLoading(false);
        return;
      }

      setUserRole(roleData as UserRole);

      // Fetch company details
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', roleData.company_id)
        .single();

      if (companyError) throw companyError;
      setCompany(companyData as Company);

      // Fetch subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('company_id', roleData.company_id)
        .maybeSingle();

      if (subError) throw subError;
      setSubscription(subData as Subscription | null);

    } catch (err: any) {
      console.error('Error fetching company data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (data: CreateCompanyData): Promise<{ error: Error | null; company: Company | null }> => {
    if (!user) {
      return { error: new Error('Usuário não autenticado'), company: null };
    }

    try {
      // Create company with all data
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: data.name,
          document: data.document || null,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Create user role as admin
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          company_id: companyData.id,
          role: 'admin',
        });

      if (roleError) throw roleError;

      // Create subscription with free plan (valor = 0)
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          company_id: companyData.id,
          plano: 'Plano SH Completo',
          valor: 0,
          status: 'ativo',
        });

      if (subError) throw subError;

      // Update profile with company_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ company_id: companyData.id })
        .eq('user_id', user.id);

      if (profileError) console.error('Error updating profile:', profileError);

      // Refresh data
      await fetchCompanyData();

      return { error: null, company: companyData as Company };
    } catch (err: any) {
      console.error('Error creating company:', err);
      return { error: err, company: null };
    }
  };

  const refreshCompany = async () => {
    await fetchCompanyData();
  };

  return (
    <CompanyContext.Provider value={{
      company,
      userRole,
      subscription,
      loading,
      error,
      isAdmin,
      isFinanceiro,
      canEdit,
      isSubscriptionActive,
      createCompany,
      refreshCompany,
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
