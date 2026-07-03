import React, { useState, useEffect } from 'react';
import { Shield, Zap, MessageCircle, Mail, Globe } from 'lucide-react';
import styled from 'styled-components';

// ------------------- DATA -------------------
const SUPPORT = { phone: '0740045355', email: 'infowelttallis@gmail.com' };

const colors = {
  dangerRed: '#C0392B',
  kinSuccess: '#00A896',
  kinDanger: '#E71D36',
  autopsySuccess: '#6A0572',
  autopsyDanger: '#37fc00',
};

// ------------------- STYLED COMPONENTS -------------------
const FooterBar = styled.footer`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: #0f172a;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  font-size: 0.75rem;
  gap: 1rem;

  @media (max-width: 600px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 1.25rem;
    padding: 1rem; /* taller padding on mobile */
  }
`;

const Section = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;

    &:first-child {
      grid-column: span 2;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 0.75rem;
      width: 100%;
    }
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const NavLink = styled.a`
  color: #94a3b8;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: 0.2s;

  &:hover {
    color: #60a5fa;
  }
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #10b981;
  font-weight: 500;

  span {
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;
    box-shadow: 0 0 8px #10b981;
  }
`;

const RedText = styled.span`
  color: ${colors.autopsyDanger};
  font-weight: 600;
`;

const ProductId = styled.span`
  font-size: 0.7rem;
  color: #64748b;
`;

const SystemMeta = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 6px;
  }
`;

// ------------------- COMPONENT -------------------
const FooterComponent = () => {
  const [latency, setLatency] = useState('24ms');
  const [userName, setUserName] = useState('User');
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const name = user.full_name || user.name || user.username || user.email || 'User';
        setUserName(name);
      }
    } catch (e) {
      setUserName('User');
    }
  }, []);

  // Generate a random product ID
  const generateProductId = () => {
    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `WT-RSP-${currentYear}-${randomCode}`;
  };
  const [productId] = useState(generateProductId());

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(`${Math.floor(Math.random() * 10) + 21}ms`);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <FooterBar>
      {/* BRAND & USER */}
      <Section>
        <Brand>
          <Shield size={14} /> © {currentYear} WELT TALLIS Inc
        </Brand>
        <div style={{ opacity: 0.5 }}>|</div>
        <span>
          {' '}
          - Logged in as : <RedText>{userName}</RedText>
        </span>
      </Section>

      {/* SUPPORT LINKS */}
      <Section>
        <NavLink href={`https://wa.me/${SUPPORT.phone}`} target="_blank">
          <MessageCircle size={14} /> WhatsApp
        </NavLink>
        <NavLink href={`mailto:${SUPPORT.email}`}>
          <Mail size={14} /> Contact
        </NavLink>
      </Section>

      {/* SYSTEM STATUS */}
      <Section style={{ alignItems: 'flex-end' }}>
        <Status>
          <span /> Operational
        </Status>
        <SystemMeta>
          <div>
            <Zap size={12} /> {latency}
          </div>
          <div>
            <Globe size={12} /> v2.1
          </div>
          <ProductId>Product ID: {productId}</ProductId>
        </SystemMeta>
      </Section>
    </FooterBar>
  );
};

export default FooterComponent;
