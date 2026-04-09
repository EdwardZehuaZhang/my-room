import { create } from 'zustand';

export const chatFocusRef = { current: false };

interface PlayerState {
  name: string;
  modelKey: string;
  joined: boolean;
  avatarScale: number;
  firstPerson: boolean;
  setPlayer: (name: string, modelKey: string) => void;
  setAvatarScale: (scale: number) => void;
  toggleFirstPerson: () => void;
  resetJoined: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  name: '',
  modelKey: 'robot',
  joined: false,
  avatarScale: 1,
  firstPerson: !window.matchMedia('(hover: none) and (pointer: coarse)').matches,
  setPlayer: (name, modelKey) => set({ name, modelKey, joined: true }),
  setAvatarScale: (scale) => set({ avatarScale: Math.max(1, Math.min(10, scale)) }),
  toggleFirstPerson: () => set((s) => ({ firstPerson: !s.firstPerson })),
  resetJoined: () => set({ joined: false }),
}));

export interface RemotePlayer {
  id: string;
  name: string;
  modelKey: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
}

interface RemotePlayersState {
  players: Map<string, RemotePlayer>;
  serverFull: boolean;
  addPlayer: (player: RemotePlayer) => void;
  removePlayer: (id: string) => void;
  updatePlayer: (id: string, position: [number, number, number], rotation: [number, number, number, number]) => void;
  setServerFull: (full: boolean) => void;
  clearPlayers: () => void;
}

export interface ChatMessage {
  id: string;
  name: string;
  text: string;
  timestamp: number;
  system?: boolean;
}

const MAX_CHAT_MESSAGES = 200;

interface ChatState {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (msg) =>
    set((state) => {
      const next = [...state.messages, msg];
      if (next.length > MAX_CHAT_MESSAGES) next.splice(0, next.length - MAX_CHAT_MESSAGES);
      return { messages: next };
    }),
  clearMessages: () => set({ messages: [] }),
}));

export const useRemotePlayersStore = create<RemotePlayersState>((set) => ({
  players: new Map(),
  serverFull: false,
  addPlayer: (player) =>
    set((state) => {
      const next = new Map(state.players);
      next.set(player.id, player);
      return { players: next };
    }),
  removePlayer: (id) =>
    set((state) => {
      const next = new Map(state.players);
      next.delete(id);
      return { players: next };
    }),
  updatePlayer: (id, position, rotation) =>
    set((state) => {
      const existing = state.players.get(id);
      if (!existing) return state;
      const next = new Map(state.players);
      next.set(id, { ...existing, position, rotation });
      return { players: next };
    }),
  setServerFull: (full) => set({ serverFull: full }),
  clearPlayers: () => set({ players: new Map(), serverFull: false }),
}));
