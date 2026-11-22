'use strict';

function createMarketRoutes(kit, globe) {
  const T = THREE;
  const network = new T.Group();
  globe.add(network);
  let latest, trace;
  const white = new T.MeshBasicMaterial({ color: 0xffe7a2 });
  const copper = new T.MeshBasicMaterial({ color: 0xab3f21 });
  function connect(city, previousCity, animate) {
    const to = kit.globePosition(city.coordinate, 1);
    const from = kit.globePosition(previousCity.coordinate, 1);
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
    latest.userData.city = city.id;
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
  return { connect, reveal, reset, network };
}
