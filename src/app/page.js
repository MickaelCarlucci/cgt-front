"use client"
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import "./page.module.css";

export default function Page() {
  const { data: session, status } = useSession();
  const [information, setInformation] = useState(null);
  const [pdf, setPdf] = useState();
  const [poll, setPoll] = useState();
  const [error, setError] = useState();

  const roles = session?.user?.roles?.split(", ") || [];
  const hasAccess = ["Admin", "SuperAdmin", "Membre"].some((role) =>
    roles.includes(role)
);

  useEffect(() => {
    async function fetchNews() {
      try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/information/news`);
        const data = await response.json();
        setInformation(data);

      } catch (error) {
        setError("Erreur lors de la soumission.");
        console.error("Submission Error:", error);
    }
    }
    fetchNews();
  }, [])

  return (
    <>
      <h1>Bienvenue sur le site de la CGT Teleperformance France</h1>
    <div>
      {information && (
        <div key={information.id}>
        <h2>{information.title}</h2>
        <div> {information.contain.split("|").map((paragraph, index) => (
          <p key={index}> {paragraph.trim()} </p>
        ))} </div>
        {information.image_url && (
          <Image
          src={`${process.env.NEXT_PUBLIC_API_URL}${info.image_url}`}
          alt="Une image syndicaliste"
          width={500}
          height={300}
          layout="intrinsic"
          objectFit="cover"
        />
        )}
        </div>
      )}
    </div>
      {hasAccess && (
        
      )}
    </>
  );
}
