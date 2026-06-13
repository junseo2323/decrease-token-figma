import type { CSSProperties, ReactNode } from 'react';
import { BatteryFull, Home, Settings, Signal, Star, UserRound, Users, Wifi } from 'lucide-react';

const avatarSrc = 'http://localhost:3845/assets/79d8a751adb21b20224bebf3e1935a3d8f938290.png';

function StatusBar() {
  return (
    <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 0 36px', color: '#0b0a09', fontWeight: 700, fontSize: 16 }}>
      <span>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <Signal size={18} strokeWidth={3} fill="#0b0a09" />
        <Wifi size={17} strokeWidth={3} />
        <BatteryFull size={24} strokeWidth={2.5} />
      </div>
    </div>
  );
}

function ActionButton({ children }: { children: string }) {
  return (
    <button style={{
      width: 174,
      height: 40,
      border: '1px solid rgba(108,101,95,0.16)',
      borderRadius: 8,
      background: 'transparent',
      color: 'rgba(47,43,39,0.88)',
      fontSize: 14,
      fontWeight: 500,
    }}>
      {children}
    </button>
  );
}

function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <section style={{
      width: 361,
      boxSizing: 'border-box',
      background: '#f7f5f3',
      borderRadius: 8,
      ...style,
    }}>
      {children}
    </section>
  );
}

function SpiralBinding() {
  return (
    <div style={{ position: 'absolute', top: -7, left: 22, right: 22, display: 'flex', justifyContent: 'space-between' }}>
      {Array.from({ length: 14 }).map((_, index) => (
        <span key={index} style={{ width: 8, height: 14, borderRadius: 5, background: '#ddd8d3', display: 'block' }} />
      ))}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ width: 88, textAlign: 'center' }}>
      <div style={{ color: '#1a1815', fontSize: 20, lineHeight: '28px', fontWeight: 700 }}>{value}</div>
      <div style={{ color: '#1a1815', fontSize: 13, lineHeight: '20px', fontWeight: 400 }}>{label}</div>
    </div>
  );
}

function Tag({ children, muted = false }: { children: string; muted?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 28,
      padding: '0 10px',
      borderRadius: 7,
      background: '#ede9e5',
      color: muted ? 'rgba(47,43,39,0.61)' : 'rgba(47,43,39,0.88)',
      fontSize: muted ? 13 : 14,
      fontWeight: 500,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

function BottomNav() {
  const itemStyle = { width: 72, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 3, fontSize: 12 };
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 94, borderTop: '1px solid #ddd8d3', background: '#e9e6e2' }}>
      <div style={{ height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-around', paddingTop: 8 }}>
        <div style={{ ...itemStyle, color: '#8e867f' }}><Home size={23} fill="currentColor" strokeWidth={0} /><span>홈</span></div>
        <div style={{ ...itemStyle, color: '#8e867f' }}><Users size={24} fill="currentColor" strokeWidth={0} /><span>대화방</span></div>
        <div style={{ ...itemStyle, color: '#1a1815', fontWeight: 600 }}><UserRound size={24} fill="currentColor" strokeWidth={0} /><span>프로필</span></div>
      </div>
      <div style={{ width: 139, height: 5, borderRadius: 999, background: '#0b0a09', margin: '9px auto 0' }} />
    </div>
  );
}

export default function BridgeProfile() {
  return (
    <main style={{
      width: 393,
      height: 973,
      position: 'relative',
      overflow: 'hidden',
      background: '#e9e6e2',
      color: '#1a1815',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      letterSpacing: 0,
    }}>
      <StatusBar />

      <header style={{ position: 'relative', height: 59, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ margin: 0, color: '#1a1815', fontSize: 17, fontWeight: 700, lineHeight: '24px' }}>내 프로필</h1>
        <Settings size={22} strokeWidth={2.6} style={{ position: 'absolute', right: 18, top: 18 }} />
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 100, height: 100, borderRadius: 999, background: '#ddd8d3', border: '1px solid rgba(108,101,95,0.08)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={avatarSrc} alt="" style={{ width: 86, height: 86, objectFit: 'contain' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, lineHeight: '32px', fontWeight: 800, letterSpacing: -0.2 }}>개굴개굴렌</div>
          <div style={{ marginTop: 7, color: 'rgba(47,43,39,0.61)', fontSize: 15, fontWeight: 600 }}>25~29세 · 남성 · 서울</div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 7 }}>
          <ActionButton>프로필 수정</ActionButton>
          <ActionButton>소개 노트 수정</ActionButton>
        </div>
      </section>

      <div style={{ position: 'absolute', left: 16, top: 391, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card style={{ position: 'relative', height: 107, padding: '32px 16px 16px' }}>
          <SpiralBinding />
          <div style={{ color: 'rgba(47,43,39,0.61)', fontSize: 14, fontWeight: 700, marginBottom: 9 }}>한 줄 소개</div>
          <p style={{ margin: 0, color: '#1a1815', fontSize: 16, lineHeight: '26px', fontWeight: 500 }}>주말마다 한강 산책하는 걸 좋아해요!</p>
        </Card>

        <Card style={{ height: 118, padding: '17px 16px 16px' }}>
          <div style={{ color: 'rgba(47,43,39,0.61)', fontSize: 14, fontWeight: 700, marginBottom: 18 }}>내 통계</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 25 }}>
            <Stat value="5" label="참여 주차" />
            <Stat value="3" label="매칭 성사" />
            <Stat value="2" label="만남 횟수" />
          </div>
        </Card>

        <Card style={{ height: 185, padding: '17px 16px 16px' }}>
          <div style={{ color: 'rgba(47,43,39,0.61)', fontSize: 14, fontWeight: 700, marginBottom: 19 }}>받은 평가</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 20 }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={22} fill="#567c57" color="#567c57" strokeWidth={2} />
            ))}
            <span style={{ marginLeft: 3, fontSize: 17, lineHeight: '24px', fontWeight: 700 }}>4.7</span>
            <span style={{ color: 'rgba(47,43,39,0.61)', fontSize: 12, fontWeight: 600 }}>(30)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Tag>대화가 편하고 좋았어요</Tag>
            <Tag>약속 시간 잘 지켜요</Tag>
            <Tag>친절하고 배려가 넘쳐서 좋아요</Tag>
            <Tag muted>+27</Tag>
          </div>
        </Card>
      </div>

      <BottomNav />
    </main>
  );
}
