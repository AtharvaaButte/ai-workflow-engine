import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import ToastProvider from './context/ToastProvider';

export function App() {
  return (
    <BrowserRouter>
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
    </BrowserRouter>
  );
}

export default App;