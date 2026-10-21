import { useState } from "react";
import { Eye, EyeOff, GraduationCap, Loader2, Lock, Mail, User } from "lucide-react";
import { Button } from "../ui/Button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
}

type AuthMode = "login" | "register";

/**
 * Modal elegante para iniciar sesión o crear una cuenta. Optimizado tanto
 * para celulares como para escritorio, con transición suave de formularios,
 * validaciones en tiempo real y alternancia entre modo local/ en la nube.
 */
export function AuthModal({ isOpen, onClose, authError, signIn, signUp }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const cleanEmail = email.trim();
    let success = false;

    if (mode === "login") {
      success = await signIn(cleanEmail, password);
    } else {
      success = await signUp(cleanEmail, password, name.trim());
    }

    setIsSubmitting(false);
    if (success) {
      // Pequeña pausa para que Supabase complete la sesión
      setTimeout(() => {
        onClose();
      }, 350);
    }
  };

  const toggleMode = () => {
    setMode((previous) => (previous === "login" ? "register" : "login"));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-indigo-100 bg-white/95 shadow-2xl shadow-indigo-200/50 backdrop-blur-xl">
        {/* Encabezado con degradado */}
        <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-8 pb-6 pt-8 text-center text-white">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">NotaMínima</h2>
          <p className="mt-1 text-sm text-indigo-100/90">
            {mode === "login"
              ? "Inicia sesión para guardar tus materias en la nube"
              : "Crea tu cuenta gratis y sincroniza en todos tus dispositivos"}
          </p>
        </div>

        <div className="px-8 py-7">
          {/* Selector de modo */}
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-lg py-2 text-sm font-semibold transition ${
                mode === "login" ? "bg-white shadow-sm text-indigo-700" : "text-slate-500"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`rounded-lg py-2 text-sm font-semibold transition ${
                mode === "register" ? "bg-white shadow-sm text-indigo-700" : "text-slate-500"
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    required={mode === "register"}
                  />
                </div>
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="●●●●●●●●"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((show) => !show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {authError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                {authError}
              </div>
            ) : null}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : mode === "login" ? (
                "Entrar a mi cuenta"
              ) : (
                "Crear mi cuenta"
              )}
            </Button>
          </form>

          <div className="mt-5 border-t border-slate-100 pt-4 text-center">
            <button type="button" onClick={toggleMode} className="text-xs font-medium text-indigo-600 hover:underline">
              {mode === "login"
                ? "¿No tienes cuenta? Regístrate gratis"
                : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
            <p className="mt-2 text-[10px] text-slate-400">
              Al registrarte aceptas que tus materias se guarden en la nube de forma segura.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
