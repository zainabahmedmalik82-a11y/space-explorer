export default function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-[16px] bg-white/5 ${className}`} />
}