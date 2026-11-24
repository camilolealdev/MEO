import DiagnosticWizard from '@/components/diagnostic/DiagnosticWizard';

export const metadata = {
  title: 'Diagnóstico de ruta | MEO',
  description: 'Recibe una ruta personalizada de frameworks MEO según tu objetivo, etapa, canal y problema.',
};

export default function DiagnosticoPage() {
  return <DiagnosticWizard />;
}
