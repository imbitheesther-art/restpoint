import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { C, formatDate } from './theme';
import axios from 'axios';
import { getTenantSlug } from '../../../utils/globalAuth';

const SectionHead = styled.div`
  background: ${C.black}; color: white; padding: 8px 16px;
  font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; margin-bottom: 24px; border-radius: 2px;
  display: flex; align-items: center; gap: 8px;
  span { opacity: 0.5; font-size: 10px; }
  ${p => p.$mt0 && 'margin-top: 0;'}
`;

const DetailGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const DetailBox = styled.div`
  background: ${C.bgSection}; border: 1px solid ${C.borderLight};
  border-radius: 6px; padding: 16px; min-width: 0;
`;

const DetailLabel = styled.span`
  font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: ${C.gray}; margin-bottom: 6px; display: block;
`;

const DetailValue = styled.div`
  font-size: 15px; font-weight: 600; color: ${C.black}; word-break: break-word;
`;

const Btn = styled.button`
  padding: 10px 16px; border-radius: 4px; font-weight: 600; font-size: 13px;
  cursor: pointer; border: 1px solid ${C.border}; background: white; color: ${C.dark};
  transition: 0.15s; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font-family: 'Source Sans 3', sans-serif;
  &:hover { background: ${C.bgField}; border-color: ${C.gray}; }
  ${p => p.$primary && `background: ${C.black}; color: white; border-color: ${C.black};
    &:hover { background: ${C.dark}; }`}
  ${p => p.$sm && `padding: 6px 12px; font-size: 12px;`}
  ${p => p.$danger && `background: ${C.danger}; color: white; border-color: ${C.danger};
    &:hover { background: #b91c1c; }`}
`;

const ModuleCard = styled.div`
  border: 1px solid ${C.border}; border-radius: 6px; padding: 16px; margin-bottom: 16px;
  display: flex; justify-content: space-between; align-items: center;
  background: white; gap: 12px; flex-wrap: wrap;
  ${p => p.$dashed && `border-style: dashed; background: ${C.bgSection};`}
`;

const ModuleInfo = styled.div`
  h4 { font-size: 15px; font-weight: 700; margin-bottom: 4px; color: ${C.black}; margin: 0 0 4px; }
  p { font-size: 13px; color: ${C.gray}; margin: 0; }
`;

const BookingsTab = ({ deceased }) => {
  const d = deceased || {};
  const [flowerBookings, setFlowerBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlowerBookings();
  }, []);

  const fetchFlowerBookings = async () => {
    setLoading(true);
    try {
      const slug = getTenantSlug();
      const headers = { 'x-tenant-slug': slug };
      // Try to get flower bookings for this deceased
      const res = await axios.get(`/api/v1/restpoint/florist/bookings`, {
        headers,
        params: { search: d.full_name || d.name || '' }
      });
      if (res.data?.data) {
        setFlowerBookings(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (e) {
      // No flower bookings yet
      setFlowerBookings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SectionHead $mt0><span>01</span> Chapel Booking</SectionHead>
      <DetailGrid>
        <DetailBox><DetailLabel>Scheduled Date</DetailLabel><DetailValue>{d.chapel_date ? formatDate(d.chapel_date) : 'Not scheduled'}</DetailValue></DetailBox>
        <DetailBox><DetailLabel>Time</DetailLabel><DetailValue>{d.chapel_time || '—'}</DetailValue></DetailBox>
      </DetailGrid>
      <Btn $primary style={{ marginBottom: 32 }}>Reschedule Chapel</Btn>

      <SectionHead><span>02</span> Coffin Booking</SectionHead>
      <ModuleCard>
        <ModuleInfo>
          <h4>{d.coffin_name || 'No Coffin Assigned'}</h4>
          <p>{d.coffin_price ? `KES ${parseFloat(d.coffin_price).toLocaleString()}` : ''} | Status: {d.coffin_status || 'Not assigned'}</p>
        </ModuleInfo>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn $sm>Manage</Btn>
          {d.coffin_name && <Btn $sm $danger>Detach</Btn>}
        </div>
      </ModuleCard>
      <Btn style={{ marginBottom: 32 }}>+ Attach to Coffin Booking</Btn>

      <SectionHead><span>03</span> Flower Booking</SectionHead>
      {loading ? (
        <div style={{ padding: 20, textAlign: 'center', color: C.gray }}>Loading flower bookings...</div>
      ) : flowerBookings.length > 0 ? (
        <>
          {flowerBookings.map((booking, i) => (
            <ModuleCard key={booking.id || i}>
              <ModuleInfo>
                <h4>{booking.flower_type || 'Flower Booking'}</h4>
                <p>{booking.service_type || ''} | {booking.deceased_name || d.full_name || d.name || ''} | KES {parseFloat(booking.amount || 0).toLocaleString()}</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Delivery: {formatDate(booking.delivery_date)} at {booking.delivery_time} | Status: {booking.status || 'pending'}</p>
              </ModuleInfo>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn $sm>View</Btn>
                <Btn $sm $danger>Cancel</Btn>
              </div>
            </ModuleCard>
          ))}
          <Btn style={{ marginBottom: 32 }}>+ Add Another Flower Booking</Btn>
        </>
      ) : (
        <ModuleCard $dashed>
          <ModuleInfo>
            <h4 style={{ color: C.gray }}>No Flower Booking Attached</h4>
            <p>Please attach a flower package</p>
          </ModuleInfo>
          <Btn $primary $sm>+ Attach to Flower Booking</Btn>
        </ModuleCard>
      )}

      <SectionHead $mt4><span>04</span> Hearse Booking</SectionHead>
      <ModuleCard>
        <ModuleInfo>
          <h4>{d.hearse_name || 'No Hearse Assigned'}</h4>
          <p>{d.hearse_price ? `KES ${parseFloat(d.hearse_price).toLocaleString()}` : ''} | Driver: {d.hearse_driver || '—'}</p>
        </ModuleInfo>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn $sm>Manage</Btn>
          {d.hearse_name && <Btn $sm $danger>Detach</Btn>}
        </div>
      </ModuleCard>
      <Btn>+ Attach to Hearse Booking</Btn>
    </>
  );
};

export default BookingsTab;