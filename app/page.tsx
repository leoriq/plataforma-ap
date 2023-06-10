import Link from 'next/link'

export default function Home() {
  return (
    <nav>
      <Link href="/login">Login</Link>
      <Link href="/signup">Register</Link>
    </nav>
  )
}
