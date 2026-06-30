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
          background: '#0f172a',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '48px 48px',
          display: 'flex',
        }} />

        {/* Blue glow */}
        <div style={{
          position: 'absolute', top: -160, left: '50%',
          width: 700, height: 500, borderRadius: '50%',
          background: 'radial-gradient(ellipse,rgba(30,64,175,0.5) 0%,transparent 70%)',
          transform: 'translateX(-50%)',
          display: 'flex',
        }} />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '64px 80px', justifyContent: 'space-between' }}>
          {/* Logo mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 13, background: '#1e40af',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, padding: '8px 10px',
            }}>
              <div style={{ width: 8, height: 14, borderRadius: 3, background: 'rgba(255,255,255,0.45)' }} />
              <div style={{ width: 8, height: 22, borderRadius: 3, background: 'rgba(255,255,255,0.72)' }} />
              <div style={{ width: 8, height: 30, borderRadius: 3, background: '#fff' }} />
            </div>
            <span style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: -1 }}>Reckon</span>
          </div>

          {/* Main headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
              <span style={{ color: '#fff' }}>Your money,</span>
              <br />
              <span style={{
                background: 'linear-gradient(135deg,#60a5fa,#34d399)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}>
                finally clear.
              </span>
            </div>
            <div style={{ fontSize: 26, color: 'rgba(148,163,184,1)', maxWidth: 680, lineHeight: 1.5 }}>
              Upload a bank statement and instantly see where your money goes — budgets, analytics, and insights.
            </div>
          </div>

          {/* Bottom row — stats */}
          <div style={{ display: 'flex', gap: 40 }}>
            {[
              { value: '< 5s', label: 'to parse a statement' },
              { value: '100%', label: 'private & secure' },
              { value: '49 MAD', label: 'per month' },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{s.value}</span>
                <span style={{ fontSize: 16, color: 'rgba(148,163,184,0.8)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side — mini dashboard mockup */}
        <div style={{
          position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
          width: 340, display: 'flex', flexDirection: 'column', gap: 10,
          opacity: 0.25,
        }}>
          {[
            { label: 'Total spent', value: '4,280 MAD', color: '#f87171' },
            { label: 'Total income', value: '14,800 MAD', color: '#34d399' },
            { label: 'Saved this month', value: '10,520 MAD', color: '#60a5fa' },
          ].map((k) => (
            <div key={k.label} style={{
              background: 'rgba(255,255,255,0.07)', borderRadius: 12,
              padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>{k.label}</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
