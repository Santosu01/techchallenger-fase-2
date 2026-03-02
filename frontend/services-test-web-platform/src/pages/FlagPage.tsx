import React from 'react';
import { Flag, Plus, Trash2, List, AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFlags } from '../hooks/useFlags';
import { useConfirm } from '../hooks/useConfirm';
import ConfirmDialog from '../components/ConfirmDialog';
import FormField from '../components/form/FormField';
import Input from '../components/form/Input';
import Textarea from '../components/form/Textarea';
import Button from '../components/ui/Button';

import { useSystemStatus } from '../hooks/useSystemStatus';
import { ServiceStatusBadge } from '../components/ServiceStatusBadge';

const flagSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(50, 'O nome deve ter no máximo 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens'),
  description: z.string().max(200, 'A descrição deve ter no máximo 200 caracteres').optional(),
});

type FlagFormData = z.infer<typeof flagSchema>;

const FlagPage: React.FC = () => {
  const { flags, isLoading, error, createFlag, isCreating, toggleFlag, deleteFlag } = useFlags();
  const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirm();
  const { status } = useSystemStatus();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FlagFormData>({
    resolver: zodResolver(flagSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleCreate = async (data: FlagFormData) => {
    await createFlag({
      name: data.name,
      description: data.description || '',
      is_enabled: true,
    });
    reset();
  };

  const handleToggle = (name: string, currentStatus: boolean) => {
    toggleFlag({ name, isEnabled: !currentStatus });
  };

  const handleDelete = async (name: string) => {
    const isConfirmed = await confirm({
      title: 'Excluir Flag',
      message: 'Tem certeza que deseja remover esta flag? Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir',
      isDestructive: true,
    });

    if (!isConfirmed) return;

    await deleteFlag(name);
  };

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 text-purple-500">
              <Flag className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-extrabold italic">Feature Flag Service</h2>
          </div>
          <ServiceStatusBadge
            status={status.flag}
            className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5"
          />
        </div>
        <p className="text-text-secondary max-w-3xl leading-relaxed">
          O serviço de Flags permite que você gerencie o ciclo de vida de funcionalidades em tempo
          real. Os dados são sincronizados no PostgreSQL para persistência de longo prazo.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <section className="glass rounded-3xl p-8 border border-white/5 h-fit">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-500" />
            Nova Feature Flag
          </h3>

          <form onSubmit={handleSubmit(handleCreate)} className="space-y-5">
            <FormField label="Nome Técnico" error={errors.name?.message} required>
              <Input
                {...register('name')}
                placeholder="ex: enable-dark-mode"
                error={!!errors.name}
              />
            </FormField>

            <FormField label="Descrição" error={errors.description?.message}>
              <Textarea
                {...register('description')}
                placeholder="Para que serve esta flag?"
                className="h-24"
                error={!!errors.description}
              />
            </FormField>

            <Button
              type="submit"
              isLoading={isCreating}
              className="w-full bg-purple-600 hover:bg-purple-500 shadow-purple-900/40"
              leftIcon={!isCreating && <Plus className="w-4 h-4" />}
            >
              Criar Flag
            </Button>
          </form>
        </section>

        {/* List Section */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <List className="w-5 h-5 text-purple-500" />
              Flags Ativas
            </h3>
            <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-text-secondary uppercase tracking-widest border border-white/5">
              {flags.length} total
            </span>
          </div>

          {(error || (isLoading && flags.length === 0)) && (
            <div
              className={`p-4 rounded-2xl flex items-center gap-3 text-sm mb-6 ${error ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-white/5 text-text-secondary'}`}
            >
              {error ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
              {error ? 'Erro ao carregar flags.' : 'Carregando flags...'}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flags.map((flag) => (
              <div
                key={flag.id}
                className="glass rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight text-sm">
                      {flag.name}
                    </h4>
                    <p className="text-[10px] text-text-secondary mt-1 max-w-[200px] line-clamp-1 italic">
                      {flag.description || 'Sem descrição'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(flag.name, flag.is_enabled)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 relative ${flag.is_enabled ? 'bg-purple-500' : 'bg-white/10'}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${flag.is_enabled ? 'translate-x-6' : 'translate-x-0'}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${flag.is_enabled ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/30'}`}
                    />
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                      {flag.is_enabled ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(flag.name)}
                    className="p-2 hover:bg-rose-500/10 rounded-lg text-text-secondary hover:text-rose-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {flags.length === 0 && !isLoading && (
              <div className="col-span-full py-16 text-center glass rounded-3xl border border-dashed border-white/10">
                <Flag className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-text-secondary text-sm">Nenhuma flag encontrada.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <ConfirmDialog
        isOpen={isOpen}
        title={options?.title || ''}
        message={options?.message || ''}
        confirmLabel={options?.confirmLabel}
        isDestructive={options?.isDestructive}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default FlagPage;
