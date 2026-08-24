# Publicação da VG

## Site público

O site React/Vite pode ser publicado no Netlify usando o `netlify.toml` da raiz:

- Build: `pnpm --filter @workspace/vg-marketing run build`
- Publish directory: `artifacts/vg-marketing/dist/public`
- `BASE_PATH`: `/`
- O redirect para `/index.html` mantém as rotas do React funcionando.

Configure no ambiente do Netlify:

- `VITE_SITE_URL`: URL pública do site
- `VITE_API_URL`: URL pública da API, quando ela estiver em um domínio separado
- `VITE_CLERK_PUBLISHABLE_KEY`: chave pública do ambiente de produção do Clerk
- `VITE_CLERK_PROXY_URL`: valor de proxy preenchido pelo ambiente de publicação do Clerk, quando aplicável

## API e banco

O Netlify hospeda o frontend estático. O `api-server` Express e o PostgreSQL devem continuar em um ambiente de backend separado, como o deployment da API neste workspace ou outro servidor Node.

Configure nesse ambiente:

- `DATABASE_URL`: conexão do PostgreSQL
- `CLERK_SECRET_KEY`: chave secreta do Clerk
- `CLERK_PUBLISHABLE_KEY`: chave pública usada pelo middleware
- `CORS_ORIGIN`: domínio do site publicado, por exemplo `https://seu-dominio.com`

O navegador envia os leads para `POST /api/leads`. A API salva o lead em `leads` e cria os registros iniciais em `lead_activities`. A área `/admin` consulta a mesma API e exige uma sessão autenticada.

## Banco de dados

As tabelas são definidas em `lib/db/src/schema/index.ts`. Para provisionar ou atualizar um banco de desenvolvimento:

```bash
pnpm --filter @workspace/db run push
```

Antes do primeiro uso em produção, configure `DATABASE_URL` para o banco de produção e aplique o schema com uma janela de mudança controlada. Não coloque `DATABASE_URL` nem `CLERK_SECRET_KEY` no frontend, no Git ou no arquivo `netlify.toml`.

## Acesso empresarial

O login usa o Clerk com e-mail e senha. O ambiente de desenvolvimento e o ambiente publicado têm usuários separados. Crie o primeiro usuário no Auth pane do workspace para desenvolvimento e repita o cadastro/configuração no ambiente de produção antes de liberar o CRM.