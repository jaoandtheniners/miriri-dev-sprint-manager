# SGM Sprint Manager — Guia de Deploy

## Pré-requisitos
- Node.js 18+ instalado → https://nodejs.org
- Conta gratuita no GitHub → https://github.com
- Conta gratuita no Supabase → https://supabase.com
- Conta gratuita na Vercel → https://vercel.com (faça login com o GitHub)

---

## PASSO 1 — Configurar o Supabase

1. Acesse https://supabase.com e clique em **New project**
2. Escolha um nome (ex: `sgm-sprint`) e uma senha forte para o banco
3. Aguarde a criação do projeto (~1 min)
4. No menu lateral, clique em **SQL Editor**
5. Clique em **New query**, cole todo o conteúdo do arquivo `supabase_schema.sql` e clique em **Run**
   - Isso cria as tabelas, índices e já insere os dados históricos da planilha de vocês
6. Vá em **Settings → API** e copie:
   - **Project URL** (ex: `https://xyzabc.supabase.co`)
   - **anon public key** (começa com `eyJ...`)

---

## PASSO 2 — Configurar o projeto localmente

```bash
# Abra o terminal na pasta do projeto
cd sgm-sprint-manager

# Instale as dependências
npm install

# Crie o arquivo de variáveis de ambiente
cp .env.local.example .env.local
```

Abra o arquivo `.env.local` e preencha com os dados do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

Teste localmente:

```bash
npm run dev
# Acesse http://localhost:3000
```

---

## PASSO 3 — Subir para o GitHub

```bash
# Dentro da pasta do projeto, inicialize o repositório
git init
git add .
git commit -m "feat: SGM Sprint Manager inicial"

# Crie um repositório no GitHub (pode ser privado)
# Em https://github.com/new → nome: sgm-sprint-manager → Create repository

# Conecte e suba o código
git remote add origin https://github.com/SEU_USUARIO/sgm-sprint-manager.git
git branch -M main
git push -u origin main
```

---

## PASSO 4 — Deploy na Vercel

1. Acesse https://vercel.com e clique em **Add New → Project**
2. Clique em **Import** no repositório `sgm-sprint-manager`
3. Na tela de configuração, clique em **Environment Variables** e adicione:

| Nome | Valor |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://SEU_PROJETO.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sua_anon_key_aqui` |

4. Clique em **Deploy** e aguarde (~2 min)
5. A Vercel vai te fornecer uma URL como `https://sgm-sprint-manager.vercel.app`

**Pronto! O site está no ar.**

---

## PASSO 5 — Domínio customizado (opcional)

Se quiser usar um domínio próprio (ex: `sprint.suaempresa.com.br`):

1. No painel da Vercel, vá em **Settings → Domains**
2. Adicione o seu domínio e siga as instruções de configuração DNS

---

## Atualizações futuras

Toda vez que fizer um `git push` para o GitHub, a Vercel vai detectar automaticamente e refazer o deploy. Não precisa fazer nada extra.

```bash
# Fluxo de atualização
git add .
git commit -m "feat: descrição da mudança"
git push
# Deploy automático em ~1 min
```

---

## Estrutura do projeto

```
sgm-sprint-manager/
├── src/
│   ├── app/
│   │   ├── dashboard/page.tsx   ← Dashboard com métricas
│   │   ├── kanban/page.tsx      ← Board kanban com drag & drop
│   │   ├── backlog/page.tsx     ← Backlog com filtros e busca
│   │   ├── report/page.tsx      ← Report semanal e relatório final
│   │   └── historico/page.tsx   ← Histórico de sprints
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx      ← Menu lateral
│   │   │   └── AppShell.tsx     ← Shell geral do app
│   │   └── ui/
│   │       └── Badge.tsx        ← Badges de tipo, status, prioridade
│   ├── lib/
│   │   └── supabase.ts          ← Cliente Supabase
│   └── types/
│       └── index.ts             ← Tipos TypeScript
├── supabase_schema.sql          ← Schema completo do banco
├── .env.local.example           ← Template das variáveis de ambiente
└── DEPLOY.md                    ← Este guia
```

---

## Solução de problemas comuns

**Erro: `supabase URL is required`**
→ Verifique se o `.env.local` existe e tem as duas variáveis preenchidas

**Dados não aparecem no site**
→ Verifique se executou o `supabase_schema.sql` no SQL Editor do Supabase

**Build falha na Vercel**
→ Certifique-se de que as Environment Variables foram adicionadas no painel da Vercel

**Kanban não salva ao arrastar**
→ Verifique no Supabase → Table Editor se a tabela `tasks` existe e tem dados
