import { act } from "react";

export default async function Page(props) {
  
    const data = await fetch('http://localhost:3003/api/admin/activities')
    const activities = await data.json();

  
  
  
  return (
    <>
    <h1>Bonjour Projet</h1>
    
    </>
    
  )
}

