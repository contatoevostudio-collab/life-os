# Life OS

Life OS e um aplicativo web-first com cara de software desktop para organizar tarefas, calendario, foco e financeiro em uma unica experiencia. A base foi estruturada com Next.js, TypeScript, Tailwind CSS e Supabase, com deploy preparado para Vercel e arquitetura pensada para futura adaptacao com Tauri ou outro shell de macOS.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + Postgres
- Vercel para deploy

## Arquitetura

Decisao importante: a aplicacao foi separada entre `app`, `features`, `components`, `providers`, `lib` e `types` para manter UI, dominio e acesso a dados desacoplados. Isso facilita trocar o storage em memoria atual por Supabase real no curto prazo e por persistencia local/Tauri no futuro sem reescrever a interface.

Decisao importante: o app opera em `modo demo` quando as variaveis do Supabase nao estao definidas. Assim a interface e o fluxo do MVP continuam utilizaveis durante o setup inicial, mas a mesma estrutura de autenticacao e repositorios ja fica pronta para o ambiente real.

Decisao importante: o shell principal usa sidebar fixa, topbar persistente e modal de pomodoro para reforcar a sensacao de software desktop e preservar a tela "Hoje" como centro operacional.

## Estrutura de pastas

```text
src/
  app/
    (auth)/auth
    (workspace)/
  components/
    auth/
    layout/
    ui/
  config/
  features/
    calendar/
    dashboard/
    finance/
    focus/
    settings/
    tasks/
    today/
  lib/
    repositories/
    supabase/
  providers/
  types/
supabase/
  migrations/
```

## Modulos do MVP

- Hoje: tarefas prioritarias, proximos eventos, progresso diario e resumo financeiro
- Tarefas: lista, kanban, filtros e criacao rapida
- Calendario: visao diaria/semanal/mensal, eventos manuais e vinculo opcional com tarefas
- Pomodoro: modal na topbar com presets, modo manual e historico simples
- Financeiro: entradas, saidas e saldo mensal
- Dashboard: metricas simples alimentadas por dados reais do estado do app
- Configuracoes: tema, preferencias e padroes do pomodoro

## Setup local

### 1. Instale Node.js

Use Node.js 20 ou superior.

### 2. Instale dependencias

```bash
npm install
```

### 3. Configure ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

Variaveis esperadas:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Rode o app

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Setup do Supabase

### 1. Crie um projeto no Supabase

Ative email/password em Authentication.

### 2. Execute a migration inicial

Use o arquivo:

- `supabase/migrations/202604100001_initial_schema.sql`

Ele cria:

- `users`
- `projects`
- `tasks`
- `calendar_events`
- `focus_sessions`
- `financial_transactions`
- `user_preferences`

Tambem configura:

- enums de dominio
- indices essenciais
- RLS por usuario
- trigger para criar perfil e preferencias ao registrar um usuario

### 3. Cole as credenciais no `.env.local`

Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Deploy na Vercel

### 1. Suba o repositorio para GitHub

### 2. Importe o projeto na Vercel

Selecione o framework Next.js.

### 3. Configure as variaveis de ambiente

Adicione na Vercel as mesmas variaveis do `.env.local`.

### 4. Deploy

A Vercel vai gerar a URL publica automaticamente.

## Observacoes sobre o estado atual

- O projeto foi estruturado para funcionar visualmente mesmo sem Supabase, via modo demo.
- Os providers e repositorios ja deixam o caminho aberto para substituir o estado local por queries reais.
- Como o ambiente atual nao possui `node`, `npm` ou `pnpm`, esta entrega foi preparada em codigo, mas nao foi executada localmente nesta maquina.

## Proximos passos recomendados

1. Instalar Node.js e dependencias.
2. Conectar as actions/forms do estado em memoria aos repositorios Supabase.
3. Adicionar drag and drop no calendario e no kanban.
4. Criar persistencia completa do pomodoro e do dashboard com consultas reais.
