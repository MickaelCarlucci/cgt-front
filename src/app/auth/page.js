"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
    const [mail, setMail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();

        const result = await signIn("credentials", {
            redirect: false,
            email: mail,
            password: password,
        });

        if (!result.error) {
            router.push("/");
        } else {
            alert("Login failed");
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <input type="email" value={mail} onChange={(e) => setMail(e.target.value)} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Connexion</button>
        </form>
    );
}