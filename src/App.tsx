import { useCallback, useEffect, useState } from "react";
import { BarChart3, Calculator, GraduationCap, Layers, Moon, Sun } from "lucide-react";
import { useSubjects } from "./hooks/useSubjects";
import { useAuth } from "./hooks/useAuth";
import { useCloudSync } from "./hooks/useCloudSync";
import { useTheme } from "./hooks/useTheme";
import { useNotebookStyle } from "./hooks/useNotebookStyle";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { SubjectSidebar } from "./components/subjects/SubjectSidebar";
import { SubjectWorkspace } from "./components/subjects/SubjectWorkspace";
import { CutCalculator } from "./components/calculator/CutCalculator";
import { CategoryCalculator } from "./components/calculator/CategoryCalculator";
import { SubjectsDashboard } from "./components/dashboard/SubjectsDashboard";
import { Landing } from "./components/layout/Landing";
import { Navbar } from "./components/layout/Navbar";
import { AuthModal } from "./components/auth/AuthModal";
import { ToastViewport, useToasts } from "./components/ui/Toast";
import { BooksArt, Paper } from "./components/ui/Notebook";
import { StyleSettings } from "./components/ui/StyleSettings";
import type { AcademicConfig, GradesRecord, Subject } from "./types/academic";
import { cn } from "./utils/cn";

type MainTab = "dashboard" | "calculator" | "projection" | "cuts";

const TABS: { id: MainTab; label: string; short: string; icon: typeof Calculator }[] = [
  { id: "calculator", label: "Calculadora", short: "Calcular", icon: Calculator },
  { id: "dashboard", label: "Mi semestre", short: "Semestre", icon: BarChart3 },
  { id: "projection", label: "Proyección", short: "Proyectar", icon: GraduationCap },
  { id: "cuts", label: "Cortes", short: "Cortes", icon: Layers },
];

