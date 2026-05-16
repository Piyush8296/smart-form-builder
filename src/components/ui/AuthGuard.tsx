import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../../contexts/SessionContext';

export function AuthGuard() {
  const { session } = useSession();
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}
