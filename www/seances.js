/* ELYRA — séances par situation, relaxation profonde, histoires du soir supplémentaires, séries audio.
   S'ajoute à content.js (chargé juste après). Accords : « prêt{e} », « {doux|douce} ».
   Les nombres sont écrits en lettres pour la voix. */
(function(){
const C = window.ELYRA_CONTENT;

const MEDS = [
/* ---- avant un moment stressant ---- */
{k:'examen',c:'stress',t:'Avant un examen ou un entretien',d:"Arriver plus {posé|posée}, sans chercher à ne rien ressentir.",s:[
 ["Prends quelques minutes pour toi, avant ce moment important. Tu peux garder les yeux ouverts si tu préfères.",15],
 ["Remarque d'abord ce qui est là : peut-être un cœur qui bat plus vite, des mains un peu moites, des pensées qui s'accélèrent. C'est ton corps qui se prépare.",25],
 ["Un peu de trac, ce n'est pas un problème. Il apporte de l'énergie et de l'attention. Tu n'as pas besoin de le faire disparaître.",25],
 ["Sens tes pieds bien à plat sur le sol. Appuie-les légèrement, comme pour prendre racine.",25],
 ["Laisse ton expiration devenir un peu plus longue que ton inspiration. Sans forcer. Juste un peu plus longue.",35],
 ["Rappelle-toi une chose que tu as bien préparée. Une seule. Elle est là, en toi, même si tu ne la sens pas maintenant.",30],
 ["Si une pensée te dit « je vais tout oublier », tu peux lui répondre : merci, je t'ai entendue. Et revenir à ta respiration.",30],
 ["Imagine le moment juste après : tu sors, c'est fait. Quelle que soit l'issue, tu auras fait de ton mieux, avec ce que tu avais aujourd'hui.",30],
 ["Choisis une phrase simple pour la route. Par exemple : je fais un pas après l'autre.",25],
 ["Quand tu te sens {prêt|prête}, roule doucement les épaules, et avance à ton rythme. Bon courage.",15]]},
{k:'rdvmed',c:'corps',t:'Avant un rendez-vous médical',d:"Pour l'attente et l'appréhension avant une consultation ou un examen.",s:[
 ["Tu as un rendez-vous médical bientôt, et c'est normal d'être un peu {tendu|tendue}. Prenons ce moment pour toi.",15],
 ["Tu as bien fait de prendre ce rendez-vous. C'est une façon de prendre soin de toi.",20],
 ["Si tu veux, pense aux questions que tu voudrais poser. Tu peux les noter avant d'y aller, pour ne rien oublier.",25],
 ["Sens maintenant le contact de ton corps avec la chaise, ou le sol. Ce qui te porte, ici et maintenant.",25],
 ["Expire lentement, comme pour souffler sur une tasse chaude. Encore une fois. Puis laisse la respiration revenir toute seule.",35],
 ["L'esprit aime imaginer les scénarios difficiles. Tu peux les remarquer, sans les suivre. Pour l'instant, tu ne sais pas, et c'est bien assez.",35],
 ["Tu n'es pas {seul|seule} face à ça. Le médecin est là pour t'aider à comprendre, et tu peux demander qu'on t'explique autant de fois que nécessaire.",30],
 ["Pose une main sur ton cœur ou sur ton ventre, si ça te fait du bien. Sens la chaleur de ta main.",30],
 ["Dis-toi intérieurement : je m'occupe de moi, un pas à la fois.",25],
 ["Reviens doucement. Tu peux y aller à ton rythme.",12]]},
{k:'attente',c:'stress',t:"Quand j'attends un résultat",d:"Supporter un peu mieux l'incertitude, en attendant de savoir.",s:[
 ["Attendre, c'est souvent plus difficile que savoir. Tu as le droit de trouver ce moment pénible.",15],
 ["Remarque où l'attente se loge dans ton corps : la gorge, la poitrine, le ventre, les épaules.",25],
 ["Respire doucement autour de cet endroit, comme pour lui faire un peu de place.",35],
 ["L'esprit cherche à savoir tout de suite. Il pose des questions, encore et encore. Ce n'est pas un défaut : il essaie de te protéger.",30],
 ["Mais pour l'instant, la réponse n'est pas là. Tu peux te dire : je ne sais pas encore. Et c'est supportable, une minute après l'autre.",35],
 ["Chercher sur Internet, vérifier encore, demander d'être {rassuré|rassurée} : ça soulage un peu, puis l'inquiétude revient. Tu peux essayer de t'en passer, juste un moment.",35],
 ["Ramène ton attention vers ce que tu peux faire aujourd'hui. Une petite chose concrète : boire un verre d'eau, marcher un peu, appeler quelqu'un.",30],
 ["Ce qui viendra, tu y feras face quand ça viendra. Tu as déjà traversé beaucoup de choses.",30],
 ["Laisse ta respiration redevenir naturelle. Tu peux reprendre ta journée, doucement.",15]]},
{k:'route',c:'stress',t:'Avant de prendre la route ou les transports',d:"À écouter avant de partir, pas en conduisant.",s:[
 ["Cette séance s'écoute avant de partir, jamais en conduisant. Installe-toi un moment.",12],
 ["Tu vas bientôt te déplacer, et une partie de toi s'inquiète peut-être. C'est d'accord.",20],
 ["Sens ton dos, tes épaules. Laisse-les descendre un peu, comme si tu posais un sac trop lourd.",25],
 ["Expire lentement, plus longtemps que tu n'inspires. Trois fois, à ton rythme.",35],
 ["Imagine le trajet calmement, du début à la fin : tu pars, tu avances, tu arrives. Si une étape te serre un peu, respire, et continue l'image.",40],
 ["Si l'angoisse monte pendant le trajet, tu sauras quoi faire : sentir tes mains, nommer ce que tu vois, laisser l'air sortir lentement.",30],
 ["L'anxiété peut monter. Elle redescend toujours. Tu n'as pas besoin qu'elle soit à zéro pour avancer.",25],
 ["Choisis une petite phrase pour le voyage : je fais le trajet, une étape à la fois.",20],
 ["Quand tu te sens {prêt|prête}, vas-y. Et sois fier ou fière de toi, même si c'était difficile.",15]]},
/* ---- émotions difficiles ---- */
{k:'apresconflit',c:'stress',t:'Après une dispute',d:"Laisser retomber la colère et la tension après un conflit.",s:[
 ["La dispute est terminée, mais ton corps est peut-être encore en alerte. Prends ce moment pour le laisser redescendre.",15],
 ["Remarque ce qui est là : chaleur, mâchoire serrée, cœur rapide, pensées qui rejouent la scène.",25],
 ["Tu n'as rien à décider maintenant. Ni qui a raison, ni ce que tu vas répondre.",25],
 ["Desserre la mâchoire. Laisse les épaules tomber. Ouvre les mains, paumes vers le haut.",30],
 ["Expire longuement, par la bouche, comme un soupir. Encore une fois. Laisse sortir un peu de pression à chaque fois.",35],
 ["Si les phrases de la dispute tournent en boucle, imagine qu'elles passent sur un écran, de plus en plus petites, de plus en plus loin.",35],
 ["Derrière la colère, il y a souvent un besoin : être {écouté|écoutée}, être {respecté|respectée}, être {compris|comprise}. Qu'est-ce qui comptait pour toi, là ?",35],
 ["Plus tard, quand tu seras plus calme, tu pourras choisir ce que tu veux en faire. Parler, écrire, ou laisser passer.",30],
 ["Pour l'instant, sois {doux|douce} avec toi. Un conflit, ça secoue tout le monde.",20]]},
{k:'tristesse',c:'stress',t:'Quand je suis triste',d:"Accueillir la tristesse avec douceur, sans la pousser dehors.",s:[
 ["Tu es triste, et tu as le droit de l'être. Pas besoin de faire semblant ici.",15],
 ["Installe-toi confortablement. Tu peux t'envelopper dans une couverture, prendre quelque chose de chaud entre les mains.",25],
 ["Remarque où la tristesse se trouve dans ton corps. Peut-être une lourdeur, une gorge serrée, des yeux qui piquent.",30],
 ["Si des larmes viennent, laisse-les venir. Elles font partie du chemin.",30],
 ["Pose une main sur ton cœur. Imagine que c'est la main de quelqu'un qui t'aime, et qui reste là, sans rien dire.",35],
 ["Tu peux te dire : c'est un moment difficile. Beaucoup de gens ressentent ça. Je peux être {doux|douce} avec moi.",35],
 ["La tristesse n'est pas un problème à résoudre. Elle dit souvent que quelque chose comptait pour toi.",30],
 ["Respire tranquillement. Tu n'as pas besoin d'aller mieux tout de suite.",30],
 ["Si cette tristesse dure, ou devient trop lourde, en parler à quelqu'un, un proche ou ton médecin, peut vraiment aider.",20],
 ["Reste encore un peu ici, aussi longtemps que tu en as besoin.",20]]},
{k:'deuil',c:'confiance',t:'Le manque de quelqu’un',d:"Pour les jours où l'absence d'une personne aimée pèse fort.",s:[
 ["Quelqu'un te manque. Cette séance est un petit espace pour ce manque, sans le juger.",15],
 ["Installe-toi. Il n'y a pas de bonne façon de vivre un deuil, ni de délai à respecter.",20],
 ["Si tu veux, pense à cette personne. Son visage, sa voix, un geste qui lui ressemblait.",35],
 ["Remarque ce qui se passe en toi. De la tristesse, de la tendresse, de la colère parfois. Tout peut coexister.",35],
 ["Pose une main sur ton cœur. Ce que tu as partagé avec elle ne disparaît pas. Ça fait partie de toi.",35],
 ["Tu peux lui dire intérieurement quelque chose. Un merci, un souvenir, ce que tu n'as pas eu le temps de dire.",40],
 ["Respire doucement. Laisse l'émotion monter et redescendre, comme une vague sur le sable.",35],
 ["Le chagrin est le prix de l'amour. Il prend de la place, puis, avec le temps, il change de forme.",30],
 ["Tu n'as pas à traverser ça {seul|seule}. Parler à un proche, ou à un professionnel du deuil, peut beaucoup aider.",20],
 ["Reviens doucement. Prends soin de toi aujourd'hui.",15]]},
{k:'solitude',c:'confiance',t:'Quand je me sens {seul|seule}',d:"Se sentir un peu moins {seul|seule}, et retrouver le lien.",s:[
 ["Te sentir {seul|seule}, c'est douloureux. C'est aussi un sentiment que beaucoup de gens connaissent, en ce moment même.",15],
 ["Installe-toi. Sens le poids de ton corps, porté par ce sur quoi tu es {assis|assise} ou {allongé|allongée}.",25],
 ["Respire tranquillement. À chaque inspiration, imagine que tu accueilles un peu de chaleur.",30],
 ["Pense à une personne, même lointaine, qui t'a fait du bien un jour. Un sourire, une parole, une aide.",35],
 ["Envoie-lui intérieurement un souhait simple : que tu ailles bien. Puis envoie-le à toi aussi : que j'aille bien.",35],
 ["Pense maintenant à toutes les personnes qui, ce soir, se sentent seules elles aussi. Tu fais partie de ce grand groupe humain.",35],
 ["Si tu en as envie, choisis un petit geste de lien pour aujourd'hui : un message, un appel, un bonjour à un voisin.",30],
 ["Et si la solitude est très présente depuis longtemps, il existe des lieux et des personnes pour en parler, comme Télé-Accueil au cent sept.",20],
 ["Tu comptes. Reviens doucement.",15]]},
{k:'culpabilite',c:'confiance',t:'Culpabilité et reproches',d:"Se parler avec plus de douceur quand on s'en veut.",s:[
 ["Tu t'en veux peut-être pour quelque chose. Cette séance n'est pas là pour te juger, mais pour t'aider à respirer.",15],
 ["Remarque la voix intérieure qui te fait des reproches. Son ton. Ses mots. Elle est souvent beaucoup plus dure que tu ne le serais avec quelqu'un d'autre.",35],
 ["Imagine qu'un ami proche vient te raconter exactement la même situation. Que lui dirais-tu ?",35],
 ["Essaie de te dire ces mots-là, à toi. Avec la même gentillesse.",35],
 ["Si tu as vraiment fait une erreur, tu peux la reconnaître, sans t'écraser. Reconnaître, réparer si c'est possible, et apprendre.",35],
 ["Pose une main sur ton cœur. Tu peux te dire : je suis humain, ou humaine. Je fais des erreurs, comme tout le monde.",35],
 ["Respire doucement. À chaque expiration, laisse partir un peu de dureté envers toi.",35],
 ["Tu mérites la même compréhension que tu offres aux autres.",20]]},
/* ---- corps et santé ---- */
{k:'sante',c:'corps',t:'Quand je m’inquiète pour ma santé',d:"Pour l'inquiétude autour du corps. Ne remplace jamais l'avis d'un médecin.",s:[
 ["Avant tout : si tu ressens une douleur dans la poitrine, une difficulté à respirer, un malaise, ou quelque chose de nouveau et d'inquiétant, appelle le cent douze. Cette séance n'est pas faite pour ça.",20],
 ["Cette séance est pour l'inquiétude elle-même : les pensées qui tournent autour de la santé, les sensations qu'on surveille sans arrêt.",25],
 ["Remarque l'envie de vérifier : prendre ton pouls, chercher sur Internet, demander encore. Tu peux la remarquer, sans la suivre tout de suite.",35],
 ["Pose ton attention sur une partie neutre du corps : tes mains, tes pieds. Sens leur poids, leur température.",35],
 ["Respire tranquillement, sans contrôler. Laisse le corps faire ce qu'il sait faire.",35],
 ["L'esprit inquiet transforme souvent un petit signal en grand danger. Tu peux te dire : c'est l'inquiétude qui parle.",30],
 ["Si une question de santé te préoccupe, la bonne personne pour y répondre est ton médecin. Note ta question, et pose-la lui.",25],
 ["Élargis maintenant ton attention aux sons autour de toi, à la lumière, à la pièce. Le monde est plus grand que la sensation.",30],
 ["Reviens doucement, à ton rythme.",12]]},
{k:'douleur',c:'corps',t:'Corps douloureux ou tendu',d:"Relâcher ce qui peut l'être, et adoucir la lutte. Ne remplace pas un traitement.",s:[
 ["Installe-toi dans la position la plus confortable possible pour toi aujourd'hui. Change de position quand tu veux.",15],
 ["Cette séance ne remplace pas un traitement ni l'avis d'un médecin. Elle t'aide à être un peu plus {doux|douce} avec ton corps.",20],
 ["Commence par les zones qui vont bien : peut-être les mains, le visage, les pieds. Sens-les, simplement.",35],
 ["Puis approche-toi, sans forcer, de la zone tendue ou douloureuse. Observe-la de loin, comme un paysage.",35],
 ["Remarque ses contours, ce qui bouge, ce qui pulse. Est-ce que ça change d'un instant à l'autre ?",35],
 ["Imagine que ton souffle vient l'entourer, comme une couverture chaude posée autour, sans la serrer.",40],
 ["Laisse se détendre tout ce qui peut se détendre autour : les épaules, la mâchoire, le front.",35],
 ["Tu peux te dire : je n'aime pas cette sensation, et je peux lui laisser un peu de place.",35],
 ["Reviens vers une zone agréable, et repose-toi là un moment.",30],
 ["Prends soin de toi, à ton rythme.",12]]},
{k:'epuise',c:'quotidien',t:'Épuisement',d:"Une pause pour quand on n'en peut plus.",s:[
 ["Tu es {fatigué|fatiguée}, peut-être même {épuisé|épuisée}. Pour ces minutes-ci, tu n'as rien à donner.",15],
 ["Allonge-toi si tu peux, ou appuie-toi bien contre un dossier. Laisse le corps devenir lourd.",25],
 ["Remarque à quel point tu portes beaucoup en ce moment. Tu peux le reconnaître, sans t'en vouloir.",30],
 ["Respire sans effort. Pas de technique, pas de rythme à suivre. Juste laisser l'air entrer et sortir.",40],
 ["Imagine que tu poses, un à un, tes soucis dans une boîte, à côté de toi. Ils ne disparaissent pas : ils t'attendent. Pour l'instant, tu te reposes.",40],
 ["Laisse le front se détendre, les yeux s'adoucir, la mâchoire se relâcher.",35],
 ["Se reposer, ce n'est pas abandonner. C'est ce qui permet de continuer.",30],
 ["Si cet épuisement dure, parles-en à ton médecin : il peut t'aider à alléger la charge.",20],
 ["Reste encore un peu, aussi longtemps que tu peux.",20]]},
/* ---- travail ---- */
{k:'travail',c:'quotidien',t:'Pression au travail',d:"Quelques minutes pour faire redescendre la pression, même au bureau.",s:[
 ["Tu peux faire cette séance à ton bureau, les yeux ouverts ou fermés. Personne n'a besoin de savoir.",12],
 ["Lâche la souris, le téléphone, le stylo. Pose les mains à plat sur la table ou sur tes cuisses.",20],
 ["Remarque la pression dans ton corps : épaules, nuque, ventre. C'est la charge de la journée.",25],
 ["Expire longuement par la bouche, discrètement. Encore une fois. Laisse tomber les épaules.",30],
 ["Tout ne doit pas être fait maintenant. Choisis une seule chose, la prochaine, et laisse les autres attendre leur tour.",30],
 ["Si une pensée te dit « je n'y arriverai jamais », remarque-la. C'est la pression qui parle, pas la vérité.",30],
 ["Regarde par la fenêtre, ou un point au loin. Laisse tes yeux se reposer quelques secondes.",25],
 ["Tu peux poser une limite. Demander un délai, de l'aide, ou dire ce qui n'est pas possible aujourd'hui.",25],
 ["Reprends doucement, une chose à la fois.",12]]},
{k:'retour',c:'quotidien',t:'Couper en rentrant à la maison',d:"Laisser le travail derrière la porte.",s:[
 ["Tu rentres. Avant de passer à la suite de ta soirée, prends quelques minutes pour faire la transition.",12],
 ["Imagine que tu enlèves ta journée de travail comme un manteau, et que tu l'accroches à la porte. Il sera là demain.",30],
 ["Si des tâches tournent dans ta tête, note-les rapidement sur un papier. Elles sont en sécurité, tu n'as plus besoin de les retenir.",30],
 ["Sens tes pieds sur le sol de ta maison. Regarde autour de toi : tu es chez toi.",25],
 ["Expire lentement, trois fois. À chaque fois, laisse partir un peu de la journée.",35],
 ["Pense à une petite chose agréable pour ta soirée. Un repas, un bain, une série, un moment avec quelqu'un.",25],
 ["Le travail fait partie de ta vie, mais il n'est pas toute ta vie.",20],
 ["Bonne soirée.",10]]},
/* ---- confiance ---- */
{k:'estime',c:'confiance',t:'Estime de soi',d:"Se regarder avec un peu plus de bienveillance.",s:[
 ["Installe-toi. Cette séance est un moment pour te regarder autrement, avec un peu plus de gentillesse.",15],
 ["Remarque comment tu te parles d'habitude. Est-ce que tu t'encourages, ou est-ce que tu te critiques ?",30],
 ["Pense à trois choses que tu as faites cette semaine, même toutes petites. Te lever, aider quelqu'un, tenir bon.",40],
 ["Pense maintenant à une qualité que les autres reconnaissent chez toi. Même si tu as du mal à y croire.",35],
 ["Laisse cette qualité exister, juste un moment, sans la discuter.",30],
 ["Pose une main sur ton cœur. Tu peux te dire : je ne suis pas parfait, ou parfaite. Je suis assez, tel que je suis, telle que je suis.",35],
 ["L'estime de soi ne se construit pas en un jour. Elle grandit avec de petits gestes de respect envers toi.",30],
 ["Choisis un petit geste pour aujourd'hui : t'accorder une pause, dire non à quelque chose, te féliciter.",25],
 ["Reviens doucement.",10]]},
{k:'non',c:'confiance',t:'Oser dire non',d:"Se préparer à poser une limite, avec calme.",s:[
 ["Il y a peut-être une situation où tu aimerais dire non, et où c'est difficile. Prenons-la doucement.",15],
 ["Pense à cette situation. Remarque ce qui se passe dans ton corps quand tu imagines dire non.",30],
 ["La peur de décevoir, de fâcher, d'être {rejeté|rejetée}, c'est normal. Elle montre que les liens comptent pour toi.",30],
 ["Mais dire oui à tout, c'est souvent se dire non à soi-même.",25],
 ["Imagine que tu dis non, calmement, avec des mots simples. Par exemple : merci d'avoir pensé à moi, mais cette fois, je ne peux pas.",35],
 ["Pas besoin de te justifier longuement. Une raison courte suffit, ou même aucune.",25],
 ["Imagine la réaction de l'autre. Peut-être qu'il est déçu. Et tu restes debout, calme. La déception de l'autre n'est pas un danger.",35],
 ["Respire. Tu as le droit de protéger ton temps, ton énergie, ta santé.",25],
 ["Quand tu te sentiras {prêt|prête}, essaie avec une petite limite d'abord. Ça s'apprend, petit à petit.",15]]},
{k:'echec',c:'confiance',t:'Après un échec',d:"Se relever avec douceur quand ça ne s'est pas passé comme prévu.",s:[
 ["Quelque chose ne s'est pas passé comme tu l'espérais. C'est décevant, et tu as le droit d'être {déçu|déçue}.",15],
 ["Remarque ce que tu ressens : déception, honte, colère, fatigue. Laisse tout ça exister un moment.",30],
 ["Remarque aussi ce que ta voix intérieure te dit. Est-ce qu'elle transforme cet échec en verdict sur toi ?",30],
 ["Un échec parle d'une tentative, pas de ta valeur. Tu as essayé. Beaucoup de gens n'essaient même pas.",30],
 ["Respire doucement. Pose une main là où ça fait mal, dans la poitrine ou le ventre.",30],
 ["Plus tard, quand l'émotion sera redescendue, tu pourras te demander : qu'est-ce que j'ai appris ? Qu'est-ce que je ferais autrement ?",35],
 ["Pour l'instant, la priorité, c'est d'être {gentil|gentille} avec toi.",25],
 ["Pense à une personne qui croit en toi. Imagine ce qu'elle te dirait maintenant.",30],
 ["Reviens doucement. Le chemin continue.",12]]},
/* ---- nuit ---- */
{k:'penseeslit',c:'sommeil',t:'Les pensées qui tournent au lit',d:"Pour quand la tête ne s'arrête pas au moment de dormir.",s:[
 ["Tu es au lit, et ta tête continue de tourner. C'est très courant. On va l'aider à ralentir, sans forcer.",20],
 ["Tu n'as pas besoin de t'endormir pendant cette séance. Juste de te reposer.",25],
 ["Remarque les pensées qui passent. Pas besoin de les chasser, ni de les résoudre. Ce n'est pas l'heure.",35],
 ["Chaque fois qu'une pensée arrive, tu peux lui donner un petit nom : souci, liste, souvenir. Puis la laisser passer, comme une voiture dans la rue.",45],
 ["Sens le poids de ta tête sur l'oreiller. Le poids de tes bras. Le poids de tes jambes sur le matelas.",45],
 ["Expire lentement par la bouche, comme si tu soufflais doucement sur une bougie sans l'éteindre.",45],
 ["Imagine que tu écris chaque souci sur une feuille, que tu la plies, et que tu la poses sur la table de nuit. Demain, tu la reprendras si besoin.",50],
 ["Laisse ton attention descendre dans le corps, de plus en plus bas, vers les pieds.",50],
 ["Tout peut attendre demain. Ce soir, tu as seulement à te reposer.",60]]},
/* ---- relaxation profonde ---- */
{k:'relax',c:'sommeil',t:'Relaxation profonde, 20 minutes',d:"Un long voyage à travers le corps, pour se déposer complètement.",s:[
 ["Installe-toi {allongé|allongée}, sur le dos si c'est confortable, les bras le long du corps. Couvre-toi pour ne pas avoir froid.",25],
 ["Pendant ces vingt minutes, tu n'as rien à réussir. Si tu t'endors, c'est très bien aussi.",30],
 ["Prends un moment pour sentir l'ensemble du corps posé, du sommet de la tête jusqu'aux pieds.",45],
 ["Laisse ta respiration trouver son rythme. Tu n'as pas à la diriger.",50],
 ["Porte ton attention sur ton pied droit. Les orteils, la plante du pied, le talon. Laisse-le devenir lourd.",50],
 ["Remonte vers la cheville, le mollet, le genou. Toute la jambe droite se dépose sur le sol.",55],
 ["Passe maintenant au pied gauche. Les orteils, la plante, le talon. Lourd, et détendu.",50],
 ["La cheville, le mollet, le genou, la cuisse gauche. Les deux jambes sont lourdes et chaudes.",55],
 ["Sens ton bassin, posé. Laisse les hanches s'ouvrir un peu, se relâcher.",50],
 ["Ton ventre se soulève et redescend avec la respiration. Laisse-le tout à fait libre.",55],
 ["Ton dos s'étale sur le sol, vertèbre après vertèbre, du bas jusqu'aux épaules.",55],
 ["Tes épaules descendent, loin des oreilles. Tes bras deviennent lourds, jusqu'au bout des doigts.",55],
 ["Ta nuque se relâche. Ta tête est lourde, bien posée.",50],
 ["Ta mâchoire se desserre. Tes lèvres se touchent à peine. Ta langue se repose.",50],
 ["Tes yeux se reposent dans leurs orbites. Ton front s'élargit, se lisse.",55],
 ["Sens maintenant le corps entier, d'un seul bloc, lourd et calme.",60],
 ["Imagine une douce chaleur qui parcourt tout le corps, de la tête aux pieds, comme un bain tiède.",60],
 ["Si des pensées passent, laisse-les flotter au loin, comme des nuages.",60],
 ["Reste là, simplement. Rien à faire. Rien à prévoir.",70],
 ["Tu peux rester dans ce calme aussi longtemps que tu veux.",70],
 ["Si c'est le moment de dormir, laisse-toi glisser dans le sommeil. Sinon, reviens tout doucement, en bougeant les doigts et les orteils.",40],
 ["Prends ton temps avant de te lever. Bonne nuit, ou bon retour.",20]]}
];

const STORIES = [
{k:'barque',t:'La barque sur le lac',d:"Une lente promenade sur l'eau calme. Environ 10 minutes.",s:[
 ["Installe-toi, lumière éteinte. Tu n'as qu'à écouter, et te laisser porter. Si tu t'endors avant la fin, c'est parfait.",25],
 ["Imagine un petit lac entouré de collines boisées. Le soir tombe, et l'eau est si calme qu'elle reflète le ciel comme un miroir.",40],
 ["Au bord du lac, une barque en bois t'attend, amarrée à un ponton. Le bois est tiède, poli par les années.",40],
 ["Tu montes doucement. La barque oscille un peu, puis se stabilise. Tu t'installes sur un coussin moelleux, au fond.",40],
 ["Tu n'as pas besoin de ramer. La barque glisse toute seule, lentement, portée par un courant très doux.",45],
 ["Tu entends le léger clapotis de l'eau contre la coque. Un bruit régulier, comme une respiration.",45],
 ["Au-dessus de toi, le ciel passe du rose au mauve, puis au bleu profond. Une première étoile s'allume.",50],
 ["Une petite brise sent l'herbe et la terre humide. Quelque part, une chouette lance un appel, très loin.",50],
 ["La barque longe des roseaux qui bruissent doucement. Tes paupières deviennent lourdes, comme l'eau autour de toi.",55],
 ["Tu te sens porté, ou portée, sans effort. Le lac te berce. Il n'y a nulle part où aller.",60],
 ["Les étoiles se multiplient et se reflètent dans l'eau. Tu flottes entre deux ciels, tranquille.",60],
 ["La barque ralentit encore, presque immobile. Tout est calme. Tu peux t'endormir ici, en sécurité.",70]]},
{k:'bibliotheque',t:'La bibliothèque sous la pluie',d:"Un refuge chaud et silencieux, pendant que la pluie tombe. Environ 10 minutes.",s:[
 ["Installe-toi confortablement. Laisse ton corps devenir lourd, et écoute simplement.",25],
 ["Imagine une vieille bibliothèque, au fond d'une ruelle. Dehors, il pleut doucement, et la nuit est déjà tombée.",40],
 ["Tu pousses la lourde porte en bois. À l'intérieur, il fait bon. L'air sent le papier, le bois ciré, et un peu le thé.",45],
 ["De grandes étagères montent jusqu'au plafond, remplies de livres aux dos colorés. Des lampes à abat-jour vert diffusent une lumière dorée.",45],
 ["La bibliothécaire, une dame aux cheveux blancs, te fait un petit signe de tête bienveillant, puis retourne à sa lecture.",45],
 ["Tu choisis un fauteuil profond près de la fenêtre. Tu t'y enfonces, une couverture en laine sur les genoux.",50],
 ["La pluie tapote les vitres, régulière. Les gouttes glissent lentement sur le verre, en dessinant des chemins.",50],
 ["Tu prends un livre au hasard. Tu ne le lis pas vraiment : tu tournes les pages, lentement, en écoutant leur froissement.",55],
 ["De temps en temps, une page tourne ailleurs dans la salle. Une horloge fait tic, tac, très lentement.",55],
 ["Tes yeux se ferment à moitié. Le livre repose sur tes genoux. Ici, personne n'attend rien de toi.",60],
 ["La pluie continue, douce et patiente. La lumière dorée t'enveloppe. Tu peux te laisser glisser dans le sommeil.",70]]},
{k:'montgolfiere',t:'La montgolfière au lever du jour',d:"Un vol tranquille au-dessus des champs. Environ 10 minutes.",s:[
 ["Installe-toi. Imagine que tu as tout le temps du monde. Écoute, simplement.",25],
 ["C'est l'aube. Dans un grand champ encore couvert de rosée, une montgolfière aux couleurs douces se gonfle lentement.",40],
 ["Tu montes dans la nacelle en osier. Elle est solide, rassurante. Le pilote te sourit : tout va bien.",40],
 ["Le ballon s'élève sans secousse, presque sans bruit. Le sol s'éloigne doucement, comme dans un rêve.",45],
 ["Sous toi, les champs forment un patchwork vert et doré. Des haies, des petits chemins, une rivière qui brille.",50],
 ["L'air est frais et pur. Le soleil se lève derrière les collines et réchauffe ton visage.",50],
 ["De temps en temps, le brûleur souffle un peu, puis se tait. Le silence revient, immense et paisible.",50],
 ["Vous survolez un village qui se réveille : une cheminée qui fume, un coq au loin, des toits qui rosissent.",55],
 ["Le ballon suit le vent, sans hâte. Tu n'as rien à décider. Tu te laisses porter.",55],
 ["Tes épaules se relâchent. Ta respiration devient lente, comme le vol.",60],
 ["La montgolfière flotte au-dessus d'un monde calme et lumineux. Tu peux fermer les yeux et continuer le voyage en rêve.",70]]},
{k:'plagehiver',t:'La plage en hiver',d:"Une promenade au bord de la mer, emmitouflé dans une écharpe. Environ 10 minutes.",s:[
 ["Installe-toi au chaud. Laisse ton corps se poser, et écoute.",25],
 ["Imagine une grande plage en hiver, presque déserte. Le ciel est gris perle, et la mer roule tranquillement.",40],
 ["Tu marches lentement sur le sable dur, bien {emmitouflé|emmitouflée} dans un grand manteau et une écharpe douce.",45],
 ["Le vent frais te caresse le visage. Tu respires l'odeur du sel et des algues.",45],
 ["Les vagues arrivent, l'une après l'autre. Elles montent, s'étalent sur le sable, puis se retirent en chuchotant.",50],
 ["Au loin, un chien court joyeusement au bord de l'eau, puis disparaît derrière une dune.",50],
 ["Tu trouves un abri contre la dune. Tu t'assieds dans le sable, protégé, ou protégée, du vent.",50],
 ["Quelqu'un t'a préparé une boisson chaude dans un thermos. Tu sens la chaleur entre tes mains.",55],
 ["Tu regardes la mer, immense. Les vagues vont et viennent, sans fin, sans effort.",55],
 ["Ta respiration suit leur rythme. Elle monte… et redescend. Elle monte… et redescend.",60],
 ["Le jour baisse doucement. Les premières lumières du port s'allument au loin. Tu peux t'endormir, bercé, ou bercée, par la mer.",70]]},
{k:'jardinzen',t:'Le jardin japonais',d:"Un jardin silencieux, des pierres, de l'eau, de la mousse. Environ 10 minutes.",s:[
 ["Installe-toi confortablement. Ferme les yeux si tu veux, et écoute.",25],
 ["Imagine un jardin japonais, au calme, en fin d'après-midi. Un petit portail en bois s'ouvre devant toi.",40],
 ["Un chemin de pierres plates traverse un tapis de mousse d'un vert profond. Tu avances lentement, pierre après pierre.",45],
 ["Un mince filet d'eau coule d'un bambou dans un bassin de pierre. Le son est clair, régulier, apaisant.",50],
 ["Plus loin, un érable aux feuilles rouges se penche au-dessus d'un étang. Des carpes orange glissent sous la surface.",50],
 ["Tu t'assieds sur un banc de bois. Devant toi, un jardin de gravier ratissé en cercles parfaits, autour de quelques rochers.",50],
 ["Les lignes du gravier ressemblent à des vagues figées. Ton regard les suit, lentement, sans but.",55],
 ["Un tuyau de bambou se remplit d'eau, bascule, et frappe doucement une pierre. Toc. Puis le silence.",55],
 ["Le vent fait tinter une petite clochette, quelque part. Les ombres s'allongent.",60],
 ["Tout est à sa place. Rien ne presse. Tu n'as besoin de rien de plus.",60],
 ["La lumière devient bleue, puis grise. Le jardin s'endort, et toi aussi, tout doucement.",70]]},
{k:'boulangerie',t:'La boulangerie à l’aube',d:"L'odeur du pain chaud dans un village endormi. Environ 10 minutes.",s:[
 ["Installe-toi. Tu n'as rien à faire. Laisse-toi raconter l'histoire.",25],
 ["Imagine un petit village, très tôt le matin, quand tout le monde dort encore. Une seule fenêtre est allumée : celle de la boulangerie.",40],
 ["Tu pousses la porte qui grince doucement. Une chaleur délicieuse t'enveloppe, avec l'odeur du pain qui cuit.",45],
 ["Le boulanger, un homme calme aux bras couverts de farine, te sourit et te propose une chaise près du four.",45],
 ["Tu le regardes travailler. Ses gestes sont lents, précis. Il plie la pâte, la retourne, la pose, comme une danse tranquille.",50],
 ["La farine flotte dans la lumière comme une neige légère.",50],
 ["Le four ronronne. De temps en temps, le boulanger ouvre la porte et sort une plaque de pains dorés qui craquent en refroidissant.",55],
 ["Ce petit craquement, c'est le pain qui chante, dit-il à voix basse.",55],
 ["Il t'offre un morceau de pain encore tiède. Tu sens sa croûte croustillante, sa mie moelleuse.",55],
 ["La chaleur du four te rend les paupières lourdes. Dehors, le ciel commence à peine à pâlir.",60],
 ["Tu peux rester là, au chaud, et laisser le sommeil revenir, pendant que le village s'éveille tout doucement.",70]]},
{k:'refuge',t:'Le refuge des étoiles',d:"Une nuit claire en montagne, sous un ciel immense. Environ 10 minutes.",s:[
 ["Installe-toi au chaud. Laisse ton souffle ralentir, et écoute.",25],
 ["Imagine un petit refuge en pierre, perché dans la montagne. Il fait nuit, et le ciel est parfaitement clair.",40],
 ["Tu sors sur la terrasse en bois, {enveloppé|enveloppée} dans un grand plaid. L'air est froid et pur, et sent la résine.",45],
 ["Tu t'allonges sur une chaise longue. Au-dessus de toi, des milliers d'étoiles. Plus que tu n'en as jamais vu.",50],
 ["La Voie lactée traverse le ciel comme une rivière de lumière pâle.",50],
 ["Tout est silencieux. Seul le vent passe parfois dans les sapins, avec un long souffle doux.",55],
 ["Une étoile filante trace un trait rapide, puis disparaît. Tu n'as même pas besoin de faire un vœu.",55],
 ["Les étoiles brillent ici depuis toujours, et brilleront encore longtemps. Tes soucis paraissent tout petits sous ce ciel.",60],
 ["À l'intérieur du refuge, le poêle crépite. Tu sais que la chaleur t'attend quand tu le voudras.",60],
 ["Tes yeux se ferment. Tu gardes les étoiles en toi, comme une lumière tranquille.",65],
 ["Tu peux t'endormir ici, sous la grande couverture du ciel.",70]]},
{k:'serre',t:'La serre aux plantes',d:"Un jardin d'hiver chaud et humide, plein de verdure. Environ 10 minutes.",s:[
 ["Installe-toi confortablement, et laisse-toi guider.",25],
 ["Imagine une grande serre de verre, au milieu d'un parc, un soir d'hiver. Dehors, il fait froid. À l'intérieur, il fait doux.",40],
 ["Tu entres. L'air est tiède et humide. Il sent la terre mouillée, les feuilles, les fleurs.",45],
 ["De grandes plantes vertes t'entourent : des fougères géantes, des palmiers, des feuilles larges comme des parapluies.",45],
 ["Un petit système d'arrosage murmure quelque part, en fines gouttelettes.",50],
 ["Tu suis un chemin de briques entre les plantes. Une fleur blanche s'ouvre lentement. Un papillon se pose, puis repart.",50],
 ["Au centre de la serre, un petit bassin où flottent des nénuphars. Tu t'assieds sur un banc à côté.",50],
 ["Sur la verrière, quelques flocons de neige se posent et fondent doucement. Toi, tu es au chaud.",55],
 ["Tout pousse ici sans se presser. Les plantes prennent leur temps. Toi aussi, tu peux prendre le tien.",55],
 ["La lumière des lampes devient plus douce. Ta respiration ralentit, calme comme la serre.",60],
 ["Tu peux fermer les yeux et te reposer ici, entouré, ou entourée, de vert et de douceur.",70]]}
];

/* Situations : « J'ai besoin d'une séance pour… » (nouvelles séances et séances existantes) */
const SITUATIONS = [
 ['avant','Avant un moment stressant',['examen','rdvmed','attente','route','avant']],
 ['colere','Après une colère, un conflit',['apresconflit','colere']],
 ['triste','Tristesse, deuil',['tristesse','deuil','emotion']],
 ['seul','Me sentir moins {seul|seule}',['solitude','proches']],
 ['culpa','Culpabilité, reproches',['culpabilite','douceur']],
 ['sante','Peur pour ma santé',['sante','place']],
 ['corps','Corps tendu, douloureux',['douleur','muscle','etire','scan']],
 ['fatigue','Fatigue, épuisement',['epuise','pause']],
 ['travail','Pression au travail',['travail','pression','retour']],
 ['confiance','Confiance en moi',['estime','non','echec','force']],
 ['nuit','Dormir, la nuit',['penseeslit','relax','reveil','scandodo','dodo']],
 ['panique','Angoisse forte, maintenant',['vague','sosvoix','trop']]
];

/* Séries audio : une séance par jour (apparaissent dans « Mon parcours ») */
const SERIES = [
 {id:'serie-anx',audio:1,n:'7 jours pour apprivoiser l’anxiété',d:"Une séance par jour, de quelques minutes, pour changer de relation avec l'anxiété.",s:[
  ['Jour 1 · Respirer sans forcer',"On commence simplement : remarquer sa respiration, sans la contrôler.",'med:respi'],
  ['Jour 2 · Accueillir ce qui est là',"Lutter contre l'émotion lui donne souvent plus de place. Aujourd'hui, on essaie de l'accueillir.",'med:emotion'],
  ['Jour 3 · Les pensées comme des nuages',"Regarder passer les pensées anxieuses, sans monter dedans.",'med:nuages'],
  ['Jour 4 · Le corps qui s’inquiète',"Faire de la place aux sensations, au lieu de les surveiller.",'med:place'],
  ['Jour 5 · Quand j’attends',"Apprendre à tolérer un peu d'incertitude.",'med:attente'],
  ['Jour 6 · Ma force tranquille',"Retrouver ce qui est solide en toi.",'med:force'],
  ['Jour 7 · Ce qui va bien',"Terminer la semaine en remarquant ce qui a été bon.",'med:gratitude']]},
 {id:'serie-dodo',audio:1,n:'7 nuits pour mieux dormir',d:"Une séance chaque soir, au lit, pour retrouver un sommeil plus paisible.",s:[
  ['Nuit 1 · Préparer le soir',"Ralentir avant d'aller au lit.",'med:soir'],
  ['Nuit 2 · Le corps qui se dépose',"Relâcher le corps, morceau par morceau.",'med:scandodo'],
  ['Nuit 3 · Les pensées qui tournent',"Laisser passer les pensées sans les suivre.",'med:penseeslit'],
  ['Nuit 4 · Respirer pour dormir',"Une respiration lente, sans forcer.",'med:dodo'],
  ['Nuit 5 · Une histoire',"Se laisser porter par une histoire lente.",'story:barque'],
  ['Nuit 6 · Relaxation profonde',"Vingt minutes pour se déposer complètement.",'med:relax'],
  ['Nuit 7 · Si je me réveille',"Savoir quoi faire en cas de réveil nocturne.",'med:reveil']]},
 {id:'serie-travail',audio:1,n:'5 jours pour souffler au travail',d:"Une pause par jour de travail, à faire même au bureau.",s:[
  ['Jour 1 · Une vraie pause',"Trois minutes pour remettre les compteurs à zéro.",'med:pause'],
  ['Jour 2 · Lâcher la pression',"Faire redescendre la tension accumulée.",'med:pression'],
  ['Jour 3 · Quand ça déborde',"Revenir à une seule chose à la fois.",'med:travail'],
  ['Jour 4 · Poser une limite',"Se préparer à dire non, calmement.",'med:non'],
  ['Jour 5 · Couper en rentrant',"Laisser le travail derrière la porte.",'med:retour']]}
];

C.meds.push(...MEDS);
C.stories.push(...STORIES);
C.situations = SITUATIONS;
C.progs.unshift(...SERIES);
})();

