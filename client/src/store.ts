import { create } from 'zustand';

interface PlayerState {
  name: string;
  avatarColor: string;
  joined: boolean;
  setPlayer: (name: string, avatarColor: string) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  name: '',
  avatarColor: '',
  joined: false,
  setPlayer: (name, avatarColor) => set({ name, avatarColor, joined: true }),
}));
