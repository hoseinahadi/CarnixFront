import AuthGuard from '@/guard/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    
      <div >
        <main >
          {children}
        </main>
      </div>
    
  );
}
