import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
    Package, Home, ChevronDown, DollarSign, Tag, Layers,
    Maximize2, Diamond, Eye, Calendar, User, Truck, Clock,
    Star, Share2, Heart, ArrowLeft, Edit, Trash2,
    CheckCircle, XCircle, AlertTriangle, Info, Image as ImageIcon,
    ChevronLeft, ChevronRight, X, Loader2, ShoppingBag,
    Warehouse, BarChart3, Users, Save, PlusCircle
} from 'lucide-react';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import env from '../../config/env';

// ─── Color Palette (Elegant Vintage) ───────────────────────────────────────
const Colors = {
    ink: '#15171A',
    bone: '#FAF8F4',
    bone2: '#F3EFE6',
    brass: '#8B7355',
    brassHover: '#A98F6E',
    brassLight: '#C4B89A',
    verdigris: '#3D4F47',
    verdigrisDark: '#2E3F37',
    line: '#E3DDD0',
    lineDark: '#2C2F33',
    gray: '#6B6862',
    grayLight: 'rgba(250,248,244,0.62)',
    red: '#9B4A3F',
    redBg: '#F7ECE9',
    redLine: '#E8D2CC',
    white: '#FFFFFF',
    success: '#475A43',
    successBg: '#EEF3EC',
    successLine: '#DCE6D9',
    shadow: 'rgba(21,23,26,0.12)',
    overlay: 'rgba(21,23,26,0.88)',
    textMuted: '#8B8882',
    darkGray: '#2C2F33',
    primaryDark: '#15171A',
    accentTeal: '#3D4F47',
    infoBlue: '#5B7B8A',
    dangerRed: '#9B4A3F',
    mediumGray: '#E3DDD0',
    lightGray: '#F3EFE6',
    successGreen: '#475A43',
    warningAmber: '#A68B5B',
    warningBg: '#F8F3E8',
    warningLine: '#EDE4D0',
};

// ─── Animations ────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-10px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideInFromTop = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// ─── Styled Components ─────────────────────────────────────────────────────

const PageContainer = styled.div`
  background: ${Colors.bone};
  min-height: 100vh;
  padding: 1.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

const BreadcrumbNav = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: ${Colors.gray};
  flex-wrap: wrap;

  a {
    color: ${Colors.brass};
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    transition: color 0.2s;

    &:hover { color: ${Colors.brassHover}; }
  }

  span { color: ${Colors.textMuted}; }
  svg { width: 14px; height: 14px; }
  .separator { color: ${Colors.mediumGray}; }
`;

const Card = styled.div`
  background: ${Colors.white};
  border-radius: 1.25rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid ${Colors.mediumGray};
  overflow: hidden;
  animation: ${fadeIn} 0.6s ease-out;
  margin-bottom: 1.5rem;
`;

const CardHeader = styled.div`
  background: linear-gradient(135deg, ${Colors.ink} 0%, ${Colors.verdigrisDark} 100%);
  color: ${Colors.bone};
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  border-bottom: 1px solid ${Colors.lineDark};

  @media (max-width: 768px) {
    padding: 1rem;
    flex-direction: column;
    align-items: stretch;
  }
`;

const CardBody = styled.div`
  padding: 1.5rem;

  @media (max-width: 768px) { padding: 1rem; }
  @media (max-width: 576px) { padding: 0.75rem; }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.2);
  color: ${Colors.bone};
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    background: rgba(255,255,255,0.25);
    transform: translateX(-3px);
  }

  svg { width: 16px; height: 16px; }
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  h4 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    letter-spacing: 0.5px;
  }

  svg { color: ${Colors.brassLight}; width: 24px; height: 24px; }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid ${Colors.mediumGray};
  background: ${Colors.white};
  color: ${Colors.darkGray};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 38px;
  white-space: nowrap;
  font-family: inherit;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-color: ${Colors.brass};
  }
  &:active { transform: translateY(0); }
  &:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
  svg { width: 16px; height: 16px; }

  &.ghost {
    background: transparent;
    border-color: transparent;
    color: ${Colors.bone};
    &:hover { background: rgba(255,255,255,0.1); border-color: transparent; transform: none; box-shadow: none; }
  }

  &.primary {
    background: linear-gradient(135deg, ${Colors.brass} 0%, ${Colors.brassHover} 100%);
    color: ${Colors.white};
    border-color: transparent;
    box-shadow: 0 4px 6px -1px rgba(139, 115, 85, 0.3);
    &:hover { box-shadow: 0 10px 20px -5px rgba(139, 115, 85, 0.4); border-color: transparent; }
  }

  &.danger {
    background: linear-gradient(135deg, ${Colors.red} 0%, #7A3A30 100%);
    color: white;
    border-color: transparent;
    &:hover { box-shadow: 0 10px 20px -5px rgba(155, 74, 63, 0.3); border-color: transparent; }
  }

  &.sm { padding: 0.375rem 0.75rem; font-size: 0.8125rem; min-height: 32px; svg { width: 14px; height: 14px; } }
`;

