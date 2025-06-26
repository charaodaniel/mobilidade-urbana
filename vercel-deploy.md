# Deploy na Vercel via GitHub

## Passo a Passo Completo

### 1. Preparar o Repositório GitHub

1. **Criar repositório no GitHub:**
   - Acesse [github.com](https://github.com)
   - Clique em "New repository"
   - Nome: `mobiurban-sistema`
   - Descrição: `Sistema de Mobilidade Urbana - React + Supabase`
   - Público ou Privado (sua escolha)
   - Clique em "Create repository"

2. **Conectar repositório local:**
   ```bash
   git remote add origin https://github.com/[SEU_USUARIO]/mobiurban-sistema.git
   git branch -M main
   git push -u origin main
   ```

### 2. Deploy na Vercel

1. **Acessar Vercel:**
   - Vá para [vercel.com](https://vercel.com)
   - Clique em "Sign up" ou "Log in"
   - Conecte com sua conta GitHub

2. **Importar Projeto:**
   - No dashboard da Vercel, clique em "New Project"
   - Selecione "Import Git Repository"
   - Encontre o repositório `mobiurban-sistema`
   - Clique em "Import"

3. **Configurar Deploy:**
   - **Framework Preset:** Vite (detectado automaticamente)
   - **Root Directory:** `./` (padrão)
   - **Build Command:** `pnpm run build` (ou `npm run build`)
   - **Output Directory:** `dist` (padrão do Vite)
   - **Install Command:** `pnpm install` (ou `npm install`)

4. **Configurar Variáveis de Ambiente:**
   - Na seção "Environment Variables", adicione:
     ```
     VITE_SUPABASE_URL = https://[seu-projeto].supabase.co
     VITE_SUPABASE_ANON_KEY = [sua-chave-publica]
     ```
   - Clique em "Add" para cada variável

5. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build e deploy (2-3 minutos)
   - Sua aplicação estará disponível em: `https://[nome-do-projeto].vercel.app`

### 3. Configurações Adicionais

#### Domínio Personalizado (Opcional)

1. Na dashboard do projeto na Vercel
2. Vá para "Settings" > "Domains"
3. Adicione seu domínio personalizado
4. Configure DNS conforme instruções

#### Configurações de Build

Se necessário, crie um arquivo `vercel.json` na raiz:

```json
{
  "framework": "vite",
  "buildCommand": "pnpm run build",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install",
  "outputDirectory": "dist"
}
```

#### Redirects e Rewrites

Para SPA (Single Page Application), adicione no `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 4. Deploy Automático

Após a configuração inicial:

1. **Commits automáticos:**
   - Todo push para `main` fará deploy automático
   - Branches criam preview deployments

2. **Preview Deployments:**
   - Pull Requests geram URLs de preview
   - Teste antes de fazer merge

### 5. Monitoramento

#### Analytics (Opcional)

1. Na Vercel, vá para "Analytics"
2. Habilite Web Analytics
3. Adicione o script no `index.html` se necessário

#### Logs e Debugging

1. **Function Logs:** Para debugging de edge functions
2. **Build Logs:** Para erros de build
3. **Runtime Logs:** Para erros em produção

### 6. Configuração do Supabase para Produção

No Supabase Dashboard:

1. **Authentication Settings:**
   - Site URL: `https://[seu-app].vercel.app`
   - Redirect URLs: `https://[seu-app].vercel.app/auth/callback`

2. **CORS Settings:**
   - Adicione o domínio da Vercel nas configurações de CORS

### 7. Comandos Úteis

```bash
# Deploy manual via CLI
npx vercel --prod

# Preview deployment
npx vercel

# Ver logs
npx vercel logs [deployment-url]

# Listar deployments
npx vercel ls
```

### 8. Troubleshooting

#### Erro de Build

```bash
# Limpar cache e reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm run build
```

#### Variáveis de Ambiente

- Certifique-se que começam com `VITE_`
- Não incluir aspas nos valores
- Redeploy após mudanças

#### Problemas de Rota

- Adicionar rewrites no `vercel.json`
- Verificar configuração do React Router

### 9. Performance

#### Otimizações Automáticas

- Compressão Gzip/Brotli
- CDN global
- Image optimization
- Edge caching

#### Métricas

- Core Web Vitals
- Lighthouse scores
- Real User Monitoring

### 10. Segurança

#### Headers de Segurança

Adicione no `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Resultado Final

Após seguir estes passos, você terá:

- ✅ Aplicação rodando em produção na Vercel
- ✅ Deploy automático a cada commit
- ✅ HTTPS habilitado automaticamente
- ✅ CDN global para performance
- ✅ Preview deployments para PRs
- ✅ Monitoramento e analytics

**URL de exemplo:** `https://mobiurban-sistema.vercel.app`

## Próximos Passos

1. Configurar domínio personalizado
2. Habilitar analytics
3. Configurar monitoring de erros
4. Implementar CI/CD avançado
5. Configurar staging environment

