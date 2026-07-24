import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

// Inject Leaflet CSS dynamically
const LEAFLET_CSS_ID = 'leaflet-css-cdn';
if (!document.getElementById(LEAFLET_CSS_ID)) {
  const link = document.createElement('link');
  link.id = LEAFLET_CSS_ID;
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Major Kenyan Funeral Homes
const FUNERAL_HOMES = [
  { id: 'lee', name: 'Lee Funeral Home, Nairobi', lat: -1.2954, lng: 36.8078 },
  { id: 'chiromo', name: 'Chiromo Funeral Parlour', lat: -1.2758, lng: 36.8066 },
  { id: 'ku', name: 'K.U. Funeral Home, Kiambu', lat: -1.1824, lng: 36.9272 },
  { id: 'umash-nrb', name: 'Umash Funeral Home, Nairobi', lat: -1.2921, lng: 36.8041 },
  { id: 'umash-nkr', name: 'Umash Funeral Home, Nakuru', lat: -0.2833, lng: 36.0667 },
  { id: 'jocham', name: 'Jocham Mortuary, Mombasa', lat: -4.0416, lng: 39.6706 },
  { id: 'eldoret', name: 'Moi Teaching Mortuary, Eldoret', lat: 0.5204, lng: 35.2863 }
];

const QUICK_LOCATIONS = [
  { name: 'Nakuru', lat: -0.3031, lng: 36.0800 },
  { name: 'Eldoret', lat: 0.5143, lng: 35.2698 },
  { name: 'Kisumu', lat: -0.0917, lng: 34.7680 },
  { name: 'Nyeri', lat: -0.4226, lng: 36.9389 },
];

const Overlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.85);
  z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 16px;
`;

const Modal = styled.div`
  width: 100%; max-width: 1200px; height: 90vh; max-height: 850px; background: #121212;
  border-radius: 16px; display: flex; flex-direction: column; overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1); font-family: system-ui, sans-serif; color: #ffffff;
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center; padding: 16px 24px;
  background: #0d1b22; border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const ContentGrid = styled.div`
  display: flex; flex: 1; min-height: 0;
  @media (max-width: 850px) { flex-direction: column; }
`;

const MapPanel = styled.div`
  flex: 1.4; position: relative; background: #050505;
  @media (max-width: 850px) { height: 350px; flex: none; }
