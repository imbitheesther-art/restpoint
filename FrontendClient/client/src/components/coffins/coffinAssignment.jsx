import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components'; // ✅ Import css
import {
    Box, CheckSquare, PlusSquare, Loader2,
    Eye, X, ChevronLeft, ChevronRight,
    Calendar, User, Package, Tag, Trash2,
    CheckCircle, XCircle, Diamond, Maximize2,
    DollarSign, Truck
} from 'lucide-react';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import env from '../../config/env';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CoffinSelectionModal from './coffinselectModal';

// --- Enhanced Color Palette ---
const Colors = {
    primaryDark: '#1a1a2e',
    accentTeal: '#0ea5e9',
    accentOrange: '#f59e0b',
    accentPurple: '#8b5cf6',
    white: '#FFFFFF',
    lightGray: '#f8fafc',
    mediumGray: '#e2e8f0',
    darkGray: '#334155',
    successGreen: '#10b981',
    dangerRed: '#ef4444',
    infoBlue: '#3b82f6',
    inputBorder: '#cbd5e1',
    inputFocus: '#0ea5e9',
    textMuted: '#64748b',
};

// --- Animations ---
const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const slideIn = keyframes`
    from {
        transform: translateX(-10px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
`;

const slideInFromTop = keyframes`
    from {
        transform: translateY(-100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
`;

const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
`;

const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

// --- Styled Components with css helper ---
const Card = styled.div`
    background: ${Colors.white};
    border-radius: 1.25rem;
    box-shadow: 
        0 10px 25px -5px rgba(0, 0, 0, 0.1),
        0 8px 10px -5px rgba(0, 0, 0, 0.04);
    padding: 1.5rem;
    width: 100%;
    border: 1px solid ${Colors.mediumGray};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: ${fadeIn} 0.8s ease-out;
    position: relative;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 
            0 20px 40px -12px rgba(0, 0, 0, 0.15);
    }

    @media (max-width: 768px) {
        padding: 1rem;
        border-radius: 1rem;
    }

    @media (max-width: 576px) {
        padding: 0.75rem;
        border-radius: 0.875rem;
    }
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid ${Colors.mediumGray};
`;

const CardTitle = styled.h3`
    font-size: 1.125rem;
    font-weight: 700;
    color: ${Colors.primaryDark};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;

    svg {
        color: ${Colors.accentTeal};
        width: 20px;
        height: 20px;
    }

    @media (max-width: 576px) {
        font-size: 1rem;
    }
`;

const StatusBadge = styled.div`
    background: ${props => props.$variant === 'error' ? '#FEE2E2' : '#ECFDF5'};
    color: ${props => props.$variant === 'error' ? Colors.dangerRed : Colors.successGreen};
    padding: 0.35rem 0.85rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    animation: ${slideIn} 0.5s ease-out;
    letter-spacing: 0.3px;

    svg {
        animation: ${pulse} 2s infinite;
    }
`;

const SuccessNotification = styled.div`
    position: fixed;
    top: 1rem;
    left: 1rem;
    right: 1rem;
    background: ${Colors.successGreen};
    color: ${Colors.white};
    padding: 1rem 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 1rem;
    z-index: 1001;
    animation: ${slideInFromTop} 0.5s ease-out;
    max-width: 400px;
    margin: 0 auto;

    svg {
        font-size: 1.5rem;
        animation: ${pulse} 2s infinite;
    }

    .success-content {
        flex: 1;
        h4 {
            margin: 0 0 0.25rem 0;
            font-size: 1rem;
            font-weight: 700;
        }
        p {
            margin: 0;
            opacity: 0.9;
            font-size: 0.875rem;
        }
    }

    @media (max-width: 576px) {
        padding: 0.75rem 1rem;
        gap: 0.5rem;
        svg { font-size: 1.25rem; }
        .success-content h4 { font-size: 0.875rem; }
        .success-content p { font-size: 0.75rem; }
    }
`;

const ErrorNotification = styled(SuccessNotification)`
    background: ${Colors.dangerRed};
