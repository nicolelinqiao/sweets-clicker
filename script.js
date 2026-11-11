const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const blank = {
  sweets: 0, totalClicks: 0, todayEarned: 0, bestStreak: 0, streak: 0,
  lastClick: 0, perClick: 1, perSecond: 0, activeSweet: 'lollipop', activeSkin: 'classic',
  upgrades: {}, effects: {}, collection: [], ownedSkins: ['classic'], activity: []
};

let state = { ...blank };
try {
  const saved = JSON.parse(localStorage.getItem('sweets-clicker-save'));
  if (saved) state = { ...blank, ...saved, upgrades: { ...saved.upgrades }, effects: { ...saved.effects }, collection: saved.collection || [], ownedSkins: saved.ownedSkins || ['classic'], activity: saved.activity || [] };
} catch (error) {}

let activeTab = 'sweets';
let soundOn = true;

const sweets = [
  ['lollipop', '🍭', 'Lollipop', 'A classic swirly clicker.', 0, 1],
  ['cake', '🍰', 'Strawberry Cake', 'Big slices mean big clicks.', 75, 3],
  ['donut', '🍩', 'Glazed Donut', 'A sugary ring with a chance to double your click.', 220, 6],
  ['icecream', '🍦', 'Ice Cream Cone', 'Chilly clicks add a bonus scoop every 8 clicks.', 550, 12],
  ['pudding', '🍮', 'Caramel Pudding', 'Silky smooth: passive sweets get a creamy boost.', 1200, 24],
  ['pie', '🥧', 'Moonberry Pie', 'The rarest slice. Every click rains extra sweets.', 3000, 50]
];

// id, emoji, name, description, sweet target, price, accent, wash, decorations
const skins = [
  ['classic', '🍭', 'Classic Swirl', 'A cheerful rainbow swirl.', 'lollipop', 0, '#ff78a8', '#fff0f6', '✦'],
  ['raspberry-tart', '🥧', 'Raspberry Tart', 'A ruby tart with raspberries and berry-themed decorations.', 'cake', 180, '#e85678', '#ffe3ea', '🍓🍓'],
  ['starlight-donut', '🍩', 'Starlight Donut', 'A galaxy-glazed ring sprinkled with tiny stars.', 'donut', 260, '#7568e8', '#e8e6ff', '✦✧★'],
  ['blueberry-cloud', '🍦', 'Blueberry Cloud', 'A fluffy blue scoop with blueberry confetti.', 'icecream', 340, '#71a8e8', '#e5f3ff', '🫐☁️'],
  ['caramel-cat', '🍮', 'Caramel Cat Pudding', 'A glossy pudding cup with an adorable caramel cat face.', 'pudding', 440, '#d7933d', '#fff1ce', '🐱'],
  ['lemon-meringue', '🥧', 'Lemon Meringue Star', 'A sunny pie topped with a twinkly lemon star.', 'pie', 560, '#e7b632', '#fff6bd', '🍋⭐'],
  ['minty-mochi', '🍩', 'Minty Mochi Ring', 'A cool mint ring dusted with soft mochi pearls.', 'donut', 700, '#55c9aa', '#dcfff3', '🌿'],
  ['choco-volcano', '🍰', 'Choco Volcano', 'A cake mountain with a lava drizzle eruption.', 'cake', 850, '#b7654e', '#ffe1d5', '🌋'],
  ['moon-milkshake', '🍦', 'Moon Milkshake', 'A dreamy midnight shake with a crescent topper.', 'icecream', 1050, '#5e74ca', '#e3e8ff', '🌙'],
  ['rainbow-pudding', '🍮', 'Rainbow Pudding', 'A wobbly rainbow cup with prism sprinkles.', 'pudding', 1300, '#e878b1', '#ffe7f4', '🌈'],
  ['peach-pie', '🥧', 'Peach Picnic Pie', 'A sunny picnic pie with peach slices and gingham cheer.', 'pie', 1600, '#f28f62', '#fff0d7', '🍑🧺']
];

const upgrades = [
  ['double', '🍓', 'Berry Gloves', 'Adds +1 sweet to every click.', 35, 'click', 1],
  ['auto', '🐰', 'Bunny Helper', 'Makes +1 sweet every second.', 75, 'auto', 1],
  ['combo', '🍰', 'Combo Cake', 'Adds +3 sweet to every click.', 160, 'click', 3],
  ['factory', '🏠', 'Mini Sweet Shop', 'Makes +5 sweets every second.', 400, 'auto', 5],
  ['rainbow', '🌈', 'Rainbow Mixer', 'Adds +10 click power and bonus sparkles.', 900, 'click', 10],
  ['cloud', '☁️', 'Sugar Cloud', 'Makes +20 sweets every second.', 2000, 'auto', 20]
];

