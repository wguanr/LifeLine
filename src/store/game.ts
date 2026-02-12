// Legacy compatibility - redirect to new stores
import { useUserStore } from '@/stores/user'

export const initUser = () => {
  const userStore = useUserStore()
  userStore.initUser()
}