`;

const LoadingOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: ${fadeIn} 0.3s ease-out;
`;

const LoadingSpinner = styled.div`
    width: 60px;
    height: 60px;
    border: 4px solid ${Colors.mediumGray};
    border-top: 4px solid ${Colors.accentTeal};
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;

    @media (max-width: 576px) {
        width: 50px;
        height: 50px;
    }
`;

const LoadingText = styled.div`
    color: ${Colors.white};
    font-size: 1.1rem;
    font-weight: 600;
    margin-top: 1rem;
    text-align: center;

    @media (max-width: 576px) {
        font-size: 0.875rem;
    }
`;

const CoffinCard = styled.div`
    display: grid;
    grid-template-columns: 100px 1fr auto;
    gap: 1rem;
    padding: 1.25rem;
    background: linear-gradient(135deg, ${Colors.lightGray} 0%, #f1f5f9 100%);
    border: 1px solid ${Colors.mediumGray};
    border-radius: 0.875rem;
    margin-bottom: 1rem;
    animation: ${slideIn} 0.5s ease-out;
    transition: all 0.3s ease;

    &:hover {
        border-color: ${Colors.accentTeal};
        box-shadow: 0 4px 12px rgba(14, 165, 233, 0.08);
    }

    @media (max-width: 768px) {
        grid-template-columns: 80px 1fr;
        gap: 0.75rem;
        padding: 1rem;
    }

    @media (max-width: 576px) {
        grid-template-columns: 1fr;
        gap: 0.75rem;
        padding: 0.875rem;
        text-align: center;
    }
`;

const CoffinImageWrapper = styled.div`
    width: 100px;
    height: 100px;
    border-radius: 0.75rem;
    overflow: hidden;
    border: 2px solid ${Colors.mediumGray};
    background: ${Colors.white};
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
        border-color: ${Colors.accentTeal};
        transform: scale(1.05);
        box-shadow: 0 8px 20px rgba(14, 165, 233, 0.2);
    }

    @media (max-width: 768px) {
        width: 80px;
        height: 80px;
    }

    @media (max-width: 576px) {
        width: 90px;
        height: 90px;
        margin: 0 auto;
    }
`;

const CoffinImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0.625rem;
    transition: transform 0.3s ease;

    ${CoffinImageWrapper}:hover & {
        transform: scale(1.1);
    }
`;

const CoffinDetails = styled.div`
    .coffin-type {
        font-weight: 700;
        color: ${Colors.primaryDark};
        margin-bottom: 0.5rem;
        font-size: 1.05rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        svg {
            color: ${Colors.accentTeal};
            width: 18px;
            height: 18px;
        }

        @media (max-width: 576px) {
            justify-content: center;
            font-size: 0.95rem;
        }
    }

    .coffin-specs {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
        font-size: 0.875rem;

        @media (max-width: 576px) {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.375rem;
            font-size: 0.8rem;
        }
    }

    .spec-item {
        color: ${Colors.textMuted};
        display: flex;
        align-items: center;
        gap: 0.375rem;

        svg {
            width: 14px;
            height: 14px;
            color: ${Colors.accentTeal};
            flex-shrink: 0;
        }

        strong {
            color: ${Colors.darkGray};
            font-weight: 600;
        }
    }

    .coffin-price {
        font-weight: 700;
        color: ${Colors.successGreen};
        margin-top: 0.75rem;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.5rem 0.75rem;
        background: ${Colors.white};
        border-radius: 0.5rem;
        border: 1px solid ${Colors.mediumGray};
        display: inline-flex;

        @media (max-width: 576px) {
            justify-content: center;
            font-size: 0.875rem;
            width: 100%;
        }
    }
`;

const AssignmentInfo = styled.div`
    text-align: right;
    font-size: 0.875rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-left: 1px solid ${Colors.mediumGray};

    @media (max-width: 768px) {
        grid-column: 1 / -1;
        flex-direction: row;
        justify-content: space-around;
        text-align: center;
        border-left: none;
        border-top: 1px solid ${Colors.mediumGray};
        padding: 0.75rem 0 0 0;
        margin-top: 0.25rem;
    }
