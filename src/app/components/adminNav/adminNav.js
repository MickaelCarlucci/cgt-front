import "./adminNav.css";
import Link from "next/link";

export default function AdminNav() {
  return (
    <div className="navAdmin">
      <nav className="navbar-admin">
        {}
        <Link href="#">Gérer les utilisateurs</Link>
      </nav>
    </div>
  )
}
