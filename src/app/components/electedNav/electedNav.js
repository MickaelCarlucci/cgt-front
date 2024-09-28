import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ElectedNav() {
  const { data: session, status } = useSession();
  const roles = session?.user?.roles?.split(", ") || [];

  if (status !== "authenticated") {
    return null; 
}

  return (
    <>
      <div>
        {roles.includes("DS") ||
          roles.includes("CSE") ||
          roles.includes("SuperAdmin") ||
          (roles.includes("Admin") && <Link href={"#"}>CSE</Link>)}

        {roles.includes("DS") ||
          roles.includes("CSSCT") ||
          roles.includes("SuperAdmin") ||
          (roles.includes("Admin") && <Link href={"#"}>CSSCT</Link>)}

        {roles.includes("DS") ||
          roles.includes("RP") ||
          roles.includes("SuperAdmin") ||
          (roles.includes("Admin") && <Link href={"#"}>RP</Link>)}
      </div>
    </>
  );
}
