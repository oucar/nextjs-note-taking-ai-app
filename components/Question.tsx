'use client';

import { askQuestion } from '@/util/api';
import { useState, useRef, useEffect } from 'react';
import { RetroButton } from '@/components/retro';
import Spinner from './Spinner';
import { MessageCircle, Trash2, Send, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { scoreToColor } from '@/util/color';

type ReferencedEntry = {
  id: string;
  date: string;
  subject: string;
  sentimentScore: number;
};

type Message = {
  role: 'human' | 'ai';
  content: string;
  referencedEntries?: ReferencedEntry[];
};

const EntryLink = ({ entry }: { entry: ReferencedEntry }) => {
  const color = scoreToColor(entry.sentimentScore);
  const dateFormatted = new Date(entry.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link
      href={`/journal/${entry.id}`}
      className='inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold border-2 border-foreground/20 bg-card hover:bg-accent transition-colors no-underline'
      style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
    >
      <span className='text-muted-foreground'>{dateFormatted}</span>
      <span className='truncate max-w-[120px]'>{entry.subject}</span>
      <ExternalLink className='h-3 w-3 text-muted-foreground' />
    </Link>
  );
};

const Question = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userMessage = question.trim();
    setQuestion('');

    const updatedMessages: Message[] = [
      ...messages,
      { role: 'human' as const, content: userMessage },
    ];
    setMessages(updatedMessages);
    setLoading(true);

    const { data } = await askQuestion(
      userMessage,
      updatedMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }))
    );

    setMessages([
      ...updatedMessages,
      {
        role: 'ai',
        content: data.answer,
        referencedEntries: data.referencedEntries,
      },
    ]);
    setLoading(false);
  };

  const handleClear = () => {
    setMessages([]);
    setQuestion('');
  };

  return (
    <div className='space-y-3'>
      {/* Header with clear button */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <MessageCircle className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-bold uppercase tracking-wide'>
            Ask your journal
          </span>
        </div>
        {messages.length > 0 && (
          <RetroButton variant='ghost' size='sm' onClick={handleClear}>
            <Trash2 className='h-3 w-3' />
            Clear
          </RetroButton>
        )}
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div className='border-2 border-foreground/10 bg-background p-3 max-h-80 overflow-y-auto scrollbar-thin space-y-3'>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.role === 'human' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 text-sm border-2 ${
                  msg.role === 'human'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-foreground border-foreground/10'
                }`}
              >
                {msg.content}
              </div>
              {/* Show referenced entries for AI messages */}
              {msg.role === 'ai' &&
                msg.referencedEntries &&
                msg.referencedEntries.length > 0 && (
                  <div className='mt-2 flex flex-wrap gap-2 max-w-[85%]'>
                    {msg.referencedEntries.map((entry) => (
                      <EntryLink key={entry.id} entry={entry} />
                    ))}
                  </div>
                )}
            </div>
          ))}
          {loading && (
            <div className='flex justify-start'>
              <div className='bg-muted border-2 border-foreground/10 px-3 py-2 flex items-center gap-2 text-sm text-muted-foreground'>
                <Spinner />
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className='flex gap-2'>
        <input
          type='text'
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading}
          placeholder='Ask about your journal entries...'
          className='flex-1 h-10 px-3 text-sm border-2 border-foreground/20 bg-background focus:border-primary focus:outline-none disabled:opacity-50'
        />
        <RetroButton
          type='submit'
          disabled={loading || !question.trim()}
          size='icon'
        >
          <Send className='h-4 w-4' />
        </RetroButton>
      </form>
    </div>
  );
};

export default Question;