// ─── Product Gallery ───────────────────────────────────────────────────────

const ProductLayout = styled.div`
  display: grid;
  grid-template-columns: 5fr 7fr;
  gap: 1.5rem;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const GallerySection = styled.div`
  padding: 0;
`;

const GalleryCard = styled.div`
  background: ${Colors.bone2};
  border-radius: 1rem;
  padding: 1.25rem;
  border: 1px solid ${Colors.mediumGray};
`;

const GalleryTitle = styled.h6`
  font-size: 0.9375rem;
  font-weight: 700;
  color: ${Colors.ink};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg { width: 16px; height: 16px; color: ${Colors.brass}; }
`;

const MainImage = styled.div`
  width: 100%;
  height: 350px;
  border-radius: 0.875rem;
  overflow: hidden;
  border: 2px solid ${Colors.mediumGray};
  background: ${Colors.white};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img { transform: scale(1.05); }

  svg { color: ${Colors.textMuted}; width: 64px; height: 64px; }

  @media (max-width: 768px) { height: 250px; }
  @media (max-width: 576px) { height: 200px; }
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
`;

const Thumbnail = styled.div`
  width: 100%;
  height: 80px;
  border-radius: 0.625rem;
  overflow: hidden;
  border: 2px solid ${props => props.$active ? Colors.brass : Colors.mediumGray};
  background: ${Colors.white};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover { border-color: ${Colors.brass}; }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg { color: ${Colors.textMuted}; width: 24px; height: 24px; }

  @media (max-width: 576px) { height: 60px; }
`;

// ─── Product Details ───────────────────────────────────────────────────────

const DetailsSection = styled.div`
  padding: 0;
`;

const ProductTitle = styled.h3`
  font-size: 1.375rem;
  font-weight: 800;
  color: ${Colors.ink};
  margin: 0 0 1.5rem 0;
  line-height: 1.4;
`;

const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid ${Colors.mediumGray};
  border-radius: 0.875rem;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  border-bottom: 1px solid ${Colors.mediumGray};
  transition: background 0.2s ease;

  &:last-child { border-bottom: none; }
  &:hover { background: ${Colors.bone}; }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const InfoLabel = styled.div`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${Colors.ink};
  background: ${Colors.bone2};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-right: 1px solid ${Colors.mediumGray};

  svg { width: 16px; height: 16px; color: ${Colors.brass}; flex-shrink: 0; }

  @media (max-width: 576px) {
    border-right: none;
    border-bottom: 1px solid ${Colors.mediumGray};
  }
`;

const InfoValue = styled.div`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: ${Colors.darkGray};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const TagGroup = styled.span`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.375rem;
`;

const TagItem = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  background: ${Colors.bone2};
  border: 1px solid ${Colors.mediumGray};
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${Colors.darkGray};
  letter-spacing: 0.3px;
  text-transform: uppercase;
`;

const PriceDisplay = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${Colors.red};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg { width: 24px; height: 24px; color: ${Colors.red}; }
`;

const StockInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;

  background: ${props => props.$variant === 'danger' ? Colors.redBg :
        props.$variant === 'warning' ? Colors.warningBg : Colors.successBg};
  color: ${props => props.$variant === 'danger' ? Colors.red :
        props.$variant === 'warning' ? Colors.warningAmber : Colors.success};
  border: 1px solid ${props => props.$variant === 'danger' ? Colors.redLine :
        props.$variant === 'warning' ? Colors.warningLine : Colors.successLine};

  svg { width: 16px; height: 16px; }
