# Contexto do projeto — Metáforas Terapêuticas em Vídeo

Este documento existe para dar contexto a qualquer agente de IA (Codex, Claude
Code, etc.) que continue este projeto sem ter participado das conversas
anteriores. Leia isto antes de mexer no código.

## O que é o projeto

Área de membros + funil de vendas para o produto "Metáforas Terapêuticas em
Vídeo": uma biblioteca de vídeos verticais (9:16) de metáforas terapêuticas
que terapeutas usam em sessão ou compartilham com clientes via WhatsApp.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind CSS v4.
- **Supabase** (Postgres + Auth + Storage) como backend.
- Hospedagem: ainda **não publicado** (roda só local via `npm run dev`).

⚠️ Next.js 16 tem mudanças de nomenclatura em relação a versões anteriores
que modelos de IA costumam "saber de cor" incorretamente — por exemplo,
`middleware.ts` virou **`proxy.ts`** (exporta `proxy`, não `middleware`).
Antes de escrever código, vale checar `node_modules/next/dist/docs/` para
confirmar convenções atuais em vez de confiar em memória de treinamento.

## Supabase — projeto e credenciais

- Projeto: `felnqjxquaruggzfkjnn` (região `sa-east-1`, São Paulo), dentro da
  organização `medeirosecom-debug's Org`. **Esse projeto Supabase é
  compartilhado com outras coisas do Kenneth** (existem tabelas
  `pesquisa_997_respostas` e `leads_kenneth` que não têm relação com este
  projeto — nunca mexer nelas).
- Variáveis de ambiente ficam em `.env.local` (gitignored, nunca commitado):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (chave anon/publishable — segura
    para expor no client)
  - `NEXT_PUBLIC_LINK_VENDAS` — link da página de vendas usado na mensagem de
    compartilhamento do WhatsApp
  - `NEXT_PUBLIC_VSL_URL` — URL do vídeo de vendas (VSL) da página Início.
    **Ainda vazio (placeholder)** — quando tiver o vídeo, só preencher.
  - `NEXT_PUBLIC_CHECKOUT_URL` — link de checkout (Kirvano ou outro) da
    página de Pagamento. **Ainda vazio (placeholder)**.
- **Não existe service role key configurada** no projeto — de propósito.
  Toda operação privilegiada (signup de comprador, updates administrativos)
  é feita com a chave publishable + RLS (Row Level Security), nunca com
  bypass de RLS. Ver seção "Autenticação" abaixo para entender como isso
  funciona sem a service role key.

## Estrutura de dados (Postgres)

