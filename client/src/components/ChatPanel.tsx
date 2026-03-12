import { useState, useRef, useEffect, useCallback } from 'react';
import { chatFocusRef, useChatStore } from '../store.ts';
import { chatSocketRef } from '../hooks/useSocket.ts';
import styles from './ChatPanel.module.css';

export default function ChatPanel() {
  const messages = useChatStore((s) => s.messages);
  const [open, setOpen] = useState(true);
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFocus = useCallback(() => {
    chatFocusRef.current = true;
  }, []);

  const handleBlur = useCallback(() => {
    chatFocusRef.current = false;
  }, []);

  const sendMessage = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || !chatSocketRef.current) return;
    chatSocketRef.current.emit('chat_message', { text: trimmed });
    setText('');
  }, [text]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Suppress WASD and other keys from reaching the 3D scene
      e.stopPropagation();
      if (e.key === 'Enter') {
        sendMessage();
      }
    },
    [sendMessage],
  );

  return (
    <>
      <button
        className={styles.toggle}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? '\u00D7' : '\u2026'}
      </button>

      <div className={`${styles.panel} ${open ? '' : styles.collapsed}`}>
        <div className={styles.header}>// chat</div>

        <div className={styles.messages}>
          {messages.map((msg) =>
            msg.system ? (
              <div key={msg.id} className={styles.systemMessage}>
                {msg.text}
              </div>
            ) : (
              <div key={msg.id} className={styles.message}>
                <span className={styles.messageName}>[{msg.name}]</span>{' '}
                {msg.text}
              </div>
            ),
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            maxLength={280}
            placeholder="Type a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          <button
            className={styles.sendBtn}
            onClick={sendMessage}
            disabled={!text.trim()}
            aria-label="Send message"
          >
            ↑
          </button>
        </div>
      </div>
    </>
  );
}
