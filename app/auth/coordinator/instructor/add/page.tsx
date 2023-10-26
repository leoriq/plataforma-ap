import AddUserForm from '~/components/molecules/AddUserForm'

export default function AddInstructor() {
  return (
    <AddUserForm role="INSTRUCTOR" redirectUrl="/auth/coordinator/instructor" />
  )
}
