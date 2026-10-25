# UNDERCOVER WHEELMAN: FOUR CITIES

Demo jogável com múltiplos carros, pista e física de pneus Rapier.  
Pronto para **GitHub Pages**.

## Estrutura de arquivos (dividida)

```
src/
├── main.ts                  # loop principal, câmera, HUD
├── vehicles/
│   ├── presets.ts           # definições dos 4 carros
│   └── car.ts               # criação + sync visual do veículo
├── track/
│   └── track.ts             # barreiras, rampas, obstáculos
└── systems/
    └── input.ts             # teclado
```

## Controles
- **W/S** ou setas — acelerar / ré
- **A/D** ou setas — direção
- **Espaço** — freio de mão (reduz grip traseiro)
- **C** — trocar de carro

## Desenvolvimento local
```bash
npm install
npm run dev
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex: `wheelman-four-cities`).
2. Ajuste o `base` em `vite.config.ts` se o nome do repositório for diferente:
   ```ts
   base: '/seu-repo-name/',
   ```
   (Use `base: '/'` apenas se for o repositório `username.github.io`.)
3. Faça push para a branch `main`:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU_USER/wheelman-four-cities.git
   git push -u origin main
   ```
4. No repositório do GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
5. O workflow `.github/workflows/deploy.yml` irá buildar e publicar automaticamente.

Após o deploy, o jogo ficará disponível em:
`https://SEU_USER.github.io/wheelman-four-cities/`

## Build manual (opcional)
```bash
npm run build
npm run preview
```
