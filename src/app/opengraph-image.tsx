import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(150deg, #0f172a 0%, #0d2818 50%, #0f172a 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Mark */}
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 28 }}>
          <line x1="6" y1="6" x2="6" y2="18" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
          <line x1="6" y1="6" x2="16" y2="6" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
          <line x1="6" y1="12" x2="14" y2="12" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
          <line x1="14" y1="12" x2="18" y2="18" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 6 Q19 6 19 9 Q19 12 14 12" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
        <div style={{ fontSize: 64, fontStyle: 'italic', color: 'white', letterSpacing: -1 }}>
          Reckon
        </div>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.6)', marginTop: 16 }}>
          Financial clarity — expense tracking &amp; analytics
        </div>
      </div>
    ),
    { ...size },
  )
}
