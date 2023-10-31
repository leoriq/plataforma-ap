import { permanentRedirect } from 'next/navigation'

export default function CoordinatorPage() {
  permanentRedirect('/auth/coordinator/instructor')
}
