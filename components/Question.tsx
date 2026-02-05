'use client';

import { askQuestion } from '@/util/api';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Spinner from './Spinner';
import { MessageCircle, Trash2, Send } from 'lucide-react';

type Message = {
  role: 'human' | 'ai';
  content: string;
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

    const updatedMessages = [...messages, { role: 'human' as const, content: userMessage }];
    setMessages(updatedMessages);
    setLoading(true);

    const { data } = await askQuestion(userMessage, updatedMessages.slice(0, -1));

    setMessages([...updatedMessages, { role: 'ai', content: data }]);
    setLoading(false);
  };

  const handleClear = () => {
    setMessages([]);
    setQuestion('');
  };

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='flex items-center gap-2'>
          <MessageCircle className='h-5 w-5 text-muted-foreground' />
          <CardTitle className='text-base'>Ask your journal</CardTitle>
        </div>
        {messages.length > 0 && (
          <Button variant='ghost' size='sm' onClick={handleClear}>
            <Trash2 className='h-4 w-4' />
            Clear
          </Button>
        )}
      </CardHeader>
      <Separator />
      <CardContent className='pt-4'>
        {messages.length > 0 && (
          <div className='mb-4 max-h-80 overflow-y-auto space-y-3'>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'human' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === 'human'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className='flex justify-start'>
                <div className='bg-muted rounded-lg px-3 py-2 flex items-center gap-2 text-sm text-muted-foreground'>
                  <Spinner />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
        <form onSubmit={handleSubmit} className='flex gap-2'>
          <Input
            type='text'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            placeholder='Ask about your journal entries...'
            className='flex-1'
          />
          <Button type='submit' disabled={loading || !question.trim()} size='icon'>
            <Send className='h-4 w-4' />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Question;
