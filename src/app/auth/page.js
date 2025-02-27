"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../utils/authSlice";
import "./page.css";

export default function Page() {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      toast.success(`Bienvenue ${user.pseudo}`);
      router.push("/");
    } else if (error) {
      toast.error(error);
    }
  }, [user, error, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(loginUser(mail, password));
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
        <div className="input-group-signin">
          <input
            type={passwordType}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-password"
            placeholder="Mot de passe"
          />
          <span className="icon-visibility" onClick={togglePasswordVisibility}>
            {passwordType === "password" ? (
              <MdVisibility />
            ) : (
              <MdVisibilityOff />
            )}
          </span>
        </div>
        <button className="button-signin" type="submit">
          Connexion
        </button>
        <div className="bottom-text-signin">
          <p>
            Vous n&apos;avez pas encore de compte ?{" "}
            <Link href="/auth/signup">Inscrivez-vous !</Link>
          </p>
          <p>
            <Link href="/auth/reset">Mot de passe oublié</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
