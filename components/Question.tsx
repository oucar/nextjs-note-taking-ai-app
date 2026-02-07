'use client';

import { askQuestion } from '@/util/api';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { RetroButton } from '@/components/retro';
import Spinner from './Spinner';
import {
  MessageCircle,
  Trash2,
  Send,
  ExternalLink,
  Maximize2,
  Minimize2,
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
          className='inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold border-2 border-foreground/20 bg-card hover:bg-accent transition-colors no-underline'
          style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
        >
          <span>{shortDate}</span>
          <ExternalLink className='h-2.5 w-2.5 text-muted-foreground' />
        </Link>
      </TooltipTrigger>
      <TooltipContent side='top' className='max-w-xs'>
        <div className='space-y-1'>
          <div className='font-semibold'>{fullDate}</div>
          <div className='text-muted-foreground'>{entry.subject}</div>
          <div className='flex items-center gap-1'>
            <span
              className='w-2 h-2 rounded-full'
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
          <RetroButton variant='outline' className='gap-2'>
            <MessageCircle className='h-4 w-4' />
            Ask your journal
          </RetroButton>
        </DialogTrigger>
        <DialogContent
          className={`flex flex-col gap-0 p-0 transition-all duration-200 ${
            expanded
              ? 'sm:max-w-4xl h-[90vh]'
              : 'sm:max-w-2xl h-[70vh] max-h-[600px]'
          }`}
          showCloseButton={false}
        >
          {/* Header */}
          <DialogHeader className='p-4 pb-3 border-b-2 border-foreground/10 shrink-0'>
            <div className='flex items-center justify-between'>
              <DialogTitle className='flex items-center gap-2 text-base font-black uppercase tracking-tight'>
                <MessageCircle className='h-4 w-4' />
                Ask your journal
              </DialogTitle>
              <div className='flex items-center gap-1'>
                {messages.length > 0 && (
                  <RetroButton
                    variant='ghost'
                    size='sm'
                    onClick={handleClear}
                    className='text-xs'
                  >
                    <Trash2 className='h-3 w-3' />
                    Clear
                  </RetroButton>
                )}
                <RetroButton
                  variant='ghost'
                  size='icon'
                  onClick={() => setExpanded(!expanded)}
                  className='h-8 w-8'
                >
                  {expanded ? (
                    <Minimize2 className='h-4 w-4' />
                  ) : (
                    <Maximize2 className='h-4 w-4' />
                  )}
                </RetroButton>
              </div>
            </div>
          </DialogHeader>

          {/* Messages Area */}
          <div className='flex-1 overflow-y-auto p-4 space-y-4 min-h-0'>
            {messages.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full text-center text-muted-foreground'>
                <MessageCircle className='h-12 w-12 mb-4 opacity-20' />
                <p className='text-sm font-medium'>
                  Ask anything about your journals
                </p>
                <p className='text-xs mt-1'>
                  Try: &quot;What was my best day?&quot; or &quot;How have I
                  been feeling lately?&quot;
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
                      className={`max-w-[85%] px-3 py-2 text-sm border-2 ${
                        msg.role === 'human'
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-foreground border-foreground/10'
                      }`}
                    >
                      {/* Render AI message with proper formatting */}
                      {msg.role === 'ai' ? (
                        <div className='whitespace-pre-wrap'>{msg.content}</div>
                      ) : (
                        msg.content
                      )}
                    </div>
                    {/* Show referenced entries for AI messages */}
                    {msg.role === 'ai' &&
                      msg.referencedEntries &&
                      msg.referencedEntries.length > 0 && (
                        <div className='mt-2 flex flex-wrap gap-1.5 max-w-[85%]'>
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
              </>
            )}
          </div>

          {/* Input Form */}
          <div className='p-4 pt-3 border-t-2 border-foreground/10 shrink-0'>
            <form onSubmit={handleSubmit} className='flex gap-2'>
              <input
                type='text'
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={loading}
                placeholder='Ask about your journal entries...'
                className='flex-1 h-10 px-3 text-sm border-2 border-foreground/20 bg-background focus:border-primary focus:outline-none disabled:opacity-50'
                autoFocus
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
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default Question;
