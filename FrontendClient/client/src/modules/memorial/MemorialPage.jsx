import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, Globe, MessageCircle, Camera, Shield, Star, ChevronRight, ExternalLink, Music, Mic } from '../../utils/icons/icons';

const C = {
    bone: '#FAF8F4',
    bone2: '#F3EFE6',
    brass: '#8B7355',
    brassL: '#A98F6E',
    brassP: 'rgba(139,115,85,0.08)',
    brassPB: 'rgba(139,115,85,0.15)',
    vd: '#3D4F47',
    vdL: '#4D6359',
    vdP: 'rgba(61,79,71,0.06)',
    vdPB: 'rgba(61,79,71,0.15)',
    acc: '#C77B5E',
    line: '#E3DDD0',
    tx: '#1A1A1A',
    txS: '#5C5C5C',
    txT: '#8A8780',
    wh: '#FFFFFF',
    black: '#0A0A0A',
    black2: '#111111',
};

const MONO = '"JetBrains Mono", monospace';
const SERIF = '"Fraunces", serif';
const SANS = '"Inter", sans-serif';

let candleId = 0;
function CandleIcon({ lit = true, size = 120 }) {
    const id = `c${++candleId}`;
    const h = size * 1.8;
    return (
        <svg width={size} height={h} viewBox="0 0 100 180" fill="none" style={{ filter: lit ? 'drop-shadow(0 0 20px rgba(255,165,0,0.12))' : 'none' }}>
            <defs>
                <radialGradient id={`${id}-gl`} cx="50%" cy="22%" r="50%"><stop offset="0%" stopColor="#FFD700" stopOpacity="0.2" /><stop offset="40%" stopColor="#FF8C00" stopOpacity="0.05" /><stop offset="100%" stopColor="#FF8C00" stopOpacity="0" /></radialGradient>
                <linearGradient id={`${id}-wx`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#EDE7DB" /><stop offset="22%" stopColor="#F8F4EC" /><stop offset="48%" stopColor="#FFFDF8" /><stop offset="76%" stopColor="#F5F0E6" /><stop offset="100%" stopColor="#DDD6C8" /></linearGradient>
                <linearGradient id={`${id}-fo`} x1=".5" y1="1" x2=".5" y2="0"><stop offset="0%" stopColor="#D84315" stopOpacity=".85" /><stop offset="30%" stopColor="#FF8C00" stopOpacity=".7" /><stop offset="65%" stopColor="#FFB74D" stopOpacity=".35" /><stop offset="100%" stopColor="#FFD700" stopOpacity="0" /></linearGradient>
                <linearGradient id={`${id}-fm`} x1=".5" y1="1" x2=".5" y2="0"><stop offset="0%" stopColor="#FFB300" stopOpacity=".92" /><stop offset="45%" stopColor="#FFD54F" stopOpacity=".85" /><stop offset="100%" stopColor="#FFF8E1" stopOpacity=".15" /></linearGradient>
                <linearGradient id={`${id}-fi`} x1=".5" y1="1" x2=".5" y2="0"><stop offset="0%" stopColor="#FFF9C4" stopOpacity=".95" /><stop offset="100%" stopColor="#FFF" stopOpacity=".25" /></linearGradient>
                <linearGradient id={`${id}-fb`} x1=".5" y1="1" x2=".5" y2="0"><stop offset="0%" stopColor="#1565C0" stopOpacity=".6" /><stop offset="100%" stopColor="#64B5F6" stopOpacity="0" /></linearGradient>
            </defs>
            {lit && <circle cx="50" cy="40" r="75" fill={`url(#${id}-gl)`}><animate attributeName="r" values="75;88;68;75" dur="3.2s" repeatCount="indefinite" /></circle>}
            <ellipse cx="50" cy="173" rx="32" ry="5" fill="rgba(0,0,0,0.04)" />
            <path d="M36,62 L34,164Q34,171 50,171Q66,171 66,164L64,62Z" fill={`url(#${id}-wx)`} stroke="#D4C9B8" strokeWidth=".3" />
            <path d="M43,64L42,164Q44,168 48,168L49,64Z" fill="rgba(255,255,255,0.1)" />
            <path d="M58,64L59,164Q57,168 54,168L55,64Z" fill="rgba(0,0,0,0.03)" />
            <path d="M36,74Q30,90 33,110Q30,116 35,116Q38,112 35,98Q39,88 36,74Z" fill="#F0EAE0" stroke="#D4C9B8" strokeWidth=".2" opacity=".85" />
            <path d="M64,82Q70,100 66,126Q64,132 69,132Q72,126 68,110Q63,100 64,82Z" fill="#EDE7DB" stroke="#D4C9B8" strokeWidth=".2" opacity=".65" />
            <ellipse cx="50" cy="62" rx="14" ry="3.8" fill="#FFFDF8" stroke="#D4C9B8" strokeWidth=".3" />
            <line x1="50" y1="62" x2="50" y2="49" stroke="#2C2C2C" strokeWidth="1.3" strokeLinecap="round" />
            {lit && <>
                <circle cx="50" cy="48.5" r="1.8" fill="#FF6600" opacity=".7"><animate attributeName="opacity" values=".7;.95;.45;.7" dur="1.1s" repeatCount="indefinite" /></circle>
                <path fill={`url(#${id}-fo)`}><animate attributeName="d" dur="1.5s" repeatCount="indefinite" values="M50,16Q36,32 38,43Q39,50 44,52Q47,53 50,53Q53,53 56,52Q61,50 62,43Q64,32 50,16Z;M50,14Q34,31 37,43Q38,51 44,53Q47,54 50,54Q53,54 56,53Q62,51 63,43Q66,31 50,14Z;M50,16Q36,32 38,43Q39,50 44,52Q47,53 50,53Q53,53 56,52Q61,50 62,43Q64,32 50,16Z" /></path>
                <path fill={`url(#${id}-fm)`}><animate attributeName="d" dur="1.15s" repeatCount="indefinite" values="M50,25Q41,36 42,44Q43,49 46,51Q48,52 50,52Q52,52 54,51Q57,49 58,44Q59,36 50,25Z;M50,24Q40,35 41,44Q42,50 46,52Q48,53 50,53Q52,53 54,52Q58,50 59,44Q60,35 50,24Z;M50,25Q41,36 42,44Q43,49 46,51Q48,52 50,52Q52,52 54,51Q57,49 58,44Q59,36 50,25Z" /></path>
                <path fill={`url(#${id}-fi)`}><animate attributeName="d" dur=".95s" repeatCount="indefinite" values="M50,33Q45,40 46,45Q47,49 49,50Q50,51 50,51Q51,51 53,50Q55,49 56,45Q57,40 50,33Z;M50,32Q44,39 45,45Q46,50 49,51Q50,52 50,52Q51,52 53,51Q56,50 57,45Q58,39 50,32Z;M50,33Q45,40 46,45Q47,49 49,50Q50,51 50,51Q51,51 53,50Q55,49 56,45Q57,40 50,33Z" /></path>
                <path fill={`url(#${id}-fb)`}><animate attributeName="d" dur=".75s" repeatCount="indefinite" values="M50,46Q48,49 49,51Q50,52 50,52Q51,52 52,51Q53,49 50,46Z;M50,45Q47,48 48,51Q49,52 50,52Q51,52 52,51Q53,48 50,45Z;M50,46Q48,49 49,51Q50,52 50,52Q51,52 52,51Q53,49 50,46Z" /></path>
                <ellipse cx="50" cy="48" rx="1.8" ry="2.8" fill="rgba(255,255,255,0.6)"><animate attributeName="opacity" values=".6;.85;.4;.6" dur="2s" repeatCount="indefinite" /></ellipse>
            </>}
        </svg>
    );
}

function useInView(threshold = 0.12) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setVisible(true); obs.unobserve(el); }
        }, { threshold });
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible];
}

