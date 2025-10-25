import { TopNav } from "./TopNav";

interface AppShellProps {
  children: React.ReactNode;
  onLogout?: () => void;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export function AppShell({ children, onLogout, currentPage, onNavigate }: AppShellProps) {
  return (
    <div className="h-screen bg-background flex flex-col">
      <TopNav onLogout={onLogout} currentPage={currentPage} onNavigate={onNavigate} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}