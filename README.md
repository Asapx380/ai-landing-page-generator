# Forja AI — Gerador de Landing Pages

Do briefing ao primeiro rascunho em segundos.

O Forja AI é uma aplicação web que gera landing pages completas (HTML + CSS) em tempo real a partir de uma breve descrição do negócio e público-alvo, utilizando a API da Groq Cloud.

[Acesse a versão ao vivo do Forja AI](https://forjaai.netlify.app/)

---

## Tecnologias Utilizadas

- Front-end: JavaScript (ES6+), HTML5, CSS3 (Glassmorphism & Dark Mode)
- Back-end / Serverless: Netlify Functions (Node.js)
- AI / LLM: Groq Cloud API (modelo `openai/gpt-oss-120b`)
- Hospedagem e Deploy: Netlify

---

## Funcionalidades

- Geração Ultrarrápida: Respostas geradas em poucos segundos utilizando a infraestrutura da Groq Cloud.
- Prévia ao Vivo: Visualização imediata do site gerado com edição de código HTML/CSS lado a lado.
- Cópia em 1 Clique: Exportação rápida do código gerado para uso direto em novos projetos.
- Segurança em Ambiente Serverless: Chave da API protegida no lado do servidor via Netlify Functions.

---

## Como Funciona a Arquitetura

1. O usuário preenche os detalhes do negócio no formulário do front-end.
2. O front-end envia uma requisição POST para `/.netlify/functions/gerar`. A função está em `netlify/functions/gerar.js`.
3. A função serverless chama a API da Groq utilizando a chave de API armazenada de forma segura nas variáveis de ambiente.
4. O HTML e o CSS retornados pela IA são renderizados dinamicamente no painel de prévia.

---

## Estrutura do Projeto

```text
.
├── index.html              # Interface principal do gerador
├── netlify.toml            # Configuração de build da Netlify
├── css/
│   └── style.css           # Estilos e temas (Dark Mode / Glassmorphism)
├── js/
│   └── scripts.js          # Lógica do front-end e manipulação do DOM
└── netlify/
    └── functions/
        └── gerar.js        # Serverless Function com integração da Groq API
```

---

## Execução Local

### Pré-requisitos
- Node.js instalado
- Netlify CLI (`npm install -g netlify-cli`)

### Passo a passo

1. Clone o repositório:
   ```bash
   git clone https://github.com/Asapx380/ai-landing-page-generator.git
   cd ai-landing-page-generator
   ```

2. Configure a variável de ambiente:
   Crie um arquivo `.env` na raiz do projeto contendo a sua chave de API da Groq:
   ```env
   GROQ_API_KEY=sua_chave_aqui
   ```

3. Inicie o ambiente de desenvolvimento local:
   ```bash
   netlify dev
   ```
