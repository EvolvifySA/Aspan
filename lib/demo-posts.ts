import type { FeedPostData } from '@/components/aspan/feed-post'

export const demoPosts: FeedPostData[] = [
  {
    id: 1,
    imageUrl: '/images/instituicao-1.png',
    caption:
      'Momento de convivência e acolhimento com nossos idosos no espaço da ASPAN.',
    createdAt: new Date('2026-07-21T10:30:00-03:00'),
  },
  {
    id: 2,
    imageUrl: '/images/instituicao-2.png',
    caption:
      'Atividade especial de integração com equipe, cuidado e atenção diária.',
    createdAt: new Date('2026-07-20T15:00:00-03:00'),
  },
  {
    id: 3,
    imageUrl: '/images/instituicao-3.png',
    caption:
      'Registro de mais um dia de afeto, organização e rotina compartilhada.',
    createdAt: new Date('2026-07-18T09:15:00-03:00'),
  },
]

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL)
}
