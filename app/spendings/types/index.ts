export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
  /** The dashboard intent this message should trigger */
  dashboardIntent?: string
}

// ── Dashboard component data types ──────────────────────────────────

export interface SummaryCardData {
  label: string
  value: string
  icon?: 'dollar' | 'chart' | 'users' | 'trending' | 'wallet' | 'tag'
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    percentage: string
  }
  variant: 'green' | 'red' | 'amber' | 'neutral'
}

export interface BarChartData {
  title: string
  labels: string[]
  datasets: {
    label: string
    values: number[]
    color: string
  }[]
}

export interface TransactionItem {
  id: string
  vendor: string
  category: string
  subcategory?: string
  amount: number
  date: string
  tags: { label: string; color: string }[]
  clients?: number
}

export interface TransactionListData {
  title: string
  dateRange?: string
  items: TransactionItem[]
}

export interface PayrollItem {
  id: string
  name: string
  department: string
  amount: number
  status: 'paid' | 'pending' | 'processing'
  date: string
}

export interface PayrollData {
  title: string
  period: string
  items: PayrollItem[]
  totalAmount: number
}

// ── Component registry ──────────────────────────────────────────────

export interface TabbedBarChartData {
  tabs: string[]
  datasets: Record<string, BarChartData>
}

export type DashboardComponentType = 'summary-cards' | 'bar-chart' | 'tabbed-bar-chart' | 'transaction-list' | 'payroll-table'

export interface DashboardComponentConfig {
  type: DashboardComponentType
  dataKey: string
  props?: Record<string, unknown>
}

export interface DashboardView {
  title: string
  subtitle?: string
  components: DashboardComponentConfig[]
}
