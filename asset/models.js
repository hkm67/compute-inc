/* Compute, Inc. procedural asset kit. Three.js r160; no image textures or model downloads. */
'use strict';

globalThis.ComputeAssets = (() => {
  const palette = Object.freeze({
    server: 0xeb6635, serverSide: 0x303d3f, indicator: 0x62dfbc,
    enamel: 0xffedca, brass: 0xf4bb4a,
    grass: 0x9cbe77, path: 0xd9cfb0, roof: 0xb76556,
    robot: 0xe2edf0, skin: 0xe7ad7d, ocean: 0x438eaf, land: 0x7fa256
  });
  const variants = Object.freeze({
    datacentre: Object.freeze(['Hot Spare', 'Fan Club', 'Liquid Lunch', 'Tape Deck']),
    robot: Object.freeze(['Receipt Clerk', 'Forklift', 'Sweep Unit', 'Mail Cart', 'Policy Patrol']),
    human: Object.freeze(['Commuter', 'Cook', 'Courier', 'Mechanic', 'Gardener'])
  });
  // Approximate monument/viewpoint coordinates, in longitude/latitude order.
  const landmarks = Object.freeze([
    ['paris','Paris','Eiffel Tower',2.29,48.86,'The Performance Review'],
    ['giza','Giza','Pyramids of Giza',31.13,29.98,'Deep Storage'],
    ['beijing','Beijing','Great Wall at Badaling',116.02,40.36,'The Great Conveyor'],
    ['agra','Agra','Taj Mahal',78.04,27.18,'Mandatory Tea Break'],
    ['rome','Rome','Colosseum',12.49,41.89,'The Layoff Shredder'],
    ['sydney','Sydney','Sydney Opera House',151.22,-33.86,'Canned Applause'],
    ['newyork','New York','Statue of Liberty',-74.04,40.69,'Tap to Enter'],
    ['rio','Rio de Janeiro','Christ the Redeemer',-43.21,-22.95,'The Payroll Scales'],
    ['fujiyoshida','Fujiyoshida','Mount Fuji and Chureito Pagoda',138.81,35.50,'The Pencil Sharpener'],
    ['london','London','Elizabeth Tower',-.12,51.50,'The Final Clock-Out'],
    ['chichenitza','Chichén Itzá','El Castillo',-88.57,20.68,'Inbox Zero'],
    ['machupicchu','Machu Picchu','Machu Picchu citadel',-72.55,-13.16,'The Server Farm'],
    ['athens','Athens','Parthenon',23.73,37.97,'Approved by Athens'],
    ['singapore','Singapore','Marina Bay Sands',103.86,1.28,'House Always Wins'],
    ['niagara','Niagara Falls','Horseshoe Falls',-79.08,43.08,'Metered Water'],
    ['barcelona','Barcelona','Sagrada Família',2.17,41.40,'Wireless Communion'],
    ['dubai','Dubai','Burj Al Arab',55.19,25.14,'Offshore Payroll'],
    ['moscow','Moscow','Saint Basil’s Cathedral',37.62,55.75,'The Idea Factory'],
    ['rapanui','Rapa Nui','Moai at Ahu Tongariki',-109.28,-27.13,'Your Call Is Important'],
    ['capetown','Cape Town','Table Mountain',18.40,-33.96,'The Executive Desk']
  ].map(([id,city,title,lon,lat,takeoverTitle]) => Object.freeze({id,city,title,takeoverTitle,coordinate:Object.freeze([lon,lat])})));
  const cityIds = Object.freeze([...landmarks.map(place => place.id), 'tokyo']);

  // X runs along the principal street and +Z faces the waterfront or foreground.
  // Each row describes a compressed neighbourhood rather than a surveyed block.
  const streetPlans = {
    quay: [[-3.88,-2.52],[-2.32,-2.55],[-.77,-2.53],[.78,-2.61],[2.33,-2.53],[3.89,-2.54],[-3.78,-1.1,.12],[-3.77,.21,.12],[3.75,-1.1,-.15],[3.78,.21,-.15]],
    lanes: [[-3.88,-2.5],[-2.32,-2.63],[.1,-2.63],[2.25,-2.54],[3.82,-2.41],[-3.51,-1.04,.18],[3.57,-.60,-.22],[-3.77,.34,.13],[-3.64,2.56],[3.64,2.51,-.13]],
    hillside: [[-3.88,-2.56],[-2.38,-2.68],[-.84,-2.55],[.77,-2.68],[2.35,-2.56],[3.86,-2.65],[-3.5,-1.03,.12],[-3.77,.22,.14],[3.45,-1.0,-.14],[3.77,.29,-.14]],
    grid: [[-3.75,-2.54],[-2.15,-2.54],[0,-2.54],[2.14,-2.54],[3.76,-2.54],[-3.70,-.94],[3.70,-.92],[-3.70,.55],[-3.68,2.54],[3.68,2.54]],
    garden: [[-3.84,-2.56],[-2.18,-2.65],[.13,-2.60],[2.15,-2.67],[3.85,-2.56],[-3.67,-1.05,.12],[3.65,-.92,-.16],[-3.68,.32,.12],[-3.53,2.55,.12],[3.48,2.52,-.12]]
  };
  // Specific blocks break the perimeter in places where the local street plan calls for it.
  const localPlots = {
    capetown: [[-3.65,-2.64],[-2.31,-2.64],[-.97,-2.64],[1.37,-2.64],[2.71,-2.64],[4.05,-2.64],[-3.59,-.98,.78],[3.59,-.98,-.78],[-3.49,2.61,.09],[3.64,2.62,-.12]],
    newyork: [[-3.82,-2.70],[-2.54,-2.70],[-1.26,-2.70],[1.39,-2.70],[2.67,-2.70],[3.95,-2.70],[-3.94,-.75,1.57],[-3.94,.50,1.57],[3.85,-.34,-1.57],[3.66,2.58]],
    barcelona: [[-3.90,-2.66],[-2.38,-2.66],[.68,-2.66],[2.20,-2.66],[3.75,-2.66],[-3.80,-.98],[-3.80,.25],[3.72,-.61],[3.72,.60],[-3.72,2.62]],
    rapanui: [[-4.02,-2.41,.30],[-2.49,-2.64,.20],[-.86,-2.73,-.18],[1.04,-2.42,-.26],[2.66,-2.65,.10],[4.00,-2.21,-.30],[-3.58,-.98,.48],[-3.92,.29,.21],[3.39,-.92,-.54],[3.79,.30,-.32]],
    rio: [[-3.89,-2.50,.10],[-2.53,-2.70],[-1.19,-2.52,.07],[.65,-2.68],[2.02,-2.51,.10],[3.40,-2.70],[-3.53,-.99,.74],[-3.95,.26,.27],[3.55,-.91,-.37],[4.02,.33,-.18]],
    rome: [[-3.86,-2.63,.23],[-2.37,-2.55,.06],[-.59,-2.73,-.04],[1.81,-2.65,-.20],[3.53,-2.45,-.27],[-3.77,-1.02,.62],[3.63,-.98,-.65],[-3.89,.42,.29],[-3.76,2.63,-.35],[3.62,2.67,.30]]
  };
  const neighbourhoods = Object.fromEntries([
    // site, street plan, ground, street surface, roof, wall colours
    ['paris','quay',0xd8c8ac,0x8d9390,0x525e70,[0xf1ddbd,0xe5cda8,0xf1d5ae]],
    ['giza','garden',0xe6bc78,0xc79a62,0xbb8c63,[0xc88758,0xdcac77,0xb9774e]],
    ['beijing','garden',0x96a87c,0xb6a78c,0x49565b,[0xb4b4a4,0xc5c0aa,0xa29d8c]],
    ['agra','garden',0xcda575,0xb69a7a,0xb15d45,[0xd48b64,0xc27458,0xf1c886]],
    ['rome','lanes',0xd5bf9a,0x9d9180,0xb05f43,[0xe8b46d,0xd58e6a,0xefcc9c]],
    ['sydney','quay',0xc6b794,0x9ca595,0x955b50,[0xe1cda4,0xe9b895,0xc5c5ad]],
    ['newyork','grid',0xb9aea1,0x65716e,0x676869,[0xaa614b,0xcc9674,0x916252]],
    ['rio','hillside',0x93ae71,0xb0a48b,0xb1684d,[0xe7a160,0x72b7ad,0xe6c071,0xd88176]],
    ['fujiyoshida','lanes',0x99af86,0x8c9690,0x4c6570,[0xe3cda8,0xc3b39d,0xe1d9c0]],
    ['london','lanes',0xc0b6a1,0x747c7a,0x596763,[0xa16652,0xc79371,0x99725f]],
    ['chichenitza','garden',0xbdc28a,0xe3d5ac,0xbd9055,[0xf4dfad,0xcda879,0xe7be95]],
    ['machupicchu','hillside',0x849e69,0xb7ae91,0x995746,[0xc48f6e,0xe3b383,0xbb9f7d]],
    ['athens','hillside',0xd3bc97,0xc7b99d,0xb66c49,[0xf0d6af,0xe5bd7b,0xe5c4ad]],
    ['singapore','quay',0xb3c18f,0xa0a6a2,0xb46b4f,[0x92c8b0,0xf2bba6,0xe1d29c,0x9ecad1]],
    ['niagara','quay',0x91af79,0xa6a197,0x547163,[0xc8b89a,0xdfc9a5,0xb9a991]],
    ['barcelona','grid',0xcaba9f,0x8b9390,0xb77054,[0xe1b37d,0xd9c6a6,0xd68e70]],
    ['dubai','quay',0xd9bf91,0xcab592,0xba9a75,[0xe7cca1,0xfbdfad,0xd8bb8f]],
    ['moscow','grid',0xd9e2db,0x8f9b9c,0x6d8584,[0xe4bd9d,0xc5c8a9,0xe8d1b3]],
    ['rapanui','quay',0x92ab6a,0xb39678,0x817b71,[0xdbba8e,0xafb898,0xc99572]],
    ['capetown','hillside',0xb3ac8e,0xa49d89,0xcc9d71,[0xfc967c,0x69c1b3,0xffca63,0x76b6d8,0xdb8dac]]
  ].map(([city, plan, ground, street, roof, walls]) => [city, {plan,ground,street,roof,walls}]));

  function createKit(T) {
    if (!T?.Group) throw new TypeError('Pass the Three.js namespace to ComputeAssets.createKit().');
    const materials = new Map();
    const sharedMaterials = new Set();
    function material(color) {
      if (!materials.has(color)) {
        const value = new T.MeshStandardMaterial({ color, roughness: .78, flatShading: true });
        materials.set(color, value);
        sharedMaterials.add(value);
      }
      return materials.get(color);
    }
    function mesh(parent, geometry, color, x = 0, y = 0, z = 0) {
      const object = new T.Mesh(geometry, material(color));
      object.position.set(x, y, z);
      object.castShadow = object.receiveShadow = true;
      parent.add(object);
      return object;
    }
    function box(parent, w, h, d, color, x = 0, y = h / 2, z = 0) {
      return mesh(parent, new T.BoxGeometry(w, h, d), color, x, y, z);
    }
    function cone(parent, r, h, color, x = 0, y = h / 2, z = 0, sides = 5) {
      return mesh(parent, new T.ConeGeometry(r, h, sides), color, x, y, z);
    }
    function ball(parent, r, color, x = 0, y = 0, z = 0, detail = 0) {
      return mesh(parent, new T.IcosahedronGeometry(r, detail), color, x, y, z);
    }
    function beam(parent, a, b, r, color) {
      const start = new T.Vector3(...a), end = new T.Vector3(...b);
      const delta = end.clone().sub(start);
      const object = mesh(parent, new T.CylinderGeometry(r, r, delta.length(), 5), color);
      object.position.copy(start.add(end).multiplyScalar(.5));
      object.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), delta.normalize());
      return object;
    }
    function group(name) {
      const result = new T.Group();
      result.name = name;
      return result;
    }
    function place(parent, object, x, y, z, scale = 1) {
      object.position.set(x, y, z);
      object.scale.setScalar(scale);
      parent.add(object);
      return object;
    }
    function checkCity(city) {
      if (!cityIds.includes(city)) throw new RangeError(`Unknown city: ${city}`);
    }
    function progress(value) {
      if (!Number.isFinite(value)) throw new TypeError('Takeover must be a finite percentage.');
      return Math.max(0, Math.min(100, value));
    }

    const ink = 0x243c41,
      graphite = 0x455559,
      porcelain = 0xffebc5;
    const vermilion = 0xea6737,
      gold = 0xf4b439,
      mint = 0x64debb,
      teal = 0x377f82;
    const modelMasters = new Map();

    function ellipsoid(parent, x, y, z, rx, ry, rz, color, sides = 10) {
      const object = mesh(parent, new T.SphereGeometry(1, sides, 6), color, x, y, z);
      object.scale.set(rx, ry, rz);
      return object;
    }

    function drum(parent, x, y, z, bottom, top, height, color, sides = 12) {
      return mesh(parent, new T.CylinderGeometry(top, bottom, height, sides), color, x, y, z);
    }

    // Four rings give the castings bevelled shoulders and clipped corners in all three views.
    function casing(parent, x, y, z, w, h, d, color, bevel = 0.06) {
      const cut = Math.min(w, d) * 0.17;
      const lip = Math.min(bevel, h * 0.24, cut * 0.7);
      const vertices = [],
        indices = [];
      for (const [dy, inset] of [
        [-h / 2, lip],
        [-h / 2 + lip, 0],
        [h / 2 - lip, 0],
        [h / 2, lip]
      ]) {
        const a = w / 2 - inset,
          b = d / 2 - inset,
          c = cut - inset * 0.45;
        const corners = [
          [-a + c, -b],
          [-a, -b + c],
          [-a, b - c],
          [-a + c, b],
          [a - c, b],
          [a, b - c],
          [a, -b + c],
          [a - c, -b]
        ];
        for (const [px, pz] of corners) vertices.push(px, dy, pz);
      }
      for (let ring = 0; ring < 3; ring++)
        for (let i = 0; i < 8; i++) {
          const a = ring * 8 + i,
            b = ring * 8 + ((i + 1) % 8);
          indices.push(a, b, b + 8, a, b + 8, a + 8);
        }
      for (let i = 1; i < 7; i++) indices.push(0, i + 1, i, 24, 24 + i, 25 + i);
      const geometry = new T.BufferGeometry();
      geometry.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      return mesh(parent, geometry, color, x, y, z);
    }

    function faceDisc(parent, x, y, z, r, depth, color, sides = 14) {
      const disc = drum(parent, x, y, z, r, r, depth, color, sides);
      disc.rotation.x = Math.PI / 2;
      return disc;
    }

    function pipe(parent, points, r, color) {
      for (let i = 1; i < points.length; i++) {
        beam(parent, points[i - 1], points[i], r, color);
        if (i < points.length - 1) ellipsoid(parent, ...points[i], r, r, r, color, 8);
      }
    }

    function rackDrawers(g, x, y, z, w, count, pitch) {
      for (let i = 0; i < count; i++) {
        const row = y + i * pitch;
        casing(g, x, row, z, w, pitch * 0.81, 0.052, ink, 0.012);
        box(g, w * 0.42, 0.015, 0.017, 0x758988, x - w * 0.14, row, z + 0.032);
        for (const dx of [0.19, 0.32]) box(g, 0.032, 0.031, 0.018, mint, x + w * dx, row, z + 0.035);
      }
    }

    function datacentreBody(g, variant) {
      const w = [1.03, 1.2, 1.16, 1.26][variant];
      casing(g, 0, 0.074, 0, w, 0.148, 0.78, graphite);
      // A service entrance and canopy at street level establish scale on the city plots.
      const doorX = w * 0.31;
      casing(g, doorX, 0.19, 0.371, 0.18, 0.29, 0.054, porcelain, 0.018);
      box(g, 0.023, 0.06, 0.018, ink, doorX + 0.045, 0.19, 0.404);
      casing(g, doorX, 0.35, 0.39, 0.25, 0.04, 0.14, graphite, 0.01);

      if (variant === 0) {
        // Two upright hot-swap blades sticking out of a toaster-shaped chassis.
        casing(g, 0, 0.53, -0.006, 0.9, 0.87, 0.63, vermilion, 0.08);
        casing(g, 0, 0.98, -0.02, 0.99, 0.13, 0.7, porcelain);
        for (const [slot, z] of [
          [0, -0.17],
          [1, 0.12]
        ]) {
          casing(g, 0, 1.046, z, 0.77, 0.025, 0.115, ink, 0.008);
          const card = place(g, group('compute-blade'), slot ? 0.04 : -0.06, 1.04, z);
          card.rotation.z = slot ? -0.07 : 0.09;
          const h = slot ? 0.26 : 0.43;
          casing(card, 0, h / 2, 0, 0.65, h, 0.078, slot ? gold : 0xc78045, 0.026);
          casing(card, 0, h * 0.84, 0, 0.69, 0.062, 0.096, porcelain, 0.02);
          for (const dx of [-0.2, 0, 0.2]) box(card, 0.1, h * 0.46, 0.022, graphite, dx, h * 0.43, 0.044);
          for (const dx of [-0.21, -0.07, 0.07, 0.21]) box(card, 0.046, 0.04, 0.024, gold, dx, 0.038, 0.054);
        }
        rackDrawers(g, -0.035, 0.195, 0.32, 0.6, 4, 0.195);
        for (const y of [0.33, 0.47, 0.61]) box(g, 0.026, 0.046, 0.28, ink, 0.457, y, -0.045);
        pipe(
          g,
          [
            [-0.44, 0.33, 0.09],
            [-0.52, 0.33, 0.09],
            [-0.52, 0.65, 0.09]
          ],
          0.032,
          graphite
        );
        ellipsoid(g, -0.52, 0.68, 0.09, 0.068, 0.053, 0.064, gold);
      } else if (variant === 1) {
        // A ducted cooling hall built around a single absurdly large fan.
        casing(g, 0, 0.43, -0.02, 1.09, 0.68, 0.64, vermilion);
        casing(g, -0.13, 0.72, -0.01, 0.83, 0.81, 0.58, porcelain, 0.1);
        faceDisc(g, -0.14, 0.72, 0.306, 0.385, 0.105, graphite, 20);
        faceDisc(g, -0.14, 0.72, 0.364, 0.329, 0.035, ink, 20);
        for (let i = 0; i < 7; i++) {
          const pivot = place(g, group('impeller'), -0.14, 0.72, 0.39);
          pivot.rotation.z = (i * 2 * Math.PI) / 7;
          const blade = new T.Shape();
          blade.moveTo(-0.035, 0.075);
          blade.quadraticCurveTo(0.003, 0.19, -0.035, 0.301);
          blade.quadraticCurveTo(0.05, 0.327, 0.129, 0.282);
          blade.quadraticCurveTo(0.146, 0.17, 0.05, 0.083);
          blade.closePath();
          mesh(pivot, new T.ExtrudeGeometry(blade, { depth: 0.018, bevelEnabled: false, curveSegments: 4 }), 0x86a9a3);
        }
        faceDisc(g, -0.14, 0.72, 0.425, 0.1, 0.042, gold);
        for (const [i, y] of [
          [0, 0.82],
          [1, 1.01]
        ]) {
          const x = 0.355 + i * 0.045;
          drum(g, x, y / 2, -0.09, 0.105, 0.105, y, graphite);
          drum(g, x, y + 0.015, -0.09, 0.14, 0.15, 0.07, vermilion);
          drum(g, x, y + 0.053, -0.09, 0.1, 0.1, 0.016, ink);
        }
        rackDrawers(g, 0.32, 0.23, 0.316, 0.3, 2, 0.13);
        for (const z of [-0.19, -0.02, 0.15]) box(g, 0.03, 0.25, 0.045, ink, 0.55, 0.49, z);
      } else if (variant === 2) {
        // Amber immersion vessels with visible liquid bands, joined by a return pipe.
        casing(g, 0, 0.3, 0, 1.07, 0.48, 0.68, vermilion);
        rackDrawers(g, -0.14, 0.22, 0.341, 0.54, 2, 0.13);
        for (const [x, h] of [
          [-0.28, 0.64],
          [0.25, 0.47]
        ]) {
          const z = -0.06;
          drum(g, x, 0.55, z, 0.246, 0.246, 0.11, graphite, 16);
          drum(g, x, 0.6 + h / 2, z, 0.196, 0.206, h, 0x328e88, 16);
          for (let i = 0; i < 3; i++) drum(g, x, 0.64 + (h * i) / 3, z, 0.2, 0.202, 0.055, i === 1 ? mint : 0x62ba9d, 16);
          for (const dx of [-0.14, 0.14]) beam(g, [x + dx, 0.61, z + 0.135], [x + dx, 0.58 + h, z + 0.14], 0.024, porcelain);
          drum(g, x, 0.61 + h, z, 0.255, 0.232, 0.11, porcelain, 16);
          drum(g, x, 0.68 + h, z, 0.16, 0.112, 0.06, graphite);
        }
        pipe(
          g,
          [
            [-0.28, 1.29, -0.06],
            [-0.28, 1.44, -0.06],
            [0.25, 1.44, -0.06],
            [0.25, 1.1, -0.06]
          ],
          0.049,
          gold
        );
        faceDisc(g, 0.37, 0.49, 0.32, 0.105, 0.055, graphite);
        faceDisc(g, 0.37, 0.49, 0.356, 0.075, 0.021, porcelain);
        beam(g, [0.37, 0.49, 0.373], [0.405, 0.534, 0.373], 0.011, vermilion);
      } else {
        // Tape goes around both hubs and disappears back into the archive.
        casing(g, 0, 0.39, 0, 1.14, 0.59, 0.67, vermilion);
        rackDrawers(g, -0.11, 0.24, 0.34, 0.68, 3, 0.13);
        casing(g, 0, 0.85, -0.065, 1.06, 0.55, 0.44, porcelain);
        for (const x of [-0.26, 0.26]) {
          faceDisc(g, x, 0.9, 0.18, 0.232, 0.082, ink, 18);
          faceDisc(g, x, 0.9, 0.228, 0.204, 0.028, x < 0 ? gold : 0xaab6a9, 18);
          for (let i = 0; i < 3; i++) {
            const a = (i * 2 * Math.PI) / 3 + 0.3;
            faceDisc(g, x + Math.cos(a) * 0.113, 0.9 + Math.sin(a) * 0.113, 0.248, 0.051, 0.014, graphite);
          }
          faceDisc(g, x, 0.9, 0.255, 0.05, 0.024, porcelain);
        }
        pipe(
          g,
          [
            [-0.44, 0.8, 0.211],
            [-0.34, 0.652, 0.211],
            [0.25, 0.655, 0.211],
            [0.45, 0.8, 0.211]
          ],
          0.019,
          ink
        );
        for (const x of [-0.42, 0.41]) casing(g, x, 1.14, -0.085, 0.12, 0.097, 0.23, graphite);
        for (let i = 0; i < 3; i++) box(g, 0.024, 0.105, 0.19, i === 1 ? gold : graphite, 0.578, 0.28 + i * 0.13, -0.035);
      }
    }

    // Curved screens and expressive eyes are shared across robots, regardless of chassis.
    function robotFace(g, x, y, z, w, h, mood = 'awake') {
      casing(g, x, y, z, w, h, 0.08, ink, 0.027);
      for (const side of [-1, 1]) {
        const eye = casing(g, x + side * w * 0.24, y, z + 0.047, w * 0.14, mood === 'sleepy' ? h * 0.18 : h * 0.42, 0.015, mint, 0.003);
        if (mood === 'stern') eye.rotation.z = side * 0.45;
      }
    }

    function tyre(g, x, y, z, r, wide) {
      const wheel = drum(g, x, y, z, r, r, wide, ink, 14);
      wheel.rotation.z = Math.PI / 2;
      const hub = drum(g, x + Math.sign(x) * wide * 0.5, y, z, r * 0.55, r * 0.55, 0.028, gold, 12);
      hub.rotation.z = Math.PI / 2;
    }

    function parcel(g, x, y, z, w, h, d) {
      casing(g, x, y, z, w, h, d, 0xc28c55, 0.023);
      box(g, w * 0.18, h + 0.012, d + 0.012, 0xf6ca78, x, y, z);
      box(g, w * 0.2, h * 0.27, 0.012, porcelain, x - w * 0.26, y + h * 0.12, z + d / 2 + 0.008);
    }

    function robotBody(g, variant) {
      if (variant === 0 || variant === 4) {
        const guard = variant === 4;
        for (const side of [-1, 1]) {
          const x = side * 0.18,
            z = side * 0.039;
          casing(g, x, 0.09, z + 0.054, 0.26, 0.18, 0.36, graphite);
          drum(g, x, 0.25, z, 0.064, 0.079, 0.23, 0xa5b1a4);
          drum(g, x, 0.3, z, 0.1, 0.1, 0.08, vermilion);
        }
        casing(g, 0, 0.54, 0, guard ? 0.66 : 0.51, 0.43, 0.36, guard ? ink : vermilion);
        casing(g, 0, 0.61, 0.184, guard ? 0.34 : 0.31, 0.17, 0.045, guard ? gold : porcelain, 0.018);
        if (guard) {
          for (const dx of [-0.078, 0.078]) {
            const stripe = box(g, 0.16, 0.04, 0.025, ink, dx, 0.61, 0.217);
            stripe.rotation.z = -Math.sign(dx) * 0.47;
          }
        } else {
          box(g, 0.24, 0.036, 0.024, ink, 0, 0.64, 0.217);
          const receipt = box(g, 0.178, 0.19, 0.022, porcelain, -0.012, 0.535, 0.24);
          receipt.rotation.x = -0.23;
          for (const y of [0.5, 0.54, 0.58]) box(g, 0.096, 0.014, 0.014, graphite, -0.013, y, 0.254 + (0.54 - y) * 0.23);
        }
        drum(g, 0, 0.8, 0, 0.1, 0.09, 0.16, graphite);
        const head = place(g, group('head'), 0, 0.98, 0);
        head.rotation.z = guard ? -0.05 : 0.11;
        casing(head, 0, 0, 0, guard ? 0.65 : 0.61, 0.36, 0.4, guard ? graphite : porcelain);
        robotFace(head, 0, -0.012, 0.205, guard ? 0.54 : 0.48, 0.216, guard ? 'stern' : 'awake');
        for (const side of [-1, 1]) {
          const cap = drum(head, side * (guard ? 0.325 : 0.304), 0, 0, 0.088, 0.088, 0.048, vermilion);
          cap.rotation.z = Math.PI / 2;
        }
        if (guard) {
          casing(head, 0.017, 0.2, 0, 0.68, 0.1, 0.48, ink);
          casing(head, 0.025, 0.185, 0.16, 0.73, 0.045, 0.42, graphite, 0.015);
          faceDisc(head, 0, 0.216, 0.239, 0.061, 0.025, gold);
        } else {
          beam(head, [-0.18, 0.17, 0], [-0.28, 0.35, -0.015], 0.019, graphite);
          ellipsoid(head, -0.28, 0.36, -0.015, 0.057, 0.057, 0.057, vermilion);
        }
        for (const side of [-1, 1]) {
          const end = side < 0 ? [-0.36, 0.39, 0.11] : [0.44, guard ? 0.78 : 0.91, 0.09];
          const elbow = side < 0 ? [-0.38, 0.5, 0] : [0.45, 0.59, 0];
          pipe(g, [[side * 0.28, 0.65, 0], elbow, end], 0.051, graphite);
          ellipsoid(g, ...elbow, 0.082, 0.081, 0.08, vermilion);
          if (side < 0 || !guard) {
            casing(g, ...end, 0.145, 0.135, 0.115, porcelain, 0.03);
            for (const dx of [-0.047, 0.047])
              casing(g, end[0] + dx, end[1] + (side > 0 ? 0.087 : -0.08), end[2] + 0.024, 0.052, 0.105, 0.077, porcelain, 0.015);
          } else {
            casing(g, 0.45, 0.81, 0.1, 0.255, 0.26, 0.12, gold);
            casing(g, 0.395, 1.0, 0.1, 0.096, 0.25, 0.12, gold);
            casing(g, 0.59, 0.84, 0.11, 0.087, 0.15, 0.11, gold).rotation.z = -0.38;
            box(g, 0.084, 0.035, 0.015, vermilion, 0.45, 0.815, 0.168);
          }
        }
      } else if (variant === 1) {
        for (const x of [-0.245, 0.245])
          for (const [z, r] of [
            [-0.22, 0.136],
            [0.16, 0.165]
          ])
            tyre(g, x, r, z, r, 0.12);
        casing(g, 0, 0.292, -0.048, 0.56, 0.33, 0.64, gold);
        casing(g, 0, 0.52, -0.13, 0.46, 0.23, 0.39, vermilion);
        robotFace(g, 0, 0.6, 0.08, 0.39, 0.15);
        for (const x of [-0.21, 0.21]) beam(g, [x, 0.43, -0.27], [x, 0.83, -0.27], 0.029, graphite);
        casing(g, 0, 0.84, -0.17, 0.53, 0.075, 0.39, porcelain);
        for (const x of [-0.19, 0.19]) {
          box(g, 0.054, 0.75, 0.069, graphite, x, 0.48, 0.27);
          box(g, 0.09, 0.051, 0.53, porcelain, x, 0.29, 0.49);
        }
        box(g, 0.44, 0.061, 0.065, graphite, 0, 0.24, 0.29);
        const load = place(g, group('load'), 0.018, 0.445, 0.433);
        load.rotation.y = 0.2;
        load.rotation.z = 0.045;
        parcel(load, 0, 0, 0, 0.51, 0.25, 0.32);
        drum(g, -0.245, 0.54, -0.15, 0.046, 0.046, 0.28, ink);
      } else if (variant === 2) {
        casing(g, 0, 0.245, -0.04, 0.5, 0.29, 0.43, teal);
        for (const x of [-0.18, 0.18]) tyre(g, x, 0.12, -0.14, 0.12, 0.075);
        for (const x of [-0.23, 0.23]) {
          drum(g, x, 0.086, 0.186, 0.174, 0.135, 0.11, porcelain);
          for (let i = 0; i < 9; i++) {
            const a = (i * 2 * Math.PI) / 9;
            box(g, 0.038, 0.063, 0.048, i % 2 ? teal : ink, x + 0.141 * Math.cos(a), 0.036, 0.186 + 0.141 * Math.sin(a)).rotation.y = -a;
          }
          drum(g, x, 0.15, 0.186, 0.115, 0.085, 0.032, vermilion);
        }
        pipe(
          g,
          [
            [0, 0.38, -0.07],
            [0.08, 0.55, -0.07],
            [0.1, 0.75, -0.035]
          ],
          0.069,
          graphite
        );
        const head = place(g, group('head'), 0.09, 0.86, 0);
        head.rotation.z = -0.12;
        ellipsoid(head, 0, 0.025, -0.018, 0.26, 0.21, 0.19, porcelain);
        robotFace(head, 0, 0.0, 0.14, 0.38, 0.16, 'sleepy');
        drum(head, 0, 0.207, -0.04, 0.067, 0.025, 0.13, vermilion);
        pipe(
          g,
          [
            [-0.19, 0.34, 0],
            [-0.31, 0.44, 0],
            [-0.38, 0.41, 0.08]
          ],
          0.038,
          graphite
        );
        beam(g, [-0.46, 0.2, 0.1], [-0.28, 0.93, 0.08], 0.029, gold);
        casing(g, -0.47, 0.175, 0.11, 0.24, 0.09, 0.11, teal).rotation.z = 0.24;
      } else {
        for (const x of [-0.22, 0.22]) for (const z of [-0.19, 0.18]) tyre(g, x, 0.125, z, 0.125, 0.091);
        casing(g, 0, 0.32, 0, 0.57, 0.29, 0.62, vermilion);
        casing(g, 0, 0.57, 0, 0.55, 0.32, 0.56, porcelain);
        robotFace(g, 0, 0.56, 0.274, 0.45, 0.17);
        const bag = place(g, group('cargo'), -0.01, 0.77, -0.025);
        bag.rotation.z = 0.07;
        parcel(bag, 0, 0.08, 0, 0.54, 0.16, 0.46);
        parcel(bag, 0.02, 0.25, -0.035, 0.41, 0.18, 0.36);
        const envelope = casing(bag, -0.045, 0.4, -0.02, 0.39, 0.1, 0.31, porcelain, 0.013);
        envelope.rotation.y = -0.14;
        pipe(
          g,
          [
            [0.27, 0.42, -0.24],
            [0.34, 0.57, -0.24],
            [0.34, 1.05, -0.24]
          ],
          0.024,
          graphite
        );
        box(g, 0.21, 0.15, 0.033, vermilion, 0.425, 1.02, -0.24);
        for (const z of [-0.17, 0.15]) box(g, 0.025, 0.15, 0.083, teal, -0.279, 0.59, z);
      }
    }

    function humanBody(g, variant, sign) {
      const skin = [0xb97852, 0x925637, 0xebaf81, 0xc98a64, 0xaf7657][variant];
      const hair = [0x513930, 0x392f2c, 0x935d3b, 0x463a34, 0x725242][variant];
      const coat = [0x3b616c, 0xf6e3bd, 0xd5813d, 0x427f7f, 0x74925c][variant];
      const trousers = [0x344953, 0x585853, 0x596c71, 0x3f5856, 0x556758][variant];
      const lean = [0.085, -0.035, -0.11, 0.058, -0.06][variant];
      const stance = [0.112, 0.14, 0.117, 0.155, 0.115][variant];
      for (const side of [-1, 1]) {
        const footZ = side * (variant === 0 ? 0.085 : 0.048);
        casing(g, side * stance, 0.062, footZ + 0.046, 0.18, 0.124, 0.276, 0x493f39, 0.032);
        beam(g, [side * 0.085, 0.46, 0], [side * stance, 0.12, footZ], 0.076, trousers);
        drum(g, side * stance, 0.144, footZ, 0.076, 0.076, 0.052, trousers);
      }
      casing(g, 0, 0.43, 0, 0.39, 0.19, 0.26, trousers, 0.045);
      const upper = place(g, group('upper-body'), 0, 0.44, 0);
      upper.rotation.z = lean;
      upper.scale.set([0.91, 1.15, 0.89, 1.12, 0.97][variant], [1.07, 0.95, 1.04, 0.92, 1][variant], 1);
      const wide = variant === 1 ? 0.46 : 0.415;
      casing(upper, 0, 0.2, 0, wide, 0.41, 0.28, coat, 0.067);
      drum(upper, 0, 0.421, 0, 0.076, 0.081, 0.14, skin);

      if (variant === 0) {
        box(upper, 0.081, 0.3, 0.019, porcelain, 0, 0.21, 0.146);
        for (const side of [-1, 1]) {
          const lapel = casing(upper, side * 0.087, 0.285, 0.152, 0.078, 0.221, 0.027, 0x597d80);
          lapel.rotation.z = -side * 0.4;
        }
        casing(upper, 0.004, 0.245, 0.172, 0.037, 0.18, 0.023, vermilion, 0.01).rotation.z = -0.1;
        box(upper, 0.074, 0.023, 0.019, porcelain, 0.135, 0.265, 0.157);
      } else if (variant === 1 || variant === 4) {
        if (variant === 1) ellipsoid(upper, 0, 0.156, 0.018, 0.236, 0.198, 0.17, coat, 12);
        const apron = variant === 1 ? 0x527b73 : 0xb58652;
        casing(upper, 0, 0.035, variant === 1 ? 0.18 : 0.152, 0.32, 0.28, 0.03, apron, 0.017);
        box(upper, 0.22, 0.21, 0.029, apron, 0, 0.246, 0.154);
        for (const side of [-1, 1]) box(upper, 0.033, 0.17, 0.025, apron, side * 0.085, 0.318, 0.156);
        box(upper, 0.135, 0.076, 0.021, variant === 1 ? 0x77968a : 0xe0ae68, 0, 0.087, variant === 1 ? 0.2 : 0.175);
        if (variant === 1)
          for (const y of [0.25, 0.316]) for (const x of [-0.153, 0.153]) faceDisc(upper, x, y, 0.145, 0.014, 0.015, ink, 8);
      } else if (variant === 2) {
        box(upper, 0.068, 0.46, 0.04, 0x665746, 0.04, 0.222, 0.15).rotation.z = -0.72;
        casing(upper, -0.179, 0.04, 0.03, 0.17, 0.19, 0.22, 0x527777, 0.028);
        box(upper, 0.093, 0.075, 0.02, porcelain, 0.127, 0.304, 0.148);
      } else {
        for (const side of [-1, 1]) {
          box(upper, 0.055, 0.27, 0.025, 0x57706a, side * 0.124, 0.26, 0.15);
          faceDisc(upper, side * 0.123, 0.277, 0.172, 0.02, 0.012, gold, 8);
        }
        casing(upper, 0, 0.1, 0.151, 0.33, 0.23, 0.04, 0x57706a);
        box(upper, 0.15, 0.09, 0.024, 0x345853, 0.0, 0.15, 0.186);
      }

      const head = place(upper, group('head'), 0.0, 0.613, 0.005);
      head.rotation.z = [-0.13, 0.055, 0.075, -0.07, 0.085][variant];
      head.rotation.y = [-0.12, 0.03, -0.13, 0.13, 0.08][variant];
      ellipsoid(head, 0, 0.0, 0, 0.203, 0.222, 0.18, skin, 12);
      for (const side of [-1, 1]) {
        ellipsoid(head, side * 0.193, -0.012, 0.003, 0.045, 0.063, 0.041, skin, 8);
        ellipsoid(head, side * 0.079, 0.025, 0.159, 0.022, 0.03, 0.014, ink, 8);
        const brow = box(head, 0.07, 0.018, 0.029, hair, side * 0.079, 0.081 + (variant === 0 && side > 0 ? 0.022 : 0), 0.15);
        brow.rotation.z = side * (variant === 3 ? -0.21 : 0.1);
      }
      ellipsoid(head, 0, -0.016, 0.168, 0.052, 0.049, 0.052, skin);
      beam(head, [-0.049, -0.088, 0.151], [0.047, -0.091 + (variant === 0 ? -0.015 : 0.016), 0.15], 0.01, 0x774c3d);
      ellipsoid(head, 0, 0.121, -0.026, 0.202, 0.134, 0.174, hair);
      for (const side of [-1, 1]) ellipsoid(head, side * 0.171, 0.054, -0.032, 0.048, 0.093, 0.087, hair, 8);
      if (variant === 0) {
        ellipsoid(head, -0.065, 0.169, 0.036, 0.158, 0.101, 0.148, hair).rotation.z = 0.25;
        ellipsoid(head, 0.09, 0.148, 0.025, 0.108, 0.083, 0.14, hair);
        for (const x of [-0.081, 0.081]) {
          // Angular open frames leave the warm face and pupils visible.
          for (const y of [-0.013, 0.068]) box(head, 0.128, 0.015, 0.019, ink, x, y, 0.168);
          for (const dx of [-0.061, 0.061]) box(head, 0.013, 0.08, 0.019, ink, x + dx, 0.028, 0.168);
        }
        box(head, 0.04, 0.016, 0.019, ink, 0, 0.043, 0.171);
      } else if (variant === 1) {
        drum(head, 0, 0.173, -0.012, 0.174, 0.181, 0.135, porcelain);
        for (const [x, y, z, r] of [
          [-0.12, 0.261, 0, 0.101],
          [0.005, 0.292, -0.025, 0.13],
          [0.126, 0.258, -0.014, 0.105],
          [-0.036, 0.258, 0.051, 0.112]
        ]) {
          ellipsoid(head, x, y, z, r, r * 0.98, r, 0xffefd4);
        }
        ellipsoid(head, -0.02, -0.071, 0.153, 0.062, 0.021, 0.028, hair, 8);
        ellipsoid(head, 0.046, -0.068, 0.149, 0.051, 0.018, 0.025, hair, 8);
      } else if (variant === 2) {
        ellipsoid(head, 0, 0.136, -0.008, 0.221, 0.141, 0.19, teal);
        casing(head, 0.014, 0.144, 0.15, 0.32, 0.042, 0.205, teal, 0.016).rotation.x = -0.12;
        casing(head, 0, 0.195, 0.159, 0.092, 0.061, 0.024, porcelain, 0.012);
        ellipsoid(head, 0, -0.07, -0.162, 0.118, 0.092, 0.108, hair);
      } else if (variant === 3) {
        ellipsoid(head, -0.018, 0.162, -0.026, 0.205, 0.12, 0.175, 0xb75637);
        const band = casing(head, 0, 0.133, -0.005, 0.403, 0.071, 0.319, graphite, 0.025);
        band.rotation.z = -0.06;
        for (const side of [-1, 1]) {
          faceDisc(head, side * 0.088, 0.148, 0.143, 0.065, 0.039, porcelain);
          faceDisc(head, side * 0.088, 0.148, 0.17, 0.047, 0.021, teal);
        }
      } else {
        drum(head, 0, 0.152, 0, 0.295, 0.285, 0.036, 0xe4b767, 14).rotation.z = -0.045;
        drum(head, -0.014, 0.215, -0.012, 0.172, 0.138, 0.13, 0xd5a359);
        drum(head, -0.012, 0.166, -0.011, 0.175, 0.173, 0.036, 0x9c6241);
        // A braid falls out from beneath the brim and over one shoulder.
        for (const [x, y, r] of [
          [-0.146, 0.015, 0.082],
          [-0.171, -0.076, 0.073],
          [-0.179, -0.158, 0.059],
          [-0.179, -0.222, 0.041]
        ])
          ellipsoid(head, x, y, -0.076, r, r * 1.1, r, 0x918271, 8);
        drum(head, -0.179, -0.197, -0.076, 0.046, 0.048, 0.033, teal);
      }

      const poses = [
        [
          [-0.275, -0.008, 0.042],
          [0.275, 0.235, 0.195]
        ],
        [
          [-0.263, 0.075, 0.137],
          [0.3, 0.221, 0.092]
        ],
        [
          [-0.205, 0.142, 0.205],
          [0.204, 0.152, 0.205]
        ],
        [
          [-0.257, 0.064, 0.12],
          [0.273, 0.23, 0.112]
        ],
        [
          [-0.253, 0.071, 0.067],
          [0.269, 0.079, 0.13]
        ]
      ];
      const hands = poses[variant].map((p) => p.slice());
      if (sign) hands[1] = [0.27, 0.324, 0.125];
      for (const [i, hand] of hands.entries()) {
        const side = i ? 1 : -1;
        const elbow = [side * 0.275, 0.165, hand[2] * 0.48];
        beam(upper, [side * (wide * 0.45), 0.312, 0], elbow, 0.073, coat);
        ellipsoid(upper, ...elbow, 0.07, 0.066, 0.066, coat, 8);
        beam(upper, elbow, hand, 0.052, skin);
        ellipsoid(upper, ...hand, 0.066, 0.07, 0.066, skin, 8);
      }
      const [left, right] = hands;
      if (variant === 0) {
        casing(upper, left[0], left[1] - 0.16, left[2], 0.24, 0.21, 0.112, 0x805944, 0.03);
        pipe(
          upper,
          [
            [left[0] - 0.047, left[1] - 0.06, left[2]],
            [left[0] - 0.047, left[1], left[2]],
            [left[0] + 0.047, left[1], left[2]],
            [left[0] + 0.047, left[1] - 0.06, left[2]]
          ],
          0.014,
          graphite
        );
        if (!sign) {
          drum(upper, right[0], right[1] + 0.043, right[2] + 0.05, 0.043, 0.065, 0.134, porcelain);
          drum(upper, right[0], right[1] + 0.117, right[2] + 0.05, 0.071, 0.066, 0.024, ink);
        }
      } else if (variant === 1 && !sign) {
        beam(upper, right, [0.365, 0.531, 0.112], 0.023, 0x97633c);
        ellipsoid(upper, 0.373, 0.552, 0.112, 0.068, 0.091, 0.03, 0xbf8954);
      } else if (variant === 2) {
        const load = place(upper, group('parcel'), sign ? -0.125 : 0, 0.185, 0.218);
        load.rotation.z = sign ? 0.23 : -0.045;
        parcel(load, 0, 0, 0, sign ? 0.25 : 0.414, 0.224, 0.251);
      } else if (variant === 3 && !sign) {
        const tool = place(upper, group('spanner'), right[0], right[1], right[2] + 0.031);
        tool.rotation.z = -0.31;
        casing(tool, 0, 0.138, 0, 0.062, 0.34, 0.047, graphite, 0.015);
        for (const side of [-1, 1]) {
          beam(tool, [0, 0.291, 0], [side * 0.074, 0.342, 0], 0.033, graphite);
          beam(tool, [side * 0.074, 0.342, 0], [side * 0.077, 0.408, 0], 0.031, graphite);
        }
      } else if (variant === 4) {
        const can = place(upper, group('watering-can'), -0.31, -0.012, 0.09);
        drum(can, 0, -0.044, 0, 0.111, 0.139, 0.167, teal);
        pipe(
          can,
          [
            [0, 0.036, 0],
            [0, 0.113, 0],
            [0.068, 0.138, 0],
            [0.119, 0.05, 0]
          ],
          0.02,
          teal
        );
        beam(can, [-0.08, -0.087, 0], [-0.249, 0.052, 0.019], 0.037, teal);
        ellipsoid(can, -0.251, 0.06, 0.019, 0.06, 0.045, 0.043, gold);
      }
      if (sign) placard(upper, right, variant);
    }

    function placard(parent, hand, variant) {
      const sign = place(parent, group('placard'), ...hand);
      sign.rotation.z = variant % 2 ? -0.1 : 0.1;
      beam(sign, [0, -0.15, 0], [0, 0.52, 0], 0.022, 0x916c4e);
      casing(sign, 0, 0.435, 0.008, 0.46, 0.31, 0.04, porcelain, 0.02);
      const red = 0xbd513a,
        z = 0.039;
      if (variant % 3 === 0) {
        // A power switch with a strike through it.
        const ring = mesh(sign, new T.TorusGeometry(0.074, 0.014, 5, 14, Math.PI * 1.6), red, 0, 0.428, z);
        ring.rotation.z = Math.PI * 0.7;
        box(sign, 0.023, 0.091, 0.018, red, 0, 0.492, z);
      } else if (variant % 3 === 1) {
        for (const x of [-0.053, 0.053]) box(sign, 0.054, 0.149, 0.014, red, x, 0.438, z);
      } else {
        for (const x of [-0.076, 0.076]) box(sign, 0.036, 0.043, 0.015, red, x, 0.468, z);
        pipe(
          sign,
          [
            [-0.077, 0.381, z],
            [0, 0.411, z],
            [0.077, 0.381, z]
          ],
          0.014,
          red
        );
      }
    }

    function workforceModel(kind, variant, sign = false) {
      if (!Number.isSafeInteger(variant) || variant < 0) throw new RangeError('Model variant must be a non-negative safe integer.');
      const index = variant % variants[kind].length;
      const name = sign && kind === 'human' ? 'protester' : kind;
      const key = kind + '-' + index + (sign ? '-sign' : '');
      if (!modelMasters.has(key)) {
        const parts = group(name);
        if (kind === 'datacentre') datacentreBody(parts, index);
        else {
          if (kind === 'robot') {
            robotBody(parts, index);
            if (sign) placard(parts, [0.25, 0.59, 0.16], index);
          } else humanBody(parts, index, sign);
        }
        const scale = kind === 'datacentre' ? 1 : kind === 'robot' ? 0.43 : 0.45;
        const model = bakeGeometry(parts, name, new T.Vector3(), scale);
        modelMasters.set(key, model);
      }
      // Callers own and dispose their geometry. The masters avoid rebuilding the same figure per plot.
      const result = modelMasters.get(key).clone();
      result.children[0].geometry = result.children[0].geometry.clone();
      result.userData.variant = index;
      result.userData.model = variants[kind][index];
      return result;
    }

    function createDatacentre({ variant = 0 } = {}) {
      return workforceModel('datacentre', variant);
    }

    function createCharacter({ robot = false, sign = false, variant = 0 } = {}) {
      return workforceModel(robot ? 'robot' : 'human', variant, sign);
    }

    function createTree({ blossom = false } = {}) {
      const g = group(blossom ? 'blossom-tree' : 'tree');
      beam(g, [0,0,0], [0,.5,0], .045, 0x8f7052);
      ball(g, blossom ? .31 : .29, blossom ? 0xdab1be : 0x6a9b65, 0, blossom ? .64 : .6, 0, 1);
      return g;
    }

    // A low-poly solid between two horizontal rings, for stone plinths and roof pitches.
    function roofLoft(parent, width, depth, height, topW, topD, color, x, y, z) {
      const bottom = [
        [-width / 2, 0, -depth / 2],
        [width / 2, 0, -depth / 2],
        [width / 2, 0, depth / 2],
        [-width / 2, 0, depth / 2]
      ];
      const top = [
        [-topW / 2, height, -topD / 2],
        [topW / 2, height, -topD / 2],
        [topW / 2, height, topD / 2],
        [-topW / 2, height, topD / 2]
      ];
      const points = [];
      for (let i = 0; i < 4; i++) {
        const j = (i + 1) % 4;
        points.push(...bottom[i], ...top[i], ...top[j], ...bottom[i], ...top[j], ...bottom[j]);
      }
      points.push(...top[0], ...top[3], ...top[2], ...top[0], ...top[2], ...top[1]);
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.Float32BufferAttribute(points, 3));
      geo.computeVertexNormals();
      return mesh(parent, geo, color, x, y, z);
    }

    function footprint(parent, outline, height, color, x = 0, y = 0, z = 0, hole) {
      const path = (ring) => ring.map(([a, b]) => new T.Vector2(a, -b));
      const shape = new T.Shape(path(outline));
      if (hole) shape.holes.push(new T.Path(path(hole)));
      const geo = new T.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 1 });
      geo.rotateX(-Math.PI / 2);
      return mesh(parent, geo, color, x, y, z);
    }

    function neighbourhoodHouse(city, variant) {
      const theme = neighbourhoods[city];
      const wall = theme.walls[variant % theme.walls.length],
        roof = theme.roof;
      const g = group(city + '-house');
      const cream = 0xf3dfba,
        dark = 0x41575b,
        wood = 0x845e48,
        glass = 0x65878b;
      const b = (x, y, z, w, h, d, c) => box(g, w, h, d, c, x, y, z);
      const drum = (x, y, z, r0, r1, h, c, n = 10) => mesh(g, new T.CylinderGeometry(r1, r0, h, n), c, x, y, z);
      const roofAt = (w, d, h, tw, td, c, y) => roofLoft(g, w, d, h, tw, td, c, 0, y, 0);
      const ledge = (w, d, y, c = cream) => b(0, y, 0, w, 0.055, d, c);
      const chimney = (x, y, z, c) => {
        b(x, y + 0.13, z, 0.14, 0.26, 0.15, c);
        b(x, y + 0.27, z, 0.19, 0.055, 0.2, roof);
      };
      function windows(w, d, h, rows, cols, { shutters, balcony, band } = {}) {
        for (let row = 0; row < rows; row++) {
          const wy = 0.28 + ((row + 0.23) * (h - 0.28)) / rows,
            wh = Math.min(0.24, (h / (rows + 1)) * 0.58),
            ww = Math.min(0.18, (w / (cols + 1)) * 0.63);
          for (let col = 0; col < cols; col++) {
            const x = ((col - (cols - 1) / 2) * w) / (cols + 0.3);
            b(x, wy, d / 2 + 0.01, ww, wh, 0.035, dark);
            if (shutters) for (const side of [-1, 1]) b(x + side * ww * 0.72, wy, d / 2 + 0.035, ww * 0.34, wh * 1.13, 0.04, shutters);
            b(x, wy - wh * 0.52, d / 2 + 0.029, ww + 0.05, 0.026, 0.055, cream);
          }
          if (balcony && row > 0) {
            b(0, wy - wh * 0.48, d / 2 + 0.1, w * 0.94, 0.04, 0.22, cream);
            b(0, wy + 0.015, d / 2 + 0.205, w * 0.93, 0.037, 0.035, balcony);
            for (let i = 0; i < 6; i++) b((i - 2.5) * w * 0.17, wy - 0.038, d / 2 + 0.2, 0.026, 0.11, 0.025, balcony);
          }
          if (band) ledge(w + 0.02, d + 0.02, wy + wh * 0.73, band);
          for (const side of [-1, 1]) for (const z of [-d * 0.22, d * 0.22]) b(side * (w / 2 + 0.01), wy, z, 0.028, wh, ww, glass);
        }
      }
      function block(w, d, h, rows = 2, cols = 3, details = {}) {
        b(0, h / 2, 0, w, h, d, wall);
        windows(w, d, h, rows, cols, details);
        b(w * 0.3, 0.16, d / 2 + 0.026, 0.155, 0.31, 0.044, wood);
      }
      function parapet(w, d, y, c) {
        for (const z of [-d / 2, d / 2]) b(0, y + 0.065, z, w, 0.13, 0.055, c);
        for (const x of [-w / 2, w / 2]) b(x, y + 0.065, 0, 0.055, 0.13, d, c);
      }
      function veranda(w, d, y, c) {
        const deck = d / 2 + 0.17;
        b(0, 0.065, deck, w + 0.1, 0.13, 0.38, cream);
        for (const x of [-w * 0.44, 0, w * 0.44]) b(x, y * 0.5, deck + 0.11, 0.055, y, 0.055, c);
        b(0, y, deck, w + 0.13, 0.09, 0.46, c).rotation.x = 0.09;
      }
      function awning(w, front, y, c) {
        for (let i = 0; i < 7; i++) {
          const part = b(((i - 3) * w) / 7, y, front + 0.16, w / 7 + 0.008, 0.046, 0.4, i % 2 ? cream : c);
          part.rotation.x = 0.15;
          b(((i - 3) * w) / 7, y - 0.075, front + 0.34, w / 7 + 0.008, 0.09, 0.035, i % 2 ? cream : c);
        }
      }
      const v = variant % 3;
      switch (city) {
        case 'paris': {
          const h = 1.23 + v * 0.13;
          block(1.42, 0.9, h, 3, 4, { balcony: 0x414c4a, band: cream });
          ledge(1.51, 0.99, h);
          roofAt(1.5, 1.0, 0.42, 1.14, 0.57, roof, h);
          for (const x of [-0.44, 0, 0.44]) {
            b(x, h + 0.21, 0.43, 0.2, 0.24, 0.16, cream);
            b(x, h + 0.22, 0.52, 0.11, 0.15, 0.03, dark);
            b(x, h + 0.36, 0.43, 0.25, 0.055, 0.22, roof);
          }
          chimney(0.43, h + 0.4, -0.12, 0xb68c70);
          break;
        }
        case 'agra': {
          const w = 1.29,
            d = 0.79,
            h = 0.75 + v * 0.15;
          block(w, d, h, 2, 3, { shutters: 0x6a6854 });
          parapet(w, d, h, wall);
          // A projecting chhajja shades a colonnade with scalloped openings.
          for (const x of [-0.59, -0.2, 0.2, 0.59]) {
            b(x, 0.3, 0.64, 0.075, 0.58, 0.1, cream);
            b(x, 0.53, 0.64, 0.15, 0.065, 0.16, cream);
          }
          for (const x of [-0.395, 0, 0.395]) {
            const arch = [
              [-0.2, -0.1],
              [-0.2, 0.11],
              [0.2, 0.11],
              [0.2, -0.1],
              [0.15, -0.08],
              [0.13, -0.005],
              [0.075, 0.005],
              [0, 0.066],
              [-0.075, 0.005],
              [-0.13, -0.005],
              [-0.15, -0.08]
            ];
            const spandrel = footprint(g, arch, 0.09, wall, x, 0.54, 0.69);
            spandrel.rotation.x = -Math.PI / 2;
          }
          b(0, 0.7, 0.59, 1.43, 0.09, 0.45, 0xb86347);
          b(-0.27, h + 0.12, -0.08, 0.56, 0.24, 0.42, wall);
          for (const x of [-0.44, -0.27, -0.1]) b(x, h + 0.13, 0.143, 0.065, 0.09, 0.021, dark);
          if (v === 1) {
            for (const x of [0.19, 0.48]) for (const z of [-0.19, 0.1]) b(x, h + 0.19, z, 0.045, 0.37, 0.045, cream);
            roofLoft(g, 0.51, 0.48, 0.19, 0.17, 0.16, roof, 0.335, h + 0.38, -0.05);
          }
          break;
        }
        case 'giza':
        case 'dubai': {
          const h = 0.65 + v * 0.15;
          block(1.16, 0.84, h, 2, 3, { shutters: city === 'giza' ? 0x856954 : 0xa28967 });
          parapet(1.18, 0.86, h, wall);
          if (city === 'giza') {
            b(-0.21, h + 0.16, -0.1, 0.48, 0.32, 0.42, wall);
            drum(0.32, h + 0.16, 0.13, 0.16, 0.16, 0.29, 0x585c54);
            for (const x of [-0.54, 0.54]) for (const z of [-0.38, 0.38]) b(x, h + 0.18, z, 0.045, 0.36, 0.045, wood);
            awning(0.65, 0.43, 0.42, 0xb27954);
          } else {
            const x = -0.27;
            b(x, h + 0.37, -0.1, 0.43, 0.76, 0.43, wall);
            for (const z of [-0.323, 0.122]) b(x, h + 0.52, z, 0.27, 0.25, 0.025, dark);
            for (const z of [-0.33, 0.135])
              for (const d of [-0.1, 0.1]) beam(g, [x + d, h + 0.4, z], [x - d, h + 0.64, z], 0.023, cream);
            b(x, h + 0.77, -0.1, 0.52, 0.07, 0.52, cream);
            veranda(1.15, 0.84, 0.52, wood);
          }
          break;
        }
        case 'beijing':
        case 'fujiyoshida': {
          const w = 1.32,
            d = 0.86,
            h = city === 'beijing' ? 0.55 : 0.75 + v * 0.11;
          block(w, d, h, 1, 3);
          roofAt(w + 0.24, d + 0.26, 0.3, w * 0.79, 0.03, roof, h);
          b(0, h + 0.32, 0, w * 0.99, 0.075, 0.09, roof);
          if (city === 'beijing') {
            for (const x of [-0.63, 0.63]) {
              b(x, 0.3, 0.7, 0.1, 0.6, 0.1, 0x994e36);
              b(x, 0.18, 0.83, 0.18, 0.36, 0.37, wall);
            }
            roofLoft(g, 1.48, 0.32, 0.15, 1.19, 0.03, roof, 0, 0.61, 0.68);
            for (const x of [-0.47, 0.47]) ball(g, 0.085, 0xbd553b, x, 0.52, 0.69, 1);
          } else {
            for (const x of [-0.6, -0.3, 0.3, 0.6]) b(x, h * 0.49, 0.45, 0.044, h, 0.04, wood);
            awning(0.8, 0.43, 0.47, [0x447275, 0x9b4c45, 0x696c82][v]);
          }
          break;
        }
        case 'rome':
        case 'athens': {
          const w = 1.24,
            d = 0.87,
            h = city === 'rome' ? 1.0 + v * 0.13 : 0.65 + v * 0.15;
          block(w, d, h, 2, 3, { shutters: city === 'rome' ? 0x59715b : 0x46818c, balcony: city === 'rome' ? 0x5a6254 : undefined });
          ledge(w + 0.1, d + 0.09, h);
          roofAt(w + 0.17, d + 0.14, 0.25, 0.73, 0.035, roof, h + 0.025);
          if (city === 'rome') chimney(0.35, h + 0.18, -0.07, wall);
          else {
            b(-0.37, 0.24, 0.51, 0.3, 0.47, 0.12, 0x438799);
            b(-0.37, 0.08, 0.66, 0.44, 0.13, 0.26, cream);
          }
          break;
        }
        case 'sydney':
        case 'london': {
          const w = 1.27,
            d = 0.84,
            h = 0.85 + v * 0.11;
          block(w, d, h, 2, 3);
          roofAt(w + 0.12, d + 0.1, 0.3, w + 0.04, 0.025, roof, h);
          for (const x of [-0.5, 0.45]) chimney(x, h + 0.24, -0.05, wall);
          if (city === 'sydney') {
            veranda(w, d, h * 0.69, 0x50665f);
            for (const x of [-0.51, -0.34, -0.17, 0, 0.17, 0.34, 0.51]) b(x, 0.33, 0.72, 0.025, 0.3, 0.025, cream);
            b(0, 0.48, 0.72, 1.18, 0.032, 0.035, cream);
          } else {
            for (const x of [-0.32, 0.28]) {
              const bay = drum(x, 0.31, 0.45, 0.225, 0.225, 0.56, wall, 6);
              bay.scale.z = 0.8;
              b(x, 0.36, 0.605, 0.2, 0.25, 0.03, glass);
              b(x, 0.62, 0.53, 0.43, 0.07, 0.28, cream);
            }
          }
          break;
        }
        case 'newyork': {
          const h = 1.35 + v * 0.23;
          block(1.17, 0.91, h, 3, 4, { band: 0x956b58 });
          parapet(1.2, 0.92, h, wall);
          for (let floor = 0; floor < 2; floor++) {
            const y = 0.57 + 0.46 * floor;
            b(-0.26, y, 0.57, 0.5, 0.055, 0.2, dark);
            b(-0.26, y + 0.15, 0.68, 0.5, 0.035, 0.025, dark);
            for (const x of [-0.48, -0.26, -0.03]) b(x, y + 0.08, 0.68, 0.026, 0.16, 0.023, dark);
            beam(g, [-0.44, y, 0.7], [-0.04, y - 0.4, 0.7], 0.025, dark);
          }
          if (v !== 1) {
            for (const x of [0.14, 0.42]) b(x, h + 0.19, 0, 0.035, 0.38, 0.035, wood);
            drum(0.28, h + 0.47, 0, 0.2, 0.2, 0.4, wood);
            drum(0.28, h + 0.72, 0, 0.23, 0.012, 0.14, dark);
            drum(0.28, h + 0.47, 0, 0.205, 0.205, 0.035, dark);
          }
          break;
        }
        case 'rio':
        case 'capetown': {
          const h = 0.55 + v * 0.15;
          block(1.21, 0.79, h, 1, 3, { shutters: city === 'capetown' ? 0x526f68 : undefined });
          ledge(1.27, 0.85, h + 0.025, city === 'capetown' ? cream : roof);
          if (city === 'rio') {
            b(-0.19, h + 0.2, -0.1, 0.69, 0.4, 0.5, theme.walls[(variant + 1) % theme.walls.length]);
            b(-0.19, h + 0.21, 0.17, 0.25, 0.16, 0.035, dark);
            b(-0.19, h + 0.42, -0.1, 0.79, 0.06, 0.62, roof);
            drum(0.37, h + 0.15, 0.1, 0.12, 0.12, 0.27, 0x496f89);
          } else {
            parapet(1.22, 0.8, h, wall);
            b(0.27, 0.22, 0.418, 0.24, 0.43, 0.04, 0x456965);
            for (let i = 0; i < 3; i++) b(0.27, 0.11 - i * 0.03, 0.49 + i * 0.095, 0.37, 0.14 - i * 0.035, 0.12, cream);
          }
          break;
        }
        case 'chichenitza':
        case 'rapanui': {
          const w = 1.07,
            d = 0.72,
            h = 0.47;
          block(w, d, h, 1, 2);
          roofAt(
            w + 0.36,
            d + 0.34,
            city === 'chichenitza' ? 0.54 : 0.27,
            w * 0.68,
            0.035,
            v === 1 && city === 'rapanui' ? 0x9e6557 : roof,
            h
          );
          if (city === 'chichenitza') {
            for (let i = 0; i < 10; i++)
              beam(g, [-0.55 + i * 0.12, h + 0.03, 0.52], [-0.34 + i * 0.076, h + 0.49, 0.045], 0.024, 0xc89d62);
          } else {
            veranda(w, d, 0.49, wood);
            b(-0.19, 0.28, 0.383, 0.27, 0.2, 0.03, 0x407b81);
          }
          break;
        }
        case 'machupicchu':
        case 'niagara': {
          const h = city === 'machupicchu' ? 0.78 + v * 0.21 : 0.65 + v * 0.09;
          block(1.09, 0.77, h, 2, 3, { balcony: wood });
          roofAt(1.29, 0.97, 0.35, 1.2, 0.025, roof, h);
          if (city === 'niagara') {
            veranda(1.13, 0.77, 0.61, wood);
            chimney(0.33, h + 0.2, -0.06, 0x99927f);
          } else {
            b(0, h + 0.19, 0.01, 0.92, 0.04, 0.07, roof);
            awning(0.95, 0.4, 0.5, 0xa25a49);
          }
          break;
        }
        case 'singapore': {
          const w = 1.23,
            d = 0.88,
            h = 1.02 + v * 0.07;
          block(w, d, h, 2, 3, { shutters: 0x4d8071 });
          veranda(w, d, 0.48, cream);
          ledge(w + 0.11, d + 0.08, h, cream);
          roofAt(w + 0.07, d + 0.09, 0.23, w, 0.03, roof, h);
          for (const x of [-0.48, -0.16, 0.16, 0.48]) b(x, h + 0.095, 0.47, 0.095, 0.22, 0.1, cream);
          b(0, h + 0.19, 0.47, 1.27, 0.06, 0.1, wall);
          break;
        }
        case 'barcelona': {
          const w = 0.66,
            d = 0.48,
            c = 0.17;
          const edge = [
            [-w + c, -d],
            [w - c, -d],
            [w, -d + c],
            [w, d - c],
            [w - c, d],
            [-w + c, d],
            [-w, d - c],
            [-w, -d + c]
          ];
          const court = [
            [-0.32, -0.21],
            [-0.32, 0.21],
            [0.32, 0.21],
            [0.32, -0.21]
          ];
          const h = 0.77 + v * 0.14;
          footprint(g, edge, h, wall, 0, 0, 0, court);
          footprint(g, edge, 0.06, roof, 0, h, 0, court);
          windows(1.02, 0.96, h, 2, 3, { balcony: 0x535e58 });
          for (const side of [-1, 1]) for (const z of [-0.16, 0.16]) b(side * 0.67, h * 0.57, z, 0.035, 0.21, 0.14, dark);
          break;
        }
        case 'moscow': {
          const h = 1.11 + v * 0.14;
          block(1.32, 0.9, h, 3, 4, { band: cream });
          roofAt(1.44, 1.02, 0.24, 1.14, 0.6, roof, h);
          b(0, h + 0.255, 0, 1.16, 0.04, 0.62, 0xe7eeea);
          for (const x of [-0.56, 0.56]) b(x, h * 0.52, 0.47, 0.075, h, 0.08, cream);
          break;
        }
      }
      return bakeWorld(g);
    }

    function createHouse(city = 'paris', variant = 0) {
      checkCity(city);
      if (!Number.isInteger(variant) || variant < 0) throw new RangeError('House variant must be a non-negative integer.');
      if (city !== 'tokyo') return neighbourhoodHouse(city, variant);
      const g = group('tokyo-house');
      const height = .55 + (variant % 2) * .18;
      box(g, .7, height, .65, [0xe8cda6,0xf1dfbd,0xdbb99a][variant % 3]);
      const roof = cone(g, .55, .3, 0x536b78, 0, height + .15, 0, 4);
      roof.rotation.y = Math.PI / 4;
      for (let row = 0; row < 2; row++) {
        for (const x of [-.18,.18]) box(g, .13, .13, .02, 0x708e9e, x, .18 + row * .24, .333);
      }
      box(g, .13, .23, .025, 0xa3947f, 0, .12, .34);
      return g;
    }

    function createOriginalLandmark(city = 'paris', { automated = false } = {}) {
      checkCity(city);
      const g = group(`${city}-landmark${automated ? '-automated' : ''}`);
      const metal = automated ? palette.serverSide : city === 'tokyo' ? 0xc66f50 : 0x9f8460;
      if (city === 'newyork') {
        const copper = automated ? 0x558c7f : 0x82aa93;
        box(g, .65, .55, .65, 0xc4b69a);
        cone(g, .28, .95, copper, 0, 1.02, 0);
        ball(g, .15, automated ? 0x82aa93 : 0x82aa93, 0, 1.64, 0, 1);
        beam(g, [.12,1.3,0], [.45,1.98,0], .055, copper);
        if (!automated) cone(g, .10, .24, 0xe9b34c, .45, 2.09, 0);
        beam(g, [-.12,1.3,0], [-.30,1.07,.08], .055, 0x82aa93);
        box(g, .18, .27, .06, 0x6e947d, -.27, 1.16, .1);
        for (let i = 0; i < 5; i++) {
          const angle = (i / 4 - .5) * Math.PI;
          beam(g, [Math.sin(angle)*.10,1.7,0], [Math.sin(angle)*.24,1.8+Math.cos(angle)*.12,0], .015, automated ? palette.indicator : 0x82aa93);
        }
      } else {
        const levels = [[0,.62],[.85,.3],[1.35,.17],[2.12,.035]];
        for (let level = 0; level < 3; level++) {
          const [y0,w0] = levels[level], [y1,w1] = levels[level + 1];
          for (const x of [-1,1]) for (const z of [-1,1]) beam(g, [x*w0,y0,z*w0], [x*w1,y1,z*w1], level === 0 ? .06 : .035, metal);
          box(g, w1*2+.14, .09, w1*2+.14, city === 'tokyo' && !automated ? 0xf4e6cf : metal, 0, y1, 0);
          for (const z of [-1,1]) {
            beam(g, [-w0,y0,z*w0], [w1,y1,z*w1], .015, metal);
            beam(g, [w0,y0,z*w0], [-w1,y1,z*w1], .015, metal);
          }
          for (const x of [-1,1]) {
            beam(g, [x*w0,y0,-w0], [x*w1,y1,w1], .015, metal);
            beam(g, [x*w0,y0,w0], [x*w1,y1,-w1], .015, metal);
          }
        }
        beam(g, [0,2.1,0], [0,2.42,0], .018, metal);
      }
      return g;
    }

    // Sculpt at local scale. Fit and bake the finished toy once for both camera views.
    function createLandmark(city = 'paris', { automated = false } = {}) {
      checkCity(city);
      const sculpture = group(city);
      const stone = automated ? 0xd5aa7a : 0xe6c898;
      const trim = automated ? palette.serverSide : 0xa16942;
      const gold = automated ? palette.brass : 0xffba42;
      const { server: orange, serverSide: steel, indicator: mint, enamel, brass } = palette;
      const ivory = automated ? palette.enamel : 0xffedcf;
      const green = automated ? 0x51776c : 0x588360;
      const ink = 0x31364e;
      const water = automated ? 0x66c3ce : 0x3bb8d5;
      function block(x, y, z, w, h, d, color) {
        return box(sculpture, w, h, d, color, x, y, z);
      }
      function drum(x, y, z, bottom, top, height, color, sides = 12) {
        return mesh(sculpture, new T.CylinderGeometry(top, bottom, height, sides), color, x, y, z);
      }
      function ellipsoid(x, y, z, rx, ry, rz, color) {
        const part = ball(sculpture, 1, color, x, y, z, 1);
        part.scale.set(rx, ry, rz);
        return part;
      }
      function rod(a, b, r, color) {
        return beam(sculpture, a, b, r, color);
      }
      // Front-facing mechanical parts use the same +Z convention as the city camera.
      function disc(x, y, z, radius, depth, color) {
        const part = drum(x, y, z, radius, radius, depth, color, 16);
        part.rotation.x = Math.PI / 2;
        return part;
      }
      function hoop(x, y, z, radius, thickness, color, arc = Math.PI * 2) {
        return mesh(sculpture, new T.TorusGeometry(radius, thickness, 6, 24, arc), color, x, y, z);
      }
      function pipe(points, radius, color) {
        for (let i = 1; i < points.length; i++) {
          rod(points[i - 1], points[i], radius, color);
          if (i < points.length - 1) ball(sculpture, radius, color, ...points[i], 1);
        }
      }
      function parcel(x, y, z, size) {
        block(x, y, z, size, size * 0.75, size * 0.8, 0xc99558);
        block(x, y, z, size * 0.18, size * 0.78, size * 0.82, enamel);
      }
      function profile(points, depth, color, x, y, z) {
        const shape = new T.Shape(points.map(([a, b]) => new T.Vector2(a, b)));
        const geo = new T.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 4 });
        geo.translate(0, 0, -depth / 2);
        return mesh(sculpture, geo, color, x, y, z);
      }
      function onion(x, y, z, r, color) {
        const outline = [
          [0.64, 0],
          [0.7, 0.12],
          [1, 0.52],
          [0.92, 0.91],
          [0.6, 1.2],
          [0.24, 1.48],
          [0.04, 1.74],
          [0, 1.79]
        ];
        mesh(
          sculpture,
          new T.LatheGeometry(
            outline.map(([w, h]) => new T.Vector2(w * r, h * r)),
            14
          ),
          color,
          x,
          y,
          z
        );
        drum(x, y + 1.86 * r, z, 0.07 * r, 0.012 * r, 0.25 * r, gold);
      }
      function pyramid(x, y, z, r, h, color) {
        const part = cone(sculpture, r * Math.SQRT2, h, color, x, y + h / 2, z, 4);
        part.rotation.y = Math.PI / 4;
        return part;
      }
      function ledge(x, y, z, w, d, color) {
        return block(x, y, z, w, 0.1, d, color);
      }
      function arcade(width, height, depth, color) {
        const path = new T.Shape();
        const radius = width * 0.31,
          spring = height * 0.39;
        path.moveTo(-width / 2, 0);
        path.lineTo(-radius, 0);
        path.lineTo(-radius, spring);
        path.absarc(0, spring, radius, Math.PI, 0, true);
        path.lineTo(radius, 0);
        path.lineTo(width / 2, 0);
        path.lineTo(width / 2, height);
        path.lineTo(-width / 2, height);
        path.closePath();
        const geometry = new T.ExtrudeGeometry(path, { depth, bevelEnabled: false, curveSegments: 4 });
        geometry.translate(0, 0, -depth / 2);
        return mesh(sculpture, geometry, color);
      }
      function island(width, depth, color) {
        const plinth = drum(0, 0.105, 0, 1, 0.96, 0.21, color, 16);
        plinth.scale.set(width / 2, 1, depth / 2);
      }

      function latticeOrLiberty() {
        const original = createOriginalLandmark(city, { automated });
        sculpture.add(original);
        if (city === 'newyork') {
          const brass = automated ? gold : 0xf4a63c;
          const copper = automated ? 0x649e8e : 0x71a48c;
          const patina = automated ? 0x34685f : 0x588f81;
          ellipsoid(0, 1.34, 0, 0.21, 0.25, 0.135, copper);
          ellipsoid(0, 1.6, 0, 0.13, 0.19, 0.12, copper);
          drum(0, 1.72, 0, 0.15, 0.15, 0.058, patina, 12);
          for (let ray = -3; ray <= 3; ray++) {
            const a = ray * 0.45;
            rod(
              [0.12 * Math.sin(a), 1.7 + 0.05 * Math.cos(a), 0],
              [0.28 * Math.sin(a), 1.76 + 0.22 * Math.cos(a), 0],
              0.021,
              copper
            );
          }
          rod([0.13, 1.4, 0], [0.29, 1.64, 0], 0.09, copper);
          rod([0.29, 1.64, 0], [0.45, 1.98, 0], 0.061, copper);
          rod([-0.15, 1.39, 0.02], [-0.27, 1.12, 0.1], 0.078, copper);
          const tablet = block(-0.25, 1.2, 0.15, 0.21, 0.31, 0.08, patina);
          tablet.rotation.z = -0.2;
          rod([-0.15, 1.42, 0.09], [0.1, 1.16, 0.13], 0.044, patina);
          block(0, 0.08, 0, 0.9, 0.16, 0.83, stone);
          ledge(0, 0.5, 0, 0.82, 0.76, ivory);
          for (let i = 0; i < 5; i++) {
            const x = (i - 2) * 0.095;
            rod([x, 0.62, 0.17], [x * 0.5 + 0.05, 1.36, 0.13], 0.03, automated ? 0x4c857a : 0x4c8f83);
          }
          const lip = drum(0.45, 2.01, 0, 0.15, 0.21, 0.12, brass);
          lip.rotation.z = -0.13;
          if (automated) {
            // The terminal is held aloft; a card and a receipt hang from it.
            block(0.48, 2.27, 0, 0.55, 0.61, 0.16, steel);
            block(0.48, 2.37, 0.093, 0.43, 0.25, 0.04, mint);
            for (const x of [0.36, 0.48, 0.6]) block(x, 2.16, 0.1, 0.07, 0.075, 0.04, enamel);
            block(0.68, 2.01, 0.08, 0.5, 0.24, 0.07, orange).rotation.z = 0.25;
            block(0.77, 2.02, 0.13, 0.095, 0.08, 0.025, brass);
            block(-0.3, 0.97, 0.24, 0.21, 0.48, 0.03, enamel);
            for (const y of [0.85, 0.92, 1.01]) block(-0.3, y, 0.26, 0.15, 0.018, 0.011, steel);
          } else {
            ellipsoid(0.48, 2.22, 0, 0.12, 0.22, 0.105, brass).rotation.z = -0.25;
          }
          for (const x of [-0.21, 0, 0.21]) block(x, 0.28, 0.335, 0.075, 0.18, 0.028, trim);
        } else {
          for (const x of [-0.62, 0.62])
            for (const z of [-0.62, 0.62]) {
              block(x, 0.06, z, 0.25, 0.12, 0.25, stone);
            }
          for (const [y, w] of [
            [0.83, 0.85],
            [1.33, 0.6]
          ]) {
            ledge(0, y, 0, w, w, trim);
            for (const z of [-w / 2, w / 2]) {
              rod([-w / 2, y + 0.12, z], [w / 2, y + 0.12, z], 0.018, gold);
              for (const x of [-w / 2, 0, w / 2]) rod([x, y + 0.03, z], [x, y + 0.12, z], 0.016, trim);
            }
          }
          if (city === 'paris') {
            // Four curved iron arches keep clear sky between the splayed feet.
            for (let side = 0; side < 4; side++) {
              const arch = group('iron-arch');
              sculpture.add(arch);
              arch.rotation.y = (side * Math.PI) / 2;
              let prev = [-0.53, 0.13, 0.53];
              for (let i = 1; i <= 8; i++) {
                const angle = Math.PI * (1 - i / 8);
                const next = [
                  0.53 * Math.cos(angle),
                  0.13 + 0.39 * Math.sin(angle),
                  0.53 - 0.09 * Math.sin(angle)
                ];
                beam(arch, prev, next, 0.036, automated ? palette.serverSide : 0x96653e);
                prev = next;
              }
            }
          }
        }
        if (automated) {
          if (city === 'paris') {
            // A giant swivelling inspection camera sits on the top observation deck.
            rod([0, 1.87, 0], [0, 2.3, 0], 0.13, steel);
            disc(0, 2.18, 0, 0.22, 0.36, orange);
            block(0, 2.49, 0.14, 0.89, 0.47, 0.66, enamel);
            block(0, 2.75, 0.23, 1.02, 0.1, 0.88, orange);
            disc(0, 2.48, 0.51, 0.23, 0.22, steel);
            disc(0, 2.48, 0.65, 0.145, 0.07, mint);
            disc(0.045, 2.53, 0.7, 0.05, 0.025, enamel);
          } else if (city === 'tokyo') {
            block(0, 1.8, 0.04, 1.15, 0.76, 0.45, orange);
            block(-0.08, 1.8, 0.29, 0.78, 0.51, 0.05, steel);
            for (const [i, color] of [enamel, brass, mint, orange].entries()) {
              block(-0.34 + i * 0.17, 1.8, 0.32, 0.16, 0.38, 0.03, color);
            }
            for (const x of [-0.48, 0.48]) rod([0, 2.03, 0], [x, 2.64, 0], 0.028, steel);
          }
        }
      }

      function giza() {
        island(4.3, 2.7, 0xd5a15f);
        for (const [x, z, r, h] of [
          [-0.63, -0.03, 1.04, 2.28],
          [0.86, -0.42, 0.76, 1.62],
          [1.18, 0.76, 0.45, 0.93]
        ]) {
          if (automated) {
            const drawerHeight = h * 0.36;
            const foot = drum(
              x,
              0.2 + drawerHeight / 2,
              z,
              r * Math.SQRT2,
              r * 0.64 * Math.SQRT2,
              drawerHeight,
              stone,
              4
            );
            foot.rotation.y = Math.PI / 4;
            const gap = r * 0.43;
            pyramid(x, 0.2 + drawerHeight + gap, z, r * 0.64, h * 0.64, stone);
            block(x, 0.2 + drawerHeight + gap / 2, z, r * 0.96, gap, r * 0.8, steel);
            block(x, 0.2 + drawerHeight + gap * 0.32, z + r * 0.45, r * 1.18, gap * 0.7, r * 0.94, orange);
            block(x, 0.2 + drawerHeight + gap * 0.38, z + r * 0.94, r * 0.43, gap * 0.19, 0.05, enamel);
            for (const offset of [0.2, 0.4, 0.6]) {
              block(x, 0.2 + drawerHeight + gap * 0.68, z + r * offset, r * 0.9, gap * 0.42, 0.035, brass);
            }
            pyramid(x, 0.2 + h * 0.79 + gap, z, r * 0.212, h * 0.212, gold);
          } else {
            pyramid(x, 0.2, z, r, h, stone);
            pyramid(x, 0.2 + h * 0.79, z, r * 0.212, h * 0.212, gold);
          }
          for (const f of [0.16, 0.3, 0.45]) {
            const w = 2 * r * (1 - f);
            block(x, 0.2 + h * f, z + r * (1 - f), w, 0.032, 0.027, trim);
          }
        }
        // The tiny sphinx and its long paws set off the size of the pyramids.
        block(-0.98, 0.32, 1.06, 0.66, 0.22, 0.32, trim);
        ellipsoid(-0.72, 0.57, 1.06, 0.16, 0.24, 0.18, stone);
        for (const z of [0.94, 1.18]) block(-0.58, 0.24, z, 0.39, 0.1, 0.09, stone);
      }

      function greatWall() {
        const path = [
          [-1.7, 0.43, 0.56],
          [-1.04, 0.82, 0.12],
          [-0.49, 0.62, -0.38],
          [0.2, 0.5, 0.02],
          [0.83, 0.94, -0.13],
          [1.48, 1.12, -0.7]
        ];
        for (const [x, y, z] of path) ellipsoid(x, y * 0.22, z, 0.7, y * 0.78, 0.65, green);
        for (let i = 1; i < path.length; i++) {
          const a = new T.Vector3(...path[i - 1]),
            b = new T.Vector3(...path[i]);
          const delta = b.clone().sub(a),
            mid = a.clone().lerp(b, 0.5);
          const span = group('wall-span');
          sculpture.add(span);
          span.position.copy(mid);
          span.rotation.order = 'YXZ';
          span.rotation.y = Math.atan2(delta.x, delta.z);
          span.rotation.x = -Math.asin(delta.y / delta.length());
          box(span, 0.37, 0.35, delta.length() + 0.1, stone, 0, -0.04, 0);
          if (automated) {
            box(span, 0.61, 0.14, delta.length() + 0.13, steel, 0, 0.32, 0);
            for (const f of [-0.35, 0, 0.35]) box(span, 0.61, 0.025, 0.045, brass, 0, 0.4, delta.length() * f);
            const cargo = box(span, 0.38, 0.29, 0.31, orange, 0, 0.55, 0);
            box(cargo, 0.08, 0.3, 0.32, enamel, 0, 0, 0);
          }
          for (const side of [-0.17, 0.17]) {
            box(span, 0.07, 0.12, delta.length(), trim, side, 0.17, 0);
            for (const f of [-0.38, 0, 0.38]) box(span, 0.08, 0.11, 0.12, stone, side, 0.27, delta.length() * f);
          }
        }
        for (const i of [0, 2, 5]) {
          const [x, y, z] = path[i];
          block(x, y + 0.16, z, 0.55, 0.51, 0.55, stone);
          ledge(x, y + 0.43, z, 0.66, 0.66, trim);
          block(x, y + 0.59, z, 0.4, 0.26, 0.4, stone);
          block(x, y + 0.56, z + 0.205, 0.15, 0.21, 0.02, ink);
          pyramid(x, y + 0.72, z, 0.36, 0.23, automated ? palette.server : 0x43575b);
          if (automated) drum(x, y + 1.02, z, 0.045, 0.02, 0.22, gold);
        }
        if (automated) {
          for (const index of [0, 5]) {
            const [x, y, z] = path[index];
            pipe(
              [
                [x, y + 0.67, z + 0.2],
                [x, y + 1.47, z + 0.2],
                [x + 0.59, y + 1.47, z + 0.2]
              ],
              0.077,
              orange
            );
            rod([x + 0.59, y + 1.47, z + 0.2], [x + 0.59, y + 1.19, z + 0.2], 0.032, steel);
            parcel(x + 0.59, y + 1.06, z + 0.2, 0.38);
          }
        }
      }

      function tajMahal() {
        block(0, 0.1, 0, 3.05, 0.2, 2.2, stone);
        block(0, 0.72, 0, 1.75, 1.04, 1.25, ivory);
        for (const side of [-1, 1]) {
          for (const x of [-0.67, 0.67]) {
            const a = arcade(0.4, 0.52, 0.12, stone);
            a.position.set(x, 0.27, side * 0.66);
          }
          const portal = arcade(0.91, 0.97, 0.16, ivory);
          portal.position.set(0, 0.25, side * 0.73);
          block(0, 0.62, side * 0.64, 0.56, 0.74, 0.035, trim);
        }
        drum(0, 1.36, 0, 0.6, 0.59, 0.28, ivory);
        onion(0, 1.49, 0, 0.73, ivory);
        for (const x of [-1.25, 1.25])
          for (const z of [-0.85, 0.85]) {
            drum(x, 0.82, z, 0.13, 0.09, 1.25, ivory);
            for (const y of [0.64, 1.04, 1.45]) drum(x, y, z, 0.155, 0.155, 0.065, stone);
            onion(x, 1.5, z, 0.15, gold);
          }
        for (const x of [-0.68, 0.68]) for (const z of [-0.47, 0.47]) onion(x, 1.24, z, 0.22, stone);
        if (automated) {
          const grip = hoop(1.04, 1.44, 0, 0.66, 0.14, orange);
          grip.scale.y = 1.13;
          profile(
            [
              [-0.7, 0.04],
              [-1.2, 0.33],
              [-1.78, 1.39],
              [-1.43, 1.3],
              [-1.04, 0.77],
              [-0.72, 0.75]
            ],
            0.45,
            enamel,
            0,
            0.75,
            0
          );
          block(-1.63, 2.1, 0, 0.46, 0.11, 0.48, orange).rotation.z = -0.23;
          drum(0, 2.82, 0, 0.16, 0.16, 0.18, steel);
          ellipsoid(0, 2.99, 0, 0.29, 0.16, 0.29, orange);
          for (const x of [-1.62, -1.81]) {
            pipe(
              [
                [x, 2.28, 0],
                [x - 0.09, 2.44, 0],
                [x + 0.04, 2.63, 0]
              ],
              0.043,
              0x8ebeb1
            );
          }
        }
      }

      function colosseum() {
        const sections = 20;
        const base = drum(0, 0.12, 0, 1.88, 1.91, 0.24, trim, sections);
        base.scale.z = 0.73;
        const floor = drum(0, 0.26, 0, 1.5, 1.5, 0.08, 0xcc995a, sections);
        floor.scale.z = 0.73;
        for (let i = 0; i < sections; i++) {
          const angle = (i * 2 * Math.PI) / sections;
          const rows = Math.cos(angle) < -0.2 ? 3 : Math.cos(angle) < 0.15 ? 2 : 1;
          for (let row = 0; row < rows; row++) {
            const r = 1.8 - row * 0.035,
              x = r * Math.sin(angle),
              z = r * 0.72 * Math.cos(angle);
            const pier = arcade(0.59, 0.44, 0.18, row % 2 ? ivory : stone);
            pier.position.set(x, 0.23 + row * 0.47, z);
            const yaw = Math.atan2(0.72 * Math.sin(angle), Math.cos(angle));
            pier.rotation.y = yaw;
            ledge(x, 0.68 + row * 0.47, z, 0.61, 0.24, trim).rotation.y = yaw;
          }
          const seat = block(1.34 * Math.sin(angle), 0.32, 0.93 * Math.cos(angle), 0.47, 0.16, 0.28, stone);
          seat.rotation.y = angle;
        }
        if (automated) {
          block(0, 0.67, 0.12, 1.9, 0.53, 0.78, orange);
          block(0, 0.97, 0.12, 1.7, 0.1, 0.62, steel);
          const notice = group('layoff-notice');
          notice.position.set(-0.08, 0.99, 0.12);
          notice.rotation.z = -0.14;
          sculpture.add(notice);
          box(notice, 1.07, 1.15, 0.055, enamel, 0, 0.575, 0);
          for (const [y, w] of [
            [0.94, 0.72],
            [0.74, 0.55],
            [0.58, 0.65],
            [0.42, 0.46]
          ]) {
            box(notice, w, 0.052, 0.025, steel, -0.03, y, 0.04);
          }
          for (let i = 0; i < 8; i++) {
            const x = (i - 3.5) * 0.15;
            const strip = block(x, 0.62, 0.79, 0.1, 0.045, 0.97, enamel);
            strip.rotation.x = 0.37;
            block(x, 0.35, 1.27, 0.1, 0.25, 0.05, enamel);
          }
        }
      }

      function operaHouse() {
        island(3.8, 2.45, water);
        block(0, 0.28, 0, 3.35, 0.2, 1.8, trim);
        for (let i = 0; i < 4; i++) block(0, 0.21 + i * 0.045, 1.04 - i * 0.065, 2.85, 0.055, 0.15, stone);
        // Each auditorium has a fan of shells. Their broad ivory faces converge
        // at one foot, with a thin lip over the recessed harbour-side windows.
        function shell(x, z, length, height, width, direction) {
          const roof = group('shell-vault');
          roof.position.set(x, 0.39, z);
          if (direction < 0) roof.rotation.y = Math.PI;
          sculpture.add(roof);
          const tile = automated ? palette.enamel : 0xfff4df;
          const edge = automated ? gold : 0xe5cda4;
          function surface(t, u) {
            const spread = Math.abs(u);
            return [
              length * (0.72 * t + 0.28 * t * t - 0.34 * t * spread ** 1.65),
              height * (0.65 * Math.sin((t * Math.PI) / 2) + 0.35 * t) * (1 - 0.89 * spread ** 1.8),
              width * u * Math.sin(t * Math.PI * 0.52)
            ];
          }
          const vertices = [];
          for (let strip = 0; strip < 8; strip++) {
            const u = strip / 4 - 1,
              next = u + 0.25;
            for (let row = 0; row < 4; row++) {
              const lower = row / 4,
                upper = lower + 0.25;
              vertices.push(
                ...surface(lower, u),
                ...surface(upper, u),
                ...surface(upper, next),
                ...surface(lower, u),
                ...surface(upper, next),
                ...surface(lower, next)
              );
            }
            const a = surface(1, u),
              b = surface(1, next);
            beam(roof, a, b, 0.022, tile);
            const glassA = a.map((v, i) => v * (i === 1 ? 0.32 : 0.81));
            const glassB = b.map((v, i) => v * (i === 1 ? 0.32 : 0.81));
            const window = new T.BufferGeometry();
            window.setAttribute(
              'position',
              new T.Float32BufferAttribute(
                [
                  ...glassA,
                  glassA[0],
                  0,
                  glassA[2],
                  ...glassB,
                  ...glassB,
                  glassA[0],
                  0,
                  glassA[2],
                  glassB[0],
                  0,
                  glassB[2]
                ],
                3
              )
            );
            window.computeVertexNormals();
            mesh(roof, window, automated ? ink : 0x76695e);
          }
          const skin = new T.BufferGeometry();
          skin.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
          skin.computeVertexNormals();
          mesh(roof, skin, tile);
          for (const u of [-0.75, -0.45, 0.45, 0.75]) {
            for (let row = 0; row < 4; row++) {
              beam(roof, surface(row / 4, u), surface((row + 1) / 4, u), 0.013, edge);
            }
          }
        }
        for (const [z, size] of [
          [-0.42, 1],
          [0.43, 0.84]
        ]) {
          shell(-0.63, z, 1.04, 1.74 * size, 0.5, -1);
          shell(-0.5, z, 0.94, 1.32 * size, 0.47, 1);
          shell(0.18, z, 0.98, 1.05 * size, 0.44, 1);
          shell(0.84, z, 0.7, 0.66 * size, 0.32, 1);
        }
        if (automated) {
          for (const [x, r] of [
            [-0.94, 0.35],
            [0.12, 0.46],
            [1.12, 0.32]
          ]) {
            block(x, 0.43 + r, 0.78, r * 2.04, r * 2.2, 0.45, orange);
            disc(x, 0.43 + r, 1.03, r, 0.1, steel);
            hoop(x, 0.43 + r, 1.1, r * 0.74, r * 0.09, enamel);
            disc(x, 0.43 + r, 1.13, r * 0.32, 0.09, mint);
          }
        }
      }

      function rio() {
        island(2.95, 1.95, green);
        ellipsoid(0, 0.45, 0, 1.15, 0.58, 0.74, 0x537361);
        block(0, 1.01, 0, 0.75, 0.27, 0.59, trim);
        const cloak = profile(
          [
            [-0.38, 0],
            [0.37, 0],
            [0.24, 1.14],
            [-0.2, 1.16]
          ],
          0.44,
          ivory,
          0,
          1.13,
          0
        );
        cloak.rotation.z = -0.03;
        profile(
          [
            [-1.23, 0.23],
            [-0.45, 0.18],
            [-0.23, 0.1],
            [0.22, 0.1],
            [0.52, 0.19],
            [1.23, 0.24],
            [1.18, 0],
            [0.5, -0.11],
            [0.23, -0.33],
            [-0.2, -0.33],
            [-0.47, -0.13],
            [-1.18, 0]
          ],
          0.34,
          ivory,
          0,
          2.22,
          0
        );
        for (const x of [-1.27, 1.27]) ellipsoid(x, 2.38, 0, 0.13, 0.08, 0.13, stone);
        drum(0, 2.43, 0, 0.12, 0.11, 0.22, ivory);
        ellipsoid(0, 2.63, 0, 0.21, 0.24, 0.18, ivory);
        for (const x of [-0.19, 0, 0.19]) rod([x, 1.22, 0.24], [x * 0.5, 2.18, 0.24], 0.024, stone);

        if (automated) {
          for (const side of [-1, 1]) {
            const x = side * 1.24,
              base = side < 0 ? 1.45 : 1.17;
            for (const dx of [-0.34, 0.34]) rod([x, 2.37, 0], [x + dx, base, 0.08], 0.032, steel);
            drum(x, base, 0.09, 0.27, 0.46, 0.13, orange);
            if (side > 0) {
              for (let i = 0; i < 4; i++) drum(x, base + 0.12 + i * 0.09, 0.09, 0.28, 0.28, 0.083, brass);
            } else {
              place(sculpture, createCharacter(), x, base + 0.07, 0.09, 1.08);
            }
          }
        }
      }

      function fuji() {
        const mountain = drum(-0.34, 0.82, -0.17, 1.69, 0.26, 1.63, 0x536ca0, 16);
        mountain.scale.z = 0.74;
        const cap = drum(-0.34, 1.45, -0.17, 0.64, 0.26, 0.4, 0xf2f3e9, 16);
        cap.scale.z = 0.74;
        for (const [x, z] of [
          [1.43, 0.58],
          [-1.41, 0.42]
        ])
          ellipsoid(x, 0.3, z, 0.48, 0.33, 0.37, green);
        const x = 1.04,
          z = 0.78;
        block(x, 0.12, z, 0.71, 0.24, 0.65, stone);
        for (let i = 0; i < 5; i++) {
          const half = 0.42 - 0.047 * i,
            y = 0.24 + i * 0.28;
          block(x, y + 0.09, z, half * 1.36, 0.21, half * 1.36, automated ? trim : 0xbc4933);
          block(x, y + 0.1, z + half * 0.69, half * 0.66, 0.11, 0.018, ink);
          pyramid(x, y + 0.18, z, half, 0.22, 0x374858);
          ledge(x, y + 0.18, z, 2 * half, 2 * half, automated ? gold : 0x9a4432);
        }
        rod([x, 1.64, z], [x, 1.99, z], 0.026, gold);
        if (automated) {
          drum(-0.34, 1.66, -0.17, 0.43, 0.41, 0.18, orange);
          drum(-0.34, 1.77, -0.17, 0.3, 0.3, 0.07, steel);
          const pencil = group('pencil');
          place(sculpture, pencil, -0.34, 1.76, -0.17);
          pencil.rotation.z = -0.27;
          mesh(pencil, new T.CylinderGeometry(0.18, 0.055, 0.36, 6), 0xdca570, 0, 0.14, 0);
          mesh(pencil, new T.CylinderGeometry(0.18, 0.18, 0.98, 6), brass, 0, 0.78, 0);
          mesh(pencil, new T.CylinderGeometry(0.19, 0.19, 0.16, 8), steel, 0, 1.34, 0);
          mesh(pencil, new T.CylinderGeometry(0.17, 0.18, 0.23, 8), orange, 0, 1.51, 0);
          const curl = hoop(-0.52, 1.12, 0.58, 0.34, 0.075, 0xe4b779, Math.PI * 1.72);
          curl.rotation.z = -0.4;
        }
      }

      function london() {
        block(0, 0.13, 0, 1.22, 0.26, 1.18, trim);
        block(0, 1.05, 0, 0.84, 1.65, 0.82, stone);
        for (const x of [-0.44, 0.44]) for (const z of [-0.43, 0.43]) block(x, 1.12, z, 0.13, 1.82, 0.13, ivory);
        for (let side = 0; side < 4; side++) {
          const face = group('clock-face');
          sculpture.add(face);
          face.rotation.y = (side * Math.PI) / 2;
          for (const x of [-0.23, 0, 0.23]) box(face, 0.075, 1.06, 0.03, trim, x, 1.15, 0.424);
          box(face, 1.15, 1.06, 0.14, trim, 0, 2.35, 0.49);
          const dial = mesh(face, new T.CylinderGeometry(0.43, 0.43, 0.06, 20), ivory, 0, 2.36, 0.587);
          dial.rotation.x = Math.PI / 2;
          for (let tick = 0; tick < 12; tick++) {
            const a = (tick * Math.PI) / 6;
            box(face, 0.033, 0.072, 0.025, ink, 0.35 * Math.sin(a), 2.36 + 0.35 * Math.cos(a), 0.632).rotation.z =
              -a;
          }
          beam(face, [0, 2.36, 0.65], [-0.18, 2.52, 0.65], 0.036, ink);
          beam(face, [0, 2.36, 0.65], [0.14, 2.61, 0.65], 0.028, ink);
        }
        ledge(0, 2.91, 0, 1.27, 1.27, gold);
        pyramid(0, 2.96, 0, 0.57, 0.74, 0x3b5758);
        drum(0, 3.78, 0, 0.12, 0.08, 0.25, stone, 8);
        cone(sculpture, 0.12, 0.35, gold, 0, 4.03, 0);
        if (automated) {
          block(0, 2.93, 0.1, 1.46, 0.22, 1.26, orange);
          block(0.18, 3.055, 0.21, 1.07, 0.045, 0.48, steel);
          const card = group('punched-timecard');
          sculpture.add(card);
          card.position.set(0.31, 3.06, 0.3);
          card.rotation.z = -0.13;
          box(card, 0.9, 1.06, 0.05, enamel, 0, 0.53, 0);
          box(card, 0.71, 0.13, 0.02, orange, 0, 0.89, 0.035);
          for (const y of [0.27, 0.44, 0.61])
            for (const x of [-0.26, -0.09, 0.09, 0.26]) {
              box(card, 0.09, 0.075, 0.02, steel, x, y, 0.035);
            }
        }
      }

      function chichenItza() {
        for (let i = 0; i < 9; i++) {
          const w = 2.62 - i * 0.225;
          block(0, 0.09 + i * 0.17, 0, w, 0.17, w, stone);
          ledge(0, 0.155 + i * 0.17, 0, w + 0.035, w + 0.035, i % 2 ? stone : trim);
        }
        for (let side = 0; side < 4; side++) {
          const flight = group('staircase');
          sculpture.add(flight);
          flight.rotation.y = (side * Math.PI) / 2;
          for (let i = 0; i < 19; i++) box(flight, 0.42, 0.09, 0.11, ivory, 0, 0.055 + i * 0.08, 1.49 - i * 0.059);
          for (const x of [-0.25, 0.25]) beam(flight, [x, 0.06, 1.5], [x, 1.53, 0.39], 0.055, trim);
        }
        block(0, 1.74, 0, 0.76, 0.44, 0.67, ivory);
        block(0, 1.73, 0.34, 0.3, 0.32, 0.02, ink);
        ledge(0, 1.99, 0, 0.86, 0.82, gold);
        if (automated) {
          // The pile of inbox folders travels down the staircase from the spring clip.
          for (let i = 0; i < 4; i++) {
            const y = 1.26 - i * 0.29,
              z = 0.62 + i * 0.2;
            block(0, y, z, 0.69, 0.12, 0.39, orange);
            block(-0.16, y + 0.07, z - 0.13, 0.25, 0.1, 0.07, brass);
            block(0, y + 0.086, z, 0.55, 0.035, 0.28, enamel);
          }
          block(0, 2.1, 0, 1.02, 0.18, 0.76, orange);
          block(0, 2.26, -0.03, 0.74, 0.24, 0.55, steel);
          for (const z of [-0.13, 0.13]) {
            const loop = hoop(0, 2.65, z, 0.29, 0.046, steel);
            loop.scale.y = 1.28;
            for (const x of [-0.21, 0.21]) rod([x, 2.33, z], [x * 0.8, 2.46, z], 0.043, steel);
          }
        }
      }

      function machuPicchu() {
        island(3.9, 2.6, 0x405f50);
        const peak = drum(0.24, 1.04, -0.55, 1.02, 0.17, 1.9, green, 7);
        peak.rotation.z = -0.18;
        peak.scale.z = 0.7;
        const shoulder = drum(-0.86, 0.63, -0.52, 0.65, 0.24, 1.12, 0x6d9165, 7);
        shoulder.rotation.z = 0.2;
        for (let i = 0; i < 5; i++) {
          const x = -0.12 - i * 0.04,
            z = 0.29 - i * 0.122,
            w = 3.08 - i * 0.34,
            d = 1.65 - i * 0.19,
            y = 0.24 + i * 0.2;
          block(x, y, z, w, 0.19, d, stone);
          block(x, y + 0.11, z, w, 0.045, d, green);
        }
        for (const [x, y, z] of [
          [-0.97, 1.12, -0.1],
          [-0.4, 1.13, -0.1],
          [0.14, 1.13, -0.08],
          [0.65, 0.94, 0.2],
          [0.99, 0.72, 0.52]
        ]) {
          block(x, y + 0.13, z, 0.36, 0.26, 0.29, stone);
          profile(
            [
              [-0.19, 0],
              [0, 0.18],
              [0.19, 0]
            ],
            0.29,
            trim,
            x,
            y + 0.26,
            z
          );
          block(x, y + 0.09, z + 0.15, 0.1, 0.17, 0.02, ink);
        }
        if (automated) {
          for (const [x, y, z] of [
            [-1.1, 0.47, 0.91],
            [-0.42, 0.47, 0.91],
            [0.32, 0.47, 0.91],
            [0.98, 0.47, 0.91],
            [-0.86, 0.86, 0.42],
            [-0.15, 0.86, 0.42],
            [0.65, 0.86, 0.42]
          ]) {
            rod([x, y, z], [x, y + 0.56, z], 0.044, steel);
            for (const side of [-1, 1]) {
              ellipsoid(x + side * 0.12, y + 0.18, z, 0.17, 0.065, 0.08, mint).rotation.z = side * 0.45;
            }
            block(x, y + 0.47, z, 0.25, 0.27, 0.14, orange);
            block(x, y + 0.68, z, 0.2, 0.21, 0.1, enamel);
            for (const dx of [-0.047, 0.047]) block(x + dx, y + 0.71, z + 0.06, 0.043, 0.05, 0.018, steel);
          }
        }
      }

      function athens() {
        island(3.7, 2.05, 0xb0926f);
        for (let i = 0; i < 3; i++) block(0, 0.24 + i * 0.115, 0, 3.03 - i * 0.13, 0.12, 1.66 - i * 0.1, stone);
        for (const x of [-1.22, -0.87, -0.52, -0.17, 0.17, 0.52, 0.87, 1.22])
          for (const z of [-0.56, 0.56]) {
            drum(x, 0.96, z, 0.12, 0.092, 0.98, ivory, 10);
            block(x, 1.47, z, 0.27, 0.1, 0.27, stone);
          }
        for (const x of [-1.22, 1.22]) for (const z of [-0.19, 0.19]) drum(x, 0.97, z, 0.12, 0.092, 1, ivory, 10);
        block(0, 1.59, 0, 2.88, 0.18, 1.5, stone);
        const roof = profile(
          [
            [-0.83, 0],
            [0, 0.37],
            [0.83, 0]
          ],
          2.95,
          ivory,
          0,
          1.67,
          0
        );
        roof.rotation.y = Math.PI / 2;
        ledge(0, 1.68, 0, 3.04, 1.65, trim);
        if (automated) {
          block(0, 0.12, 0.26, 3.45, 0.08, 2.2, enamel).rotation.y = -0.1;
          block(0, 0.27, 0, 2.99, 0.19, 1.68, orange);
          block(0, 1.99, 0, 2.29, 0.22, 1.12, steel);
          drum(0, 2.24, 0, 0.43, 0.26, 0.42, orange);
          ellipsoid(0, 2.61, 0, 0.66, 0.32, 0.51, orange);
          for (const x of [-1.13, -0.73, -0.31, 0.13, 0.55, 0.98]) block(x, 0.18, 1.04, 0.24, 0.025, 0.08, orange);
        }
      }

      function singapore() {
        island(3.65, 1.75, water);
        for (const x of [-1.04, 0, 1.04]) {
          profile(
            [
              [-0.33, 0],
              [0.29, 0],
              [0.39, 1.95],
              [0.2, 2.04],
              [-0.19, 2.04]
            ],
            0.54,
            automated ? trim : 0x5796a3,
            x,
            0.2,
            0
          );
          for (let i = 0; i < 7; i++) block(x + 0.025, 0.36 + i * 0.25, 0.28, 0.5, 0.046, 0.04, ivory);
          block(x - 0.19, 1.2, 0.3, 0.046, 1.8, 0.03, stone);
        }
        profile(
          [
            [-1.66, 0.25],
            [-1.27, 0],
            [1.23, 0.02],
            [1.78, 0.22],
            [1.87, 0.4],
            [1.32, 0.3],
            [-1.27, 0.28]
          ],
          0.71,
          ivory,
          0,
          2.17,
          0
        );
        block(0, 2.47, 0, 2.65, 0.035, 0.46, automated ? ink : water);
        for (const x of [-1.22, -0.91, 0.91, 1.22]) {
          rod([x, 2.46, -0.18], [x, 2.67, -0.18], 0.027, trim);
          ellipsoid(x, 2.68, -0.18, 0.14, 0.11, 0.12, green);
        }
        if (automated) {
          for (const x of [-1.04, 0, 1.04]) {
            block(x, 1.25, 0.33, 0.81, 0.94, 0.2, orange);
            block(x, 1.25, 0.45, 0.65, 0.75, 0.08, enamel);
            block(x, 1.49, 0.5, 0.39, 0.09, 0.04, orange);
            rod([x + 0.15, 1.47, 0.51], [x - 0.11, 1.02, 0.51], 0.06, orange);
          }
          pipe(
            [
              [1.38, 0.81, 0.03],
              [1.66, 0.81, 0.03],
              [1.85, 1.83, 0.08]
            ],
            0.082,
            steel
          );
          ellipsoid(1.85, 1.91, 0.08, 0.23, 0.23, 0.23, orange);
          for (let i = 0; i < 4; i++) drum(0.1 + i * 0.19, 0.24 + (i % 2) * 0.06, 0.66, 0.18, 0.18, 0.075, brass);
        }
      }

      function niagara() {
        island(3.85, 2.85, water);
        const segments = 24;
        const whitewater = 0xe3f6ed,
          blue = automated ? 0x66b3ca : 0x40b6c7;
        // A horseshoe cut through two banks. The river bends over its lip
        // into separate ribbons and a wide, irregular bank of spray.
        for (let i = 0; i < segments; i++) {
          const a = (-0.57 + (1.14 * i) / (segments - 1)) * Math.PI;
          const sx = Math.sin(a),
            cz = -Math.cos(a);
          const x = sx * 1.28,
            z = cz * 0.88;
          const height = 1.27 + 0.035 * Math.sin(i * 2);
          const bank = block(x * 1.15, 0.68, z * 1.23, 0.35, 1.04, 0.38, 0x867e68);
          bank.rotation.y = -a;
          const river = ellipsoid(x * 1.13, height - 0.03, z * 1.21, 0.27, 0.085, 0.35, blue);
          river.rotation.y = -a;
          const lip = ellipsoid(x, height, z, 0.17, 0.08, 0.16, whitewater);
          lip.rotation.y = -a;
          const drop = block(x * 0.93, 0.74, z * 0.89, 0.25, 1.11, 0.12, [0x8adae0, blue, 0x64ced9, water][i % 4]);
          drop.rotation.order = 'YXZ';
          drop.rotation.y = -a;
          drop.rotation.x = -0.13;
          if (i % 2 === 0) {
            rod([x * 0.87, 0.29, z * 0.85], [x * 0.96, height, z * 0.94], 0.033, whitewater);
          }
          ellipsoid(x * 0.84, 0.3, z * 0.78 + 0.1, 0.24, 0.22 + (i % 3) * 0.045, 0.25, whitewater);
        }
        for (const side of [-1, 1]) {
          ellipsoid(side * 1.49, 0.47, 0.4, 0.34, 0.42, 0.58, 0x6c8764);
          ellipsoid(side * 1.63, 0.29, 0.71, 0.2, 0.19, 0.35, stone);
          for (const [z, h] of [
            [0.24, 0.51],
            [0.49, 0.34]
          ]) {
            cone(sculpture, 0.15, h, green, side * 1.53, 0.78 + h / 2, z);
          }
        }
        if (automated) {
          pipe(
            [
              [-1.5, 0.34, 0.56],
              [-1.5, 1.42, 0.56],
              [-1.18, 1.73, 0.56],
              [-0.46, 1.73, 0.56],
              [-0.46, 1.4, 0.56]
            ],
            0.2,
            brass
          );
          drum(-0.46, 1.37, 0.56, 0.27, 0.27, 0.17, steel);
          rod([-1.06, 1.73, 0.57], [-1.06, 2.08, 0.73], 0.1, steel);
          hoop(-1.06, 2.13, 0.77, 0.42, 0.081, orange);
          for (let i = 0; i < 3; i++) {
            block(-1.06, 2.13, 0.77, 0.71, 0.085, 0.075, orange).rotation.z = (i * Math.PI) / 3;
          }
          ellipsoid(-0.46, 1.07, 0.56, 0.12, 0.19, 0.12, 0x54beca);
          disc(1.16, 1.2, 0.57, 0.39, 0.14, orange);
          disc(1.16, 1.2, 0.66, 0.31, 0.06, enamel);
          rod([1.16, 1.2, 0.72], [1.35, 1.37, 0.72], 0.034, steel);
        }
      }

      function barcelona() {
        block(0, 0.11, 0, 2.45, 0.22, 1.68, stone);
        profile(
          [
            [-1.04, 0],
            [-0.89, 0.75],
            [-0.61, 0.94],
            [-0.32, 1.1],
            [0, 1.65],
            [0.37, 1.12],
            [0.68, 0.91],
            [1.04, 0.68],
            [1.04, 0]
          ],
          1.1,
          stone,
          0,
          0.2,
          0
        );
        const spire = (x, z, h, r) => {
          drum(x, h * 0.48, z, r, r * 0.4, h * 0.96, stone, 10);
          for (let j = 0; j < 4; j++) {
            const y = h * (0.49 + j * 0.085);
            const radius = r * (1 - (0.6 * y) / h);
            for (const side of [-1, 1]) block(x, y, z + side * radius, 0.066, h * 0.063, 0.024, ink);
          }
          ellipsoid(x, h, z, r * 0.53, r * 0.7, r * 0.53, gold);
        };
        for (const x of [-0.91, -0.39, 0.39, 0.91]) spire(x, 0.48, Math.abs(x) > 0.5 ? 2.16 : 2.55, 0.2);
        for (const x of [-0.69, 0.69]) spire(x, -0.49, 2.71, 0.23);
        spire(0, -0.16, 3.43, 0.38);
        rod([0, 3.54, -0.16], [0, 3.88, -0.16], 0.056, gold);
        rod([-0.15, 3.76, -0.16], [0.15, 3.76, -0.16], 0.052, gold);
        for (const x of [-0.6, 0, 0.6]) {
          const entry = arcade(0.42, 0.65, 0.17, ivory);
          entry.position.set(x, 0.22, 0.63);
        }
        if (automated) {
          for (const [r, y] of [
            [0.47, 3.18],
            [0.76, 3.27],
            [1.05, 3.36]
          ]) {
            // Three broadcast arcs perch between the outer spires.
            const arc = hoop(0, y, 0.2, r, 0.087, orange, Math.PI * 0.55);
            arc.rotation.z = Math.PI * 0.225;
          }
          disc(0, 3.32, 0.24, 0.16, 0.15, mint);
          for (const x of [-0.91, 0.91]) {
            drum(x, 2.31, 0.48, 0.25, 0.25, 0.1, steel);
            ellipsoid(x, 2.47, 0.48, 0.16, 0.2, 0.16, mint);
          }
        }
      }

      function dubai() {
        island(2.3, 1.67, water);
        const outline = [
          [-0.65, 0],
          [0.54, 0],
          [0.63, 0.65],
          [0.6, 1.22],
          [0.46, 1.86],
          [0.18, 2.48],
          [-0.57, 3.05]
        ];
        profile(outline, 0.77, automated ? trim : 0x377c91, 0, 0.2, 0);
        for (const z of [-0.4, 0.4]) {
          for (let i = 0; i < 9; i++) {
            const y = 0.35 + i * 0.268;
            const right = 0.64 - 0.068 * (y - 0.8) ** 2 - 0.09 * y;
            block((right - 0.46) / 2, y, z, right + 0.46, 0.09, 0.04, ivory);
          }
          for (let i = 1; i < outline.length - 1; i++) {
            const a = outline[i],
              b = outline[i + 1];
            rod([a[0], 0.2 + a[1], z], [b[0], 0.2 + b[1], z], 0.07, ivory);
          }
          rod([-0.58, 0.2, z], [-0.58, 3.5, z], 0.078, stone);
          rod([-0.57, 1.16, z], [0.53, 1.76, z], 0.07, ivory);
        }
        rod([-0.57, 3.14, 0], [-0.56, 3.68, 0], 0.04, gold);
        rod([-0.52, 2.2, 0.14], [-0.92, 2.5, 0.44], 0.065, trim);
        drum(-0.92, 2.53, 0.44, 0.35, 0.35, 0.085, green, 16);
        if (automated) {
          profile(
            [
              [-1.53, 0.32],
              [-1.12, -0.07],
              [0.89, -0.09],
              [1.52, 0.25],
              [1.67, 0.54],
              [1.16, 0.38],
              [-1.35, 0.43]
            ],
            1.01,
            orange,
            0,
            0.22,
            0
          );
          for (const x of [-0.9, -0.45, 0, 0.45, 0.9]) disc(x, 0.45, 0.535, 0.075, 0.045, steel);
          for (const x of [-0.84, 0.73]) {
            hoop(x, 0.71, 0.49, 0.21, 0.072, enamel);
            for (const dx of [-0.21, 0.21]) block(x + dx, 0.71, 0.49, 0.085, 0.13, 0.14, orange);
          }
          rod([1.03, 0.32, 0], [1.59, 0.33, 0], 0.066, steel);
          for (let i = 0; i < 3; i++) {
            const a = (i * 2 * Math.PI) / 3;
            ellipsoid(1.58, 0.37 + 0.17 * Math.sin(a), 0.17 * Math.cos(a), 0.07, 0.12, 0.2, brass).rotation.x = -a;
          }
        }
      }

      function moscow() {
        block(0, 0.14, 0, 2.53, 0.28, 1.86, stone);
        for (const [x, z, r, h, hue] of [
          [0, -0.24, 0.44, 2.12, 0x62a68a],
          [-0.81, 0.12, 0.36, 1.26, 0xdd624a],
          [0.79, 0.11, 0.35, 1.43, 0x4c9eac],
          [-0.38, 0.6, 0.25, 0.99, 0xe7a73c],
          [0.38, 0.6, 0.26, 0.99, 0x54a27d],
          [-0.75, -0.55, 0.27, 1.71, 0xe6b250],
          [0.7, -0.57, 0.26, 1.78, 0x638eaa]
        ]) {
          drum(x, 0.25 + h / 2, z, r * 0.82, r * 0.68, h, automated ? trim : 0xb45547, 8);
          for (let i = 1; i < 4; i++) drum(x, 0.26 + (i * h) / 4, z, r * 0.83, r * 0.83, 0.068, ivory, 8);
          drum(x, h + 0.24, z, r * 0.97, r * 0.97, 0.13, ivory, 10);
          if (automated) {
            for (let i = 0; i < 3; i++) drum(x, h + 0.32 + i * r * 0.22, z, r * 0.83, r * 0.83, r * 0.13, steel);
            ellipsoid(x, h + 0.34 + r * 1.13, z, r * 1.06, r * 1.24, r * 1.06, brass);
            pipe(
              [
                [x - r * 0.4, h + 0.34 + r * 0.75, z + r * 0.98],
                [x - r * 0.23, h + 0.34 + r * 1.4, z + r * 0.98],
                [x, h + 0.34 + r, z + r * 1.05],
                [x + r * 0.27, h + 0.34 + r * 1.39, z + r * 0.98],
                [x + r * 0.41, h + 0.34 + r * 0.75, z + r * 0.98]
              ],
              r * 0.065,
              orange
            );
          } else {
            onion(x, h + 0.3, z, r, hue);
          }
          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3;
            rod(
              [x + Math.sin(a) * r * 0.72, h + 0.48, z + Math.cos(a) * r * 0.72],
              [x + Math.sin(a + 0.35) * r * 0.65, h + 0.3 + r * 1.18, z + Math.cos(a + 0.35) * r * 0.65],
              0.021,
              gold
            );
          }
        }
      }

      function rapaNui() {
        island(3.65, 1.52, green);
        for (const [x, scale] of [
          [-1.02, 0.76],
          [-0.08, 1.0],
          [1.0, 0.86]
        ]) {
          const head = group('moai');
          sculpture.add(head);
          head.position.set(x, 0.21, 0);
          head.scale.setScalar(scale);
          const rock = automated ? 0x897e69 : 0x887c67;
          box(head, 0.88, 0.43, 0.53, rock, 0, 0.22, 0);
          const face = mesh(head, new T.CylinderGeometry(0.43, 0.32, 1.36, 6), rock, 0, 1.02, 0);
          face.scale.z = 0.77;
          box(head, 0.71, 0.23, 0.4, rock, 0, 1.6, 0.08);
          for (const side of [-1, 1]) {
            box(head, 0.3, 0.12, 0.22, trim, side * 0.16, 1.29, 0.28).rotation.z = side * 0.12;
            box(head, 0.14, 0.41, 0.14, rock, side * 0.34, 1.09, 0);
          }
          const nose = mesh(head, new T.ConeGeometry(0.17, 0.48, 4), stone, 0, 1.05, 0.34);
          nose.rotation.y = Math.PI / 4;
          box(head, 0.4, 0.07, 0.12, trim, 0, 0.77, 0.29);
          box(head, 0.39, 0.16, 0.22, rock, 0, 0.65, 0.24);
          if (automated) {
            const band = mesh(head, new T.TorusGeometry(0.53, 0.08, 6, 18, Math.PI), steel, 0, 1.3, 0);
            band.scale.y = 1.13;
            for (const side of [-1, 1]) {
              const cup = mesh(head, new T.CylinderGeometry(0.24, 0.24, 0.2, 12), orange, side * 0.49, 1.28, 0);
              cup.rotation.z = Math.PI / 2;
            }
            beam(head, [0.54, 1.19, 0.05], [0.48, 0.91, 0.43], 0.048, steel);
            beam(head, [0.48, 0.91, 0.43], [0.16, 0.91, 0.47], 0.046, steel);
            box(head, 0.2, 0.12, 0.13, orange, 0.12, 0.91, 0.47);
          }
          if (x === 1) mesh(head, new T.CylinderGeometry(0.28, 0.37, 0.29, 9), 0xa95742, 0, 1.83, 0);
        }
      }

      function capeTown() {
        island(3.8, 2.08, water);
        const ridge = [
          [-1.75, 0],
          [-1.68, 0.28],
          [-1.29, 0.65],
          [-0.98, 1.26],
          [-0.9, 1.47],
          [0.7, 1.5],
          [0.82, 1.36],
          [1.12, 0.75],
          [1.48, 0.99],
          [1.78, 0.29],
          [1.82, 0]
        ];
        profile(ridge, 1.04, 0x816f61, 0, 0.2, -0.18);
        profile(
          [
            [-1.0, 0],
            [-0.93, 0.14],
            [0.72, 0.17],
            [0.83, 0.025]
          ],
          1.07,
          green,
          0,
          1.52,
          -0.18
        );
        for (let i = 0; i < 8; i++) {
          const x = -0.88 + i * 0.21;
          rod([x, 0.53, 0.36], [x + 0.085, 1.38 - (i % 3) * 0.09, 0.36], 0.043, stone);
        }
        rod([-0.72, 1.83, 0.29], [1.47, 0.4, 0.72], 0.024, ink);
        rod([-0.72, 1.53, 0.29], [-0.72, 1.86, 0.29], 0.047, trim);
        rod([0.18, 1.24, 0.47], [0.18, 1.05, 0.47], 0.03, ink);
        block(0.18, 0.95, 0.47, 0.34, 0.24, 0.25, automated ? palette.server : 0xeb6842);
        block(0.18, 1, 0.604, 0.25, 0.078, 0.02, ink);
        if (automated) {
          drum(0.3, 1.99, -0.13, 0.3, 0.34, 0.61, enamel);
          drum(0.3, 2.3, -0.13, 0.29, 0.29, 0.025, 0x65422e);
          hoop(0.63, 2.04, -0.13, 0.2, 0.065, orange);
          block(-0.6, 1.73, 0.04, 0.51, 0.095, 0.36, steel);
          pipe(
            [
              [-0.6, 1.75, 0.04],
              [-0.91, 2.29, 0.04],
              [-0.46, 2.65, 0.04]
            ],
            0.064,
            steel
          );
          disc(-0.91, 2.29, 0.06, 0.11, 0.13, orange);
          const shade = drum(-0.4, 2.56, 0.04, 0.33, 0.11, 0.36, orange);
          shade.rotation.z = 0.28;
          ellipsoid(-0.36, 2.39, 0.04, 0.15, 0.12, 0.15, brass);
        }
      }

      const sculpt = {
        paris: latticeOrLiberty,
        tokyo: latticeOrLiberty,
        newyork: latticeOrLiberty,
        giza,
        beijing: greatWall,
        agra: tajMahal,
        rome: colosseum,
        sydney: operaHouse,
        rio,
        fujiyoshida: fuji,
        london,
        chichenitza: chichenItza,
        machupicchu: machuPicchu,
        athens,
        singapore,
        niagara,
        barcelona,
        dubai,
        moscow,
        rapanui: rapaNui,
        capetown: capeTown
      };
      sculpt[city]();
      return bakeLandmark(sculpture, city, automated);
    }

    // One vertex-coloured mesh per landmark keeps ranks of windows, piers and ribs
    // from turning a globe full of models into thousands of draw calls.
    function bakeLandmark(sculpture, city, automated) {
      const bounds = new T.Box3().setFromObject(sculpture, true);
      const size = bounds.getSize(new T.Vector3()),
        center = bounds.getCenter(new T.Vector3());
      const scale = Math.min(4.5 / size.y, 4.3 / Math.max(size.x, size.z));
      center.y = bounds.min.y;
      return bakeGeometry(sculpture, city + '-landmark' + (automated ? '-automated' : ''), center, scale);
    }

    function bakeWorld(sculpture) {
      return bakeGeometry(sculpture, sculpture.name, new T.Vector3(), 1);
    }

    function bakeGeometry(sculpture, name, origin, scale) {
      sculpture.updateMatrixWorld(true);
      const positions = [], colors = [];
      const point = new T.Vector3();
      sculpture.traverse((part) => {
        if (!part.isMesh) return;
        const geometry = part.geometry,
          vertices = geometry.attributes.position;
        const count = geometry.index?.count ?? vertices.count;
        const color = part.material.color;
        const paint = part.material.vertexColors && geometry.attributes.color;
        for (let i = 0; i < count; i++) {
          const index = geometry.index ? geometry.index.getX(i) : i;
          point.fromBufferAttribute(vertices, index).applyMatrix4(part.matrixWorld);
          positions.push(
            (point.x - origin.x) * scale,
            (point.y - origin.y) * scale,
            (point.z - origin.z) * scale
          );
          if (paint) colors.push(color.r*paint.getX(index), color.g*paint.getY(index), color.b*paint.getZ(index));
          else colors.push(color.r, color.g, color.b);
        }
      });
      clear(sculpture);
      const geometry = new T.BufferGeometry();
      geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
      geometry.computeVertexNormals();
      if (!materials.has('landmark-paint')) {
        const paint = new T.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.78,
          flatShading: true,
          side: T.DoubleSide
        });
        sharedMaterials.add(paint);
        materials.set('landmark-paint', paint);
      }
      const model = new T.Mesh(geometry, materials.get('landmark-paint'));
      model.castShadow = model.receiveShadow = true;
      const result = group(name);
      result.add(model);
      return result;
    }

    const streetProfiles = {
      paris:[.87,.81,.83,.76,.83], giza:[1.72,1.35,1.53,1.93,1.28],
      beijing:[1.45,1.58,1.68,1.55,1.32], agra:[1.65,1.65,1.65,1.65,1.65],
      rome:[2.03,1.76,1.30,1.46,1.68], sydney:[.75,.84,1.04,.90,.88],
      newyork:[1.44,1.44,1.44,1.44,1.44], rio:[.72,.86,1.00,.84,.62],
      fujiyoshida:[1.48,1.48,1.53,1.60,1.68], london:[1.28,1.39,1.69,1.76,1.69],
      chichenitza:[1.73,1.54,1.38,1.48,1.77], machupicchu:[.77,.93,.91,.71,.69],
      athens:[1.85,1.51,1.33,1.51,1.80], singapore:[.83,.83,.83,.83,.83],
      niagara:[.65,.82,1.03,.96,.77], barcelona:[1.46,1.46,1.46,1.46,1.46],
      dubai:[.65,.77,.95,.70,.57], moscow:[1.40,1.40,1.40,1.40,1.40],
      rapanui:[.67,.89,1.06,.87,.67], capetown:[1.83,1.55,1.35,1.49,1.69]
    };
    function streetZ(city, x) {
      const u = Math.max(0, Math.min(4, (x + 4.8) / 2.4)),
        i = Math.min(3, Math.floor(u));
      const profile = streetProfiles[city];
      return T.MathUtils.lerp(profile[i], profile[i + 1], u - i);
    }

    function localScenery(city) {
      const theme = neighbourhoods[city],
        terrain = group(city + '-streets');
      const cream = 0xf3e2ba,
        timber = 0x855e47,
        metal = 0x43595a,
        leaf = 0x618660;
      const b = (x, y, z, w, h, d, color) => box(terrain, w, h, d, color, x, y, z);
      const cylinder = (x, y, z, bottom, top, h, c, n = 12) => mesh(terrain, new T.CylinderGeometry(top, bottom, h, n), c, x, y, z);
      const oval = (x, y, z, rx, ry, rz, c, detail = 1) => {
        const v = ball(terrain, 1, c, x, y, z, detail);
        v.scale.set(rx, ry, rz);
        return v;
      };
      const rod = (a, b, r, c) => beam(terrain, a, b, r, c);
      const xValues = [-4.77, -2.4, 0, 2.4, 4.77];
      const road = xValues.map((x) => [x, streetZ(city, x)]);
      function ribbon(path, width, y, c) {
        const positions = [];
        const rails = path.map(([x, z], i) => {
          const [px, pz] = path[Math.max(0, i - 1)],
            [nx, nz] = path[Math.min(path.length - 1, i + 1)];
          const len = Math.hypot(nx - px, nz - pz);
          const dx = ((-(nz - pz) / len) * width) / 2,
            dz = (((nx - px) / len) * width) / 2;
          return [
            [x + dx, y, z + dz],
            [x - dx, y, z - dz]
          ];
        });
        for (let i = 1; i < rails.length; i++) {
          const [a, b] = rails[i - 1],
            [c, d] = rails[i];
          positions.push(...a, ...c, ...b, ...b, ...c, ...d);
        }
        const geo = new T.BufferGeometry();
        geo.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
        geo.computeVertexNormals();
        mesh(terrain, geo, c);
      }
      function ridge(x, y, z, rx, ry, rz, c) {
        oval(x, y, z, rx, ry, rz, c, 0);
      }
      function railing(x1, x2, z, y, c = metal) {
        rod([x1, y + 0.31, z], [x2, y + 0.31, z], 0.034, c);
        for (let i = 0; i <= Math.ceil((x2 - x1) / 0.6); i++) {
          const x = T.MathUtils.lerp(x1, x2, i / Math.ceil((x2 - x1) / 0.6));
          b(x, y + 0.17, z, 0.047, 0.34, 0.047, c);
        }
      }
      function water(edge, color) {
        const shore = xValues.map((x, i) => [x, edge[i]]);
        footprint(terrain, [...shore, [4.77, 3.47], [-4.77, 3.47]], 0.23, color, 0, -0.2, 0);
        for (let i = 0; i < 11; i++) {
          const x = -4.28 + ((i * 1.57) % 8.35);
          const z = 2.64 + (i % 3) * 0.24;
          if (z > Math.max(...edge) + 0.06)
            ribbon(
              [
                [x, z],
                [x + 0.22, z - 0.035],
                [x + 0.42, z - 0.01]
              ],
              0.026,
              0.044,
              0xb6ded4
            );
        }
        return shore;
      }
      function palm(x, z, s = 1) {
        const crown = [x + 0.09 * s, 1.31 * s, z];
        rod([x, 0.05, z], crown, 0.08 * s, timber);
        for (let i = 0; i < 7; i++) {
          const a = (i * Math.PI * 2) / 7;
          const tip = [crown[0] + Math.cos(a) * 0.66 * s, crown[1] - 0.19 * s, z + Math.sin(a) * 0.66 * s];
          const mid = [crown[0] + Math.cos(a) * 0.33 * s, crown[1] + 0.1 * s, z + Math.sin(a) * 0.33 * s];
          const side = [-Math.sin(a) * 0.13 * s, 0, Math.cos(a) * 0.13 * s];
          const left = mid.map((v, j) => v + side[j]),
            right = mid.map((v, j) => v - side[j]);
          const data = [...crown, ...left, ...mid, ...mid, ...left, ...tip, ...crown, ...mid, ...right, ...mid, ...tip, ...right];
          const geom = new T.BufferGeometry();
          geom.setAttribute('position', new T.Float32BufferAttribute(data, 3));
          geom.computeVertexNormals();
          mesh(terrain, geom, i % 2 ? 0x457e60 : 0x639457);
        }
      }
      function tree(x, z, s = 1, kind = 'round', y = 0.04) {
        rod([x, y, z], [x, y + 0.87 * s, z], 0.068 * s, timber);
        if (kind === 'umbrella') {
          for (const dx of [-0.24, 0.24]) rod([x, y + 0.55 * s, z], [x + dx * s, y + 1.03 * s, z], 0.036 * s, timber);
          oval(x, y + 1.08 * s, z, 0.57 * s, 0.25 * s, 0.5 * s, 0x527b58);
        } else if (kind === 'cypress' || kind === 'pine') {
          const r = kind === 'pine' ? 0.3 : 0.15;
          cone(terrain, r * s, 0.85 * s, leaf, x, y + 0.68 * s, z, 7);
          cone(terrain, r * 0.76 * s, 0.67 * s, 0x517755, x, y + 0.96 * s, z, 7);
        } else {
          oval(x, y + 0.8 * s, z, 0.35 * s, 0.4 * s, 0.33 * s, kind === 'blossom' ? 0xe1b9c1 : leaf);
        }
      }
      function boat(x, z, s, kind, c) {
        const craft = place(terrain, group(kind), x, 0.03, z, s);
        const hull = [
          [-0.98, -0.03],
          [-0.67, -0.29],
          [0.65, -0.29],
          [0.99, -0.05],
          [0.66, 0.29],
          [-0.66, 0.29]
        ];
        footprint(craft, hull, 0.16, c, 0, 0.015, 0);
        footprint(
          craft,
          hull.map(([a, b]) => [a * 0.93, b * 0.85]),
          0.045,
          cream,
          0,
          0.172,
          0
        );
        if (kind === 'skiff') {
          for (const dx of [-0.47, 0, 0.47]) box(craft, 0.09, 0.04, 0.43, timber, dx, 0.23, 0);
          beam(craft, [-0.45, 0.25, -0.33], [0.46, 0.27, 0.32], 0.023, timber);
        } else if (kind === 'abra') {
          for (const dx of [-0.44, 0.44]) for (const dz of [-0.19, 0.19]) box(craft, 0.04, 0.42, 0.04, timber, dx, 0.42, dz);
          roofLoft(craft, 1.27, 0.61, 0.11, 1.15, 0.48, 0x546d79, 0, 0.64, 0);
          for (const dx of [-0.3, 0, 0.3]) box(craft, 0.12, 0.07, 0.42, 0xac7d51, dx, 0.27, 0);
        } else {
          box(craft, 1.35, 0.33, 0.45, cream, 0, 0.37, 0);
          for (const dx of [-0.49, -0.25, 0, 0.25, 0.49])
            for (const dz of [-0.232, 0.232]) box(craft, 0.17, 0.17, 0.025, metal, dx, 0.4, dz);
          box(craft, 1.56, 0.08, 0.59, c, 0, 0.57, 0);
          box(craft, 0.5, 0.21, 0.39, cream, 0.08, 0.7, 0);
          box(craft, 0.31, 0.1, 0.025, metal, 0.08, 0.72, 0.205);
          box(craft, 0.58, 0.045, 0.47, c, 0.08, 0.83, 0);
        }
        return craft;
      }
      function streetVehicle(x, z, kind, color, scale = 1) {
        const vehicle = place(terrain, group(kind), x, 0.063, z, scale);
        const long = ['double-decker', 'tram', 'train'].includes(kind),
          w = long ? 1.52 : 0.72;
        const vb = (x, y, z, w, h, d, c) => box(vehicle, w, h, d, c, x, y, z);
        if (kind === 'rickshaw') {
          vb(0, 0.21, 0, 0.61, 0.17, 0.42, 0x39946c);
          for (const dx of [-0.21, 0.19]) for (const dz of [-0.17, 0.17]) vb(dx, 0.43, dz, 0.038, 0.39, 0.038, metal);
          roofLoft(vehicle, 0.61, 0.49, 0.1, 0.49, 0.38, 0xedb947, 0, 0.59, 0);
          vb(-0.12, 0.3, 0, 0.21, 0.13, 0.32, timber);
        } else {
          vb(0, 0.28, 0, w, 0.3, 0.47, color);
          const rows = kind === 'double-decker' ? 2 : 1;
          for (let row = 0; row < rows; row++) {
            const y = 0.49 + row * 0.28,
              ww = long ? w - 0.08 : w * 0.66;
            vb(0, y, 0, ww, 0.25, 0.4, kind === 'tram' || kind === 'train' ? cream : color);
            const n = long ? 5 : 2;
            for (let i = 0; i < n; i++)
              for (const side of [-1, 1])
                vb(((i - (n - 1) / 2) * ww) / n, y + 0.015, side * 0.206, (ww / n) * 0.74, 0.15, 0.022, metal);
            vb(0, y + 0.14, 0, ww + 0.06, 0.055, 0.47, color);
          }
          if (kind === 'taxi') vb(0, 0.69, 0, 0.17, 0.11, 0.14, cream);
          if (kind === 'tram') {
            beam(vehicle, [-0.2, 0.68, 0], [0.08, 0.96, 0], 0.026, metal);
            beam(vehicle, [0.08, 0.96, 0], [0.33, 0.71, 0], 0.026, metal);
          }
        }
        for (const dx of [-w * 0.3, w * 0.3])
          for (const dz of [-0.22, 0.22]) {
            const wheel = mesh(vehicle, new T.CylinderGeometry(0.115, 0.115, 0.095, 10), metal, dx, 0.125, dz);
            wheel.rotation.x = Math.PI / 2;
          }
        return vehicle;
      }
      function stall(x, z, canopy, scale = 1) {
        const g = place(terrain, group('market-stall'), x, 0.04, z, scale);
        box(g, 0.8, 0.27, 0.44, timber, 0, 0.19, 0);
        for (const sx of [-0.34, 0.34]) for (const sz of [-0.16, 0.16]) box(g, 0.043, 0.65, 0.043, timber, sx, 0.39, sz);
        for (let i = 0; i < 5; i++) box(g, 0.19, 0.06, 0.64, i % 2 ? cream : canopy, (i - 2) * 0.18, 0.76, 0).rotation.x = 0.1;
        for (const [i, c] of [0xc77940, 0x82994c, 0xe3b64d].entries()) box(g, 0.17, 0.1, 0.27, c, (i - 1) * 0.23, 0.38, 0);
      }
      function tracks(z, color, raising = 0.065) {
        b(0, raising, z, 9.48, 0.045, 0.7, color);
        for (let i = 0; i < 26; i++) b(-4.53 + i * 0.36, raising + 0.035, z, 0.077, 0.045, 0.65, timber);
        for (const dz of [-0.235, 0.235]) b(0, raising + 0.078, z + dz, 9.49, 0.045, 0.045, metal);
      }
      function garden(x, z, w, d) {
        b(x, 0.035, z, w, 0.07, d, 0xd5c394);
        for (const dx of [-0.25, 0.25])
          for (const dz of [-0.25, 0.25]) b(x + w * dx, 0.088, z + d * dz, w * 0.42, 0.085, d * 0.39, 0x80a167);
      }
      function parasol(x, z, c) {
        rod([x, 0.06, z], [x, 0.72, z], 0.031, timber);
        cone(terrain, 0.45, 0.18, c, x, 0.79, z, 8);
        cylinder(x, 0.29, z, 0.2, 0.2, 0.055, cream);
      }
      function square(x, z, w, d, c) {
        b(x, 0.024, z, w, 0.048, d, c);
      }
      function crosswalk(x, z) {
        for (let i = 0; i < 5; i++) b(x + (i - 2) * 0.105, 0.063, z, 0.066, 0.014, 0.62, cream);
      }
      const outline = [
        [-4.62, -3.5],
        [4.62, -3.5],
        [4.8, -3.32],
        [4.8, 3.32],
        [4.62, 3.5],
        [-4.62, 3.5],
        [-4.8, 3.32],
        [-4.8, -3.32]
      ];
      const edgeColor = new T.Color(theme.ground).multiplyScalar(0.64).getHex();
      footprint(terrain, outline, 0.25, edgeColor, 0, -0.26, 0);
      footprint(terrain, outline, 0.045, theme.ground, 0, -0.042, 0);
      if (theme.plan === 'hillside') {
        b(0, 0.18, -2.52, 9.35, 0.36, 1.77, city === 'rio' ? 0x98aa73 : theme.ground);
        b(0, 0.4, -2.66, 9.3, 0.09, 1.5, theme.ground);
        for (const x of [-3.56, 3.56]) b(x, 0.095, -0.96, 1.65, 0.19, 1.24, theme.ground);
      }
      const streetWidth = theme.plan === 'garden' ? 0.58 : 0.7;
      ribbon(road, streetWidth + 0.25, 0.031, 0xd0c6ae);
      ribbon(road, streetWidth, 0.037, theme.street);
      if (!['quay', 'hillside'].includes(theme.plan)) {
        for (const side of [-1, 1]) {
          const x = side * 2.82;
          ribbon(
            [
              [x, -3.47],
              [x * 0.98, -1.53],
              [x * 0.96, 0.12],
              [x, streetZ(city, x)],
              [x + 0.12, 3.46]
            ],
            0.38,
            0.033,
            theme.street
          );
        }
      }
      switch (city) {
        case 'paris': {
          const shore = water([1.72, 1.75, 1.79, 1.78, 1.76], 0x619caa);
          ribbon(shore, 0.15, 0.11, 0xc8b594);
          garden(0, -0.65, 4.5, 2.88);
          for (const x of [-3.45, -2.45, -1.43, -0.42]) {
            b(x, 0.33, 1.47, 0.84, 0.37, 0.34, 0x446c54);
            b(x, 0.59, 1.36, 0.91, 0.08, 0.46, 0x385f4c).rotation.x = -0.48;
            for (let i = 0; i < 4; i++) b(x - 0.24 + i * 0.15, 0.55, 1.53, 0.1, 0.09, 0.14, [cream, 0xc49b71, 0xbd7765, 0x78969c][i]);
          }
          const x = 2.7;
          b(x, 0.26, 2.57, 0.82, 0.12, 1.83, 0xc9b496);
          for (const dz of [1.98, 2.71, 3.37]) b(x, 0.11, dz, 0.69, 0.24, 0.18, 0xb6a184);
          for (const dx of [-0.41, 0.41]) b(x + dx, 0.39, 2.55, 0.065, 0.18, 1.84, cream);
          for (const x of [-2.72, 2.75]) tree(x, -0.65);
          break;
        }
        case 'giza': {
          for (let i = 0; i < 4; i++)
            ribbon(
              [
                [-2.65, 2.2 + i * 0.23],
                [-0.9, 2.01 + i * 0.23],
                [1.2, 2.26 + i * 0.22],
                [2.55, 2.03 + i * 0.22]
              ],
              0.07,
              0.052,
              i % 2 ? 0xdfaf66 : 0xeed097
            );
          // Narrow irrigated strips pick out the edge of the desert settlement.
          for (let i = 0; i < 4; i++) {
            const x = -2.51 + i * 0.18;
            ribbon(
              [
                [x, -1.69],
                [x + 0.1, -0.43],
                [x + 0.04, 0.74]
              ],
              0.115,
              0.069,
              i % 2 ? 0x879555 : 0xa6ac64
            );
          }
          for (const [x, z, s] of [
            [-2.75, 0.02, 1],
            [2.65, 0.18, 0.93],
            [1.91, 2.74, 0.77]
          ])
            palm(x, z, s);
          stall(-1.09, 2.77, 0xb8704b);
          stall(-0.06, 2.86, 0x647d77);
          streetVehicle(1.28, streetZ(city, 1.28), 'pickup', 0x92afb0);
          break;
        }
        case 'beijing': {
          garden(0, -0.55, 4.6, 2.62);
          for (const [x, z, s] of [
            [-3.35, -3.06, 1.12],
            [-1.45, -3.12, 1.07],
            [1.44, -3.06, 1.05],
            [3.33, -3.05, 1.14]
          ]) {
            ridge(x, 0.32, z, 0.92, s, 0.46, 0x718a62);
            tree(x - 0.41, z, 0.85, 'pine', 0.31);
          }
          for (const x of [-1.59, 1.16]) {
            b(x, 0.27, 2.47, 1.75, 0.53, 0.12, 0xaeb19b);
            roofLoft(terrain, 1.91, 0.35, 0.12, 1.74, 0.04, 0x48595a, x, 0.54, 2.47);
            for (const dx of [-0.77, 0.77]) ball(terrain, 0.12, 0xc95b43, x + dx, 0.47, 2.58, 1);
          }
          tree(-2.63, -0.33);
          tree(2.66, 0.22);
          break;
        }
        case 'agra': {
          garden(0, -0.59, 4.54, 2.76);
          b(0, 0.09, 0.12, 0.6, 0.04, 1.31, 0x74b5b7);
          for (const x of [-2.18, 2.18]) for (const z of [-1.3, -0.59, 0.11]) tree(x, z, 0.71, 'cypress');
          for (const [i, c] of [0xca794e, 0xe2b449, 0x668f7c].entries()) stall(-1.7 + i * 1.01, 2.76, c);
          streetVehicle(1.54, 1.66, 'rickshaw', 0x4a9769, 1.24);
          break;
        }
        case 'rome': {
          square(0, -0.37, 4.85, 2.95, 0xc8b397);
          for (const x of [-2.13, -1.24, -0.35, 0.54, 1.43])
            for (const z of [-1.25, -0.75, -0.25, 0.25]) b(x, 0.053, z, 0.62, 0.015, 0.035, 0xd4c3a7);
          for (const [x, z] of [
            [-2.54, 0.17],
            [2.64, -0.43],
            [-1.62, 2.83]
          ])
            tree(x, z, 1.17, 'umbrella');
          for (const x of [0.35, 1.28, 2.15]) parasol(x, 2.72, 0xb47656);
          for (const x of [-0.43, 0.18]) {
            for (const dx of [-0.19, 0.19]) cylinder(x + dx, 0.16, 1.39, 0.12, 0.12, 0.06, metal).rotation.x = Math.PI / 2;
            b(x, 0.28, 1.39, 0.4, 0.16, 0.17, 0xaeb8a1);
            rod([x + 0.15, 0.25, 1.39], [x + 0.25, 0.54, 1.39], 0.033, metal);
          }
          break;
        }
        case 'sydney': {
          const shore = water([1.44, 1.71, 1.63, 1.79, 1.53], 0x398eaa);
          ribbon(shore, 0.19, 0.12, 0xc6ac7f);
          for (const x of [-2.93, 1.05]) {
            b(x, 0.18, 2.21, 0.72, 0.13, 1.44, timber);
            for (const i of [-0.33, 0.33]) for (const z of [1.73, 2.75]) b(x + i, 0.24, z, 0.1, 0.47, 0.1, cream);
            roofLoft(terrain, 0.89, 0.98, 0.24, 0.77, 0.03, 0x678276, x, 0.8, 1.96);
            for (const i of [-0.32, 0.32]) for (const z of [1.6, 2.28]) b(x + i, 0.48, z, 0.045, 0.61, 0.045, metal);
          }
          boat(-0.94, 2.64, 1.26, 'harbour-ferry', 0x39745e);
          boat(2.87, 2.62, 0.77, 'skiff', 0xb77957);
          ribbon(
            [
              [-3.24, 1.37],
              [-0.4, 1.44],
              [1.53, 1.44],
              [3.21, 1.3]
            ],
            0.24,
            0.069,
            0xdfc097
          );
          tree(-2.65, -0.32, 0.95, 'umbrella');
          tree(2.64, -0.5, 1.05, 'umbrella');
          break;
        }
        case 'newyork': {
          square(0, -0.42, 4.52, 2.65, 0xc4b59f);
          for (const z of [-1.72, 0.46])
            ribbon(
              [
                [-4.75, z],
                [4.75, z]
              ],
              0.28,
              0.051,
              0x989b90
            );
          for (const x of [-2.75, 2.78]) crosswalk(x, 1.44);
          for (const x of [-1.02, 1.38]) streetVehicle(x, 1.46, 'taxi', 0xf3bc36, 0.93);
          for (const x of [-2.1, 1.32]) {
            b(x, 0.062, 2.64, 0.75, 0.1, 0.68, 0x829b72);
            tree(x, 2.64, 0.94);
          }
          // The stairwell and globe lamps read as a subway entrance from across the street.
          b(-0.51, 0.072, 2.71, 1.62, 0.09, 0.64, 0x464e4a);
          for (let i = 0; i < 5; i++) b(-1.11 + i * 0.24, 0.087 + i * 0.025, 2.7, 0.18, 0.055, 0.53, 0x91978d);
          for (const z of [2.39, 3.01]) {
            railing(-1.43, 0.35, z, 0.11, 0x3e6a57);
            rod([0.35, 0.07, z], [0.35, 0.77, z], 0.042, 0x365b4e);
            ball(terrain, 0.128, 0xa4c986, 0.35, 0.82, z, 1);
          }
          ribbon(
            [
              [0.08, -1.52],
              [0.08, 0.4]
            ],
            0.1,
            0.061,
            0xe0ccaa
          );
          break;
        }
        case 'rio': {
          const shore = water([2.76, 2.6, 2.69, 2.82, 2.62], 0x51adbb);
          ribbon(shore, 1.0, 0.05, 0xe3c38a);
          const walk = xValues.map((x) => [x, 1.74]);
          ribbon(walk, 1.04, 0.055, 0xf2e3c6);
          for (const dz of [-0.31, 0, 0.31]) {
            const pattern = [];
            for (let i = 0; i <= 75; i++) {
              const x = -4.72 + (9.44 * i) / 75;
              pattern.push([x, 1.74 + dz + 0.115 * Math.sin(x * 3.6)]);
            }
            ribbon(pattern, 0.103, 0.059, 0x424b49);
          }
          for (const x of [-3.01, -1.14, 1.08, 3.03]) palm(x, 2.27, 0.88);
          square(0, -0.54, 4.39, 2.55, 0x95a86f);
          break;
        }
        case 'fujiyoshida': {
          tracks(2.9, 0xa9a396);
          streetVehicle(-0.53, 2.9, 'train', 0xc27d53, 1.02).position.y = 0.16;
          for (const x of [-2.66, 2.68]) {
            b(x, 0.54, 2.42, 0.1, 1.03, 0.1, metal);
            for (const angle of [-0.81, 0.81]) b(x, 0.97, 2.42, 0.11, 0.67, 0.075, 0xf1bc43).rotation.z = angle;
            for (const dx of [-0.12, 0.12]) cylinder(x + dx, 0.73, 2.48, 0.089, 0.089, 0.065, metal).rotation.x = Math.PI / 2;
          }
          for (const [x, z] of [
            [-2.51, 0.11],
            [2.37, -0.43],
            [1.53, -2.77]
          ])
            tree(x, z, 0.9, 'blossom');
          square(0, -0.56, 3.95, 2.48, 0xb7bf98);
          break;
        }
        case 'london': {
          const park = 0x91ae79;
          square(0, -0.64, 4.61, 2.86, park);
          ribbon(
            [
              [-2.18, 0.63],
              [0, -0.55],
              [2.24, -1.73]
            ],
            0.23,
            0.059,
            0xcac4a8
          );
          for (const x of [-2.18, 2.12]) tree(x, -0.37, 1.06);
          streetVehicle(-0.68, streetZ(city, -0.68), 'double-decker', 0xc84b40, 1.14);
          b(1.46, 0.56, 2.57, 0.42, 1.1, 0.43, 0xb94439);
          b(1.46, 0.66, 2.8, 0.28, 0.54, 0.026, 0x7f9a97);
          roofLoft(terrain, 0.49, 0.49, 0.09, 0.33, 0.33, 0xba4942, 1.46, 1.12, 2.57);
          railing(-2.72, 0.8, 2.95, 0.05);
          crosswalk(2.54, streetZ(city, 2.54));
          break;
        }
        case 'chichenitza': {
          square(0, -0.45, 4.45, 2.7, 0xc9c498);
          for (const i of [0, 1, 2]) stall(-1.09 + i * 1.05, 2.74, [0xc48057, 0xc2a353, 0x67998a][i], 0.98);
          for (const x of [-2.65, 2.58]) {
            b(x, 0.2, 0.25, 0.32, 0.4, 1.63, 0xcac4a6);
            for (const dz of [-0.51, 0, 0.51]) b(x, 0.425, 0.25 + dz, 0.37, 0.11, 0.38, 0xe2d6b1);
          }
          for (const [x, z] of [
            [-2.39, -1.58],
            [2.31, -1.74],
            [-1.76, -2.92]
          ])
            tree(x, z, 0.94, 'round');
          palm(2.36, 2.95, 0.74);
          break;
        }
        case 'machupicchu': {
          water([2.21, 2.05, 2.13, 2.49, 2.14], 0x69a6ab);
          tracks(1.57, 0x99947d);
          streetVehicle(-1.35, 1.57, 'train', 0x387399, 1.15).position.y = 0.16;
          for (const [x, z, h] of [
            [-3.7, -3.07, 1.86],
            [-2.46, -3.07, 2.67],
            [-1.52, -3.08, 2.22],
            [1.34, -3.09, 1.75],
            [3.42, -3.08, 2.12]
          ])
            ridge(x, 0.5, z, 1.07, h, 0.48, 0x578164);
          b(1.38, 0.17, 1.1, 1.62, 0.21, 0.41, 0xb8aa87);
          for (const x of [0.73, 2.02]) b(x, 0.6, 1.08, 0.06, 0.86, 0.06, metal);
          roofLoft(terrain, 1.8, 0.56, 0.12, 1.64, 0.08, 0x627d74, 1.38, 1.02, 1.08);
          for (const x of [-1.89, 1.67]) ridge(x, 0.1, 2.82, 0.37, 0.26, 0.33, 0x919786);
          b(2.3, 0.22, 2.65, 0.6, 0.14, 1.43, timber);
          for (const x of [2.02, 2.58]) b(x, 0.4, 2.7, 0.054, 0.29, 1.35, timber);
          break;
        }
        case 'athens': {
          square(0, -0.64, 4.62, 2.62, 0xe2d3b5);
          for (let i = 0; i < 6; i++) b(-0.82, 0.056 + i * 0.034, 1.91 + i * 0.16, 1.11, 0.1 + i * 0.068, 0.18, cream);
          b(-0.82, 0.223, 3.02, 1.86, 0.445, 0.62, cream);
          for (const x of [-1.58, -0.07]) {
            b(x, 0.94, 3.12, 0.055, 1.0, 0.055, timber);
            cylinder(x, 0.2, 2.29, 0.13, 0.17, 0.31, 0xb76f4d);
            oval(x, 0.48, 2.29, 0.24, 0.29, 0.22, 0xc57d9b);
          }
          rod([-1.7, 1.42, 3.12], [0.06, 1.42, 3.12], 0.045, timber);
          for (let i = 0; i < 6; i++) oval(-1.56 + i * 0.29, 1.43 + (i % 2) * 0.055, 3.11, 0.29, 0.18, 0.27, i % 3 ? 0xc47b9c : leaf);
          for (const [x, z] of [
            [-2.7, 0.12],
            [2.58, 0.35],
            [1.74, -1.69]
          ])
            tree(x, z, 1.05, 'cypress');
          for (const x of [1.12, 2.03]) parasol(x, 2.66, 0x94b9b3);
          break;
        }
        case 'singapore': {
          water([2.13, 2.13, 2.13, 2.13, 2.13], 0x6fa5a2);
          b(0, 0.17, 2.13, 9.53, 0.31, 0.15, 0xb8ab91);
          railing(-4.6, 4.62, 2.08, 0.29);
          garden(0, -0.7, 4.58, 2.57);
          for (const x of [-2.57, 1.67, 3.28]) tree(x, 1.56, 1.04, 'umbrella');
          for (const [x, c] of [
            [-0.84, 0xce7653],
            [0.08, 0x6b9c8b]
          ])
            stall(x, 1.52, c, 0.76);
          b(-2.3, 0.29, 2.82, 0.76, 0.15, 1.35, 0xc9bca1);
          break;
        }
        case 'niagara': {
          const shore = water([1.46, 1.8, 1.72, 1.42, 1.66], 0x4ca9ae);
          ribbon(shore, 0.46, 0.12, 0x999888);
          for (let i = 0; i < 19; i++) {
            const x = -4.48 + i * 0.49,
              z = 1.6 + 0.17 * Math.sin(i * 1.31);
            ridge(x, 0.1, z, 0.4, 0.29 + (i % 3) * 0.08, 0.36, i % 2 ? 0x94917f : 0x737f73);
          }
          for (const x of [-2.69, 0.58, 2.69]) {
            cylinder(x, 0.3, 2.0, 0.4, 0.46, 0.17, 0xbcb29b, 8);
            railing(x - 0.32, x + 0.32, 2.2, 0.39);
            tree(x, 0.24, 1.1, 'pine');
          }
          boat(-0.83, 2.93, 0.73, 'tour-boat', 0xad564c);
          garden(0, -0.64, 4.35, 2.48);
          break;
        }
        case 'barcelona': {
          footprint(
            terrain,
            [
              [-1.98, -1.72],
              [1.98, -1.72],
              [2.3, -1.4],
              [2.3, 0.39],
              [2, 0.72],
              [-1.98, 0.72],
              [-2.28, 0.4],
              [-2.28, -1.42]
            ],
            0.055,
            0xc6b599
          );
          for (const x of [-2.65, 2.65]) {
            ribbon(
              [
                [x, -3.48],
                [x, 3.45]
              ],
              0.48,
              0.056,
              theme.street
            );
            crosswalk(x, 1.46);
          }
          for (const x of [-1.62, -0.76, 0.1, 0.96, 1.82]) tree(x, 2.6, 0.78);
          b(0, 0.04, 2.61, 5.23, 0.065, 0.64, 0xc0b597);
          break;
        }
        case 'dubai': {
          const shore = water([1.64, 1.52, 1.7, 1.52, 1.66], 0x538e95);
          ribbon(shore, 0.24, 0.11, 0xc3ac87);
          for (const x of [-2.54, 0.78, 3.13]) {
            b(x, 0.14, 2.02, 0.57, 0.12, 1.07, timber);
            palm(x, 1.25, 0.95);
          }
          boat(-0.71, 2.8, 0.95, 'abra', timber);
          boat(2.03, 2.7, 0.83, 'abra', 0x986d46).rotation.y = 0.22;
          for (const x of [-1.28, -0.25, 0.78]) stall(x, 0.09, 0x9a7256, 0.83);
          break;
        }
        case 'moscow': {
          tracks(1.43, 0xadada3);
          streetVehicle(0.36, 1.43, 'tram', 0xb65546, 1.12).position.y = 0.16;
          square(0, -0.62, 4.4, 2.59, 0xe7e9dd);
          for (const x of [-2.57, 2.6]) {
            b(x, 0.83, 1.94, 0.06, 1.58, 0.06, metal);
            rod([x, 1.59, 1.94], [x, 1.59, 1.43], 0.033, metal);
          }
          rod([-2.57, 1.59, 1.43], [2.6, 1.59, 1.43], 0.016, metal);
          for (const x of [-1.65, -0.71, 1.6]) tree(x, 2.73, 0.96, 'pine');
          break;
        }
        case 'rapanui': {
          const shore = water([1.63, 2.0, 1.62, 1.83, 1.62], 0x4b9ca4);
          ribbon(shore, 0.39, 0.075, 0x656e62);
          for (let i = 0; i < 20; i++) {
            const x = -4.53 + i * 0.47,
              z = 1.8 + 0.2 * Math.sin(i * 1.46);
            ridge(x, 0.11, z, 0.32 + (i % 3) * 0.055, 0.18 + (i % 4) * 0.05, 0.27, 0x666d60);
          }
          for (const [x, z, s, c] of [
            [-1.27, 2.7, 0.76, 0xb15e4b],
            [0.58, 2.51, 0.7, 0x4698a0],
            [2.17, 2.83, 0.64, 0xc39645]
          ])
            boat(x, z, s, 'skiff', c).rotation.y = -0.2 + s;
          ribbon(
            [
              [-2.75, 0.7],
              [-1.83, -0.13],
              [0.55, -0.71],
              [2.82, -1.67]
            ],
            0.25,
            0.054,
            0xc1b28a
          );
          for (const dx of [-0.63, 0.62]) {
            b(-2.72 + dx, 0.22, 1.51, 0.1, 0.43, 0.11, timber);
            oval(-2.72 + dx, 0.47, 1.51, 0.078, 0.1, 0.078, 0xe69457);
          }
          for (const [x, z] of [
            [-2.75, -0.08],
            [2.7, 0.1],
            [2.3, -1.66]
          ])
            palm(x, z, 0.9);
          break;
        }
        case 'capetown': {
          square(0, -0.59, 4.43, 2.61, 0xc8b398);
          for (let i = 0; i < 9; i++) {
            const x = -2.7 + i * 0.66;
            for (let j = 0; j < 3; j++) b(x + (j % 2) * 0.23, 0.053, streetZ(city, x) - 0.24 + j * 0.2, 0.28, 0.022, 0.078, 0xc4b9a0);
          }
          // A pedestrian shortcut climbs between the two rows of painted houses.
          for (let i = 0; i < 7; i++) b(-2.58, 0.036 + i * 0.031, -0.46 - i * 0.18, 0.59, 0.065 + i * 0.062, 0.2, 0xe5d3ae);
          for (const x of [-2.94, -2.23]) b(x, 0.31, -1.12, 0.09, 0.46, 1.4, 0xdf9a78);
          ribbon(
            [
              [-4.7, 2.04],
              [-2.7, 2.05],
              [-0.88, 2.63],
              [0.85, 2.67],
              [2.73, 2.04],
              [4.7, 2.04]
            ],
            0.32,
            0.049,
            0xd2c0a1
          );
          for (const [i, c] of [0xe69578, 0x6cb9aa, 0xeabd70].entries()) {
            const x = -0.95 + i * 0.93;
            b(x, 0.19, 3.06, 0.87, 0.32, 0.37, c);
            oval(x, 0.42, 3.06, 0.41, 0.2, 0.2, i === 1 ? 0xc68591 : leaf);
          }
          tree(2.02, 2.34, 0.91, 'umbrella');
          break;
        }
      }
      return bakeWorld(terrain);
    }

    function createCity(city = 'paris', { takeover = 0, includeLandmark = true, robotCount } = {}) {
      checkCity(city);
      takeover = progress(takeover);
      if (city === 'tokyo') return createTokyoStudy(takeover, includeLandmark, robotCount);

      const district = group(city + '-district');
      const { plan } = neighbourhoods[city];
      const plots = localPlots[city] ?? streetPlans[plan];
      const localOffset = cityIds.indexOf(city);
      district.add(localScenery(city));
      if (includeLandmark) {
        const landmark = createLandmark(city, { automated: takeover >= 75 });
        landmark.userData.cityLandmark = true;
        place(district, landmark, 0, .06, -.55);
      }
      const converted = Math.floor(takeover * plots.length / 100);
      plots.forEach(([x, z, rotation = 0], index) => {
        const height = plan === 'hillside' && z < -.5 ? (z < -1.9 ? .445 : .19) : 0;
        const isRack = index < converted;
        const plot = isRack ? createDatacentre({variant: localOffset + index}) : createHouse(city, index);
        const scale = isRack ? .88 + (index % 2) * .08 : 1;
        place(district, plot, x, height, z, scale);
        plot.rotation.y = rotation;
        plot.userData.plot = index;
      });
      const pavement = [-3.17,-2.89,-1.46,-.92,.24,.52,1.61,2.74,3.17];
      pavement.forEach((x, i) => {
        const robot = robotCount === undefined ? takeover >= 50 || i < takeover / 15 : i < robotCount;
        const walker = createCharacter({ robot, variant: localOffset + i });
        const side = [0,1,5,8].includes(i) ? 1 : -1;
        place(district, walker, x, .051, streetZ(city, x) + side * (.39 + (i % 3) * .045), .76);
        walker.rotation.y = i % 3 === 0 ? 1.17 : i % 3 === 1 ? -1.03 : .34;
      });
      return district;
    }

    function createTokyoStudy(takeover, includeLandmark, robotCount) {
      const city = 'tokyo';
      const lots = [[-3.5,-2.6],[-1.45,-2.85],[1.1,-2.85],[3.5,-2.6],[-3.35,0],[-2.6,2.45],[-.8,2.5],[1.1,2.5],[3.25,2.35],[3.3,-.1]];
      const g = group(`${city}-district`);
      box(g, 9.6, .23, 7.0, 0xb5c995, 0, -.15, 0);
      box(g, 9.45, .035, 6.85, palette.grass, 0, -.015, 0);
      box(g, 9.45, .025, .65, palette.path, 0, .012, 1.58);
      box(g, .6, .028, 6.85, palette.path, 2.56, .016, 0);
      box(g, 4.65, .035, 3.52, 0xcbd1b4, 0, .035, -.45);
      box(g, .48, .045, 6.85, 0x7cb5c4, -4.25, .018, 0);
      box(g, .8, .08, .7, 0xc8c1ac, -4.25, .04, 1.58);
      if (includeLandmark) {
        const landmark = createLandmark(city, { automated: takeover >= 75 });
        landmark.userData.cityLandmark = true;
        place(g, landmark, 0, .06, -.45);
      }
      const replaced = Math.floor(takeover / 100 * lots.length);
      lots.forEach(([x,z], index) => place(g, index < replaced ? createDatacentre({variant:index}) : createHouse(city, index), x, 0, z, index < replaced ? .82 + (index % 2) * .1 : 1));
      for (const [x,z] of [[-3.9,2.8],[4,-2.5],[.4,3],[-.3,-2.95],[-3.8,-1.15]]) place(g, createTree(), x, 0, z);
      for (let i = 0; i < 9; i++) {
        const robot = robotCount === undefined ? takeover >= 50 || i < takeover / 15 : i < robotCount;
        place(g, createCharacter({ robot, variant:i }), -2.1 + i * .55, 0, 1.65 + (i % 2) * .18);
      }
      box(g, .42, .18, .23, takeover >= 50 ? palette.server : 0xd7b45e, 2.4, .14, 1.58);
      box(g, .22, .12, .21, 0xe8eff0, 2.4, .29, 1.58);
      for (const x of [-2.8,2.9]) place(g, createTree({ blossom: true }), x, 0, 1.8);
      return g;
    }

    function createCloud() {
      const g = group('cloud');
      for (let i = 0; i < 3; i++) ball(g, .12 + (i === 1 ? .035 : 0), 0xe5edf0, (i - 1) * .13, .02, 0, 1);
      return g;
    }

    function createProtest({ scuffle = false } = {}) {
      const g = group(scuffle ? 'dust-cloud-scuffle' : 'protest');
      if (!scuffle) {
        for (let i = 0; i < 5; i++) place(g, createCharacter({ sign: true, variant:i }), -.35 + (i % 3) * .28, 0, -.25 + Math.floor(i / 3) * .32);
      } else {
        for (let i = 0; i < 12; i++) {
          const angle = i / 12 * Math.PI * 2;
          const puff = ball(g, .25 + (i % 3) * .035, i % 2 ? 0xe9dfc7 : 0xd8c8ae, Math.cos(angle)*.46, .35+(i%3)*.2, Math.sin(angle)*.35, 1);
          puff.userData.puffOrigin = puff.position.toArray();
          puff.userData.phase = i;
        }
        for (let i = 0; i < 3; i++) place(g, createCharacter({ robot: true, variant:4 }), -.45 + i * .35, 0, -.5);
      }
      return g;
    }

    function animateProtest(g, seconds) {
      if (!Number.isFinite(seconds)) throw new TypeError('Animation time must be finite.');
      g.traverse(object => {
        if (!object.userData.puffOrigin) return;
        const phase = object.userData.phase;
        object.position.fromArray(object.userData.puffOrigin);
        object.position.y += Math.sin(seconds * 16 + phase) * .07;
        object.scale.setScalar(1 + Math.sin(seconds * 12 + phase) * .12);
      });
    }

    function globePosition([longitude, latitude], radius = 2.04) {
      const lon = longitude * Math.PI / 180, lat = latitude * Math.PI / 180;
      return new T.Vector3(Math.cos(lat)*Math.sin(lon)*radius, Math.sin(lat)*radius, Math.cos(lat)*Math.cos(lon)*radius);
    }
    function onGlobe(parent, object, coordinate, radius = 2.04) {
      object.position.copy(globePosition(coordinate, radius));
      // Local +X points east, +Y out of the surface, and +Z south.
      const lon = coordinate[0] * Math.PI / 180;
      const east = new T.Vector3(Math.cos(lon), 0, -Math.sin(lon));
      const up = object.position.clone().normalize();
      const south = east.clone().cross(up);
      object.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(east, up, south));
      parent.add(object);
      return object;
    }

    function drumPin(marker) {
      mesh(marker,new T.CylinderGeometry(.045,.072,.10,8),palette.serverSide,0,.05,0);
      ball(marker,.07,palette.indicator,0,.14,0,1);
    }

    function createGlobe(d3, world, { takeover = 0, focusCity = 'paris' } = {}) {
      if (!d3?.geoPath || !world?.land || !world?.cities) throw new TypeError('createGlobe needs d3 and ComputeWorld.');
      takeover = progress(takeover);
      const g = group('earth');
      const canvas = document.createElement('canvas');
      canvas.width = 2048; canvas.height = 1024;
      const context = canvas.getContext('2d');
      const projection = d3.geoEquirectangular().scale(2048/(2*Math.PI)).translate([1024,512]);
      context.beginPath(); d3.geoPath(projection, context)(world.land);
      context.fillStyle = '#7fa256'; context.fill();
      const coastline = context.getImageData(0, 0, canvas.width, canvas.height).data;
      context.globalCompositeOperation = 'destination-over';
      context.fillStyle = '#438eaf'; context.fillRect(0, 0, canvas.width, canvas.height);
      const texture = new T.CanvasTexture(canvas);
      texture.colorSpace = T.SRGBColorSpace;
      texture.wrapS = T.RepeatWrapping;
      const geometry = new T.IcosahedronGeometry(2,12);
      const positions = geometry.attributes.position, uv = geometry.attributes.uv;
      for (let i = 0; i < positions.count; i++) {
        const p = new T.Vector3().fromBufferAttribute(positions,i).normalize();
        uv.setXY(i, Math.atan2(p.x,p.z)/(2*Math.PI)+.5, Math.asin(p.y)/Math.PI+.5);
      }
      // A triangle crossing the date line must sample one continuous side of the texture.
      for (let i = 0; i < uv.count; i += 3) {
        const values = [uv.getX(i),uv.getX(i+1),uv.getX(i+2)];
        if (Math.max(...values)-Math.min(...values) > .5) for (let j = 0; j < 3; j++) if (values[j] < .5) uv.setX(i+j,values[j]+1);
      }
      const earth = new T.Mesh(geometry, new T.MeshStandardMaterial({ map:texture, roughness:.9, flatShading:true }));
      earth.name = 'ocean-and-coastline'; earth.receiveShadow = earth.castShadow = true; g.add(earth);
      const raised = new T.IcosahedronGeometry(2.024,14), vertices = raised.attributes.position, land = [];
      for (let i = 0; i < vertices.count; i += 3) {
        const center = new T.Vector3();
        for (let j = 0; j < 3; j++) center.add(new T.Vector3().fromBufferAttribute(vertices,i+j));
        center.normalize();
        const coordinate = [Math.atan2(center.x,center.z)*180/Math.PI,Math.asin(center.y)*180/Math.PI];
        // Solid ocean and land pixels already classify the face. Resolve blended coastal pixels against the source polygons.
        const [px, py] = projection(coordinate);
        const x = (Math.floor(px) + canvas.width) % canvas.width;
        const y = Math.max(0, Math.min(canvas.height - 1, Math.floor(py)));
        const coverage = coastline[(y * canvas.width + x) * 4 + 3];
        const isLand = coverage === 255 || (coverage > 0 && d3.geoContains(world.land, coordinate));
        if (isLand) for (let j = 0; j < 3; j++) land.push(vertices.getX(i+j),vertices.getY(i+j),vertices.getZ(i+j));
      }
      raised.dispose();
      const landGeometry = new T.BufferGeometry();
      landGeometry.setAttribute('position',new T.Float32BufferAttribute(land,3));
      landGeometry.computeVertexNormals(); mesh(g,landGeometry,palette.land);
      for (const coordinate of [[87,34],[-108,43],[-69,-22],[27,-1],[145,-23]]) {
        const mountains = group('toy-mountains');
        cone(mountains,.13,.23,0xad9677,0,.115,0);
        cone(mountains,.10,.17,0xb8a382,.14,.085,.03);
        onGlobe(g,mountains,coordinate);
      }
      for (const coordinate of [[-28,25],[70,-24],[-134,8],[167,50]]) onGlobe(g,createCloud(),coordinate,2.13);
      checkCity(focusCity);
      const roster = [...landmarks];
      if (focusCity === 'tokyo') roster.unshift({id:'tokyo', coordinate:world.cities.Tokyo});
      const ordered = roster.filter(item => item.id === focusCity).concat(roster.filter(item => item.id !== focusCity));
      const occupied = [];
      for (const {id,coordinate} of ordered) {
        const marker = group('city:' + id);
        marker.userData.city = id;
        onGlobe(g,marker,coordinate);
        // Cities too close to fit two oversized toys retain a pin. Selecting one
        // promotes its sculpture without moving either city to a different country.
        if (occupied.some(pos => pos.distanceTo(marker.position) < .98)) {
          drumPin(marker);
          continue;
        }
        occupied.push(marker.position);
        const model = createLandmark(id,{automated:takeover>=75});
        place(marker,model,0,0,0,id === focusCity ? .34 : .27);
        if (takeover>=25) place(marker,createDatacentre(),-.34,0,.22,.18);
        if (takeover>=50) place(marker,createDatacentre({variant:1}),.34,0,.22,.18);
        if (takeover>=100) place(marker,createDatacentre({variant:2}),0,0,-.28,.21);
      }
      return g;
    }

    function addLighting(scene) {
      const g = group('studio-lighting');
      g.add(new T.HemisphereLight(0xf1f7ff,0x929184,1.8));
      const sun = new T.DirectionalLight(0xfff4de,2.6);
      sun.position.set(-5,10,7); sun.castShadow = true;
      sun.shadow.mapSize.set(1024,1024);
      Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.1,far:30});
      sun.shadow.normalBias = .03;
      g.add(sun); scene.add(g);
      return g;
    }
    function configureRenderer(renderer, pixelRatio = 1) {
      renderer.setPixelRatio(Math.min(pixelRatio,2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
    }

    function clear(root) {
      const disposedGeometry = new Set(), disposedMaterials = new Set(), disposedTextures = new Set();
      root.traverse(object => {
        if (object.geometry && !disposedGeometry.has(object.geometry)) { object.geometry.dispose(); disposedGeometry.add(object.geometry); }
        const list = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : [];
        for (const value of list) {
          if (sharedMaterials.has(value) || disposedMaterials.has(value)) continue;
          if (value.map && !disposedTextures.has(value.map)) { value.map.dispose(); disposedTextures.add(value.map); }
          value.dispose(); disposedMaterials.add(value);
        }
      });
      root.clear();
    }
    // Remove and clear all created groups before disposing the kit's shared materials.
    function dispose() {
      for (const master of modelMasters.values()) clear(master);
      modelMasters.clear();
      for (const value of materials.values()) value.dispose();
      materials.clear();
      sharedMaterials.clear();
    }

    return { createDatacentre, createCharacter, createTree, createHouse, createLandmark,
      createCity, createCloud, createProtest, animateProtest, globePosition, createGlobe,
      addLighting, configureRenderer, clear, dispose };
  }
  return Object.freeze({ createKit, palette, cityIds, landmarks, variants });
})();
