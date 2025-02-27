import "./page.css";
export default function Page() {
  return (
    <div className="container-legalMentions">
      <div>
        <h1 className="mention-h1">Mentions légales du site.</h1>
        <p>
          Cette application a pour but d&apos;informer et d&apos;entretenir un
          lien entre les élus CGT de l&apos;entreprise Teleperformance France et
          les salariés de l&apos;entreprise.
        </p>
        <p>
          Le syndicat se situe au <br /> 139 rue Joseph Brunet
          <br /> BP 90159 <br /> 33042 Bordeaux Cedex <br />
          Représentant légal du syndicat de Bordeaux: Ghrib Malika <br />
        </p>
        <p></p>
      </div>
      <div>Représentant légal du site: Didier Thiebauld</div>
      <div>
        <p>
          Ce site est hébergé par Hostinger International Ltd, société privée à
          responsabilité limitée de Chypre, dont l&apos;adresse est 61 Lordou
          Vironos str. 6023 Larnaca, Chypre
        </p>
        <p>mail: compliance@hostinger.com</p>
      </div>
      <div>
        Les contenus du site <span className="bold">cgt-tp.fr</span> (textes,
        images, logos, etc.) sont la propriété exclusive du Syndicat CGT de
        l&apos;entreprise Teleperformance. Toute reproduction totale ou
        partielle de ces éléments est interdite sans l&apos;autorisation
        préalable du syndicat.
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
          à des fins commerciales. Vous disposez d&apos;un droit d&apos;accès,
          de rectification et de suppression de vos données personnelles. Pour
          exercer ces droits, vous pouvez consulter votre profil directement sur
          le site ou contacter Didier Thiebauld à l&apos;adresse suivante :
          didier51.cse@gmail.com
        </p>
        <p>Ce site n&apos;utilise pas de cookies qui exploite vos données.</p>
      </div>
    </div>
  );
}
