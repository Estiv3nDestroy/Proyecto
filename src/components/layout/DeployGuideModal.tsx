import { useState } from "react";
import { Check, Copy, ExternalLink, FileCode2, FolderOpen, Globe, Rocket, Share2, Terminal, X } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GuideTab = "compile" | "netlify" | "github" | "offline";

/**
 * Modal interactivo para principiantes que explica paso a paso cómo generar
 * el archivo único `dist/index.html` y cómo publicarlo gratis en internet o
 * compartirlo directamente con compañeros sin instalar nada.
 */
export function DeployGuideModal({ isOpen, onClose }: DeployGuideModalProps) {
  const [activeTab, setActiveTab] = useState<GuideTab>("compile");
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const tabs: { id: GuideTab; label: string; badge?: string }[] = [
    { id: "compile", label: "1. Generar Archivo (.html)" },
    { id: "netlify", label: "2. Netlify Drop", badge: "Más fácil" },
    { id: "github", label: "3. GitHub Pages" },
    { id: "offline", label: "4. Enviar por WhatsApp" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-xs">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Guía para Compartir con tus Compañeros</h2>
              <p className="text-xs text-indigo-100">
                Publica tu calculadora gratis en internet o envíala como un solo archivo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-indigo-100 transition hover:bg-white/15 hover:text-white"
            aria-label="Cerrar guía"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Pestañas */}
        <div className="flex gap-1.5 overflow-x-auto border-b border-slate-100 bg-slate-50 px-6 py-2.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/70",
              )}
            >
              <span>{tab.label}</span>
              {tab.badge ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px]",
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-emerald-100 text-emerald-700",
                  )}
                >
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Contenido desplazable */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6 text-sm text-slate-700">
          {activeTab === "compile" ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
                <p className="font-semibold text-indigo-950">
                  ¿Qué hace especial a este proyecto?
                </p>
                <p className="mt-1 text-xs leading-relaxed text-indigo-900">
                  Gracias a <code className="rounded bg-indigo-100 px-1.5 py-0.5 font-mono">vite-plugin-singlefile</code>,
                  todo el diseño, los iconos y la lógica matemática se fusionan dentro de{" "}
                  <strong>un único archivo llamado index.html</strong>. Tus compañeros no tendrán que instalar nada.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <Terminal className="h-4 w-4 text-indigo-600" />
                  Paso 1: Ejecuta el comando de empaquetado
                </h3>
                <p className="text-xs text-slate-500">
                  Abre la terminal dentro de la carpeta del proyecto (por ejemplo en VS Code presionando{" "}
                  <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px]">
                    Ctrl + Ñ
                  </kbd>
                  ) y escribe:
                </p>
                <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-slate-100">
                  <code className="font-mono text-xs sm:text-sm">npm run build</code>
                  <button
                    type="button"
                    onClick={() => copyText("npm run build", "build")}
                    className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700"
                  >
                    {copiedCommand === "build" ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <FolderOpen className="h-4 w-4 text-indigo-600" />
                  Paso 2: ¿Dónde se guarda y cómo se llama el archivo?
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Al terminar (tarda unos 3 segundos), verás que aparece una carpeta nueva llamada{" "}
                  <strong className="text-slate-900">dist</strong> en tu proyecto:
                </p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-xs text-slate-700">
                  <div>📁 tu-proyecto/</div>
                  <div className="pl-4 text-indigo-700 font-semibold">└── 📁 dist/</div>
                  <div className="pl-10 text-emerald-700 font-bold">
                    └── 📄 index.html &nbsp;← ¡ESTE ES TU ARCHIVO ÚNICO!
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  ⚠️ <strong>Importante:</strong> No confundas el <code className="font-mono">index.html</code> que está
                  afuera en la raíz con el que está <strong>dentro de la carpeta dist/</strong>. El que debes usar y
                  compartir es siempre <strong className="text-slate-800">dist/index.html</strong>.
                </p>
              </div>
            </div>
          ) : null}

          {activeTab === "netlify" ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <p className="font-semibold text-emerald-950">
                  Opción recomendada: Netlify Drop (toma 30 segundos)
                </p>
                <p className="mt-1 text-xs text-emerald-800">
                  No necesitas saber programar ni usar comandos adicionales. Solo arrastras la carpeta{" "}
                  <strong>dist</strong> con el ratón y obtienes un enlace público gratis.
                </p>
              </div>

              <ol className="space-y-3 text-xs leading-relaxed text-slate-700">
                <li className="flex gap-3 rounded-xl border border-slate-200 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900">Entra a Netlify Drop:</strong> Abre tu navegador y ve a{" "}
                    <a
                      href="https://app.netlify.com/drop"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-indigo-600 underline"
                    >
                      app.netlify.com/drop <ExternalLink className="h-3 w-3" />
                    </a>{" "}
                    (puedes registrarte gratis con tu correo o cuenta de Google/GitHub).
                  </div>
                </li>
                <li className="flex gap-3 rounded-xl border border-slate-200 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900">Abre tu explorador de archivos:</strong> Busca la carpeta de tu
                    proyecto en tu computadora y localiza la carpeta llamada <strong>dist</strong> (la que se creó con{" "}
                    <code className="font-mono">npm run build</code>).
                  </div>
                </li>
                <li className="flex gap-3 rounded-xl border border-slate-200 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900">Arrastra y suelta:</strong> Haz clic sostenido sobre la carpeta{" "}
                    <strong>dist</strong> completa y arrástrala dentro del recuadro punteado de la página de Netlify que
                    dice <em>&quot;Drag and drop your site output folder here&quot;</em>.
                  </div>
                </li>
                <li className="flex gap-3 rounded-xl border border-slate-200 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                    4
                  </span>
                  <div>
                    <strong className="text-slate-900">¡Listo! Copia tu enlace:</strong> En 5 segundos Netlify te dará un
                    link público (ej. <code className="font-mono">https://notaminima-uni.netlify.app</code>). Puedes
                    cambiarle el nombre en <em>Site configuration → Change site name</em> y pasarlo por WhatsApp.
                  </div>
                </li>
              </ol>
            </div>
          ) : null}

          {activeTab === "github" ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">
                  Publicar en GitHub Pages (100% desde el navegador, sin comandos Git)
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Ideal si quieres una URL permanente tipo{" "}
                  <code className="font-mono">tu-usuario.github.io/notas-uni</code>.
                </p>
              </div>

              <ol className="space-y-2.5 text-xs leading-relaxed text-slate-700">
                <li className="rounded-xl border border-slate-200 p-3">
                  <strong>1. Crea una cuenta en GitHub.com</strong> e inicia sesión. Arriba a la derecha haz clic en el
                  botón <strong>+</strong> y elige <strong>New repository</strong>.
                </li>
                <li className="rounded-xl border border-slate-200 p-3">
                  <strong>2. Ponle nombre:</strong> En <em>Repository name</em> escribe por ejemplo{" "}
                  <code className="font-mono">notas-uni</code>, verifica que esté marcado como{" "}
                  <strong>Public</strong> y dale clic al botón verde <strong>Create repository</strong>.
                </li>
                <li className="rounded-xl border border-slate-200 p-3">
                  <strong>3. Sube el archivo único:</strong> En la pantalla que aparece, haz clic en el enlace azul{" "}
                  <strong>uploading an existing file</strong>. Arrastra ahí únicamente el archivo{" "}
                  <strong>index.html</strong> que está dentro de tu carpeta <strong>dist/</strong> y haz clic abajo en el
                  botón verde <strong>Commit changes</strong>.
                </li>
                <li className="rounded-xl border border-slate-200 p-3">
                  <strong>4. Activa GitHub Pages:</strong> Arriba en el menú del repositorio entra a{" "}
                  <strong>Settings</strong> ⚙️ → en la barra izquierda haz clic en <strong>Pages</strong> → donde dice{" "}
                  <em>Branch</em> cambia &quot;None&quot; por <strong>main</strong> y pulsa <strong>Save</strong>. En 1
                  minuto aparecerá tu enlace público arriba.
                </li>
              </ol>
            </div>
          ) : null}

          {activeTab === "offline" ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-4">
                <p className="font-semibold text-violet-950">
                  Truco Extra: ¡También funciona sin subirlo a ningún servidor!
                </p>
                <p className="mt-1 text-xs leading-relaxed text-violet-900">
                  Como <code className="font-mono">dist/index.html</code> tiene todo integrado dentro de sí mismo,
                  puedes enviarlo como un documento por <strong>WhatsApp, Telegram o Correo</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <FileCode2 className="mb-2 h-5 w-5 text-indigo-600" />
                  <p className="font-semibold text-slate-900">En Computadora (PC / Mac)</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Quien reciba el archivo <code className="font-mono">index.html</code> solo tiene que hacerle{" "}
                    <strong>doble clic</strong>. Se abrirá en Chrome, Edge o Safari funcionando al 100% incluso sin
                    conexión a internet.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <Globe className="mb-2 h-5 w-5 text-indigo-600" />
                  <p className="font-semibold text-slate-900">En Celulares (Android / iPhone)</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Para celulares es mucho más cómodo usar el link de <strong>Netlify Drop</strong> (Pestaña 2), así tus
                    compañeros entran con un toque desde WhatsApp sin descargar archivos.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Pie del modal */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3.5">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Share2 className="h-3.5 w-3.5 text-indigo-500" />
            Archivo empaquetado: <code className="font-mono font-semibold text-slate-700">dist/index.html</code>
          </span>
          <Button size="sm" onClick={onClose}>
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
}
