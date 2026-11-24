/* ELYRA — contenus des outils (boîte à outils, outils guidés, Mon corps, nuit, SOS, rappels).
   Accords : « prêt{e} », « {doux|douce} » (résolus selon le profil). {x} seul = réponse de l'utilisateur. */
window.ELYRA_OUTILS = {

/* ---------- Besoins (filtre de la boîte à outils) ---------- */
besoins: [['now',"Ça monte, maintenant"],['pensees','Mes pensées tournent'],['corps','Mon corps est tendu'],['emotions','Une émotion difficile'],
  ['nuit',"Je n'arrive pas à dormir"],['eviter',"J'évite quelque chose"],['avancer','Je veux avancer']],

/* ---------- La boîte à outils : [id, nom, à quoi ça sert, approche, besoins] ---------- */
boite: [
 {g:'Respirer', i:[
  ['calme:respirer','Respiration guidée',"Six rythmes guidés par une bulle, avec ou sans voix. Respirer moins vite aide le corps à relâcher la pression.",'Relaxation',['now','corps','nuit']],
  ['br:coh','Cohérence cardiaque',"5 secondes pour inspirer, 5 pour expirer, pendant quelques minutes. Un rythme régulier qui aide le corps à se poser.",'Relaxation',['now','corps']],
  ['sos:souffle','Le soupir qui apaise',"Quelques longues expirations, sans forcer, quand ça monte d'un coup.",'Relaxation',['now']]]},
 {g:'Revenir au présent', i:[
  ['sos:ground','Ancrage 5-4-3-2-1',"Revenir à ce que tu vois, touches et entends quand les pensées s'emballent.",'Pleine conscience',['now','pensees']],
  ['sos:froid','Le froid qui ramène',"De l'eau fraîche sur les mains et le visage, pour aider une vague intense à redescendre.",'Régulation',['now']]]},
 {g:'Détendre le corps', i:[
  ['med:muscle','Relaxation musculaire',"Contracter puis relâcher, groupe de muscles après groupe de muscles, pour sentir la détente.",'Relaxation',['corps','nuit']],
  ['med:scan','Scan corporel',"Parcourir le corps avec attention, sans rien chercher à changer.",'Pleine conscience',['corps']],
  ['med:etire','Étirements doux',"Quelques mouvements lents, assis{e} ou debout, pour dénouer les épaules et le dos.",'Corps',['corps']],
  ['sos:eft','Tapotements (EFT)',"Tapoter doucement quelques points du visage et du corps en se parlant avec douceur. Son efficacité est encore discutée : garde-le si ça te fait du bien.",'Auto-apaisement',['now','emotions']]]},
 {g:'Imaginer et méditer', i:[
  ['med:jardin','Visualisation',"Le jardin, la plage, la forêt : un lieu intérieur où te poser quelques minutes.",'Relaxation',['corps','nuit']],
  ['calme:mediter','Méditations guidées',"Des séances courtes pour le stress, le sommeil, la confiance et le quotidien.",'Pleine conscience',['emotions','nuit']],
  ['med:nuages','Pensées comme des nuages',"Regarder passer ses pensées sans s'y accrocher.",'Pleine conscience',['pensees']]]},
 {g:'Mes pensées', i:[
  ['pensee','Démêler une pensée',"Repérer la pensée automatique, le piège dans lequel elle tombe, et chercher une pensée plus juste.",'TCC',['pensees']],
  ['outil:reporter','Reporter mes inquiétudes',"Donner rendez-vous à tes inquiétudes, plutôt que les laisser occuper toute la journée.",'TCC',['pensees','nuit']],
  ['outil:probleme','Résoudre un problème',"Découper un vrai problème concret en petits pas faisables.",'TCC',['pensees','avancer']]]},
 {g:'Prendre du recul', i:[
  ['outil:defusion','Prendre du recul avec une pensée',"La défusion : regarder une pensée au lieu de regarder le monde à travers elle.",'ACT',['pensees']],
  ['outil:accueil','Faire de la place à une émotion',"Lutter un peu moins contre ce qui est là, pour que ça prenne moins de place.",'ACT',['emotions','corps']],
  ['outil:valeurs','Mes valeurs, mon prochain pas',"Choisir une petite action vers ce qui compte pour toi, même avec l'anxiété.",'ACT',['avancer']],
  ['outil:matrice','Ma boussole',"Voir ce qui te rapproche ou t'éloigne de ce qui compte pour toi.",'ACT',['avancer','eviter']]]},
 {g:'Affronter ses peurs', i:[
  ['expo',"Coach d'exposition","Avancer marche après marche vers ce que tu évites, avec un bilan après chaque essai.",'TCC',['eviter','avancer']]]},
 {g:'Écrire', i:[
  ['journal','Journal émotionnel',"Noter ton humeur, ton stress et ce qui s'est passé, pour mieux te comprendre.",'Journal',['emotions']],
  ['videtete','Le vide-tête',"Déposer sur papier ce qui tourne, pour que ça puisse attendre demain.",'Journal',['pensees','nuit']]]}
],

/* ---------- Outils guidés ----------
   types d'étapes : txt · in (texte) · scale (0-10) · one / chips (choix) · pick (choisir une technique) · picked · timer · leaf · matrix · sum */
tools: {
 defusion:{n:'Prendre du recul avec une pensée', c:'stress', min:4, s:[
  {t:'txt',h:'Prendre du recul avec une pensée',p:["Certaines pensées collent : « je vais craquer », « ça va mal se passer ». Ici, on ne cherche ni à les chasser, ni à prouver qu'elles sont fausses.","On apprend juste à les regarder, au lieu de regarder le monde à travers elles. Ça prend 3 à 5 minutes."]},
  {t:'in',k:'p',req:1,h:'Quelle pensée te colle en ce moment ?',l:"Écris-la telle qu'elle vient, en quelques mots.",ph:'Ex. Je vais faire une crise au travail'},
  {t:'scale',k:'a',h:'À quel point elle te colle ?',l:'0 : elle passe sans s’arrêter. 10 : elle prend toute la place.'},
  {t:'pick',k:'tech',h:'Choisis une façon de prendre du recul',l:"Il n'y a pas de bonne réponse. Essaie celle qui te parle.",o:[
   {n:"« J'ai la pensée que… »",p:["Relis lentement, à voix basse si tu peux :","« J'ai la pensée que {p}. »","Puis encore une fois :","« Je remarque que j'ai la pensée que {p}. »","Sens-tu la petite distance qui apparaît ? La pensée est là, et toi, tu la regardes."]},
   {n:'La feuille sur la rivière',anim:'leaf',p:["Imagine une rivière tranquille. Ta pensée est posée sur une feuille, et la feuille s'éloigne, à son rythme.","Si la pensée revient, ce n'est pas grave : pose-la sur une autre feuille. Tu peux toucher la rivière pour en ajouter une."]},
   {n:'Une petite voix rigolote',p:["Redis-toi la pensée dans ta tête avec une voix de dessin animé, ou très lentement, comme un vieux disque qui ralentit :","« {p} »","Les mots ne changent pas, mais tu vois mieux que ce sont des mots."]},
   {n:'Merci, mon esprit',p:["Ton esprit essaie de te protéger, à sa manière un peu maladroite. Tu peux lui répondre gentiment :","« Merci, mon esprit. Je vois que tu t'inquiètes pour moi. »","Puis reviens doucement à ce que tu étais en train de faire."]},
   {n:'Le mot répété',timer:30,p:["Choisis le mot le plus lourd de ta pensée. Répète-le à voix haute, assez vite, pendant 30 secondes.","Souvent, il devient un simple son et perd un peu de son poids."]}]},
  {t:'picked',k:'tech'},
  {t:'scale',k:'b',h:'Et maintenant, elle te colle à combien ?',l:"Elle n'a pas besoin d'avoir disparu. On regarde juste si un peu d'espace s'est créé."},
  {t:'sum',h:"Bravo d'avoir pris ce moment",cmp:['a','b','Elle te collait à {a}/10, maintenant à {b}/10.'],p:["La pensée peut revenir : c'est le travail d'un esprit qui veut te protéger. Chaque fois, tu peux refaire ce petit pas de côté."]}]},

 accueil:{n:'Faire de la place à une émotion', c:'stress', min:4, s:[
  {t:'txt',h:'Faire de la place à une émotion',p:["Quand une émotion fait mal, on a envie de la chasser. Mais lutter contre elle lui donne souvent encore plus de place.","On va essayer autre chose : l'observer, et lui faire un peu de place. Pas pour l'aimer, juste pour moins se battre."],note:"Si tu ressens une sensation physique nouvelle, forte ou inquiétante, fais-la d'abord vérifier : médecin de garde 1733, ou 112 en cas d'urgence."},
  {t:'one',k:'e',h:"Qu'est-ce qui est là ?",o:['Inquiétude','Peur','Tristesse','Colère','Honte','Tension','Fatigue','Autre chose']},
  {t:'chips',k:'z',h:'Où le sens-tu dans ton corps ?',l:'Tu peux en choisir plusieurs, ou aucun.',o:['Gorge','Poitrine','Ventre','Épaules','Mâchoire','Mains','Tête','Un peu partout']},
  {t:'scale',k:'a',h:'À quel point tu luttes contre ?',l:"0 : je le laisse être là. 10 : je me bats de toutes mes forces."},
  {t:'txt',h:"Observe, comme {un curieux|une curieuse}",p:["Pose ton attention sur cet endroit. Quelle forme ça a ? Quelle taille ? C'est chaud, froid, lourd, serré ? Est-ce que ça bouge ?","Tu n'as rien à changer. Juste à regarder, avec un peu de douceur."]},
  {t:'timer',s:60,h:'Respirer autour',p:["Inspire doucement, et imagine que ton souffle vient entourer cette sensation. Pas pour la faire partir : pour lui faire de la place.","Tu peux te dire : « Je n'aime pas ça, et je peux le laisser être là. »"]},
  {t:'scale',k:'b',h:'Et la lutte, maintenant ?',l:"L'émotion est peut-être toujours là. On regarde seulement la lutte."},
  {t:'sum',h:'Tu as fait de la place',cmp:['a','b','Ta lutte était à {a}/10, maintenant à {b}/10.'],p:["L'émotion n'a peut-être pas bougé, et c'est normal. Lutter un peu moins, c'est déjà garder de l'énergie pour ce qui compte."]}]},

 valeurs:{n:'Mes valeurs, mon prochain pas', c:'confiance', min:5, s:[
  {t:'txt',h:'Mes valeurs, mon prochain pas',p:["L'anxiété dit souvent quoi éviter. Les valeurs disent vers quoi aller.","On va choisir une direction qui compte pour toi, puis un tout petit pas. Même avec l'anxiété à côté."]},
  {t:'one',k:'dom',h:'Un domaine de ta vie',o:['Famille','Amitiés','Couple','Travail','Santé et corps','Loisirs et créativité','Apprendre','Nature','Aider les autres','Prendre soin de moi']},
  {t:'chips',k:'v',h:'Comment aimerais-tu être, là-dedans ?',l:'Choisis un ou deux mots.',o:['Présent{e}','Tendre','Courage{ux|use}','Curie{ux|use}','Fiable','Joue{ur|use}','Honnête','Patient{e}','Libre','Génére{ux|use}','Calme','Créati{f|ve}']},
  {t:'in',k:'q',h:"Concrètement, qu'est-ce qui compte pour toi ?",l:'Une ou deux phrases.',ph:'Ex. Passer de vrais moments avec mes enfants',area:1},
  {t:'in',k:'act',h:'Un tout petit pas cette semaine',l:"Petit, réaliste, même imparfait. C'est le pas qui compte, pas sa taille.",ph:'Ex. Appeler ma sœur 5 minutes jeudi soir'},
  {t:'in',k:'obst',h:'Ce qui pourrait se mettre en travers',l:'Pensées, émotions, sensations…',ph:'Ex. La fatigue, la pensée « ça ne sert à rien »'},
  {t:'txt',h:'Les obstacles peuvent venir avec toi',p:["Tu n'as pas besoin qu'ils disparaissent pour faire ton pas. Tu peux les emmener, comme des passagers un peu bruyants dans ta voiture, et continuer à tenir le volant."]},
  {t:'sum',h:'Ta direction',show:[['dom','Domaine'],['v','Ce qui compte pour toi'],['q','Concrètement'],['act','Ton prochain pas']],goal:'act',p:["Si le pas ne se fait pas cette semaine, ce n'est pas un échec. La direction reste la même : tu peux choisir un pas plus petit."]}]},

 matrice:{n:'Ma boussole', c:'visu', min:5, s:[
  {t:'txt',h:'Ma boussole',p:["Un outil simple pour y voir clair quand ça coince. On va remplir quatre cases, sans jugement.","En haut : ce qui se voit, ce que tu fais. En bas : ce qui se passe à l'intérieur. À droite : ce qui t'approche de ce qui compte. À gauche : ce qui t'en éloigne."]},
  {t:'in',k:'qui',h:'En bas à droite',l:'Ce qui compte pour toi : les personnes, les choses importantes.',ph:'Ex. Ma famille, être utile, ma santé',area:1},
  {t:'in',k:'vers',h:'En haut à droite',l:'Ce que tu fais, ou pourrais faire, pour aller vers ça.',ph:'Ex. Sortir avec mes amis, finir mon projet',area:1},
  {t:'in',k:'int',h:'En bas à gauche',l:'Ce qui se passe en toi quand ça coince : pensées, émotions, sensations.',ph:'Ex. « Je vais paniquer », la boule au ventre',area:1},
  {t:'in',k:'loin',h:'En haut à gauche',l:"Ce que tu fais alors pour t'en éloigner : éviter, vérifier, fuir, ruminer…",ph:'Ex. Annuler, rester à la maison, chercher sur Internet',area:1},
  {t:'matrix'},
  {t:'sum',h:'Remarquer, c’est déjà choisir',p:["La prochaine fois que ça coince, tu peux te poser une seule question : est-ce que ce que je vais faire me rapproche, ou m'éloigne, de ce qui compte ?","Il n'y a pas de mauvaise réponse. Parfois s'éloigner est nécessaire. L'important, c'est de choisir."]}]},

 probleme:{n:'Résoudre un problème', c:'quotidien', min:6, s:[
  {t:'txt',h:'Résoudre un problème',p:["Utile pour un vrai problème concret, sur lequel tu as un peu de prise : une démarche, un conflit, une organisation.","Pour une inquiétude « et si… » lointaine, « Reporter mes inquiétudes » ou « Prendre du recul » marchent souvent mieux."]},
  {t:'in',k:'pb',req:1,h:'Le problème, en une phrase concrète',ph:'Ex. Je dois rappeler la mutuelle et je repousse'},
  {t:'in',k:'idees',h:'Toutes les idées possibles',l:'Même imparfaites, même un peu folles. Une par ligne. On trie après.',area:1},
  {t:'in',k:'choix',h:"L'idée la plus réaliste pour commencer",l:"Pas la solution parfaite : une solution suffisante."},
  {t:'in',k:'pas',h:'Le tout premier petit pas, et quand',ph:'Ex. Demain à 10 h, préparer mes questions sur un papier'},
  {t:'in',k:'si',h:'Si ça ne marche pas, tu pourras…',l:"Avoir un plan B, ça rassure."},
  {t:'sum',h:'Un problème découpé est moins lourd',show:[['pb','Le problème'],['choix','Ce que tu choisis'],['pas','Ton premier pas'],['si','Ton plan B']],goal:'pas',p:["Tu as fait le plus dur : passer de « ça tourne » à « je sais par où commencer »."]}]},

 reporter:{n:'Reporter mes inquiétudes', c:'stress', min:2, s:[
  {t:'txt',h:'Reporter mes inquiétudes',p:["Les inquiétudes aiment s'inviter toute la journée. L'idée : leur donner rendez-vous, plus tard, à un moment choisi.","Un « moment d'inquiétude » de 15 minutes, en fin d'après-midi par exemple. Jamais juste avant de dormir."]},
  {t:'in',k:'w',req:1,h:'Ton inquiétude, en quelques mots',ph:'Ex. Et si je n’arrivais pas à tout finir ?'},
  {t:'sum',h:'Elle est rangée',souci:'w',p:["Elle t'attend dans ta boîte à soucis. Tu la reprendras à ton moment d'inquiétude, si elle compte encore.","D'ici là, quand elle revient, tu peux te dire : « Je l'ai notée, je m'en occuperai plus tard. » Puis reviens doucement à ce que tu fais."]}]}
},

/* ---------- Coach d'exposition ---------- */
expo: {
 intro:"Éviter ce qui fait peur soulage sur le moment, mais rétrécit peu à peu la vie. Ici, tu avances marche après marche, à ton rythme. Après chaque essai, un petit bilan : c'est comme ça que le cerveau apprend.",
 secu:"On ne s'expose jamais à un vrai danger. Pour une peur importante, ou si tu as un problème de santé, fais-toi accompagner par un professionnel. Ne modifie jamais un traitement sans ton médecin.",
 secur:['Avoir de l’eau sur moi','Être {accompagné|accompagnée}','Garder le téléphone en main','Rester près de la sortie','Vérifier mon pouls','Prendre un objet rassurant','Me distraire tout le temps'],
 pendant:["L'anxiété peut monter. C'est attendu, et ça ne veut pas dire que ça se passe mal.","Tu n'as pas besoin qu'elle disparaisse. Laisse-la être là, et reste encore un peu.","Observe ce qui se passe vraiment autour de toi, avec tes cinq sens.","Si c'est trop, tu peux faire une pause et revenir. Ce n'est pas un échec : c'est une information."],
 resultat:[['non','Non, ça ne s’est pas passé'],['part','En partie'],['oui','Oui, c’est arrivé']]
},

/* ---------- SOS : prendre du recul + petite action ---------- */
recul: ["C'est une vague. Elle monte, puis elle redescend.","C'est l'anxiété qui parle. Ce n'est pas un fait.","J'ai déjà traversé des moments comme celui-là.","Je n'ai rien à résoudre maintenant.","Je peux ressentir ça et rester {doux|douce} avec moi.","Un pas à la fois, c'est suffisant."],
actions: [['eau','Boire un verre d’eau'],['air','Ouvrir la fenêtre ou prendre l’air'],['msg','Envoyer un message à quelqu’un'],['etire','M’étirer doucement'],['manger','Manger un petit quelque chose'],['musique','Mettre une musique douce'],['ecrire','Écrire ce qui s’est passé'],['repos','Me reposer, sans rien faire']],
noir: {t:'Si tu as des pensées très sombres',m:"Ce que tu ressens compte, et tu n'as pas à le porter {seul|seule}. Des personnes formées sont là pour t'écouter, sans te juger, à toute heure.",
  l:[['0800 32 123','Centre de Prévention du Suicide','Gratuit, anonyme, 24 h sur 24'],['112','Si tu es en danger maintenant','Ambulance, urgence'],['107','Télé-Accueil','Pour parler à quelqu’un, 24 h sur 24']],
  apres:"Si tu peux, appelle aussi une personne de confiance, ou demande à quelqu'un de venir près de toi."},

/* ---------- Mon corps ---------- */
corps: {
 zones: [['tete','Tête'],['gorge','Gorge'],['poitrine','Poitrine'],['ventre','Ventre'],['dos','Dos'],['bras','Bras, mains'],['jambes','Jambes']],
 sens: ['Serrement','Palpitations','Souffle court','Boule au ventre','Tensions','Vertiges','Fourmillements','Chaleur, bouffées','Nausée','Fatigue','Douleur','Autre'],
 ctx: ['Au repos','Pendant un effort','Dans un moment de stress','La nuit','Après un repas','Sans raison apparente'],
 verif: [['oui','Oui, déjà vérifié par un médecin'],['non','Non, pas encore'],['nsp','Je ne sais pas']],
 alerte: [
  "Une douleur ou une oppression dans la poitrine, surtout si elle s'étend au bras, à la mâchoire ou au dos",
  "Une difficulté à respirer qui ne passe pas, ou des lèvres qui bleuissent",
  "Une faiblesse, un engourdissement ou une paralysie d'un côté du corps, une bouche qui se déforme, une parole difficile",
  "Un malaise, une perte de connaissance, une confusion soudaine",
  "Une douleur très forte et brutale, ou qui ne ressemble à rien de ce que tu connais"],
 info: [
  ["Le corps et l'anxiété","L'anxiété peut provoquer de vraies sensations : cœur qui bat vite, souffle court, boule au ventre, tensions. Elles sont désagréables, mais ce n'est pas « dans la tête » : le corps réagit vraiment."],
  ["Mais d'abord, vérifier","Une sensation n'est pas forcément liée à l'anxiété. ELYRA ne peut pas faire la différence, et ne le fera jamais à ta place. Une sensation nouvelle, qui change, ou qui t'inquiète mérite l'avis d'un médecin."],
  ["Le piège de la vérification","Quand une sensation a déjà été vérifiée, la contrôler sans cesse (prendre son pouls, chercher sur Internet) peut entretenir l'inquiétude. Noter ici, puis en parler à ton médecin, est souvent plus apaisant."]]
},

/* ---------- Réveil nocturne ---------- */
nuit: {
 accueil:"Tu es {réveillé|réveillée}. C'est la nuit : rien à régler maintenant.",
 sous:"Pas besoin de regarder l'heure. On cherche juste un peu de repos, même sans sommeil.",
 conseils:["Si le sommeil ne revient pas après un long moment, tu peux te lever, aller dans une autre pièce avec une lumière douce, et revenir quand tes paupières deviennent lourdes.","Évite les écrans lumineux et l'heure qui défile. Garde ELYRA en mode sombre.","Rester allongé{e} les yeux fermés, en respirant tranquillement, repose déjà le corps."]
},

/* ---------- Rappels doux ---------- */
rappels: [
 {k:'humeur',n:'Le matin : comment ça va ?',h:'09:00',b:"Comment ça va ce matin ? Un petit mot dans ton journal, si tu en as envie.",go:'journal',id:11},
 {k:'pause',n:'Une pause pour respirer',h:'13:00',b:"Une minute pour respirer ? Rien d'obligatoire, juste une pause pour toi.",go:'calme',id:12},
 {k:'soucis',n:"Mon moment d'inquiétude",h:'18:00',b:"C'est ton moment d'inquiétude : 15 minutes pour regarder ta boîte à soucis, puis on range.",go:'outils',id:13},
 {k:'soir',n:'La routine du soir',h:'21:30',b:"Ta routine du soir t'attend, tout en douceur.",go:'sommeil',id:14}
]
};
