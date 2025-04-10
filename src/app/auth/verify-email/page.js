"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Page() {
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const handleEmailVerification = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          await user.reload();
          if (user.emailVerified) {
            try {
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/verifyEmail`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ firebaseUID: user.uid }),
                }
              );

              if (!response.ok) {
                const errorData = await response.json();
                console.error(
                  "Erreur lors de la réponse du serveur :",
                  errorData
                );
              } else {
                router.push("/auth");
              }
            } catch (error) {
              console.error("Erreur lors de l'appel à l'API :", error);
            }
          } else {
            console.error("L'utilisateur n'a pas encore vérifié son email.");
          }
        } else {
          console.error("Aucun utilisateur trouvé.");
        }
      });
    };

    handleEmailVerification();
  }, [auth, router]);

  return (
    <div className="waiting-validation">
      <h2>Vérification de l&apos;email en cours...</h2>
      <p>Veuillez patienter pendant que nous vérifions votre email.</p>
    </div>
  );
}
