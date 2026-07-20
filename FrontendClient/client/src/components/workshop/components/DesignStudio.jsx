import React from 'react';
import styled from 'styled-components';





import { COLORS, Section, SectionHeader, SectionTitle, Button, EmptyState } from '../styles/theme.jsx';

const DesignGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.25rem;
`;

const DesignCard = styled.div`
  border: 1px solid ${COLORS.border};
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: ${COLORS.accent};
    box-shadow: 0 4px 12px rgba(212,168,67,0.15);
    transform: translateY(-2px);
  }
`;

const DesignPreview = styled.div`
  height: 180px;
  background: ${COLORS.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DesignPlaceholder = styled.div`
  font-size: 3rem;
  color: ${COLORS.textLight};
`;

const DesignInfo = styled.div`
  padding: 0.75rem;
`;

const DesignName = styled.p`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 0.25rem;
`;

const DesignMeta = styled.p`
  font-size: 0.7rem;
  color: ${COLORS.textMuted};
  margin: 0;
`;

const DropZone = styled.div`
  border: 2px dashed ${COLORS.border};
  border-radius: 12px;
  padding: 3rem 2rem;
  cursor: pointer;
  transition: all 0.2s;
  background: ${COLORS.bg};
  text-align: center;

  &:hover {
    border-color: ${COLORS.accent};
    background: ${COLORS.accent}08;
  }
`;

const DesignPreviewBox = styled.div`
  width: 100%;
  max-width: 600px;
  height: 300px;
  margin: 0 auto;
  background: linear-gradient(135deg, #2D1810 0%, #4A2F1E 50%, #6B4226 100%);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${COLORS.white};
  position: relative;
  overflow: hidden;
`;

const CoffinSilhouette = styled.div`
  width: 300px;
  height: 160px;
  border: 3px solid ${COLORS.accent};
  border-radius: 40px 40px 20px 20px;
  background: linear-gradient(135deg, #5C3A1E 0%, #8B6914 100%);
  position: relative;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);

  &:after {
    content: '';
    position: absolute;
    top: 10%;
    left: 10%;
    right: 10%;
    bottom: 10%;
    border: 1px solid ${COLORS.accent}40;
    border-radius: 30px 30px 15px 15px;
  }
`;

const DesignStudio = ({ designMode, onModeChange, designs = [], onUpload }) => {
    const sampleDesigns = designs.length > 0 ? designs : [
        { name: 'Premium Walnut', author: 'John W', status: 'Approved' },
        { name: 'Deluxe Oak', author: 'Sarah K', status: 'Draft' },
        { name: 'Standard Mahogany', author: 'Mike T', status: 'In Review' },
        { name: 'Custom Design', author: 'Emma R', status: 'Approved' },
    ];

    return (
        <>
            <Section>
                <SectionHeader>
                    <SectionTitle>
                        <FileImage size={18} /> Design Studio
                    </SectionTitle>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button $variant={designMode === 'gallery' ? 'primary' : undefined}
                            onClick={() => onModeChange('gallery')}>
                            <Grid size={14} /> Gallery
                        </Button>
                        <Button $variant={designMode === 'upload' ? 'primary' : undefined}
                            onClick={() => onModeChange('upload')}>
                            <Upload size={14} /> Upload
                        </Button>
                    </div>
                </SectionHeader>
                {designMode === 'gallery' && (
                    <DesignGrid>
                        {sampleDesigns.map((d, i) => (
                            <DesignCard key={i}>
                                <DesignPreview>
                                    <DesignPlaceholder>🖼️</DesignPlaceholder>
                                </DesignPreview>
                                <DesignInfo>
                                    <DesignName>{d.name}</DesignName>
                                    <DesignMeta>By {d.author} • {d.status}</DesignMeta>
                                </DesignInfo>
                            </DesignCard>
                        ))}
                    </DesignGrid>
                )}
                {designMode === 'upload' && (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <DropZone onClick={onUpload}>
                            <Upload size={48} style={{ color: COLORS.textLight, marginBottom: '1rem' }} />
                            <p style={{ fontSize: '1.1rem', fontWeight: 500, color: COLORS.text, margin: '0 0 0.5rem' }}>
                                Drop design files here
                            </p>
                            <p style={{ fontSize: '0.85rem', color: COLORS.textMuted, margin: '0 0 1rem' }}>
                                Supports: PNG, JPG, PDF, DXF (max 10MB)
                            </p>
                            <Button $variant="accent">
                                <Upload size={16} /> Browse Files
                            </Button>
                        </DropZone>
                    </div>
                )}
            </Section>

            <Section>
                <SectionHeader>
                    <SectionTitle>
                        <ZoomIn size={18} /> Design Preview
                    </SectionTitle>
                </SectionHeader>
                <div style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <DesignPreviewBox>
                        <CoffinSilhouette />
                        <p style={{ margin: '1rem 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
                            Premium Walnut Coffin - 2.0m x 0.8m x 0.6m
                        </p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', opacity: 0.5 }}>
                            Satin Gold Interior • Brass Handles • High-gloss Finish
                        </p>
                    </DesignPreviewBox>
                </div>
            </Section>
        </>
    );
};

export default DesignStudio;