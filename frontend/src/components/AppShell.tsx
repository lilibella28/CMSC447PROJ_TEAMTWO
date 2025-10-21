import { TopNav } from "./TopNav";

interface AppShellProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

export function AppShell({ children, onLogout }: AppShellProps) {
  return (
    <div className="h-screen bg-background flex flex-col">
      <TopNav onLogout={onLogout} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}