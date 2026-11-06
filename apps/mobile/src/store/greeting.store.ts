import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { pickGreeting } from '../constants/greetings';

const LAST_GREETING_KEY = 'tg_last_greeting';

interface GreetingState {
  greeting: string;
  // Picks the greeting for this app launch. Call it once when the app starts.
  choose: () => Promise<void>;
}

export const useGreetingStore = create<GreetingState>((set) => ({
  // Only shown if choosing fails, so Home never has an empty greeting
  greeting: 'Hey',

  choose: async () => {
    let previous: string | null = null;
    try { previous = await SecureStore.getItemAsync(LAST_GREETING_KEY); } catch {}
    const greeting = pickGreeting(previous);
    set({ greeting });
    try { await SecureStore.setItemAsync(LAST_GREETING_KEY, greeting); } catch {}
  },
}));
