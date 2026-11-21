'use strict';

// Market hubs are distinct from the city landmarks where the player builds servers.
const marketHubs = {
  us: [-74, 40.7], india: [77.2, 28.6], germany: [13.4, 52.5],
  singapore: [103.85, 1.29], canada: [-79.4, 43.65], ireland: [-6.26, 53.35],
  japan: [139.7, 35.7], brazil: [-46.63, -23.55], australia: [151.2, -33.87],
  france: [2.35, 48.86], korea: [126.98, 37.57], southafrica: [28.04, -26.2],
  sweden: [18.07, 59.33]
};

function createMarketRoutes(kit, globe) {
  const T = THREE;
  const network = new T.Group();
  globe.add(network);
  let latest, trace;
  const white = new T.MeshBasicMaterial({ color: 0xffe7a2 });
  const copper = new T.MeshBasicMaterial({ color: 0xab3f21 });
  function connect(id, previous, animate) {
    const to = kit.globePosition(marketHubs[id], 1);
    const from = kit.globePosition(previous ? marketHubs[previous] : [2.29, 48.86], 1);
    if (trace) trace.setDrawRange(0, Infinity);
    trace = null;
    if (from.distanceTo(to) > .025) {
      const points = [];
      for (let i = 0; i <= 48; i++) {
        const t = i / 48;
        points.push(from.clone().lerp(to, t).normalize().multiplyScalar(2.065 + Math.sin(t * Math.PI) * .29));
      }
      trace = new T.TubeGeometry(new T.CatmullRomCurve3(points), 48, .014, 5, false);
      network.add(new T.Mesh(trace, white));
      if (animate) trace.setDrawRange(0, 0);
    }
    latest = new T.Mesh(new T.CylinderGeometry(.085, .115, .085, 12), copper);
    latest.position.copy(to).multiplyScalar(2.095);
    latest.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), to);
    const lamp = new T.Mesh(new T.SphereGeometry(.065, 10, 8), white);
    lamp.position.y = .065;
    latest.add(lamp);
    network.add(latest);
  }
  function reveal(t) {
    if (trace) trace.setDrawRange(0, Math.ceil(t * 48) * 30);
    latest.scale.setScalar(1 + .6 * Math.sin(t * Math.PI));
  }
  function reset() {
    network.traverse(object => object.geometry?.dispose());
    network.clear();
    latest = trace = null;
  }
  return { connect, reveal, reset };
}
