import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { X, Search, Package, Check, Loader2, ChevronLeft, ChevronRight, Image, User, Calendar } from '../../utils/icons/icons';
import axios from 'axios';
import { toast } from 'react-toastify';

// Colors
const Colors = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  success: '#059669',
  successLight: '#ECFDF5',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  background: '#F9FAFB',
  overlay: 'rgba(0, 0, 0, 0.5)',
  warningYellow: '#D97706',
  danger: '#DC2626',
};

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${Colors.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid ${Colors.border};

  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: ${Colors.textPrimary};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: ${Colors.textSecondary};

  &:hover {
    color: ${Colors.textPrimary};
  }
`;

const SearchSection = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${Colors.border};
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${Colors.border};
  border-radius: 6px;
  background: white;

  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 0.875rem;

    &::placeholder {
      color: ${Colors.textSecondary};
    }
  }

  svg {
    color: ${Colors.textSecondary};
    width: 16px;
    height: 16px;
  }
`;

const CoffinGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
  padding: 1rem;
  overflow-y: auto;
  max-height: 40vh;
`;

const CoffinCard = styled.div`
  border: 1px solid ${(props) => (props.selected ? Colors.primary : Colors.border)};
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  position: relative;

  &:hover {
    border-color: ${Colors.primary};
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
  }
`;

const CoffinImageContainer = styled.div`
  height: 140px;
  background: ${Colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid ${Colors.border};
  overflow: hidden;
`;

const CoffinImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const DefaultImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${Colors.textSecondary};
  gap: 0.5rem;

  svg {
    width: 40px;
    height: 40px;
  }

  span {
    font-size: 0.75rem;
  }
`;

const CoffinInfo = styled.div`
  padding: 0.75rem;

  .type {
    font-weight: 600;
    font-size: 0.875rem;
    color: ${Colors.textPrimary};
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .specs {
    font-size: 0.7rem;
    color: ${Colors.textSecondary};
    margin-bottom: 0.5rem;

    span {
      display: block;
      margin-bottom: 0.125rem;
    }
  }

  .price {
    font-weight: 600;
    font-size: 0.8rem;
    color: ${Colors.success};
    margin-bottom: 0.25rem;
  }

  .stock {
    font-size: 0.7rem;
    font-weight: 500;
  }
`;

const SelectedBadge = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: ${Colors.primary};
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  svg {
    width: 14px;
    height: 14px;
  }
`;

const AssignmentForm = styled.div`
  padding: 1rem;
  border-top: 1px solid ${Colors.border};
  border-bottom: 1px solid ${Colors.border};
  background: ${Colors.background};
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const FormGroup = styled.div`
  flex: 1;

  label {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: ${Colors.textSecondary};
    margin-bottom: 0.25rem;

    svg {
      width: 14px;
      height: 14px;
    }
  }

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid ${Colors.border};
    border-radius: 4px;
    font-size: 0.875rem;

    &:focus {
      outline: none;
      border-color: ${Colors.primary};
    }
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-top: 1px solid ${Colors.border};
`;

const Button = styled.button`
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid ${Colors.border};
  background: white;
  color: ${Colors.textPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 120px;

  &:hover:not(:disabled) {
    background: ${Colors.background};
  }

  &.primary {
    background: ${Colors.primary};
    color: white;
    border-color: ${Colors.primary};

    &:hover:not(:disabled) {
      background: #1d4ed8;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const Loader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: ${Colors.primary};
  gap: 0.5rem;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  svg {
    animation: spin 1s linear infinite;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${Colors.textSecondary};

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
  }

  p {
    margin: 0.5rem 0;
  }
`;

// Image Modal for preview
const ImagePreviewModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 2rem;
`;

const PreviewContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
`;

const PreviewClose = styled.button`
  position: absolute;
  top: -40px;
  right: -8px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const NavigationButtons = styled.div`
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  color: white;
`;

const NavButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Default coffin SVG
const DEFAULT_COFFIN_SVG =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjUwIiB5PSIzMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI5MCIgcng9IjQiIGZpbGw9IiNFMEU3RUIiIHN0cm9rZT0iIzk0QTNCOCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik01MCA2MEgxNTBWMTIwSDUwVjYwWiIgZmlsbD0iI0E4QjZDNSIvPgo8cGF0aCBkPSJNNzAgMzBIMTMwTDk1IDkwSDM1TDcwIDMwWiIgZmlsbD0iIzgwOTZBQyIvPgo8cmVjdCB4PSI4NSIgeT0iMTIwIiB3aWR0aD0iMzAiIGhlaWdodD0iMjAiIGZpbGw9IiM4QTlBNzAiLz4KPC9zdmc+Cg==';

const API_URL = 'http://localhost:5000/api/v1/restpoint/coffins';
const ASSIGN_URL = 'http://localhost:5000/api/v1/restpoint/deceased/coffin';

const CoffinSelectionModal = ({ onClose, onSelectCoffin, deceasedId, deceasedData }) => {
  const [coffins, setCoffins] = useState([]);
  const [filteredCoffins, setFilteredCoffins] = useState([]);
  const [selectedCoffin, setSelectedCoffin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Assignment form fields
  const [assignedBy, setAssignedBy] = useState('');
  const [assignedDate, setAssignedDate] = useState(new Date().toISOString().split('T')[0]);

  // Image preview state
  const [previewImages, setPreviewImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Get current user from localStorage - FIXED
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.username || user.email || user.name || 'system';
      }
      return 'system';
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return 'system';
    }
  };

  // Set assigned by on component mount
  useEffect(() => {
    const username = getCurrentUser();
    setAssignedBy(username);
  }, []);

  // Fetch coffins data
  const fetchCoffins = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, { timeout: 10000 });

      if (response.data?.success) {
        const processedCoffins = (response.data.data || [])
          .map((coffin) => {
            let images = [];

            // Handle image_urls as array or string
            if (Array.isArray(coffin.image_urls)) {
              images = coffin.image_urls;
            } else if (typeof coffin.image_urls === 'string' && coffin.image_urls) {
              images = coffin.image_urls
                .split(',')
                .map((url) => url.trim())
                .filter((url) => url);
            }

            // Add images from images array if present
            if (coffin.images && Array.isArray(coffin.images)) {
              images = [...images, ...coffin.images];
            }

            // Remove duplicates and empty values
            images = [...new Set(images)].filter((url) => url && url.trim() !== '');

            return {
              ...coffin,
              images: images,
              primary_image: coffin.primary_image || images[0] || null,
              display_price: coffin.exact_price || coffin.price_kes || 0,
              display_currency: coffin.currency || 'KES',
              stock: coffin.quantity || 0,
            };
          })
          .filter((coffin) => coffin.stock > 0); // Only show coffins in stock

        setCoffins(processedCoffins);
        setFilteredCoffins(processedCoffins);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch coffins');
      }
    } catch (error) {
      console.error('Failed to load coffin data:', error);
      toast.error('Failed to load data from server');
      setCoffins([]);
      setFilteredCoffins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoffins();
  }, [fetchCoffins]);

  // Filter coffins based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCoffins(coffins);
    } else {
      const filtered = coffins.filter(
        (coffin) =>
          coffin.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coffin.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coffin.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coffin.custom_id?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredCoffins(filtered);
    }
  }, [searchTerm, coffins]);

  const handleAssign = async () => {
    if (!selectedCoffin) {
      toast.error('Please select a coffin');
      return;
    }

    if (!deceasedData?.full_name) {
      toast.error('Deceased name is required');
      return;
    }

    setAssigning(true);
    try {
      const payload = {
        deceased_id: deceasedId,
        coffin_id: selectedCoffin.coffin_id,
        deceased_name: deceasedData.full_name,
        assigned_by: assignedBy || 'system', // Use assignedBy state or fallback to 'system'
        assigned_date: assignedDate,
      };

      console.log('📦 Assigning coffin with payload:', payload);

      const response = await axios.post(ASSIGN_URL, payload);

      if (response.data?.success) {
        toast.success(`✅ Coffin assigned successfully! RFID: ${response.data.rfid}`);
        onSelectCoffin(response.data);
      } else {
        throw new Error(response.data?.message || 'Assignment failed');
      }
    } catch (error) {
      console.error('Error assigning coffin:', error);
      toast.error(error.response?.data?.message || 'Failed to assign coffin');
    } finally {
      setAssigning(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return DEFAULT_COFFIN_SVG;

    try {
      if (imagePath.startsWith('http')) {
        return imagePath;
      }

      let cleanPath = imagePath.trim();
      cleanPath = cleanPath.replace(/\/\/+/g, '/');

      if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath;
      }

      return `http://localhost:5000${cleanPath}`;
    } catch (error) {
      console.error('Error creating image URL:', error);
      return DEFAULT_COFFIN_SVG;
    }
  };

  const openImagePreview = (images, index, e) => {
    e.stopPropagation();
    if (images && images.length > 0) {
      setPreviewImages(images);
      setCurrentImageIndex(index);
      setShowPreview(true);
    }
  };

  const nextImage = () => {
    if (currentImageIndex < previewImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <>
      <ModalOverlay onClick={onClose}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <h2>
              <Package size={18} />
              Select Coffin for {deceasedData?.full_name || 'Deceased'}
            </h2>
            <CloseButton onClick={onClose}>
              <X size={18} />
            </CloseButton>
          </ModalHeader>

          <SearchSection>
            <SearchInput>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by type, material, supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchInput>
          </SearchSection>

          {loading ? (
            <Loader>
              <Loader2 size={20} />
              <span>Loading coffins...</span>
            </Loader>
          ) : filteredCoffins.length === 0 ? (
            <EmptyState>
              <Package size={48} />
              <p>No coffins in stock</p>
              {searchTerm && <p style={{ fontSize: '0.875rem' }}>Try adjusting your search</p>}
            </EmptyState>
          ) : (
            <CoffinGrid>
              {filteredCoffins.map((coffin) => {
                const isSelected = selectedCoffin?.coffin_id === coffin.coffin_id;
                const images = coffin.images || [];
                const hasImages = images.length > 0;
                const stock = coffin.stock || 0;

                return (
                  <CoffinCard
                    key={coffin.coffin_id}
                    selected={isSelected}
                    onClick={() => setSelectedCoffin(coffin)}
                  >
                    <CoffinImageContainer>
                      {hasImages ? (
                        <CoffinImage
                          src={getImageUrl(images[0])}
                          alt={coffin.type}
                          onClick={(e) => openImagePreview(images, 0, e)}
                          onError={(e) => {
                            e.target.src = DEFAULT_COFFIN_SVG;
                          }}
                        />
                      ) : (
                        <DefaultImage>
                          <ImageIcon size={32} />
                          <span>No image</span>
                        </DefaultImage>
                      )}
                    </CoffinImageContainer>

                    {isSelected && (
                      <SelectedBadge>
                        <Check size={14} />
                      </SelectedBadge>
                    )}

                    <CoffinInfo>
                      <div className="type">{coffin.type || 'Unknown Type'}</div>
                      <div className="specs">
                        <span>
                          <strong>Material:</strong> {coffin.material || 'N/A'}
                        </span>
                        <span>
                          <strong>Size:</strong> {coffin.size || 'N/A'}
                        </span>
                        <span>
                          <strong>Color:</strong> {coffin.color || 'N/A'}
                        </span>
                        <span>
                          <strong>ID:</strong> {coffin.custom_id || coffin.coffin_id}
                        </span>
                      </div>
                      <div className="price">
                        {coffin.display_currency}{' '}
                        {parseInt(coffin.display_price || 0).toLocaleString()}
                      </div>
                      <div
                        className="stock"
                        style={{
                          color: stock > 5 ? '#059669' : stock > 0 ? '#D97706' : '#DC2626',
                        }}
                      >
                        Stock: {stock} available
                      </div>
                    </CoffinInfo>
                  </CoffinCard>
                );
              })}
            </CoffinGrid>
          )}

          {selectedCoffin && (
            <AssignmentForm>
              <FormRow>
                <FormGroup>
                  <label>
                    <User size={14} />
                    Assigned By
                  </label>
                  <input
                    type="text"
                    value={assignedBy}
                    onChange={(e) => setAssignedBy(e.target.value)}
                    placeholder="Username"
                  />
                </FormGroup>
                <FormGroup>
                  <label>
                    <Calendar size={14} />
                    Assignment Date
                  </label>
                  <input
                    type="date"
                    value={assignedDate}
                    onChange={(e) => setAssignedDate(e.target.value)}
                  />
                </FormGroup>
              </FormRow>
            </AssignmentForm>
          )}

          <ModalFooter>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              className="primary"
              onClick={handleAssign}
              disabled={!selectedCoffin || assigning}
            >
              {assigning ? (
                <>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Assigning...
                </>
              ) : (
                <>
                  <Check size={14} />
                  Assign Coffin
                </>
              )}
            </Button>
          </ModalFooter>
        </ModalContainer>
      </ModalOverlay>

      {/* Image Preview Modal */}
      {showPreview && previewImages.length > 0 && (
        <ImagePreviewModal onClick={() => setShowPreview(false)}>
          <PreviewContent onClick={(e) => e.stopPropagation()}>
            <PreviewClose onClick={() => setShowPreview(false)}>
              <X size={18} />
            </PreviewClose>
            <PreviewImage
              src={getImageUrl(previewImages[currentImageIndex])}
              alt={`Coffin image ${currentImageIndex + 1}`}
              onError={(e) => {
                e.target.src = DEFAULT_COFFIN_SVG;
              }}
            />
            {previewImages.length > 1 && (
              <NavigationButtons>
                <NavButton onClick={prevImage} disabled={currentImageIndex === 0}>
                  <ChevronLeft size={16} />
                </NavButton>
                <span>
                  {currentImageIndex + 1} / {previewImages.length}
                </span>
                <NavButton
                  onClick={nextImage}
                  disabled={currentImageIndex === previewImages.length - 1}
                >
                  <ChevronRight size={16} />
                </NavButton>
              </NavigationButtons>
            )}
          </PreviewContent>
        </ImagePreviewModal>
      )}
    </>
  );
};

export default CoffinSelectionModal;
