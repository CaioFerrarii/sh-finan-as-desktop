import { Download, Construction } from 'lucide-react';

export default function Export() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Exportar Dados
        </h1>
        <p className="text-muted-foreground">
          Exporte relatórios em CSV, XLSX e PDF
        </p>
      </div>

      <div className="card-finance text-center py-16">
        <Construction className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-display font-semibold mb-2">Em Desenvolvimento</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          A funcionalidade de exportação está sendo desenvolvida. Em breve você poderá 
          exportar seus dados em diversos formatos!
        </p>
      </div>
    </div>
  );
}
