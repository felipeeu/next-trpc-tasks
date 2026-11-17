# Gerenciador de tarefas

Aplicação simples de produtividade desenvolvida para o case técnico da Artefact. O projeto permite criar, listar, editar e excluir tarefas usando Next.js 15, tRPC, React Query e validação com Zod.

O projeto foi iniciado com o boilerplate do [Create T3 App](https://create.t3.gg/) e adaptado para os requisitos do case.

## Funcionalidades

- listagem inicial renderizada no servidor (SSR);
- criação, edição e exclusão de tarefas;
- validação de título no frontend e no backend;
- feedback de carregamento, sucesso e erro;
- scroll infinito com páginas de 10 tarefas;
- armazenamento em memória, sem banco de dados.

Cada tarefa possui um UUID, título obrigatório, descrição opcional e data de criação. A edição preserva o identificador e a data originais.

## Tecnologias

- Next.js 15 com App Router;
- React 19;
- tRPC 11;
- TanStack React Query;
- Zod;
- Tailwind CSS;
- Bun.

## Como executar

É necessário ter o [Bun](https://bun.sh/) instalado.

```bash
bun install
bun run dev
```

A aplicação ficará disponível em `http://localhost:3000`.

Para validar o projeto:

```bash
bun test
bun run typecheck
bun run lint
bun run format:check
bun run build
```

Para executar o build de produção:

```bash
bun run build
bun run start
```

## Estrutura principal

- `src/server/api/routers/tasks.ts`: procedimentos tRPC e armazenamento das tarefas;
- `src/app/api/trpc/[trpc]/route.ts`: entrada HTTP do tRPC;
- `src/trpc/`: configuração do cliente, cache e hidratação;
- `src/app/page.tsx`: prefetch da primeira página no servidor;
- `src/app/_components/`: lista e formulários da interface;
- `src/server/api/routers/tasks.test.ts`: testes do router de tarefas.

## Decisões e limitações

O armazenamento em memória atende ao escopo do case e mantém a solução pequena. Como consequência:

- as tarefas são perdidas quando o servidor é reiniciado;
- processos ou instâncias diferentes não compartilham dados;
- não há controle de concorrência ou persistência durável.

O scroll infinito usa um cursor numérico que representa a posição no array. Essa abordagem é suficiente para o uso simples e com uma única instância proposto pelo case.

Após criar, editar ou excluir uma tarefa pela interface, as consultas de tarefas são invalidadas para que as páginas carregadas sejam buscadas novamente.

## Evolução técnica

O boilerplate utiliza `createTRPCReact`, fornecido pela integração clássica `@trpc/react-query`. Essa integração ainda funciona na versão atual do projeto, mas está oficialmente descontinuada: recebe apenas correções de bugs e deverá ser removida na próxima versão principal do tRPC.

Em uma evolução futura, o cliente deverá migrar para `@trpc/tanstack-react-query`, conforme a [documentação da integração clássica](https://trpc.io/docs/client/react) e o [guia oficial de migração](https://trpc.io/docs/client/tanstack-react-query/migrating). Essa atualização foi mantida fora do escopo do case para preservar a implementação simples e funcional solicitada, sem introduzir uma migração ampla que não é necessária para o funcionamento atual.
