import { useAuth } from '@/context/AuthContext';
import { useMemo } from 'react';
import type { User } from '@/services/api/auth';

type Role = 'admin' | 'manager' | 'viewer';

export function useRBAC() {
  const { user } = useAuth();

  return useMemo(() => {
    const role: Role = (user as User & { role?: Role })?.role || 'admin';
    const isAdmin = role === 'admin';
    const isManager = role === 'admin' || role === 'manager';

    return {
      role,
      isAdmin,
      isManager,
      canCreate: isManager,
      canEdit: isManager,
      canDelete: isAdmin,
      canBulkAction: isManager,
      canSeed: isAdmin,
    };
  }, [user]);
}
