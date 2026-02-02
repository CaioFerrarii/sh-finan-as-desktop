import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCompany } from '@/hooks/useCompany';
import { SubscriptionBlocked } from '@/components/company/SubscriptionBlocked';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute() {
  const { user, loading: authLoading } = useAuth();
  const { company, subscription, loading: companyLoading } = useCompany();

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading while company data is being fetched
  if (companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando dados da empresa...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if user doesn't have a company (need to subscribe)
  if (!company) {
    return <Navigate to="/auth" replace />;
  }

  // Block access if subscription is not active
  if (subscription && subscription.status !== 'ativo') {
    return <SubscriptionBlocked />;
  }

  return <Outlet />;
}
