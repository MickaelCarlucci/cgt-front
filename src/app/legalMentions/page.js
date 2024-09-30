import "./page.css";
export default function Page() {
  return (
    <div>
    <div>
      <h1>Mentions légales du site.</h1>
      <p>
        Cette application a pour but d&apos;informer et d&apos;entretenir un
        lien entre les élus CGT de l&apos;entreprise Teleperformance France et les salariés de l&apos;entreprise.
      </p>
      <p>Le siège du syndicat CGT se situe au, 263 rue de Paris 93100 Montreuil. <br />Ghrib Malika ou Autre personne du syndicat a mettre  <br /> SIREN: 77567845100060 </p>
      <p></p>
    </div>
    <div>Représentant légal du site: Didier Thiebauld</div>
    <div>
        <p>Ce site est hébergé par Hostinger International Ltd, société privée à responsabilité limitée de Chypre, dont l&apos;adresse est 61 Lordou Vironos str. 6023 Larnaca, Chypre</p>
        <p>mail: compliance@hostinger.com</p>
    </div>
    <div>
        Les contenus du site <span>[Nom du site]</span> (textes, images, logos, etc.) sont la
        propriété exclusive du Syndicat CGT de l&apos;entreprise Teteperformance.
        Toute reproduction totale ou partielle de ces éléments est interdite
        sans l&apos;autorisation préalable du syndicat.
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
          à des fins commerciales. Vous disposez d&apos;un droit d&apos;accès, de
          rectification et de suppression de vos données personnelles. Pour
          exercer ces droits, vous pouvez consulter votre profil directement sur
          le site ou contacter Didier Thiebauld à l&apos;adresse suivante : [email de
          contact].
        </p>
        <p>Ce site n&apos;utilise pas de cookie qui exploite vos données.</p>
      </div>
    </div>
  );
}
