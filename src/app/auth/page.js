"use client";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import { MdMode, MdVisibility, MdVisibilityOff } from "react-icons/md";
import Link from "next/link"
import './page.css'

export default function Page() {
    const [mail, setMail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordType, setPasswordType] = useState("password");
    const router = useRouter();
    const { data: session, status } = useSession();

    // Cette fonction est appelée après la connexion réussie pour afficher le toast
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            toast.success(`Bienvenue ${session.user.pseudo}`);
        }
    }, [status, session]);

    const handleLogin = async (e) => {
        e.preventDefault();

        const result = await signIn("credentials", {
            redirect: false,
            email: mail,
            password: password,
        });

        if (result.ok) {
            // On redirige l'utilisateur vers la page d'accueil après la connexion
            router.push("/");
        } else {
            toast.error("La connexion a échoué");
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordType(passwordType === "password" ? "text" : "password");
      };

    return (
        <div className="login-container-signin">
        <form className="login-form-signin" onSubmit={handleLogin}>
        <p className="heading-signin">Connexion</p>
        <div className="input-group-signin">
            <input
                type="email"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                placeholder="Mail"
            />
            </div>
            <div className="input-group-signin" style={{ position: "relative" }}>
  <input
    type={passwordType}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    style={{ width: "88%" }} // Assure que l'input prend toute la largeur
    placeholder="Mot de passe"
  />
  <span
    className="icon-visibility"
    onClick={togglePasswordVisibility}
  >
    {passwordType === "password" ? <MdVisibility /> : <MdVisibilityOff />}
  </span>
</div>
            <button className="button-signin" type="submit">Connexion</button>
            <div className="bottom-text-signin">
            <p>Vous n&apos;avez pas encore de compte ? <Link href="/auth/signup">Inscrivez-vous !</Link></p>
            <p><Link href="/auth/reset">Mot de passe oublié</Link></p>
            </div>
        </form>
        </div>
    );
}