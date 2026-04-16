import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { ModeWrapper } from './components/ModeWrapper';
import { ModeProvider } from './contexts/ModeContext';
function App() {
  return (
    <ModeProvider>
      <ModeWrapper>
        <RouterProvider router={router} />
        <Toaster />
      </ModeWrapper>
    </ModeProvider>
  );
}

export default App;
