import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Send } from '@/shared/icons';
import { motion } from 'motion/react';
import { BuddyFace } from '../../../shared/components/FinanceBuddy';
import { EmptyState } from '../../../shared/components/EmptyState';
import { useTerryChat } from './useTerryChat';
import type { ChatMessage } from './chatStore';

const STARTERS = [
  'How am I doing this month?',
  'Where is most of my money going?',
  'Am I on track with my budgets?',
];

/** Renders the **bold** spans Terry is told to use, and nothing else. */
const RichText: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={index} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <React.Fragment key={index}>{part}</React.Fragment>
      ),
    )}
  </>
);

const Bubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="mb-0.5 h-7 w-7 shrink-0">
          <BuddyFace mood="happy" />
        </div>
      )}
      <div
        className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'rounded-br-md bg-primary text-primary-foreground'
            : 'rounded-bl-md border border-border bg-card text-foreground'
        }`}
      >
        <RichText text={message.text} />
      </div>
    </motion.div>
  );
};

export const ChatScreen: React.FC = () => {
  const { messages, isThinking, send, reset, canChat } = useTerryChat();
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const submit = (text: string) => {
    setDraft('');
    void send(text);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* The top bar already names the screen, so the only chrome here is Clear. */}
      {messages.length > 0 && (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RotateCcw size={14} />
            Clear
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-2">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-3">
            {/* Terry greets you in person before the conversation starts. */}
            <div className="flex flex-col items-center pt-8">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                className="h-24 w-24 drop-shadow-md sm:h-28 sm:w-28"
              >
                <BuddyFace mood="happy" />
              </motion.div>
              <motion.div
                aria-hidden
                animate={{ scaleX: [1, 0.78, 1], opacity: [0.4, 0.22, 0.4] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                className="mt-2 h-1.5 w-14 rounded-full bg-foreground/20 blur-[1px]"
              />
            </div>
            <EmptyState
              className="pt-4 pb-6"
              title="Say hello to Terry"
              hint="Ask about your spending, budgets or savings. He only sees your own data."
            />
            <div className="flex flex-col gap-2">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => submit(starter)}
                  disabled={!canChat}
                  className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-60"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((item) => <Bubble key={item.id} message={item} />)
        )}

        {isThinking && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-7 w-7 shrink-0">
              <BuddyFace mood="neutral" />
            </div>
            <span className="animate-pulse">Terry is thinking…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(draft);
        }}
        className="flex items-center gap-2 border-t border-border pt-3"
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={canChat ? 'Ask about your money…' : 'Chat needs Firebase configured'}
          disabled={!canChat}
          aria-label="Message Terry"
          className="h-11 flex-1 rounded-xl border border-border bg-input-background px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!canChat || isThinking || draft.trim().length === 0}
          aria-label="Send"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
};
