export type CreditStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'expired'

export type CreditType =
  | 'purchase'
  | 'commission'
  | 'refund'
  | 'admin_credit'
  | 'admin_debit'
  | 'bonus'
  | 'cashback'
  | 'transfer_in'
  | 'transfer_out'
  | 'payment'
