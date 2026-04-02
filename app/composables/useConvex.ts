import type { FunctionReference, FunctionArgs, FunctionReturnType } from 'convex/server'
import type { ConvexClient } from 'convex/browser'

export function useConvexClient(): ConvexClient {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$convex as ConvexClient
}

export function useConvexQuery<Query extends FunctionReference<'query'>>(
  query: Query,
  args: FunctionArgs<Query>
) {
  const client = useConvexClient()
  const data = ref<FunctionReturnType<Query> | null>(null)
  const error = ref<Error | null>(null)
  const pending = ref(true)

  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    unsubscribe = client.onUpdate(query, args, (result) => {
      data.value = result
      pending.value = false
    })
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return { data, error, pending }
}

export function useConvexMutation<Mutation extends FunctionReference<'mutation'>>(
  mutation: Mutation
) {
  const client = useConvexClient()
  const pending = ref(false)
  const error = ref<Error | null>(null)

  async function execute(args: FunctionArgs<Mutation>) {
    pending.value = true
    error.value = null
    try {
      const result = await client.mutation(mutation, args)
      return result
    } catch (e: any) {
      error.value = e
      throw e
    } finally {
      pending.value = false
    }
  }

  return { execute, pending, error }
}

export function useConvexAction<Action extends FunctionReference<'action'>>(
  action: Action
) {
  const client = useConvexClient()
  const pending = ref(false)
  const error = ref<Error | null>(null)

  async function execute(args: FunctionArgs<Action>) {
    pending.value = true
    error.value = null
    try {
      const result = await client.action(action, args)
      return result
    } catch (e: any) {
      error.value = e
      throw e
    } finally {
      pending.value = false
    }
  }

  return { execute, pending, error }
}
