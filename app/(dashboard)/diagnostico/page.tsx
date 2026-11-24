import DiagnosticWizard from '@/components/diagnostic/DiagnosticWizard';
import { buildDiagnosticCatalog } from '@/lib/diagnostic';
import { getAllFrameworks } from '@/lib/content';

export const metadata = {
  title: 'Diagnóstico de ruta | MEO',
  description: 'Recibe una ruta personalizada de frameworks MEO según tu objetivo, etapa, canal y problema.',
};

export default function DiagnosticoPage() {
  return <DiagnosticWizard frameworks={buildDiagnosticCatalog(getAllFrameworks())} />;
}
