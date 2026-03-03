import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus } from 'lucide-react';
import FormField from '../../components/form/FormField';
import Input from '../../components/form/Input';
import Textarea from '../../components/form/Textarea';
import Button from '../../components/ui/Button';

const flagSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(50, 'O nome deve ter no máximo 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens'),
  description: z.string().max(200, 'A descrição deve ter no máximo 200 caracteres').optional(),
});

export type FlagFormData = z.infer<typeof flagSchema>;

interface CreateFlagData {
  name: string;
  description: string;
  is_enabled: boolean;
}

interface FlagCreateFormProps {
  isCreating: boolean;
  onCreate: (data: CreateFlagData) => Promise<void>;
}

export const FlagCreateForm: React.FC<FlagCreateFormProps> = ({ isCreating, onCreate }) => {
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

  const onSubmit = async (data: FlagFormData) => {
    await onCreate({
      name: data.name,
      description: data.description || '',
      is_enabled: true,
    });
    reset();
  };

  return (
    <section className="glass rounded-3xl p-8 border border-white/5 h-fit">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Plus className="w-5 h-5 text-purple-500" />
        Nova Feature Flag
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField label="Nome Técnico" error={errors.name?.message} required>
          <Input {...register('name')} placeholder="ex: enable-dark-mode" error={!!errors.name} />
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
  );
};