`;

const AssignmentItem = styled.div`
    color: ${Colors.textMuted};
    line-height: 1.5;

    strong {
        color: ${Colors.darkGray};
        display: block;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.125rem;
    }

    .value {
        font-weight: 600;
        color: ${Colors.primaryDark};
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
    flex-wrap: wrap;

    @media (max-width: 576px) {
        gap: 0.5rem;
        justify-content: center;
    }
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    border: 2px solid ${Colors.mediumGray};
    background: ${Colors.white};
    color: ${Colors.darkGray};
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 40px;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: ${Colors.accentTeal};
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
    }

    svg {
        width: 16px;
        height: 16px;
    }

    &.primary {
        background: linear-gradient(135deg, ${Colors.accentTeal} 0%, ${Colors.infoBlue} 100%);
        color: ${Colors.white};
        border-color: transparent;
        box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);

        &:hover {
            box-shadow: 
                0 10px 20px -5px rgba(14, 165, 233, 0.25),
                0 6px 10px -5px rgba(0, 0, 0, 0.1);
            border-color: transparent;
        }
    }

    &.danger {
        background: linear-gradient(135deg, ${Colors.dangerRed} 0%, #dc2626 100%);
        color: white;
        border-color: transparent;

        &:hover {
            box-shadow: 0 10px 20px -5px rgba(239, 68, 68, 0.25);
            border-color: transparent;
        }
    }

    &.outline {
        background: ${Colors.lightGray};
        border-color: ${Colors.mediumGray};
        color: ${Colors.darkGray};

        &:hover {
            background: ${Colors.white};
            border-color: ${Colors.accentTeal};
            color: ${Colors.accentTeal};
        }
    }

    @media (max-width: 576px) {
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
        min-height: 36px;

        svg {
            width: 14px;
            height: 14px;
        }
    }
`;

// ✅ FIXED: Show blank when no coffin
const NoAssignment = styled.div`
    text-align: center;
    padding: 2.5rem 2rem;
    color: ${Colors.textMuted};
    animation: ${fadeIn} 0.6s ease-out;

    .no-assignment-icon {
        font-size: 3rem;
        color: ${Colors.mediumGray};
        margin-bottom: 1rem;
        animation: ${pulse} 2s infinite;
    }

    p {
        margin: 0.5rem 0;
        font-size: 0.95rem;

        &.main-text {
            font-weight: 600;
            color: ${Colors.darkGray};
            font-size: 1.1rem;
        }

        &.sub-text {
            font-size: 0.85rem;
            color: ${Colors.textMuted};
        }
    }

    @media (max-width: 576px) {
        padding: 2rem 1rem;

        .no-assignment-icon {
            font-size: 2.5rem;
        }

        p {
            font-size: 0.875rem;
            &.main-text { font-size: 1rem; }
            &.sub-text { font-size: 0.8rem; }
        }
    }
`;

const Loader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    color: ${Colors.accentTeal};
    animation: ${fadeIn} 0.5s ease-out;

    .loader-text {
        margin-top: 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: ${Colors.textMuted};
    }

    svg {
        animation: ${spin} 1s linear infinite;
    }
`;

// Image Modal
const ImageModal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.92);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    animation: ${fadeIn} 0.3s ease-out;
    backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    animation: ${fadeIn} 0.4s ease-out;
`;

const ModalImage = styled.img`
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 0.75rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const CloseButton = styled.button`
    position: absolute;
    top: -2.75rem;
    right: 0;
    background: rgba(0, 0, 0, 0.6);
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

    &:hover {
        background: ${Colors.dangerRed};
        transform: scale(1.1);
    }
`;

const Navigation = styled.div`
    position: absolute;
    bottom: -3.5rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 1rem;
    color: white;
    background: rgba(0, 0, 0, 0.6);
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    backdrop-filter: blur(4px);
`;

