// Generated store for /users

import { create } from 'zustand';
import { users } from '../api/users';

interface usersState {
  data: any;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
}

export const useusersStore = create<usersState>((set) => ({
  data: null,
  loading: false,
  error: null,
  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const data = await users();
      set({ data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
