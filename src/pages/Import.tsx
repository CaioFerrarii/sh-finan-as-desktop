import { Upload, Construction } from 'lucide-react';

export default function Import() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Importar Dados
        </h1>
        <p className="text-muted-foreground">
          Importe planilhas CSV e XLSX
        </p>
      </div>

      <div className="card-finance text-center py-16">
        <Construction className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-display font-semibold mb-2">Em Desenvolvimento</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          A funcionalidade de importação está sendo desenvolvida. Em breve você poderá 
          importar dados de planilhas CSV e XLSX!
        </p>
      </div>
    </div>
  );
}
