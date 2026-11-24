import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://exemplo.com';
  const routes = ["/","/servicos","/agendar","/entrar","/criar-conta","/redefinir-senha","/meus-agendamentos","/barbeiro/bloqueios","/painel-dono","/notificacoes","/termos","/politica-de-privacidade","/primeiros-passos","/sem-permissao","/contato","/painel-dono/clientes"];
  return routes.map((r) => ({ url: base + (r === '/' ? '' : r), lastModified: new Date(), changeFrequency: 'weekly' as const, priority: r === '/' ? 1 : 0.6 }));
}
