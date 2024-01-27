import { redirect } from 'next/navigation'

import EditProfileForm from '~/components/molecules/EditProfileForm'
import getAuthorizedSessionUser from '~/utils/getAuthorizedSessionUser'

export default async function ProfilePage() {
  const user = await getAuthorizedSessionUser()
  if (!user) {
    redirect('/sign-out')
  }

  const parsedUser = {
    id: user.id,
    email: user.email || '',
    fullName: user.fullName || '',
    profilePictureFileId: user.profilePictureFileId || '',
  }

  return <EditProfileForm user={parsedUser} />
}
