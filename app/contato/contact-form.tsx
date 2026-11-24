'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
  nomeInicial?: string;
  emailInicial?: string;
};

export function ContactForm({ nomeInicial = '', emailInicial = '' }: Props) {
  const [nome, setNome] = useState(nomeInicial);
  const [email, setEmail] = useState(emailInicial);
  const [telefone, setTelefone] = useState('');
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, telefone, assunto, mensagem }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setFeedback({ tipo: 'erro', texto: data.error || 'Nao foi possivel enviar.' });
      } else {
        setFeedback({
          tipo: 'ok',
          texto: 'Mensagem enviada. Respondemos em ate 1 dia util.',
        });
        setAssunto('');
        setMensagem('');
        setTelefone('');
      }
    } catch {
      setFeedback({ tipo: 'erro', texto: 'Falha de conexao. Tente novamente.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nome" className="mb-1 block text-sm font-medium text-fg">
            Seu nome
          </label>
          <Input
            id="nome"
            name="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Como podemos te chamar"
            required
            maxLength={120}
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-fg">
            E-mail
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="telefone" className="mb-1 block text-sm font-medium text-fg">
            Telefone (opcional)
          </label>
          <Input
            id="telefone"
            name="telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(24) 9 9999-9999"
            maxLength={20}
          />
        </div>
        <div>
          <label htmlFor="assunto" className="mb-1 block text-sm font-medium text-fg">
            Assunto
          </label>
          <Input
            id="assunto"
            name="assunto"
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            placeholder="Duvida, sugestao, parceria..."
            required
            maxLength={120}
          />
        </div>
      </div>

      <div>
        <label htmlFor="mensagem" className="mb-1 block text-sm font-medium text-fg">
          Mensagem
        </label>
        <textarea
          id="mensagem"
          name="mensagem"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          placeholder="Escreva aqui o que voce precisa."
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
        />
        <p className="mt-1 text-xs text-fg-muted">{mensagem.length}/2000</p>
      </div>

      {feedback && (
        <div
          role="status"
          className={
            feedback.tipo === 'ok'
              ? 'rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand'
              : 'rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600'
          }
        >
          {feedback.texto}
        </div>
      )}

      <Button type="submit" disabled={enviando} className="hover-lift">
        {enviando ? 'Enviando...' : 'Enviar mensagem'}
      </Button>
    </form>
  );
}