`;

// ─── Description Section ───────────────────────────────────────────────────

const DescriptionCard = styled.div`
  background: ${Colors.white};
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid ${Colors.mediumGray};
  margin-top: 1.5rem;

  h6 {
    font-size: 0.9375rem;
    font-weight: 700;
    color: ${Colors.ink};
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg { width: 16px; height: 16px; color: ${Colors.brass}; }
  }

  p {
    font-size: 0.875rem;
    color: ${Colors.darkGray};
    line-height: 1.7;
    margin: 0;
  }

  hr {
    border: none;
    border-top: 1px solid ${Colors.mediumGray};
    margin: 1.5rem 0;
  }
`;

// ─── Loading State ─────────────────────────────────────────────────────────

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  color: ${Colors.brass};

  svg { animation: ${spin} 1s linear infinite; width: 40px; height: 40px; }
  p { margin-top: 1rem; font-size: 1rem; color: ${Colors.textMuted}; }
`;

// ─── Image Modal ───────────────────────────────────────────────────────────

const ImageOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: ${Colors.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: ${fadeIn} 0.2s ease-out;
  backdrop-filter: blur(4px);
`;

const ImageModalContent = styled.div`
  position: relative;
  max-width: 800px;
  width: 100%;
  animation: ${fadeIn} 0.3s ease-out;

  img {
    width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 0.75rem;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  }
`;

const ImageModalClose = styled.button`
  position: absolute;
  top: -2.5rem;
  right: 0;
  background: rgba(0,0,0,0.6);
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover { background: ${Colors.red}; transform: scale(1.1); }
  svg { width: 20px; height: 20px; }
`;

const ImageNav = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  color: white;
`;

const ImageNavButton = styled.button`
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover:not(:disabled) { background: rgba(255,255,255,0.4); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  svg { width: 20px; height: 20px; }
`;

// ─── Main Component ────────────────────────────────────────────────────────

const CoffinDetails = () => {
    const { coffinId, slug } = useParams();
    const navigate = useNavigate();
    const [coffin, setCoffin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showImageModal, setShowImageModal] = useState(false);

    useEffect(() => {
        fetchCoffinDetails();
    }, [coffinId]);

    const fetchCoffinDetails = async () => {
        setLoading(true);
        try {
            const response = await api.get(ENDPOINTS.COFFINS.DETAIL(coffinId));
            if (response.data.success) {
                setCoffin(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load coffin details:', error);
        } finally {
            setLoading(false);
        }
    };

    const getImages = () => {
        if (!coffin) return [];
        let images = [];
        if (Array.isArray(coffin.image_urls)) images = coffin.image_urls;
        else if (typeof coffin.image_urls === 'string') images = coffin.image_urls.split(',').map(u => u.trim());
        if (coffin.images && Array.isArray(coffin.images)) images = [...images, ...coffin.images];
        images = [...new Set(images)].filter(u => u && u.trim() !== '');
        return images;
    };

    const getImageUrl = (src) => {
        if (!src) return null;
        // If src is already a full URL, return as is
        if (src.startsWith('http')) return src;
        // Otherwise, construct the full URL using the API base URL
        const baseUrl = env.FULL_API_URL || 'http://localhost:5000';
        // Remove leading slash if present to avoid double slashes
        const cleanSrc = src.startsWith('/') ? src : `/${src}`;
        return `${baseUrl}${cleanSrc}`;
    };

    const getStockVariant = (stock) => {
        if (stock === 0) return 'danger';
        if (stock <= 5) return 'warning';
        return 'success';
    };

    const handleBack = () => {
        const tenantSlug = slug ||
            localStorage.getItem('tenantSlug') ||
            localStorage.getItem('tenant_slug') ||
            'default';
        navigate(`/tenant/${tenantSlug}/coffins`);
    };

    if (loading) {
        return (
            <PageContainer>
                <LoadingState>
                    <Loader2 size={40} />
                    <p>Loading coffin details...</p>
                </LoadingState>
            </PageContainer>
        );
    }

    if (!coffin) {
        return (
            <PageContainer>
                <Card>
                    <CardBody style={{ textAlign: 'center', padding: '3rem' }}>
                        <Package size={64} color={Colors.mediumGray} />
                        <h5 style={{ marginTop: '1rem', color: Colors.ink }}>Coffin not found</h5>
                        <Button onClick={handleBack} style={{ marginTop: '1rem' }}>
                            <ArrowLeft size={14} /> Back to Inventory
                        </Button>
                    </CardBody>
                </Card>
            </PageContainer>
        );
    }

    const images = getImages();
    const stock = coffin.quantity || 0;
    const stockVariant = getStockVariant(stock);
    const tenantSlug = slug ||
        localStorage.getItem('tenantSlug') ||
        localStorage.getItem('tenant_slug') ||
        'default';

    return (
        <PageContainer>
            {/* Breadcrumb */}
            <BreadcrumbNav>
                <Link to="/dashboard"><Home size={14} /> Dashboard</Link>
                <span className="separator">/</span>
                <Link to={`/tenant/${tenantSlug}/coffins`} style={{ color: Colors.brass, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Package size={14} /> Coffin Inventory
                </Link>
                <span className="separator">/</span>
                <span>{coffin.type}</span>
            </BreadcrumbNav>

            <Card>
                <CardHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <BackButton onClick={handleBack}>
                            <ArrowLeft size={16} /> Back
                        </BackButton>
                        <HeaderTitle>
                            <Eye />
                            <h4>Coffin Details</h4>
                        </HeaderTitle>
                    </div>
                    <HeaderActions>
                        <Button className="ghost sm" onClick={() => navigate(`/tenant/${tenantSlug}/coffins`)}>
                            <ArrowLeft size={14} /> Back to Inventory
                        </Button>
                    </HeaderActions>
                </CardHeader>

                <CardBody>
                    <ProductLayout>
                        {/* Gallery */}
                        <GallerySection>
                            <GalleryCard>
                                <GalleryTitle>
                                    <ImageIcon size={16} />
                                    Product Gallery
                                </GalleryTitle>

                                <MainImage onClick={() => images.length > 0 && setShowImageModal(true)}>
                                    {images.length > 0 ? (
                                        <img
                                            src={getImageUrl(images[selectedImageIndex])}
                                            alt={coffin.type}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <Package size={64} />
                                    )}
                                </MainImage>

                                {images.length > 1 && (
                                    <ThumbnailGrid>
                                        {images.map((img, idx) => (
                                            <Thumbnail
                                                key={idx}
                                                $active={idx === selectedImageIndex}
                                                onClick={() => setSelectedImageIndex(idx)}
                                            >
                                                <img
                                                    src={getImageUrl(img)}
                                                    alt={`${coffin.type} ${idx + 1}`}
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            </Thumbnail>
                                        ))}
                                    </ThumbnailGrid>
                                )}
                            </GalleryCard>
                        </GallerySection>

                        {/* Details */}
                        <DetailsSection>
                            <ProductTitle>{coffin.type}</ProductTitle>

                            <InfoGrid>
                                <InfoRow>
                                    <InfoLabel><Diamond size={16} /> Brand</InfoLabel>
                                    <InfoValue>{coffin.supplier || 'N/A'}</InfoValue>
                                </InfoRow>

                                <InfoRow>
                                    <InfoLabel><Layers size={16} /> Category</InfoLabel>
                                    <InfoValue>{coffin.material || 'N/A'}</InfoValue>
                                </InfoRow>

                                <InfoRow>
                                    <InfoLabel><Tag size={16} /> Tags</InfoLabel>
                                    <InfoValue>
                                        <TagGroup>
                                            {[coffin.material, coffin.color, coffin.size].filter(Boolean).map((tag, i) => (
                                                <TagItem key={i}>{tag.toUpperCase()}</TagItem>
                                            ))}
                                            <TagItem>COFFIN</TagItem>
                                        </TagGroup>
                                    </InfoValue>
                                </InfoRow>

                                <InfoRow>
                                    <InfoLabel><Maximize2 size={16} /> Size</InfoLabel>
                                    <InfoValue>{coffin.size || 'Standard'}</InfoValue>
                                </InfoRow>

                                <InfoRow>
                                    <InfoLabel><DollarSign size={16} /> Price</InfoLabel>
                                    <InfoValue>
                                        <PriceDisplay>
                                            <DollarSign size={24} />
                                            Ksh {parseInt(coffin.exact_price || 0).toLocaleString()}
                                        </PriceDisplay>
                                    </InfoValue>
                                </InfoRow>

                                <InfoRow>
                                    <InfoLabel><Warehouse size={16} /> Stock</InfoLabel>
                                    <InfoValue>
                                        <StockInfo $variant={stockVariant}>
                                            {stockVariant === 'danger' ? <XCircle size={16} /> :
                                                stockVariant === 'warning' ? <AlertTriangle size={16} /> :
                                                    <CheckCircle size={16} />}
                                            ({stock}) {stock === 0 ? 'Out of Stock' : stock <= 5 ? 'Low Stock' : 'In Stock'}
                                        </StockInfo>
                                    </InfoValue>
                                </InfoRow>

                                <InfoRow>
                                    <InfoLabel><Eye size={16} /> Reviews</InfoLabel>
                                    <InfoValue>(0) Reviews</InfoValue>
                                </InfoRow>

                                <InfoRow>
                                    <InfoLabel><Calendar size={16} /> Published</InfoLabel>
                                    <InfoValue>
                                        {coffin.created_at ? new Date(coffin.created_at).toLocaleDateString('en-US', {
                                            day: '2-digit', month: 'short', year: 'numeric'
                                        }) : 'N/A'}
                                    </InfoValue>
                                </InfoRow>
                            </InfoGrid>
                        </DetailsSection>
                    </ProductLayout>

                    {/* Description */}
                    <DescriptionCard>
                        <h6><Info size={16} /> Product Description</h6>
                        <p>
                            This {coffin.material?.toLowerCase() || 'quality'} coffin features a {coffin.color?.toLowerCase() || 'classic'} finish
                            and measures {coffin.size || 'standard'} size. Crafted with premium {coffin.material?.toLowerCase() || 'materials'},
                            it offers durability and elegance. Supplied by {coffin.supplier || 'our trusted partners'}.
                            {coffin.description || ''}
                        </p>

                        <hr />

                        {/* Stock Analytics */}
                        <h6 style={{ marginBottom: '1rem' }}><BarChart3 size={16} /> Stock Analytics</h6>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px' }}>
                            {[
                                { label: 'In Stock', percentage: stock > 5 ? 100 : stock > 0 ? (stock / 20) * 100 : 0, count: stock },
                                { label: 'Low Stock', percentage: stock > 0 && stock <= 5 ? 100 : 0, count: stock > 0 && stock <= 5 ? stock : 0 },
                                { label: 'Out of Stock', percentage: stock === 0 ? 100 : 0, count: stock === 0 ? 1 : 0 }
                            ].map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ minWidth: '100px', fontSize: '0.8125rem', fontWeight: 600, color: Colors.darkGray }}>
                                        {item.label}
                                    </span>
                                    <div style={{ flex: 1, height: '8px', background: Colors.mediumGray, borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${item.percentage}%`,
                                            height: '100%',
                                            background: idx === 0 ? `linear-gradient(90deg, ${Colors.success}, #5A6E55)` :
                                                idx === 1 ? `linear-gradient(90deg, ${Colors.warningAmber}, #C4A86A)` :
                                                    `linear-gradient(90deg, ${Colors.red}, #B85A4F)`,
                                            borderRadius: '4px',
                                            transition: 'width 0.5s ease'
                                        }} />
                                    </div>
                                    <span style={{ minWidth: '40px', fontSize: '0.8125rem', fontWeight: 600, color: Colors.textMuted, textAlign: 'right' }}>
                                        ({item.count})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </DescriptionCard>
                </CardBody>
            </Card>

            {/* Image Modal */}
            {showImageModal && images.length > 0 && (
                <ImageOverlay onClick={() => setShowImageModal(false)}>
                    <ImageModalContent onClick={(e) => e.stopPropagation()}>
                        <ImageModalClose onClick={() => setShowImageModal(false)}>
                            <X size={20} />
                        </ImageModalClose>
                        <img
                            src={getImageUrl(images[selectedImageIndex])}
                            alt={coffin.type}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available'; }}
                        />
                        {images.length > 1 && (
                            <ImageNav>
                                <ImageNavButton
                                    onClick={() => setSelectedImageIndex(i => Math.max(0, i - 1))}
                                    disabled={selectedImageIndex === 0}
                                >
                                    <ChevronLeft size={20} />
                                </ImageNavButton>
                                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                    {selectedImageIndex + 1} / {images.length}
                                </span>
                                <ImageNavButton
                                    onClick={() => setSelectedImageIndex(i => Math.min(images.length - 1, i + 1))}
                                    disabled={selectedImageIndex === images.length - 1}
                                >
                                    <ChevronRight size={20} />
                                </ImageNavButton>
                            </ImageNav>
                        )}
                    </ImageModalContent>
                </ImageOverlay>
            )}
        </PageContainer>
    );
};

export default CoffinDetails;