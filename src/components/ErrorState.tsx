import GlassCard from './GlassCard'

type Props = { message: string; onRetry: () => void }

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <GlassCard>
      <p className="text-[var(--blocked)]">Something went wrong: {message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-[10px] border border-[var(--border)] bg-white/5 px-4 py-2 text-sm hover:border-[var(--border-hover)]"
      >
        Retry
      </button>
    </GlassCard>
  )
}