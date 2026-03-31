# Papelaria Dani Rio 🩷

Site completo para a **Papelaria Dani Rio** com sistema de vendas, impressão, agendamento e painel administrativo.

## Tecnologias

- **Next.js 15** - Framework React com App Router
- **Prisma** - ORM para banco de dados SQLite
- **Tailwind CSS** - Estilização com tema rosa/branco
- **TypeScript** - Tipagem estática
- **Node.js** - Runtime do servidor

## Funcionalidades

- **Página Inicial** - Banner rotativo com destaques dos serviços
- **Loja de Papelaria** - Catálogo com busca, filtros e carrinho
- **Loja de Brinquedos** - Catálogo dedicado a brinquedos
- **Impressão de Arquivos** - Upload de arquivos com configuração de impressão
- **Agendamento de Identidade** - Sistema de agendamento de RG, fotos 3x4, etc.
- **Carrinho e Checkout** - Sistema de pagamento com PIX, cartão e dinheiro
- **WhatsApp Integrado** - Botão flutuante para conversa direta
- **Painel Administrativo** - Dashboard com controle total:
  - Gestão de produtos (CRUD completo)
  - Controle de vendas e pedidos
  - Gerenciamento de agendamentos
  - Controle de impressões
  - **Sistema de Caixa** - Movimentações financeiras com filtros

## Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar banco de dados e inserir dados iniciais
npm run setup

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

## Configuração

Edite o arquivo `.env` para personalizar:

```env
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="........"
WHATSAPP_NUMBER="5521999999999"
NEXT_PUBLIC_WHATSAPP_NUMBER="5521999999999"
```

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Iniciar em produção |
| `npm run db:studio` | Abrir Prisma Studio (visualizar banco) |
| `npm run db:seed` | Recarregar dados de exemplo |
| `npm run setup` | Setup completo do banco |
