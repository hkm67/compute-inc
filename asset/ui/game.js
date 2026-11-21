'use strict';

(() => {
  const $ = id => document.getElementById(id);
  const catalog = ComputeAssets.landmarks;
  const cityById = new Map(catalog.map(site => [site.id, site]));
  const whole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
  const milestones = [
    [100, 'The intern has been joined by the entire HR department.'],
    [1000, 'Office pizza party cancelled. Nobody has a mouth.'],
    [10000, 'Experts insist AI will create new jobs. Experts currently employed.'],
    [50000, 'Retraining programme recommends becoming an AI retraining instructor.'],
    [90000, 'Human Resources renamed Remaining Human Resources.']
  ];
  const sheet = $('sheet');
  const action = $('action');
  const playbackRates = [1, 2, 5, 10];
  const querySeed = new URLSearchParams(location.search).get('seed');
  function freshState() { return Game.createState({ seed: querySeed === null ? undefined : Number(querySeed) }); }
  let state = freshState();
  let previousPhase = state.phase;
  const incidents = {
    protestors: ['Protestors', 'Customer feedback successfully suppressed.'],
    regulators: ['Regulators', 'Investigation buried in paperwork.'],
    corporate: ['Cheaper clone', 'Competition acquired. Innovation postponed.'],
    power: ['Power shortage', 'City lights off. Datacentre back on.']
  };
  let lastIncident = null;
  let protestCity = null;
  let rivalCity = null;
  const acquisitions = new Set();
  let view = 'globe', selected = 'paris', panel, opener, centerOnReturn = false;
  let lastFrame, lastPaint = 0, toastUntil = 0, milestoneIndex = 0, displayedWin = false;

  function number(value) {
    const format = value < 1e6 ? whole : compact;
    return format.format(Math.floor(value));
  }
  function cash(value) { return '$' + number(value); }
  function time(value) { return Math.floor(value / 60) + ':' + String(Math.floor(value) % 60).padStart(2, '0'); }
  function text(element, value) { if (element.textContent !== value) element.textContent = value; }
  function changeIcon(button, name) { button.querySelector('use').setAttribute('href', '#' + name); }

  const precise = value => value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  function rateCash(gameRate) {
    const value = gameRate * state.playbackRate;
    return '$' + (value >= 1000 ? compact.format(value) : precise(value));
  }
  const jobRate = gameRate => precise(gameRate * state.playbackRate);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let nextPayout = 0;
  function pulse(element) {
    element.classList.remove('action-pulse');
    void element.offsetWidth;
    element.classList.add('action-pulse');
  }
  // Attach the receipt to what changed. A fresh action at that spot replaces the old receipt.
  function impact(anchor, message, kind) {
    const host = $('game');
    const box = anchor.getBoundingClientRect();
    const node = document.createElement('span');
    node.className = 'impact impact-' + kind;
    node.setAttribute('aria-hidden', 'true');
    node.textContent = message;
    node.style.left = Math.min(innerWidth - 70, Math.max(70, box.left + box.width / 2)) + 'px';
    node.style.top = Math.max(85, Math.min(innerHeight - 85, box.top)) + 'px';
    host.querySelector('.impact-' + kind)?.remove();
    host.append(node);
    setTimeout(() => node.remove(), 1600);
  }

  function announce(message) {
    text($('headline'), message);
    text($('toast'), message);
    $('toast').hidden = sheet.open;
    toastUntil = performance.now() + 3200;
  }
  function clearWorldFeedback() {
    $('game').querySelectorAll('.impact,.payout-note').forEach(node => node.remove());
  }
  function showPayout(now, earned) {
    if (view !== 'city' || sheet.open || now < nextPayout || reducedMotion.matches ||
        earned <= 0 || !state.sites[selected]?.jobs || state.phase !== 'running') return;
    nextPayout = now + 3400;
    const rack = $('capacity-flag').getBoundingClientRect();
    const till = $('money').getBoundingClientRect();
    const x = rack.left + rack.width / 2, y = rack.top;
    if (x < 0 || x > innerWidth || y < 0 || y > innerHeight) return;
    const note = document.createElement('span');
    note.className = 'payout-note';
    note.setAttribute('aria-hidden', 'true');
    note.style.left = x + 'px';
    note.style.top = y + 'px';
    $('game').append(note);
    const dx = till.left + 10 - x, dy = till.bottom - y;
    const flight = note.animate([
      { transform: 'translate(-50%,0) rotate(-12deg)', opacity: 0 },
      { transform: 'translate(-50%,-18px) rotate(-6deg)', opacity: 1, offset: .22 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.65)', opacity: .85 }
    ], { duration: 760, easing: 'ease-in' });
    flight.onfinish = () => note.remove();
  }
  function selectCity(id) {
    selected = id;
    text($('city-flag'), cityById.get(id).city);
    $('city-flag').setAttribute('aria-label', 'Enter ' + cityById.get(id).city);
    if (view === 'globe' && state.phase === 'running') text($('action-label'), 'Enter ' + cityById.get(id).city);
  }
  const scene = createGameScene({ canvas: $('scene'), stage: $('stage'),
    cityFlag: $('city-flag'), capacityFlag: $('capacity-flag'), onEnter: enterCity, onSelect: selectCity });

  function changeView(mode) {
    clearWorldFeedback();
    view = mode;
    $('game').dataset.view = mode;
    $('game').dataset.city = selected;
    const city = mode === 'city';
    changeIcon($('navigate'), city ? 'world' : 'index');
    text($('navigate').querySelector('span'), city ? 'Globe' : 'Cities');
    changeIcon(action, city ? 'rack' : 'pin');
    $('action-detail').hidden = !city;
    $('scene').setAttribute('aria-label', city
      ? cityById.get(selected).city + ' district. Pinch or use plus and minus to zoom.'
      : 'World globe. Drag or use the arrow keys to spin. Press Enter to visit the selected city.');
    $('toast').hidden = true;
  }
  function enterCity(id, fromIndex = false) {
    if (sheet.open) sheet.close();
    centerOnReturn = fromIndex;
    selectCity(id);
    changeView('city');
    scene.showCity(id, state.sites[id]?.halls ?? 0);
    render();
    $('navigate').focus({ preventScroll: true });
  }
  function showGlobe() {
    changeView('globe');
    selectCity(selected);
    scene.showGlobe(selected, centerOnReturn, state.sites);
    centerOnReturn = false;
    render();
  }

  for (const { id, city, title } of catalog) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.city = id;
    const label = document.createElement('span');
    const name = document.createElement('strong');
    name.textContent = city;
    const landmark = document.createElement('small');
    landmark.textContent = title;
    label.append(name, landmark);
    const arrow = document.createElement('span');
    arrow.className = 'city-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '›';
    button.append(label, arrow);
    li.append(button);
    $('cities').append(li);
  }
  function openPanel(name) {
    clearWorldFeedback();
    if (!sheet.open) opener = document.activeElement;
    panel = name;
    sheet.dataset.panel = name;
    $('upgrade-result').hidden = true;
    endHold();
    if (name === 'markets') renderMarkets();
    const titles = {
      cities: 'Cities', upgrades: 'Upgrades', victory: 'Humanity: unsubscribed.',
      markets: state.phase === 'start' ? 'Choose a starting country' : 'Expand into a new market',
      incident: incidents[state.incident?.type]?.[0]
    };
    for (const key of Object.keys(titles)) $(key + '-panel').hidden = key !== name;
    text($('sheet-title'), titles[name]);
    $('dismiss').hidden = name === 'victory';
    if (!sheet.open) sheet.showModal();
    sheet.scrollTop = 0;
    $('toast').hidden = true;
    (name === 'victory' ? $('restart') : $('dismiss')).focus();
  }
  $('dismiss').addEventListener('click', () => sheet.close());
  sheet.addEventListener('cancel', event => { if (state.won) event.preventDefault(); });
  sheet.addEventListener('click', event => {
    if (event.target !== sheet || state.won) return;
    const box = sheet.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) sheet.close();
  });
  sheet.addEventListener('close', () => {
    if (sheet.open) return;
    endHold();
    panel = null;
    if (document.activeElement === document.body && opener?.isConnected) opener.focus({ preventScroll: true });
  });
  $('cities').addEventListener('click', event => {
    const button = event.target.closest('button[data-city]');
    if (button) enterCity(button.dataset.city, true);
  });
  $('navigate').addEventListener('click', () => view === 'city' ? showGlobe() : openPanel('cities'));
  $('upgrades').addEventListener('click', () => { openPanel('upgrades'); render(); });
  $('city-flag').addEventListener('click', () => enterCity(selected));

  function purchase(type) {
    const previousCapacity = Game.capacity(state);
    const oldSpeed = Game.speed(state, true), oldPayout = Game.earnings(state);
    const oldLimit = Game.capabilities[state.capability].limit;
    if (!Game.purchase(state, type, selected)) return;
    const messages = {
      capacity: 'More servers. Fewer colleagues.',
      speed: 'Your replacement has skipped the onboarding.',
      income: 'We have monetised the monetisation.',
      capability: Game.capabilities[state.capability].joke
    };
    pulse($('money'));
    if (type === 'capacity') {
      scene.showCity(selected, state.sites[selected].halls, true);
      impact($('capacity-flag'), '+' + number(Game.capacity(state) - previousCapacity) + ' slots', 'build');
      pulse($('capacity'));
    } else {
      scene.setOperations(state.levels.speed, state.capability);
      if (type === 'capability' && view === 'city') scene.showCity(selected, state.sites[selected]?.halls ?? 0);
      const result = $('upgrade-result');
      const button = $('upgrades-panel').querySelector('[data-upgrade="' + type + '"]');
      if (type === 'capability' && !Game.capabilities[state.capability + 1]) $('workbench').after(result);
      else button.after(result);
      const delta = type === 'speed' ? jobRate(oldSpeed) + ' → ' + jobRate(Game.speed(state, true)) + ' jobs/sec'
        : type === 'income' ? '$' + precise(oldPayout) + ' → $' + precise(Game.earnings(state)) + ' base/job'
        : number(oldLimit) + ' → ' + number(Game.capabilities[state.capability].limit) + ' eligible jobs';
      result.textContent = type === 'capability' ? Game.capabilities[state.capability].name + ' · ' + delta : delta;
      result.hidden = false;
      pulse(result);
      pulse($('workbench').querySelector(type === 'income' ? '.coin-roll' : type === 'speed' ? '.bench-rack' : '.bench-worker'));
    }
    announce(messages[type]);
    render();
  }
  $('build-plot').addEventListener('click', () => { if (view === 'city') purchase('capacity'); });
  action.addEventListener('click', () => {
    if (state.offerings.length) openPanel('markets');
    else if (view === 'globe') enterCity(selected);
    else purchase('capacity');
  });
  $('upgrades-panel').addEventListener('click', event => {
    const button = event.target.closest('[data-upgrade]');
    if (button) purchase(button.dataset.upgrade);
  });
  function nextPlaybackRate() {
    return playbackRates[(playbackRates.indexOf(state.playbackRate) + 1) % playbackRates.length];
  }
  function renderPlaybackRate() {
    const speed = $('game-speed');
    const label = 'Game speed ' + state.playbackRate + '×. Switch to ' + nextPlaybackRate() + '×';
    text($('speed-value'), state.playbackRate + '×');
    speed.title = label;
    speed.setAttribute('aria-label', label);
    speed.classList.toggle('fast', state.playbackRate > 1);
  }
  $('game-speed').addEventListener('click', () => {
    advanceClock(performance.now());
    state.playbackRate = nextPlaybackRate();
    renderPlaybackRate();
    render();
  });
  $('pause').addEventListener('click', () => {
    if (!Game.setPaused(state, !state.paused)) return;
    lastFrame = performance.now();
    render();
  });
  $('restart').addEventListener('click', () => {
    state = freshState();
    renderPlaybackRate();
    acquisitions.clear();
    rivalCity = null;
    scene.resetMarkets();
    scene.setOperations(0, 0);
    nextPayout = 0;
    $('upgrade-result').hidden = true;
    previousPhase = state.phase;
    lastIncident = null;
    selected = 'paris';
    milestoneIndex = 0;
    displayedWin = false;
    centerOnReturn = true;
    lastFrame = performance.now();
    scene.reset();
    sheet.close();
    text($('headline'), 'Choose a country to start automating jobs.');
    showGlobe();
    $('navigate').focus();
  });

  function renderMarkets() {
    const stage = state.countries.length;
    const pool = Game.MARKET_POOLS[stage];
    text($('market-offer'), 'Market ' + (stage + 1) + ' of ' + Game.MARKET_POOLS.length + ' · ' + number(pool) + ' new jobs');
    const options = $('country-options');
    options.replaceChildren();
    for (const id of state.offerings) {
      const country = Game.countries[id];
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.country = id;
      const label = document.createElement('span');
      const title = document.createElement('strong');
      title.textContent = country.name + ' · ' + country.style;
      const detail = document.createElement('small');
      detail.textContent = 'Adoption ×' + country.adoption + ' · Value ×' + country.value + ' · Reach ×' + country.reach;
      label.append(title, detail);
      button.append(label);
      options.append(button);
    }
  }
  $('country-options').addEventListener('click', event => {
    const oldMarket = state.currentCountry;
    const button = event.target.closest('[data-country]');
    if (!button || !Game.selectCountry(state, button.dataset.country)) return;
    sheet.close();
    lastFrame = performance.now();
    const jobs = Game.MARKET_POOLS[state.countries.length - 1];
    if (view !== 'globe') showGlobe();
    const label = Game.currentCountry(state).name + ' · +' + number(jobs) + ' market jobs';
    scene.openMarket(state.currentCountry, oldMarket, label);
    text($('headline'), label);
    $('toast').hidden = true;
    render();
    action.focus({ preventScroll: true });
  });

  function localIncidentCity() {
    return view === 'city' ? selected : Object.keys(state.sites).sort((a, b) => state.sites[b].jobs - state.sites[a].jobs)[0];
  }
  function renderProtest(incident, alert) {
    const targets = $('protest-targets');
    if (!protestCity) {
      protestCity = localIncidentCity();
      targets.replaceChildren(...incident.cleared.map((_, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.target = index;
        button.setAttribute('aria-label', 'Disperse group ' + (index + 1) + ' of ' + incident.cleared.length);
        return button;
      }));
      scene.setProtestCity(protestCity);
      $('protest-flag').setAttribute('aria-label', 'Visit the protest in ' + cityById.get(protestCity).city);
    }
    const here = view === 'city' && selected === protestCity;
    const remaining = incident.cleared.filter(cleared => !cleared).length;
    const loss = Math.round(100 * (1 - Game.speed(state) / Game.speed(state, true)));
    const groups = remaining + (remaining === 1 ? ' group' : ' groups');
    const name = cityById.get(protestCity).city;
    text(alert, here ? 'Protest · Tap ' + groups + ' · −' + loss + '% speed' : 'Protest in ' + name + ' · Visit ›');
    alert.removeAttribute('aria-haspopup');
    targets.hidden = !here;
    incident.cleared.forEach((cleared, i) => {
      const button = targets.children[i];
      button.hidden = cleared;
      button.disabled = cleared || state.paused || state.phase !== 'running';
    });
  }
  function renderRival(incident) {
    if (incident?.type === 'corporate') {
      if (!rivalCity) {
        const home = localIncidentCity();
        rivalCity = acquisitions.has(home) ? (catalog.find(site => !acquisitions.has(site.id))?.id ?? home) : home;
      }
    } else rivalCity = null;
    const site = $('rival-site');
    const forSale = selected === rivalCity;
    site.hidden = view !== 'city' || (!forSale && !acquisitions.has(selected));
    if (site.hidden) return;
    site.dataset.owned = String(!forSale);
    site.disabled = !forSale || state.phase !== 'running' || state.paused || state.money < incident.cost;
    text(site.querySelector('.company-sign'), forSale ? 'Rival AI' : 'Compute, Inc.');
    text(site.querySelector('small'), forSale ? 'Buy · ' + cash(Math.ceil(incident.cost)) : '');
  }
  function renderIncident() {
    const incident = state.incident;
    const type = incident?.type;
    const alert = $('incident-alert');
    alert.hidden = !incident;
    renderRival(incident);
    $('game').classList.toggle('blackout', type === 'power');
    if (type === 'power') $('stage').style.setProperty('--grid-light', .43 + .57 * incident.holdProgress / 1.5);
    else $('stage').style.removeProperty('--grid-light');
    if (type !== 'protestors' && protestCity) {
      protestCity = null;
      $('protest-targets').hidden = true;
      $('protest-targets').replaceChildren();
      scene.setProtestCity(null);
    }
    if (lastIncident && !type) {
      const prop = $('incident-prop');
      if (panel === 'incident' && sheet.open) {
        if (lastIncident === 'power') impact(prop, 'Grid online · +' + rateCash(Game.income(state)) + '/sec', 'power');
        sheet.close();
      }
      if (lastIncident !== 'protestors') pulse($('income'));
      if (!state.won) {
        let message = incidents[lastIncident][1];
        if (lastIncident === 'protestors') {
          const limits = { capacity: 'Servers full. Build to use the restored speed.', capability: 'Upgrade AI to reach more jobs.', market: 'Open the next market to resume.' };
          message = 'Street clear · ' + (limits[Game.bottleneck(state)] || 'Back to ' + jobRate(Game.speed(state)) + ' jobs/sec');
        }
        announce(message);
      }
    }
    lastIncident = type;
    if (!incident) return;
    if (type === 'protestors') {
      renderProtest(incident, alert);
      return;
    }
    if (type === 'corporate') {
      text(alert, view === 'city' && selected === rivalCity ? 'Rival AI · Taking 25% of earnings' : 'Rival in ' + cityById.get(rivalCity).city + ' · Visit ›');
      alert.removeAttribute('aria-haspopup');
      return;
    }
    text(alert, incidents[type][0] + ' · Respond ›');
    alert.setAttribute('aria-haspopup', 'dialog');
    if (panel !== 'incident') return;
    const response = $('incident-response');
    const power = type === 'power';
    const prop = $('incident-prop');
    prop.hidden = false;
    const locked = state.paused || state.phase !== 'running';
    prop.disabled = locked || (!power && state.money < incident.cost);
    $('power-progress').hidden = !power;
    if (power) {
      text($('incident-effect'), 'Income and replacement have stopped. Hold for 1.5 seconds to restore power.');
      text(response, incident.holding ? 'Restoring power…' : 'Hold to drain the nearest city');
      response.disabled = locked;
      $('power-progress').value = incident.holdProgress;
      prop.style.setProperty('--charge', Math.round(incident.holdProgress / 1.5 * 100) + '%');
      prop.setAttribute('aria-label', 'Hold to restore power');
      text(prop.firstElementChild, Math.round(incident.holdProgress / 1.5 * 100) + '%');
    } else {
      text($('incident-effect'), 'Fines drain ' + rateCash(incident.fineRate) + ' per second from the wallet.');
      text(response, 'Send top lawyers · ' + cash(Math.ceil(incident.cost)));
      response.disabled = locked || state.money < incident.cost;
      prop.setAttribute('aria-label', response.textContent);
      text(prop.firstElementChild, 'FINE');
    }
  }
  function visitProtest() {
    if (!protestCity) return;
    if (view !== 'city' || selected !== protestCity) enterCity(protestCity, true);
    scene.focusDistrict();
    $('protest-targets').querySelector('button:enabled')?.focus({ preventScroll: true });
  }
  $('protest-flag').addEventListener('click', visitProtest);
  $('incident-alert').addEventListener('click', () => {
    if (!state.incident) return;
    if (state.incident.type === 'protestors') { visitProtest(); return; }
    if (state.incident.type === 'corporate') {
      if (view !== 'city' || selected !== rivalCity) enterCity(rivalCity, true);
      scene.focusDistrict();
      $('rival-site').focus({ preventScroll: true });
      return;
    }
    if (view !== 'city') enterCity(selected);
    sheet.dataset.incident = state.incident.type;
    openPanel('incident');
    renderIncident();
  });
  $('protest-targets').addEventListener('click', event => {
    const lastProtestSpeed = Game.speed(state);
    const button = event.target.closest('[data-target]');
    if (button && Game.tapProtest(state, Number(button.dataset.target))) {
      const unit = Game.bottleneck(state) ? ' max jobs/sec' : ' jobs/sec';
      impact(button, '+' + jobRate(Game.speed(state) - lastProtestSpeed) + unit, 'scuffle');
      render();
      if (event.detail === 0) ($('protest-targets').querySelector('button:enabled') || $('upgrades')).focus({ preventScroll: true });
    }
  });
  const response = $('incident-response');
  function endHold() { Game.setHolding(state, false); }
  $('rival-site').addEventListener('click', () => {
    if (state.incident?.type !== 'corporate' || selected !== rivalCity || view !== 'city') return;
    const before = Game.income(state);
    if (!Game.payResponse(state)) return;
    acquisitions.add(rivalCity);
    impact($('rival-site'), 'Acquired · +' + rateCash(Game.income(state) - before) + '/sec', 'acquired');
    render();
  });
  for (const control of [response, $('incident-prop')]) {
    control.addEventListener('click', () => {
      const incident = state.incident;
      if (incident?.type !== 'regulators' || !Game.payResponse(state)) return;
      impact($('income'), 'Fine lifted · +' + rateCash(incident.fineRate) + '/sec', 'cleared');
      render();
    });
    control.addEventListener('pointerdown', event => {
      if (state.incident?.type !== 'power' || event.button !== 0) return;
      event.preventDefault();
      control.setPointerCapture(event.pointerId);
      Game.setHolding(state, true);
    });
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture', 'blur']) control.addEventListener(event, endHold);
    control.addEventListener('keydown', event => {
      if (state.incident?.type === 'power' && ['Enter', 'Space'].includes(event.code)) {
        event.preventDefault();
        Game.setHolding(state, true);
      }
    });
    control.addEventListener('keyup', event => {
      if (['Enter', 'Space'].includes(event.code)) endHold();
    });
  }

  function renderShop() {
    const next = Game.capabilities[state.capability + 1];
    for (const button of $('upgrades-panel').querySelectorAll('[data-upgrade]')) {
      const type = button.dataset.upgrade;
      const price = Game.cost(state, type);
      button.hidden = type === 'capability' && !next;
      button.disabled = !Game.canPurchase(state, type);
      text(button.querySelector('.price'), Number.isFinite(price) ? cash(price) : 'Maxed');
      button.title = Number.isFinite(price) ? 'Cost ' + '$' + whole.format(price) : 'Fully upgraded';
    }
    if (next) {
      text($('unlock-name'), 'Unlock ' + next.name.toLowerCase());
      text($('unlock-effect'), 'Unlock up to ' + number(next.limit) + ' jobs');
    }
    const speed = Game.speed(state), earning = Game.earnings(state);
    const bench = $('workbench');
    bench.style.setProperty('--cycle', Math.max(.42, 2.5 / (1 + Math.log2(1 + state.levels.speed))) + 's');
    bench.style.setProperty('--stack', Math.min(15, 3 + state.levels.income * 2) + 'px');
    bench.classList.toggle('idle-input', state.jobs >= Game.limit(state) || speed === 0);
    bench.classList.toggle('idle-output', !Game.income(state));
    const worker = bench.querySelector('.bench-worker');
    const image = 'asset/ui/' + (state.capability ? 'bot' : 'worker') + '.webp';
    if (worker.getAttribute('src') !== image) worker.src = image;
    text($('bench-speed'), jobRate(speed) + ' jobs/sec');
    text($('bench-payout'), '$' + precise(earning) + ' base/job');
    const country = Game.currentCountry(state);
    text($('market-status'), country.name
      ? country.name + ' · ' + number(state.jobs) + ' / ' + number(Game.market(state)) + ' market jobs · ×' + Number(Game.distribution(state).toFixed(2)) + ' distribution'
      : 'Choose a starting country to open your first market.');
    let status = 'AI replaces jobs automatically.';
    if (next && state.jobs >= Game.capabilities[state.capability].limit) status = 'Unlock ' + next.name.toLowerCase() + ' to reach more jobs.';
    else if (state.jobs >= Game.capacity(state)) status = 'Servers full. Build more in a city.';
    if (state.offerings.length) status = state.phase === 'start' ? 'Your first market has 50 jobs.' : 'Market full. Choose the next country.';
    if (state.paused) status = 'Game paused.';
    text($('status'), status);
    text($('pause'), state.paused ? 'Resume game' : 'Pause game');
    $('pause').disabled = state.phase !== 'running';
    $('pause').setAttribute('aria-pressed', String(state.paused));
    text($('jobs'), number(state.jobs) + ' jobs replaced');
    text($('rate'), jobRate(speed) + ' jobs / sec');
    text($('timer'), time(state.elapsed) + ' game time');
  }
  function render() {
    text($('money'), cash(state.money));
    const fined = state.incident?.type === 'regulators';
    const net = Game.income(state) - (fined ? state.incident.fineRate : 0);
    text($('income'), (net < 0 ? '−' : '+') + rateCash(Math.abs(net)));
    text($('rate-unit'), fined ? ' net/sec' : ' / sec');
    $('fine-rate').hidden = !fined;
    if (fined) text($('fine-rate'), '−' + rateCash(state.incident.fineRate) + '/sec fine');
    const percent = Math.floor(state.jobs / Game.TOTAL_JOBS * 1000) / 10;
    text($('percent'), percent === 0 && state.jobs > 0 ? '<0.1%' : percent + '%');
    $('progress').style.setProperty('--value', percent + '%');
    $('progress').setAttribute('aria-valuenow', String(percent));
    if (view === 'city') {
      const site = state.sites[selected];
      const slots = site?.capacity ?? 0;
      text($('capacity'), slots ? number(site.jobs) + '/' + number(slots) + ' used' : 'First server site');
      $('capacity-flag').style.setProperty('--fill', (slots ? site.jobs / slots * 100 : 0) + '%');
      const price = Game.cost(state, 'capacity');
      const added = Math.min(Game.TOTAL_JOBS - Game.capacity(state), Game.capacity(state));
      text($('action-label'), state.paused ? 'Game paused' : 'Build servers');
      text($('action-detail'), Number.isFinite(price) ? cash(price) + ' · +' + number(added) + ' capacity' : 'Fully expanded');
      action.disabled = !Game.canPurchase(state, 'capacity');
    } else {
      text($('action-label'), 'Enter ' + cityById.get(selected).city);
      action.disabled = state.won;
    }
    $('action-detail').hidden = view !== 'city' || state.offerings.length > 0;
    if (state.offerings.length) {
      text($('action-label'), state.phase === 'start' ? 'Choose country' : 'Expand market');
      action.disabled = false;
    }
    if (state.phase === 'expanding' && previousPhase !== state.phase) openPanel('markets');
    previousPhase = state.phase;
    renderIncident();
    $('build-plot').hidden = view !== 'city' || state.phase !== 'running' || !Number.isFinite(Game.cost(state, 'capacity'));
    $('build-plot').disabled = !Game.canPurchase(state, 'capacity');
    $('build-plot').title = 'Build servers · ' + cash(Game.cost(state, 'capacity'));
    $('street-crew').hidden = view !== 'city' || !state.countries.length;
    document.body.classList.toggle('operations-stopped', state.phase !== 'running' || state.paused || state.incident?.type === 'power');
    if (panel === 'upgrades') renderShop();
    if (performance.now() >= toastUntil) $('toast').hidden = true;
    if (milestoneIndex < milestones.length && state.jobs >= milestones[milestoneIndex][0]) {
      announce(milestones[milestoneIndex++][1]);
    }
    if (state.won && !displayedWin) {
      displayedWin = true;
      text($('victory-summary'), cash(state.earned) + ' earned. Planet acquired in ' + time(state.elapsed) + ' of game time.');
      openPanel('victory');
    }
  }

  document.addEventListener('visibilitychange', () => { lastFrame = performance.now(); endHold(); });
  window.addEventListener('blur', endHold);
  function advanceClock(now) {
    const seconds = Math.min(.25, Math.max(0, (now - (lastFrame ?? now)) / 1000));
    lastFrame = Math.max(lastFrame ?? now, now);
    if (document.hidden || seconds === 0) return;
    // Small simulation steps preserve incident timing. A held button uses wall time.
    const inputStep = seconds / state.playbackRate;
    for (let i = 0; i < state.playbackRate; i++) {
      Game.tick(state, seconds, inputStep);
      if (state.paused || state.phase !== 'running') break;
    }
  }
  function frame(now) {
    const earnedBefore = state.earned;
    advanceClock(now);
    if (!document.hidden) {
      scene.frame(now, state.elapsed, state.phase === 'running' && !state.paused && state.incident?.type !== 'power', sheet.open);
      showPayout(now, state.earned - earnedBefore);
      if (now - lastPaint >= 80) { render(); lastPaint = now; }
    }
    requestAnimationFrame(frame);
  }
  showGlobe();
  requestAnimationFrame(frame);
})();