`;

const SidePanel = styled.div`
  width: 480px; display: flex; flex-direction: column; background: #0d0d0d;
  border-left: 1px solid rgba(255, 255, 255, 0.08); overflow-y: auto;
  @media (max-width: 850px) { width: 100%; flex: 1; }
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
`;

const Section = styled.div` padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); `;

const Label = styled.label`
  font-size: 11px; font-weight: 700; text-transform: uppercase; color: #888;
  display: block; margin-bottom: 6px;
  span { color: #4fc3f7; font-weight: normal; text-transform: none; margin-left: 6px; }
`;

const Row = styled.div` display: flex; gap: 8px; margin-bottom: 12px; `;

const Input = styled.input`
  flex: 1; height: 40px; background: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px; padding: 0 12px; color: #fff; font-size: 14px;
  &:focus { outline: none; border-color: #4fc3f7; }
`;

const Select = styled.select`
  flex: 1; height: 40px; background: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px; padding: 0 12px; color: #fff; font-size: 14px;
`;

const Button = styled.button`
  height: 40px; padding: 0 16px; border-radius: 8px; font-weight: 700; font-size: 13px;
  cursor: pointer; border: none; white-space: nowrap; transition: 0.15s;
  background: ${(p) => p.$variant === 'success' ? '#10b981' : p.$variant === 'whatsapp' ? '#25D366' : p.$variant === 'outline' ? 'transparent' : '#4fc3f7'};
  color: ${(p) => p.$variant === 'outline' ? '#4fc3f7' : (p.$variant === 'whatsapp' || p.$variant === 'success' ? '#fff' : '#000')};
  border: ${(p) => p.$variant === 'outline' ? '1px solid #4fc3f7' : 'none'};
  &:hover { opacity: 0.9; }
  &:disabled { background: #333; color: #666; cursor: not-allowed; }
`;

const ToggleGroup = styled.div`
  display: flex; background: #1a1a1a; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.12);
`;

const ToggleBtn = styled.button`
  flex: 1; height: 38px; border: none; font-size: 13px; font-weight: 600; cursor: pointer;
  background: ${(p) => (p.$active ? '#4fc3f7' : 'transparent')};
  color: ${(p) => (p.$active ? '#000' : '#888')}; transition: 0.2s;
`;

const StatGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;
`;

const StatCard = styled.div`
  background: #161616; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px; text-align: center;
  div:first-child { font-size: 18px; font-weight: 700; color: #4fc3f7; }
  div:last-child { font-size: 10px; text-transform: uppercase; color: #888; margin-top: 4px; }
`;

const CostCard = styled.div`
  background: #161616; border: 1px solid rgba(79, 195, 247, 0.3); border-radius: 10px; padding: 16px;
  animation: ${fadeIn} 0.3s ease; margin-top: 8px;
`;

const CostRow = styled.div`
  display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0;
  color: ${(p) => (p.$bold ? '#fff' : '#aaa')}; font-weight: ${(p) => (p.$bold ? '700' : '400')};
  border-bottom: ${(p) => (p.$divider ? '1px dashed rgba(255,255,255,0.1)' : 'none')};
  margin-bottom: ${(p) => (p.$divider ? '8px' : '0')};
`;

const EditHighlight = styled.div`
  display: flex; align-items: center; gap: 8px; background: rgba(79, 195, 247, 0.1);
  padding: 8px; border-radius: 8px; border: 1px dashed #4fc3f7; margin-bottom: 12px;
  Input { height: 32px; width: 80px; text-align: center; font-weight: bold; font-size: 15px; color: #4fc3f7; border-color: #4fc3f7; background: #1a1a1a; }
`;

export default function AdvancedHearseRouter({ onClose }) {
  const [origin, setOrigin] = useState(FUNERAL_HOMES[0]);
  const [destinationStr, setDestinationStr] = useState('');
  const [destName, setDestName] = useState('');
  const [destCoords, setDestCoords] = useState(null);
  
  const [tripType, setTripType] = useState('round'); 
  const [days, setDays] = useState(1);
  const [baseFee, setBaseFee] = useState(5000);
  const [ratePerKm, setRatePerKm] = useState(100);
  const [overnightFee, setOvernightFee] = useState(3000);
  
  const [oneWayKm, setOneWayKm] = useState(0);
  const [timeMin, setTimeMin] = useState(0);
  const [loading, setLoading] = useState(false);

  const mapRef = useRef(null);
  const leafletInstance = useRef(null);
  const polylineLayer = useRef(null);
  const markersGroup = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const loadLeaflet = async () => {
      if (!window.L) {
        await new Promise((res) => {
          const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = res; document.body.appendChild(script);
        });
      }
      if (!leafletInstance.current && window.L) {
        const L = window.L;
        const map = L.map(mapRef.current).setView([origin.lat, origin.lng], 10);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
        markersGroup.current = L.layerGroup().addTo(map);
        leafletInstance.current = map;
        updateOriginMarker(origin);
      }
    };
    loadLeaflet();
  }, []);

  const updateOriginMarker = (home) => {
    if (!leafletInstance.current || !window.L) return;
    markersGroup.current.clearLayers();
    if (polylineLayer.current) leafletInstance.current.removeLayer(polylineLayer.current);
    window.L.marker([home.lat, home.lng]).addTo(markersGroup.current).bindPopup(`<b>${home.name}</b><br/>Origin`).openPopup();
    leafletInstance.current.setView([home.lat, home.lng], 12);
    setDestCoords(null); setOneWayKm(0);
  };

  const handleOriginChange = (e) => {
    const selected = FUNERAL_HOMES.find(h => h.id === e.target.value);
    setOrigin(selected); updateOriginMarker(selected);
  };

  const calculateRouteOSRM = async (lat, lng, name) => {
    setLoading(true); setDestName(name); setDestCoords({ lat, lng });
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${lng},${lat}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        setOneWayKm(Number((route.distance / 1000).toFixed(1)));
        setTimeMin(Math.round(route.duration / 60));

        if (leafletInstance.current && window.L) {
          const L = window.L; const map = leafletInstance.current;
          if (polylineLayer.current) map.removeLayer(polylineLayer.current);
          markersGroup.current.clearLayers();
          L.marker([origin.lat, origin.lng]).addTo(markersGroup.current);
          L.marker([lat, lng]).addTo(markersGroup.current).bindPopup(`<b>${name}</b>`).openPopup();
          const routeCoords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
          polylineLayer.current = L.polyline(routeCoords, { color: '#4fc3f7', weight: 5, opacity: 0.8 }).addTo(map);
          map.fitBounds(polylineLayer.current.getBounds(), { padding: [40, 40] });
        }
      }
    } catch {
      alert('Routing failed.');
    } finally { setLoading(false); }
  };

  const handleSearch = async () => {
    if (!destinationStr.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationStr + ', Kenya')}&countrycodes=ke&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        calculateRouteOSRM(parseFloat(data[0].lat), parseFloat(data[0].lon), data[0].display_name.split(',')[0]);
      } else { alert('Location not found.'); }
    } catch { alert('Search failed.'); }
    finally { setLoading(false); }
  };

  const distanceMultiplier = tripType === 'round' ? 2 : 1;
  const billableKm = oneWayKm * distanceMultiplier;
  const distanceCost = billableKm * ratePerKm;
  const driverNights = Math.max(0, days - 1);
  const overnightTotal = driverNights * overnightFee;
  const grandTotal = baseFee + distanceCost + overnightTotal;

  const shareToWhatsApp = () => {
    if (!destCoords) return;
    const gmapsLink = `https://www.google.com/maps/search/?api=1&query=${destCoords.lat},${destCoords.lng}`;
    const text = `🚗 *HEARSE DISPATCH ORDER*\n\n*From:* ${origin.name}\n*To:* ${destName}\n\n*Trip Details:*\n• Type: ${tripType === 'round' ? 'Round Trip (To & From)' : 'One-Way Dropoff'}\n• Duration: ${days} Day(s)\n• One-Way Distance: ${oneWayKm} km\n• Billable Distance: ${billableKm} km\n\n📍 *Navigate via Google Maps:*\n${gmapsLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <Modal>
        <Header>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>Pro Dispatch & Logistics</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#4fc3f7' }}>One-Way View & Editable Mileage</p>
          </div>
          <Button $variant="outline" onClick={onClose} style={{ width: 32, height: 32, padding: 0, borderRadius: '50%' }}>✕</Button>
        </Header>

        <ContentGrid>
          <MapPanel>
            <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
          </MapPanel>

          <SidePanel>
            <Section>
              <Label>1. Origin (Funeral Home)</Label>
              <Select value={origin.id} onChange={handleOriginChange} style={{ width: '100%', marginBottom: 12 }}>
                {FUNERAL_HOMES.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </Select>

              <Label>2. Destination Search</Label>
              <Row>
                <Input placeholder="e.g. Nakuru, Eldoret..." value={destinationStr} onChange={e => setDestinationStr(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                <Button onClick={handleSearch} disabled={loading}>{loading ? '...' : 'Find'}</Button>
              </Row>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {QUICK_LOCATIONS.map(loc => (
                  <button key={loc.name} onClick={() => { setDestinationStr(loc.name); calculateRouteOSRM(loc.lat, loc.lng, loc.name); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', padding: '4px 10px', borderRadius: 12, fontSize: 11, cursor: 'pointer' }}>{loc.name}</button>
                ))}
              </div>
            </Section>

            <Section>
              <Label>3. Trip Parameters</Label>
              <Row>
                <ToggleGroup style={{ flex: 1 }}>
                  <ToggleBtn $active={tripType === 'one-way'} onClick={() => setTripType('one-way')}>One-Way Dropoff</ToggleBtn>
                  <ToggleBtn $active={tripType === 'round'} onClick={() => setTripType('round')}>Round Trip</ToggleBtn>
                </ToggleGroup>
                <Input type="number" min="1" value={days} onChange={e => setDays(parseInt(e.target.value) || 1)} style={{ width: 70, flex: 'none' }} title="Days" />
              </Row>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <div><Label>Base (KES)</Label><Input type="number" value={baseFee} onChange={e => setBaseFee(Number(e.target.value))} /></div>
                <div><Label>Rate/KM</Label><Input type="number" value={ratePerKm} onChange={e => setRatePerKm(Number(e.target.value))} /></div>
                <div><Label>Per Night</Label><Input type="number" value={overnightFee} onChange={e => setOvernightFee(Number(e.target.value))} /></div>
              </div>
            </Section>

            <Section style={{ flex: 1, border: 'none', background: '#0a0a0a' }}>
              {!destCoords && !loading && <div style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>Search a destination to display distances.</div>}
              {loading && <div style={{ color: '#4fc3f7', textAlign: 'center', marginTop: 20 }}>Plotting route...</div>}
              
              {destCoords && !loading && (
                <>
                  <StatGrid>
                    <StatCard>
                      <div>{timeMin} Mins</div>
                      <div>Duration (One-Way)</div>
                    </StatCard>
                    <StatCard>
                      <div>{tripType === 'round' ? `${billableKm} km` : `${oneWayKm} km`}</div>
                      <div>Total Billable KM</div>
                    </StatCard>
                  </StatGrid>

                  <EditHighlight>
                    <div style={{ flex: 1 }}>
                      <Label style={{ margin: 0, color: '#fff' }}>One-Way Distance (KM) <span>(Editable)</span></Label>
                    </div>
                    <Input type="number" value={oneWayKm} onChange={(e) => setOneWayKm(Number(e.target.value))} />
                  </EditHighlight>

                  <CostCard>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>📍 Invoice: {destName}</div>
                    
                    <CostRow><span>Base Dispatch Fee</span><span>KES {baseFee.toLocaleString()}</span></CostRow>
                    <CostRow><span>Mileage ({billableKm} km × KES {ratePerKm})</span><span>KES {distanceCost.toLocaleString()}</span></CostRow>
                    
                    {driverNights > 0 && (
                      <CostRow>
                        <span>Overnight Allowance ({driverNights} nights)</span>
                        <span>KES {overnightTotal.toLocaleString()}</span>
                      </CostRow>
                    )}

                    <CostRow $bold $divider style={{ marginTop: 12 }}>
                      <span>Total Invoice</span>
                      <span style={{ fontSize: 18, color: '#10b981' }}>KES {grandTotal.toLocaleString()}</span>
                    </CostRow>
                  </CostCard>

                  <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    <Button $variant="whatsapp" style={{ flex: 1 }} onClick={shareToWhatsApp}>
                      WA to Driver
                    </Button>
                    <Button $variant="success" style={{ flex: 1 }} onClick={() => alert(`Confirmed. Total: KES ${grandTotal.toLocaleString()}`)}>
                      Confirm Booking
                    </Button>
                  </div>
                </>
              )}
            </Section>
          </SidePanel>
        </ContentGrid>
      </Modal>
    </Overlay>
  );
}