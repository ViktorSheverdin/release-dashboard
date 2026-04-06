import type { ChatMessage } from '../types'

const MOCK_RESPONSES: Record<string, string> = {
  default: `Hello Business Owner,

Here's a quick financial overview of your performance over the past period.

Your net cash flow for this period stands at **$-22,120.94**. While expenses were significant, you generated a healthy revenue of **$48,840.70** across 6 transaction categories.

Key highlights:
1. **Weekly Ad Spend** totaled **$12,450.00** across Google Ads, Meta, and LinkedIn campaigns
2. **Payroll** processed successfully — **$28,300.00** distributed to 12 employees
3. **Vendor Payments** — 8 transactions totaling **$6,200.50**
4. **Subscription Services** — $1,890.24 across 14 active subscriptions

Would you like me to dive deeper into any of these categories? You can ask about recent transactions, weekly ad spend breakdown, or payroll details.`,

  spending: `Here's your spending breakdown for the current period:

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

Want me to show you the weekly ad spend details or recent transactions?`,

  transactions: `I've pulled up your recent transactions. You can see the detailed breakdown in the panel on the right.

The most active categories this period were **Sales & Marketing** with 23 transactions and **Operations** with 15 transactions.

Notable items:
- **Stripe** processed 4 client payments totaling **$8,500.00**
- **Welch and Sons** — Advertising campaign payment of **$3,200.00**
- **Bosco Mills Co** — Monthly retainer of **$2,800.00**

Click on any transaction in the panel to see similar transactions and patterns.`,
}

function getResponseForMessage(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('spend') || lower.includes('breakdown') || lower.includes('budget')) {
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

    const fullResponse = getResponseForMessage(content)
    const assistantId = generateId()
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }
    messages.value = [...messages.value, assistantMessage]

    // Simulate streaming by adding words progressively
    const words = fullResponse.split(' ')
    let accumulated = ''
    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20 + Math.random() * 30))
      accumulated += (i === 0 ? '' : ' ') + words[i]
      // Replace the last message with updated content to trigger reactivity
      messages.value = messages.value.map((m) =>
        m.id === assistantId ? { ...m, content: accumulated } : m
      )
    }

    // Mark streaming complete
    messages.value = messages.value.map((m) =>
      m.id === assistantId ? { ...m, isStreaming: false } : m
    )
    isResponding.value = false
  }

  return {
    messages: readonly(messages),
    isResponding: readonly(isResponding),
    sendMessage,
  }
}
