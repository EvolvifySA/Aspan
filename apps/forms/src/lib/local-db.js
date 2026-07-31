const STORAGE_KEY = 'aspan_forms_solicitacoes';

const seedSolicitacoes = [
  {
    id: 'demo-1',
    nome_solicitante: 'Maria Souza',
    email_solicitante: 'maria.souza@email.com',
    telefone_contato: '(11) 98888-1111',
    nome_idoso: 'Joao Souza',
    idade_idoso: 84,
    cidade: 'Sao Paulo',
    estado: 'SP',
    mobilidade: 'Com ajuda',
    doencas: ['Hipertensao', 'Diabetes'],
    situacao: 'Esperando atendimento',
    grau_classificacao: 2,
    observacao: 'Aguardando entrevista inicial',
    usuario_alteracao: 'Sistema local',
    created_date: '2026-07-10T10:30:00.000Z',
    data_alteracao: '2026-07-10T10:30:00.000Z',
  },
  {
    id: 'demo-2',
    nome_solicitante: 'Ana Pereira',
    email_solicitante: 'ana.pereira@email.com',
    telefone_contato: '(21) 97777-2222',
    nome_idoso: 'Tereza Pereira',
    idade_idoso: 91,
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    mobilidade: 'Acamado',
    doencas: ['Alzheimer'],
    situacao: 'Observacoes / Avaliar',
    grau_classificacao: 3,
    observacao: 'Caso prioritario para analise',
    usuario_alteracao: 'Sistema local',
    created_date: '2026-07-12T14:15:00.000Z',
    data_alteracao: '2026-07-12T14:15:00.000Z',
  },
  {
    id: 'demo-3',
    nome_solicitante: 'Carlos Lima',
    email_solicitante: 'carlos.lima@email.com',
    telefone_contato: '(31) 96666-3333',
    nome_idoso: 'Pedro Lima',
    idade_idoso: 76,
    cidade: 'Belo Horizonte',
    estado: 'MG',
    mobilidade: 'Sozinho',
    doencas: ['Artrite'],
    situacao: 'Admissao',
    grau_classificacao: 1,
    observacao: 'Vaga liberada',
    usuario_alteracao: 'Sistema local',
    created_date: '2026-07-13T09:00:00.000Z',
    data_alteracao: '2026-07-13T09:00:00.000Z',
  },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `sol_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getBrowserStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

function ensureSeedData() {
  const storage = getBrowserStorage();
  if (!storage) {
    return clone(seedSolicitacoes);
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    storage.setItem(STORAGE_KEY, JSON.stringify(seedSolicitacoes));
    return clone(seedSolicitacoes);
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : clone(seedSolicitacoes);
  } catch {
    storage.setItem(STORAGE_KEY, JSON.stringify(seedSolicitacoes));
    return clone(seedSolicitacoes);
  }
}

function saveSolicitacoes(solicitacoes) {
  const storage = getBrowserStorage();
  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(solicitacoes));
  }

  return solicitacoes;
}

export function getSolicitacoes() {
  return ensureSeedData().map((item) => ({ ...item }));
}

export function createSolicitacao(payload) {
  const now = new Date().toISOString();
  const solicitacao = {
    id: createId(),
    nome_solicitante: payload.nome_solicitante || '',
    email_solicitante: payload.email_solicitante || '',
    telefone_contato: payload.telefone_contato || '',
    nome_idoso: payload.nome_idoso || '',
    idade_idoso: Number(payload.idade_idoso) || 0,
    cidade: payload.cidade || '',
    estado: payload.estado || '',
    mobilidade: payload.mobilidade || '',
    doencas: Array.isArray(payload.doencas) ? payload.doencas : [],
    situacao: payload.situacao || 'Esperando atendimento',
    grau_classificacao: Number(payload.grau_classificacao) || 1,
    observacao: payload.observacao || '',
    usuario_alteracao: payload.usuario_alteracao || 'Local',
    created_date: now,
    data_alteracao: now,
  };

  const solicitacoes = [...getSolicitacoes(), solicitacao];
  saveSolicitacoes(solicitacoes);
  return { ...solicitacao };
}

export function updateSolicitacao(id, updates) {
  const now = new Date().toISOString();
  let updatedRecord = null;

  const solicitacoes = getSolicitacoes().map((item) => {
    if (item.id !== id) {
      return item;
    }

    updatedRecord = {
      ...item,
      ...updates,
      idade_idoso: updates.idade_idoso != null ? Number(updates.idade_idoso) : item.idade_idoso,
      grau_classificacao:
        updates.grau_classificacao != null ? Number(updates.grau_classificacao) : item.grau_classificacao,
      doencas: Array.isArray(updates.doencas) ? updates.doencas : item.doencas,
      data_alteracao: now,
      usuario_alteracao: updates.usuario_alteracao || item.usuario_alteracao || 'Local',
    };

    return updatedRecord;
  });

  saveSolicitacoes(solicitacoes);
  return updatedRecord;
}

export function resetSolicitacoes() {
  saveSolicitacoes(clone(seedSolicitacoes));
  return getSolicitacoes();
}
