import type { ChatMessage } from '../types'

const MOCK_RESPONSES: Record<string, { text: string; intent: string }> = {
  all: {
    intent: 'all',
    text: `Here's everything in one view — all dashboard components rendered together.`,
  },

  default: {
    intent: 'weekly-snapshot',
    text: `Hello Business Owner,

Here's a quick financial overview of your performance over the past period.

Your net cash flow for this period stands at **$-22,120.94**. While expenses were significant, you generated a healthy revenue of **$48,840.70** across 6 transaction categories.

Key highlights:
1. **Weekly Ad Spend** totaled **$12,450.00** across Google Ads, Meta, and LinkedIn campaigns
2. **Payroll** processed successfully — **$28,300.00** distributed to 12 employees
3. **Vendor Payments** — 8 transactions totaling **$6,200.50**
4. **Subscription Services** — $1,890.24 across 14 active subscriptions

Would you like me to dive deeper into any of these categories? You can ask about recent transactions, weekly ad spend breakdown, or payroll details.`,
  },

  spending: {
    intent: 'ad-spend',
    text: `Here's your spending breakdown for the current period:

**Total Outflow: $48,840.70**

By category:
- Advertising & Marketing: **$12,450.00** (25.5%)
- Payroll & Benefits: **$28,300.00** (57.9%)
- Software & Subscriptions: **$1,890.24** (3.9%)
- Vendor & Supplier Payments: **$6,200.50** (12.7%)

Your top 3 vendors by spend:
1. Google Ads — $5,200.00
2. Stripe Processing Fees — $3,100.50
3. AWS Infrastructure — $1,240.00

I've loaded the ad spend breakdown in the dashboard. Want me to show payroll details or recent transactions?`,
  },

  transactions: {
    intent: 'transactions',
    text: `I've pulled up your recent transactions in the dashboard panel.

The most active categories this period were **Sales & Marketing** with 23 transactions and **Operations** with 15 transactions.

Notable items:
- **Stripe** processed 4 client payments totaling **$8,500.00**
- **Welch and Sons** — Advertising campaign payment of **$3,200.00**
- **Bosco Mills Co** — Monthly retainer of **$2,800.00**

Click on any transaction in the panel to see similar transactions and patterns.`,
  },

  payroll: {
    intent: 'payroll',
    text: `Here's your payroll summary for March 2026:

**Total Payroll: $28,300.00** distributed to **12 employees**.

By department:
- Engineering: **$10,500.00** (3 employees)
- Sales: **$4,900.00** (2 employees)
- Design: **$3,800.00** (2 employees)
- Marketing: **$3,400.00** (2 employees)

All payments have been processed successfully except **1 pending** and **1 processing**. I've loaded the full breakdown in the dashboard.`,
  },
}

function getResponseForMessage(message: string): { text: string; intent: string } {
  const lower = message.toLowerCase()
  if (lower.includes('all') || lower.includes('everything') || lower.includes('component')) {
    return MOCK_RESPONSES.all!
  }
  if (lower.includes('payroll') || lower.includes('salary') || lower.includes('employee')) {
    return MOCK_RESPONSES.payroll!
  }
  if (lower.includes('spend') || lower.includes('ad') || lower.includes('budget') || lower.includes('breakdown')) {
    return MOCK_RESPONSES.spending!
  }
  if (lower.includes('transaction') || lower.includes('recent') || lower.includes('payment')) {
    return MOCK_RESPONSES.transactions!
  }
  return MOCK_RESPONSES.default!
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function useChat() {
  const messages = ref<ChatMessage[]>([])
  const isResponding = ref(false)
  const currentIntent = ref<string | null>(null)

  async function sendMessage(content: string) {
    if (!content.trim() || isResponding.value) return

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }
    messages.value = [...messages.value, userMessage]

    isResponding.value = true

    const response = getResponseForMessage(content)
    const assistantId = generateId()
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      dashboardIntent: response.intent,
    }
    messages.value = [...messages.value, assistantMessage]

    // Trigger the dashboard view immediately
    currentIntent.value = response.intent

    // Simulate streaming
    const words = response.text.split(' ')
    let accumulated = ''
    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20 + Math.random() * 30))
      accumulated += (i === 0 ? '' : ' ') + words[i]
      messages.value = messages.value.map((m) =>
        m.id === assistantId ? { ...m, content: accumulated } : m
      )
    }

    messages.value = messages.value.map((m) =>
      m.id === assistantId ? { ...m, isStreaming: false } : m
    )
    isResponding.value = false
  }

  return {
    messages: readonly(messages),
    isResponding: readonly(isResponding),
    currentIntent: readonly(currentIntent),
    sendMessage,
  }
}