- `public.categorias` — `id, nome, ordem`. As "dores principais" (ex: "Medo
  de se abrir", "Luto e perdas"). 10 categorias hoje.
- `public.metaforas` — cada vídeo/metáfora:
  - `titulo, slug, video_url, thumb_url, resumo, descricao, categoria_id,
    dores (text[]), status ('liberado'|'em_breve'), destaque (bool),
    publicado (bool), ordem, created_at, updated_at`.
  - `video_url`, `thumb_url`, `resumo`, `descricao` são **nullable** — itens
    `em_breve` normalmente não têm vídeo nem descrição ainda.
  - Hoje: 50 linhas (10 `liberado` com vídeo real, 40 `em_breve` só com
    título, sem vídeo — títulos gerados para preencher a biblioteca
    visualmente antes de ter os vídeos reais).
- `public.members` — `id (= auth.users.id), email, acesso_pago (bool),
  created_at`. Define quem é comprador pagante (ver "Funil de vendas").

RLS habilitada em tudo. Resumo das políticas:
- `categorias`, `metaforas`: leitura pública (`anon`) só de `publicado =
  true`; leitura completa para `authenticated`; escrita restrita ao
  `auth.uid()` do admin (hardcoded no SQL das políticas — é um único admin,
  não um sistema de roles genérico).
- `members`: cada usuário autenticado só lê a própria linha
  (`auth.uid() = id`); admin lê/escreve tudo.
- Storage (`videos`, `thumbs` buckets): leitura pública, upload/update/delete
  só pelo `auth.uid()` do admin.

O UUID do admin está hardcoded nas políticas RLS (não é uma env var). Para
descobrir/trocar, consultar `auth.users` no Supabase.

## Autenticação — dois sistemas separados

1. **Admin (Kenneth)** — `/admin/login`. Único usuário, conta criada
   manualmente. Protegido por `src/proxy.ts` (redireciona `/admin/*` para
   `/admin/login` se não autenticado) + checagem no layout
   `src/app/admin/(protected)/layout.tsx`.
2. **Membros (compradores)** — `/login`. Cada comprador tem sua própria
   conta Supabase Auth + uma linha em `public.members` com
   `acesso_pago = true`.

**Como o admin cria acesso de um comprador sem perder a própria sessão:**
em `src/app/admin/(protected)/membros/actions.ts`, a função
`criarAcessoComprador` usa um client Supabase **isolado, sem cookies**
(`createClient` de `@supabase/supabase-js` puro, com `persistSession:
false`) só para chamar `auth.signUp()` — isso cria o usuário sem afetar a
sessão do admin logado no navegador (que usa o client cookie-based de
`@supabase/ssr`). Depois disso, insere a linha em `members` usando o client
normal (autenticado como admin). Esse é o motivo de não precisar de service
role key: o signup usa a chave pública normal, e a criação do usuário nunca
mexe nos cookies da sessão do admin.

Confirmação de e-mail está **desativada** no projeto (contas ficam
confirmadas automaticamente no signup) — testado e confirmado.

## Funil de vendas ("isDemo")

A mesma URL serve dois modos, decidido pela sessão (não é mais uma flag
manual):

```
isDemo = true  → visitante não-logado OU logado sem acesso_pago=true em members
isDemo = false → logado com uma linha em members onde acesso_pago = true
```

Resolvido em `src/lib/access.ts` (`getAccessState()`, memoizado por request
via `cache()` do React).

Rotas dentro do grupo `src/app/(membros)/` (layout com menu lateral em
`Sidebar.tsx`):
- `/` — Início: oferta/checkout principal, com carrossel de prévia das
  metáforas, seção de embasamento teórico e CTA para checkout.
- `/metaforas` — biblioteca em fileiras horizontais (estilo Netflix,
  **sem** modo grade — foi removido a pedido do Kenneth). Card `liberado`
  tem ícone de play; card `em_breve` tem cadeado. Em modo demo, apenas
  "Guarda-chuva aberto" abre o player; os demais abrem o modal de conversão
  para `/#oferta`. Em modo entrega, `liberado` abre o modal de vídeo,
  `em_breve` fica inerte (não faz nada).
- `/gerador` — fluxo de 3 etapas. Botão final redireciona pro `/#oferta`
  em modo demo; em modo entrega mostra "em breve" (**não é funcional de
  verdade ainda** — foi decisão explícita adiar isso, ver "Pendências").
- `/login` — login do comprador.

## Painel admin (`/admin`)

- `/admin` — lista de metáforas (título, categoria, status, publicado,
  ordem), criar/editar/excluir.
- `/admin/novo`, `/admin/[id]/editar` — formulário (`MetaforaForm.tsx`):
  upload de vídeo (`VideoUploadField.tsx` → bucket `videos`), upload de capa
  (`ThumbUploadField.tsx` → bucket `thumbs`, opcional — sem capa, usa o
  primeiro frame do vídeo ou um placeholder com cadeado), status
  liberado/em_breve, categoria (com opção de criar nova inline), dores,
  destaque, publicado, ordem.
- `/admin/membros` — criar acesso de comprador (e-mail + senha) manualmente
  após confirmar pagamento fora do sistema; revogar acesso.

## Design

Área pública: fundo `#0a0a0a` com grid de pontos sutil (`.bg-dots` em
`globals.css`), tipografia Playfair Display itálico (títulos) + Inter
(corpo), cards com glassmorphism (`.glass-card`), paleta dourada (`gold`,
`gold-light`, `gold-hover` — tokens Tailwind definidos em `@theme` no
`globals.css`). Admin ficou fora desse redesign (visual simples/funcional,
zinc + teal) — decisão explícita para priorizar tempo.

## Pendências conhecidas (decisões explícitas de adiar, não esquecimento)

1. **Gerador de Metáforas não é funcional** — só a UI/fluxo existe. Falta
   definir o que ele de fato gera antes de implementar a lógica real.
2. **Provisionamento de comprador é manual** — sem integração com gateway de
   pagamento (Kirvano ou outro). Se decidir automatizar, vai precisar de um
   endpoint de webhook + validação de assinatura do gateway.
3. **`VSL_URL` não está mais em uso na navegação principal** — a antiga página
   de VSL foi substituída pela oferta na rota `/`. `CHECKOUT_URL` aponta para
   o checkout Kirvano atual.
4. **40 metáforas "em_breve" sem vídeo real** — títulos gerados para
   preencher a biblioteca; falta gravar/upar os vídeos e trocar o status
   para `liberado` pelo painel admin.
5. Sobrou um arquivo de teste órfão (~1.7MB) no bucket `videos` do Supabase
   Storage de um teste de upload — inofensivo, mas pode ser limpo pela
   dashboard do Supabase se incomodar.
6. **Projeto nunca foi publicado** (sem deploy no Vercel ainda).

## Coisas para NÃO fazer sem confirmar com o Kenneth

- Não mexer nas tabelas `pesquisa_997_respostas` e `leads_kenneth` (não são
  deste projeto).
- Não trocar as políticas de RLS para usar service role key sem necessidade
  real — o desen