import React from 'react';
import styled from 'styled-components';
import { Cpu, Play, Square, Activity } from 'lucide-react';
import { COLORS, Section, SectionHeader, SectionTitle, Select, Button, ProgressBar, Progress, LiveDot } from '../styles/theme';

const FloorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  padding: 1.25rem;
`;

const StationCard = styled.div`
  background: ${COLORS.bg};
  border-radius: 12px;
  padding: 1rem;
  border: 2px solid ${props => props.$color || COLORS.border};
  transition: all 0.2s;
`;

const StationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const StationName = styled.h3`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StationFooter = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: ${COLORS.textMuted};
`;

const BarChart = styled.div`
  height: 80px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
  margin-bottom: 0.75rem;
`;

const Bar = styled.div`
  width: 16px;
  height: ${props => props.$height || 20}%;
  background: ${props => props.$active ? props.$color : COLORS.bgDark};
  border-radius: 3px 3px 0 0;
  transition: all 0.3s;
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.25rem;
`;

const AnalyticsCard = styled.div`
  padding: 1rem;
  background: ${COLORS.bg};
  border-radius: 10px;
  border: 1px solid ${COLORS.border};
`;

const SimulationPanel = ({ stations, simRunning, simSpeed, simAnalytics, onToggleSim, onSpeedChange }) => {
    return (
        <>
            <Section>
                <SectionHeader>
                    <SectionTitle>
                        <Cpu size={18} /> Production Simulation
                    </SectionTitle>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: COLORS.textMuted }}>Speed:</span>
                        <Select style={{ width: '70px', padding: '0.35rem' }}
                            value={simSpeed}
                            onChange={(e) => onSpeedChange(Number(e.target.value))}>
                            <option value={1}>1x</option>
                            <option value={2}>2x</option>
                            <option value={5}>5x</option>
                            <option value={10}>10x</option>
                        </Select>
                        <Button $variant={simRunning ? 'danger' : 'success'} onClick={onToggleSim}>
                            {simRunning ? <Square size={16} /> : <Play size={16} />}
                            {simRunning ? 'Stop' : 'Start Sim'}
                        </Button>
                    </div>
                </SectionHeader>
                <FloorGrid>
                    {stations.map(station => (
                        <StationCard key={station.id} $color={station.color}>
                            <StationHeader>
                                <StationName>
                                    {station.icon} {station.name}
                                </StationName>
                                <span style={{
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '20px',
                                    fontSize: '0.7rem',
                                    fontWeight: 500,
                                    background: station.status === 'active' ? COLORS.successBg : COLORS.bgDark,
                                    color: station.status === 'active' ? COLORS.success : COLORS.textMuted,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem'
                                }}>
                                    <LiveDot $active={station.status === 'active'} />
                                    {station.status === 'active' ? 'Running' : 'Idle'}
                                </span>
                            </StationHeader>
                            <BarChart>
                                {[...Array(10)].map((_, i) => (
                                    <Bar key={i}
                                        $height={Math.max(20, (station.progress / 10) * (i + 1))}
                                        $active={i < station.progress / 10}
                                        $color={station.color} />
                                ))}
                            </BarChart>
                            <ProgressBar>
                                <Progress $color={station.color} $percent={station.progress} />
                            </ProgressBar>
                            <StationFooter>
                                <span>{station.progress}%</span>
                                <span>{station.progress >= 100 ? '✅ Done' : simRunning ? '⏳ Processing...' : '⏸️ Paused'}</span>
                            </StationFooter>
                        </StationCard>
                    ))}
                </FloorGrid>
            </Section>

            <Section>
                <SectionHeader>
                    <SectionTitle>
                        <Activity size={18} /> Simulation Analytics
                    </SectionTitle>
                </SectionHeader>
                <AnalyticsGrid>
                    {[
                        { label: 'Orders Processed', value: simAnalytics?.ordersProcessed || '0', color: COLORS.success },
                        { label: 'Avg Production Time', value: `${simAnalytics?.avgProductionTime || 0} hrs`, color: COLORS.stationDesign },
                        { label: 'Efficiency', value: `${simAnalytics?.efficiency || 0}%`, color: COLORS.accent },
                        { label: 'Bottleneck', value: simAnalytics?.bottleneck || 'None', color: COLORS.danger },
                        { label: 'Active Workers', value: `${simAnalytics?.activeWorkers || 0}/6`, color: COLORS.info },
                        { label: 'Queue Length', value: `${simAnalytics?.queueLength || 0} orders`, color: COLORS.stationPolishing },
                    ].map((item, i) => (
                        <AnalyticsCard key={i}>
                            <p style={{ fontSize: '0.7rem', color: COLORS.textMuted, margin: '0 0 0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                            <p style={{ fontSize: '1.3rem', fontWeight: 700, color: COLORS.text, margin: '0' }}>{item.value}</p>
                        </AnalyticsCard>
                    ))}
                </AnalyticsGrid>
            </Section>
        </>
    );
};

export default SimulationPanel;


