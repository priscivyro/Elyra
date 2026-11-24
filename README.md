# ELYRA

> Tu n'as pas besoin de tout maîtriser pour avancer.

ELYRA est un compagnon anti-stress **personnel**, pour Priscilla et ses proches. Il n'est pas commercialisé.
Tout est gratuit : pas d'abonnement, pas de serveur payant, pas de clé d'API.

ELYRA ne pose pas de diagnostic et ne remplace pas un professionnel de santé.
En Belgique : urgence **112** · médecin de garde **1733** · Centre de Prévention du Suicide **0800 32 123** · Télé-Accueil **107**.

---

## Installer l'appli

### iPhone (appli web)
1. Ouvre **Safari** (pas Chrome) sur `https://priscivyro.github.io/Elyra/`
2. Touche le bouton **Partager** (le carré avec la flèche), puis **Sur l'écran d'accueil**
3. ELYRA apparaît comme une appli. Elle s'ouvre en plein écran et fonctionne hors ligne.

### Android (APK)
1. Sur le téléphone, ouvre : `https://github.com/priscivyro/Elyra/releases/latest/download/ELYRA.apk`
2. Ouvre le fichier téléchargé. Android demande d'autoriser l'installation depuis le navigateur : accepte pour cette fois.
3. Pour une mise à jour, refais la même chose : la nouvelle version s'installe par-dessus, **les données sont conservées**.

### La conversation avec l'assistant ELYRA
La conversation IA vit dans Claude : https://claude.ai/artifact/DQzS1B9ompRWMjSAXfYHuy
Chaque personne l'utilise avec **son propre compte Claude** (gratuit ou non), et sa mémoire et ses conversations restent dans **son espace privé**.
Pour qu'un proche y ait accès, partage la page depuis Claude (bouton Partager de l'artefact).

---

## Ce que contient l'appli

