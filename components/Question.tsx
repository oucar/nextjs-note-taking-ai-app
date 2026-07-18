'use client';

import { askQuestion } from '@/util/api';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import Spinner from './Spinner';
import {
  MessageCircle,
  Trash2,
  ArrowUp,
  ExternalLink,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { scoreToColor } from '@/util/color';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

// Compact date link with tooltip showing full details
const EntryLink = ({ entry }: { entry: ReferencedEntry }) => {
  const color = scoreToColor(entry.sentimentScore);
  const dateObj = new Date(entry.date);
  const shortDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const fullDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={`/journal/${entry.id}`}
          className='inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent'
        >
          <span
            aria-hidden
            className='size-1.5 rounded-full'
            style={{ backgroundColor: color }}
          />
          {shortDate}
          <ExternalLink className='size-2.5 text-muted-foreground' />
        </Link>
      </TooltipTrigger>
      <TooltipContent side='top' className='max-w-xs'>
        <div className='space-y-1'>
          <div className='font-semibold'>{fullDate}</div>
          <div className='text-muted-foreground'>{entry.subject}</div>
          <div className='flex items-center gap-1'>
            <span
              className='size-2 rounded-full'
              style={{ backgroundColor: color }}
            />
            <span className='text-xs'>
              Mood: {entry.sentimentScore > 0 ? '+' : ''}
              {entry.sentimentScore}/10
            </span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

const Question = () => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = async (e: FormEvent) => {
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
      updatedMessages
        .slice(0, -1)
        .map((m) => ({ role: m.role, content: m.content }))
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
    <TooltipProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant='outline' className='gap-2'>
            <Sparkles className='size-4' />
            Ask your journal
          </Button>
        </DialogTrigger>
        <DialogContent
          className={`flex flex-col gap-0 overflow-hidden rounded-2xl p-0 transition-all duration-200 ${
            expanded
              ? 'h-[90vh] sm:max-w-4xl'
              : 'h-[70vh] max-h-[600px] sm:max-w-2xl'
          }`}
          showCloseButton={false}
        >
          {/* Header */}
          <DialogHeader className='shrink-0 border-b border-border/60 px-5 py-4'>
            <div className='flex items-center justify-between'>
              <DialogTitle className='flex items-center gap-2 font-serif text-lg font-medium tracking-tight'>
                <Sparkles className='size-4 text-primary' />
                Ask your journal
              </DialogTitle>
              <div className='flex items-center gap-1'>
                {messages.length > 0 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleClear}
                    className='gap-1 text-xs text-muted-foreground'
                  >
                    <Trash2 className='size-3' />
                    Clear
                  </Button>
                )}
                <Button
                  variant='ghost'
                  size='icon-sm'
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <Minimize2 className='size-4' />
                  ) : (
                    <Maximize2 className='size-4' />
                  )}
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Messages Area */}
          <div className='scrollbar-thin min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4'>
            {messages.length === 0 ? (
              <div className='flex h-full flex-col items-center justify-center text-center'>
                <MessageCircle className='mb-4 size-10 text-muted-foreground/30' />
                <p className='font-serif text-lg text-foreground/80'>
                  Your journal remembers everything.
                </p>
                <p className='mt-1.5 max-w-xs text-xs leading-relaxed text-muted-foreground'>
                  Try “What was my best day this month?” or “How have I been
                  feeling lately?”
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.role === 'human' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'human'
                          ? 'rounded-2xl rounded-br-md bg-primary text-primary-foreground'
                          : 'rounded-2xl rounded-bl-md bg-muted text-foreground'
                      }`}
                    >
                      {msg.role === 'ai' ? (
                        <div className='whitespace-pre-wrap'>{msg.content}</div>
                      ) : (
                        msg.content
                      )}
                    </div>
                    {msg.role === 'ai' &&
                      msg.referencedEntries &&
                      msg.referencedEntries.length > 0 && (
                        <div className='mt-2 flex max-w-[85%] flex-wrap gap-1.5'>
                          {msg.referencedEntries.map((entry) => (
                            <EntryLink key={entry.id} entry={entry} />
                          ))}
                        </div>
                      )}
                  </div>
                ))}
                {loading && (
                  <div className='flex justify-start'>
                    <div className='flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm text-muted-foreground'>
                      <Spinner />
                      Reading your journal…
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Form */}
          <div className='shrink-0 border-t border-border/60 px-5 py-4'>
            <form onSubmit={handleSubmit} className='flex gap-2'>
              <input
                type='text'
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={loading}
                placeholder='Ask about your journal entries…'
                className='h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none disabled:opacity-50'
                autoFocus
              />
              <Button
                type='submit'
                disabled={loading || !question.trim()}
                size='icon'
              >
                <ArrowUp className='size-4' />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default Question;
