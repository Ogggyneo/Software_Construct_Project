import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { ModeWrapper } from './components/ModeWrapper';
import { ModeProvider } from './contexts/ModeContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <ModeProvider>
        <ModeWrapper>
          <RouterProvider router={router} />
          <Toaster />
        </ModeWrapper>
      </ModeProvider>
    </AuthProvider>
  );
}

export default App;
