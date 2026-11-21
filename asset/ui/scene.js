'use strict';

// The view owns cameras and geometry. The economy keeps running when the camera moves.
function createGameScene({ canvas, stage, cityFlag, capacityFlag, onEnter, onSelect }) {
  const T = THREE;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const catalog = ComputeAssets.landmarks;
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch { renderer = null; }
  const kit = ComputeAssets.createKit(T);
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-4, 4, 4, -4, .1, 100);
  const raycaster = new T.Raycaster();
  const point = new T.Vector3();
  const worldPoint = new T.Vector3();
  const pointers = new Map();
  const street = document.getElementById('paris-street');
  const bays = document.getElementById('new-bays');
  const buildPlot = document.getElementById('build-plot');
  const marketFlag = document.getElementById('market-flag');
  const protestFlag = document.getElementById('protest-flag');
  const rivalSite = document.getElementById('rival-site');
  const protestTargets = document.getElementById('protest-targets');
  const crew = document.getElementById('street-crew');
  const baySpots = [[.785, .647], [.832, .666], [.7, .67], [.746, .689]];
  const yardSpots = [[.46, .44], [.68, .54], [.32, .55], [.54, .65]];
  const parisPickets = [[.265,.683],[.465,.628],[.665,.577]];
  const yardPickets = [[.24,.57],[.48,.68],[.72,.58]];
  const pavementStops = [2,4,7];
  let routes, marketFlight, marketShownUntil = 0, marketHub;
  let crewPace = 1, capability = 0;
  let protestCity, protestMarker;
  const fallbackNote = document.getElementById('fallback-note');
  let globe, district, plots = [], walkers = [], markers = [];
  let view = 'globe', selected = 'paris', width = 1, height = 1;
  let cityZoom = 1, globeZoom = 1, yaw = -.29, pitch = .24;
  let streetCenterY = 0;
  let hallsBuilt = 0, streetVisible = false;
  let departure, anchor, buildingDrop, needsDraw = true, nextWalkFrame = 0;
  let gestureMoved = false, pinchDistance = 0;

  if (renderer) {
    kit.configureRenderer(renderer, devicePixelRatio);
    kit.addLighting(scene);
    globe = kit.createGlobe(d3, ComputeWorld);
    scene.add(globe);
    routes = createMarketRoutes(kit, globe);
    markers = globe.children.filter(child => child.userData.city);
    // Leave breathing room between the miniatures at the edge of the planet.
    for (const marker of markers) marker.scale.setScalar(marker.userData.city === 'paris' ? .79 : .65);
  } else {
    stage.classList.add('illustrated');
  }

  function positionProtestGroups() {
    if (view !== 'city' || selected !== protestCity) return;
    const painted = !street.hidden;
    const imageWidth = parseFloat(street.style.width), imageHeight = parseFloat(street.style.height);
    const size = painted ? imageWidth * (streetVisible ? .105 : .13) : height / (camera.top - camera.bottom) * .88;
    protestTargets.style.setProperty('--crowd-size', Math.min(90, height * .13, Math.max(38, size)) + 'px');
    Array.from(protestTargets.children).forEach((button, i) => {
      let x, y;
      if (painted) {
        let [u,v] = (streetVisible ? parisPickets : yardPickets)[i];
        if (streetVisible && width > height) {
          // Keep all three stops on the visible stretch of the boulevard in a short crop.
          const spread = Math.min(1, height * .125 / (imageHeight * .055));
          u = T.MathUtils.lerp(parisPickets[1][0], u, spread);
          v = T.MathUtils.lerp(parisPickets[1][1], v, spread);
        }
        x = width / 2 + (u - .5) * imageWidth;
        y = streetCenterY + (v - .5) * imageHeight;
      } else {
        // Each district already lays out walkers along its own pavement.
        const walker = walkers[pavementStops[i]];
        point.set(walker.x, walker.y, walker.part.position.z).project(camera);
        x = (point.x + 1) * width / 2;
        y = (1 - point.y) * height / 2;
      }
      button.style.left = x + 'px';
      button.style.top = y + 'px';
    });
  }
  function setProtestCity(id) {
    if (id === protestCity) return;
    protestCity = id;
    protestMarker = markers.find(marker => marker.userData.city === id);
    protestFlag.hidden = true;
    positionProtestGroups();
    needsDraw = true;
  }
  function focusDistrict() {
    cityZoom = 1;
    layout();
  }
  function layout() {
    width = stage.clientWidth || 1;
    height = stage.clientHeight || 1;
    const aspect = width / height;
    streetVisible = view === 'city' && selected === 'paris' && (aspect <= 1 || !renderer);
    const yard = !renderer && view === 'city' && selected !== 'paris';
    street.classList.toggle('server-yard', yard);
    street.hidden = !streetVisible && !yard;
    canvas.classList.toggle('clear-scene', streetVisible);
    if (streetVisible || yard) {
      const imageWidth = yard ? Math.min(width, 560) : Math.max(width, height * 910 / 1727) * Math.max(1, cityZoom);
      const imageHeight = imageWidth * (yard ? .7 : 1727 / 910);
      // A wide crop of the Paris illustration should frame the street and its server lots.
      streetCenterY = streetVisible && aspect > 1 ? height * .62 - (parisPickets[1][1] - .5) * imageHeight : height / 2;
      street.style.top = streetCenterY + 'px';
      street.style.width = imageWidth + 'px';
      street.style.height = imageHeight + 'px';
      const count = yard ? hallsBuilt : Math.max(0, hallsBuilt - 1);
      const spots = yard ? yardSpots : baySpots;
      const lastBay = count ? spots[(count - 1) % 4] : yard ? [.46, .44] : [.26, .55];
      const tagX = lastBay[0], tagY = lastBay[1] - (yard ? .23 : .06);
      const nextBay = spots[count % 4];
      buildPlot.style.left = (width / 2 + (nextBay[0] - .5) * imageWidth) + 'px';
      buildPlot.style.top = (streetCenterY + (nextBay[1] - .5) * imageHeight) + 'px';
      const x = width / 2 + (tagX - .5) * imageWidth;
      capacityFlag.style.left = Math.max(56, Math.min(width - 56, x)) + 'px';
      capacityFlag.style.top = (streetCenterY + (tagY - .5) * imageHeight) + 'px';
      rivalSite.style.left = (width / 2 + (yard ? .28 : -.08) * imageWidth) + 'px';
      rivalSite.style.top = (streetCenterY + (yard ? .23 : .185) * imageHeight) + 'px';
    }
    if (renderer) renderer.setSize(width, height, false);
    const half = view === 'globe' ? Math.max(3.15, 2.25 / aspect) / globeZoom
      : Math.max(3.65, 3.05 / aspect) / cityZoom;
    if (view === 'globe') {
      const radius = height / half;
      stage.style.setProperty('--shadow-width', radius * 1.42 + 'px');
      stage.style.setProperty('--shadow-offset', radius + 'px');
    }
    camera.left = -half * aspect;
    camera.right = half * aspect;
    camera.top = half;
    camera.bottom = -half;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    if (view === 'city' && street.hidden) {
      point.set(-.35, .05, 2.65).project(camera);
      rivalSite.style.left = ((point.x + 1) * width / 2) + 'px';
      rivalSite.style.top = ((1 - point.y) * height / 2) + 'px';
    }
    rivalSite.style.setProperty('--bay-size', Math.min(100, Math.max(48, (street.hidden ? height / (2 * half) : parseFloat(street.style.width) * .14))) + 'px');
    positionProtestGroups();
    needsDraw = true;
  }
  function positionFlag(flag, position, visible) {
    flag.hidden = !visible;
    if (!visible) return;
    point.copy(position).project(camera);
    flag.style.left = ((point.x + 1) * width / 2) + 'px';
    flag.style.top = ((1 - point.y) * height / 2 - 4) + 'px';
  }
  function draw() {
    if (!renderer || streetVisible) { needsDraw = false; return; }
    if (globe.visible) globe.rotation.set(pitch, yaw, 0, 'XYZ');
    renderer.render(scene, camera);
    if (view === 'globe') {
      const marker = markers.find(item => item.userData.city === selected);
      marker.getWorldPosition(worldPoint);
      const front = worldPoint.z > .45;
      // Plant the name flag beside the landmark's foot so its silhouette stays visible.
      worldPoint.x += .18;
      const showMarket = marketShownUntil > performance.now();
      positionFlag(cityFlag, worldPoint, front && !showMarket && marker !== protestMarker);
      if (protestMarker) {
        protestMarker.getWorldPosition(worldPoint);
        worldPoint.y += .22;
        positionFlag(protestFlag, worldPoint, worldPoint.z > .45);
      }
      if (showMarket) {
        worldPoint.copy(marketHub).applyMatrix4(globe.matrixWorld);
        positionFlag(marketFlag, worldPoint, worldPoint.z > .2);
      } else marketFlag.hidden = true;
    } else if (anchor) {
      anchor.getWorldPosition(worldPoint);
      worldPoint.y += 1.2 * anchor.scale.y;
      positionFlag(capacityFlag, worldPoint, true);
      const nextPlot = plots[Math.min(hallsBuilt, plots.length - 1)];
      nextPlot.getWorldPosition(point).project(camera);
      buildPlot.style.left = ((point.x + 1) * width / 2) + 'px';
      buildPlot.style.top = ((1 - point.y) * height / 2) + 'px';
    }
    needsDraw = false;
  }
  function zoomIntoLandmark(id) {
    if (!renderer || reducedMotion.matches || view !== 'globe') return;
    const marker = markers.find(item => item.userData.city === id);
    marker.getWorldPosition(point);
    if (point.z < .4) return;
    point.project(camera);
    const origin = ((point.x + 1) * 50) + '% ' + ((1 - point.y) * 50) + '%';
    // Keep the outgoing globe for the descent while the city takes over the live canvas.
    const still = document.createElement('canvas');
    still.width = width;
    still.height = height;
    still.className = 'departure';
    still.setAttribute('aria-hidden', 'true');
    still.style.transformOrigin = origin;
    still.style.background = getComputedStyle(stage).background;
    renderer.render(scene, camera);
    still.getContext('2d').drawImage(canvas, 0, 0, width, height);
    stage.after(still);
    departure?.remove();
    departure = still;
    const flight = still.animate([
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.35)', opacity: .95, offset: .38 },
      { transform: 'scale(2.6)', opacity: 0 }
    ], { duration: 460, easing: 'ease-in-out' });
    flight.finished.then(() => {
      still.remove();
      if (departure === still) departure = null;
    });
  }
  function approach(inward) {
    if (reducedMotion.matches) return;
    stage.getAnimations().forEach(animation => animation.cancel());
    stage.animate([{ opacity: .35, transform: 'scale(' + (inward ? .93 : 1.06) + ')' },
      { opacity: 1, transform: 'scale(1)' }], { duration: 320, easing: 'ease-out' });
  }
  function showGlobe(id, center = false, sites) {
    departure?.remove();
    const returning = view === 'city';
    view = 'globe';
    selected = id;
    marketFlag.hidden = true;
    protestFlag.hidden = true;
    if (center) {
      const [lon, lat] = catalog.find(item => item.id === id).coordinate;
      yaw = -lon * Math.PI / 180;
      pitch = lat * Math.PI / 180 - .38;
    }
    cityFlag.hidden = false;
    capacityFlag.hidden = true;
    fallbackNote.hidden = true;
    if (renderer) {
      if (sites) {
        for (const marker of markers) {
          const built = sites[marker.userData.city]?.halls || 0;
          let rack = marker.getObjectByName('operating-site');
          if (built && !rack) {
            rack = kit.createDatacentre();
            rack.name = 'operating-site';
            rack.position.set(-.27, .025, .27);
            rack.scale.setScalar(.22);
            marker.add(rack);
          }
          if (rack) rack.visible = built > 0;
        }
      }
      if (district) district.visible = false;
      globe.visible = true;
      camera.position.set(0, 0, 10);
      camera.lookAt(0, 0, 0);
      layout();
      draw();
    } else {
      layout();
      cityFlag.style.left = '50%';
      cityFlag.style.top = '47%';
    }
    if (returning) approach(false);
  }
  function updateBays(count, spots, purchased) {
    bays.replaceChildren();
    for (let i = 0; i < Math.min(count, 4); i++) {
      const img = document.createElement('img');
      const tiers = Math.ceil((count - i) / 4);
      img.src = 'asset/ui/server-bay.webp';
      img.alt = '';
      img.style.left = (spots[i][0] * 100) + '%';
      img.style.top = (spots[i][1] * 100) + '%';
      img.style.setProperty('--tiers', String(1 + .22 * (tiers - 1)));
      if (purchased && i === (count - 1) % 4) img.classList.add('installed');
      bays.append(img);
    }
  }
  function showCity(id, halls, purchased = false) {
    const entering = view !== 'city' || selected !== id;
    if (entering) { zoomIntoLandmark(id); cityZoom = 1; }
    stopMarketFocus();
    view = 'city';
    selected = id;
    cityFlag.hidden = true;
    protestFlag.hidden = true;
    capacityFlag.hidden = false;
    hallsBuilt = halls;
    if (id === 'paris') updateBays(Math.max(0, halls - 1), baySpots, purchased);
    else if (!renderer) updateBays(halls, yardSpots, purchased);
    buildPlot.style.left = '62%';
    buildPlot.style.top = '55%';
    if (!renderer) {
      fallbackNote.hidden = id === 'paris';
      fallbackNote.textContent = catalog.find(item => item.id === id).city + ' · 3D view unavailable';
      capacityFlag.style.left = id === 'paris' ? '25%' : '50%';
      capacityFlag.style.top = id === 'paris' ? '52%' : '50%';
      layout();
      if (entering) approach(true);
      return;
    }
    globe.visible = false;
    if (district) { scene.remove(district); kit.clear(district); }
    district = kit.createCity(id, { takeover: Math.min(100, halls * 10), robotCount: [0, 2, 5, 9][capability] });
    scene.add(district);
    plots = district.children.filter(part => Number.isInteger(part.userData.plot));
    anchor = plots[Math.min(halls || 1, plots.length) - 1];
    if (halls > plots.length) anchor.scale.y *= 1 + .25 * (halls - plots.length);
    walkers = district.children.filter(part => part.name === 'human' || part.name === 'robot')
      .map(part => ({ part, x: part.position.x, y: part.position.y }));
    buildingDrop = purchased && !reducedMotion.matches ? { part: anchor, y: anchor.position.y, start: performance.now() } : null;
    camera.position.set(5, 8.2, 13);
    camera.lookAt(0, 1, 0);
    layout();
    draw();
    if (entering) approach(true);
  }

  function stopMarketFocus() {
    if (marketFlight) routes.reveal(1);
    marketFlight = null;
    marketShownUntil = 0;
    marketFlag.hidden = true;
  }
  function openMarket(id, previous, label) {
    const animate = !!renderer && !reducedMotion.matches;
    routes?.connect(id, previous, animate);
    marketFlag.textContent = label;
    const [lon, lat] = marketHubs[id];
    marketHub = kit.globePosition(marketHubs[id], 2.21);
    const endYaw = -lon * Math.PI / 180;
    const dx = Math.atan2(Math.sin(endYaw - yaw), Math.cos(endYaw - yaw));
    const endPitch = lat * Math.PI / 180 - .08;
    marketShownUntil = performance.now() + 3100;
    if (animate) marketFlight = { start: performance.now(), yaw, pitch, dx, dy: endPitch - pitch };
    else {
      yaw = endYaw;
      pitch = endPitch;
      if (!renderer) {
        marketFlag.hidden = false;
        marketFlag.style.left = '50%';
        marketFlag.style.top = '35%';
        cityFlag.hidden = true;
      }
    }
    needsDraw = true;
  }
  function setOperations(speedLevel, tier) {
    crewPace = 1 + Math.log2(1 + speedLevel) * .6;
    street.style.setProperty('--crew-trip', (5.5 / crewPace) + 's');
    if (capability === tier) return;
    capability = tier;
    const crewSize = Math.max(1, tier);
    crew.replaceChildren(...Array.from({ length: crewSize }, () => {
      const actor = document.createElement('img');
      actor.src = tier ? 'asset/ui/bot.webp' : 'asset/ui/worker.webp';
      actor.alt = '';
      return actor;
    }));
  }
  function resetMarkets() {
    stopMarketFocus();
    routes?.reset();
  }
  function rotate(dx, dy) {
    stopMarketFocus();
    yaw += dx;
    pitch = T.MathUtils.clamp(pitch + dy, -Math.PI / 2, Math.PI / 2);
    needsDraw = true;
  }
  function zoom(factor) {
    if (view === 'globe') globeZoom = T.MathUtils.clamp(globeZoom * factor, .8, 1.5);
    else cityZoom = T.MathUtils.clamp(cityZoom * factor, streetVisible ? 1 : .7, 1.6);
    layout();
  }
  function pick(x, y) {
    const rect = canvas.getBoundingClientRect();
    raycaster.setFromCamera({ x: 2 * (x - rect.left) / width - 1, y: 1 - 2 * (y - rect.top) / height }, camera);
    for (const hit of raycaster.intersectObject(globe, true)) {
      let part = hit.object;
      if (part.name === 'ocean-and-coastline') break;
      while (part && !part.userData.city) part = part.parent;
      if (part) return part.userData.city;
    }
    // Give small pins a fingertip-sized hit area. Only the near hemisphere is selectable.
    let closest, distance = 22;
    for (const marker of markers) {
      marker.getWorldPosition(point);
      if (point.z < .45) continue;
      point.project(camera);
      const d = Math.hypot((point.x + 1) * width / 2 - x + rect.left, (1 - point.y) * height / 2 - y + rect.top);
      if (d < distance) { closest = marker.userData.city; distance = d; }
    }
    return closest;
  }
  function selectFacingCity() {
    let nearest, best = -Infinity;
    for (const marker of markers) {
      marker.getWorldPosition(point);
      const score = point.z + .25 * point.y;
      if (score > best) { nearest = marker.userData.city; best = score; }
    }
    if (nearest) {
      selected = nearest;
      onSelect(nearest);
      needsDraw = true;
    }
  }
  function distanceBetweenPointers() {
    const [a, b] = pointers.values();
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
  canvas.addEventListener('pointerdown', event => {
    if ((!renderer && !streetVisible) || event.button !== 0) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY, firstX: event.clientX, firstY: event.clientY });
    canvas.setPointerCapture(event.pointerId);
    if (pointers.size === 1) gestureMoved = false;
    if (pointers.size === 2) { gestureMoved = true; pinchDistance = distanceBetweenPointers(); }
  });
  canvas.addEventListener('pointermove', event => {
    const pointer = pointers.get(event.pointerId);
    if (!pointer) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    if (pointers.size === 2) {
      const next = distanceBetweenPointers();
      if (pinchDistance > 0 && next > 0) zoom(next / pinchDistance);
      pinchDistance = next;
    } else if (Math.hypot(pointer.x - pointer.firstX, pointer.y - pointer.firstY) > 6 || gestureMoved) {
      gestureMoved = true;
      if (view === 'globe') rotate(dx * .009, dy * .009);
    }
  });
  canvas.addEventListener('pointerup', event => {
    if (!pointers.delete(event.pointerId) || pointers.size || view !== 'globe') return;
    draw();
    if (gestureMoved) selectFacingCity();
    else {
      const id = pick(event.clientX, event.clientY);
      if (id) onEnter(id);
    }
  });
  for (const name of ['pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(name, event => {
      if (pointers.delete(event.pointerId)) gestureMoved = true;
    });
  }
  canvas.addEventListener('wheel', event => {
    if (!renderer && !streetVisible) return;
    event.preventDefault();
    zoom(Math.exp(-event.deltaY * .0014));
  }, { passive: false });
  canvas.addEventListener('keydown', event => {
    if (view === 'globe' && event.key === 'Enter') {
      event.preventDefault();
      onEnter(selected);
      return;
    }
    if (!renderer && !streetVisible) return;
    const directions = { ArrowLeft: [-.15, 0], ArrowRight: [.15, 0], ArrowUp: [0, -.15], ArrowDown: [0, .15] };
    if (view === 'globe' && directions[event.key]) {
      event.preventDefault();
      rotate(...directions[event.key]);
      draw();
      selectFacingCity();
    } else if (['+', '=', '-'].includes(event.key)) {
      event.preventDefault();
      zoom(event.key === '-' ? .9 : 1.1);
    }
  });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    renderer = null;
    stage.classList.add('illustrated');
    canvas.style.opacity = '0';
    if (view === 'globe') showGlobe(selected);
    else showCity(selected, hallsBuilt);
  });
  new ResizeObserver(layout).observe(stage);
  let previousTime = 0, walkingTime = 0;
  function frame(now, elapsed, moving) {
    if (marketFlight) {
      const t = Math.min(1, (now - marketFlight.start) / 850);
      const ease = t * t * (3 - 2 * t);
      yaw = marketFlight.yaw + marketFlight.dx * ease;
      pitch = marketFlight.pitch + marketFlight.dy * ease;
      routes.reveal(t);
      if (t === 1) marketFlight = null;
      needsDraw = true;
    }
    if (marketShownUntil && now >= marketShownUntil) {
      stopMarketFocus();
      cityFlag.hidden = view !== 'globe';
      needsDraw = true;
    }
    if (moving) walkingTime += Math.max(0, elapsed - previousTime) * crewPace;
    previousTime = elapsed;
    if (!renderer) return;
    if (view === 'city' && !streetVisible && !reducedMotion.matches && now >= nextWalkFrame && moving) {
      nextWalkFrame = now + 1000 / 24;
      walkers.forEach(({ part, x, y }, i) => {
        part.position.x = x + .3 * Math.sin(walkingTime * .85 + i);
        part.position.y = y + .016 * Math.abs(Math.sin(walkingTime * 5 + i));
      });
      needsDraw = true;
    }
    if (view === 'city' && buildingDrop) {
      const t = Math.min(1, (now - buildingDrop.start) / 350);
      buildingDrop.part.position.y = buildingDrop.y + .65 * (1 - t) ** 2;
      if (t === 1) buildingDrop = null;
      needsDraw = true;
    }
    if (needsDraw) draw();
  }
  return { showCity, showGlobe, frame, openMarket, resetMarkets, setOperations, setProtestCity, focusDistrict };
}
