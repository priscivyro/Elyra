/* ELYRA — « Apprivoiser l'anxiété » : outils inspirés des TCC (cercle anxieux, comportements de sécurité,
   tolérer les sensations). S'ajoute à outils.js (chargé juste après). */
(function(){
const O = window.ELYRA_OUTILS;

O.tools.cercle = {n:'Mon cercle anxieux',c:'stress',min:6,s:[
 {t:'txt',h:'Mon cercle anxieux',p:["L'anxiété fonctionne souvent en boucle : une situation déclenche une pensée de danger, le corps s'alarme, et on fait quelque chose pour se protéger.","Ça soulage sur le moment. Mais le cerveau retient : « heureusement que j'ai fait ça, c'était dangereux ». Et la peur revient la fois suivante, parfois plus fort.","On va dessiner ensemble TON cercle, à partir d'un moment récent. C'est la première étape pour en sortir."]},
 {t:'in',k:'dec',req:1,h:"Une situation récente où l'anxiété est montée",ph:'Ex. Dans le bus, aux heures de pointe'},
 {t:'in',k:'pen',req:1,h:'Quelle pensée est passée par ta tête ?',l:"Souvent un « et si… » : ce que tu as eu peur qu'il arrive.",ph:"Ex. Je vais faire un malaise et personne ne m'aidera"},
 {t:'scale',k:'cro',h:"Sur le moment, à quel point y croyais-tu ?",l:"0 : pas du tout. 10 : j'en étais {sûr|sûre}."},
 {t:'chips',k:'sen',h:"Qu'as-tu ressenti dans ton corps ?",o:['Cœur qui bat fort','Souffle court','Vertiges','Chaleur ou bouffées','Gorge serrée','Tremblements','Ventre noué','Mains moites','Impression d’irréalité','Tension']},
 {t:'chips',k:'act',h:"Qu'as-tu fait pour te protéger ?",l:"Ce n'est pas un reproche : c'est ce que fait n'importe quel cerveau qui croit au danger.",o:['Je suis {parti|partie}',"J'ai évité d'y aller","J'ai vérifié mon corps (pouls, souffle)",'J’ai demandé à être {rassuré|rassurée}','Je me suis {distrait|distraite}','J’ai pris un objet ou un médicament rassurant','J’ai serré les dents en attendant que ça passe','Rien de particulier']},
 {t:'cercle'},
 {t:'sum',h:'Tu as dessiné ton cercle',show:[['dec','La situation'],['pen','La pensée'],['sen','Les sensations'],['act','Ce que tu as fait']],p:["Le simple fait de voir la boucle change déjà quelque chose : tu n'es plus dedans, tu la regardes.","Choisis un seul point de rupture pour commencer, celui qui te semble le plus facile. On avance petit pas par petit pas."]}
]};

O.tools.securite = {n:'Mes comportements de sécurité',c:'confiance',min:5,s:[
 {t:'txt',h:'Ce qui rassure… et entretient la peur',p:["Pour se sentir en sécurité, on prend des petites habitudes : garder toujours sa bouteille d'eau, s'asseoir près de la sortie, vérifier son pouls, demander qu'on nous rassure.","Elles soulagent sur le moment. Mais elles empêchent le cerveau de découvrir que la situation n'était pas dangereuse : il croit que c'est grâce à elles qu'on s'en est sorti.","L'idée n'est pas de tout arrêter d'un coup. C'est d'en réduire une, un peu, et d'observer ce qui se passe vraiment."]},
 {t:'chips',k:'cs',h:'Lesquelles te ressemblent ?',l:'Choisis toutes celles que tu reconnais.',o:['Toujours avoir téléphone, eau ou médicament sur moi','Être toujours {accompagné|accompagnée}','M’asseoir près de la sortie','Vérifier mon pouls ou ma respiration','Chercher mes symptômes sur Internet','Demander à être {rassuré|rassurée}','Éviter le café, l’effort ou la chaleur','Garder une distraction (musique, téléphone)','Préparer une excuse pour partir','Respirer « pour ne pas paniquer »','Éviter de rester {seul|seule}','Tout prévoir et tout contrôler']},
 {t:'in',k:'autre',h:"Une autre habitude rassurante ?",l:'Facultatif.',ph:'Ex. Repérer les toilettes en arrivant'},
 {t:'in',k:'lacher',req:1,h:'Laquelle vas-tu réduire cette semaine, un petit peu ?',l:"Choisis la plus facile. Réduire, pas forcément supprimer.",ph:'Ex. Laisser ma bouteille d’eau dans le sac, sans la sortir'},
 {t:'scale',k:'anx',h:"Quelle anxiété imagines-tu en le faisant ?"},
 {t:'txt',h:'Comment t’entraîner',p:["Fais-le dans une situation où tu te sens assez solide. Reste-y assez longtemps pour que l'anxiété monte… puis redescende toute seule.","Observe ce qui se passe vraiment, et compare avec ce que tu avais prédit. C'est cette différence qui apprend au cerveau.","Si c'est trop dur, coupe l'étape en deux : réduire de moitié, ou pendant moins longtemps. Ce n'est pas un échec, c'est le bon dosage."]},
 {t:'sum',h:'Ton défi de la semaine',show:[['cs','Tes habitudes rassurantes'],['lacher','Ce que tu vas réduire'],['anx','Anxiété imaginée (sur 10)']],goal:'lacher',p:["Note ensuite dans ton journal ce qui s'est passé : souvent, la peur annoncée est plus grande que ce qui arrive."]}
]};

const PREC = "Ne fais pas ces exercices sans l'accord de ton médecin si tu as un problème au cœur, de l'asthme ou un souci respiratoire, de l'épilepsie, si tu es enceinte, ou en cas de douleur au cou ou au dos. Arrête si tu as mal : inconfortable, oui ; douloureux, non.";
O.tools.intero = {n:'Tolérer les sensations',c:'corps',min:5,s:[
 {t:'txt',h:'Apprivoiser les sensations',p:["Dans la panique, on a peur… des sensations elles-mêmes : le cœur qui s'emballe, la tête qui tourne, le souffle court. Le cerveau les prend pour un danger.","Ici, on les provoque exprès, doucement, dans un endroit sûr. Pour que le cerveau apprenne, par l'expérience : « c'est désagréable, mais pas dangereux ».","Un exercice à la fois. On le refait plusieurs jours, jusqu'à ce que la peur descende."],note:PREC},
 {t:'one',k:'ok',h:'Avant de commencer',o:["Je n'ai aucune de ces contre-indications","Mon médecin est d'accord"]},
 {t:'pick',k:'ex',h:'Choisis un exercice',l:"Commence par celui qui te fait le moins peur.",o:[
  {n:'Respirer vite (30 secondes)',p:["Debout ou {assis|assise}, respire vite et profondément par la bouche, environ une respiration par seconde.","Tu peux sentir des vertiges, des fourmis dans les mains, la tête légère. C'est l'effet attendu, et il passe en quelques minutes."],timer:30},
  {n:'Tourner sur soi (30 secondes)',p:["{Assis|Assise} sur une chaise qui tourne, ou debout près d'un canapé, tourne doucement sur toi-même.","Les vertiges arrivent : ils ressemblent à ceux de l'angoisse. Quand c'est fini, assieds-toi et regarde-les passer."],timer:30},
  {n:'Respirer par une paille (1 minute)',p:["Pince ton nez et respire uniquement par une paille fine.","Le manque d'air ressemble à l'étouffement de la panique. Tu restes en sécurité : tu peux arrêter quand tu veux."],timer:60},
  {n:'Secouer la tête (30 secondes)',p:["Tête droite, secoue-la doucement de gauche à droite, yeux ouverts. Sans forcer sur le cou.","Puis relève la tête et regarde droit devant : la tête qui tourne, c'est ça qu'on apprivoise."],timer:30},
  {n:'Courir sur place (1 minute)',p:["Cours sur place, ou monte et descends une marche, assez vite pour que le cœur accélère.","Un cœur qui bat fort après un effort, c'est un cœur qui fonctionne. Observe-le sans t'inquiéter."],timer:60},
  {n:'Retenir son souffle (20 secondes)',p:["Inspire normalement, puis retiens ton souffle, sans forcer.","L'envie de respirer monte : c'est une sensation normale, pas un danger."],timer:20}]},
 {t:'scale',k:'pa',h:"Avant de commencer : à quel point as-tu peur de l'exercice ?"},
 {t:'picked',k:'ex'},
 {t:'scale',k:'int',h:'À quel point les sensations étaient-elles fortes ?'},
 {t:'scale',k:'sim',h:'À quel point ressemblaient-elles à une crise ?'},
 {t:'scale',k:'pp',h:'Et ta peur, pendant ?'},
 {t:'timer',s:60,h:'Laisse redescendre, sans rien faire',p:["Ne fais rien de spécial pour que ça passe. Pas de respiration pour « contrôler », pas de vérification.","Observe juste les sensations diminuer toutes seules. C'est exactement ça que ton cerveau doit voir."]},
 {t:'sum',h:"Tu l'as fait",cmp:['pa','pp','Peur avant : {pa}/10. Peur pendant : {pp}/10.'],p:["Refais ce même exercice d'autres jours, jusqu'à ce que la peur descende vers 2 sur 10. Ensuite, passe au suivant.","Chaque répétition apprend au cerveau que ces sensations sont désagréables, mais pas dangereuses."]}
]};

/* rangées dans la boîte à outils */
O.boite.unshift({g:'Apprivoiser la peur',i:[
 ['outil:cercle','Mon cercle anxieux',"Dessiner la boucle qui entretient ta peur, et repérer où la casser.",'TCC',['eviter','avancer','pensees']],
 ['outil:securite','Mes comportements de sécurité',"Ce qui rassure sur le moment mais entretient l'anxiété, et comment le lâcher peu à peu.",'TCC',['eviter','avancer']],
 ['outil:intero','Tolérer les sensations',"Provoquer doucement les sensations de la panique pour apprendre qu'elles ne sont pas dangereuses.",'TCC',['avancer','corps']],
 ['tcc:dialogue','Examiner une pensée avec ELYRA',"ELYRA te guide, question après question, pour regarder une pensée avec du recul.",'TCC',['pensees','avancer']]]});
})();
