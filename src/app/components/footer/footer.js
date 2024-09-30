import "./footer.css";
import Link from "next/link";
import { FaFacebook, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <div className="footer">
      <div>
        <p className="bold">
          Site du syndicat CGT élu dans l&apos;entreprise Teleperformance
        </p>
      </div>
      <div>
        <p>
          Si vous souhaitez contacter l&apos;un de vos représentants n&apos;hésitez pas à
          vous diriger vers la rubrique <Link href="/contact">contact</Link>
        </p>
        <p><Link href={"/legalMentions"}>Mentions légales</Link></p>
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
