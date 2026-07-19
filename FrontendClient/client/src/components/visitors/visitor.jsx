// src/assets/components/user/RegisterVisitor.js
import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  UserPlus,
  Phone,
  Heart,
  FileText,
  Search,
  CheckCircle,
  XCircle,
  Users,
  Loader2,
  List,
  Eye,
  Info,
  Eraser,
  Calendar,
  Clock,
  Mail,
  MapPin,
  History,
  UserCheck,
} from 'lucide-react';
import { Form, Row, Col, InputGroup, Tabs, Tab, Badge, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CoolLoader, { GlobalLoaderStyles } from '../loader/loader';
// --- Color Palette (Consistent with sleek App.js) ---
const Colors = {
  primaryDark: '#2C3E50',
  accentTeal: '#00B894',
  accentOrange: '#FFA500',
  white: '#F8F9FA',
  lightGray: '#F2F4F7',
  mediumGray: '#BDC3C7',
  darkGray: '#34495E',
  successGreen: '#28A745',
  dangerRed: '#DC3545',
  infoBlue: '#DC3545',
  inputBorder: '#CED4DA',
  inputFocus: '#00B894',
  warningYellow: '#FFC107',
};

// --- Keyframe Animations (Consistent with App.js) ---
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// --- Styled Components ---

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: ${Colors.lightGray};

  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  animation: ${fadeIn} 0.6s ease-out;
  font-family: 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
`;

const Card = styled.div`
  background-color: ${Colors.white};
  border-radius: 1rem;
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
  padding: 0.9rem;
  width: 100%;
  max-width: 1400px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    transform: translateY(-0.4rem);
    box-shadow: 0 18px 35px -10px rgba(0, 0, 0, 0.15);
  }
`;

const PageHeader = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${Colors.primaryDark};
  margin-bottom: 2.5rem;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  letter-spacing: -0.03em;

  svg {
    margin-right: 0.8rem;
    color: ${Colors.accentTeal};
    font-size: 2.8rem;
  }
`;

const StyledFormGroup = styled(Form.Group)`
  margin-bottom: 1.5rem;

  label {
    font-weight: 700;
    color: ${Colors.darkGray};
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1rem;

    svg {
      color: ${Colors.accentOrange};
      font-size: 1.1rem;
    }
  }

  .form-control {
    border-radius: 0.5rem;
    border: 1px solid ${Colors.inputBorder};
    padding: 0.8rem 1rem;
    font-size: 0.95rem;
    transition: all 0.2s ease-in-out;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);

    &:focus {
      border-color: ${Colors.accentTeal};
      box-shadow: 0 0 0 0.25rem rgba(0, 184, 148, 0.25);
      outline: none;
    }

    &:disabled {
      background-color: ${Colors.lightGray};
    }
  }

  textarea.form-control {
    min-height: 100px;
    resize: vertical;
  }
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 1.8rem;
  border-radius: 0.6rem;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  background-color: ${Colors.accentTeal};
  color: ${Colors.white};
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 250%;
    height: 250%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transition: all 0.4s ease-out;
    transform: translate(-50%, -50%) scale(0);
  }

  &:hover {
    background-color: #0097a7;
    transform: translateY(-2px);
    box-shadow: 0 9px 16px rgba(0, 0, 0, 0.15);
    &:before {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0;
    }
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  svg {
    margin-right: 0.7rem;
    font-size: 1.4rem;
  }
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.6rem;
  border-radius: 0.6rem;
  font-size: 1rem;
  font-weight: 600;
  color: ${Colors.dangerRed};
  background-color: ${Colors.dangerRed + '10'};
  border: 1px solid ${Colors.dangerRed};
  transition: all 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: ${Colors.dangerRed};
    color: ${Colors.white};
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(220, 53, 69, 0.2);
  }
  svg {
    margin-right: 0.7rem;
    font-size: 1.2rem;
  }
`;

const SearchContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: ${Colors.lightGray};
  border-radius: 0.8rem;
  border: 1px solid ${Colors.mediumGray + '40'};
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const SelectedDeceasedCard = styled.div`
  background-color: ${Colors.accentTeal + '15'};
  border: 1px solid ${Colors.accentTeal};
  border-radius: 0.8rem;
  padding: 1.5rem;
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: ${fadeIn} 0.5s ease-out;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.2rem;
    font-weight: 600;
    color: ${Colors.darkGray};
    border-bottom: 1px solid ${Colors.mediumGray + '40'};
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;

    svg {
      color: ${Colors.accentTeal};
      margin-right: 0.5rem;
    }
  }

  .info-item {
    font-size: 1rem;
    color: ${Colors.darkGray};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem 0;

    .label {
      font-weight: 700;
      color: ${Colors.primaryDark};
    }
    .value {
      font-weight: 900;
      color: ${Colors.darkGray};
    }
  }
`;

const SearchInputGroup = styled(InputGroup)`
  position: relative;
  margin-bottom: 1.5rem;

  .form-control {
    padding-left: 2.8rem;
  }

  .input-group-text {
    background-color: transparent;
    border: none;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    color: ${Colors.mediumGray};
    padding-left: 1rem;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: ${Colors.mediumGray};
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${Colors.darkGray};
    transform: scale(1.1);
  }
`;

const DeceasedListWrapper = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid ${Colors.mediumGray + '60'};
  border-radius: 0.8rem;
  background-color: ${Colors.white};
  padding: 0.5rem;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: ${Colors.darkGray};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${Colors.mediumGray};
    border-radius: 4px;
    &:hover {
      background: ${Colors.darkGray};
    }
  }
`;

const DeceasedItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  margin-bottom: 0.3rem;
  border-radius: 0.6rem;
  background-color: ${(props) => (props.selected ? Colors.accentTeal + '15' : Colors.white)};
  border: 1px solid ${(props) => (props.selected ? Colors.accentTeal : 'transparent')};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: ${(props) => (props.selected ? Colors.accentTeal + '25' : Colors.lightGray)};
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  }

  .info {
    flex-grow: 1;
    color: ${Colors.darkGray};
  }

  .name {
    font-weight: 700;
    font-size: 1rem;
    margin-bottom: 0.2rem;
  }

  .details {
    font-size: 0.85rem;
    color: ${Colors.mediumGray};
  }

  .select-icon {
    margin-left: 1rem;
    color: ${(props) => (props.selected ? Colors.accentTeal : Colors.mediumGray)};
  }
`;

const Details = styled.div`
  font-weight: 800;
  color: ${Colors.primaryDark};
`;

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: ${Colors.darkGray};

  svg {
    animation: ${spin} 1.5s linear infinite;
    margin-bottom: 1rem;
    color: ${Colors.primaryDark};
  }
`;

// New styled components for online bookings and recent visitors
const OnlineBookingsContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: ${Colors.lightGray};
  border-radius: 0.8rem;
  border: 1px solid ${Colors.mediumGray + '40'};
`;

const RecentVisitorsContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: ${Colors.lightGray};
  border-radius: 0.8rem;
  border: 1px solid ${Colors.mediumGray + '40'};
`;

const BookingCard = styled.div`
  background-color: ${Colors.white};
  border-radius: 0.8rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-left: 4px solid ${props =>
    props.status === 'confirmed' ? Colors.successGreen :
      props.status === 'pending' ? Colors.warningYellow :
        Colors.infoBlue
  };
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  animation: ${slideIn} 0.3s ease-out;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const BookingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;

  .booking-info {
    flex: 1;
  }

  .booking-name {
    font-size: 1.2rem;
    font-weight: 700;
    color: ${Colors.primaryDark};
    margin-bottom: 0.5rem;
  }

  .booking-deceased {
    font-size: 1rem;
    color: ${Colors.darkGray};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .booking-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const BookingDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;

  .detail-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: ${Colors.darkGray};

    svg {
      color: ${Colors.accentOrange};
    }

    .label {
      font-weight: 600;
      color: ${Colors.primaryDark};
    }
  }
