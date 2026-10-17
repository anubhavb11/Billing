import { useEffect, useRef } from 'react';

// Where the delivery person is, on a free OpenStreetMap map (Leaflet). Loaded only on a
// customer's bill link while the order is on the way. OSM's tile policy asks for light use
// and visible credit, which this keeps: one small map, moved every ~20 s.
export default function LiveMap({ lat, lng, label }) {
  const box = useRef(null);
  const map = useRef(null);
  const dot = useRef(null);
  const latest = useRef([lat, lng]);
  latest.current = [lat, lng];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      if (cancelled || !box.current || map.current) return;
      map.current = L.map(box.current, { scrollWheelZoom: false }).setView(latest.current, 16);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map.current);
      dot.current = L.circleMarker(latest.current, {
        radius: 10,
        weight: 3,
        color: '#ffffff',
        fillColor: '#e25629',
        fillOpacity: 1,
      }).addTo(map.current);
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      dot.current = null;
    };
  }, []);

  useEffect(() => {
    if (!dot.current) return;
    dot.current.setLatLng([lat, lng]);
    map.current.panTo([lat, lng]);
  }, [lat, lng]);

  return <div className="live-map" ref={box} role="img" aria-label={label} />;
}
