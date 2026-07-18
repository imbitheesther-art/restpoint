import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  Truck,
  Calendar,
  PlusCircle,
  X,
  Loader2,
  CheckCircle,
  MapPin,
  DollarSign,
  Car,
  Edit,
  Trash2,
  Route,
  Fuel,
  Gauge,
  Settings,
  Send,
  Users,
  Clock,
  AlertCircle,
  Navigation,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';

// Bootstrap-inspired professional color scheme
const COLORS = {
  primary: '#1a5f7a',
  primaryLight: '#2c8ac9',
  primaryDark: '#134b5f',
  white: '#FFFFFF',
  bg: '#f5f7fa',
  surface: '#ffffff',
  border: '#d1d5db',
  borderLight: '#e5e7eb',
  text: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  success: '#10b981',
  successLight: '#d1fae5',
  successDark: '#059669',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  warningDark: '#d97706',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  dangerDark: '#dc2626',
  info: '#3b82f6',
  infoLight: '#dbeafe',
  infoDark: '#2563eb',
  accent: '#3b82f6',
  accentHover: '#2563eb',
  accentGlow: 'rgba(59, 130, 246, 0.1)',
  radius: '8px',
  radiusSm: '6px',
  radiusXs: '4px',
  shadowSm: '0 1px 2px rgba(0, 0, 0, 0.04)',
  shadowMd: '0 4px 6px rgba(0, 0, 0, 0.06)',
  shadowLg: '0 10px 15px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.15s ease',
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---
const DispatchContainer = styled.div`
  background: ${COLORS.surface};
  border-radius: ${COLORS.radius};
  box-shadow: ${COLORS.shadowSm};
  border: 1px solid ${COLORS.border};
  overflow: hidden;
`;

const Header = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${COLORS.bg};
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const Title = styled.h4`
  font-size: 0.9375rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: ${COLORS.text};

  svg {
    color: ${COLORS.primary};
    width: 18px;
    height: 18px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  background: ${COLORS.primary};
  color: ${COLORS.white};
  border: none;
  border-radius: ${COLORS.radiusSm};
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  transition: ${COLORS.transition};
  box-shadow: ${COLORS.shadowSm};

  &:hover {
    background: ${COLORS.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${COLORS.shadowMd};
  }

  &:disabled {
    background: ${COLORS.textMuted};
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled.button`
  background: ${COLORS.surface};
  color: ${COLORS.text};
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  transition: ${COLORS.transition};

  &:hover {
    background: ${COLORS.bg};
    border-color: ${COLORS.textSecondary};
  }

  &:disabled {
    background: ${COLORS.textMuted};
    cursor: not-allowed;
  }
`;

const AlertBox = styled.div`
  padding: 0.75rem 1rem;
  margin: 1rem;
  border-radius: ${COLORS.radiusSm};
  font-size: 0.8125rem;
  font-weight: 500;
  text-align: center;
  background: ${props => {
    if (props.$type === 'error') return COLORS.dangerLight;
    if (props.$type === 'success') return COLORS.successLight;
    return COLORS.infoLight;
  }};
  color: ${props => {
    if (props.$type === 'error') return COLORS.danger;
    if (props.$type === 'success') return COLORS.success;
    return COLORS.info;
  }};
  border: 1px solid ${props => {
    if (props.$type === 'error') return 'rgba(239, 68, 68, 0.2)';
    if (props.$type === 'success') return 'rgba(16, 185, 129, 0.2)';
    return 'rgba(59, 130, 246, 0.2)';
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1.5rem;
  color: ${COLORS.textSecondary};

  svg {
    width: 2.5rem;
    height: 2.5rem;
    margin-bottom: 0.75rem;
    opacity: 0.4;
  }

  h4 {
    font-size: 0.9375rem;
    font-weight: 600;
    margin: 0 0 0.375rem;
    color: ${COLORS.text};
  }

  p {
    font-size: 0.8125rem;
    margin: 0;
    color: ${COLORS.textSecondary};
  }
`;

const TripCard = styled.div`
  background: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  padding: 1rem 1.25rem;
  margin: 0 1rem 1rem;
  transition: ${COLORS.transition};

  &:hover {
    box-shadow: ${COLORS.shadowMd};
    border-color: ${COLORS.primary};
  }
`;

const TripHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const TripLabel = styled.div`
  background: ${COLORS.primary};
  color: white;
  padding: 0.3rem 0.875rem;
  border-radius: 2rem;
  font-weight: 600;
  font-size: 0.8125rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.3rem 0.75rem;
  border-radius: 2rem;
  background: ${props => {
    switch (props.$variant) {
      case 'success': return COLORS.successLight;
      case 'warning': return COLORS.warningLight;
      case 'danger': return COLORS.dangerLight;
      case 'info': return COLORS.infoLight;
      default: return COLORS.borderLight;
    }
  }};
  color: ${props => {
    switch (props.$variant) {
      case 'success': return COLORS.successDark;
      case 'warning': return COLORS.warningDark;
      case 'danger': return COLORS.dangerDark;
      case 'info': return COLORS.infoDark;
      default: return COLORS.textSecondary;
    }
  }};
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0;
  font-size: 0.8125rem;
  color: ${COLORS.text};
`;

const InfoLabel = styled.span`
  color: ${COLORS.textSecondary};
  font-weight: 500;
  min-width: 80px;
`;

const InfoValue = styled.span`
  flex: 1;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${COLORS.border};
  flex-wrap: wrap;
`;

const IconButton = styled.button`
  background: ${COLORS.surface};
  color: ${COLORS.text};
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusXs};
  padding: 0.4rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: ${COLORS.transition};

  &:hover {
    background: ${props => props.$danger ? COLORS.danger : COLORS.primary};
    color: ${COLORS.white};
    border-color: ${props => props.$danger ? COLORS.danger : COLORS.primary};
  }
`;

const SendButton = styled.button`
  background: ${COLORS.info};
  color: ${COLORS.white};
  border: none;
  border-radius: ${COLORS.radiusXs};
  padding: 0.4rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: ${COLORS.transition};

  &:hover {
    background: ${COLORS.infoDark};
  }

  &:disabled {
    background: ${COLORS.textMuted};
    cursor: not-allowed;
  }
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  animation: ${fadeIn} 0.12s ease-out;
  backdrop-filter: blur(3px);
`;

const ModalContent = styled.div`
  background: ${COLORS.surface};
  border-radius: ${COLORS.radius};
  box-shadow: ${COLORS.shadowLg};
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${COLORS.bg};

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: ${COLORS.text};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ModalButton = styled.button`
  background: transparent;
  border: none;
  color: ${COLORS.textSecondary};
  cursor: pointer;
  padding: 0.375rem;
  border-radius: ${COLORS.radiusXs};
  transition: ${COLORS.transition};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${COLORS.border};
    color: ${COLORS.text};
  }
`;

const ModalBody = styled.div`
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.375rem;
  font-size: 0.8125rem;
  color: ${COLORS.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  font-size: 0.8125rem;
  color: ${COLORS.text};
  transition: ${COLORS.transition};
  background: ${COLORS.surface};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLORS.accentGlow};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  font-size: 0.8125rem;
  color: ${COLORS.text};
  background: ${COLORS.surface};
  transition: ${COLORS.transition};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLORS.accentGlow};
  }
`;

const MapContainer = styled.div`
  height: 200px;
  width: 100%;
  border-radius: ${COLORS.radiusSm};
  overflow: hidden;
  border: 1px solid ${COLORS.border};
  margin-bottom: 1rem;
  position: relative;

  iframe {
    border: none;
    width: 100%;
    height: 100%;
  }
`;

const SummaryBox = styled.div`
  background: ${COLORS.bg};
  padding: 1rem;
  border-radius: ${COLORS.radiusSm};
  margin: 1rem 0;
  border: 1px solid ${COLORS.border};
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.375rem 0;
  font-size: 0.8125rem;
  color: ${COLORS.textSecondary};

  strong {
    color: ${COLORS.text};
    font-weight: 600;
  }
`;

const RouteStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.375rem 0;
  font-size: 0.8125rem;
  color: ${COLORS.textSecondary};

  .step-number {
    background: ${COLORS.primary};
    color: white;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6875rem;
    flex-shrink: 0;
  }
`;

// ============================================
// OPEN SOURCE ROUTING UTILITIES (No TomTom)
// ============================================

const DEFAULT_MORTUARY = {
  lat: -1.2921,
  lon: 36.8219,
  address: 'LEE FUNERAL SERVICES',
};

const NOMINATIM_API = 'https://nominatim.openstreetmap.org';
const OSRM_API = 'https://router.project-osrm.org/route/v1';

const getOSMMapUrl = (originLat, originLon, destLat, destLon) => {
  if (!destLat || !destLon) {
    return `https://www.openstreetmap.org/export/embed.html?bbox=36.7,-1.4,37.0,-1.2&layer=mapnik&marker=${originLat},${originLon}`;
  }

  const minLon = Math.min(originLon, destLon) - 0.05;
  const maxLon = Math.max(originLon, destLon) + 0.05;
  const minLat = Math.min(originLat, destLat) - 0.05;
  const maxLat = Math.max(originLat, destLat) + 0.05;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon},${minLat},${maxLon},${maxLat}&layer=mapnik&marker=${originLat},${originLon}&marker=${destLat},${destLon}`;
};

const geocodeAddress = async (query) => {
  if (query.length < 3) return [];

  try {
    const response = await fetch(
      `${NOMINATIM_API}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ke&limit=5&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'MontenzumaDispatch/1.0',
        },
      }
    );
    const data = await response.json();
    return data.map((result) => ({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      address: result.display_name,
      name: result.name || result.display_name,
      type: result.type,
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
};

const calculateRouteOSRM = async (originLat, originLon, destLat, destLon) => {
  try {
    const response = await fetch(
      `${OSRM_API}/driving/${originLon},${originLat};${destLon},${destLat}?overview=full&geometries=geojson&steps=true`
    );
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distanceKm = (route.distance / 1000).toFixed(1);
      const timeInSeconds = route.duration;
      const hours = Math.floor(timeInSeconds / 3600);
      const minutes = Math.floor((timeInSeconds % 3600) / 60);
      const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      const legs = route.legs[0];
      const steps = legs.steps.map((step, index) => ({
        instruction: step.maneuver.modifier || step.maneuver.type || 'Continue',
        name: step.name || '',
        distance: (step.distance / 1000).toFixed(2),
        duration: Math.round(step.duration / 60),
      }));

      return {
        distance: parseFloat(distanceKm),
        travelTime: timeString,
        travelTimeMinutes: Math.round(timeInSeconds / 60),
        steps: steps.slice(0, 10),
        geometry: route.geometry,
      };
    }
    return null;
  } catch (error) {
    console.error('OSRM routing error:', error);
    const straightDistance = calculateHaversineDistance(originLat, originLon, destLat, destLon);
    const roadDistance = (straightDistance * 1.3).toFixed(1);
    const estimatedTime = Math.round((parseFloat(roadDistance) / 50) * 60);

    return {
      distance: parseFloat(roadDistance),
      travelTime: estimatedTime > 60
        ? `${Math.floor(estimatedTime / 60)}h ${estimatedTime % 60}m`
        : `${estimatedTime}m`,
      travelTimeMinutes: estimatedTime,
      steps: [],
      geometry: null,
      isEstimated: true,
    };
  }
};

const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculateVehicleScore = (vehicle, tripRequirements) => {
  let score = 100;
  if (vehicle.status !== 'Available') score -= 50;
  if (vehicle.currentLocation) {
    const distance = calculateHaversineDistance(
      vehicle.currentLocation.lat,
      vehicle.currentLocation.lon,
      DEFAULT_MORTUARY.lat,
      DEFAULT_MORTUARY.lon
    );
    score -= Math.min(distance * 2, 30);
  }
  if (tripRequirements.vehicleType && vehicle.type !== tripRequirements.vehicleType) {
    score -= 20;
  }
  if (tripRequirements.distance > 100 && vehicle.fuelEfficiency) {
    score += Math.min(vehicle.fuelEfficiency, 10);
  }
  return Math.max(score, 0);
};

const optimizeDispatch = (availableVehicles, tripData) => {
  const scoredVehicles = availableVehicles.map((vehicle) => ({
    ...vehicle,
    score: calculateVehicleScore(vehicle, tripData),
  }));
  scoredVehicles.sort((a, b) => b.score - a.score);
  return scoredVehicles;
};

const calculateBillingUpToDay = (dispatchDate, ratePerDay = 5000) => {
  const today = new Date();
  const dispatch = new Date(dispatchDate);
  dispatch.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (dispatch > today) return 0;

  const daysElapsed = Math.floor((today - dispatch) / (1000 * 60 * 60 * 24)) + 1;
  return daysElapsed * ratePerDay;
};

const updateDeceasedBilling = async (deceasedId, dispatchData, tenantSlug) => {
  try {
    const billingAmount = calculateBillingUpToDay(dispatchData.dispatch_date);
    const response = await api.put(
      ENDPOINTS.DECEASED.UPDATE(deceasedId) + '/billing',
      {
        dispatch_set_date: dispatchData.dispatch_date,
        dispatch_id: dispatchData.dispatch_id,
        dispatch_vehicle: dispatchData.vehicle_plate,
        dispatch_destination: dispatchData.destination_address,
        billing_amount: billingAmount,
        last_updated: new Date().toISOString(),
      }
    );
    return response.data;
  } catch (error) {
    console.warn('Billing update info:', error.response?.data || error.message);
    return null;
  }
};

const sendDispatchNotification = async (driverPhone, dispatchData) => {
  try {
    const response = await api.post(
      ENDPOINTS.HEARSE.DISPATCH,
      {
        phone: driverPhone,
        message: `🚐 *NEW DISPATCH ASSIGNMENT*\n\n` +
          `📍 *Route:* ${dispatchData.origin} → ${dispatchData.destination}\n` +
          `📅 *Date:* ${dispatchData.date}\n` +
          `⏰ *Time:* ${dispatchData.time}\n` +
          `🚗 *Vehicle:* ${dispatchData.vehiclePlate}\n` +
          `📏 *Distance:* ${dispatchData.distance} km (one way)\n` +
          `⏱️ *Est. Time:* ${dispatchData.travelTime}\n\n` +
          `Please confirm receipt. Drive safely! 🙏`,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Notification dispatch failed:', error);
    throw error;
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

const DispatchSection = ({ deceasedId, dispatchData, onUpdate }) => {
  const { id } = useParams();
  const effectiveDeceasedId = deceasedId || id;
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [username, setUsername] = useState('System');
  const [trips, setTrips] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [routeSteps, setRouteSteps] = useState([]);
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  const [tripName, setTripName] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleCC, setVehicleCC] = useState('');
  const [dispatchDate, setDispatchDate] = useState('');
  const [dispatchTime, setDispatchTime] = useState('');
  const [negotiatedPrice, setNegotiatedPrice] = useState('');
  const [ratePerKm, setRatePerKm] = useState(100);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverContact, setDriverContact] = useState('');

  const [destination, setDestination] = useState('');
  const [destinationLat, setDestinationLat] = useState(null);
  const [destinationLon, setDestinationLon] = useState(null);
  const [distance, setDistance] = useState(null);
  const [travelTime, setTravelTime] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [fuelCost, setFuelCost] = useState(null);
  const [fuelEstimate, setFuelEstimate] = useState(null);
  const [transportCost, setTransportCost] = useState(null);
  const [totalCost, setTotalCost] = useState(null);

  const getTenantSlug = () => {
    return localStorage.getItem('tenantSlug') ||
      localStorage.getItem('tenant_slug') ||
      (() => {
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          return user.tenantSlug || user.tenant?.slug || 'default';
        } catch {
          return 'default';
        }
      })();
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser) setUsername(storedUser);
  }, []);

  useEffect(() => {
    if (effectiveDeceasedId) {
      fetchTrips();
      fetchAvailableVehicles();
    }
  }, [effectiveDeceasedId]);

  const fetchTrips = async () => {
    if (!effectiveDeceasedId) {
      setTrips([]);
      setIsLoadingTrips(false);
      return;
    }
    try {
      setIsLoadingTrips(true);
      const response = await api.get(ENDPOINTS.HEARSE.DETAIL(effectiveDeceasedId));
      if (response.data.success || response.data) {
        setTrips(response.data.data || response.data.trips || []);
      } else {
        setTrips([]);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      setTrips([]);
    } finally {
      setIsLoadingTrips(false);
    }
  };

  const fetchAvailableVehicles = async () => {
    try {
      const response = await api.get(ENDPOINTS.HEARSE.VEHICLES);
      if (response.data.success || response.data) {
        setAvailableVehicles(response.data.data || response.data.vehicles || []);
      } else {
        setAvailableVehicles([]);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setAvailableVehicles([]);
    }
  };

  const calculateFuelCost = useCallback(() => {
    if (!vehicleCC || !distance || vehicleCC <= 0 || distance <= 0) return null;
    const cc = parseFloat(vehicleCC);
    if (isNaN(cc) || cc <= 0) return null;

    let kmPerLiter = cc < 1500 ? 15 : cc < 2000 ? 12 : cc < 3000 ? 9 : cc < 4000 ? 6 : 4;
    const roundTrip = distance * 2;
    const fuelNeeded = roundTrip / kmPerLiter;
    return {
      liters: Math.round(fuelNeeded * 10) / 10,
      cost: Math.round(fuelNeeded * 180),
    };
  }, [vehicleCC, distance]);

  const calculateTransportCost = useCallback(() => {
    if (!distance || distance <= 0 || !ratePerKm || ratePerKm <= 0) return null;
    const roundTrip = distance * 2;
    return Math.round(roundTrip * ratePerKm);
  }, [distance, ratePerKm]);

  useEffect(() => {
    if (distance && distance > 0) {
      try {
        const fuel = calculateFuelCost();
        if (fuel) {
          setFuelEstimate(fuel.liters);
          setFuelCost(fuel.cost);
        } else {
          setFuelEstimate(null);
          setFuelCost(null);
        }

        const transport = calculateTransportCost();
        setTransportCost(transport);

        const total = (fuel?.cost || 0) + (transport || 0);
        setTotalCost(total);
      } catch (error) {
        console.error('Error calculating costs:', error);
        setFuelCost(null);
        setTransportCost(null);
        setTotalCost(0);
        setFuelEstimate(null);
      }
    } else {
      setFuelCost(null);
      setTransportCost(null);
      setTotalCost(0);
      setFuelEstimate(null);
    }
  }, [distance, vehicleCC, ratePerKm, calculateFuelCost, calculateTransportCost]);

  const searchLocation = async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results = await geocodeAddress(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const calculateRoute = async (lat, lon) => {
    setIsLoading(true);
    try {
      const routeData = await calculateRouteOSRM(
        DEFAULT_MORTUARY.lat,
        DEFAULT_MORTUARY.lon,
        lat,
        lon
      );

      if (routeData) {
        setDistance(routeData.distance);
        setTravelTime(routeData.travelTime);
        setRouteSteps(routeData.steps);
      }
    } catch (error) {
      console.error('Route calculation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDestinationSelect = (result) => {
    setDestination(result.address);
    setDestinationLat(result.lat);
    setDestinationLon(result.lon);
    setSearchResults([]);
    calculateRoute(result.lat, result.lon);
  };

  const getMapUrl = () => {
    return getOSMMapUrl(
      DEFAULT_MORTUARY.lat,
      DEFAULT_MORTUARY.lon,
      destinationLat,
      destinationLon
    );
  };

  const resetForm = () => {
    setTripName('');
    setVehiclePlate('');
    setVehicleName('');
    setVehicleCC('');
    setDispatchDate('');
    setDispatchTime('');
    setNegotiatedPrice('');
    setRatePerKm(100);
    setDriverName('');
    setDriverPhone('');
    setDriverContact('');
    setDestination('');
    setDestinationLat(null);
    setDestinationLon(null);
    setDistance(null);
    setTravelTime(null);
    setFuelCost(null);
    setFuelEstimate(null);
    setTransportCost(null);
    setTotalCost(null);
    setRouteSteps([]);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!vehiclePlate || !dispatchDate || !driverName || !driverContact || !destinationLat) {
      setMessage('Error: Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    const fuel = calculateFuelCost();

    const tripData = {
      deceased_id: effectiveDeceasedId,
      vehicle_plate: vehiclePlate,
      vehicle_name: vehicleName || null,
      vehicle_cc: vehicleCC || null,
      driver_name: driverName,
      driver_contact: driverContact,
      driver_phone: driverPhone,
      dispatch_date: dispatchDate,
      dispatch_time: dispatchTime || '09:00',
      destination_address: destination,
      destination_lat: destinationLat,
      destination_lon: destinationLon,
      distance_km: distance || null,
      round_trip_km: distance ? distance * 2 : null,
      travel_time: travelTime || null,
      fuel_estimate: fuelEstimate || null,
      fuel_cost: fuelCost || null,
      rate_per_km: ratePerKm || 100,
      total_cost: totalCost || null,
      negotiated_price: negotiatedPrice || null,
      trip_name: tripName || `Trip ${new Date(dispatchDate).toLocaleDateString()}`,
      origin_address: DEFAULT_MORTUARY.address,
      origin_lat: DEFAULT_MORTUARY.lat,
      origin_lon: DEFAULT_MORTUARY.lon,
      created_by: username,
      status: 'Assigned',
    };

    try {
      const tenantSlug = getTenantSlug();

      let dispatchResponse;
      if (editingId) {
        dispatchResponse = await api.put(
          `${ENDPOINTS.HEARSE.DETAIL(editingId)}`,
          tripData
        );
        setMessage('Trip updated successfully!');
      } else {
        dispatchResponse = await api.post(
          ENDPOINTS.HEARSE.CREATE,
          tripData
        );
        setMessage('Trip created successfully!');
      }

      if (dispatchResponse?.data?.data) {
        const dispatchWithId = {
          ...tripData,
          dispatch_id: dispatchResponse.data.data.dispatch_id || editingId,
        };
        await updateDeceasedBilling(effectiveDeceasedId, dispatchWithId, tenantSlug);
      }

      setTimeout(async () => {
        setShowModal(false);
        resetForm();
        await fetchTrips();
        await fetchAvailableVehicles();
        onUpdate?.();
        setMessage('');
      }, 1500);
    } catch (error) {
      console.error('Dispatch error:', error);
      setMessage('Error: ' + (error.response?.data?.error || error.message || 'Failed to save dispatch'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) {
      return;
    }
    try {
      await api.delete(ENDPOINTS.HEARSE.DETAIL(tripId));
      await fetchTrips();
      await fetchAvailableVehicles();
      onUpdate?.();
      setMessage('Trip deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Error deleting trip: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEdit = (trip) => {
    setEditingId(trip.dispatch_id);
    setTripName(trip.trip_name);
    setVehiclePlate(trip.vehicle_plate);
    setVehicleName(trip.vehicle_name);
    setVehicleCC(trip.vehicle_cc);
    setDispatchDate(trip.dispatch_date?.split('T')[0]);
    setDispatchTime(trip.dispatch_time || '09:00');
    setNegotiatedPrice(trip.negotiated_price || '');
    setRatePerKm(trip.rate_per_km || 100);
    setDriverName(trip.driver_name || '');
    setDriverPhone(trip.driver_phone || '');
    setDriverContact(trip.driver_contact || '');
    setDestination(trip.destination_address);
    setDestinationLat(trip.destination_lat);
    setDestinationLon(trip.destination_lon);
    setDistance(trip.distance_km);
    setTravelTime(trip.travel_time);
    setShowModal(true);
  };

  const sendToDriverNotification = async (trip) => {
    if (!trip.driver_contact) {
      setMessage('No driver phone number available');
      return;
    }

    setIsSendingNotification(true);
    try {
      const dispatchData = {
        origin: trip.origin_address || DEFAULT_MORTUARY.address,
        destination: trip.destination_address,
        date: new Date(trip.dispatch_date).toLocaleDateString(),
        time: trip.dispatch_time || '09:00',
        vehiclePlate: trip.vehicle_plate,
        distance: trip.distance_km,
        travelTime: trip.travel_time,
      };

      await sendDispatchNotification(trip.driver_contact, dispatchData);
      setMessage('Dispatch details sent to driver successfully!');
    } catch (error) {
      console.error('Notification error:', error);
      setMessage('Failed to send notification: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSendingNotification(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const autoAssignVehicle = () => {
    if (availableVehicles.length === 0) {
      setMessage('No available vehicles for auto-assignment');
      return;
    }

    const optimized = optimizeDispatch(availableVehicles, {
      distance: distance || 50,
      vehicleType: 'hearse',
    });

    const bestVehicle = optimized[0];
    if (bestVehicle) {
      setVehiclePlate(bestVehicle.plate);
      setVehicleName(bestVehicle.name);
      setVehicleCC(bestVehicle.cc);
      setDriverName(bestVehicle.driver_name);
      setDriverPhone(bestVehicle.driver_phone);
      setDriverContact(bestVehicle.driver_contact);
      setMessage(`Auto-assigned: ${bestVehicle.plate} (Score: ${bestVehicle.score})`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <DispatchContainer>
      <Header>
        <Title>
          <Truck size={18} />
          Vehicle Dispatch
        </Title>
        <ButtonGroup>
          {availableVehicles.length > 0 && (
            <SecondaryButton onClick={autoAssignVehicle}>
              <Navigation size={14} /> Auto-Assign
            </SecondaryButton>
          )}
          <PrimaryButton
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <PlusCircle size={14} /> New Dispatch
          </PrimaryButton>
        </ButtonGroup>
      </Header>

      {message && (
        <AlertBox $type={message.includes('Error') || message.includes('❌') ? 'error' : message.includes('✅') ? 'success' : 'info'}>
          {message}
        </AlertBox>
      )}

      {trips.length === 0 ? (
        <EmptyState>
          {isLoadingTrips ? (
            <>
              <Loader2 size={48} className="animate-spin" style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h4>Loading dispatch trips...</h4>
            </>
          ) : (
            <>
              <Truck size={48} />
              <h4>No dispatch trips added yet</h4>
              <p>Click "New Dispatch" to create your first trip</p>
            </>
          )}
        </EmptyState>
      ) : (
        trips.map((trip) => {
          const displayPrice = trip.negotiated_price || trip.total_cost || 0;

          return (
            <TripCard key={trip.dispatch_id}>
              <TripHeader>
                <TripLabel>
                  <Route size={14} />
                  {trip.trip_name || 'Dispatch Trip'}
                </TripLabel>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Badge $variant={
                    trip.status === 'Completed' ? 'success' :
                      trip.status === 'In Transit' ? 'warning' :
                        trip.status === 'Cancelled' ? 'danger' : 'info'
                  }>
                    {trip.status || 'Assigned'}
                  </Badge>
                  <Badge $variant="info">
                    <Calendar size={12} />
                    {new Date(trip.dispatch_date).toLocaleDateString()}
                  </Badge>
                </div>
              </TripHeader>

              <InfoRow>
                <InfoLabel>Vehicle:</InfoLabel>
                <InfoValue>
                  <strong>{trip.vehicle_plate}</strong>
                  {trip.vehicle_name && <span style={{ color: COLORS.textSecondary, marginLeft: '0.5rem' }}>({trip.vehicle_name})</span>}
                  {trip.vehicle_cc && <span style={{ color: COLORS.textSecondary, marginLeft: '0.5rem' }}>{trip.vehicle_cc}CC</span>}
                </InfoValue>
              </InfoRow>

              {trip.driver_name && (
                <InfoRow>
                  <InfoLabel>Driver:</InfoLabel>
                  <InfoValue>
                    <strong>{trip.driver_name}</strong>
                    <span style={{ color: COLORS.textSecondary, marginLeft: '0.5rem' }}>
                      📞 {trip.driver_contact || trip.driver_phone}
                    </span>
                  </InfoValue>
                </InfoRow>
              )}

              <InfoRow>
                <InfoLabel>Route:</InfoLabel>
                <InfoValue style={{ fontSize: '0.75rem' }}>
                  <span style={{ color: COLORS.success }}>●</span> {trip.origin_address?.substring(0, 40)}...
                  <br />
                  <span style={{ color: COLORS.danger }}>●</span> {trip.destination_address?.substring(0, 40)}...
                </InfoValue>
              </InfoRow>

              <InfoRow>
                <InfoLabel>Distance:</InfoLabel>
                <InfoValue>
                  {trip.distance_km || 0} km one way • {(trip.round_trip_km || (trip.distance_km ? (trip.distance_km * 2).toFixed(1) : 0))} km round trip
                  {trip.travel_time && <span style={{ marginLeft: '0.5rem', color: COLORS.textSecondary }}>⏱️ {trip.travel_time}</span>}
                </InfoValue>
              </InfoRow>

              {trip.fuel_cost && (
                <InfoRow>
                  <InfoLabel>Fuel:</InfoLabel>
                  <InfoValue style={{ color: COLORS.success }}>
                    {trip.fuel_estimate}L (KES {trip.fuel_cost})
                  </InfoValue>
                </InfoRow>
              )}

              <InfoRow>
                <InfoLabel>Price:</InfoLabel>
                <InfoValue>
                  <strong style={{ fontSize: '0.9375rem' }}>KES {displayPrice.toLocaleString()}</strong>
                  <span style={{ color: COLORS.textSecondary, marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                    {trip.negotiated_price ? '(final)' : '(est.)'}
                  </span>
                </InfoValue>
              </InfoRow>

              <ActionButtons>
                {trip.driver_contact && (
                  <SendButton onClick={() => sendToDriverNotification(trip)} disabled={isSendingNotification}>
                    {isSendingNotification ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    Send to Driver
                  </SendButton>
                )}
                <IconButton onClick={() => handleEdit(trip)}>
                  <Edit size={14} /> Edit
                </IconButton>
                <IconButton $danger onClick={() => handleDelete(trip.dispatch_id)}>
                  <Trash2 size={14} /> Delete
                </IconButton>
              </ActionButtons>
            </TripCard>
          );
        })
      )}

      {showModal && (
        <ModalOverlay onClick={() => { setShowModal(false); resetForm(); }}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>
                {editingId ? <Edit size={18} /> : <PlusCircle size={18} />}
                {editingId ? 'Edit Dispatch' : 'New Vehicle Dispatch'}
              </h3>
              <ModalButton onClick={() => { setShowModal(false); resetForm(); }}>
                <X size={18} />
              </ModalButton>
            </ModalHeader>

            <ModalBody>
              <form onSubmit={handleSubmit}>
                <FormGrid>
                  <FormGroup>
                    <Label>Trip Name</Label>
                    <Input
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      placeholder="e.g., Funeral Day, Body Collection"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Vehicle Plate *</Label>
                    <Input
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      placeholder="KCA 123A"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Vehicle Name</Label>
                    <Input
                      value={vehicleName}
                      onChange={(e) => setVehicleName(e.target.value)}
                      placeholder="e.g., Mercedes Hearse"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Engine CC</Label>
                    <Input
                      value={vehicleCC}
                      onChange={(e) => setVehicleCC(e.target.value)}
                      placeholder="e.g., 2000"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Dispatch Date *</Label>
                    <Input
                      type="date"
                      value={dispatchDate}
                      onChange={(e) => setDispatchDate(e.target.value)}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Dispatch Time</Label>
                    <Input
                      type="time"
                      value={dispatchTime}
                      onChange={(e) => setDispatchTime(e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Rate per Kilometer (KES) *</Label>
                    <Input
                      type="number"
                      value={ratePerKm}
                      onChange={(e) => setRatePerKm(parseFloat(e.target.value) || 0)}
                      min="1"
                      step="1"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Final Price (Optional)</Label>
                    <Input
                      type="number"
                      value={negotiatedPrice}
                      onChange={(e) => setNegotiatedPrice(e.target.value)}
                      placeholder="Enter agreed price"
                    />
                  </FormGroup>
                </FormGrid>

                <div style={{ marginTop: '1.25rem', padding: '1rem', background: COLORS.infoLight, borderRadius: COLORS.radiusSm, border: `1px solid ${COLORS.info}30` }}>
                  <Label style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={14} /> Driver Information
                  </Label>

                  <FormGrid>
                    <FormGroup>
                      <Label>Driver Name *</Label>
                      <Input
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        placeholder="Driver full name"
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Driver Phone *</Label>
                      <Input
                        value={driverContact}
                        onChange={(e) => setDriverContact(e.target.value)}
                        placeholder="+2547XXXXXXXX"
                        required
                      />
                    </FormGroup>

                    <FormGroup style={{ gridColumn: '1 / -1' }}>
                      <Label>Alt. Phone</Label>
                      <Input
                        value={driverPhone}
                        onChange={(e) => setDriverPhone(e.target.value)}
                        placeholder="Optional"
                      />
                    </FormGroup>
                  </FormGrid>
                </div>

                <FormGroup style={{ marginTop: '1.25rem', position: 'relative' }}>
                  <Label>Destination *</Label>
                  <Input
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      searchLocation(e.target.value);
                    }}
                    placeholder="Search destination address"
                    required
                  />
                  {isSearching && (
                    <div style={{ position: 'absolute', right: '10px', top: '35px' }}>
                      <Loader2 size={16} className="animate-spin" />
                    </div>
                  )}
                  {searchResults.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: COLORS.surface,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: COLORS.radiusSm,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 100,
                      boxShadow: COLORS.shadowMd,
                      marginTop: '0.25rem'
                    }}>
                      {searchResults.map((result, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleDestinationSelect(result)}
                          style={{
                            padding: '0.75rem',
                            cursor: 'pointer',
                            borderBottom: `1px solid ${COLORS.border}`,
                            fontSize: '0.8125rem',
                            transition: COLORS.transition
                          }}
                        >
                          <div style={{ fontWeight: 500 }}>{result.name}</div>
                          <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary }}>
                            {result.address}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </FormGroup>

                {distance && (
                  <SummaryBox>
                    <SummaryRow>
                      <span>📍 One way:</span>
                      <strong>{distance} km</strong>
                    </SummaryRow>
                    <SummaryRow>
                      <span>🔄 Round trip:</span>
                      <strong>{(distance * 2).toFixed(1)} km</strong>
                    </SummaryRow>
                    <SummaryRow>
                      <span>⏱️ Travel time:</span>
                      <strong>{travelTime}</strong>
                    </SummaryRow>
                    <SummaryRow>
                      <span>💰 Transport ({ratePerKm}/km):</span>
                      <strong>KES {transportCost}</strong>
                    </SummaryRow>
                    {fuelCost && (
                      <>
                        <SummaryRow>
                          <span>⛽ Fuel:</span>
                          <strong>{fuelEstimate}L (KES {fuelCost})</strong>
                        </SummaryRow>
                        <SummaryRow style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: '0.5rem', paddingTop: '0.5rem', fontWeight: 600 }}>
                          <span>💰 Total estimate:</span>
                          <strong style={{ color: COLORS.success }}>KES {totalCost}</strong>
                        </SummaryRow>
                      </>
                    )}
                  </SummaryBox>
                )}

                {routeSteps.length > 0 && (
                  <div style={{
                    background: COLORS.bg,
                    padding: '1rem',
                    borderRadius: COLORS.radiusSm,
                    marginBottom: '1rem',
                    maxHeight: '150px',
                    overflowY: 'auto'
                  }}>
                    <Label style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Navigation size={14} /> Route Directions
                    </Label>
                    {routeSteps.map((step, index) => (
                      <RouteStep key={index}>
                        <span className="step-number">{index + 1}</span>
                        <span className="step-text">
                          {step.instruction} {step.name && `onto ${step.name}`}
                          {step.distance && ` (${step.distance} km)`}
                        </span>
                      </RouteStep>
                    ))}
                  </div>
                )}

                <MapContainer>
                  <iframe src={getMapUrl()} title="Route Map" loading="lazy" />
                  {distance && routeSteps.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      background: 'white',
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.7rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}>
                      🗺️ Powered by OpenStreetMap & OSRM
                    </div>
                  )}
                </MapContainer>

                <PrimaryButton
                  type="submit"
                  disabled={
                    isLoading ||
                    !destinationLat ||
                    !vehiclePlate ||
                    !dispatchDate ||
                    !ratePerKm ||
                    !driverName ||
                    !driverContact
                  }
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} /> {editingId ? 'Update' : 'Create'} Dispatch
                    </>
                  )}
                </PrimaryButton>

                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  background: `${COLORS.warningLight}20`,
                  borderRadius: COLORS.radiusSm,
                  fontSize: '0.75rem',
                  color: COLORS.textSecondary,
                  border: `1px solid ${COLORS.warning}30`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={14} />
                  Routes calculated using OpenStreetMap & OSRM (free, open-source)
                </div>
              </form>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </DispatchContainer>
  );
};

export default DispatchSection;