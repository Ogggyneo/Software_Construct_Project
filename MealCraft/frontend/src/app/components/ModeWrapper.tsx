import { ReactNode } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { useMode } from '../contexts/ModeContext';

interface ModeWrapperProps {
  children: ReactNode;
}

export function ModeWrapper({ children }: ModeWrapperProps) {
  const { mode, setMode } = useMode();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Grain texture overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Mode Switcher */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full shadow-lg border border-border">
        <span className="text-sm font-medium text-muted-foreground">View Mode:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('web')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${mode === 'web'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-transparent text-muted-foreground hover:bg-muted'
              }`}
          >
            <Monitor className="w-4 h-4" />
            <span className="font-medium">Web</span>
          </button>
          <button
            onClick={() => setMode('mobile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${mode === 'mobile'
                ? 'bg-secondary text-secondary-foreground shadow-md'
                : 'bg-transparent text-muted-foreground hover:bg-muted'
              }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="font-medium">App</span>
          </button>
        </div>
      </div>

      {/* Demo Container */}
      <div className="flex items-center justify-center min-h-screen p-8 pt-28">
        <div
          className={`bg-white shadow-2xl transition-all duration-700 ease-in-out overflow-y-auto overflow-x-hidden ${mode === 'web'
              ? 'w-full max-w-7xl h-[calc(100vh-8rem)] rounded-2xl'
              : 'w-full max-w-md h-[calc(100vh-8rem)] rounded-[3rem] border-[14px] border-gray-800'
            }`}
          style={{
            transform: mode === 'mobile' ? 'scale(1)' : 'scale(1)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
