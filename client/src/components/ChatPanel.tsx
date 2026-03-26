import { useState, useRef, useEffect, useCallback } from 'react';
import { chatFocusRef, useChatStore } from '../store.ts';
import { chatSocketRef } from '../hooks/useSocket.ts';
import styles from './ChatPanel.module.css';

/** Reusable chat content (messages + input row). Used by both ChatPanel and MobileNavBar. */
export function ChatContent({ classNames = styles }: { classNames?: typeof styles }) {
  const messages = useChatStore((s) => s.messages);
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFocus = useCallback(() => { chatFocusRef.current = true; }, []);
  const handleBlur = useCallback(() => { chatFocusRef.current = false; }, []);

  const sendMessage = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || !chatSocketRef.current) return;
    chatSocketRef.current.emit('chat_message', { text: trimmed });
    setText('');
  }, [text]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Enter') sendMessage();
    },
    [sendMessage],
  );

  return (
    <>
      <div className={classNames.messages}>
        {messages.map((msg) =>
          msg.system ? (
            <div key={msg.id} className={classNames.systemMessage}>{msg.text}</div>
          ) : (
            <div key={msg.id} className={classNames.message}>
              <span className={classNames.messageName}>[{msg.name}]</span>{' '}{msg.text}
            </div>
          ),
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={classNames.inputRow}>
        <input
          ref={inputRef}
          className={classNames.input}
          type="text"
          maxLength={280}
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        <button
          className={classNames.sendBtn}
          onClick={sendMessage}
          disabled={!text.trim()}
          aria-label="Send message"
        >
          &#9658;
        </button>
      </div>
    </>
  );
}

export default function ChatPanel() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        className={styles.openBtn}
        onClick={() => setOpen(true)}
        aria-label="Open chat"
      >
        &#8230;
      </button>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span>// chat</span>
        <button
          className={styles.closeBtn}
          onClick={() => setOpen(false)}
          aria-label="Close chat"
        >
          &#215;
        </button>
      </div>
      <ChatContent />
    </div>
  );
}