const effects = [
  ['rush', '⚡', 'Sugar Rush', '2× sweets per click for 30 seconds.', 250, 30],
  ['lucky', '🍀', 'Lucky Sprinkle', 'Adds 2 bonus sweets every second for 45 seconds.', 600, 45],
  ['party', '🎉', 'Candy Party', 'Triples passive production for 60 seconds.', 1500, 60]
];

const milestones = [
  { at: 25, name: 'Tiny Taffy', icon: '🍬', reward: 25 }, { at: 100, name: 'Gummy Bear', icon: '🧸', reward: 100 },
  { at: 500, name: 'Cupcake Corner', icon: '🧁', reward: 250 }, { at: 1500, name: 'Donut Daydream', icon: '🍩', reward: 500 },
  { at: 5000, name: 'Rainbow Treat', icon: '🌈', reward: 1000 }
];

const collectionItems = [['🍭', 'Lollipop'], ['🍰', 'Strawberry Cake'], ['🍩', 'Glazed Donut'], ['🍦', 'Ice Cream Cone'], ['🍮', 'Caramel Pudding'], ['🥧', 'Moonberry Pie']];

function save() {
  localStorage.setItem('sweets-clicker-save', JSON.stringify(state));
  $('#saveStatus').textContent = '● saved';
  setTimeout(() => $('#saveStatus').textContent = '● autosave', 900);
}

function fmt(value) { return value >= 1e6 ? (value / 1e6).toFixed(1) + 'm' : value >= 1e3 ? (value / 1e3).toFixed(1) + 'k' : Math.floor(value).toLocaleString(); }
function cost(item) { return Math.floor(item[4] * Math.pow(1.65, state.upgrades[item[0]] || 0)); }
function addLog(icon, text) { state.activity.unshift({ icon, text }); state.activity = state.activity.slice(0, 7); }
function findSweet(id) { return sweets.find(item => item[0] === id) || sweets[0]; }
function findSkin(id) { return skins.find(item => item[0] === id) || skins[0]; }
function ownsSweet(item) { return item[4] === 0 || state.collection.includes(item[2]); }

function refreshClickPower() {
  const sweet = findSweet(state.activeSweet);
  state.perClick = sweet[5] + (state.upgrades.double || 0) + (state.upgrades.combo || 0) * 3 + (state.upgrades.rainbow || 0) * 10;
}

function checkMilestones() {
  milestones.forEach(milestone => {
    if (state.sweets >= milestone.at && !state.collection.includes(milestone.name)) {
      state.collection.push(milestone.name);
      state.sweets += milestone.reward;
      addLog(milestone.icon, `Milestone reached: ${milestone.name}! +${milestone.reward} bonus sweets.`);
      toast(milestone.icon + ' ' + milestone.name + ' unlocked!');
    }
  });
}

