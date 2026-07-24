import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import axios from 'axios';
import { getTenantSlug, getAuthToken } from '../../../utils/globalAuth';
import { showToast } from '../../../utils/toast';
import { ToastContainer } from 'react-toastify';

const API_GATEWAY_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = `${API_GATEWAY_URL}/deceased`;

// ─── Global Font Styles ─────────────────────────────────────────────
const GlobalFonts = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
`;

const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;

// ─── Color Variables ────────────────────────────────────────────────
const C = {
  black: '#0a0a0a',
  dark: '#1a1a1a',
  mid: '#444444',
  gray: '#777777',
  lightGray: '#aaaaaa',
  border: '#c8c8c8',
  borderLight: '#e0e0e0',
  bgField: '#f7f7f5',
  bgAccent: '#f0eeea',
  bgSection: '#fafaf9',
  bgApp: '#ececec',
  exportBtn: '#0F3040',
  success: '#059669',
  successBg: '#ecfdf5',
  warning: '#d97706',
  warningBg: '#fef3c7',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  info: '#2563eb',
  infoBg: '#eff6ff',
  brown: '#795548',
};

// ─── Styled Components ──────────────────────────────────────────────
const AppContainer = styled.div`
  font-family: 'Source Sans 3', -apple-system, sans-serif;
 
  color: ${C.dark};
  font-size: 14px;
  line-height: 1.5;
  min-height: 100vh;

  margin: 0 auto;
  padding: 0px;
  animation: ${fadeIn} 0.25s ease-out;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
  h1 {
    font-family: 'Merriweather', serif;
    font-size: 24px;
    color: ${C.black};
    margin: 0;
  }
  p {
    color: ${C.gray};
    font-size: 14px;
    margin: 4px 0 0;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Btn = styled.button`
  padding: 10px 16px; border-radius: 4px; font-weight: 600; font-size: 13px;
  cursor: pointer; border: 1px solid ${C.border}; background: white; color: ${C.dark};
  transition: 0.15s; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font-family: 'Source Sans 3', sans-serif;
  &:hover { background: ${C.bgField}; border-color: ${C.gray}; }
  ${p => p.$primary && `background: ${C.black}; color: white; border-color: ${C.black};
    &:hover { background: ${C.dark}; }`}
  ${p => p.$danger && `background: ${C.danger}; color: white; border-color: ${C.danger};
    &:hover { background: #b91c1c; }`}
  ${p => p.$export && `background: ${C.exportBtn}; color: white; border-color: ${C.exportBtn};
    &:hover { background: #0c2530; }`}
  ${p => p.$sm && `padding: 6px 12px; font-size: 12px;`}
`;

const ListCard = styled.div`
  background: white;
  border: 1px solid ${C.borderLight};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

const ListHeader = styled.div`
  background: ${C.bgSection};
  padding: 16px 24px;
  border-bottom: 1px solid ${C.borderLight};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  h2 { font-size: 16px; font-weight: 700; color: ${C.black}; margin: 0; }
`;

const FilterToolbar = styled.div`
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid ${C.borderLight};
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
`;

const FormInput = styled.input`
  height: 38px;
  border: 1px solid ${C.border};
  border-radius: 4px;
  padding: 0 12px;
  font-family: 'Source Sans 3', sans-serif;
  font-size: 14px;
  color: ${C.dark};
  background: ${p => p.$search ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23777' stroke-width='2' viewBox='0 0 24 24'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cpath d='m21 21-4.35-4.35'%3E%3C/path%3E%3C/svg%3E") no-repeat 10px center, ${C.bgField}` : C.bgField};
  background-size: ${p => p.$search ? '16px, auto' : 'auto'};
  padding-left: ${p => p.$search ? '34px' : '12px'};
  transition: border-color 0.15s;
  box-sizing: border-box;
  &:focus { outline: none; border-color: ${C.black}; background: white; }
`;

const FormSelect = styled.select`
  height: 38px;
  border: 1px solid ${C.border};
  border-radius: 4px;
  padding: 0 12px;
  font-family: 'Source Sans 3', sans-serif;
  font-size: 14px;
  color: ${C.dark};
  background: ${C.bgField};
  transition: border-color 0.15s;
  cursor: pointer;
  &:focus { outline: none; border-color: ${C.black}; background: white; }
`;

const TableWrap = styled.div`overflow-x: auto;`;

const StyledTable = styled.table`
  width: 100%; border-collapse: collapse; min-width: 800px;
  thead th {
    text-align: left; padding: 12px 24px; font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em; color: ${C.gray};
    border-bottom: 1px solid ${C.borderLight}; background: ${C.bgSection}; white-space: nowrap;
  }
  tbody tr {
    border-bottom: 1px solid ${C.borderLight}; cursor: pointer; transition: background 0.1s;
    &:last-child { border-bottom: none; }
    &:hover { background: ${C.bgField}; }
  }
  td { padding: 16px 24px; font-size: 14px; color: ${C.dark}; vertical-align: middle; }
`;

const AvatarSm = styled.div`
  width: 36px; height: 36px; border-radius: 50%; color: white;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px; flex-shrink: 0;
  background: ${p => p.$female ? C.brown : C.black};
`;

const NameCell = styled.div`
  display: flex; align-items: center; gap: 12px;
  .meta { font-size: 12px; color: ${C.gray}; margin-top: 2px; }
`;

const Badge = styled.span`
  padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;
  text-transform: uppercase; white-space: nowrap;
  background: ${p => p.$active ? C.warningBg : p.$released ? C.successBg : C.bgField};
  color: ${p => p.$active ? C.warning : p.$released ? C.success : C.gray};
`;

const EmptyRow = styled.td`
  text-align: center; padding: 40px; color: ${C.gray};
`;

const LoadingState = styled.div`
  text-align: center; padding: 60px; color: ${C.gray};
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  .spinner {
    width: 24px; height: 24px; border: 2px solid ${C.borderLight};
    border-top-color: ${C.black}; border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ─── Modal Components ───────────────────────────────────────────────
const ModalOverlay = styled.div`
  display: ${p => p.$open ? 'flex' : 'none'};
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;
  justify-content: center; align-items: center; padding: 20px;
`;
const ModalContent = styled.div`
  background: white; border-radius: 8px; width: 100%; max-width: 700px;
  max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
`;
const ModalHeader = styled.div`
  padding: 20px 24px; border-bottom: 1px solid ${C.borderLight};
  display: flex; justify-content: space-between; align-items: center;
  h2 { font-family: 'Merriweather', serif; font-size: 18px; color: ${C.black}; margin: 0; }
`;
const ModalBody = styled.div`padding: 24px;`;
const ModalFooter = styled.div`
  padding: 16px 24px; border-top: 1px solid ${C.borderLight}; text-align: right; display: flex; gap: 8px; justify-content: flex-end;
`;
const CloseBtn = styled.button`
  background: none; border: none; font-size: 24px; color: ${C.gray}; cursor: pointer; line-height: 1;
  &:hover { color: ${C.black}; }
`;
const SectionHead = styled.div`
  background: ${C.black}; color: white; padding: 8px 16px;
  font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; margin-bottom: 24px; border-radius: 2px;
  display: flex; align-items: center; gap: 8px;
  span { opacity: 0.5; font-size: 10px; }
  ${p => p.$mt0 && 'margin-top: 0;'}
  ${p => p.$mt4 && 'margin-top: 32px;'}
`;
const FormRow = styled.div`
  display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;
`;
const FormGroup = styled.div`flex: 1; min-width: 150px;`;
const FormLabel = styled.label`
  display: block; font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: ${C.gray}; margin-bottom: 6px;
`;

const ModalInput = styled.input`
  height: 38px; width: 100%; border: 1px solid ${C.border}; border-radius: 4px;
  padding: 0 12px; font-family: 'Source Sans 3', sans-serif; font-size: 14px;
  color: ${C.dark}; background: ${C.bgField}; box-sizing: border-box;
  &:focus { outline: none; border-color: ${C.black}; background: white; }
`;

const DataTable = styled.table`
  width: 100%; border-collapse: collapse; margin-top: 0;
  th { text-align: left; font-size: 11px; text-transform: uppercase; color: ${C.gray}; padding: 8px 12px; border-bottom: 2px solid ${C.borderLight}; white-space: nowrap; }
  td { padding: 12px; font-size: 13px; border-bottom: 1px solid ${C.borderLight}; vertical-align: middle; }
`;

const StatusTag = styled.span`
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
  border-radius: 4px; font-size: 12px; font-weight: 700;
  background: ${p => p.$success ? C.successBg : p.$warning ? C.warningBg : p.$info ? C.infoBg : C.bgField};
  color: ${p => p.$success ? C.success : p.$warning ? C.warning : p.$info ? C.info : C.gray};
  border: 1px solid ${p => p.$success ? '#a7f3d0' : p.$warning ? '#fde68a' : p.$info ? '#bfdbfe' : C.borderLight};
`;

// ─── Main Component ─────────────────────────────────────────────────
const DeceasedListPage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');

  // ─── Fetch Deceased ──────────────────────────────────────────────
  const fetchDeceased = useCallback(async () => {
    setLoading(true);
    try {
      const tenantSlug = getTenantSlug();
      const params = {};
      if (search) params.search = search;
      const token = getAuthToken ? getAuthToken() : localStorage.getItem('token') || '';
      const res = await axios.get(`${BASE_URL}/deceased-all`, {
        params,
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-slug': tenantSlug,
        },
      });
      const data = res.data?.data || res.data || [];
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching deceased:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchDeceased();
  }, [fetchDeceased]);

  // ─── Filters ─────────────────────────────────────────────────────
  const filteredRecords = records.filter(r => {
    const name = (r.full_name || r.name || '').toLowerCase();
    const id = (r.deceased_id || r.id || '').toLowerCase();
    const adm = (r.admission_number || r.admission_no || '').toLowerCase();
    const searchTerm = search.toLowerCase();
    if (search && !name.includes(searchTerm) && !id.includes(searchTerm) && !adm.includes(searchTerm)) return false;
    if (statusFilter) {
      const status = (r.body_status || r.status || '').toLowerCase();
      if (statusFilter === 'Active' && !['active', 'in morgue', 'pending'].includes(status)) return false;
      if (statusFilter === 'Released' && !['released', 'transferred'].includes(status)) return false;
    }
    if (genderFilter) {
      const sex = (r.sex || r.gender || '').toLowerCase();
      if (genderFilter.toLowerCase() !== sex) return false;
    }
    return true;
  });

  const getInitials = (name) => {
    if (!name) return 'NA';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getDaysInMorgue = (admittedDate) => {
    if (!admittedDate) return 0;
    const admitted = new Date(admittedDate);
    const now = new Date();
    return Math.floor((now - admitted) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatus = (r) => {
    const s = (r.body_status || r.status || '').toLowerCase();
    if (s === 'released' || s === 'transferred') return 'Released';
    return 'Active';
  };

  const openProfile = (id) => {
    const tenantSlug = getTenantSlug();
    navigate(`/tenant/${tenantSlug}/deceased/${id}`);
  };

  // ─── Export History ──────────────────────────────────────────────
  const exportHistory = [
    { date: 'Mar 15, 2025 10:00', range: 'Feb 2025 - Mar 2025', format: 'XLSX', status: 'Completed' },
    { date: 'Feb 28, 2025 16:30', range: 'Jan 2025 - Feb 2025', format: 'CSV', status: 'Completed' },
  ];

  return (
    <>
      <GlobalFonts />
      <AppContainer>
        <ToastContainer position="top-right" />

        {/* Page Header */}
        <PageHeader>
          <div>
            <h1>Deceased Records</h1>
            <p>Manage and track all deceased records across your facility</p>
          </div>
          <Actions>
            <Btn $export onClick={() => setShowExport(true)}>⬇ Export Data to Excel</Btn>
            <Btn $primary onClick={() => {
              const slug = getTenantSlug();
              navigate(`/tenant/${slug}/deceased/register`);
            }}>+ New Admission</Btn>
          </Actions>
        </PageHeader>

        {/* Main Card */}
        <ListCard>
          <ListHeader>
            <h2>All Deceased (<span>{filteredRecords.length}</span>)</h2>
          </ListHeader>

          {/* Filters */}
          <FilterToolbar>
            <FormInput
              $search
              type="text"
              placeholder="Search name or ID..."
              style={{ flex: 1, minWidth: 200 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <FormSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Released">Released</option>
            </FormSelect>
            <FormSelect value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </FormSelect>
            <FormSelect value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </FormSelect>
          </FilterToolbar>

          {/* Table */}
          <TableWrap>
            <StyledTable>
              <thead>
                <tr>
                  <th>Deceased Name</th>
                  <th>Admission No.</th>
                  <th>Date Admitted</th>
                  <th>Days in Morgue</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6}><LoadingState><div className="spinner" /> Loading records...</LoadingState></td></tr>
                ) : filteredRecords.length === 0 ? (
                  <tr><td colSpan={6}><EmptyRow>No records found matching your filters.</EmptyRow></td></tr>
                ) : filteredRecords.map(r => {
                  const name = r.full_name || r.name || 'Unknown';
                  const id = r.deceased_id || r.id;
                  const adm = r.admission_number || r.admission_no || '—';
                  const admitted = r.created_at || r.date_admitted || r.admission_date;
                  const days = getDaysInMorgue(admitted);
                  const status = getStatus(r);
                  const sex = r.sex || r.gender || '';
                  const isFemale = sex.toLowerCase() === 'female';
                  return (
                    <tr key={id} onClick={() => openProfile(id)}>
                      <td>
                        <NameCell>
                          <AvatarSm $female={isFemale}>{getInitials(name)}</AvatarSm>
                          <div>
                            <div style={{ fontWeight: 600 }}>{name}</div>
                            <div className="meta">{sex ? `${sex}, ` : ''}{r.age || '—'} yrs</div>
                          </div>
                        </NameCell>
                      </td>
                      <td>{adm}</td>
                      <td>{formatDate(admitted)}</td>
                      <td>{days} days</td>
                      <td><Badge $active={status === 'Active'} $released={status === 'Released'}>{status}</Badge></td>
                      <td style={{ textAlign: 'right' }}>
                        <Btn $sm onClick={(e) => { e.stopPropagation(); openProfile(id); }}>View Profile</Btn>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </StyledTable>
          </TableWrap>
        </ListCard>

        {/* ─── Export Modal ───────────────────────────────────────── */}
        <ModalOverlay $open={showExport} onClick={() => setShowExport(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h2>Export Data to Excel</h2>
              <CloseBtn onClick={() => setShowExport(false)}>&times;</CloseBtn>
            </ModalHeader>
            <ModalBody>
              <SectionHead $mt0><span>01</span> Select Time Range</SectionHead>
              <FormRow>
                <FormGroup>
                  <FormLabel>Start Date</FormLabel>
                  <ModalInput type="date" value={exportStart} onChange={e => setExportStart(e.target.value)} />
                </FormGroup>
                <FormGroup>
                  <FormLabel>End Date</FormLabel>
                  <ModalInput type="date" value={exportEnd} onChange={e => setExportEnd(e.target.value)} />
                </FormGroup>
              </FormRow>
              <SectionHead $mt4><span>02</span> Export History</SectionHead>
              <div style={{ border: `1px solid ${C.borderLight}`, borderRadius: 6, overflow: 'hidden' }}>
                <DataTable>
                  <thead>
                    <tr>
                      <th>Date Generated</th>
                      <th>Time Range</th>
                      <th>Format</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exportHistory.map((h, i) => (
                      <tr key={i}>
                        <td>{h.date}</td>
                        <td>{h.range}</td>
                        <td>{h.format}</td>
                        <td><StatusTag $success>{h.status}</StatusTag></td>
                        <td><Btn $sm>Download</Btn></td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              </div>
            </ModalBody>
            <ModalFooter>
              <Btn onClick={() => setShowExport(false)}>Cancel</Btn>
              <Btn $export>Generate Export</Btn>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      </AppContainer>
    </>
  );
};

export default DeceasedListPage;