| Module | Où | Hors ligne |
|---|---|---|
| Accueil : « Parler / Apprendre / Un moment pour moi », barre « Parle-moi », humeur, ce qui t'aide, programme du jour, écran de nuit | Appli | Oui |
| Mode SOS (8 situations + « pensées très sombres », pas à pas, ancrage, respiration facultative, audio, défusion, prendre du recul, petite action finale, kit, numéros d'urgence) | Appli | Oui |
| Ma boîte à outils : 24 outils classés par besoin, « Ça t'a aidé ? » après chaque exercice, suggestions personnalisées (accueil, SOS, respiration rapide) | Appli | Oui |
| Outils guidés : défusion, faire de la place (ACT), valeurs et prochain pas, boussole ACT, résoudre un problème, reporter ses inquiétudes (boîte à soucis) | Appli | Oui |
| Coach d'exposition : échelle, avant / pendant / après, bilan après chaque essai | Appli | Oui |
| Mon corps : quand appeler le 112, noter une sensation sur une silhouette, comprendre, soins du corps | Appli | Oui |
| Préparer une consultation : résumé 30 jours / 3 mois à copier, partager ou imprimer | Appli | Oui |
| Verrou par code (SOS toujours accessible), rappels doux (Android) ou calendrier (iPhone) | Appli | Oui |
| Bulle de calme : 6 respirations, 29 séances guidées, 4 histoires pour s'endormir, 10 sons d'ambiance à mélanger, minuterie, favoris, reprise | Appli | Oui |
| Voix ELYRA : voix française naturelle (Piper, neuronale) générée gratuitement par GitHub, intégrée à l'appli | Appli | Oui |
| Comprendre : 11 fiches (anxiété, panique, ruminations, pièges de pensée, sommeil, demander de l'aide en Belgique…) | Appli | Oui |
| Démêler une pensée : outil pas à pas inspiré des thérapies cognitives | Appli | Oui |
| Journal émotionnel (humeur, stress, émotions, situations, notes, historique, graphique) | Appli | Oui |
| Mon parcours : 12 programmes de 7 étapes | Appli | Oui |
| Sommeil : journal des nuits, routine du soir, vide-tête, audios, réveils nocturnes | Appli | Oui |
| Mes progrès : 30 jours, bilans semaine et mois, objectifs, petites victoires | Appli | Oui |
| ELYRA Anticipation : observations prudentes calculées sur le téléphone + situations à venir | Appli | Oui |
| Kit de secours : phrases, techniques, contacts de confiance, notes | Appli | Oui |
| Mon espace : prénom, voix, taille du texte, mode sombre, sauvegarde, restauration, effacement | Appli | Oui |
| Conversation à voix haute : visage dessiné animé (regard, clignements, expressions, lèvres), micro mains libres (détection de la parole et des silences, interruption), sous-titres, mode texte, historique, mémoire avec accord, exercices proposés, protocole de crise | Appli + serveur gratuit | Non |
| Assistant ELYRA dans Claude (7 modes : Écoute, Apaise, Comprend, Accompagne, Encourage, Explique, La nuit) + mémoire consultable, modifiable, effaçable, résumé de l'appli partagé seulement si tu l'acceptes | Claude | Non |

---

## Activer la conversation à voix haute

La conversation à voix haute (le visage d'ELYRA qui t'écoute et te répond) passe par un **petit serveur gratuit chez Cloudflare**. Il sert à deux choses : transformer ta voix en texte (Whisper) et trouver la réponse d'ELYRA (Mistral Small). La voix d'ELYRA est celle du téléphone.

**Gratuit, sans carte bancaire.** L'offre gratuite donne 10 000 « neurones » par jour, soit environ 100 échanges par jour pour toute la famille. Au-delà, ELYRA le dit gentiment et ça revient le lendemain (à 1 h du matin en hiver). Sans carte enregistrée, aucune facture n'est possible.

**Confidentialité.** Cloudflare ne garde pas les conversations et ne s'en sert pas pour entraîner des modèles. Le serveur n'enregistre rien. L'historique et la mémoire restent sur ton téléphone (Mon espace › Conversation à voix haute).

À faire **une seule fois** (plus facile sur un ordinateur) :

1. Crée un compte gratuit sur https://dash.cloudflare.com/sign-up (e-mail et mot de passe, pas de carte).
2. Dans le menu, ouvre **Workers & Pages** (parfois appelé **Compute › Workers**). Si Cloudflare te demande de choisir un sous-domaine « workers.dev », choisis par exemple `priscivyro`.
3. Copie ton **Account ID** : il est affiché sur la page d'accueil du compte ou de Workers & Pages (colonne de droite).
4. Crée une clé : icône du profil › **My Profile** › **API Tokens** › **Create Token** › modèle **Edit Cloudflare Workers** › *Account Resources* : ton compte › *Zone Resources* : All zones › **Continue to summary** › **Create Token**. Copie la clé affichée (elle ne s'affiche qu'une fois).
5. Sur GitHub, dans le dépôt **Elyra** : **Settings › Secrets and variables › Actions › New repository secret**. Crée deux secrets :
   - `CLOUDFLARE_API_TOKEN` : la clé de l'étape 4 ;
   - `CLOUDFLARE_ACCOUNT_ID` : l'identifiant de l'étape 3.
6. Onglet **Actions › Construire ELYRA › Run workflow**. Environ 5 minutes plus tard, l'appli iPhone et l'APK savent parler à voix haute.

Tant que ce n'est pas fait, « Parler » ouvre la conversation dans Claude, comme avant.

## Données et confidentialité

- Les données de l'appli sont enregistrées **uniquement sur le téléphone** (stockage local du navigateur ou de l'appli Android). Aucun serveur, aucun compte, aucune publicité.
- Chaque personne a donc son espace privé sur son propre téléphone.
- **Sauvegarde** : Mon espace → Sauvegarde → « Copier ma sauvegarde » (à coller dans une note ou un e-mail à soi-même) ou « Télécharger le fichier ».
- **Restauration** : Mon espace → Restaurer (coller le texte ou choisir le fichier).
- Sur iPhone, installe bien l'appli sur l'écran d'accueil : Safari peut effacer les données d'un simple site non utilisé pendant longtemps, pas celles d'une appli installée.

---

## Organisation du dépôt

```
www/                  L'appli (sans dépendance externe)
  index.html          La structure des écrans
  styles.css          Le design (charte ELYRA)
  content.js          TOUS les textes : séances, histoires, parcours, fiches… (à modifier ici)
  outils.js           Les textes de la boîte à outils, des outils guidés, de Mon corps, de la nuit et des rappels
  tag.js              Le programme TAG en 8 modules
  live.js             Le visage animé d'ELYRA et le micro mains libres
  config.js           L'adresse du petit serveur (remplie par GitHub)
  app.js              Le fonctionnement de l'appli
  sons.js             Le moteur de sons d'ambiance (généré en direct, hors ligne)
  sw.js               Fonctionnement hors ligne (iPhone / navigateur)
  voix/               Audios de la voix ELYRA (générés par GitHub, pas dans le dépôt)
tools/voix/           Génération de la voix (Piper, voix fr_FR-siwis-medium)
  manifest.webmanifest, icons/, fonts/ (polices embarquées)
chat/index.html       Source de la conversation ELYRA publiée dans Claude
worker/               Le petit serveur gratuit (Cloudflare) de la conversation à voix haute
assets/               Icône et écran de démarrage Android
signing/debug.keystore  Clé de signature fixe de l'APK (voir plus bas)
tests/                Tests automatisés
.github/workflows/    build.yml : tests → voix → appli iPhone → APK (rien n'est publié si un test échoue)
```

### Choix techniques
- **Une page web unique** (HTML, CSS, JavaScript sans framework) : simple à maintenir, rapide, fonctionne partout.
- **iPhone** : appli web progressive hébergée gratuitement par GitHub Pages, avec un service worker pour le hors ligne.
- **Android** : la même page emballée avec **Capacitor**, construite gratuitement par GitHub Actions. Le plugin `@capacitor-community/text-to-speech` donne la voix des séances.
- **Assistant IA** : une appli installée ne peut pas utiliser le compte Claude d'une personne, et une clé d'API est payante. La conversation est donc une page publiée dans Claude, qui utilise le compte de la personne qui l'ouvre.
- **Signature de l'APK** : une clé fixe (`signing/debug.keystore`, mot de passe `android`) permet d'installer les mises à jour par-dessus sans perdre les données. C'est une clé de type « debug », suffisante pour un usage familial hors Play Store.

### Mise à jour
Chaque envoi sur la branche `main` :
- génère les audios des nouvelles phrases (les anciens sont réutilisés) ;
- republie l'appli iPhone ;
- fabrique un nouvel APK, disponible dans **Releases**.

Pour ajouter une séance : l'écrire dans `www/content.js` (texte + durée minimale de chaque étape). La voix est générée automatiquement.
Les accords s'écrivent `prêt{e}` ou `{doux|douce}` : l'appli choisit selon le réglage « au féminin / au masculin ».
Après une modification, change `VERSION` dans `www/sw.js` pour que les iPhone récupèrent la nouvelle version.

### La voix
- Moteur : [Piper](https://github.com/rhasspy/piper), voix `fr_FR-siwis-medium` (licence libre). Gratuit, aucune clé, aucun serveur.
- Les audios sont générés par GitHub Actions et intégrés à l'appli : ils marchent hors ligne.
- Repli automatique sur la voix du téléphone si un audio manque.

### Mise en route (une seule fois)
Dans le dépôt GitHub : **Settings → Pages → Build and deployment → Source : GitHub Actions**.

### Tests
```
cd tests && npm install jsdom@24
(cd ../www && python3 -m http.server 8766 &)
node app.test.js http://localhost:8766/index.html
node chat.test.js ../chat/index.html
node voix.test.js http://localhost:8766/index.html
node worker.test.mjs
```