const NavButton = styled.button`
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 0.5rem;
    border-radius: 50%;
    cursor: pointer;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.4);
        transform: scale(1.1);
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;

const ImageCounter = styled.span`
    font-size: 0.875rem;
    font-weight: 500;
    min-width: 60px;
    text-align: center;
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const CoffinAssignment = () => {
    const { id } = useParams();
    const [deceasedData, setDeceasedData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // Image modal state
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const fetchDeceasedData = async () => {
        setIsLoading(true);
        try {
            console.log('🔄 Fetching deceased data for coffin assignment...');
            const endpoint = `${ENDPOINTS.DECEASED.DETAIL(deceasedId)}`;
            const response = await api.get(endpoint, {
                params: { id: id },
                timeout: 10000
            });

            console.log('📦 Coffin assignment API response:', response.data);

            if (response.data?.data) {
                const data = response.data.data;
                setDeceasedData(data);

                console.log('🔍 Coffin data check:', {
                    rawData: data,
                    coffinData: data.coffin_assignment,
                    hasCoffinData: !!data.coffin_assignment,
                });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setErrorMessage("Failed to load data");
            setTimeout(() => setErrorMessage(null), 5000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveAssignment = async () => {
        const coffinAssignment = deceasedData?.coffin_assignment;

        if (!coffinAssignment || !coffinAssignment.coffin_id) {
            setErrorMessage('No coffin assignment found to remove');
            setTimeout(() => setErrorMessage(null), 5000);
            return;
        }

        setIsRemoving(true);
        try {
            const deleteEndpoint = `${ENDPOINTS.DECEASED.COFFIN}/${id}`;
            await api.delete(deleteEndpoint, {
                timeout: 10000
            });

            setSuccessMessage('Coffin assignment removed successfully');
            setTimeout(() => setSuccessMessage(null), 5000);
            await fetchDeceasedData();
        } catch (error) {
            console.error("Remove error:", error);
            setErrorMessage('Failed to remove assignment');
            setTimeout(() => setErrorMessage(null), 5000);
        } finally {
            setIsRemoving(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchDeceasedData();
        }
    }, [id]);

    const handleCoffinAssigned = () => {
        setSuccessMessage('Coffin assigned successfully');
        setTimeout(() => setSuccessMessage(null), 5000);
        fetchDeceasedData();
        setIsModalOpen(false);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath || typeof imagePath !== 'string') {
            return null;
        }

        try {
            let cleanPath = imagePath.trim();

            if (cleanPath.startsWith('http')) {
                return cleanPath;
            }

            cleanPath = cleanPath.replace(/\/\//g, '/');

            if (!cleanPath.startsWith('/')) {
                cleanPath = '/' + cleanPath;
            }

            return `${env.API_GATEWAY_URL}${cleanPath}`;
        } catch (error) {
            console.error('Error processing image URL:', error);
            return null;
        }
    };

    const openImageModal = (index = 0) => {
        setCurrentImageIndex(index);
        setImageModalOpen(true);
    };

    const closeImageModal = () => {
        setImageModalOpen(false);
    };

    const nextImage = () => {
        const images = getCoffinImages();
        if (currentImageIndex < images.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        }
    };

    const prevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    const getCoffinImages = () => {
        const coffinAssignment = deceasedData?.coffin_assignment;
        if (!coffinAssignment) {
            return [];
        }

        const images = [];

        if (coffinAssignment.primary_image) {
            const url = getImageUrl(coffinAssignment.primary_image);
            if (url) images.push(url);
        }

        if (coffinAssignment.images && Array.isArray(coffinAssignment.images)) {
            coffinAssignment.images.forEach(img => {
                const url = getImageUrl(img);
                if (url) images.push(url);
            });
        }

        if (images.length === 0 && coffinAssignment.coffin_id) {
            images.push('/api/placeholder/80/80');
        }

        return images;
    };

    const getCoffinData = () => {
        if (!deceasedData?.coffin_assignment) {
            return null;
        }

        const coffin = deceasedData.coffin_assignment;

        return {
            type: coffin.type || 'Standard Coffin',
            material: coffin.material || 'Wood',
            size: coffin.size || 'Standard',
            color: coffin.color || 'Brown',
            supplier: coffin.supplier || 'Unknown',
            price: coffin.price || 0,
            assignment_date: coffin.assignment_date || new Date().toISOString().split('T')[0],
            primary_image: coffin.primary_image || null,
            coffin_id: coffin.coffin_id || null,
            images: coffin.images || []
        };
    };

    const coffinData = getCoffinData();
    const hasCoffinAssignment = !!coffinData?.coffin_id && coffinData.coffin_id !== null && coffinData.coffin_id !== '';
    const coffinImages = getCoffinImages();

    console.log('🎯 Current coffin assignment state:', {
        hasCoffinAssignment,
        coffinData,
        coffinImages: coffinImages.length,
        deceasedName: deceasedData?.full_name || 'Unknown'
    });

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle><Box size={18} /> Coffin Assignment</CardTitle>
                </CardHeader>
                <Loader>
                    <Loader2 size={24} />
                    <span className="loader-text">Loading coffin assignment...</span>
                </Loader>
            </Card>
        );
    }

    return (
        <>
            {successMessage && (
                <SuccessNotification>
                    <CheckCircle size={24} />
                    <div className="success-content">
                        <h4>Success!</h4>
                        <p>{successMessage}</p>
                    </div>
                </SuccessNotification>
            )}

            {errorMessage && (
                <ErrorNotification>
                    <XCircle size={24} />
                    <div className="success-content">
                        <h4>Error</h4>
                        <p>{errorMessage}</p>
                    </div>
                </ErrorNotification>
            )}

            {isRemoving && (
                <LoadingOverlay>
                    <LoadingSpinner />
                    <LoadingText>Removing Coffin Assignment...</LoadingText>
                </LoadingOverlay>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>
                        <Box size={18} />
                        Coffin Assignment
                    </CardTitle>
                    {hasCoffinAssignment && (
                        <StatusBadge>
                            <CheckSquare size={12} />
                            Assigned
                        </StatusBadge>
                    )}
                </CardHeader>

                {hasCoffinAssignment && coffinData ? (
                    <>
                        <CoffinCard>
                            <div>
                                {coffinImages.length > 0 && (
                                    <CoffinImageWrapper onClick={() => openImageModal(0)}>
                                        <CoffinImage
                                            src={coffinImages[0]}
                                            alt={coffinData.type}
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiNFNUU3RUIiIHN0cm9rZS13aWR0aD0iMSIvPgo8cGF0aCBkPSJNNTIuNSA0MGMwIDYuOS01LjYgMTIuNS0xMi41IDEyLjVTMjcuNSA0Ni45IDI3NSA0MCAyNy41IDI3LjEgMzIuNSAyMC41IDUyLjUgMzMuMSA1Mi41IDQweiIgZmlsbD0iI0U1RTdFQiIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjI4IiByPSI2IiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0zMC40IDQ5LjZDNDEuMyA1OC44IDU0LjUgNTEuMSA1NC41IDQwSDI1LjVDMjUuNSA1MS4xIDM4LjcgNTguOCA0OS42IDQ5LjZaIiBmaWxsPSIjRTVFN0VCIi8+Cjwvc3ZnPgo=';
                                            }}
                                        />
                                    </CoffinImageWrapper>
                                )}
                            </div>

                            <CoffinDetails>
                                <div className="coffin-type">
                                    <Package size={16} />
                                    {coffinData.type}
                                </div>
                                <div className="coffin-specs">
                                    <div className="spec-item">
                                        <Diamond size={14} />
                                        <strong>Material:</strong> {coffinData.material}
                                    </div>
                                    <div className="spec-item">
                                        <Maximize2 size={14} />
                                        <strong>Size:</strong> {coffinData.size}
                                    </div>
                                    <div className="spec-item">
                                        <Tag size={14} />
                                        <strong>Color:</strong> {coffinData.color}
                                    </div>
                                    <div className="spec-item">
                                        <Truck size={14} />
                                        <strong>Supplier:</strong> {coffinData.supplier}
                                    </div>
                                </div>
                                <div className="coffin-price">
                                    <DollarSign size={16} />
                                    Ksh {parseInt(coffinData.price || 0).toLocaleString()}
                                </div>
                            </CoffinDetails>

                            <AssignmentInfo>
                                <AssignmentItem>
                                    <strong>Assigned</strong>
                                    <span className="value">
                                        <Calendar size={12} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                                        {coffinData.assignment_date}
                                    </span>
                                </AssignmentItem>
                                <AssignmentItem>
                                    <strong>Deceased</strong>
                                    <span className="value">
                                        <User size={12} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                                        {deceasedData?.full_name || 'N/A'}
                                    </span>
                                </AssignmentItem>
                            </AssignmentInfo>
                        </CoffinCard>

                        <ButtonGroup>
                            <Button
                                className="primary"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <PlusSquare size={14} />
                                Change
                            </Button>
                            <Button
                                className="danger"
                                onClick={handleRemoveAssignment}
                                disabled={isRemoving}
                            >
                                <Trash2 size={14} />
                                {isRemoving ? 'Removing...' : 'Remove'}
                            </Button>
                            {coffinImages.length > 0 && (
                                <Button className="outline" onClick={() => openImageModal(0)}>
                                    <Eye size={14} />
                                    View Images
                                </Button>
                            )}
                        </ButtonGroup>
                    </>
                ) : (
                    // ✅ SHOW BLANK/NULL WHEN NOTHING
                    <NoAssignment>
                        <div className="no-assignment-icon">
                            <Box size={48} />
                        </div>
                        <p className="main-text">No coffin assigned</p>
                        <p className="sub-text">
                            {deceasedData?.full_name ? `Deceased: ${deceasedData.full_name}` : 'No deceased data available'}
                        </p>
                        <Button
                            className="primary"
                            onClick={() => setIsModalOpen(true)}
                            style={{ marginTop: '1rem' }}
                        >
                            <PlusSquare size={14} />
                            Assign Coffin
                        </Button>
                    </NoAssignment>
                )}
            </Card>

            {isModalOpen && (
                <CoffinSelectionModal
                    onClose={() => setIsModalOpen(false)}
                    onSelectCoffin={handleCoffinAssigned}
                    deceasedId={id}
                    deceasedData={deceasedData}
                />
            )}

            {imageModalOpen && coffinImages.length > 0 && (
                <ImageModal onClick={closeImageModal}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <CloseButton onClick={closeImageModal}>
                            <X size={20} />
                        </CloseButton>
                        <ModalImage
                            src={coffinImages[currentImageIndex]}
                            alt={`Coffin image ${currentImageIndex + 1}`}
                            onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiNFNUU3RUIiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMzAwIDIwMGMwIDU1LjItNDQuOCAxMDAtMTAwIDEwMFMxMDAgMjU1LjIgMTAwIDIwMCAxNDQuOCAxMDAgMjAwIDEwMCAzMDAgMTQ0LjggMzAwIDIwMHoiIGZpbGw9IiNFNUU3RUIiLz4KPGNpcmNsZSBjeD0iMjAwIiBjeT0iMTUwIiByPSIyMCIgZmlsbD0iI0U1RTdFQiIvPgo8cGF0aCBkPSJNMjAwIDI1MEMyNzAgMjUwIDMyNSAxOTUgMzI1IDEyNUgyNTBDMjUwIDE5NSAxOTUgMjUwIDEyNSAyNTBaIiBmaWxsPSIjRTVFN0VCIi8+Cjwvc3ZnPgo=';
                            }}
                        />
                        {coffinImages.length > 1 && (
                            <Navigation>
                                <NavButton onClick={prevImage} disabled={currentImageIndex === 0}>
                                    <ChevronLeft size={16} />
                                </NavButton>
                                <ImageCounter>{currentImageIndex + 1} / {coffinImages.length}</ImageCounter>
                                <NavButton onClick={nextImage} disabled={currentImageIndex === coffinImages.length - 1}>
                                    <ChevronRight size={16} />
                                </NavButton>
                            </Navigation>
                        )}
                    </ModalContent>
                </ImageModal>
            )}

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </>
    );
};

export default CoffinAssignment;