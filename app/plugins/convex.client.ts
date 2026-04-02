import { ConvexClient } from 'convex/browser'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const url = config.public.convexUrl as string

  if (!url) {
    console.warn('[convex] No CONVEX_URL configured')
    return
  }

  const client = new ConvexClient(url)

  return {
    provide: {
      convex: client,
    },
  }
})