function render() {
  checkMilestones();
  refreshClickPower();
  const sweet = findSweet(state.activeSweet);
  const skin = findSkin(state.activeSkin);
  $('#candyButton .candy-emoji').textContent = skin[0] === 'classic' ? sweet[1] : skin[1];
  $('#candyButton').setAttribute('aria-label', 'Click the ' + skin[2] + ' to earn sweets');
  $('#skinLabel').textContent = skin[0] === 'classic' ? '' : '· ' + skin[2];
  $('#skinDecor').textContent = skin[8];
  const stage = $('.candy-stage');
  stage.dataset.skin = skin[0];
  stage.style.setProperty('--skin-accent', skin[6]);
  stage.style.setProperty('--skin-wash', skin[7]);
  $('#sweetCount').textContent = fmt(state.sweets); $('#perClick').textContent = '+' + fmt(state.perClick); $('#perSecond').textContent = '+' + fmt(state.perSecond);
  $('#bestStreak').textContent = state.bestStreak; $('#totalClicks').textContent = fmt(state.totalClicks); $('#todayEarned').textContent = fmt(state.todayEarned);
  $('#streakBadge').textContent = state.streak > 1 ? '🔥 ' + state.streak + ' combo' : '✨ ready';
  const level = Math.floor(state.totalClicks / 50) + 1; $('#levelText').textContent = 'Level ' + level; $('#levelHint').textContent = level < 3 ? 'little sugar bean' : level < 6 ? 'sprinkle scout' : 'sweet superstar';
  const goal = milestones.find(item => !state.collection.includes(item.name)) || milestones.at(-1); const previous = milestones[milestones.indexOf(goal) - 1]?.at || 0;
  const percent = Math.min(100, Math.max(0, (state.sweets - previous) / (goal.at - previous) * 100));
  $('#goalName').textContent = goal.name; $('#goalIcon').textContent = goal.icon; $('#goalProgress').style.width = percent + '%'; $('#goalText').textContent = fmt(Math.min(state.sweets, goal.at)) + ' / ' + fmt(goal.at) + ' sweets'; $('#goalReward').textContent = '+ ' + fmt(goal.reward) + ' ✨';
  $('#collectionCount').textContent = state.collection.filter(name => collectionItems.some(item => item[1] === name)).length + ' / 6';
  $('#collection').innerHTML = collectionItems.map(item => `<div class="collection-item ${state.collection.includes(item[1]) ? '' : 'locked'}">${item[0]}<small>${item[1]}</small></div>`).join('');
  $('#activity').innerHTML = (state.activity.length ? state.activity : [{ icon: '🍬', text: 'Click the candy to begin your sweet little journey!' }]).map(item => `<div class="activity-line"><span>${item.icon}</span><p>${item.text}</p></div>`).join('');
  renderShop();
}

function card(item, buttonText, disabled, badge = '', displayPrice = item[4]) {
  return `<article class="card shop-item"><div><div class="shop-top"><span class="shop-icon">${item[1]}</span>${badge ? `<span class="owned">${badge}</span>` : ''}</div><h3>${item[2]}</h3><p>${item[3]}</p></div><div class="buy-row"><span class="cost">${buttonText === 'Enjoying' ? 'sparkling!' : displayPrice + ' sweets'}</span><button class="buy-btn" data-id="${item[0]}" ${disabled ? 'disabled' : ''}>${buttonText}</button></div></article>`;
}

function renderShop() {
  if (activeTab === 'sweets') {
    $('#shopGrid').innerHTML = sweets.map(item => { const owned = ownsSweet(item); const selected = state.activeSweet === item[0]; return `<article class="card shop-item sweet-shop-item ${selected ? 'selected-sweet' : ''}"><div><div class="shop-top"><span class="shop-icon">${item[1]}</span>${selected ? '<span class="owned">SELECTED</span>' : owned ? '<span class="owned">OWNED</span>' : ''}</div><h3>${item[2]}</h3><p>${item[3]} <b>+${item[5]} base click power</b></p></div><div class="buy-row"><span class="cost">${owned ? 'ready' : item[4] + ' sweets'}</span><button class="buy-btn" data-id="${item[0]}" ${selected || (!owned && state.sweets < item[4]) ? 'disabled' : ''}>${selected ? 'Clicking it' : owned ? 'Select' : 'Buy sweet'}</button></div></article>`; }).join('');
  } else if (activeTab === 'skins') {
    $('#shopGrid').innerHTML = skins.map(skin => { const owned = state.ownedSkins.includes(skin[0]); const selected = state.activeSkin === skin[0]; return `<article class="card shop-item skin-shop-item ${selected ? 'selected-skin' : ''}" style="--card-accent:${skin[6]};--card-wash:${skin[7]}"><div><div class="shop-top"><span class="shop-icon">${skin[1]}</span>${selected ? '<span class="owned">WEARING</span>' : owned ? '<span class="owned">OWNED</span>' : ''}</div><h3>${skin[2]}</h3><p>${skin[3]} <b>for ${findSweet(skin[4])[2]}</b></p></div><div class="buy-row"><span class="cost">${owned ? 'ready' : skin[5] + ' sweets'}</span><button class="buy-btn" data-id="${skin[0]}" ${selected || (!owned && state.sweets < skin[5]) ? 'disabled' : ''}>${selected ? 'Wearing it' : owned ? 'Wear skin' : 'Buy skin'}</button></div></article>`; }).join('');
  } else {
    const list = activeTab === 'upgrades' ? upgrades : effects;
    $('#shopGrid').innerHTML = list.map(item => { const owned = state.upgrades[item[0]] || 0; const price = activeTab === 'upgrades' ? cost(item) : item[4]; const active = state.effects[item[0]] > Date.now() / 1000; return card(item, active ? 'Enjoying' : 'Get it!', active || state.sweets < price, active ? 'ACTIVE' : activeTab === 'upgrades' && owned ? `Lv. ${owned}` : '', price); }).join('');
  }
  $$('.buy-btn').forEach(button => button.onclick = () => buy(button.dataset.id));
}

