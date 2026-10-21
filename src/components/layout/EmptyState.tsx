import { GraduationCap } from "lucide-react";
import { Button } from "../ui/Button";

interface EmptyStateProps {
  onCreate: () => void;
}

/** Estado vacío mostrado cuando el estudiante aún no ha creado ninguna materia. */
export function EmptyState({ onCreate }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
        <GraduationCap className="h-8 w-8 text-white" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold text-slate-900">Empieza a proyectar tus notas</h2>
        <p className="max-w-sm text-sm text-slate-500">
          Crea tu primera materia, define los cortes y descubre en segundos qué nota necesitas para aprobar.
        </p>
      </div>
      <Button onClick={onCreate}>+ Crear mi primera materia</Button>
    </div>
  );
}
