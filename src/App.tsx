import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Award,
  BarChart3,
  Calendar,
  Calculator,
  Download,
  GraduationCap,
  Layers,
  ListTodo,
  Moon,
  Sun,
  Target,
  TrendingUp,
} from "lucide-react";
import { useSubjects } from "./hooks/useSubjects";
import { useAuth } from "./hooks/useAuth";
import { useCloudSync } from "./hooks/useCloudSync";
import { useTheme } from "./hooks/useTheme";
import { useNotebookStyle } from "./hooks/useNotebookStyle";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useSemesters } from "./hooks/useSemesters";
import { useAgenda } from "./hooks/useAgenda";
import { usePomodoro } from "./hooks/usePomodoro";
import { useGoals } from "./hooks/useGoals";
import { useAchievements } from "./hooks/useAchievements";
import { useHistory } from "./hooks/useHistory";
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
import { SemesterSelector } from "./components/semesters/SemesterSelector";
import { WhatIfSimulator } from "./components/plan/WhatIfSimulator";
import { StudyPlan } from "./components/plan/StudyPlan";
import { AgendaPanel } from "./components/agenda/AgendaPanel";
import { GoalsPanel } from "./components/goals/GoalsPanel";
import { AchievementsPanel } from "./components/achievements/AchievementsPanel";
import { PomodoroTimer } from "./components/pomodoro/PomodoroTimer";
import { HistoryChart } from "./components/history/HistoryChart";
import { BackupModal } from "./components/settings/BackupModal";
import { AccountPanel } from "./components/auth/AccountPanel";
import { PrivacyScreen } from "./components/auth/PrivacyScreen";
import { LocalModeBanner } from "./components/layout/LocalModeBanner";
import { UpdateNotice, useServiceWorkerUpdate } from "./components/layout/UpdateNotice";
import { Onboarding } from "./components/layout/Onboarding";
import type { AcademicConfig, GradesRecord, Subject } from "./types/academic";
import { cn } from "./utils/cn";

type MainTab =
  | "calculator"
  | "dashboard"
  | "projection"
  | "cuts"
  | "plan"
  | "agenda"
  | "goals"
  | "history"
  | "achievements";

const TABS: { id: MainTab; label: string; short: string; icon: typeof Calculator }[] = [
  { id: "calculator", label: "Calculadora", short: "Calcular", icon: Calculator },
  { id: "dashboard", label: "Mi semestre", short: "Semestre", icon: BarChart3 },
  { id: "projection", label: "Proyección", short: "Proyectar", icon: GraduationCap },
  { id: "cuts", label: "Cortes", short: "Cortes", icon: Layers },
  { id: "plan", label: "Plan", short: "Plan", icon: ListTodo },
  { id: "agenda", label: "Agenda", short: "Agenda", icon: Calendar },
  { id: "goals", label: "Metas", short: "Metas", icon: Target },
  { id: "history", label: "Historial", short: "Historial", icon: TrendingUp },
  { id: "achievements", label: "Logros", short: "Logros", icon: Award },
];

