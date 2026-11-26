# Surligneur d'entités nommées — extension Firefox

Repère les entités nommées de la page ouverte, les surligne par couleur, ajoute une coche après
chacune et exporte la sélection (ou tout) en CSV. **Analyse 100 % locale** : aucun texte n'est
envoyé sur Internet.

| Couleur | Type |
|---|---|
| Jaune | Personnes |
| Fuchsia | Œuvres (livres, films, tableaux, albums…) |
| Vert | Institutions / organisations |
| Bleu | Lieux |
| Orange | Événements |
| Lavande | Dates |
| Gris | Autres noms propres (désactivé par défaut) |

## Langue de l'interface

L'interface (fenêtre de l'extension, panneau, messages, en-têtes et types du CSV, nom du fichier) suit
la langue de l'interface de Firefox : **français** si Firefox est en français, **anglais** dans tous les autres cas.
Les textes sont dans `_locales/en/messages.json` et `_locales/fr/messages.json`. Pour ajouter une langue,
copiez le dossier `_locales/en` sous le code de la langue (ex. `_locales/es`) et traduisez les valeurs
`message`. La détection des entités, elle, fonctionne quelle que soit la langue de l'interface.

## Installation dans Firefox (140 ou plus récent)

**Essai rapide (temporaire)** — l'extension disparaît à la fermeture de Firefox :

1. Ouvrez `about:debugging#/runtime/this-firefox`.
2. Cliquez **Charger un module complémentaire temporaire…**.
3. Choisissez le fichier `.zip` tel quel (ou le fichier `manifest.json` du dossier décompressé).

**Installation permanente** — Firefox n'accepte que les extensions signées par Mozilla :

1. Créez un compte sur https://addons.mozilla.org/developers/ et choisissez **Soumettre un nouveau module**.
2. Optez pour la distribution **« Sur votre propre site » (non listée)** : la signature est automatique,
   gratuite, en général en quelques minutes, et l'extension n'est pas publiée sur le catalogue.
   (En ligne de commande : `npx web-ext sign --channel=unlisted` avec vos clés d'API AMO.)
3. Téléchargez le fichier `.xpi` signé et glissez-le dans une fenêtre Firefox.

Alternative sans signature : Firefox Developer Edition, Nightly ou ESR, avec
`xpinstall.signatures.required` à `false` dans `about:config`.

L'identifiant de l'extension (`ner-surligneur@bib.umontreal.ca` dans `manifest.json`) peut être modifié
avant la première soumission ; il doit ensuite rester le même pour les mises à jour.

**Raccourci clavier** : Alt+Maj+E. Pour le changer : `about:addons` → roue dentée →
**Gérer les raccourcis d'extensions**.

## Utilisation

- **Paramétrer** : dans la fenêtre de l'extension (clic sur l'icône), cochez les types à repérer,
  le séparateur CSV (point-virgule recommandé pour Excel en français) et l'affichage des coches.
- **Analyser** : bouton *Analyser cette page*, ou raccourci **Alt+Maj+E**.
- **Dans la page** : chaque entité surlignée est suivie d'une coche. Cocher une occurrence coche
  toutes les occurrences de la même entité.
- **Panneau flottant** (déplaçable par son en-tête) :
  - **Tout exporter** (en haut à droite) : toutes les entités des types cochés ;
  - **Exporter la sélection** (en bas) : seulement les entités cochées ;
  - cases des types pour afficher/masquer chaque couleur, avec le nombre d'entités ;
  - liste filtrable : clic sur un nom = défiler jusqu'à l'occurrence suivante ; menu déroulant
    pour **corriger le type** ou **ignorer** une entité (mémorisé jusqu'au rechargement de la page) ;
  - **Relancer** : nouvelle analyse (pages dynamiques), les coches sont conservées.

Le CSV (UTF-8 avec BOM) contient : `Entité, Type, Occurrences, Page` (en anglais : `Entity, Type, Occurrences, Page`).

## Comment la détection fonctionne

Moteur heuristique sans IA : mots à majuscule et particules (de, van, von, of, d'…), mots-indices
multilingues (Université, Museum, Festival, rue, lac…), titres (Dr, Mme, président…), dictionnaires de
prénoms et de lieux, initiales, sigles, guillemets « » “ ” „ “ 《 》 『 』, balises `<cite>`, `<i>`, `<em>`,
contexte (« le roman X », « X (1802-1885) »), cohérence à l'échelle de la page (un nom de famille seul
hérite du type « personne », un sigle entre parenthèses hérite du type de l'entité qui le précède),
segmentation du chinois/japonais/coréen et données schema.org de la page.

**Limites** : précision variable (≈ bonne sur des textes rédigés en français, anglais, espagnol,
italien, portugais, russe ; plus faible en allemand, où tous les noms prennent une majuscule, et dans
les écritures sans majuscules comme l'arabe, l'hébreu ou l'hindi, où seuls les dictionnaires et les
guillemets servent). Les titres d'œuvres en minuscules sans italique ni guillemets ni mot-indice sont
souvent manqués. Utilisez le menu de correction du panneau avant l'export.

**Personnaliser** : toutes les listes (prénoms, lieux, mots-indices, institutions connues…) sont dans
`src/data.js`. Après modification, cliquez **Recharger** dans `about:debugging` (installation temporaire) ou soumettez une nouvelle version signée.

## Fichiers

- `manifest.json` — Manifest V3 pour Firefox (identifiant `gecko`, aucune collecte de données déclarée) ; permissions `activeTab`, `scripting`, `storage` uniquement
  (l'extension n'agit que sur l'onglet où vous la déclenchez).
- `_locales/` — traductions (anglais par défaut, français).
- `popup.html/.css/.js` — paramètres ; `background.js` — raccourci clavier et pastille de compteur.
- `src/data.js` — dictionnaires ; `src/ner-engine.js` — moteur ; `src/content.js` / `content.css` —
  surlignage, coches, panneau et export.

Firefox interdit l'action des extensions sur les pages `about:`, sur addons.mozilla.org et sur les
pages de lecture (mode lecture, PDF intégré).
