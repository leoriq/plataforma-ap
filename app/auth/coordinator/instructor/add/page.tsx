import AddUserForm from '../../components/AddUserForm'

export default function AddInstructor() {
  return (
    <>
      <h1>Adicionar Instrutor</h1>
      <AddUserForm roles="INSTRUCTOR" />
    </>
  )
}
