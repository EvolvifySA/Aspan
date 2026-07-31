# Migracao dos formularios legados

O importador aceita somente a planilha original validada. Ele confere nomes de abas,
posicoes dos cabecalhos e a quantidade esperada de 968 registros antes de escrever no
banco. O arquivo XLSX permanece fora do Git e da imagem Docker.

## 1. Backup de producao

Antes da importacao, crie um backup do banco:

```bash
docker compose exec -T db pg_dump -U aspan -d aspan -Fc > aspan-antes-migracao.dump
```

## 2. Recriar o Forms

As migrations sao executadas automaticamente na inicializacao do servico:

```bash
docker compose build forms
docker compose up -d forms
docker compose logs --tail=100 forms
```

## 3. Copiar a planilha temporariamente

```bash
docker cp "Solicitacao de Vaga na ASPAN (respostas).xlsx" aspan-forms:/tmp/aspan-legado.xlsx
```

O nome local pode conter acentos; o destino no container foi simplificado para evitar
problemas de terminal.

## 4. Executar o dry-run

```bash
docker compose exec forms npm run migrate:legacy -- --file /tmp/aspan-legado.xlsx --dry-run
```

O resultado deve informar `totalRows: 968`. O relatorio mostra apenas contagens e
codigos de aviso, sem nomes, telefones ou dados medicos.

## 5. Aplicar a importacao

```bash
docker compose exec forms npm run migrate:legacy -- --file /tmp/aspan-legado.xlsx --apply
```

Guarde o `batchId` retornado. Executar novamente o mesmo arquivo e hash retorna
`alreadyImported: true` e nao cria duplicatas.

## 6. Conferencia e rollback

Os registros aparecem em `/admin/forms` com os badges Legado e Revisao. A tela
`/admin/forms/revisar-migracao` permite consultar a linha original e corrigir campos
ambiguos sem alterar a auditoria.

Para desfazer somente o lote importado:

```bash
docker compose exec forms npm run migrate:legacy -- --rollback SEU_BATCH_ID
```

O rollback remove as solicitacoes do lote e preserva a auditoria. Depois da operacao,
remova a copia temporaria da planilha do container.
