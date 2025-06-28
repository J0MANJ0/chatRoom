import { create } from 'zustand';

const useTheme = create((set) => ({
  theme: localStorage.getItem('chat-theme') || 'coffee',
  setTheme: (theme) => {
    localStorage.setItem('chat-theme', theme);
    set({ theme });
  },
}));
export default useTheme;
