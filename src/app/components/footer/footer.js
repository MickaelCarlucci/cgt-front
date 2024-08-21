import React from "react";
import "./footer.css";
import Link from "next/link";
import { FaFacebook, FaTwitter } from "react-icons/fa";

export default function footer() {
  return (
    <div className="footer">
      <div>
        <p className="bold">
          Site du syndicat CGT élu dans l'entreprise Teleperformance
        </p>
        <p>Siège: 263 rue de Paris 93100 Montreuil.</p>
        <p>Nom et prénom d'un représentant de la fédé</p>
        <p>SIREN: 77567845100060</p>
      </div>

      <div>Représentant légal du site: Didier Thiebauld</div>

      <div>
        <p className="bold">Ce site est hébergé par vercel.com</p>
        <p>
          Vercel Inc. 440 N Barranca Avenue #4133 Covina, CA 91723, United
          States
        </p>
        <p>mail: privacy@vercel.com</p>
      </div>

      <div>
        Les contenus du site [Nom du site] (textes, images, logos, etc.) sont la
        propriété exclusive du Syndicat CGT de l'entreprise Teteperformance.
        Toute reproduction totale ou partielle de ces éléments est interdite
        sans l'autorisation préalable du syndicat.
      </div>

      <div>
        <p className="bold underline">Protection des données personnelles :</p>
        <p>
          Les données personnelles collectées sur le site sont utilisées pour
          vous authentifier (ces informations sécurisées permettent de vous
          reconnaître lors de vos connexions) et vous informer (les adresses
          électroniques enregistrées servent uniquement à vous notifier les
          nouveaux documents disponibles sur le site ou les sondages nécessitant
          votre avis). En aucun cas, vos données ne sont utilisées ou revendues
          à des fins commerciales. Vous disposez d'un droit d'accès, de
          rectification et de suppression de vos données personnelles. Pour
          exercer ces droits, vous pouvez consulter votre profil directement sur
          le site ou contacter Didier Thiebauld à l'adresse suivante : [email de
          contact].
        </p>
        <p>Ce site n'utilise pas de cookie qui exploite vos données.</p>
      </div>

      <div>
        <p>
          Si vous souhaitez contacter l'un de vos représentants n'hésitez pas à
          vous diriger vers la rubrique <Link href="/contact">contact</Link>
        </p>
      </div>
      <div className="target">
        Suivez-nous également sur nos autres réseaux
        <Link href="https://www.facebook.com/p/CGT-T%C3%A9l%C3%A9performance-France-100065475420295/">
          <FaFacebook size={18} /> facebook.com/cgt-teleperformance
        </Link>
        <Link href="https://x.com/CGT_TPF">
          <FaTwitter size={18} /> x.com/cgt_tpf
        </Link>
      </div>
    </div>
  );
}