/* ================= EFT ================= */
(function(){
const C = window.ELYRA_CONTENT;
/* Points : code → [nom, où, comment] */
C.eftPoints = [
 ['MK','Tranche de la main',"Le côté charnu de la main, sous le petit doigt, là où on donnerait un « coup de karaté ».","Tapote avec le bout des doigts de l'autre main, pendant les phrases de préparation."],
 ['ST','Sommet de la tête',"Le haut du crâne, au milieu.","Tapote doucement avec le plat des doigts."],
 ['DS','Début du sourcil',"Le début du sourcil, juste au-dessus du nez.","Deux doigts, d'un côté ou des deux."],
 ['CO','Coin de l’œil',"Sur l'os, au coin extérieur de l'œil.","Tout doucement : c'est une zone fine."],
 ['SO','Sous l’œil',"Sur l'os, sous l'œil, à hauteur de la pupille.","Deux doigts, sans appuyer."],
 ['SN','Sous le nez',"Entre le nez et la lèvre du haut.","Un ou deux doigts."],
 ['ME','Creux du menton',"Le creux entre la lèvre du bas et le menton.","Un ou deux doigts."],
 ['CL','Sous la clavicule',"Juste sous la clavicule, près du haut du sternum.","Les doigts en paquet, ou le poing ouvert."],
 ['SB','Sous le bras',"Sur le côté du corps, environ une main sous l'aisselle.","Le plat de la main."]
];
const PN = Object.fromEntries(C.eftPoints.map(p=>[p[0],p[1]]));
const R8 = ['ST','DS','CO','SO','SN','ME','CL','SB'];
function ronde(k,t,d,intro,sujet,setup,neg,pos){
 const s=[
  ["Installe-toi confortablement. Cette ronde d'EFT dure quelques minutes. Tapote toujours doucement, sans te faire mal. Si quelque chose devient trop fort, arrête-toi et respire.",14,'MK'],
  [intro,14,'MK'],
  ["Note ce que tu ressens maintenant, de zéro à dix. Zéro, c'est pas du tout. Dix, c'est le plus fort possible. Garde ce chiffre en tête.",14,'MK'],
  ["On commence par la tranche de la main. Tapote-la doucement, et répète intérieurement, ou à voix haute, ces phrases.",10,'MK'],
  ...setup.map(x=>[x,10,'MK']),
  ["Maintenant, on fait le tour des points. Je te dis le point, puis une petite phrase. Tu tapotes environ sept fois, sans compter.",10,'ST'],
  ...R8.map((p,i)=>[PN[p]+'. « '+neg[i]+' »',9,p]),
  ["Prends une respiration tranquille. Laisse l'air ressortir lentement.",10,'SB'],
  ["Encore un tour, avec des phrases plus douces.",6,'ST'],
  ...R8.map((p,i)=>[PN[p]+'. « '+pos[i]+' »',9,p]),
  ["Pose tes mains. Respire. Remarque ce qui a changé, même un tout petit peu, ou ce qui n'a pas changé. Les deux sont normaux.",16,'SB'],
  ["Note à nouveau de zéro à dix, à propos de "+sujet+". Si c'est encore élevé, tu peux refaire une ronde. Si ça ne t'aide pas, d'autres outils te conviendront peut-être mieux, et c'est très bien.",16,'SB']];
 return {k,c:'eft',t,d,eft:1,s};
}
const RONDES=[
 ronde('eftstress','EFT · Le stress du moment',"Une ronde de tapotements pour faire redescendre la pression.",
  "Pense au stress que tu ressens aujourd'hui. Où est-il dans ton corps ? Comment le décrirais-tu en quelques mots ?","ce stress",
  ["Même si je ressens tout ce stress, je m'accepte comme je suis.","Même si mon corps est tendu, je suis {gentil|gentille} avec moi.","Même si j'ai trop de choses en tête, je m'accorde ce moment."],
  ["Tout ce stress.","Cette pression dans mon corps.","Trop de choses à la fois.","Je le sens bien.","Ce stress dans mes épaules.","Cette tension.","Tout ce que je porte.","Ce stress."],
  ["Je peux respirer.","Je n'ai pas à tout régler maintenant.","Une chose à la fois.","Je relâche un peu.","Je laisse mes épaules descendre.","Je fais de mon mieux.","Je peux poser un peu de ce poids.","Je m'offre un peu de calme."]),
 ronde('eftpeur',"EFT · Quand j'ai peur de ce qui va arriver","Pour l'anxiété qui imagine le pire.",
  "Pense à ce qui t'inquiète pour plus tard. Remarque la peur, et l'endroit où tu la sens.","cette inquiétude",
  ["Même si j'ai peur de ce qui pourrait arriver, je m'accepte complètement.","Même si mon esprit imagine le pire, je peux être {doux|douce} avec moi.","Même si je ne sais pas comment ça va se passer, je suis ici, maintenant."],
  ["Cette peur.","Et si ça se passait mal ?","Mon esprit imagine le pire.","Cette inquiétude.","Je ne sais pas ce qui va arriver.","Cette boule dans le ventre.","Toute cette anxiété.","Cette peur de l'avenir."],
  ["Pour l'instant, je suis ici.","Le pire n'est pas encore arrivé.","Je ferai face quand ce sera le moment.","Je peux vivre avec un peu d'incertitude.","Je respire, maintenant.","J'ai déjà traversé des choses difficiles.","Je peux me faire confiance.","Je reviens au moment présent."]),
 ronde('eftcolere','EFT · Colère et frustration',"Laisser retomber la colère, sans la juger.",
  "Pense à ce qui t'a mis en colère. Sens la chaleur, la tension, l'envie de réagir.","cette colère",
  ["Même si je suis en colère, je m'accepte comme je suis.","Même si je trouve ça injuste, je peux prendre soin de moi.","Même si j'ai envie d'exploser, je choisis de respirer."],
  ["Toute cette colère.","C'est injuste.","Cette chaleur en moi.","Cette frustration.","Je serre les dents.","Cette envie de réagir.","Toute cette colère dans mon corps.","Cette colère."],
  ["Ma colère a le droit d'exister.","Elle me dit que quelque chose compte pour moi.","Je n'ai pas à réagir tout de suite.","Je laisse la chaleur redescendre.","Je desserre la mâchoire.","Je choisirai ma réponse plus tard.","Je respire plus lentement.","Je retrouve un peu de calme."]),
 ronde('eftdodo',"EFT · Pour s'endormir","Une ronde lente, au lit, pour calmer le mental.",
  "Tu peux faire cette ronde {allongé|allongée}. Pense à ce qui t'empêche de dormir : des pensées, une agitation, une inquiétude.","ton agitation",
  ["Même si ma tête n'arrive pas à s'arrêter, je m'accepte complètement.","Même si j'ai peur de ne pas dormir, je peux me reposer.","Même si la journée a été lourde, je la laisse derrière moi."],
  ["Toutes ces pensées.","Ma tête qui tourne.","Je n'arrive pas à décrocher.","Cette agitation.","Toute cette journée.","Ce qui reste à faire.","Cette inquiétude.","Toutes ces pensées."],
  ["Tout peut attendre demain.","Je dépose ma journée.","Mon corps peut se reposer.","Je laisse les pensées passer.","Je respire plus lentement.","Je suis en sécurité, dans mon lit.","Je me détends un peu plus.","Je laisse venir le repos."]),
 ronde('eftrumine','EFT · Les pensées qui tournent en boucle',"Quand une pensée revient sans arrêt.",
  "Pense à la pensée qui revient sans cesse. Résume-la en quelques mots.","cette pensée",
  ["Même si cette pensée tourne en boucle, je m'accepte complètement.","Même si je n'arrive pas à m'en défaire, je suis {gentil|gentille} avec moi.","Même si mon esprit veut tout comprendre, je peux lâcher un peu."],
  ["Cette pensée.","Elle revient sans arrêt.","Je tourne en rond.","Je n'arrive pas à m'arrêter.","Cette boucle.","Encore et encore.","Toutes ces questions.","Cette pensée."],
  ["Ce n'est qu'une pensée.","Je ne suis pas obligé{e} de la suivre.","Je peux la laisser passer.","Je reviens à mon corps.","Je sens mes pieds.","Je respire.","Mon attention peut aller ailleurs.","Je choisis de me reposer."]),
 ronde('eftestime','EFT · Confiance en moi',"Adoucir la critique intérieure.",
  "Pense à une critique que tu te fais souvent. Remarque comment elle te fait te sentir.","cette critique",
  ["Même si je me critique, je choisis de m'accepter.","Même si je doute de moi, je mérite de la gentillesse.","Même si je ne suis pas parfait{e}, je suis assez."],
  ["Cette voix qui me critique.","Je ne suis pas à la hauteur.","Ce doute.","Je me compare.","Cette dureté envers moi.","Je me sens petit{e}.","Toute cette critique.","Ce manque de confiance."],
  ["Je fais de mon mieux.","J'ai le droit de me tromper.","J'ai des qualités, même si je les oublie.","Je peux me parler gentiment.","Je mérite du respect.","J'avance à mon rythme.","Je suis assez, tel{|le} que je suis.","Je choisis la douceur envers moi."])
];
C.meds.push(...RONDES);
C.cats.push(['eft','EFT']);
C.situations.splice(1,0,['eft','Tapoter pour m’apaiser (EFT)',['eftstress','eftpeur','eftcolere','eftdodo','eftrumine','eftestime']]);

C.meds.push({k:'tisane',c:'quotidien',t:'Le rituel de la tisane',d:"Savourer une boisson chaude en pleine conscience. Le geste lui-même apaise.",s:[
 ["Prépare une boisson chaude que tu aimes : une tisane, un thé, un lait chaud. Prends-la entre tes mains, et installe-toi.",20],
 ["Sens d'abord la chaleur de la tasse dans tes paumes. Laisse cette chaleur remonter dans tes mains, tes poignets.",30],
 ["Regarde la vapeur qui monte, lentement. Elle danse, puis disparaît.",25],
 ["Approche la tasse de ton visage. Respire son parfum, sans te presser.",30],
 ["Prends une première petite gorgée. Remarque la température, le goût, la sensation dans la bouche, puis dans la gorge.",35],
 ["Pose la tasse un moment. Remarque la chaleur qui reste en toi.",30],
 ["Continue à boire à ton rythme. À chaque gorgée, laisse les épaules descendre un peu.",45],
 ["Ce petit rituel, tu peux le refaire chaque soir. C'est une manière simple de dire à ton corps : maintenant, on ralentit.",20]]});

C.fiches.push(
{k:'eft',t:'L’EFT, concrètement',d:"Tapoter sur des points du visage et du corps en mettant des mots sur ce qu'on ressent.",b:[
 "L'EFT, pour « Emotional Freedom Techniques », consiste à tapoter doucement du bout des doigts sur quelques points du visage et du haut du corps, tout en nommant ce que l'on ressent.",
 ["Comment ça se passe","On note d'abord l'intensité de ce qu'on ressent, de 0 à 10. On tapote la tranche de la main en disant une phrase d'acceptation. Puis on fait le tour des points avec une courte phrase. À la fin, on note à nouveau."],
 ["Ce qu'on en sait","Plusieurs études suggèrent que l'EFT peut aider à faire baisser le stress et l'anxiété chez certaines personnes, mais leur qualité est variable et on ne sait pas exactement pourquoi ça aide. Le fait de s'arrêter, de nommer son émotion, de s'accepter et de se toucher avec douceur y contribue sans doute."],
 ["Les bonnes règles","Tapote doucement, jamais jusqu'à avoir mal. Tu peux utiliser un seul côté. Si une émotion devient trop forte, arrête et reviens à ta respiration ou à l'ancrage."],
 ["Ce que l'EFT ne remplace pas","L'EFT ne remplace ni un traitement ni un suivi. Pour des souvenirs très douloureux ou un traumatisme, il vaut mieux être {accompagné|accompagnée} par un ou une professionnelle formée."],
 "Dans ELYRA, tu trouves les points dans Méditer, catégorie EFT, et des rondes guidées par thème."]},
{k:'plantes',t:'Les plantes qui apaisent',d:"Tisanes et plantes pour le stress et le sommeil : ce qu'on sait, et les précautions.",b:[
 "Certaines plantes sont utilisées depuis longtemps pour le stress léger et le sommeil. Leur effet est en général modeste, et « naturel » ne veut pas dire « sans risque ». Cette fiche t'aide à t'y retrouver : elle ne remplace pas l'avis de ton pharmacien ou de ton médecin.",
 ["Les plantes reconnues pour un usage traditionnel","L'Agence européenne des médicaments reconnaît un usage traditionnel de la mélisse, de la passiflore, de la valériane, du houblon et de la fleur de lavande pour soulager le stress léger et aider au sommeil. « Usage traditionnel » veut dire qu'elles sont utilisées sans problème depuis au moins trente ans, mais que les études cliniques ne suffisent pas à prouver leur efficacité."],
 ["Si ça dure","Si le stress ou les troubles du sommeil durent plus de deux semaines, ou s'aggravent, parles-en à ton médecin."],
 ["La valériane","Elle peut rendre somnolent{e}. Prudence avant de conduire, et pas avec de l'alcool, des somnifères ou des calmants sans avis médical. Elle peut aussi donner des nausées ou des crampes au ventre."],
 ["La lavande","Une préparation précise d'huile essentielle de lavande en capsules a été étudiée dans plusieurs essais : elle a réduit l'anxiété mieux qu'un placebo. Ces résultats valent pour ce produit précis seulement. N'avale jamais une huile essentielle du commerce : celles pour diffuseurs ne se boivent pas."],
 ["La camomille","Douce, en tisane. Attention si tu es allergique aux plantes de la famille des marguerites (comme l'ambroisie ou l'armoise)."],
 ["Le millepertuis : grande prudence","Il interagit avec beaucoup de médicaments : la pilule contraceptive (avec des grossesses non désirées signalées), les anticoagulants, les antidépresseurs, et bien d'autres. Il rend aussi la peau plus sensible au soleil. Ne le prends jamais sans en parler à ton médecin ou ton pharmacien."],
 ["Les compléments à la mode","Rhodiola, safran, ashwagandha… Ils sont très vendus, mais les preuves restent limitées. Des cas de problèmes de foie ont été signalés avec l'ashwagandha. Demande conseil avant d'en prendre."],
 ["Toujours demander au pharmacien","Surtout si tu prends déjà des médicaments, si tu es enceinte ou allaites, si tu as un problème de foie ou de reins, ou avant une opération. N'arrête jamais un traitement prescrit pour le remplacer par des plantes."],
 ["Le meilleur de la tisane","Souvent, c'est aussi le rituel qui apaise : la chaleur, l'odeur, la pause. Essaie la séance « Le rituel de la tisane »."]]}
);
})();
