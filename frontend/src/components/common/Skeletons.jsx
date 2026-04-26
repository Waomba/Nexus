// Skeleton loader for posts while feed is loading

function Shimmer({ width = '100%', height = 16, radius = 6, style = {} }) {
  return (
    <div style={{
      width, height,
      borderRadius: radius,
      background: 'linear-gradient(90deg, var(--nx-bg3) 25%, var(--border) 50%, var(--nx-bg3) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      ...style,
    }} />
  )
}

export function PostSkeleton() {
  return (
    <div className="post-card" style={{ opacity: 0.7 }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-1" style={{ marginBottom: '0.75rem' }}>
        <Shimmer width={40} height={40} radius={50} />
        <div style={{ flex: 1 }}>
          <Shimmer width="40%" height={14} style={{ marginBottom: 6 }} />
          <Shimmer width="25%" height={11} />
        </div>
      </div>

      {/* Content lines */}
      <Shimmer width="100%" height={13} style={{ marginBottom: 8 }} />
      <Shimmer width="90%"  height={13} style={{ marginBottom: 8 }} />
      <Shimmer width="70%"  height={13} style={{ marginBottom: 16 }} />

      {/* Image placeholder (sometimes) */}
      <Shimmer width="100%" height={180} radius={10} style={{ marginBottom: 12 }} />

      {/* Action bar */}
      <div className="flex gap-1">
        <Shimmer width={60} height={28} radius={6} />
        <Shimmer width={60} height={28} radius={6} />
        <Shimmer width={60} height={28} radius={6} />
      </div>
    </div>
  )
}

export function FeedSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </>
  )
}

export function UserCardSkeleton() {
  return (
    <div className="card flex items-center gap-1" style={{ marginBottom: '0.5rem', opacity: 0.7 }}>
      <Shimmer width={44} height={44} radius={50} />
      <div style={{ flex: 1 }}>
        <Shimmer width="50%" height={14} style={{ marginBottom: 6 }} />
        <Shimmer width="35%" height={11} />
      </div>
      <Shimmer width={80} height={32} radius={6} />
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card" style={{ opacity: 0.7 }}>
      <Shimmer width="60%" height={12} style={{ marginBottom: 12 }} />
      <Shimmer width="40%" height={32} />
    </div>
  )
}
