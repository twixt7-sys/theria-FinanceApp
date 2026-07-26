import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { newId } from '../../../core/domain/ids';
import { getTerryModel } from '../../../core/firebase/ai';
import { isFirebaseConfigured } from '../../../core/firebase/config';
import { useAuth } from '../../../core/state/AuthContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { useData } from '../../../core/state/DataContext';
import { clearChat, loadChat, saveChat, type ChatMessage } from './chatStore';
import { canSend, recordMessageSent } from './quota';
import { TERRY_SYSTEM_INSTRUCTION, buildFinanceSummary } from './terryContext';

/** Turns kept as conversational context; older ones scroll out of the prompt. */
const HISTORY_TURNS = 10;

const message = (role: ChatMessage['role'], text: string): ChatMessage => ({
  id: newId(),
  role,
  text,
  createdAt: new Date().toISOString(),
});

export function useTerryChat() {
  const { user } = useAuth();
  const { accounts, budgets, records, streams, savings } = useData();
  const { mainCurrency } = useCurrency();

  const identity = user?.id ?? 'guest';
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChat(identity));
  const [isThinking, setIsThinking] = useState(false);
  const lastSentAt = useRef<number | null>(null);

  // Switching identity swaps to that thread rather than leaking the last one.
  useEffect(() => {
    setMessages(loadChat(identity));
  }, [identity]);

  useEffect(() => {
    saveChat(identity, messages);
  }, [identity, messages]);

  const snapshot = useMemo(
    () => ({ accounts, budgets, records, streams, savings, currency: mainCurrency }),
    [accounts, budgets, records, streams, savings, mainCurrency],
  );

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || isThinking) return;

      if (!isFirebaseConfigured) {
        setMessages((current) => [
          ...current,
          message('user', question),
          message('terry', "I'm not connected to my brain yet — add the Firebase config to enable chat."),
        ]);
        return;
      }

      const verdict = canSend({ lastSentAt: lastSentAt.current, online: navigator.onLine });
      if (!verdict.allowed) {
        setMessages((current) => [...current, message('user', question), message('terry', verdict.message)]);
        return;
      }

      const history = messages.slice(-HISTORY_TURNS * 2);
      setMessages((current) => [...current, message('user', question)]);
      setIsThinking(true);
      lastSentAt.current = Date.now();

      try {
        const model = getTerryModel(TERRY_SYSTEM_INSTRUCTION);
        if (!model) throw new Error('no-model');

        const chat = model.startChat({
          history: history.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          })),
        });

        // The snapshot rides with every question so Terry always sees current
        // figures, even in a conversation resumed days later. Delimited so the
        // data cannot read as instructions, nor the question as data.
        const prompt = [
          '<snapshot>',
          buildFinanceSummary(snapshot),
          '</snapshot>',
          '<question>',
          question,
          '</question>',
        ].join('\n');

        const result = await chat.sendMessage(prompt);
        recordMessageSent();

        const reply = result.response.text().trim();
        const cutOff = result.response.candidates?.[0]?.finishReason === 'MAX_TOKENS';
        setMessages((current) => [
          ...current,
          message('terry', cutOff ? `${reply}…\n\n(I ran long there — ask me for the rest?)` : reply),
        ]);
      } catch (error) {
        // Terry's reply is deliberately vague; the real cause still needs to
        // be findable, so surface it rather than swallowing it entirely.
        console.error('[terry] chat request failed:', error);
        const code = error instanceof Error ? error.message : '';
        const tooMany = /429|RESOURCE_EXHAUSTED|quota/i.test(code);
        setMessages((current) => [
          ...current,
          message(
            'terry',
            tooMany
              ? "I've hit my thinking limit for now — try again in a little while."
              : "I couldn't reach my brain just then. Give it another go?",
          ),
        ]);
      } finally {
        setIsThinking(false);
      }
    },
    [isThinking, messages, snapshot],
  );

  const reset = useCallback(() => {
    clearChat(identity);
    setMessages([]);
  }, [identity]);

  return { messages, isThinking, send, reset, canChat: isFirebaseConfigured };
}
