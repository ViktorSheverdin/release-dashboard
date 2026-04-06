import type {
  SummaryCardData,
  BarChartData,
  TabbedBarChartData,
  TransactionListData,
  PayrollData,
} from '../types'

// ── Weekly Snapshot ─────────────────────────────────────────────────

export const weeklySummaryCards: SummaryCardData[] = [
  {
    label: 'Total Revenue',
    value: '$44,636.89',
    icon: 'dollar',
    trend: { direction: 'up', percentage: '+12.4%' },
    variant: 'green',
  },
  {
    label: 'Total Expenses',
    value: '$38,516.45',
    icon: 'chart',
    trend: { direction: 'up', percentage: '+8.2%' },
    variant: 'red',
  },
  {
    label: 'Net Cash Flow',
    value: '$6,120.44',
    icon: 'trending',
    trend: { direction: 'up', percentage: '+3.1%' },
    variant: 'green',
  },
  {
    label: 'Pending Invoices',
    value: '$3,200',
    icon: 'wallet',
    trend: { direction: 'down', percentage: '-5.0%' },
    variant: 'amber',
  },
]

export const weeklyBarChart: BarChartData = {
  title: 'Revenue vs Expenses',
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Revenue',
      values: [6200, 8100, 5400, 7300, 9200, 4800, 3600],
      color: '#4A7C59',
    },
    {
      label: 'Expenses',
      values: [4800, 6200, 5100, 5900, 7100, 5200, 4200],
      color: '#E07A5F',
    },
  ],
}

export const weeklyTransactions: TransactionListData = {
  title: 'Recent Transactions',
  dateRange: 'Feb 01 — Feb 26, 2026',
  items: [
    {
      id: 't1',
      vendor: 'Stripe',
      category: 'Sales & Marketing',
      amount: 8500.0,
      date: '28 May 2026',
      tags: [{ label: 'Revenue', color: '#4A7C59' }],
      clients: 4,
    },
    {
      id: 't2',
      vendor: 'Welch and Sons',
      category: 'Sales & Marketing > Advertising',
      amount: 3200.0,
      date: '27 May 2026',
      tags: [{ label: 'Team name', color: '#6B8F71' }],
    },
    {
      id: 't3',
      vendor: 'Bosco Mills Co',
      category: 'Sales & Marketing',
      amount: 2800.0,
      date: '26 May 2026',
      tags: [{ label: 'Team name', color: '#6B8F71' }],
    },
    {
      id: 't4',
      vendor: 'Alfred Schuppe',
      category: 'Sales & Marketing',
      amount: 1450.0,
      date: '25 May 2026',
      tags: [{ label: 'Tag', color: '#8B9DC3' }],
    },
    {
      id: 't5',
      vendor: 'Twilio',
      category: 'Sales & Marketing > Advertising',
      amount: 980.0,
      date: '24 May 2026',
      tags: [{ label: 'Product', color: '#B8A9C9' }],
    },
    {
      id: 't6',
      vendor: 'Google Ads',
      category: 'Marketing',
      amount: 5200.0,
      date: '23 May 2026',
      tags: [{ label: 'Ad Spend', color: '#E07A5F' }],
    },
    {
      id: 't7',
      vendor: 'Meta Ads',
      category: 'Marketing',
      amount: 4350.0,
      date: '22 May 2026',
      tags: [{ label: 'Ad Spend', color: '#E07A5F' }],
    },
    {
      id: 't8',
      vendor: 'LinkedIn',
      category: 'Marketing',
      amount: 2900.0,
      date: '21 May 2026',
      tags: [{ label: 'Campaign', color: '#8B9DC3' }],
    },
  ],
}

// ── Ad Spend ────────────────────────────────────────────────────────

export const adSpendSummaryCards: SummaryCardData[] = [
  {
    label: 'Total Ad Spend',
    value: '$12,450.00',
    icon: 'dollar',
    trend: { direction: 'up', percentage: '+15.3%' },
    variant: 'red',
  },
  {
    label: 'Google Ads',
    value: '$5,200.00',
    icon: 'chart',
    trend: { direction: 'up', percentage: '+8.1%' },
    variant: 'neutral',
  },
  {
    label: 'Meta Ads',
    value: '$4,350.00',
    icon: 'trending',
    trend: { direction: 'down', percentage: '-3.2%' },
    variant: 'neutral',
  },
  {
    label: 'LinkedIn Ads',
    value: '$2,900.00',
    icon: 'tag',
    trend: { direction: 'up', percentage: '+22.0%' },
    variant: 'amber',
  },
]

export const adSpendBarChart: BarChartData = {
  title: 'Weekly Ad Spend by Platform',
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'Google Ads',
      values: [1200, 1400, 1100, 1500],
      color: '#4285F4',
    },
    {
      label: 'Meta Ads',
      values: [1100, 1000, 1200, 1050],
      color: '#1877F2',
    },
    {
      label: 'LinkedIn',
      values: [600, 750, 800, 750],
      color: '#0A66C2',
    },
  ],
}

