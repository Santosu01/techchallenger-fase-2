import React, { useState } from 'react';
import { Key, Copy, Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { ServiceStatusBadge } from '../components/ServiceStatusBadge';
import { toast } from 'sonner';
import Button from '../components/ui/Button';
import { useAuthContext } from '../context/useAuthContext';

const AuthPage: React.FC = () => {
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { createKey, isCreating } = useAuth();
  const { status } = useSystemStatus();
  const { setActiveApiKey } = useAuthContext();

  const handleGenerate = async () => {
    try {
      const result = await createKey(`Portal-Key-${new Date().getTime()}`);
      setCreatedKey(result.key);
      toast.success('Chave de API gerada com sucesso!');
    } catch (err) {
      // toast already handled in hook
    }
  };

  const copyToClipboard = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setIsCopied(true);
      toast.info('Chave copiada para o clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent-primary/10 border border-accent-primary/20 mb-4">
          <Key className="w-4 h-4 text-accent-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-accent-primary">
            Security & Authentication
          </span>
        </div>
        <h2 className="text-5xl font-black italic tracking-tight">
          Gerenciamento de <span className="gradient-text">Acesso</span>
        </h2>
        <p className="text-text-secondary max-w-2xl mx-auto text-lg leading-relaxed">
          Gere chaves de API para autenticar suas requisições. O Auth Service valida as chaves e as
          armazena com segurança no Redis.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">
        {/* Generate Section */}
        <section className="glass rounded-[2rem] p-10 border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
            <ShieldCheck className="w-24 h-24 text-accent-primary rotate-12" />
          </div>

          <div className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center mb-8 shadow-2xl transform group-hover:scale-110 transition-transform duration-500">
            <Key className="text-white w-10 h-10" />
          </div>

          <h3 className="text-2xl font-bold mb-4">Criar Nova Chave</h3>
          <p className="text-text-secondary text-sm mb-10 px-4 leading-relaxed">
            Esta operação requer o <strong>VITE_MASTER_KEY</strong> configurado no seu ambiente para
            autenticação administrativa.
          </p>

          <Button
            onClick={handleGenerate}
            isLoading={isCreating}
            className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-accent-primary/20"
            leftIcon={!isCreating && <Key className="w-5 h-5" />}
          >
            Gerar API Key
          </Button>

          <div className="mt-8 pt-8 border-t border-white/5 w-full flex items-center justify-between">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
              Status do Serviço
            </span>
            <ServiceStatusBadge status={status.auth} />
          </div>
        </section>

        {/* Result Section */}
        <section className="flex flex-col h-full">
          {createdKey ? (
            <div className="glass rounded-[2rem] p-10 border border-emerald-500/20 bg-emerald-500/5 relative animate-in fade-in slide-in-from-right-4 duration-500 flex-1 flex flex-col">
              <div className="mb-8 overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    Chave Gerada com Sucesso
                  </span>
                </div>
                <div className="relative group/key">
                  <div className="w-full bg-black/40 border border-emerald-500/20 rounded-2xl p-6 font-mono text-emerald-300 break-all text-lg shadow-inner">
                    {createdKey}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-emerald-500 text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/key:opacity-100"
                  >
                    {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-4 p-5 rounded-2xl bg-black/20 border border-white/5 text-sm text-text-secondary leading-relaxed">
                <p className="flex gap-3">
                  <span className="text-emerald-500 font-bold">●</span>
                  Esta chave expira em 30 dias por padrão.
                </p>
                <p className="flex gap-3">
                  <span className="text-emerald-500 font-bold">●</span>
                  Use-a no header <code>Authorization: Bearer [key]</code>.
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-auto pt-8">
                <Button
                  onClick={() => {
                    setActiveApiKey(createdKey);
                    toast.success('Chave ativada para toda a plataforma!');
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 h-12 font-bold"
                >
                  Usar esta chave agora
                </Button>

                <button
                  onClick={() => setCreatedKey(null)}
                  className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] hover:text-white transition-colors mx-auto"
                >
                  Gerar Outra
                </button>
              </div>
            </div>
          ) : (
            <div className="glass rounded-[2rem] p-10 border border-white/5 flex-1 flex flex-col items-center justify-center text-center opacity-40 italic">
              <Key className="w-16 h-16 mb-6 opacity-20" />
              <p className="text-text-secondary">
                A chave gerada aparecerá aqui para você copiar e usar no sistema.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AuthPage;
