// stores/useLoadingStore.ts
import { create } from 'zustand';

interface LoadingState {
  loadingStates: Record<string, boolean>;
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;
  clearLoading: (key: string) => void;
  clearAllLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
  loadingStates: {},
  
  setLoading: (key: string, isLoading: boolean) =>
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [key]: isLoading,
      },
    })),
  
  isLoading: (key: string) => {
    const { loadingStates } = get();
    return loadingStates[key] || false;
  },
  
  clearLoading: (key: string) =>
    set((state) => {
      const newStates = { ...state.loadingStates };
      delete newStates[key];
      return { loadingStates: newStates };
    }),
  
  clearAllLoading: () => set({ loadingStates: {} }),
}));

// Hook สำหรับใช้งานง่ายขึ้น
export const useLoading = (key: string) => {
  const setLoading = useLoadingStore((state) => state.setLoading);
  const isLoading = useLoadingStore((state) => state.isLoading(key));
  const clearLoading = useLoadingStore((state) => state.clearLoading);
  
  return {
    isLoading,
    setLoading: (loading: boolean) => setLoading(key, loading),
    clearLoading: () => clearLoading(key),
  };
};