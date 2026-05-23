import { formatMMK } from '../lib/formatters'

interface Props {
  amount: number
  className?: string
}

export default function CurrencyDisplay({ amount, className = '' }: Props) {
  return <span className={className}>{formatMMK(amount)}</span>
}