function FadeUp({ children, delay = 0, className = '' }) {
    const [ref, visible] = useInView();
    return (
        <div ref={ref} className={className} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(32px)',
            transition: `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        }}>{children}</div>
    );
}

function SectionLabel({ children, light = false }) {
    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            fontFamily: MONO, fontSize: '0.68rem', letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: light ? 'rgba(250,248,244,0.35)' : C.brass,
            marginBottom: '1.2rem',
        }}>
            <span style={{
                width: 20, height: 1,
                background: light ? 'rgba(250,248,244,0.2)' : C.brass,
                display: 'inline-block',
            }} />
            {children}
        </div>
    );
}

function SectionHeading({ children, sub, light = false }) {
    return (
        <div style={{ marginBottom: '2.75rem' }}>
            <h2 style={{
                fontFamily: SERIF,
                fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
                color: light ? C.bone : C.tx,
                fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.02em',
                marginBottom: sub ? '0.85rem' : 0,
            }}>{children}</h2>
            {sub && <p style={{
                fontSize: '0.95rem',
                color: light ? 'rgba(250,248,244,0.45)' : C.txS,
                lineHeight: 1.75, maxWidth: 580,
            }}>{sub}</p>}
        </div>
    );
}

function BuildBadge() {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '0.55rem', fontFamily: MONO,
            color: 'rgba(250,248,244,0.5)',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '2px 8px', borderRadius: '6px',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            marginLeft: '0.5rem', verticalAlign: 'middle',
        }}>
            <span style={{
                width: 4, height: 4, borderRadius: '50%',
                background: 'rgba(250,248,244,0.5)',
                animation: 'pulse 2s infinite',
                display: 'inline-block',
            }} />
            Building
        </span>
    );
}

function Divider({ dark }) {
    return (
        <div style={{
            height: 1,
            background: dark
                ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04) 20%, rgba(255,255,255,0.04) 80%, transparent)'
                : 'linear-gradient(90deg, transparent, #E3DDD0 20%, #E3DDD0 80%, transparent)',
        }} />
    );
}

function StatusCard({ name, initials, time, text, gradient, bgIcon, isUser, photo }) {
    const bgStyle = photo
        ? { background: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(https://picsum.photos/seed/' + photo + '/520/860.jpg) center/cover' }
        : { background: gradient };

    return (
        <div style={{
            minWidth: 240, height: 420, borderRadius: 18,
            overflow: 'hidden', position: 'relative', flexShrink: 0,
            scrollSnapAlign: 'start', ...bgStyle,
            transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1)',
        }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                padding: '0.8rem 1rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                zIndex: 3, background: 'linear-gradient(rgba(0,0,0,0.3), transparent)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: isUser ? 'rgba(199,123,94,0.3)' : 'rgba(255,255,255,0.1)',
                        border: isUser ? '1.5px solid rgba(199,123,94,0.5)' : '1.5px solid rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.45rem', color: 'rgba(255,255,255,0.7)',
                        fontWeight: 600, fontFamily: MONO,
                    }}>{initials}</div>
                    <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{name}</span>
                </div>
                <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)' }}>{time}</span>
            </div>
            <div style={{
                position: 'absolute', top: '38%', left: '50%',
                transform: 'translate(-50%, -50%)', opacity: 0.06, zIndex: 1,
            }}>
                {bgIcon === 'heart' && <Heart size={85} color="#fff" />}
                {bgIcon === 'candle' && <CandleIcon lit size={60} />}
            </div>
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: '55%', background: 'linear-gradient(transparent, rgba(0,0,0,0.5))', zIndex: 2,
            }} />
            <div style={{
                position: 'absolute', bottom: '1.25rem', left: '1rem', right: '1rem', zIndex: 3,
            }}>
                {text && <p style={{
                    fontSize: '0.92rem', color: '#fff', lineHeight: 1.6,
                    textShadow: '0 1px 12px rgba(0,0,0,0.6)',
                }}>&ldquo;{text}&rdquo;</p>}
            </div>
        </div>
    );
}

const WAVE_DATA = [
    [4, 8, 12, 6, 14, 10, 16, 7, 13, 5, 15, 9, 6, 17, 11, 3, 13, 15, 7, 12, 4, 16, 9, 6, 14, 8, 11, 5, 13, 10, 7, 15, 4, 12, 8, 14, 6, 16, 9, 11, 5],
    [6, 10, 5, 14, 8, 16, 4, 12, 7, 15, 3, 11, 9, 17, 6, 13, 8, 14, 5, 16, 10, 7, 12, 4, 15, 9, 6, 13, 11, 8, 14, 5, 16, 7, 12, 10, 15, 4, 13, 9, 6],
    [3, 11, 7, 15, 5, 13, 9, 16, 4, 12, 8, 14, 6, 17, 10, 5, 15, 7, 13, 3, 11, 8, 16, 4, 14, 9, 12, 6, 15, 10, 7, 13, 5, 16, 8, 11, 4, 14, 9, 12, 6],
];

function AudioPlayer({ title, artist, duration, waveIdx }) {
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef(null);

    function togglePlay() {
        if (playing) {
            clearInterval(intervalRef.current);
            setPlaying(false);
        } else {
            setPlaying(true);
            intervalRef.current = setInterval(() => {
                setProgress((p) => {
                    if (p >= 100) { clearInterval(intervalRef.current); setPlaying(false); return 0; }
                    return p + 0.4;
                });
            }, 100);
        }
    }

    useEffect(() => { return () => clearInterval(intervalRef.current); }, []);

    const waves = WAVE_DATA[waveIdx] || WAVE_DATA[0];

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '1rem 1.25rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px', transition: 'background 0.3s ease',
        }}>
            <button
                onClick={togglePlay}
                style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: playing ? 'rgba(199,123,94,0.2)' : 'rgba(255,255,255,0.06)',
                    border: playing ? '1px solid rgba(199,123,94,0.3)' : '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0, transition: 'all 0.25s ease',
                }}
            >
                {playing ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="rgba(250,248,244,0.8)">
                        <rect x="1" y="1" width="4" height="12" rx="1" />
                        <rect x="9" y="1" width="4" height="12" rx="1" />
                    </svg>
                ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="rgba(250,248,244,0.6)">
                        <polygon points="3,0 14,7 3,14" />
                    </svg>
                )}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: '0.85rem', color: 'rgba(250,248,244,0.85)',
                    fontWeight: 500, marginBottom: '0.15rem',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{title}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(250,248,244,0.3)', marginBottom: '0.5rem' }}>{artist}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                        style={{
                            flex: 1, height: '24px',
                            display: 'flex', alignItems: 'center', gap: '1.5px',
                            position: 'relative', cursor: 'pointer',
                        }}
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setProgress(((e.clientX - rect.left) / rect.width) * 100);
                        }}
                    >
                        {waves.map((h, i) => (
                            <div key={i} style={{
                                flex: 1, height: h + 'px', borderRadius: '1px',
                                background: (i / 40) * 100 <= progress
                                    ? 'rgba(199,123,94,0.7)'
                                    : 'rgba(255,255,255,0.12)',
                                transition: 'background 0.15s ease',
                            }} />
                        ))}
                    </div>
                    <span style={{
                        fontSize: '0.6rem', color: 'rgba(250,248,244,0.25)',
                        fontFamily: MONO, flexShrink: 0, width: '32px', textAlign: 'right',
                    }}>{duration}</span>
                </div>
            </div>
        </div>
    );
}

export default function MemorialPage() {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [hasLit, setHasLit] = useState(false);
    const [candleCount, setCandleCount] = useState(23);
    const scrollRef = useRef(null);

    const [statuses, setStatuses] = useState([
        { name: 'Sarah M.', initials: 'SM', time: '10:30 AM', text: 'A life well lived. You gave us everything, mama. We carry you in our hearts.', gradient: 'linear-gradient(145deg, #043D37, #0A5C52)', bgIcon: 'heart' },
        { name: 'James K.', initials: 'JK', time: '10:45 AM', text: 'You raised us. I remember when you would wake up at 4am to prepare us for school. Those mornings shaped who we are.', gradient: 'linear-gradient(180deg, #0B3D2E, #145A44)', bgIcon: 'heart', photo: 'memorial-dawn-88' },
        { name: 'Peter O.', initials: 'PO', time: '11:15 AM', text: 'Your hands fed us, your prayers covered us. You were our shelter in every storm.', gradient: 'linear-gradient(180deg, #043D37, #0D5C4A)', bgIcon: 'candle' },
        { name: 'Grace N.', initials: 'GN', time: '11:28 AM', text: 'The village misses you. You were the tree under which we all found shade.', gradient: 'linear-gradient(145deg, #062E24, #145A44)', bgIcon: 'heart', photo: 'tree-shade-33' },
        { name: 'Mary W.', initials: 'MW', time: '11:40 AM', text: 'We are from traditional mourning. At the edge of tech, we bring mourning to the web.', gradient: 'linear-gradient(135deg, #0A2E24, #1A5C48)', bgIcon: 'heart' },
    ]);

    function handleLight() {
        if (!hasLit && message.trim()) {
            setCandleCount((p) => p + 1);
            setHasLit(true);
            setStatuses((p) => [
                { name: 'You', initials: 'YO', time: 'Just now', text: message, gradient: 'linear-gradient(145deg, #1A0E06, #3A1E0E)', bgIcon: 'candle', isUser: true },
                ...p,
            ]);
            setTimeout(() => {
                if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            }, 100);
        }
    }

    const tracks = [
        { title: 'Amazing Grace', artist: 'Memorial Hymns', duration: '4:12', idx: 0 },
        { title: 'Nearer My God to Thee', artist: 'Grace Community Choir', duration: '3:48', idx: 1 },
        { title: 'It Is Well With My Soul', artist: 'Heritage Hymns', duration: '5:01', idx: 2 },
    ];

    const features = [
        { icon: <MessageCircle size={18} />, title: 'Status-Style Memory Posts', desc: 'Share memories as status updates — green backgrounds, personal messages, seen by family in real-time.', building: false },
        { icon: <CandleIcon lit size={30} />, title: 'Realistic Candle Lighting', desc: 'Light beautiful virtual candles with animated flames. Each one glows as a symbol of remembrance.', building: false },
        { icon: <Music size={18} />, title: 'Memorial Music & Hymns', desc: 'Play hymns and meaningful music. Simulated audio to help families grieve together.', building: true },
        { icon: <Shield size={18} />, title: 'Private Safe Space', desc: 'Only people with the link can access. No trolls, no noise — just family grieving together.', building: false },
        { icon: <Mic size={18} />, title: 'Voice Messages & Audio', desc: 'Record spoken memories, prayers, or words of comfort. Hear the voices of those you miss.', building: true },
        { icon: <Camera size={18} />, title: 'Photo Gallery & Posts', desc: 'Upload photos and write posts. Build a timeline of memories celebrating a life well lived.', building: false },
    ];

    const relatedLinks = [
        { to: '/mortuary-management-software', label: 'Mortuary Management Software' },
        { to: '/funeral-home-management-software', label: 'Funeral Home ERP' },
        { to: '/hospital-mortuary-software', label: 'Hospital Mortuary Software' },
        { to: '/hearse-management', label: 'Hearse Management Software' },
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: "Inter", sans-serif; color: #5C5C5C; background: #FFFFFF; -webkit-font-smoothing: antialiased; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
        .container { max-width: 1180px; margin: 0 auto; padding: 0 clamp(1.25rem, 5vw, 2.5rem); }
        .status-scroll { display: flex; gap: 0.85rem; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 0.75rem; -ms-overflow-style: none; scrollbar-width: none; }
        .status-scroll::-webkit-scrollbar { display: none; }
        .btn-outline { display: inline-flex; align-items: center; gap: 0.5rem; background: transparent; color: #5C5C5C; border: 1px solid #E3DDD0; padding: 0.85rem 2rem; border-radius: 8px; font-size: 0.88rem; font-weight: 500; cursor: pointer; font-family: "Inter", sans-serif; transition: all 0.25s ease; }
        .btn-outline:hover { border-color: #8A8780; color: #1A1A1A; transform: translateY(-2px); }
        .btn-outline-dark { display: inline-flex; align-items: center; gap: 0.5rem; background: transparent; color: rgba(250,248,244,0.5); border: 1px solid rgba(250,248,244,0.12); padding: 0.85rem 2rem; border-radius: 8px; font-size: 0.88rem; font-weight: 500; cursor: pointer; font-family: "Inter", sans-serif; transition: all 0.25s ease; }
        .btn-outline-dark:hover { border-color: rgba(250,248,244,0.25); color: rgba(250,248,244,0.8); transform: translateY(-2px); }
        .btn-gold { display: inline-flex; align-items: center; gap: 0.5rem; background: #8B7355; color: #fff; border: none; padding: 0.85rem 2rem; border-radius: 8px; font-size: 0.88rem; font-weight: 600; cursor: pointer; font-family: "Inter", sans-serif; transition: all 0.25s ease; }
        .btn-gold:hover { background: #A98F6E; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(139,115,85,0.3); }
        .related-link { display: flex; align-items: center; gap: 0.6rem; padding: 0.9rem 1.1rem; background: #FAF8F4; border: 1px solid #E3DDD0; border-radius: 10px; font-size: 0.82rem; color: #5C5C5C; transition: all 0.25s ease; cursor: pointer; text-decoration: none; }
        .related-link:hover { background: #fff; border-color: rgba(61,79,71,0.15); color: #1A1A1A; transform: translateX(4px); box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
        .related-link svg { flex-shrink: 0; color: #3D4F47; opacity: 0.5; transition: opacity 0.2s; }
        .related-link:hover svg { opacity: 1; }
        @media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr !important; } .grid-3 { grid-template-columns: 1fr !important; } .grid-4 { grid-template-columns: 1fr 1fr !important; } }
      `}</style>

            <div style={{ background: C.wh, color: C.txS, fontFamily: SANS, overflowX: 'hidden' }}>

                {/* HERO */}
                <section style={{ position: 'relative', padding: 'clamp(4.5rem, 10vw, 8rem) 0 clamp(4rem, 9vw, 6.5rem)', overflow: 'hidden', background: C.black }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 45% 35% at 50% 35%, rgba(199,123,94,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '52px 52px', maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 60%)', WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 60%)', pointerEvents: 'none' }} />

                    <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                        <FadeUp>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: MONO, fontSize: '0.65rem', color: 'rgba(250,248,244,0.25)', letterSpacing: '0.02em', marginBottom: '2rem' }}>
                                <span>Home</span><ChevronRight size={10} /><span>Online Memorial</span>
                            </div>
                        </FadeUp>

                        <FadeUp delay={80}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}><CandleIcon lit size={140} /></div>
                        </FadeUp>

                        <FadeUp delay={160}>
                            <p style={{ textAlign: 'center', fontFamily: MONO, fontSize: '0.6rem', color: C.brass, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>RestPoint</p>
                            <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', color: C.bone, fontWeight: 500, lineHeight: 1.12, letterSpacing: '-0.03em', marginBottom: '0.85rem', textAlign: 'center' }}>
                                A Safe Space for Families<br />to <span style={{ background: 'linear-gradient(135deg, #C77B5E, #D4956E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Mourn Online</span>
                            </h1>
                        </FadeUp>

                        <FadeUp delay={240}>
                            <p style={{ fontSize: '1rem', color: 'rgba(250,248,244,0.5)', lineHeight: 1.85, textAlign: 'center', maxWidth: 560, margin: '0 auto 1.5rem' }}>
                                When distance separates family, we bring them together. A dignified space where loved ones share memories, light candles, and grieve — from anywhere in the world.
                            </p>
                        </FadeUp>

                        <FadeUp delay={320}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                                <div style={{ background: 'rgba(250,248,244,0.04)', border: '1px solid rgba(250,248,244,0.07)', borderRadius: '10px', padding: '0.85rem 1.5rem', textAlign: 'center' }}>
                                    <div style={{ fontFamily: SERIF, fontSize: '1.5rem', color: C.brass, fontWeight: 500 }}>KES 3,000</div>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(250,248,244,0.3)', marginTop: '0.15rem' }}>3 weeks</div>
                                </div>
                                <div style={{ color: 'rgba(250,248,244,0.12)', fontSize: '0.75rem' }}>or</div>
                                <div style={{ background: 'rgba(199,123,94,0.05)', border: '1px solid rgba(199,123,94,0.12)', borderRadius: '10px', padding: '0.85rem 1.5rem', textAlign: 'center' }}>
                                    <div style={{ fontFamily: SERIF, fontSize: '1.5rem', color: C.acc, fontWeight: 500 }}>KES 4,000</div>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(250,248,244,0.3)', marginTop: '0.15rem' }}>4 weeks (max)</div>
                                </div>
                            </div>
                        </FadeUp>

                        <FadeUp delay={400}>
                            <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button className="btn-outline-dark" onClick={() => navigate('/contact')}>Talk to Us <ExternalLink size={13} /></button>
                            </div>
                        </FadeUp>
                    </div>
                </section>

                {/* ONE OF A KIND — WHITE */}
                <section style={{ padding: '2.5rem 0', background: C.wh, textAlign: 'center', borderTop: '1px solid #E3DDD0', borderBottom: '1px solid #E3DDD0' }}>
                    <div className="container">
                        <FadeUp>
                            <p style={{ fontFamily: SERIF, fontSize: 'clamp(1.05rem, 2.2vw, 1.5rem)', color: C.tx, fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '0.5rem' }}>
                                One of a kind in history. We bring it to you.
                            </p>
                            <p style={{ fontFamily: MONO, fontSize: '0.55rem', color: C.txT, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                                RestPoint — Dignity over all things software, where it matters
                            </p>
                        </FadeUp>
                    </div>
                </section>

                {/* STATUS DEMO — BLACK */}
                <section style={{ padding: 'clamp(3.5rem, 7vw, 5.5rem) 0', background: C.black, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '40%', left: '45%', transform: 'translate(-50%, -50%)', width: '500px', height: '350px', background: 'radial-gradient(ellipse, rgba(10,92,82,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                        <FadeUp>
                            <SectionLabel light>Experience It</SectionLabel>
                            <SectionHeading light>Share Memories in Real-Time</SectionHeading>
                            <p style={{ fontSize: '0.92rem', color: 'rgba(250,248,244,0.4)', lineHeight: 1.75, maxWidth: 520, marginBottom: '2.5rem' }}>
                                Family posts memories as status updates — just like WhatsApp status. Green backgrounds, personal messages, everyone sees them as they come in.
                            </p>
                        </FadeUp>

                        <FadeUp delay={100}>
                            <div className="status-scroll" ref={scrollRef} style={{ marginLeft: 'calc(-1.25rem)', paddingLeft: 'calc(1.25rem + (100vw - 1180px) / 2)', paddingRight: '3rem' }}>
                                {statuses.map((s, i) => <StatusCard key={i} {...s} />)}
                            </div>
                        </FadeUp>

                        <FadeUp delay={200}>
                            <div style={{ maxWidth: 520, margin: '2rem auto 0', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1 }}>
                                    <textarea placeholder="Write your message of remembrance..." value={message} onChange={(e) => { setMessage(e.target.value); if (hasLit) setHasLit(false); }} style={{ width: '100%', background: 'rgba(250,248,244,0.04)', border: '1px solid rgba(250,248,244,0.08)', color: C.bone, fontFamily: SANS, fontSize: '0.82rem', resize: 'none', outline: 'none', minHeight: '3rem', borderRadius: '8px', padding: '0.6rem 0.75rem', lineHeight: 1.5 }} />
                                </div>
                                <button onClick={handleLight} disabled={!message.trim() || hasLit} style={{ padding: '0.6rem 1.25rem', background: hasLit ? 'rgba(139,115,85,0.1)' : 'transparent', color: hasLit ? C.brass : 'rgba(250,248,244,0.45)', border: '1px solid ' + (hasLit ? '#8B7355' : 'rgba(250,248,244,0.1)'), borderRadius: '8px', cursor: hasLit ? 'default' : 'pointer', fontFamily: MONO, fontSize: '0.68rem', letterSpacing: '0.04em', fontWeight: 500, whiteSpace: 'nowrap', transition: 'all 0.25s ease', height: '3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    {hasLit ? '✨ Lit' : '🕯️ Light'}
                                </button>
                            </div>
                            <p style={{ textAlign: 'center', fontSize: '0.6rem', color: 'rgba(250,248,244,0.15)', marginTop: '0.75rem', fontFamily: MONO }}>
                                {candleCount} candles lit · Your message appears as a new status post
                            </p>
                        </FadeUp>
                    </div>
                </section>

                <Divider dark />

                {/* AUDIO — BLACK */}
                <section style={{ padding: 'clamp(3.5rem, 7vw, 5.5rem) 0', background: C.black2, position: 'relative' }}>
                    <div className="container">
                        <FadeUp>
                            <SectionLabel light>Music to Grieve</SectionLabel>
                            <SectionHeading light>Simulated Audio for Families</SectionHeading>
                            <p style={{ fontSize: '0.92rem', color: 'rgba(250,248,244,0.4)', lineHeight: 1.75, maxWidth: 520, marginBottom: '2.5rem' }}>
                                Play memorial hymns and music to help families grieve together. These are simulated audio players — the real experience is being built.
                            </p>
                        </FadeUp>

                        <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {tracks.map((t, i) => (
                                <FadeUp key={i} delay={150 + i * 80}>
                                    <AudioPlayer {...t} />
                                </FadeUp>
                            ))}
                        </div>

                        <FadeUp delay={400}>
                            <p style={{ fontSize: '0.65rem', color: 'rgba(250,248,244,0.15)', marginTop: '1.5rem', fontFamily: MONO, fontStyle: 'italic' }}>
                                Simulated audio · Full music integration currently in development
                            </p>
                        </FadeUp>
                    </div>
                </section>

                <Divider dark />

                {/* FEATURES — LIGHT */}
                <section style={{ padding: 'clamp(3.5rem, 7vw, 5.5rem) 0', background: C.bone, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '30%', left: '40%', transform: 'translate(-50%, -50%)', width: '500px', height: '350px', background: 'radial-gradient(ellipse, rgba(139,115,85,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                        <FadeUp>
                            <SectionLabel>What&apos;s Included</SectionLabel>
                            <SectionHeading sub="Everything your family needs to mourn, remember, and heal. Some features are still in the pipeline — available now, improving daily.">Memorial Features</SectionHeading>
                        </FadeUp>
                        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {features.map((f, i) => (
                                <FadeUp key={i} delay={i * 65}>
                                    <div style={{ background: C.wh, border: '1px solid #E3DDD0', borderRadius: '12px', padding: '1.5rem 1.25rem', position: 'relative', overflow: 'hidden', height: '100%' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: C.vdP, border: '1px solid rgba(61,79,71,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.vd, marginBottom: '0.85rem' }}>{f.icon}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
                                            <h3 style={{ fontSize: '0.88rem', color: C.tx, fontWeight: 600, lineHeight: 1.3 }}>{f.title}</h3>
                                            {f.building && <BuildBadge />}
                                        </div>
                                        <p style={{ fontSize: '0.78rem', color: C.txT, lineHeight: 1.65 }}>{f.desc}</p>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                        <FadeUp delay={400}>
                            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: C.txT, maxWidth: 440, margin: '1.75rem auto 0', lineHeight: 1.7, fontStyle: 'italic' }}>
                                &ldquo;Building&rdquo; features are in active development and testing. We build the pipeline — you use it now.
                            </p>
                        </FadeUp>
                    </div>
                </section>

                <Divider />

                {/* PRICING — WHITE */}
                <section style={{ padding: 'clamp(3.5rem, 7vw, 5.5rem) 0', background: C.wh }}>
                    <div className="container">
                        <FadeUp>
                            <SectionLabel>Pricing</SectionLabel>
                            <SectionHeading sub="No subscriptions. No hidden fees. Choose the time your family needs to grieve.">Simple, Honest Pricing</SectionHeading>
                        </FadeUp>

                        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', maxWidth: 740, margin: '0 auto' }}>
                            <FadeUp delay={100}>
                                <div style={{ background: C.bone, border: '1px solid #E3DDD0', borderRadius: '16px', padding: '2rem 1.75rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #8B7355, transparent)' }} />
                                    <div style={{ fontSize: '0.68rem', fontFamily: MONO, color: C.txT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.85rem' }}>Standard</div>
                                    <div style={{ fontFamily: SERIF, fontSize: '2.5rem', color: C.tx, fontWeight: 500, lineHeight: 1, marginBottom: '0.2rem' }}>KES 3,000</div>
                                    <div style={{ fontSize: '0.82rem', color: C.txT, marginBottom: '0.5rem' }}>3 weeks</div>
                                    <div style={{ width: 40, height: 1, background: '#E3DDD0', margin: '0 auto 1.25rem' }} />
                                    <div style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
                                        {['Private memorial portal', 'Status-style memory posts', 'Realistic candle lighting', 'Photo gallery & posts', 'Private & safe space'].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0', fontSize: '0.8rem', color: C.txS }}>
                                                <span style={{ color: C.vd, fontSize: '0.7rem' }}>✓</span>{item}
                                            </div>
                                        ))}
                                    </div>
                                    <button className="btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/contact')}>Talk to Us <ExternalLink size={13} /></button>
                                </div>
                            </FadeUp>

                            <FadeUp delay={200}>
                                <div style={{ background: C.black, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2rem 1.75rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #C77B5E, transparent)' }} />
                                    <div style={{ position: 'absolute', top: '0.85rem', right: '0.85rem', background: C.acc, color: '#fff', fontSize: '0.55rem', fontFamily: MONO, fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px', letterSpacing: '0.05em' }}>MAX</div>
                                    <div style={{ fontSize: '0.68rem', fontFamily: MONO, color: 'rgba(250,248,244,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.85rem' }}>Extended</div>
                                    <div style={{ fontFamily: SERIF, fontSize: '2.5rem', color: C.bone, fontWeight: 500, lineHeight: 1, marginBottom: '0.2rem' }}>KES 4,000</div>
                                    <div style={{ fontSize: '0.82rem', color: 'rgba(250,248,244,0.35)', marginBottom: '0.5rem' }}>4 weeks (maximum)</div>
                                    <div style={{ width: 40, height: 1, background: 'rgba(250,248,244,0.08)', margin: '0 auto 1.25rem' }} />
                                    <div style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
                                        {['Everything in Standard', 'Full 4-week access', 'Priority support', 'Extended photo uploads', 'Voice & music (building)'].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0', fontSize: '0.8rem', color: 'rgba(250,248,244,0.6)' }}>
                                                <span style={{ color: C.acc, fontSize: '0.7rem' }}>✓</span>{item}
                                            </div>
                                        ))}
                                    </div>
                                    <button className="btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/contact')}>Talk to Us <ExternalLink size={13} /></button>
                                </div>
                            </FadeUp>
                        </div>
                    </div>
                </section>

                <Divider />

                {/* CTA — BLACK */}
                <section style={{ padding: 'clamp(3rem, 6vw, 4.5rem) 0', background: C.black }}>
                    <div className="container" style={{ textAlign: 'center' }}>
                        <FadeUp><CandleIcon lit size={70} /></FadeUp>
                        <FadeUp delay={80}>
                            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: C.bone, fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.02em', margin: '1rem 0 0.65rem' }}>
                                Give Your Family a Safe Space to Grieve
                            </h2>
                            <p style={{ fontSize: '0.9rem', color: 'rgba(250,248,244,0.35)', lineHeight: 1.75, maxWidth: 460, margin: '0 auto 1.75rem' }}>
                                For KES 3,000, create a private memorial where your family can mourn together — with candles, status posts, music, and love.
                            </p>
                        </FadeUp>
                        <FadeUp delay={160}>
                            <button className="btn-outline-dark" onClick={() => navigate('/contact')}>Talk to Us <ExternalLink size={13} /></button>
                        </FadeUp>
                        <FadeUp delay={240}>
                            <p style={{ fontFamily: MONO, fontSize: '0.55rem', color: 'rgba(250,248,244,0.1)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '2rem' }}>
                                Dignity over all things software, where it matters
                            </p>
                        </FadeUp>
                    </div>
                </section>

                {/* RELATED — WHITE */}
                <section style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 0', background: C.wh }}>
                    <div className="container">
                        <FadeUp>
                            <SectionLabel>Explore</SectionLabel>
                            <SectionHeading sub="">Related Services</SectionHeading>
                        </FadeUp>
                        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                            {relatedLinks.map((r, i) => (
                                <FadeUp key={i} delay={i * 60}>
                                    <a href={r.to} className="related-link"><ChevronRight size={12} />{r.label}</a>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}