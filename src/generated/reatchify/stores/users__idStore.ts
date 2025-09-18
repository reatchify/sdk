// Generated store for /users/{id}

import { create } from 'zustand';
import { users__id } from '../api/users';

interface users__idState {
  data: any;
  loading: boolean;
  error: string | null;
  fetch: ({ id }: { id: string }) => Promise<void>;
}

export const useusers__idStore = create<users__idState>((set) => ({
  data: null,
  loading: false,
  error: null,
  fetch: async ({ id }: { id: string }) => {
    set({ loading: true, error: null });
    try {
      const data = await users__id({ id });
      set({ data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
