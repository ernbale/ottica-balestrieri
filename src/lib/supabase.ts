import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Re-export types
export * from '@/types/database'

// Helper functions for common operations
export async function getStoreId(): Promise<string> {
  // For now, return the first store. In multi-store setup, this would come from auth context
  const { data } = await supabase
    .from('stores')
    .select('id')
    .limit(1)
    .single()

  return data?.id || ''
}

// Generate unique codes
export function generateCode(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

// Format date
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }
  return new Intl.DateTimeFormat('it-IT', options || defaultOptions).format(
    typeof date === 'string' ? new Date(date) : date
  )
}

// Format datetime
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(typeof date === 'string' ? new Date(date) : date)
}

// Prescription display helpers
export function formatDiottria(value: number | null): string {
  if (value === null || value === undefined) return '-'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}`
}

export function formatAsse(value: number | null): string {
  if (value === null || value === undefined) return '-'
  return `${value}°`
}

export function formatPD(value: number | null): string {
  if (value === null || value === undefined) return '-'
  return `${value.toFixed(1)} mm`
}
