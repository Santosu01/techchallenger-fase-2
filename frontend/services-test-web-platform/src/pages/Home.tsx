import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Key,
  Flag,
  Target,
  PlayCircle,
  BarChart3,
  ArrowRight,
  type LucideProps,
} from 'lucide-react';
import { useSystemStatus, type ServiceStatus } from '../hooks/useSystemStatus';
import { ServiceStatusBadge } from '../components/ServiceStatusBadge';

const ServiceCard: React.FC<{
  title: string;
  description: string;
  icon: React.ComponentType<LucideProps>;
  path: string;
  color: string;
  status: ServiceStatus;
}> = ({ title, description, icon: Icon, path, color, status }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(path)}
      className="glass rounded-3xl p-8 border border-glass-border hover:border-accent-primary/50 transition-all duration-500 cursor-pointer group relative overflow-hidden flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-6">
        <div
          className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}
        >
          <Icon className="text-white w-7 h-7" />
        </div>
        <ServiceStatusBadge status={status} />
      </div>

      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed mb-6 flex-1">{description}</p>

      <div className="flex items-center gap-2 text-accent-primary font-semibold text-sm group-hover:gap-3 transition-all">
        Acessar Serviço <ArrowRight className="w-4 h-4" />
      </div>

      <div
        className={`absolute -right-4 -bottom-4 w-24 h-24 ${color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`}
      />
    </div>
  );
};

const Home: React.FC = () => {
  const { status } = useSystemStatus();

  const services = [
    {
      id: 'auth' as const,
      title: 'Authentication',
      description:
        'Gerencie chaves de API e controle o acesso aos seus microsserviços com segurança centralizada.',
      icon: Key,
      path: '/auth',
      color: 'bg-blue-500',
    },
    {
      id: 'flag' as const,
      title: 'Feature Flags',
      description:
        'Crie e gerencie flags de funcionalidade em tempo real. Ative ou desative recursos sem deploy.',
      icon: Flag,
      path: '/flags',
      color: 'bg-purple-500',
    },
    {
      id: 'targeting' as const,
      title: 'Targeting Rules',
      description:
        'Defina regras avançadas de segmentação, como rollout percentual para seus usuários.',
      icon: Target,
      path: '/targeting',
      color: 'bg-pink-500',
    },
    {
      id: 'evaluation' as const,
      title: 'Evaluation API',
      description:
        'O "Hot Path" do sistema. Teste o endpoint de alta performance otimizado com Redis.',
      icon: PlayCircle,
      path: '/evaluation',
      color: 'bg-emerald-500',
    },
    {
      id: 'analytics' as const,
      title: 'Analytics Worker',
      description:
        'Monitore o processamento de eventos via SQS e a persistência de dados no DynamoDB.',
      icon: BarChart3,
      path: '/analytics',
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="py-8">
      <header className="mb-12">
        <h2 className="text-4xl font-extrabold mb-4">
          Bem-vindo ao <span className="gradient-text">ToggleMaster</span>
        </h2>
        <p className="text-text-secondary text-lg max-w-2xl">
          Sua plataforma centralizada para gerenciamento de Feature Flags e segmentação de usuários
          com infraestrutura moderna e escalável.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.path} {...service} status={status[service.id]} />
        ))}
      </div>

      <section className="mt-16 glass rounded-4xl p-10 border border-glass-border relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h3 className="text-2xl font-bold mb-4">Pronto para Testar?</h3>
            <p className="text-text-secondary mb-6 leading-relaxed">
              Explore cada serviço individualmente ou execute o fluxo completo: crie uma chave,
              defina uma flag, configure uma regra e avalie o resultado instantaneamente.
            </p>
            <div className="flex gap-4">
              <button className="px-8 py-3 gradient-bg rounded-xl font-bold shadow-lg shadow-accent-primary/20 transition-transform active:scale-95">
                Ver Guia Rápido
              </button>
              <button className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold border border-white/10 transition-all">
                Documentação API
              </button>
            </div>
          </div>
          <div className="w-full md:w-1/3 aspect-video glass rounded-2xl flex items-center justify-center border border-white/5">
            <BarChart3 className="w-20 h-20 text-text-secondary opacity-20" />
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-accent-primary/5 blur-[100px] pointer-events-none" />
      </section>
    </div>
  );
};

export default Home;
