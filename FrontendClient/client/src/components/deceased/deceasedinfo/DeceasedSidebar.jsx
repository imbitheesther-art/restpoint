import React from 'react';
import styled from 'styled-components';
import { C, getInitials, getDaysInMorgue, formatDate } from './theme';

const SidebarCard = styled.div`
  background: white; border: 1px solid ${C.borderLight}; border-radius: 8px;
  padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  position: sticky; top: 24px;
  @media (max-width: 900px) { position: static; }
`;

const SidebarHeader = styled.div`
  display: flex; align-items: center; gap: 16px; margin-bottom: 24px;
  border-bottom: 1px solid ${C.borderLight}; padding-bottom: 16px;
`;

const AvatarLg = styled.div`
  width: 60px; height: 60px; border-radius: 50%; color: white;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 24px; flex-shrink: 0;
  font-family: 'Merriweather', serif;
  background: ${p => p.$female ? C.brown : C.black};
`;

const SidebarName = styled.div`
  font-family: 'Merriweather', serif; font-size: 18px; font-weight: 700; color: ${C.black};
`;
const SidebarMeta = styled.div`font-size: 12px; color: ${C.gray}; margin-top: 4px;`;

const StatGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
  background: ${C.borderLight}; border: 1px solid ${C.borderLight};
  border-radius: 8px; overflow: hidden; margin-bottom: 24px;
`;

const StatBox = styled.div`background: white; padding: 12px 8px; text-align: center;`;
const StatValue = styled.div`
  font-size: 16px; font-weight: 700; color: ${p => p.$color || C.black};
`;
const StatLabel = styled.div`
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; color: ${C.gray}; margin-top: 4px;
`;

const SidebarSection = styled.div`
  margin-bottom: 24px;
  h3 { font-size: 12px; font-weight: 700; text-transform: uppercase; color: ${C.black}; margin-bottom: 12px; letter-spacing: 0.05em; }
`;

const NotifItem = styled.div`
  display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid ${C.borderLight};
  &:last-child { border-bottom: none; }
`;
const NotifIcon = styled.div`
  width: 28px; height: 28px; border-radius: 6px; display: flex;
  align-items: center; justify-content: center; flex-shrink: 0;
  font-size: 14px; font-weight: bold;
  background: ${p => p.$warning ? C.warningBg : C.infoBg};
  color: ${p => p.$warning ? C.warning : C.info};
`;
const NotifText = styled.div`font-size: 12px; color: ${C.mid}; line-height: 1.4;`;
const NotifTime = styled.div`font-size: 10px; color: ${C.lightGray}; margin-top: 2px;`;

const TimelineItem = styled.div`
  display: flex; gap: 12px; align-items: flex-start; margin-bottom: 16px;
`;
const TimelineDot = styled.div`
  width: 10px; height: 10px; border-radius: 50%; margin-top: 4px; flex-shrink: 0;
  background: ${p => p.$done ? C.success : p.$active ? C.warning : C.border};
`;
const TimelineText = styled.div`
  font-size: 13px; font-weight: 600; color: ${p => p.$muted ? C.gray : C.dark};
`;
const TimelineTime = styled.div`font-size: 11px; color: ${C.gray};`;

const DeceasedSidebar = ({ deceased, postmortem, bodyStatus, totalCharges, balance, age }) => {
  const name = deceased?.full_name || deceased?.name || 'Unknown';
  const sex = deceased?.sex || deceased?.gender || '';
  const isFemale = sex.toLowerCase() === 'female';
  const daysInMorgue = getDaysInMorgue(deceased?.date_admitted || deceased?.admission_date || deceased?.created_at);

  return (
    <SidebarCard>
      <SidebarHeader>
        <AvatarLg $female={isFemale}>{getInitials(name)}</AvatarLg>
        <div>
          <SidebarName>{name}</SidebarName>
          <SidebarMeta>{sex ? `${sex}, ` : ''}{age ? `${age} Years` : ''}</SidebarMeta>
        </div>
      </SidebarHeader>

      <StatGrid>
        <StatBox>
          <StatValue $color={C.warning}>{daysInMorgue}</StatValue>
          <StatLabel>Days in Morgue</StatLabel>
        </StatBox>
        <StatBox>
          <StatValue>{age || '—'}</StatValue>
          <StatLabel>Age</StatLabel>
        </StatBox>
        <StatBox>
          <StatValue>{totalCharges}K</StatValue>
          <StatLabel>Charges (KES)</StatLabel>
        </StatBox>
        <StatBox>
          <StatValue $color={C.danger}>{balance}K</StatValue>
          <StatLabel>Balance (KES)</StatLabel>
        </StatBox>
      </StatGrid>

      <SidebarSection>
        <h3>Notifications</h3>
        {daysInMorgue > 7 && (
          <NotifItem>
            <NotifIcon $warning>!</NotifIcon>
            <div>
              <NotifText>Body has been in the morgue for {daysInMorgue} days. Please contact next of kin.</NotifText>
              <NotifTime>Active</NotifTime>
            </div>
          </NotifItem>
        )}
        <NotifItem>
          <NotifIcon $info>i</NotifIcon>
          <div>
            <NotifText>Record status: {bodyStatus}</NotifText>
            <NotifTime>Updated {formatDate(deceased?.updated_at)}</NotifTime>
          </div>
        </NotifItem>
      </SidebarSection>

      <SidebarSection>
        <h3>Mortuary Progress</h3>
        <TimelineItem>
          <TimelineDot $done />
          <div>
            <TimelineText>Admitted to Morgue</TimelineText>
            <TimelineTime>{formatDate(deceased?.created_at)}</TimelineTime>
          </div>
        </TimelineItem>
        <TimelineItem>
          <TimelineDot $done={deceased?.embalmed} $active={!deceased?.embalmed} />
          <div>
            <TimelineText>Body {deceased?.embalmed ? 'Embalmed' : 'Awaiting Embalming'}</TimelineText>
            <TimelineTime>{deceased?.embalmed ? formatDate(deceased?.embalmed_date) : 'Pending'}</TimelineTime>
          </div>
        </TimelineItem>
        <TimelineItem>
          <TimelineDot $done={postmortem?.status === 'completed'} $active={postmortem?.status === 'pending'} />
          <div>
            <TimelineText>
              Postmortem {postmortem ? 
                (postmortem.status === 'completed' ? 'Completed' : 
                 postmortem.status === 'pending' ? 'In Progress' : 
                 postmortem.status === 'in_progress' ? 'In Progress' : 'Requested') : 
                'Not Requested'}
            </TimelineText>
            <TimelineTime>
              {postmortem?.status === 'completed' ? formatDate(postmortem.completed_at || postmortem.updated_at) : 
               postmortem?.status === 'pending' || postmortem?.status === 'in_progress' ? 'Awaiting Results' : 
               postmortem ? formatDate(postmortem.requested_at || postmortem.created_at) : '—'}
            </TimelineTime>
          </div>
        </TimelineItem>
        <TimelineItem>
          <TimelineDot $active={bodyStatus === 'In Morgue' || bodyStatus === 'Active'} />
          <div>
            <TimelineText>In Storage ({bodyStatus})</TimelineText>
            <TimelineTime>Currently Active</TimelineTime>
          </div>
        </TimelineItem>
        <TimelineItem>
          <TimelineDot />
          <div>
            <TimelineText $muted>Released to Family</TimelineText>
            <TimelineTime style={{ color: C.lightGray }}>Pending</TimelineTime>
          </div>
        </TimelineItem>
      </SidebarSection>
    </SidebarCard>
  );
};

export default DeceasedSidebar;