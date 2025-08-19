---

# README

## Descrição do Projeto

Este projeto de TCC é uma aplicação full-stack que interage com a API do Mercado Livre para gerenciar categorias de produtos. Possui:

* **Back-end**: Node.js + Express, com conexão ao MongoDB.
* **Front-end**: React (Next.js), permitindo login via OAuth do Mercado Livre, atualização e consulta de categorias.

---

## Pré-requisitos

Antes de iniciar, você precisará:

* Docker e Docker Compose instalados.
* Conta no **Mercado Livre** para gerar as credenciais da API.
* MongoDB acessível (pode ser local ou via container).

---

## Configuração das Variáveis de Ambiente

O projeto utiliza variáveis de ambiente para conectar à API do Mercado Livre e ao MongoDB. Crie um arquivo `.env` no diretório `back-end` com base no arquivo `.env.example`:

```env
ML_APP_ID=seu_app_id
ML_APP_SECRET=seu_app_secret
ML_REDIRECT_URL=https://httpbin.org/get
ML_ACCESS_TOKEN_URL=
MONGO_URI=mongodb://usuario:senha@host:porta/nome_do_banco
```

### Como obter as variáveis do Mercado Livre

1. Acesse [Mercado Libre Developers](https://developers.mercadolibre.com.ar/pt_br/autenticacao-e-autorizacao).
2. Crie um **aplicativo** na sua conta.
3. Anote:

   * `APP_ID` → `ML_APP_ID`
   * `APP_SECRET` → `ML_APP_SECRET`
4. Configure o **Redirect URL** como `http://localhost:3001/auth/callback`.
5. O `ML_ACCESS_TOKEN_URL` é padrão: `https://api.mercadolibre.com/oauth/token`.

> Observação: o fluxo OAuth gera um **código de autorização** que você precisará colar no front-end para obter o token de acesso.

---

## Rodando o Projeto com Docker

O projeto já inclui `Dockerfile` para back-end e front-end, e um `docker-compose.yml`. Para iniciar:

```bash
docker-compose up --build
```

Isso irá:

* Subir o back-end na porta `3001`.
* Subir o front-end na porta `3000`.
* Conectar ao MongoDB (dependendo da configuração no `docker-compose.yml`).

---

## Fluxo de Autenticação

1. Ao iniciar o back-end, será exibido no terminal um link de autenticação do Mercado Livre.
2. Abra o link no navegador e faça login.
3. Copie o **código de autorização** fornecido pelo Mercado Livre.
4. No front-end, cole o código no campo de login e clique em **Logar**.
5. O token de acesso será salvo automaticamente em `tokens.json`.

---

## Endpoints Principais do Back-end

* `GET /categories` → Lista todas as categorias.
* `PUT /refresh-categories` → Atualiza e insere categorias e subcategorias.
* `POST /auth/callback` → Recebe o código de autorização e salva o token.
* `DELETE /categories` → Deleta todas as categorias.
* `DELETE /children-categories` → Deleta todas as subcategorias.

---

## Funcionalidades do Front-end

* Autenticação via código do Mercado Livre.
* Botão para atualizar categorias.
* Botão para buscar categorias cadastradas.
* Visualização de categorias e subcategorias em lista.

---

## Observações

* As categorias são salvas em duas coleções no MongoDB: `categories` e `children_categories`.
* Certifique-se de que o MongoDB esteja acessível pelo Docker ou substitua a URI por uma local.

