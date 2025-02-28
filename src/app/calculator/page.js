"use client";

import { useState } from "react";
import "./page.css";

export default function Calculateur() {
  const [formData, setFormData] = useState({
    status: "",
    salariesBrut: "",
    rqth: false,
    dateNaissance: "",
    dateAnciennete: "",
    dateDepart: "",
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const calculerIndemnite = () => {
    const { status, salariesBrut, dateAnciennete, dateDepart, dateNaissance } =
      formData;
    if (
      !status ||
      !salariesBrut ||
      !dateAnciennete ||
      !dateDepart ||
      !dateNaissance
    ) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const salaireRef = salariesBrut / 12;
    const dateAnc = new Date(dateAnciennete);
    const dateDep = new Date(dateDepart);
    const anciennete = dateDep.getFullYear() - dateAnc.getFullYear();
    const age =
      new Date().getFullYear() - new Date(dateNaissance).getFullYear();

    let indemniteLegale = anciennete * (salaireRef * 0.25);
    let indemniteSpecifique = anciennete * 3000;
    let montantTotal = indemniteLegale + indemniteSpecifique;
    const plafond = 70000;
    if (montantTotal > plafond) montantTotal = plafond;
    const montantNetTotal = montantTotal * 0.927;
    const allocationBrute = salaireRef * 0.75;
    const allocationNette = allocationBrute * 0.933;

    setResult({
      anciennete,
      age,
      salaireRef,
      indemniteLegale,
      indemniteSpecifique,
      montantTotal,
      montantNetTotal,
      allocationBrute,
      allocationNette,
      plafond,
    });
  };

  return (
    <div className="container-calculator">
      <h1>Calculateur d&apos;Indemnité</h1>
      <table className="table-calculator">
        <tbody>
          <tr>
            <td>Statut :</td>
            <td>
              <select
                name="status"
                onChange={handleChange}
                value={formData.status}
              >
                <option value="">Sélectionnez</option>
                <option value="non_cadres">Non Cadres</option>
                <option value="cadres">Cadres</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Salaire Annuel Brut (€) :</td>
            <td>
              <input
                type="number"
                name="salariesBrut"
                onChange={handleChange}
                value={formData.salariesBrut}
              />
            </td>
          </tr>
          <tr>
            <td>Date de naissance :</td>
            <td>
              <input
                type="date"
                name="dateNaissance"
                onChange={handleChange}
                value={formData.dateNaissance}
              />
            </td>
          </tr>
          <tr>
            <td>Date d&apos;ancienneté :</td>
            <td>
              <input
                type="date"
                name="dateAnciennete"
                onChange={handleChange}
                value={formData.dateAnciennete}
              />
            </td>
          </tr>
          <tr>
            <td>Date de départ prévisible :</td>
            <td>
              <input
                type="date"
                name="dateDepart"
                onChange={handleChange}
                value={formData.dateDepart}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <button type="button" onClick={calculerIndemnite}>
        Calculer
      </button>
      {result && (
        <table className="result-table">
          <tbody>
            <tr>
              <th colSpan="2">INFORMATIONS GÉNÉRALES</th>
            </tr>
            <tr>
              <td>Votre ancienneté :</td>
              <td>{result.anciennete} ans</td>
            </tr>
            <tr>
              <td>Votre âge au départ :</td>
              <td>{result.age} ans</td>
            </tr>
            <tr>
              <td>Salaire de référence :</td>
              <td>{result.salaireRef.toFixed(2)} €</td>
            </tr>
            <tr>
              <td>Plafond appliqué :</td>
              <td>{result.plafond} €</td>
            </tr>
            <tr>
              <th colSpan="2">INDÉMNITÉS</th>
            </tr>
            <tr>
              <td>Indemnité légale :</td>
              <td>{result.indemniteLegale.toFixed(2)} €</td>
            </tr>
            <tr>
              <td>Indemnité spécifique :</td>
              <td>{result.indemniteSpecifique.toFixed(2)} €</td>
            </tr>
            <tr>
              <td>Montant Total Estimé :</td>
              <td>{result.montantTotal.toFixed(2)} €</td>
            </tr>
            <tr>
              <td>Montant net (après déduction CSG/CRDS)* :</td>
              <td className="result-net">
                {result.montantNetTotal.toFixed(2)} €
              </td>
            </tr>
            <tr>
              <th colSpan="2">ALLOCATION MENSUELLE</th>
            </tr>
            <tr>
              <td>Allocation mensuelle brute ** :</td>
              <td>{result.allocationBrute.toFixed(2)} €</td>
            </tr>
            <tr>
              <td>Allocation mensuelle nette *** :</td>
              <td className="result-net">
                {result.allocationNette.toFixed(2)} €
              </td>
            </tr>
          </tbody>
          <div className="little-mention-calculator">
            <p>
              * Dans la limite de 2 x le plafond annuel de la Sécurité Sociale
              (PASS), l&apos;indemnité légale n&apos;est pas assujettie à la
              cotisation de la CSG (9,2%) et de la CRDS (0,5%) contrairement à
              l&apos;indemnité spécifique.
            </p>
            <p>
              L&apos;indemnité de licenciement est exonérée d&apos;impôt en
              totalité dans le cadre d&apos;un plan social (plan de sauvegarde
              de l&apos;emploi appelé PSE).
            </p>
            <p>
              ** L&apos;allocation mensuelle brute proposée par
              l&apos;entreprise correspond à 75% du salaire de référence. Cette
              allocation ne peut être inférieure à 85% du SMIC soit 1531.53 €.
            </p>
            <p>
              *** La CSG applicable à l&apos;allocation versée dans le cadre du
              congé de reclassement est soumise à une CSG de 6,2% (et non 9,2%)
            </p>
          </div>
        </table>
      )}
      <p className="dedicace">© 2025 Didier - Tous droits réservés</p>
    </div>
  );
}
