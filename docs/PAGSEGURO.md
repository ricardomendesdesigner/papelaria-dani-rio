# Como adicionar sua conta PagSeguro (Pague Seguro)

O site pode usar **PagSeguro** para receber pagamentos por cartão, PIX e boleto. Siga os passos abaixo.

---

## 1. Ter uma conta PagSeguro

- Acesse [pagseguro.uol.com.br](https://pagseguro.uol.com.br) e crie sua conta ou faça login.
- Complete o cadastro da loja (dados do negócio, conta bancária para receber).

---

## 2. Obter o Token de integração

### Ambiente de **teste** (Sandbox)

1. Acesse [sandbox.pagseguro.uol.com.br](https://sandbox.pagseguro.uol.com.br).
2. Entre em **Vendedor** → **Perfis de Integração**.
3. Copie o **e-mail** e o **token** de sandbox.

### Ambiente de **produção** (pagamentos reais)

1. Acesse [acesso.pagseguro.uol.com.br](https://acesso.pagseguro.uol.com.br).
2. Vá em **Integrações** → **Venda online**.
3. Clique em **Gerar Token**.
4. O **token** será exibido na tela e enviado por e-mail.  
   ⚠️ Ao gerar um novo token, o anterior deixa de funcionar.

---

## 3. Colocar as chaves no `.env`

No arquivo **`.env`** na raiz do projeto, adicione (ou edite) as linhas:

```env
# PagSeguro - use o mesmo e-mail da sua conta
PAGSEGURO_EMAIL="seu-email@exemplo.com"

# Token de produção (pagamentos reais) ou de sandbox (testes)
PAGSEGURO_TOKEN="seu_token_aqui"
```

- **Produção:** use o e-mail e o token da sua conta real (Integrações → Venda online).
- **Teste:** use o e-mail e o token do Sandbox.

Não compartilhe o `.env` nem suba esse arquivo no Git (ele já está no `.gitignore`).

---

## 4. O que o site faz com o PagSeguro

Com o e-mail e o token configurados, o cliente pode escolher **PagSeguro** no checkout. Ao finalizar:

1. O pedido é criado na loja.
2. O cliente é redirecionado para a **página de pagamento do PagSeguro**, onde pode pagar com:
   - Cartão de crédito ou débito
   - PIX
   - Boleto
3. Após o pagamento, o cliente volta para a página de sucesso do site.

**Testes (Sandbox):** Para usar o ambiente de testes do PagSeguro, adicione no `.env`:
```env
PAGSEGURO_SANDBOX="true"
```
(Use o e-mail e o token da sua conta **Sandbox** do PagSeguro.)

---

## 5. Resumo

| Onde        | O que colocar                          |
|------------|----------------------------------------|
| `.env`     | `PAGSEGURO_EMAIL` e `PAGSEGURO_TOKEN`  |
| Produção   | E-mail e token de “Integrações”       |
| Testes     | E-mail e token do Sandbox              |

Depois de salvar o `.env`, reinicie o servidor (`npm run dev`) para as variáveis serem carregadas.
