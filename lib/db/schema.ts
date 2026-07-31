import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Posts do feed público de atualizações da ASPAN. Conteúdo institucional,
// gerenciado coletivamente por administradores autenticados. `userId` registra
// quem publicou.

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  imageUrl: text('imageUrl').notNull(),
  imageUrls: jsonb('imageUrls'),
  caption: text('caption').notNull().default(''),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const transparencyDocuments = pgTable('transparency_documents', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  referenceMonth: text('reference_month').notNull(),
  fileUrl: text('file_url').notNull(),
  originalFilename: text('original_filename').notNull(),
  fileSize: integer('file_size').notNull(),
  uploadedBy: text('uploaded_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const solicitacoesVaga = pgTable('solicitacoes_vaga', {
  id: text('id').primaryKey(),
  nomeSolicitante: text('nome_solicitante').notNull(),
  emailSolicitante: text('email_solicitante').notNull().unique(),
  grauParentesco: text('grau_parentesco').notNull(),
  grauParentescoOutro: text('grau_parentesco_outro'),
  endereco: text('endereco').notNull(),
  cidade: text('cidade').notNull(),
  estado: text('estado').notNull(),
  telefoneContato: text('telefone_contato').notNull(),
  nomeIdoso: text('nome_idoso').notNull(),
  idadeIdoso: integer('idade_idoso').notNull(),
  generoIdoso: text('genero_idoso'),
  estadoConjugal: text('estado_conjugal'),
  doencas: jsonb('doencas').notNull(),
  doencaOutro: text('doenca_outro'),
  nivelOrientacao: text('nivel_orientacao'),
  mobilidade: text('mobilidade').notNull(),
  avaliacaoAbvd: jsonb('avaliacao_abvd').notNull(),
  avaliacaoAivd: jsonb('avaliacao_aivd').notNull(),
  medicacoes: text('medicacoes').notNull(),
  interdicao: boolean('interdicao').notNull().default(false),
  procuracao: boolean('procuracao').notNull().default(false),
  familiares: text('familiares'),
  fonteRenda: text('fonte_renda'),
  rendaMensalFaixa: text('renda_mensal_faixa'),
  rendaMensalOutro: text('renda_mensal_outro'),
  historicoLar: boolean('historico_lar').notNull().default(false),
  detalhesHistoricoLar: text('detalhes_historico_lar'),
  grauClassificacao: integer('grau_classificacao').notNull(),
  situacao: text('situacao').notNull().default('Esperando atendimento'),
  observacao: text('observacao'),
  usuarioAlteracao: text('usuario_alteracao'),
  dataAlteracao: timestamp('data_alteracao'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