function buy(id) {
  if (activeTab === 'sweets') {
    const item = sweets.find(entry => entry[0] === id); if (!ownsSweet(item)) { if (state.sweets < item[4]) return; state.sweets -= item[4]; state.collection.push(item[2]); addLog(item[1], `You bought ${item[2]}. It is ready to click!`); toast(item[1] + ' ' + item[2] + ' added to your sweet shelf!'); }
    state.activeSweet = id; render(); save(); return;
  }
  if (activeTab === 'skins') {
    const skin = findSkin(id); if (!state.ownedSkins.includes(id)) { if (state.sweets < skin[5]) return; state.sweets -= skin[5]; state.ownedSkins.push(id); const target = findSweet(skin[4]); if (!ownsSweet(target)) state.collection.push(target[2]); addLog(skin[1], `Unlocked the ${skin[2]} skin!`); toast(skin[1] + ' ' + skin[2] + ' unlocked!'); }
    state.activeSkin = id; state.activeSweet = skin[4]; render(); save(); return;
  }
  const list = activeTab === 'upgrades' ? upgrades : effects; const item = list.find(entry => entry[0] === id);
  if (activeTab === 'upgrades') { const price = cost(item); if (state.sweets < price) return; state.sweets -= price; state.upgrades[id] = (state.upgrades[id] || 0) + 1; if (item[5] === 'auto') state.perSecond += item[6]; addLog(item[1], `Unlocked ${item[2]}! Your sweets are working harder.`); toast(item[1] + ' ' + item[2] + ' unlocked!'); }
  else { if (state.sweets < item[4]) return; state.sweets -= item[4]; state.effects[id] = Date.now() / 1000 + item[5]; addLog(item[1], `${item[2]} is active for ${item[5]} seconds!`); toast(item[1] + ' ' + item[2] + ' activated!'); }
  render(); save();
}

function clickCandy() {
  const now = Date.now(); state.streak = now - state.lastClick < 1200 ? state.streak + 1 : 1; state.lastClick = now; state.bestStreak = Math.max(state.bestStreak, state.streak);
  let gain = state.perClick * (state.effects.rush > now / 1000 ? 2 : 1); if (state.activeSweet === 'donut' && Math.random() < .2) gain *= 2; if (state.activeSweet === 'icecream' && state.totalClicks % 8 === 7) gain += state.perClick * 2; if (state.activeSweet === 'pie') gain += 5; if (Math.random() < Math.min(.15, (state.upgrades.rainbow || 0) * .03)) gain += 10;
  state.sweets += gain; state.todayEarned += gain; state.totalClicks++; if (state.streak === 10) { state.sweets += 10; addLog('🔥', '10 click combo! +10 bonus sweets!'); toast('🔥 Sugar combo! +10'); } render(); save();
  if (soundOn) try { const audio = new AudioContext(); const oscillator = audio.createOscillator(); oscillator.frequency.value = 520; oscillator.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + .04); } catch (error) {}
}

function toast(text) { const element = $('#toast'); element.textContent = text; element.classList.add('show'); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => element.classList.remove('show'), 1800); }

$('#candyButton').onclick = clickCandy;
$$('.tab').forEach(button => button.onclick = () => { $$('.tab').forEach(item => item.classList.remove('active')); button.classList.add('active'); activeTab = button.dataset.tab; render(); });
$('#soundBtn').onclick = () => { soundOn = !soundOn; $('#soundBtn').classList.toggle('muted', !soundOn); };
$('#resetBtn').onclick = () => { if (confirm('Reset all your sweet progress?')) { localStorage.removeItem('sweets-clicker-save'); location.reload(); } };
setInterval(() => { const now = Date.now() / 1000; const gain = state.perSecond * (state.effects.party > now ? 3 : 1) + (state.effects.lucky > now ? 2 : 0); if (gain) { state.sweets += gain; state.todayEarned += gain; render(); } }, 1000);
setInterval(() => { save(); render(); }, 5000);
render();
