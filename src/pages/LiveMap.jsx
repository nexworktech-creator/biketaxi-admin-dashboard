import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { fetchLiveCaptains, apiErrorMessage } from '../api/client';

// Default Leaflet marker icons don't resolve correctly under bundlers; point at CDN assets.
const bikeIcon = new L.DivIcon({
  className: 'bike-marker',
  html: '<div style="background:#14171f;color:#fff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;border:2px solid #f5a623;">🛵</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const REFRESH_MS = 8000;
const DEFAULT_CENTER = [12.9716, 77.5946]; // Bengaluru fallback; recentres once data arrives

export default function LiveMap() {
  const [captains, setCaptains] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const hasCentered = useRef(false);
  const mapRef = useRef(null);

  useEffect(() => {
    let timer;
    const load = async () => {
      try {
        const { data } = await fetchLiveCaptains();
        setCaptains(data.data);
        setError('');
        if (!hasCentered.current && data.data.length > 0 && mapRef.current) {
          const [lng, lat] = data.data[0].currentLocation.coordinates;
          mapRef.current.setView([lat, lng], 13);
          hasCentered.current = true;
        }
      } catch (err) {
        setError(apiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
    timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  const available = captains.filter((c) => c.isAvailable).length;

  return (
    <div>
      <div className="stat-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-label">On duty now</div>
          <div className="stat-value num">{captains.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Free for a ride</div>
          <div className="stat-value num">{available}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Currently on a ride</div>
          <div className="stat-value num">{captains.length - available}</div>
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={12}
          style={{ height: '560px', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {captains.map((c) => {
            const coords = c.currentLocation?.coordinates;
            if (!coords) return null;
            const [lng, lat] = coords;
            return (
              <Marker key={c._id} position={[lat, lng]} icon={bikeIcon}>
                <Popup>
                  <strong>{c.fullName}</strong>
                  <br />
                  {c.vehicle?.type} {c.vehicle?.number}
                  <br />
                  {c.isAvailable ? 'Available' : 'On a ride'}
                  <br />
                  <span style={{ fontSize: 11, color: '#888' }}>
                    Updated {c.lastLocationUpdate ? new Date(c.lastLocationUpdate).toLocaleTimeString() : '—'}
                  </span>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {!loading && captains.length === 0 && !error && (
        <div className="empty-state">No captains currently on duty.</div>
      )}
    </div>
  );
}
