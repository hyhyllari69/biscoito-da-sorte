/* ============================================================
   Biscoitô da Sorte — lógica do app 🥠
   Sortes, favoritos e contadores em localStorage
   (+ document.cookie, pra manter a tradição dos cookies 😉)
   ============================================================ */
'use strict';

/* ---------- Frases da sorte ---------- */
const FORTUNES = [
  'Uma surpresa doce está a caminho. 🍬',
  'Grandes ideias nascem de pequenas pausas para o café. ☕',
  'Hoje é dia de dizer sim para algo novo.',
  'A sorte favorece quem tenta. Vai lá!',
  'Alguém te admira mais do que você imagina. 💛',
  'Sua persistência vai pagar os juros certos.',
  'Solte o que pesa. Fica só o que brilha. ✨',
  'Uma mensagem boa vai chegar quando você menos esperar.',
  'O próximo passo é menor do que parece. Dá conta!',
  'A vida tá crocante hoje. Aproveite cada mordida. 🥠',
  'Seja o açúcar no café de alguém hoje. 🍯',
  'O que você procura também está te procurando.',
  'Confie no seu tempo. Nada bom cresce com pressa. 🌱',
  'Uma porta se fecha, mas o cheiro do biscoito continua. 🍪',
  'Sua criatividade está em modo forno pré-aquecido. 🔥',
  'Ria de si mesmo com carinho. Cura mais que repouso.',
  'Um plano antigo vai dar frutos maduros. 🍑',
  'Diga o que sente. O mundo precisa da sua versão.',
  'Sorte é preparação encontrando oportunidade (e você tá prontx).',
  'Hoje, escolha o caminho que te faz sorrir. 😊',
  'Você é alguém lugar seguro para alguém. Saiba disso.',
  'A resposta que você espera já está a caminho. Chega hoje ou amanhã. 📬',
  'Faça a coisa assustadora. Depois agradeça. 💪',
  'MenosPRESSÃO, mais pressência.',
  'Um abraço apertado resolve mais que mil conselhos. 🤗',
  'Guarde este dia na memória. Ele é especial.',
  'Sua intuição tá afiada como faca de padeiro. 🔪',
  'Receba elogios sem desviar. Só um "obrigado" basta.',
  'O segredo está em começar antes de se sentir pronto.',
  'Alguém vai te pedir ajuda e você vai brilhar. 💡',
  'Descanse. Até a massa descansa antes de assar. 😴',
  'Aproxime-se de quem te faz crescer. Longe do que te enrola.',
  'Você está exatamente onde precisava estar. Respira.',
  'Uma conquista antiga vai ser finalmente reconhecida. 🏆',
  'Dance hoje. Mesmo sem música. Mesmo sem motivo. 💃',
  'Cuidado com o que você pede: vem por inteiro. 🎁',
  'Seu esforço silencioso está sendo visto. Confia.',
  'Acorde com o pensamento que você quer virar realidade. 🌅',
  'Um doce inesperado vai aparecer no seu caminho. 🍫',
  'Você atrai o que boceja... ops, o que sonha. Sonhe grande! 🌟',
];

/* ---------- Referências ---------- */
const $ = (sel) => document.querySelector(sel);
const cookieBtn = $('#cookie');
const cookieSvg = $('#cookie-svg');
const fortuneCard = $('#fortune-card');
const fortuneText = $('#fortune-text');
const fortuneNums = $('#fortune-nums');
const btnSave = $('#btn-save');
const btnShare = $('#btn-share');
const btnAgain = $('#btn-again');
const btnInstall = $('#btn-install');
const counterEl = $('#counter');
const savedList = $('#saved-list');
const emptySaved = $('#empty-saved');
const savedCount = $('#saved-count');
const toast = $('#toast');

/* ---------- Persistência ---------- */
const STORE = {
  get saved() {
    try { return JSON.parse(localStorage.getItem('biscoito:saved')) ?? []; }
    catch { return []; }
  },
  set saved(list) { localStorage.setItem('biscoito:saved', JSON.stringify(list)); },

  get count() { return Number(localStorage.getItem('biscoito:count') ?? 0); },
  set count(n) { localStorage.setItem('biscoito:count', String(n)); },

  get last() { return localStorage.getItem('biscoito:last') ?? ''; },
  set last(text) {
    localStorage.setItem('biscoito:last', text);
    // 🍪 easter egg: um cookie de navegador de verdade, de brinde
    document.cookie = `biscoito_last=${encodeURIComponent(text.slice(0, 80))};max-age=31536000;path=/;samesite=strict`;
  },
};

/* ---------- Estado ---------- */
let currentFortune = null;
let deferredPrompt = null;

/* ---------- Utilidades ---------- */
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.hidden = true; }, 2200);
}

function luckyNumbers() {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 60) + 1)
    .map((n) => String(n).padStart(2, '0'))
    .join(' · ');
}

function randomFortune() {
  let text;
  do { text = FORTUNES[Math.floor(Math.random() * FORTUNES.length)]; }
  while (FORTUNES.length > 1 && text === currentFortune);
  return text;
}

/* ---------- Som de crunch (WebAudio, sem assets) ---------- */
let audioCtx = null;
function playCrunch() {
  try {
    audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const dur = 0.22;
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * dur, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const decay = 1 - i / data.length;
      data[i] = (Math.random() * 2 - 1) * decay * decay;
    }

    const src = audioCtx.createBufferSource();
    src.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1400;

    const gain = audioCtx.createGain();
    gain.gain.value = 0.25;

    src.connect(filter).connect(gain).connect(audioCtx.destination);
    src.start();
  } catch { /* áudio é bônus, nunca bloca */ }
}

