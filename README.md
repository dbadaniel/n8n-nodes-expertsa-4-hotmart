<p align="center">
  <img src="Exsa-azul.png" alt="Expertsa" width="220" />
</p>

<p align="center">
  <em>Soluções de Expert para Expert.</em>
</p>

---

# n8n-nodes-expertsa-4-hotmart

Este é o **community node definitivo** para integração com a [Hotmart](https://www.hotmart.com) no n8n. 

Projetado para atender tanto **infoprodutores individuais** quanto **agências e plataformas SaaS** que precisam escalar automações para múltiplas contas.

## 🚀 Por que este node é diferente?

Aqui você encontra coisas que fazem parte do meu dia a dia de infoprodutor e sei que pode servir para outros. A maioria das integrações são básicas, mas este node foi construído com problemas e necessidades do mundo real em mente:

### 1. 🔐 Autenticação Flexível (Game Changer)
O único node que suporta nativamente dois modos de operação:
- **Modo Pessoal (Credentials)**: Use as credenciais salvas no n8n. Perfeito para gerenciar sua **própria conta**.
- **Modo SaaS (Dynamic Token)**: Passe o `access_token` via expressão (JSON). Perfeito para **agências e softwares** que gerenciam centenas de contas de clientes sem precisar cadastrar credenciais manuais no n8n.

### 2. 🧠 Trigger Inteligente com Roteamento
Chega de workflows "spaghetti" cheios de `IF` nodes logo após o webhook. O **Hotmart Trigger** possui 3 modos de roteamento:
- **Flow Mode**: Separa eventos (Compra, Cancelamento, Reembolso) em **13 saídas diferentes**.
- **Super Flow**: Agrupa eventos por contexto de negócio (Ex: Saída "Nova Assinatura" vs "Renovação").
- **Auto-Parser**: Dados complexos e aninhados (`data.subscriber`, `data.product`, `data.plans`) são extraídos e limpos automaticamente para o primeiro nível do JSON.

### 3. ⚡ Cobertura Completa da API (REST & Webhook 2.0)
Não apenas o básico. Acesso completo a:
- Vendas e Reembolsos
- Assinaturas (com cancelamento e reativação em lote)
- Área de Membros (Hotmart Club)
- Produtos e Ofertas
- Eventos e Ingressos (New!)
- Negociação de Parcelas

### 4. 🤖 Otimizado para AI Agents (v1.1.1)
- **Metadados de Paginação**: Ative a opção "Incluir Metadados de Paginação" para receber `_metadata` com `has_more`, `page_token` e `items_returned` - perfeito para agentes de IA que precisam navegar por grandes volumes de dados.
- **Rate Limit Inteligente**: Retry automático com backoff exponencial (1s → 2s → 4s) quando a API da Hotmart retorna erro 429.
- **Mensagens de Erro Melhoradas**: Orientações claras quando ocorrem erros de rate limit.

---

## ⚙️ Modos de Autenticação

### Opção A: Modo Pessoal (Credentials)
Ideal para automações internas de um produtor.
1. Crie uma credencial **Hotmart API** no n8n.
2. Preencha Client ID, Client Secret e Token Basic.
3. O node gerencia o refresh do token automaticamente.

### Opção B: Modo SaaS / Agência (Dynamic)
Ideal para criar produtos em cima do n8n (White-label, Dashboards, Gestores).
1. Use o node para trocar o código de autorização do seu cliente por um token.
2. Nas operações seguintes, selecione **Authentication: Access Token**.
3. Passe o token dinamicamente: `{{ $json.access_token }}`.

---

## 📡 Hotmart Trigger: O Poder do Flow

O Trigger é capaz de processar e categorizar automaticamente os webhooks da Hotmart.

### Modos de Operação

| Modo | Descrição | Saídas |
|------|-----------|--------|
| **Standard** | Comportamento padrão. Uma saída única. | 1 |
| **Flow** | Cria uma saída separada para cada tipo de evento técnico. | 13 |
| **Super Flow** | Cria saídas baseadas na **lógica de negócio**. Ex: Separa automaticamente uma "Compra Aprovada" que é *Recorrência* de uma que é *Primeira Venda*. | 6 |

### Parseamento Automático
O node detecta o tipo de evento e já extrai os campos vitais para a raiz do JSON, facilitando o uso nos próximos nodes:
- `subscriber`: Dados do assinante
- `affiliates`: Lista de afiliados comissionados
- `commissions`: Valores de comissão detalhados
- `plans` / `plan`: Dados do plano de assinatura
- `offer`: Dados da oferta e cupom
- `checkout_country`: País de compra
- `user`: Dados do aluno (para eventos do Club)

### 🎨 Personalização Avançada

O node permite personalização total da interface e comportamento do webhook:

- **Path Customizado**: Altere a URL do webhook para algo mais amigável (ex: `/minha-loja` ao invés de `/webhook`).
- **Renomeação de Saídas**: Ative a opção **"Personalizar Nomes das Saídas"** para dar nomes específicos às portas de saída (ex: mudar de `Compra Única` para `Ebook`). Isso ajuda a manter o workflow visualmente organizado e semântico para sua equipe.

---

## 📚 Recursos Disponíveis

Abaixo a lista completa de operações suportadas:

### 💰 Vendas
- **Listar Vendas**: Histórico completo com filtros avançados (data, status, produto, afiliação).
- **Resumo**: Totais e métricas consolidadas.
- **Participantes**: Dados detalhados de compradores.
- **Comissões**: Relatório financeiro de comissões.
- **Preços**: Detalhes da oferta adquirida.
- **Reembolso**: Executar reembolso total ou parcial.

### 🔄 Assinaturas
- **Gestão Completa**: Listar, Resumo e Compras de uma assinatura.
- **Ações**: Cancelar e Reativar assinaturas (Individual ou em Lote).
- **Cobrança**: Alterar data de vencimento da fatura.

### 🎓 Área de Membros (Club)
- **Alunos**: Listar alunos, progresso e status.
- **Conteúdo**: Listar módulos e páginas do curso.

### 📦 Produtos & Ofertas
- **Produtos**: Listar todos os produtos da conta.
- **Ofertas**: Listar preços e ofertas ativas.
- **Planos**: Listar planos de assinatura disponíveis.

### 🎟️ Eventos (Ingressos)
- **Info**: Detalhes do evento.
- **Participantes**: Lista de check-ins e ingressos vendidos (com filtros de QR Code, Lote, etc).

### 🏷️ Marketing & Recuperação
- **Cupons**: Criar, listar e remover cupons de desconto.
- **Negociação**: Gerar links de negociação (PIX/Boleto) para parcelas em atraso.

### 🔐 Autenticação
- **Obter Token**: Troca de credenciais por Access Token (útil para fluxos OAuth).

---

## 🛠️ Instalação

Siga o [guia de instalação](https://docs.n8n.io/integrations/community-nodes/installation/) na documentação de community nodes do n8n.

### Via Interface (Recomendado)
1. No seu n8n, vá em **Settings > Community Nodes**
2. Clique em **Install a community node**
3. No campo de busca, digite: `n8n-nodes-expertsa-4-hotmart`
4. Marque a caixa confirmando os termos e clique em **Install**

### Via Terminal / Docker (NPM)
Para instâncias locais ou baseadas em Docker (instalado no diretório do n8n):
```bash
npm install n8n-nodes-expertsa-4-hotmart
```

---

## 🚀 Conheça também: Expertsa Groups

Você gerencia grupos de WhatsApp para seus lançamentos, turmas e comunidades de alunos?

Conheça o **Expertsa Groups** — o sistema definitivo de gerenciamento e automação de grupos de WhatsApp, desenvolvido de expert para expert para escalar a sua operação de infoprodutos com tranquilidade e controle total.

> 📲 Quer saber mais e otimizar a gestão dos seus grupos? Entre em contato pelo e-mail [expertsa.oficial@gmail.com](mailto:expertsa.oficial@gmail.com).

---

## ☕ Apoie o Projeto

Este node é mantido com dedicação por quem vive os desafios reais de grandes operações digitais. Se ele economizou horas do seu trabalho ou permitiu que você ganhasse dinheiro automatizando processos, considere apoiar:

**Chave Pix:** `expertsa.oficial@gmail.com`

Qualquer valor ajuda a manter as atualizações constantes e a paridade com a API oficial da Hotmart! 💜

---

## Licença

[MIT](LICENSE.md)