`;

const BookingActions = styled.div`
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &.primary {
    background-color: ${Colors.accentTeal};
    color: ${Colors.white};

    &:hover {
      background-color: #0097a7;
    }
  }

  &.secondary {
    background-color: ${Colors.mediumGray + '20'};
    color: ${Colors.darkGray};

    &:hover {
      background-color: ${Colors.mediumGray + '40'};
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StyledTabs = styled(Tabs)`
  .nav-tabs {
    border-bottom: 2px solid ${Colors.lightGray};
    margin-bottom: 2rem;

    .nav-link {
      border: none;
      color: ${Colors.darkGray};
      font-weight: 600;
      padding: 1rem 2rem;
      margin-right: 0.5rem;
      border-radius: 0.5rem 0.5rem 0 0;
      transition: all 0.2s ease;

      &:hover {
        border: none;
        background-color: ${Colors.lightGray};
      }

      &.active {
        background-color: ${Colors.accentTeal};
        color: ${Colors.white};
        border: none;
      }
    }
  }
`;

const StyledTable = styled(Table)`
  background-color: ${Colors.white};
  border-radius: 0.8rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  thead th {
    background-color: ${Colors.primaryDark};
    color: ${Colors.white};
    border: none;
    padding: 1rem;
    font-weight: 700;
  }

  tbody td {
    padding: 1rem;
    border-bottom: 1px solid ${Colors.lightGray};
    vertical-align: middle;
  }

  tbody tr {
    transition: all 0.2s ease;

    &:hover {
      background-color: ${Colors.lightGray};
    }

    &:last-child td {
      border-bottom: none;
    }
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  background-color: ${Colors.infoBlue};
  color: ${Colors.white};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #0056b3;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const RegisterVisitor = () => {
  const [visitorData, setVisitorData] = useState({
    full_name: '',
    contact: '',
    relationship: '',
    deceased_id: '',
    purpose_of_visit: '',
  });
  const [allDeceased, setAllDeceased] = useState([]);
  const [filteredDeceased, setFilteredDeceased] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeceased, setSelectedDeceased] = useState(null);
  const [loadingDeceased, setLoadingDeceased] = useState(true);
  const [loadingVisitorRegistration, setLoadingVisitorRegistration] = useState(false);
  const [onlineBookings, setOnlineBookings] = useState([]);
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const [activeTab, setActiveTab] = useState('register');

  // Fetch all deceased records on component mount
  useEffect(() => {
    const fetchDeceasedRecords = async () => {
      setLoadingDeceased(true);
      try {
        const response = await fetch('http://localhost:5000/api/v1/restpoint/deceased/deceased-all');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        const flattenedData = Array.isArray(result.data) ? result.data : [];
        setAllDeceased(flattenedData);
        setFilteredDeceased(flattenedData);
      } catch (err) {
        console.error('Error fetching deceased records:', err);
        toast.error('Failed to load deceased records. Please ensure the backend is running and accessible.');
      } finally {
        setLoadingDeceased(false);
      }
    };
    fetchDeceasedRecords();
  }, []);

  // Fetch data when active tab changes
  useEffect(() => {
    if (activeTab === 'online') {
      fetchOnlineBookings();
    } else if (activeTab === 'recent') {
      fetchRecentVisitors();
    }
  }, [activeTab]);

  const fetchOnlineBookings = async () => {
    setLoadingBookings(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/restpoint/online-bookings');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setOnlineBookings(result.data || []);
    } catch (err) {
      console.error('Error fetching online bookings:', err);
      toast.error('Failed to load online bookings.');
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchRecentVisitors = async () => {
    setLoadingVisitors(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/restpoint/recent-visitors');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setRecentVisitors(result.data || []);
    } catch (err) {
      console.error('Error fetching recent visitors:', err);
      toast.error('Failed to load recent visitors.');
    } finally {
      setLoadingVisitors(false);
    }
  };

  // Debounced search logic for better performance
  const handleSearch = useCallback((term) => {
    if (!term) {
      setFilteredDeceased(allDeceased);
      return;
    }
    const lowerCaseSearchTerm = term.toLowerCase();
    const filtered = allDeceased.filter(
      (deceased) =>
        (deceased.full_name && deceased.full_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (deceased.admission_number && deceased.admission_number.toLowerCase().includes(lowerCaseSearchTerm))
    );
    setFilteredDeceased(filtered);
  }, [allDeceased]);

  useEffect(() => {
    const handler = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, handleSearch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVisitorData({ ...visitorData, [name]: value });
  };

  const handleDeceasedSelect = (deceased) => {
    setSelectedDeceased(deceased);
    setVisitorData((prevData) => ({
      ...prevData,
      deceased_id: deceased.deceased_id,
    }));
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredDeceased(allDeceased);
  };

  const handleRemoveSelection = () => {
    setSelectedDeceased(null);
    setVisitorData((prevData) => ({ ...prevData, deceased_id: '' }));
    setSearchTerm('');
    setFilteredDeceased(allDeceased);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingVisitorRegistration(true);

    if (!selectedDeceased) {
      toast.error('Please select a deceased person to visit.');
      setLoadingVisitorRegistration(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/v1/restpoint/register-visitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitorData),
      });

      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(errorDetail.message || 'Failed to register visitor.');
      }

      const result = await response.json();
      toast.success(result.message || 'Visitor registered successfully!');

      // Reset form after successful submission
      setVisitorData({
        full_name: '',
        contact: '',
        relationship: '',
        deceased_id: '',
        purpose_of_visit: '',
      });
      setSelectedDeceased(null);
      setSearchTerm('');
      setFilteredDeceased(allDeceased);

      // Refresh recent visitors if on that tab
      if (activeTab === 'recent') {
        fetchRecentVisitors();
      }
    } catch (err) {
      console.error('Error registering visitor:', err);
      toast.error(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setLoadingVisitorRegistration(false);
    }
  };

  const handleProcessBooking = async (bookingId, action) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/restpoint/process-booking/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('Failed to process booking');
      }

      const result = await response.json();
      toast.success(result.message || 'Booking processed successfully!');

      // Refresh bookings list
      fetchOnlineBookings();
    } catch (err) {
      console.error('Error processing booking:', err);
      toast.error(err.message || 'Failed to process booking.');
    }
  };

  const renderOnlineBookings = () => {
    if (loadingBookings) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <CoolLoader
            type="spinner"
            color="primary"
            text="Loading online bookings..."
            size="large"
          />
        </div>
      );
    }

    if (onlineBookings.length === 0) {
      return (
        <div className="text-center p-4">
          <Info size={48} color={Colors.mediumGray} />
          <h4 className="mt-3 text-muted">No Online Bookings</h4>
          <p className="text-muted">There are no online visitor bookings at the moment.</p>
        </div>
      );
    }

    return onlineBookings.map((booking) => (
      <BookingCard key={booking.id} status={booking.status}>
        <BookingHeader>
          <div className="booking-info">
            <div className="booking-name">
              {booking.full_name}
            </div>
            <div className="booking-deceased">
              <UserPlus size={16} />
              Visiting: {booking.deceased_name || 'N/A'}
            </div>
          </div>
          <div className="booking-status">
            <Badge
              bg={
                booking.status === 'confirmed' ? 'success' :
                  booking.status === 'pending' ? 'warning' : 'info'
              }
            >
              {booking.status?.toUpperCase()}
            </Badge>
          </div>
        </BookingHeader>

        <BookingDetails>
          <div className="detail-item">
            <Phone size={16} />
            <span className="label">Contact:</span>
            <span>{booking.contact}</span>
          </div>
          <div className="detail-item">
            <Mail size={16} />
            <span className="label">Email:</span>
            <span>{booking.email || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <Calendar size={16} />
            <span className="label">Visit Date:</span>
            <span>{new Date(booking.visit_date).toLocaleDateString()}</span>
          </div>
          <div className="detail-item">
            <Clock size={16} />
            <span className="label">Visit Time:</span>
            <span>{booking.visit_time}</span>
          </div>
          <div className="detail-item">
            <FileText size={16} />
            <span className="label">Purpose:</span>
            <span>{booking.purpose_of_visit}</span>
          </div>
          <div className="detail-item">
            <MapPin size={16} />
            <span className="label">Deceased ID:</span>
            <span>{booking.deceased_id}</span>
          </div>
        </BookingDetails>

        <BookingActions>
          {booking.status === 'pending' && (
            <>
              <ActionButton
                className="primary"
                onClick={() => handleProcessBooking(booking.id, 'confirm')}
              >
                <CheckCircle size={16} />
                Confirm
              </ActionButton>
              <ActionButton
                className="secondary"
                onClick={() => handleProcessBooking(booking.id, 'reject')}
              >
                <XCircle size={16} />
                Reject
              </ActionButton>
            </>
          )}
          {booking.status === 'confirmed' && (
            <ActionButton
              className="primary"
              onClick={() => handleProcessBooking(booking.id, 'checkin')}
            >
              <UserPlus size={16} />
              Check In
            </ActionButton>
          )}
        </BookingActions>
      </BookingCard>
    ));
  };

  const renderRecentVisitors = () => {
    if (loadingVisitors) {
      return (
        <LoaderContainer>
          <Loader2 size={40} />
          <span>Loading recent visitors...</span>
        </LoaderContainer>
      );
    }

    if (recentVisitors.length === 0) {
      return (
        <div className="text-center p-4">
          <Info size={48} color={Colors.mediumGray} />
          <h4 className="mt-3 text-muted">No Recent Visitors</h4>
          <p className="text-muted">There are no recent visitor records.</p>
        </div>
      );
    }

    return (
      <>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Recent Registered Visitors</h5>
          <RefreshButton onClick={fetchRecentVisitors} disabled={loadingVisitors}>
            <Loader2 size={16} className={loadingVisitors ? 'animate-spin' : ''} />
            Refresh
          </RefreshButton>
        </div>
        <StyledTable responsive>
          <thead>
            <tr>
              <th>Visitor Name</th>
              <th>Contact</th>
              <th>Relationship</th>
              <th>Purpose</th>
              <th>Deceased</th>
              <th>Check-in Time</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {recentVisitors.map((visitor) => (
              <tr key={visitor.visitor_id}>
                <td>
                  <div className="d-flex align-items-center">
                    <UserCheck size={16} className="me-2" color={Colors.accentTeal} />
                    <strong>{visitor.full_name}</strong>
                  </div>
                </td>
                <td>{visitor.contact}</td>
                <td>
                  <Badge bg="info">{visitor.relationship}</Badge>
                </td>
                <td>{visitor.reason_for_visit}</td>
                <td>
                  <div>
                    <div><strong>{visitor.deceased_name}</strong></div>
                    <small className="text-muted">ID: {visitor.deceased_id}</small>
                  </div>
                </td>
                <td>
                  {new Date(visitor.check_in_time).toLocaleString()}
                </td>
                <td>
                  <Badge
                    bg={visitor.visitor_type === 'walk-in' ? 'primary' : 'success'}
                  >
                    {visitor.visitor_type?.toUpperCase()}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </>
    );
  };

  return (
    <PageContainer>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Card>
        <PageHeader>
          <Users /> Visitor Management
        </PageHeader>

        <StyledTabs
          activeKey={activeTab}
          onSelect={(tab) => setActiveTab(tab)}
          className="mb-3"
        >
          <Tab eventKey="register" title="Register Visitor">
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <StyledFormGroup controlId="formFullName">
                    <Form.Label><UserPlus /> Visitor's Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="full_name"
                      value={visitorData.full_name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      required
                    />
                  </StyledFormGroup>
                </Col>
                <Col md={6}>
                  <StyledFormGroup controlId="formContact">
                    <Form.Label><Phone /> Contact Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="contact"
                      value={visitorData.contact}
                      onChange={handleInputChange}
                      placeholder="e.g., 0712345678"
                      required
                    />
                  </StyledFormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <StyledFormGroup controlId="formRelationship">
                    <Form.Label><Heart /> Relationship to Deceased</Form.Label>
                    <Form.Control
                      type="text"
                      name="relationship"
                      value={visitorData.relationship}
                      onChange={handleInputChange}
                      placeholder="e.g., Sister, Friend, Son"
                      required
                    />
                  </StyledFormGroup>
                </Col>
                <Col md={6}>
                  <StyledFormGroup controlId="formPurpose">
                    <Form.Label><FileText /> Purpose of Visit</Form.Label>
                    <Form.Control
                      as="input"
                      type="text"
                      list="visit-reasons"
                      name="purpose_of_visit"
                      value={visitorData.purpose_of_visit}
                      onChange={handleInputChange}
                      placeholder="e.g., Body Viewing, Funeral Arrangements, Prayers"
                      autoComplete="on"
                      spellCheck="true"
                      required
                    />
                    <datalist id="visit-reasons">
                      <option value="Body Viewing" />
                      <option value="Funeral Arrangements" />
                      <option value="Prayers" />
                      <option value="Document Pickup" />
                      <option value="Identification of Body" />
                    </datalist>
                  </StyledFormGroup>
                </Col>
              </Row>

              <SearchContainer>
                {selectedDeceased ? (
                  <SelectedDeceasedCard>
                    <div className="header">
                      <div><CheckCircle /> Selected Deceased</div>
                      <SecondaryButton type="button" onClick={handleRemoveSelection}>
                        <Eraser /> Remove Selection
                      </SecondaryButton>
                    </div>
                    <div className="info-item">
                      <div className="label">Name:</div>
                      <div className="value">{selectedDeceased.full_name || 'N/A'}</div>
                    </div>
                    <div className="info-item">
                      <div className="label">Deceased ID:</div>
                      <div className="value">{selectedDeceased.deceased_id || 'N/A'}</div>
                    </div>
                    <div className="info-item">
                      <div className="label">Admission No:</div>
                      <div className="value">{selectedDeceased.admission_number || 'N/A'}</div>
                    </div>
                    <div className="info-item">
                      <div className="label">Date of Death:</div>
                      <div className="value">{selectedDeceased.date_of_death || 'N/A'}</div>
                    </div>
                  </SelectedDeceasedCard>
                ) : (
                  <>
                    <PageHeader style={{ marginTop: '0', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
                      <List /> Select Deceased to Visit
                    </PageHeader>

                    <SearchInputGroup className="mb-3">
                      <InputGroup.Text><Search /></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search deceased by name or admission number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <InputGroup.Text>
                          <ClearButton type="button" onClick={handleClearSearch} title="Clear search">
                            <XCircle size={20} />
                          </ClearButton>
                        </InputGroup.Text>
                      )}
                    </SearchInputGroup>

                    {loadingDeceased ? (
                      <LoaderContainer>
                        <Loader2 size={40} />
                        <span>Loading deceased records...</span>
                      </LoaderContainer>
                    ) : filteredDeceased.length === 0 ? (
                      <div className="text-center p-3">
                        <Info size={32} color={Colors.mediumGray} />
                        <p className="mt-2 text-muted">No deceased found matching your search.</p>
                      </div>
                    ) : (
                      <DeceasedListWrapper>
                        {filteredDeceased.map((deceased) => (
                          <DeceasedItem
                            key={deceased.deceased_id}
                            selected={selectedDeceased && selectedDeceased.deceased_id === deceased.deceased_id}
                            onClick={() => handleDeceasedSelect(deceased)}
                          >
                            <div className="info">
                              <div className="name">{deceased.full_name || 'N/A'}</div>
                              <div className="Details">
                                Admission No: {deceased.admission_number || 'N/A'} | Date of Death: {deceased.date_of_death || 'N/A'}
                              </div>
                            </div>
                            <div className="select-icon">
                              {selectedDeceased && selectedDeceased.deceased_id === deceased.deceased_id ? (
                                <CheckCircle size={24} />
                              ) : (
                                <Eye size={24} />
                              )}
                            </div>
                          </DeceasedItem>
                        ))}
                      </DeceasedListWrapper>
                    )}
                  </>
                )}
              </SearchContainer>

              <div className="d-flex justify-content-start mt-4">
                <PrimaryButton type="submit" disabled={loadingVisitorRegistration || !selectedDeceased}>
                  {loadingVisitorRegistration ? <Loader2 className="animate-spin" /> : <UserPlus />}
                  {loadingVisitorRegistration ? 'Registering...' : 'Register Visitor'}
                </PrimaryButton>
              </div>
            </Form>
          </Tab>

          <Tab eventKey="online" title="Online Bookings">
            <OnlineBookingsContainer>
              <PageHeader style={{ marginTop: '0', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
                <Calendar /> Online Visitor Bookings
              </PageHeader>
              {renderOnlineBookings()}
            </OnlineBookingsContainer>
          </Tab>

          <Tab eventKey="recent" title="Recent Visitors">
            <RecentVisitorsContainer>
              <PageHeader style={{ marginTop: '0', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
                <History /> Recent Registered Visitors
              </PageHeader>
              {renderRecentVisitors()}
            </RecentVisitorsContainer>
          </Tab>
        </StyledTabs>
      </Card>
    </PageContainer>
  );
};

export default RegisterVisitor;