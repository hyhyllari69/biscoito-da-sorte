# 🥠 Biscoitô da Sorte

> Abra um biscoito, receba sua sorte. Os únicos cookies que a gente usa são os deliciosos. 🍪

**Biscoitô da Sorte** é um Progressive Web App (PWA) de biscoitos da sorte, feito com **HTML, CSS e JavaScript puro** — sem frameworks, sem build, 100% offline.

## ✨ Funcionalidades

- 🥠 Toque no biscoito para quebrar e revelar sua sorte do dia
- 🔢 Números da sorte gerados junto com cada frase
- ⭐ Guardar sorte favoritas numa coleção pessoal
- ↗️ Compartilhar a sorte (Web Share API, com fallback de copiar)
- 🍪 Contador de biscoitos abertos
- 🌙 Modo claro/escuro automático
- 💾 Persistência em `localStorage` (+ um `document.cookie` de easter egg)
- 📲 Instalável como aplicativo (PWA) e funcional **offline**

## 🧩 Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Estrutura | HTML5 semântico |
| Estilo | CSS3 Mobile First (paleta de padaria, animações, dark mode) |
| Lógica | JavaScript Vanilla (ES6+) |
| PWA | `manifest.json` + Service Worker (cache offline) |
| Ícones | Desenhados com Python/PIL (ver `icons/make_icons.py`) |

## 🚀 Como rodar localmente

O service worker exige `localhost` ou HTTPS:

```bash
cd biscoito
python3 -m http.server 8080
# abra http://localhost:8080
```

## 📲 Como instalar no celular

1. Acesse o app pelo navegador (Chrome no Android, Safari no iOS).
2. **Android**: toque em "📲 Instalar app" no cabeçalho, ou menu ⋮ → *Adicionar à tela inicial*.
3. **iOS**: botão *Compartilhar* → *Adicionar à Tela de Início*.
4. Pronto! O app abre em tela cheia, como um aplicativo nativo — até sem internet. 📡

## 🌍 Publicação (Render.com)

1. Faça push deste repositório para o GitHub.
2. No [Render](https://dashboard.render.com): **New +** → **Blueprint** → selecione este repositório → **Apply**.
3. O `render.yaml` cria automaticamente o site estático servindo a pasta `biscoito/`.

> 💡 O `render.yaml` também desabilita cache para `sw.js` e `manifest.json`, garantindo que atualizações cheguem nos celulares.

## 📁 Estrutura

```
biscoito-pwa/
└── biscoito/               # PWA — Static Site no Render
    ├── index.html          # página única do app
    ├── css/style.css       # tema quentinho, mobile first
    ├── js/app.js           # lógica das sortes, favoritos e instalação
    ├── js/sw.js            # service worker (offline)
    ├── manifest.json       # configuração do PWA
    └── icons/              # ícones 192/512 + maskable (make_icons.py)
```

---

Feito com 🧈 e 🍫 · Biscoitô PWA