export default function App() {
  const {
    subjects,
    selectedSubject,
    selectedId,
    selectSubject,
    addSubject,
    removeSubject,
    updateSubjectConfig,
    updateSubjectGrades,
    renameSubject,
    setSubjectsFromExternal,
  } = useSubjects();

  const { user, authError, isCloudEnabled, signIn, signUp, signOut } = useAuth();
  const { syncStatus, lastSyncedAt, syncError, downloadSubjects, uploadSubjects, resetSync } =
    useCloudSync(user?.id ?? null);
  const { isDark, toggleTheme } = useTheme();
  const { style: notebookStyle, setSheet, setHighlighter, setInk } = useNotebookStyle();
  const { toasts, notify, dismiss } = useToasts();

  const [hasEntered, setHasEntered] = useLocalStorage<boolean>("notaminima::entered", false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>("calculator");
  const [tabKey, setTabKey] = useState(0);

  /* ------------------ Sincronización con la nube ------------------ */

  useEffect(() => {
    if (!user) {
      resetSync();
      return;
    }
    void downloadSubjects().then((cloudSubjects) => {
      if (cloudSubjects.length > 0) {
        setSubjectsFromExternal(cloudSubjects);
        selectSubject(cloudSubjects[0].id);
        notify(`Recuperamos ${cloudSubjects.length} materia(s) de tu cuenta.`, "success");
      }
    });
  }, [user, downloadSubjects, setSubjectsFromExternal, selectSubject, resetSync, notify]);

  useEffect(() => {
    if (syncError) notify(syncError, "error");
  }, [syncError, notify]);

  const pushToCloud = useCallback(
    (next: Subject[]) => {
      if (user) void uploadSubjects(next);
    },
    [user, uploadSubjects],
  );

  /* ------------------ Acciones sobre materias ------------------ */

  const handleAddSubject = useCallback(
    (name: string) => {
      const subject = addSubject(name);
      setIsMobileSidebarOpen(false);
      pushToCloud([...subjects, subject]);
      notify(`Materia "${subject.name}" creada.`, "success");
    },
    [addSubject, subjects, pushToCloud, notify],
  );

  const handleRemoveSubject = useCallback(
    (id: string) => {
      removeSubject(id);
      pushToCloud(subjects.filter((subject) => subject.id !== id));
      notify("Materia eliminada.", "info");
    },
    [removeSubject, subjects, pushToCloud, notify],
  );

  const handleConfigChange = useCallback(
    (config: AcademicConfig) => {
      if (!selectedSubject) return;
      updateSubjectConfig(selectedSubject.id, config);
      pushToCloud(subjects.map((s) => (s.id === selectedSubject.id ? { ...s, config } : s)));
    },
    [selectedSubject, updateSubjectConfig, subjects, pushToCloud],
  );

  const handleGradesChange = useCallback(
    (grades: GradesRecord) => {
      if (!selectedSubject) return;
      updateSubjectGrades(selectedSubject.id, grades);
      pushToCloud(subjects.map((s) => (s.id === selectedSubject.id ? { ...s, grades } : s)));
    },
    [selectedSubject, updateSubjectGrades, subjects, pushToCloud],
  );

  const handleRename = useCallback(
    (name: string) => {
      if (!selectedSubject) return;
      renameSubject(selectedSubject.id, name);
      pushToCloud(subjects.map((s) => (s.id === selectedSubject.id ? { ...s, name } : s)));
    },
    [selectedSubject, renameSubject, subjects, pushToCloud],
  );

  /** Guarda la nota calculada en el primer corte que esté libre. */
  const handleSaveCalculatedGrade = useCallback(
    (grade: number) => {
      if (!selectedSubject) {
        notify("Crea una materia primero para guardar la nota.", "error");
        return;
      }
      const grades = selectedSubject.grades;
      const freeCut = (["corte1", "corte2", "corte3"] as const).find((id) => grades[id] === null);
      handleGradesChange({ ...grades, [freeCut ?? "corte3"]: grade });
    },
    [selectedSubject, handleGradesChange, notify],
  );

  const handleSelectSubject = useCallback(
    (id: string) => {
      selectSubject(id);
      setIsMobileSidebarOpen(false);
      if (mainTab === "dashboard") setMainTab("projection");
    },
    [selectSubject, mainTab],
  );

  const handleLogout = useCallback(async () => {
    await signOut();
    resetSync();
    notify("Sesión cerrada. Tus datos siguen en este dispositivo.", "info");
  }, [signOut, resetSync, notify]);

  /* ------------------ Pantalla de bienvenida ------------------ */

  if (!hasEntered) {
    return (
      <>
        <Landing
          isCloudEnabled={isCloudEnabled}
          onStart={() => setHasEntered(true)}
          onLogin={() => {
            setHasEntered(true);
            setIsAuthModalOpen(true);
          }}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          authError={authError}
          signIn={signIn}
          signUp={signUp}
        />
      </>
    );
  }

  /* ------------------ Aplicación ------------------ */

  const needsSubject = mainTab === "projection" || mainTab === "cuts";

  return (
    <div className="min-h-dvh">
      <Navbar
        user={user}
        syncStatus={syncStatus}
        lastSyncedAt={lastSyncedAt}
        onLogout={handleLogout}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((open) => !open)}
        rightSlot={
          <>
            <StyleSettings
              sheet={notebookStyle.sheet}
              highlighter={notebookStyle.highlighter}
              ink={notebookStyle.ink}
              onSheetChange={setSheet}
              onHighlighterChange={setHighlighter}
              onInkChange={setInk}
            />
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--border)] text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)]"
              aria-label={isDark ? "Cambiar a cuaderno diurno" : "Cambiar a cuaderno nocturno"}
              title={isDark ? "Cuaderno diurno" : "Cuaderno nocturno"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </>
        }
      />

      <main className="mx-auto flex max-w-7xl gap-5 px-3 py-5 sm:px-6 lg:px-8">
        {/* Barra lateral de escritorio */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <Paper className="sticky top-24 p-3">
            <SubjectSidebar
              subjects={subjects}
              selectedId={selectedId}
              onSelect={handleSelectSubject}
              onAdd={handleAddSubject}
              onRemove={handleRemoveSubject}
            />
          </Paper>
        </aside>

        {/* Cajón lateral en móvil */}
        {isMobileSidebarOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 animate-fade-in bg-black/50"
              onClick={() => setIsMobileSidebarOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 left-0 w-[86%] max-w-xs overflow-y-auto bg-[var(--paper)] p-4 shadow-[var(--shadow-lift)]">
              <SubjectSidebar
                subjects={subjects}
                selectedId={selectedId}
                onSelect={handleSelectSubject}
                onAdd={handleAddSubject}
                onRemove={handleRemoveSubject}
              />
            </div>
          </div>
        ) : null}

        {/* Contenido principal */}
        <section className="min-w-0 flex-1 space-y-4">
          {/* Pestañas */}
          <nav
            className="grid grid-cols-4 gap-1 rounded-2xl border border-[var(--border)] bg-[var(--paper)] p-1.5 shadow-[var(--shadow-paper)]"
            aria-label="Secciones principales"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setMainTab(tab.id);
                  setTabKey((k) => k + 1);
                }}
                aria-current={mainTab === tab.id ? "page" : undefined}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-bold transition sm:flex-row sm:gap-1.5 sm:text-sm",
                  mainTab === tab.id
                    ? "bg-[var(--ink)] text-[var(--paper)] shadow-sm"
                    : "text-[var(--ink-soft)] hover:bg-[var(--surface-2)]",
                )}
              >
                <tab.icon className="h-4 w-4 shrink-0" />
                <span className="sm:hidden">{tab.short}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Vistas */}
          <div key={tabKey} className="animate-page-turn">
          {mainTab === "calculator" ? (
            <CategoryCalculator
              subjectName={selectedSubject?.name}
              onSaveToCut={selectedSubject ? handleSaveCalculatedGrade : undefined}
              onNotify={notify}
            />
          ) : mainTab === "dashboard" ? (
            <SubjectsDashboard subjects={subjects} onSelectSubject={handleSelectSubject} />
          ) : needsSubject && !selectedSubject ? (
            <Paper animate className="p-10 text-center">
              <BooksArt className="mx-auto h-16 w-24" />
              <h3 className="font-hand mt-3 text-3xl text-[var(--ink)]">Elige una materia</h3>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                Crea o selecciona una materia en el panel lateral para ver esta sección.
              </p>
              <button
                type="button"
                onClick={() => handleAddSubject("Mi primera materia")}
                className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[var(--ink)] px-5 text-sm font-semibold text-[var(--paper)]"
              >
                Crear mi primera materia
              </button>
            </Paper>
          ) : mainTab === "projection" && selectedSubject ? (
            <Paper sheetStyle={notebookStyle.sheet} margin holes animate className="p-4 pl-12 sm:p-6 sm:pl-16">
              <SubjectWorkspace
                key={selectedSubject.id}
                subject={selectedSubject}
                onConfigChange={handleConfigChange}
                onGradesChange={handleGradesChange}
                onRename={handleRename}
                onResetGrades={() =>
                  handleGradesChange({ corte1: null, corte2: null, corte3: null })
                }
              />
            </Paper>
          ) : selectedSubject ? (
            <CutCalculator config={selectedSubject.config} onChange={handleConfigChange} />
          ) : null}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 pt-2 text-center text-[11px] text-[var(--ink-faint)]">
        <p>
          Hecho con cariño para estudiantes universitarios ·{" "}
          {user ? "Tus notas se guardan en tu cuenta." : "Tus notas se guardan en este dispositivo."}
        </p>
        <button
          type="button"
          onClick={() => setHasEntered(false)}
          className="mt-2 rounded px-2 py-1 font-semibold underline decoration-dotted underline-offset-2 transition hover:text-[var(--ink-soft)]"
        >
          Ver la introducción otra vez
        </button>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        authError={authError}
        signIn={signIn}
        signUp={signUp}
      />

      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