export default function App() {
  const {
    subjects,
    selectedId,
    selectSubject,
    addSubject,
    removeSubject,
    updateSubjectConfig,
    updateSubjectGrades,
    renameSubject,
    setSubjectsFromExternal,
  } = useSubjects();

  const { user, authError, isCloudEnabled, signIn, signUp, signOut, resetPassword, updateName, deleteAccount } = useAuth();
  const { syncStatus, lastSyncedAt, syncError, conflictNotice, downloadSubjects, uploadSubjects, resetSync } =
    useCloudSync(user?.id ?? null);
  const { isDark, toggleTheme } = useTheme();
  const { style: notebookStyle, setSheet, setHighlighter, setInk } = useNotebookStyle();
  const { toasts, notify, dismiss } = useToasts();

  const {
    semesters,
    activeSemesterId,
    addSemester,
    renameSemester,
    archiveSemester,
    deleteSemester,
    selectSemester,
  } = useSemesters();

  const agenda = useAgenda();
  const goals = useGoals();
  const { takeSnapshot, snapshots } = useHistory(subjects);

  const [hasEntered, setHasEntered] = useLocalStorage<boolean>("notaminima::entered", false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useLocalStorage<boolean>("notaminima::banner-dismissed", false);
  const [hasOnboarded, setHasOnboarded] = useLocalStorage<boolean>("notaminima::onboarded", false);
  const [mainTab, setMainTab] = useState<MainTab>("calculator");
  const [tabKey, setTabKey] = useState(0);

  const pomodoro = usePomodoro(selectedId);

  const { achievements, unlockedCount, newlyUnlocked, syncUnlocked } = useAchievements(
    subjects,
    pomodoro.sessions,
  );

  const { needsUpdate, applyUpdate, dismissUpdate } = useServiceWorkerUpdate();

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

  useEffect(() => {
    if (conflictNotice) notify(conflictNotice, "info");
  }, [conflictNotice, notify]);

  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      for (const badge of newlyUnlocked) {
        notify(`Logro desbloqueado: ${badge.name}`, "success");
      }
      syncUnlocked();
    }
  }, [newlyUnlocked, syncUnlocked, notify]);

  const pushToCloud = useCallback(
    (next: Subject[]) => {
      if (user) void uploadSubjects(next);
    },
    [user, uploadSubjects],
  );

  const visibleSubjects = useMemo(() => {
    if (activeSemesterId === null) return subjects;
    return subjects.filter((s) => (s.semesterId ?? null) === activeSemesterId);
  }, [subjects, activeSemesterId]);

  const visibleSelectedSubject = useMemo(
    () => visibleSubjects.find((s) => s.id === selectedId) ?? null,
    [visibleSubjects, selectedId],
  );

  const handleAddSubject = useCallback(
    (name: string) => {
      const subject = addSubject(name, activeSemesterId);
      setIsMobileSidebarOpen(false);
      pushToCloud([...subjects, subject]);
      notify(`Materia "${subject.name}" creada.`, "success");
    },
    [addSubject, subjects, pushToCloud, notify, activeSemesterId],
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
      if (!visibleSelectedSubject) return;
      updateSubjectConfig(visibleSelectedSubject.id, config);
      pushToCloud(subjects.map((s) => (s.id === visibleSelectedSubject.id ? { ...s, config } : s)));
    },
    [visibleSelectedSubject, updateSubjectConfig, subjects, pushToCloud],
  );

  const handleGradesChange = useCallback(
    (grades: GradesRecord) => {
      if (!visibleSelectedSubject) return;
      updateSubjectGrades(visibleSelectedSubject.id, grades);
      pushToCloud(subjects.map((s) => (s.id === visibleSelectedSubject.id ? { ...s, grades } : s)));
    },
    [visibleSelectedSubject, updateSubjectGrades, subjects, pushToCloud],
  );

  const handleRename = useCallback(
    (name: string) => {
      if (!visibleSelectedSubject) return;
      renameSubject(visibleSelectedSubject.id, name);
      pushToCloud(subjects.map((s) => (s.id === visibleSelectedSubject.id ? { ...s, name } : s)));
    },
    [visibleSelectedSubject, renameSubject, subjects, pushToCloud],
  );

  const handleSaveCalculatedGrade = useCallback(
    (grade: number) => {
      if (!visibleSelectedSubject) {
        notify("Crea una materia primero para guardar la nota.", "error");
        return;
      }
      const grades = visibleSelectedSubject.grades;
      const freeCut = (["corte1", "corte2", "corte3"] as const).find((id) => grades[id] === null);
      handleGradesChange({ ...grades, [freeCut ?? "corte3"]: grade });
    },
    [visibleSelectedSubject, handleGradesChange, notify],
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

  const handleDeleteAccount = useCallback(async () => {
    const ok = await deleteAccount();
    if (ok) {
      resetSync();
      setHasEntered(false);
      notify("Tu cuenta y tus datos fueron eliminados.", "info");
    }
    return ok;
  }, [deleteAccount, resetSync, notify, setHasEntered]);

  const handleImportBackup = useCallback(
    (importedSubjects: Subject[]) => {
      setSubjectsFromExternal(importedSubjects);
      pushToCloud(importedSubjects);
      notify(`Se importaron ${importedSubjects.length} materia(s).`, "success");
    },
    [setSubjectsFromExternal, pushToCloud, notify],
  );

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

  if (!hasOnboarded) {
    return (
      <>
        <Onboarding onComplete={() => setHasOnboarded(true)} />
      </>
    );
  }

  const needsSubject = mainTab === "projection" || mainTab === "cuts";
  const showWhatIf = mainTab === "projection" && visibleSelectedSubject;
  const tabGridClass = "grid-cols-5 sm:grid-cols-9";

  return (
    <div className="app-shell theme-transition min-h-dvh">
      <Navbar
        user={user}
        syncStatus={syncStatus}
        lastSyncedAt={lastSyncedAt}
        onLogout={handleLogout}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((open) => !open)}
        rightSlot={
          <>
            <button
              type="button"
              onClick={() => setIsBackupModalOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--border)] text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)]"
              aria-label="Respaldar datos"
              title="Respaldar datos"
            >
              <Download className="h-4 w-4" />
            </button>
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

      <main className="app-main mx-auto flex max-w-7xl gap-5 px-3 py-5 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 lg:block">
          <Paper className="sticky top-24 space-y-3 p-3">
            <SemesterSelector
              semesters={semesters}
              activeSemesterId={activeSemesterId}
              onSelect={selectSemester}
              onAdd={addSemester}
              onArchive={archiveSemester}
              onDelete={deleteSemester}
              onRename={renameSemester}
            />
            <SubjectSidebar
              subjects={visibleSubjects}
              selectedId={selectedId}
              onSelect={handleSelectSubject}
              onAdd={handleAddSubject}
              onRemove={handleRemoveSubject}
            />
          </Paper>
        </aside>

        {isMobileSidebarOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 animate-fade-in bg-black/50"
              onClick={() => setIsMobileSidebarOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 left-0 w-[86%] max-w-xs space-y-3 overflow-y-auto bg-[var(--paper)] p-4 shadow-[var(--shadow-lift)]">
              <SemesterSelector
                semesters={semesters}
                activeSemesterId={activeSemesterId}
                onSelect={selectSemester}
                onAdd={addSemester}
                onArchive={archiveSemester}
                onDelete={deleteSemester}
                onRename={renameSemester}
              />
              <SubjectSidebar
                subjects={visibleSubjects}
                selectedId={selectedId}
                onSelect={handleSelectSubject}
                onAdd={handleAddSubject}
                onRemove={handleRemoveSubject}
              />
            </div>
          </div>
        ) : null}

        <section className="min-w-0 flex-1 space-y-4">
          {!user && !bannerDismissed ? (
            <LocalModeBanner
              onLogin={() => setIsAuthModalOpen(true)}
              onDismiss={() => setBannerDismissed(true)}
            />
          ) : null}

          <nav
            className={cn(
              "app-tabbar grid gap-1 rounded-2xl border border-[var(--border)] bg-[var(--paper)] p-1.5 shadow-[var(--shadow-paper)]",
              tabGridClass,
            )}
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
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-bold transition sm:flex-row sm:gap-1.5 sm:text-sm",
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

          <div key={tabKey} className="animate-page-turn">
            {mainTab === "calculator" ? (
              <CategoryCalculator
                subjectName={visibleSelectedSubject?.name}
                onSaveToCut={visibleSelectedSubject ? handleSaveCalculatedGrade : undefined}
                onNotify={notify}
              />
            ) : mainTab === "dashboard" ? (
              <SubjectsDashboard
                subjects={visibleSubjects}
                onSelectSubject={handleSelectSubject}
                semesters={semesters}
                activeSemesterId={activeSemesterId}
              />
            ) : mainTab === "plan" ? (
              <StudyPlan subjects={visibleSubjects} onSelectSubject={handleSelectSubject} />
            ) : mainTab === "agenda" ? (
              <AgendaPanel
                items={agenda.items}
                subjects={visibleSubjects}
                onAdd={agenda.addItem}
                onToggleDone={agenda.toggleDone}
                onRemove={agenda.removeItem}
              />
            ) : mainTab === "goals" ? (
              <GoalsPanel
                subjects={visibleSubjects}
                globalGoal={goals.globalGoal}
                subjectGoals={goals.subjectGoals}
                onSetGlobalGoal={(target) => goals.addGoal(null, target)}
                onSetSubjectGoal={(subjectId, target) => goals.addGoal(subjectId, target)}
                onRemoveGoal={goals.removeGoal}
              />
            ) : mainTab === "history" ? (
              <HistoryChart
                snapshots={snapshots}
                subjects={visibleSubjects}
                onTakeSnapshot={() => {
                  takeSnapshot(activeSemesterId);
                  notify("Punto de promedio guardado.", "success");
                }}
              />
            ) : mainTab === "achievements" ? (
              <AchievementsPanel achievements={achievements} unlockedCount={unlockedCount} />
            ) : needsSubject && !visibleSelectedSubject ? (
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
            ) : mainTab === "projection" && visibleSelectedSubject ? (
              <div className="space-y-4">
                <Paper sheetStyle={notebookStyle.sheet} margin holes animate className="p-4 pl-12 sm:p-6 sm:pl-16">
                  <SubjectWorkspace
                    key={visibleSelectedSubject.id}
                    subject={visibleSelectedSubject}
                    onConfigChange={handleConfigChange}
                    onGradesChange={handleGradesChange}
                    onRename={handleRename}
                    onResetGrades={() => handleGradesChange({ corte1: null, corte2: null, corte3: null })}
                  />
                </Paper>
                {showWhatIf ? (
                  <WhatIfSimulator config={visibleSelectedSubject.config} grades={visibleSelectedSubject.grades} />
                ) : null}
                <PomodoroTimer
                  state={pomodoro.state}
                  remaining={pomodoro.remaining}
                  progress={pomodoro.progress}
                  totalSeconds={pomodoro.totalSeconds}
                  subjectName={visibleSelectedSubject.name}
                  subjectMinutes={pomodoro.subjectMinutes}
                  totalMinutes={pomodoro.totalMinutes}
                  onStart={pomodoro.start}
                  onPause={pomodoro.pause}
                  onResume={pomodoro.resume}
                  onReset={pomodoro.reset}
                  onComplete={pomodoro.completeAndRecord}
                />
              </div>
            ) : visibleSelectedSubject ? (
              <CutCalculator config={visibleSelectedSubject.config} onChange={handleConfigChange} />
            ) : null}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 pt-2 text-center text-[11px] text-[var(--ink-faint)]">
        <p>
          Hecho con cariño para estudiantes universitarios ·{" "}
          {user ? "Tus notas se guardan en tu cuenta." : "Tus notas se guardan en este dispositivo."}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setHasEntered(false)}
            className="rounded px-2 py-1 font-semibold underline decoration-dotted underline-offset-2 transition hover:text-[var(--ink-soft)]"
          >
            Ver la introducción otra vez
          </button>
          <button
            type="button"
            onClick={() => setIsBackupModalOpen(true)}
            className="rounded px-2 py-1 font-semibold underline decoration-dotted underline-offset-2 transition hover:text-[var(--ink-soft)]"
          >
            Respaldar datos
          </button>
          {user ? (
            <button
              type="button"
              onClick={() => setIsAccountOpen(true)}
              className="rounded px-2 py-1 font-semibold underline decoration-dotted underline-offset-2 transition hover:text-[var(--ink-soft)]"
            >
              Mi cuenta
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setIsPrivacyOpen(true)}
            className="rounded px-2 py-1 font-semibold underline decoration-dotted underline-offset-2 transition hover:text-[var(--ink-soft)]"
          >
            Privacidad
          </button>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        authError={authError}
        signIn={signIn}
        signUp={signUp}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        subjects={subjects}
        onImport={handleImportBackup}
      />

      {user && isAccountOpen ? (
        <AccountPanel
          user={user}
          onRename={updateName}
          onResetPassword={resetPassword}
          onDeleteAccount={handleDeleteAccount}
          onClose={() => setIsAccountOpen(false)}
        />
      ) : null}

      {isPrivacyOpen ? (
        <PrivacyScreen onClose={() => setIsPrivacyOpen(false)} />
      ) : null}

      {needsUpdate ? (
        <UpdateNotice onUpdate={applyUpdate} onDismiss={dismissUpdate} />
      ) : null}

      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