/* ---------- Migalhas flutuantes de fundo ---------- */
function spawnCrumbs() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const stage = $('#crumbs');
  const emojis = ['🍪', '🥠', '·', '🍪', '·'];
  for (let i = 0; i < 12; i++) {
    const c = document.createElement('span');
    c.className = 'crumb';
    c.textContent = emojis[i % emojis.length];
    c.style.left = `${Math.random() * 100}vw`;
    c.style.setProperty('--size', `${8 + Math.random() * 14}px`);
    c.style.setProperty('--dur', `${12 + Math.random() * 14}s`);
    c.style.setProperty('--delay', `${-Math.random() * 20}s`);
    c.style.setProperty('--drift', `${(Math.random() - 0.5) * 90}px`);
    stage.appendChild(c);
  }
}

/* ---------- Abrir o biscoito ---------- */
function openCookie() {
  if (cookieBtn.classList.contains('is-cracking')) return;

  // reseta para o estado inteiro
  cookieBtn.classList.remove('is-open');
  cookieBtn.classList.add('is-whole');
  void cookieSvg.offsetWidth; // força reflow p/ reiniciar animações
  fortuneCard.hidden = true;
  cookieBtn.classList.add('is-cracking');
  playCrunch();

  setTimeout(() => {
    cookieBtn.classList.remove('is-cracking');
    cookieBtn.classList.add('is-open');

    currentFortune = randomFortune();
    STORE.last = currentFortune;
    STORE.count += 1;

    fortuneText.textContent = currentFortune;
    fortuneNums.textContent = `números da sorte: ${luckyNumbers()}`;
    updateSaveButton();
    updateCounter();
    fortuneCard.hidden = false;
  }, 520);
}

/* ---------- Guardar favoritas ---------- */
function updateSaveButton() {
  const isSaved = currentFortune && STORE.saved.some((f) => f.text === currentFortune);
  btnSave.classList.toggle('saved-state', !!isSaved);
  btnSave.textContent = isSaved ? '💖 Guardada' : '⭐ Guardar';
}

function toggleSave() {
  if (!currentFortune) return;
  const list = STORE.saved;
  const i = list.findIndex((f) => f.text === currentFortune);

  if (i >= 0) {
    list.splice(i, 1);
    showToast('Removida dos guardados 🗑️');
  } else {
    list.unshift({ text: currentFortune, at: Date.now() });
    showToast('Sorte guardada! ⭐');
  }

  STORE.saved = list;
  updateSaveButton();
  renderSaved();
}

/* ---------- Aba Guardados ---------- */
function renderSaved() {
  const list = STORE.saved;
  savedList.innerHTML = '';
  emptySaved.style.display = list.length ? 'none' : 'block';
  savedCount.hidden = list.length === 0;
  savedCount.textContent = list.length;

  for (const f of list) {
    const li = document.createElement('li');
    li.className = 'saved-item';

    const p = document.createElement('p');
    p.textContent = f.text;

    const time = document.createElement('time');
    time.textContent = new Date(f.at).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
    p.appendChild(time);

    const del = document.createElement('button');
    del.className = 'btn-delete';
    del.setAttribute('aria-label', 'Remover sorte');
    del.textContent = '🗑️';
    del.addEventListener('click', () => {
      STORE.saved = STORE.saved.filter((x) => x.text !== f.text);
      renderSaved();
      updateSaveButton();
    });

    li.append(p, del);
    savedList.appendChild(li);
  }
}

function updateCounter() {
  const n = STORE.count;
  counterEl.hidden = n === 0;
  counterEl.textContent = `🍪 × ${n} · forno sempre ligado! 🔥`;
}

/* ---------- Compartilhar ---------- */
async function share() {
  if (!currentFortune) return;
  const payload = {
    title: 'Biscoitô da Sorte 🥠',
    text: `${currentFortune}\n\n— aberto no Biscoitô da Sorte 🥠`,
  };
  try {
    if (navigator.share) {
      await navigator.share(payload);
    } else {
      await navigator.clipboard.writeText(payload.text);
      showToast('Sorte copiada! Cola aí 📋');
    }
  } catch { /* usuário cancelou */ }
}

/* ---------- Abas ---------- */
function switchTab(which) {
  const isCookie = which === 'cookie';
  $('#tab-cookie').classList.toggle('active', isCookie);
  $('#tab-saved').classList.toggle('active', !isCookie);
  $('#tab-cookie').setAttribute('aria-selected', String(isCookie));
  $('#tab-saved').setAttribute('aria-selected', String(!isCookie));
  $('#view-cookie').classList.toggle('active', isCookie);
  $('#view-saved').classList.toggle('active', !isCookie);
  if (!isCookie) renderSaved();
}

/* ---------- Instalação PWA ---------- */
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  btnInstall.hidden = false;
});

btnInstall.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  btnInstall.hidden = true;
});

window.addEventListener('appinstalled', () => {
  btnInstall.hidden = true;
  showToast('Biscoitô instalado! 🎉');
});

/* ---------- Eventos ---------- */
cookieBtn.addEventListener('click', openCookie);
btnAgain.addEventListener('click', openCookie);
btnSave.addEventListener('click', toggleSave);
btnShare.addEventListener('click', share);
$('#tab-cookie').addEventListener('click', () => switchTab('cookie'));
$('#tab-saved').addEventListener('click', () => switchTab('saved'));

/* ---------- Inicialização ---------- */
spawnCrumbs();
renderSaved();
updateCounter();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('js/sw.js').catch(() => {});
  });
}
