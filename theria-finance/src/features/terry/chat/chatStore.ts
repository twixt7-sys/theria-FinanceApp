import {
  readJsonFromLocalStorage,
  writeJsonToLocalStorage,
} from '../../../core/lib/localStorageJson';

export interface ChatMessage {
  id: string;
  role: 'user' | 'terry';
  text: string;
  createdAt: string;
}

/** One thread per identity, so signing out does not expose someone else's. */
const keyFor = (identity: string) => `theria-terry-chat:${identity}`;

/** Old turns are dropped rather than grown forever. */
export const MAX_STORED_MESSAGES = 50;

export function loadChat(identity: string): ChatMessage[] {
  return readJsonFromLocalStorage<ChatMessage[]>(keyFor(identity)) ?? [];
}

export function saveChat(identity: string, messages: ChatMessage[]): void {
  writeJsonToLocalStorage(keyFor(identity), messages.slice(-MAX_STORED_MESSAGES));
}

export function clearChat(identity: string): void {
  writeJsonToLocalStorage(keyFor(identity), []);
}
