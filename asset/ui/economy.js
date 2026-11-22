'use strict';
const Game = (() => {
  const TOTAL_JOBS = 100000;
  const MARKET_POOLS = [50, 250, 1200, 4500, 14000, 30000, 30000, 20000];
  const capabilities = [
    { name: 'Office AI', limit: 1000, cost: 0 },
    { name: 'Robot Hands', limit: 12000, cost: 25000, joke: 'AI acquires hands. Experts request clarification.' },
    { name: 'Autonomous Workforce', limit: 50000, cost: 600000, joke: 'Your replacement is double-parked outside.' },
    { name: 'Universal Replacement', limit: TOTAL_JOBS, cost: 7500000, joke: 'The government has been replaced by a dropdown menu.' }
  ];
  const upgrades = {
    capacity: { base: 300, growth: 3.1, max: 12 },
    speed: { base: 20, growth: 3.2, max: 20 },
    income: { base: 400, growth: 4.5, max: 16 }
  };
  const countries = {
    us: { cityId: 'newyork', name: 'United States', style: 'Commercial', adoption: 1, value: 1.05, reach: .95 },
    india: { cityId: 'agra', name: 'India', style: 'Rapid adoption', adoption: 1.1, value: .9, reach: 1 },
    germany: { cityId: 'berlin', name: 'Germany', style: 'High value', adoption: .95, value: 1.1, reach: .95 },
    singapore: { cityId: 'singapore', name: 'Singapore', style: 'Highly connected', adoption: 1, value: .95, reach: 1.05 },
    canada: { cityId: 'niagara', name: 'Canada', style: 'Rapid adoption', adoption: 1.05, value: .95, reach: 1 },
    ireland: { cityId: 'dublin', name: 'Ireland', style: 'Commercial', adoption: 1, value: 1.05, reach: .95 },
    japan: { cityId: 'fujiyoshida', name: 'Japan', style: 'Balanced', adoption: 1.05, value: 1, reach: .95 },
    brazil: { cityId: 'rio', name: 'Brazil', style: 'Rapid adoption', adoption: 1.05, value: .95, reach: 1 },
    australia: { cityId: 'sydney', name: 'Australia', style: 'Highly connected', adoption: .95, value: 1, reach: 1.05 },
    france: { cityId: 'paris', name: 'France', style: 'Commercial', adoption: .95, value: 1.05, reach: 1 },
    korea: { cityId: 'seoul', name: 'South Korea', style: 'Rapid adoption', adoption: 1.05, value: .9, reach: 1.05 },
    southafrica: { cityId: 'capetown', name: 'South Africa', style: 'Highly connected', adoption: 1, value: .95, reach: 1.05 },
    sweden: { cityId: 'stockholm', name: 'Sweden', style: 'Balanced', adoption: 1, value: 1, reach: 1 }
  };
  const startCountries = ['us', 'india', 'germany'];
  const incidentTypes = ['protestors', 'regulators', 'corporate', 'power'];
  function createState(options = {}) {
    return {
      phase: 'start', money: 20, earned: 0, jobs: 0, elapsed: 0, playbackRate: 1,
      levels: { capacity: 0, speed: 0, income: 0 }, capability: 0,
      sites: { paris: { capacity: 25, jobs: 0, halls: 1 } },
      countries: [], countryJobs: {}, currentCountry: null, offerings: [...startCountries],
      paused: false, won: false, incident: null, nextIncidentAt: 60,
      lastIncident: null, incidentsEnabled: options.incidents !== false,
      rng: (options.seed ?? Date.now()) >>> 0
    };
  }
  function random(s) {
    s.rng = (Math.imul(s.rng, 1664525) + 1013904223) >>> 0;
    return s.rng / 4294967296;
  }
  function currentCountry(s) {
    return countries[s.currentCountry] || { name: '', style: '', adoption: 1, value: 1, reach: 1 };
  }
  function market(s) {
    return s.countries.reduce((total, id, index) => total + MARKET_POOLS[index], 0);
  }
  function distribution(s) {
    return s.countries.reduce((value, id, index) => value * (index === 0 ? 1 : 1.2) * countries[id].reach, 1);
  }
  function weightedJobs(s) {
    return s.countries.reduce((total, id) => total + (s.countryJobs[id] || 0) * countries[id].value, 0);
  }
  function capacity(s) { return Math.min(TOTAL_JOBS, 25 * 2 ** s.levels.capacity); }
  function speed(s, ignoreIncident = false) {
    let value = 3 * 1.65 ** s.levels.speed * currentCountry(s).adoption;
    if (!ignoreIncident && s.incident?.type === 'power') return 0;
    if (!ignoreIncident && s.incident?.type === 'protestors') {
      const cleared = s.incident.cleared.filter(Boolean).length;
      value *= .5 + .5 * cleared / s.incident.cleared.length;
    }
    return value;
  }
  function earnings(s) { return 1.5 ** s.levels.income; }
  function income(s, ignoreIncident = false) {
    if (!ignoreIncident && s.incident?.type === 'power') return 0;
    const resistance = !ignoreIncident && s.incident?.type === 'corporate' ? .75 : 1;
    return weightedJobs(s) * earnings(s) * distribution(s) * resistance;
  }
  function limit(s) { return Math.min(capacity(s), capabilities[s.capability].limit, market(s)); }
  function cost(s, type) {
    if (type === 'capability') return capabilities[s.capability + 1]?.cost ?? Infinity;
    const upgrade = upgrades[type];
    if (!upgrade || s.levels[type] >= upgrade.max) return Infinity;
    return Math.ceil(upgrade.base * upgrade.growth ** s.levels[type]);
  }
  function canPurchase(s, type) {
    const price = cost(s, type);
    return s.phase === 'running' && !s.paused && !s.won && Number.isFinite(price) && s.money >= price;
  }
  function purchase(s, type, city = 'paris') {
    if (!canPurchase(s, type)) return false;
    const previousCapacity = capacity(s);
    s.money -= cost(s, type);
    if (type === 'capability') s.capability += 1;
    else s.levels[type] += 1;
    if (type === 'capacity') {
      const site = s.sites[city] ??= { capacity: 0, jobs: 0, halls: 0 };
      site.capacity += capacity(s) - previousCapacity;
      site.halls++;
    }
    return true;
  }
  function selectCountry(s, id) {
    if (!['start', 'expanding'].includes(s.phase) || !s.offerings.includes(id) || !countries[id]) return false;
    const stage = s.countries.length;
    if (stage >= MARKET_POOLS.length || s.countries.includes(id)) return false;
    s.countries.push(id);
    s.countryJobs[id] = stage === 0 ? 1 : 0;
    if (stage === 0) s.jobs = s.sites.paris.jobs = 1;
    s.currentCountry = id;
    s.offerings = [];
    s.phase = 'running';
    return true;
  }
  function drawCountries(s) {
    const available = Object.keys(countries).filter(id => !s.countries.includes(id));
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(random(s) * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }
    const first = available[0];
    const signature = id => `${countries[id].adoption}/${countries[id].value}/${countries[id].reach}`;
    const second = available.find(id => signature(id) !== signature(first)) || available[1];
    return [first, second];
  }
  function bottleneck(s) {
    if (s.phase === 'expanding' || (s.countries.length < MARKET_POOLS.length && s.jobs >= market(s))) return 'market';
    if (s.capability < capabilities.length - 1 && s.jobs >= capabilities[s.capability].limit) return 'capability';
    if (s.jobs >= capacity(s) && !s.won) return 'capacity';
    return null;
  }
  function scheduleNextIncident(s) { s.nextIncidentAt = s.elapsed + 30 + random(s) * 15; }
  function spawnIncident(s, type) {
    if (!s.incidentsEnabled || s.incident || s.phase !== 'running' || s.paused || s.won || s.jobs >= TOTAL_JOBS * .95) return false;
    if (!incidentTypes.includes(type)) {
      const choices = incidentTypes.filter(value => value !== s.lastIncident);
      type = choices[Math.floor(random(s) * choices.length)];
    }
    const normalIncome = income(s, true);
    s.incident = {
      type, cost: Math.max(1, normalIncome * 6), fineRate: normalIncome * .1,
      cleared: type === 'protestors' ? [false, false, false] : [],
      holding: false, holdProgress: 0
    };
    s.lastIncident = type;
    return true;
  }
  function resolveIncident(s) {
    if (!s.incident) return false;
    s.incident = null;
    scheduleNextIncident(s);
    return true;
  }
  function payResponse(s) {
    if (!s.incident || !['regulators', 'corporate'].includes(s.incident.type) || s.phase !== 'running' || s.paused || s.money < s.incident.cost) return false;
    s.money = Math.max(0, s.money - s.incident.cost);
    return resolveIncident(s);
  }
  function tapProtest(s, index) {
    if (!s.incident || s.incident.type !== 'protestors' || s.phase !== 'running' || s.paused || !Number.isInteger(index) || index < 0 || index >= s.incident.cleared.length || s.incident.cleared[index]) return false;
    s.incident.cleared[index] = true;
    if (s.incident.cleared.every(Boolean)) return resolveIncident(s);
    return true;
  }
  function setHolding(s, holding) {
    if (!s.incident || s.incident.type !== 'power') return false;
    s.incident.holding = Boolean(holding) && s.phase === 'running' && !s.paused;
    return true;
  }
  function holdPower(s, seconds) {
    if (!s.incident || s.incident.type !== 'power' || s.phase !== 'running' || s.paused || !Number.isFinite(seconds) || seconds <= 0) return false;
    s.incident.holdProgress = Math.min(1.5, s.incident.holdProgress + seconds);
    if (s.incident.holdProgress >= 1.5) return resolveIncident(s);
    return true;
  }
  function setPaused(s, paused) {
    if (s.phase !== 'running' || s.won) return false;
    s.paused = Boolean(paused);
    if (s.paused && s.incident?.type === 'power') s.incident.holding = false;
    return true;
  }
  function tick(s, seconds, inputSeconds = seconds) {
    if (s.phase !== 'running' || s.paused || s.won || !Number.isFinite(seconds) || seconds <= 0) return;
    if (s.incident?.type === 'power') {
      if (s.incident.holding) holdPower(s, inputSeconds);
      s.elapsed += seconds;
      return;
    }
    const rate = speed(s);
    const ceiling = limit(s);
    const growthTime = Math.min(seconds, Math.max(0, ceiling - s.jobs) / rate);
    const oldJobs = s.jobs;
    const oldWeighted = weightedJobs(s);
    const delta = Math.min(ceiling - oldJobs, rate * growthTime);
    const nextJobs = oldJobs + delta;
    const newWeighted = oldWeighted + delta * currentCountry(s).value;
    const reachesWin = nextJobs >= TOTAL_JOBS;
    const reachesMarket = nextJobs >= market(s) && s.countries.length < MARKET_POOLS.length;
    const duration = reachesWin || reachesMarket ? growthTime : seconds;
    const resistance = s.incident?.type === 'corporate' ? .75 : 1;
    const revenue = ((oldWeighted + newWeighted) / 2 * growthTime + newWeighted * (duration - growthTime)) * earnings(s) * distribution(s) * resistance;
    // Markets own the jobs and their revenue. Server sites supply the slots that run them.
    if (delta > 0) {
      const fill = Math.min(1, delta / (capacity(s) - oldJobs));
      for (const site of Object.values(s.sites)) site.jobs += (site.capacity - site.jobs) * fill;
    }
    s.jobs = nextJobs;
    s.countryJobs[s.currentCountry] += delta;
    s.money += revenue;
    s.earned += revenue;
    if (s.incident?.type === 'regulators') s.money = Math.max(0, s.money - s.incident.fineRate * duration);
    s.elapsed += duration;
    if (reachesWin) {
      s.won = true;
      s.phase = 'won';
      s.incident = null;
      return;
    }
    if (reachesMarket) {
      s.phase = 'expanding';
      s.offerings = drawCountries(s);
      return;
    }
    if (!s.incident && s.elapsed >= s.nextIncidentAt && s.jobs < TOTAL_JOBS * .95) spawnIncident(s);
  }
  return {
    TOTAL_JOBS, MARKET_POOLS, capabilities, upgrades, countries, startCountries, createState,
    currentCountry, market, distribution, weightedJobs, capacity, speed, earnings,
    income, limit, cost, canPurchase, purchase, selectCountry, bottleneck,
    spawnIncident, resolveIncident, payResponse, tapProtest, setHolding,
    holdPower, setPaused, tick
  };
})();