// ── Payroll ──────────────────────────────────────────────────────────

export const payrollSummaryCards: SummaryCardData[] = [
  {
    label: 'Total Payroll',
    value: '$28,300.00',
    icon: 'dollar',
    trend: { direction: 'neutral', percentage: '0.0%' },
    variant: 'neutral',
  },
  {
    label: 'Employees Paid',
    value: '10 / 12',
    icon: 'users',
    variant: 'green',
  },
  {
    label: 'Avg. Salary',
    value: '$2,358',
    icon: 'chart',
    variant: 'neutral',
  },
  {
    label: 'Benefits & Tax',
    value: '$4,620.00',
    icon: 'wallet',
    trend: { direction: 'up', percentage: '+2.1%' },
    variant: 'amber',
  },
]

export const payrollData: PayrollData = {
  title: 'Payroll Summary',
  period: 'March 2026',
  totalAmount: 28300.0,
  items: [
    { id: 'p1', name: 'Sarah Chen', department: 'Engineering', amount: 4200.0, status: 'paid', date: 'Mar 01' },
    { id: 'p2', name: 'Marcus Johnson', department: 'Engineering', amount: 3800.0, status: 'paid', date: 'Mar 01' },
    { id: 'p3', name: 'Emily Rodriguez', department: 'Design', amount: 3200.0, status: 'paid', date: 'Mar 01' },
    { id: 'p4', name: 'James Kim', department: 'Sales', amount: 2800.0, status: 'paid', date: 'Mar 01' },
    { id: 'p5', name: 'Aisha Patel', department: 'Marketing', amount: 2600.0, status: 'paid', date: 'Mar 01' },
    { id: 'p6', name: 'David Thompson', department: 'Engineering', amount: 2500.0, status: 'paid', date: 'Mar 01' },
    { id: 'p7', name: 'Lisa Wang', department: 'Operations', amount: 2400.0, status: 'processing', date: 'Mar 01' },
    { id: 'p8', name: 'Omar Hassan', department: 'Sales', amount: 2100.0, status: 'paid', date: 'Mar 01' },
    { id: 'p9', name: 'Rachel Green', department: 'HR', amount: 1800.0, status: 'paid', date: 'Mar 01' },
    { id: 'p10', name: 'Tom Bradley', department: 'Support', amount: 1500.0, status: 'pending', date: 'Mar 01' },
    { id: 'p11', name: 'Nina Kowalski', department: 'Marketing', amount: 800.0, status: 'paid', date: 'Mar 01' },
    { id: 'p12', name: 'Alex Rivera', department: 'Design', amount: 600.0, status: 'paid', date: 'Mar 01' },
  ],
}

export const payrollBarChart: BarChartData = {
  title: 'Payroll by Department',
  labels: ['Eng', 'Design', 'Sales', 'Mktg', 'Ops', 'HR', 'Support'],
  datasets: [
    {
      label: 'Payroll',
      values: [10500, 3800, 4900, 3400, 2400, 1800, 1500],
      color: '#4A7C59',
    },
  ],
}

// ── Weekly snapshot tabbed chart ────────────────────────────────────

export const weeklyTabbedChart: TabbedBarChartData = {
  tabs: ['Payments', 'Expenses', 'Payroll'],
  datasets: {
    Payments: {
      title: 'Incoming Payments',
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        { label: 'Payments', values: [6200, 8100, 5400, 7300, 9200, 4800, 3600], color: '#4A7C59' },
      ],
    },
    Expenses: {
      title: 'Outgoing Expenses',
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        { label: 'Expenses', values: [4800, 6200, 5100, 5900, 7100, 5200, 4200], color: '#E07A5F' },
        { label: 'Ad Spend', values: [1200, 1800, 900, 2100, 1600, 800, 500], color: '#F2C14E' },
      ],
    },
    Payroll: {
      title: 'Payroll by Department',
      labels: ['Eng', 'Design', 'Sales', 'Mktg', 'Ops', 'HR', 'Support'],
      datasets: [
        { label: 'Payroll', values: [10500, 3800, 4900, 3400, 2400, 1800, 1500], color: '#635BFF' },
      ],
    },
  },
}

// ── Data map for the component registry ─────────────────────────────

export const mockDataMap: Record<string, unknown> = {
  'weekly-summary-cards': weeklySummaryCards,
  'weekly-bar-chart': weeklyBarChart,
  'weekly-tabbed-chart': weeklyTabbedChart,
  'weekly-transactions': weeklyTransactions,
  'adspend-summary-cards': adSpendSummaryCards,
  'adspend-bar-chart': adSpendBarChart,
  'payroll-summary-cards': payrollSummaryCards,
  'payroll-bar-chart': payrollBarChart,
  'payroll-data': payrollData,
}
