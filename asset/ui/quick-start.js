'use strict';

(() => {
  const screen = document.getElementById('quick-start');
  const game = document.getElementById('game');
  const choices = document.getElementById('start-countries');
  const status = document.getElementById('start-status');
  const files = [
    'asset/vendor/three.min.js', 'asset/vendor/d3.min.js', 'asset/world.js', 'asset/models.js',
    'asset/ui/market-routes.js', 'asset/ui/scene.js', 'asset/ui/game.js'
  ];
  const requests = new Map();
  let selectMarket;

  function loadScripts() {
    return Promise.all(files.map(src => {
      if (!requests.has(src)) {
        const script = document.createElement('script');
        script.async = false;
        script.src = src;
        requests.set(src, new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => {
            requests.delete(src);
            script.remove();
            reject(new Error('Could not load ' + src));
          };
        }));
        document.head.append(script);
      }
      return requests.get(src);
    }));
  }

  function showStart() {
    game.hidden = true;
    screen.hidden = false;
    status.textContent = '';
    for (const button of choices.children) {
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
    choices.firstElementChild.focus({ preventScroll: true });
  }

  for (const id of Game.startCountries) {
    const country = Game.countries[id];
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.startCountry = id;
    const detail = document.createElement('small');
    detail.textContent = country.adoption > 1
      ? 'Automation +' + Math.round((country.adoption - 1) * 100) + '%'
      : 'Job value +' + Math.round((country.value - 1) * 100) + '%';
    button.append(country.name, detail);
    choices.append(button);
  }
  choices.addEventListener('click', async event => {
    const choice = event.target.closest('button');
    if (!choice || choice.disabled) return;
    for (const button of choices.children) button.disabled = true;
    choice.setAttribute('aria-busy', 'true');
    const country = choice.dataset.startCountry;
    status.textContent = 'Opening ' + Game.countries[country].name + '…';
    try {
      await loadScripts();
    } catch {
      showStart();
      status.textContent = 'The game couldn’t load. Choose a market to retry.';
      choice.focus();
      return;
    }
    screen.hidden = true;
    game.hidden = false;
    selectMarket ??= createGame(showStart);
    selectMarket(country);
  });

  // Warm the scripts after the choices paint. A tap can start or retry the same downloads.
  requestAnimationFrame(() => setTimeout(() => loadScripts().catch(() => {}), 0));
})();
