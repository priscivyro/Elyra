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
| Accueil (humeur, stress, suggestion, programme du jour, à venir, progrès, encouragement) | Appli | Oui |
| Mode SOS (6 situations, accompagnement pas à pas, ancrage, respiration facultative, audio, kit, numéros d'urgence) | Appli | Oui |
| Bulle de calme : 5 respirations, 10 séances guidées lues à voix haute, 4 sons avec minuterie, favoris, reprise | Appli | Oui |
| Journal émotionnel (humeur, stress, émotions, situations, notes, historique, graphique) | Appli | Oui |
| Mon parcours : 8 programmes de 5 étapes | Appli | Oui |
| Sommeil : journal des nuits, routine du soir, vide-tête, audios, réveils nocturnes | Appli | Oui |
| Mes progrès : 30 jours, bilans semaine et mois, objectifs, petites victoires | Appli | Oui |
| ELYRA Anticipation : observations prudentes calculées sur le téléphone + situations à venir | Appli | Oui |
| Kit de secours : phrases, techniques, contacts de confiance, notes | Appli | Oui |
| Mon espace : prénom, voix, taille du texte, mode sombre, sauvegarde, restauration, effacement | Appli | Oui |
| Assistant ELYRA (5 modes : Écoute, Apaise, Comprend, Accompagne, Encourage) + mémoire consultable, modifiable, effaçable | Claude | Non |

---

## Données et confidentialité

- Les données de l'appli sont enregistrées **uniquement sur le téléphone** (stockage local du navigateur ou de l'appli Android). Aucun serveur, aucun compte, aucune publicité.
- Chaque personne a donc son espace privé sur son propre téléphone.
- **Sauvegarde** : Mon espace → Sauvegarde → « Copier ma sauvegarde » (à coller dans une note ou un e-mail à soi-même) ou « Télécharger le fichier ».
- **Restauration** : Mon espace → Restaurer (coller le texte ou choisir le fichier).
- Sur iPhone, installe bien l'appli sur l'écran d'accueil : Safari peut effacer les données d'un simple site non utilisé pendant longtemps, pas celles d'une appli installée.

---

## Organisation du dépôt

```
www/                  L'appli (une seule page, sans dépendance externe)
  index.html          Tout le code et les contenus
  sw.js               Fonctionnement hors ligne (iPhone / navigateur)
  manifest.webmanifest, icons/, fonts/ (polices embarquées)
chat/index.html       Source de la conversation ELYRA publiée dans Claude
assets/               Icône et écran de démarrage Android
signing/debug.keystore  Clé de signature fixe de l'APK (voir plus bas)
tests/                Tests automatisés
.github/workflows/    pages.yml (appli iPhone) · android.yml (APK)
```

### Choix techniques
- **Une page web unique** (HTML, CSS, JavaScript sans framework) : simple à maintenir, rapide, fonctionne partout.
- **iPhone** : appli web progressive hébergée gratuitement par GitHub Pages, avec un service worker pour le hors ligne.
- **Android** : la même page emballée avec **Capacitor**, construite gratuitement par GitHub Actions. Le plugin `@capacitor-community/text-to-speech` donne la voix des séances.
- **Assistant IA** : une appli installée ne peut pas utiliser le compte Claude d'une personne, et une clé d'API est payante. La conversation est donc une page publiée dans Claude, qui utilise le compte de la personne qui l'ouvre.
- **Signature de l'APK** : une clé fixe (`signing/debug.keystore`, mot de passe `android`) permet d'installer les mises à jour par-dessus sans perdre les données. C'est une clé de type « debug », suffisante pour un usage familial hors Play Store.

### Mise à jour
Chaque envoi sur la branche `main` :
- republie l'appli iPhone (si `www/` a changé) ;
- fabrique un nouvel APK, disponible dans **Releases**.

Après une modification de l'appli, change `VERSION` dans `www/sw.js` pour que les iPhone récupèrent la nouvelle version.

### Mise en route (une seule fois)
Dans le dépôt GitHub : **Settings → Pages → Build and deployment → Source : GitHub Actions**.

### Tests
```
cd tests && npm install jsdom@24
node app.test.js ../www/index.html
node chat.test.js ../chat/index.html
```
