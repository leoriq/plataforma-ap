import { redirect } from 'next/navigation'

export default function InstructorPage() {
  redirect('/auth/instructor/classes')
}
