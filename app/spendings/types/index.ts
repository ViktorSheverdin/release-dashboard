export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export interface DashboardIntent {
  key: string
  label: string
  components: string[]
}
