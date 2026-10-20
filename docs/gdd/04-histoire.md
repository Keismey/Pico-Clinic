# Pico-Clinic — GDD v14 · Histoire : personnages, dialogues, arcs, fin et extras, textes FR/EN

> Extrait fidèle du GDD (artefact « GDD – Pico-Clinic, le Micro-Chirurgien de Drones »), découpé le 2026-10-21.

## Histoire & personnages

Tu reprends l'atelier de **Maître Ohm**, un réparateur légendaire parti sans explication. Son carnet, ses outils et sa petite souris mécanique **Gribouille** (qui donne les conseils du tutoriel) sont restés. Au fil des réparations, tu découvres pourquoi il est parti et tu deviens à ton tour un maître.

### Les clients et leur fil rouge

| Client | Style | Arc (5 à 7 commandes) |
|---|---|---|
| Mme Volute | Collectionneuse bavarde | Papillons mécaniques de plus en plus rares, prépare une exposition ; à la fin, elle te réserve la place d'honneur |
| Baptiste « Turbo » | Pilote pressé, fanfaron | Rivalité amicale de courses ; tes réparations préparent sa finale, objectifs de temps plus serrés |
| Prof. Ampère | Inventeur distrait | Prototypes uniques, souvent sans plan ; il a connu Maître Ohm et lance l'indice du départ |
| Léa | Enfant discrète | Sa peluche robot *Pantoufle* ; dans le cœur-batterie, tu trouves un petit mot caché de sa grand-mère |
| M. Brindille | Livreur de quartier | Sa flotte de drones livreurs tombe en panne chaque semaine ; fournit les commandes rapides de remplissage |
| Dr Quartz | Rivale sérieuse | Dirige une grande clinique de robots ; au rang 4 elle te propose un partenariat, puis finit par t'estimer |

### Chapitres (un par rang)

- **1** : l'héritage, premiers clients, découverte du carnet.
- **2** : l'atelier prend de la valeur, Turbo devient un habitué et Brindille arrive.
- **3** : l'histoire de Pantoufle, Ampère parle de Maître Ohm.
- **4** : Dr Quartz arrive, Turbo prépare sa finale, Mme Volute prépare son exposition, offre de partenariat de Dr Quartz.
- **5** : l'exposition de Mme Volute, la finale de Turbo, la lettre de Maître Ohm (commande 59) puis son dernier prototype (commande 60) ; tu deviens Maître.

Ton : doux, drôle, jamais sombre. Les dialogues tiennent en 2 à 3 bulles courtes avant chaque réparation.


## Dialogues d'accueil et de remerciement

Un accueil et un remerciement par client (la version complète de chaque arc est écrite à l'étape V2). Clés : client.intro, client.thanks.

| Client | Français | English |
|---|---|---|
| Mme Volute (accueil) | Mon papillon ne bat plus des ailes, mon petit. Vous pouvez faire quelque chose ? | My butterfly won't flap its wings anymore, dear. Can you do something? |
| Mme Volute (merci) | Le voilà qui vole ! Vous avez des doigts de fée. | There he goes! You have fairy fingers. |
| Turbo (accueil) | Dix minutes avant la course. Tu peux le faire en cinq ? | Ten minutes before the race. Can you do it in five? |
| Turbo (merci) | Tu es le meilleur ! Je te dois une victoire. | You're the best! I owe you a win. |
| Prof. Ampère (accueil) | J'ai... construit ça. Je crois. Je n'ai plus le plan. | I... built this. I think. I lost the plans. |
| Prof. Ampère (merci) | Extraordinaire ! Comment avez-vous deviné ? | Extraordinary! How did you guess? |
| Léa (accueil) | C'est Pantoufle... il ne bouge plus. | It's Pantoufle... he won't move anymore. |
| Léa (merci) | Merci ! Il m'a fait coucou ! | Thank you! He waved at me! |
| M. Brindille (accueil) | Encore un livreur en rade. La tournée n'attend pas ! | Another courier down. The round won't wait! |
| M. Brindille (merci) | Parfait, à la semaine prochaine. Enfin, j'espère que non. | Perfect, see you next week. Well, I hope not. |
| Dr Quartz (accueil) | Voyons si votre atelier tient la comparaison. | Let's see if your workshop measures up. |
| Dr Quartz (merci) | Correct. Plus que correct, même. | Adequate. More than adequate, actually. |
| Gribouille (conseil) | Chaque petit geste compte, patron ! | Every little move counts, boss! |


## Arcs de Léa et de Mme Volute

Chaque réparation d'histoire a un accueil (avant) et un merci (après). Numéros = commandes de l'onglet 60 réparations. Clés : arc.client.numero.intro / .thanks.

### Léa et Pantoufle (6 commandes)

Une petite fille timide dont la peluche robot a été fabriquée par sa grand-mère. Le ton monte doucement en confiance jusqu'à la dernière visite.

| \# | Français | English |
|---|---|---|
| 1 | **Accueil :** Bonjour... mon drone ne marche plus. Papa dit qu'il est trop vieux.<br>**Merci :** Il vole ! Merci beaucoup ! | **Intro:** Hello... my drone won't work. Dad says it's too old.<br>**Thanks:** It flies! Thank you so much! |
| 9 | **Accueil :** Voilà Pantoufle. Mamie me l'a donné. Il ne ronronne plus.<br>**Merci :** Il ronronne ! Il est guéri ! | **Intro:** This is Pantoufle. Grandma gave him to me. He doesn't purr anymore.<br>**Thanks:** He's purring! He's all better! |
| 18 | **Accueil :** Pantoufle a eu froid à la fenêtre hier. Il fait un drôle de bruit.<br>**Merci :** Plus de bruit ! Je lui ai mis une écharpe. | **Intro:** Pantoufle got cold by the window yesterday. He's making a funny noise.<br>**Thanks:** No more noise! I gave him a scarf. |
| 28 | **Accueil :** Pantoufle est très fatigué. Tu peux changer son cœur ?<br>**Merci :** Il y avait un petit papier dans son cœur ! Tu peux le lire avec moi ? | **Intro:** Pantoufle is very tired. Can you replace his heart?<br>**Thanks:** There was a little paper inside his heart! Will you read it with me? |
| 28<br>(mot caché) | Pour Léa, pour qu'elle ne soit jamais seule la nuit. Je t'aime. Mamie. | For Léa, so she is never alone at night. I love you. Grandma. |
| 45 | **Accueil :** Je voulais juste montrer ton atelier à Pantoufle. Il peut rester un peu ?<br>**Merci :** Il est tout propre ! Tiens, c'est pour toi : une clé. Mamie dit que c'est la clé de son cœur. | **Intro:** I only wanted to show Pantoufle your workshop. Can he stay a little?<br>**Thanks:** He's all clean! Here, this is for you: a key. Grandma says it's the key to his heart. |
| 54 | **Accueil (Léa) :** Mamie vient avec moi aujourd'hui ! Elle voudrait te remercier.<br>**Merci (Mamie) :** C'est donc vous qui avez soigné mon petit Pantoufle. Merci du fond du cœur.<br>**Fin (Léa) :** Quand je serai grande, je serai réparatrice comme toi ! | **Intro (Léa):** Grandma's coming with me today! She'd like to thank you.<br>**Thanks (Grandma):** So you're the one who took care of my little Pantoufle. Thank you from the bottom of my heart.<br>**End (Léa):** When I grow up, I'll be a repairer like you! |

### Mme Volute et sa collection (7 commandes)

Bavarde et chaleureuse, elle donne un nom à chacun de ses insectes et prépare une grande exposition. Elle devient la première ambassadrice de l'atelier.

| \# | Français | English |
|---|---|---|
| 7 | **Accueil :** Mon scarabée Auguste, un amour ! Il traîne les élytres depuis une semaine.<br>**Merci :** Auguste vole ! Vous avez des doigts de fée. Je reviendrai, comptez sur moi. | **Intro:** My scarab Auguste, a darling! His wing cases have been dragging for a week.<br>**Thanks:** Auguste is flying! You have fairy fingers. I'll be back, you can count on me. |
| 16 | **Accueil :** Ma libellule Cléo a perdu son éclat. Je l'ai trouvée à Lisbonne en 1998, imaginez !<br>**Merci :** La voilà qui scintille ! J'en parlerai à toutes mes amies. | **Intro:** My dragonfly Cleo has lost her sparkle. I found her in Lisbon in 1998, imagine!<br>**Thanks:** There she shines! I'll tell all my friends. |
| 22<br>(examen) | **Accueil :** Mes deux joyaux, Cléo et Auguste, avant mon exposition. Tout doit être parfait.<br>**Merci :** Parfait ! Vous êtes officiellement le réparateur de ma collection. | **Intro:** My two jewels, Cleo and Auguste, before my exhibition. Everything must be perfect.<br>**Thanks:** Perfect! You are officially the repairer of my collection. |
| 32 | **Accueil :** Une abeille ! Un modèle rarissime. Elle bourdonne faux.<br>**Merci :** Elle bourdonne juste ! Vous avez de l'oreille. | **Intro:** A bee! An extremely rare model. She buzzes out of tune.<br>**Thanks:** She buzzes true! You have a good ear. |
| 37 | **Accueil :** Ma luciole Aurore, offerte par mon défunt mari. Elle ne brille plus...<br>**Merci :** Elle brille... Merci. Vous ne savez pas ce que cela signifie pour moi. | **Intro:** My firefly Aurora, a gift from my late husband. She doesn't glow anymore...<br>**Thanks:** She's glowing... Thank you. You can't know what this means to me. |
| 48 | **Accueil :** Mon exposition ouvre demain ! Trois de mes plus belles pièces, et un souci pour chacune.<br>**Merci :** Les voilà prêtes ! Tenez, un papillon de verre, pour vous porter chance. | **Intro:** My exhibition opens tomorrow! Three of my finest pieces, and each has a problem.<br>**Thanks:** They're ready! Here, a glass butterfly, for good luck. |
| 57 | **Accueil :** Deuxième partie de l'exposition : l'abeille et la mante. Je compte sur vous, cher maître.<br>**Merci :** Un triomphe ! Le journal veut vous interviewer. Je leur ai dit que vous étiez timide. | **Intro:** Second part of the exhibition: the bee and the mantis. I'm counting on you, dear master.<br>**Thanks:** A triumph! The newspaper wants to interview you. I told them you were shy. |


## Arcs de Turbo et de M. Brindille

### Baptiste « Turbo » (7 commandes)

Pilote de course de drones, pressé et fanfaron mais bon perdant. Il dispute une grande finale contre son rival Zéphyr (jamais vu à l'écran) et ses commandes imposent des temps cibles de plus en plus serrés.

| \# | Français | English |
|---|---|---|
| 8 | **Accueil :** Dix minutes avant la course ! Tu peux le faire en cinq ?<br>**Merci :** Tu es le meilleur ! Je te dois une victoire. | **Intro:** Ten minutes before the race! Can you do it in five?<br>**Thanks:** You're the best! I owe you a win. |
| 15 | **Accueil :** Qualifications demain. Zéphyr se vante d'avoir le drone le plus rapide de la ville.<br>**Merci :** Il est plus rapide qu'avant ! Zéphyr n'a qu'à bien se tenir. | **Intro:** Qualifiers tomorrow. Zephyr brags that he has the fastest drone in town.<br>**Thanks:** It's faster than before! Zephyr had better watch out. |
| 26 | **Accueil :** J'ai raté mon virage hier. Peut-être que c'est moi le problème... mais vérifie quand même le drone.<br>**Merci :** C'était le capteur ! Bon, j'avoue, je virais aussi un peu large. | **Intro:** I missed my turn yesterday. Maybe I'm the problem... but check the drone anyway.<br>**Thanks:** It was the sensor! Well, I admit I was also turning a bit wide. |
| 34<br>(examen) | **Accueil :** La finale approche ! Je veux un drone de course parfait. Pas un de plus, pas un de moins.<br>**Merci :** Parfait. Je t'invite à la finale, tu auras une place en pleine lumière. | **Intro:** The final is coming! I want a perfect race drone. Not a bit more, not a bit less.<br>**Thanks:** Perfect. I'm inviting you to the final, you'll have a front-row seat. |
| 39 | **Accueil :** Un petit choc à l'entraînement. Rien de grave, ne t'inquiète pas. (Il y a beaucoup de fumée.)<br>**Merci :** Plus de fumée ! Tu m'as sauvé la saison. | **Intro:** A little crash at practice. Nothing serious, don't worry. (There is a lot of smoke.)<br>**Thanks:** No more smoke! You saved my season. |
| 49 | **Accueil :** Première manche de la finale ! Tu es dans mon camp, d'accord ?<br>**Merci :** On est en tête ! Mais Zéphyr n'a pas dit son dernier mot. | **Intro:** First round of the final! You're on my team, okay?<br>**Thanks:** We're in the lead! But Zephyr hasn't said his last word. |
| 56 | **Accueil :** Dernière manche, record à battre. Fais-moi un drone de rêve !<br>**Merci :** On a gagné d'un cheveu ! La coupe est à nous deux, je te la prête quand tu veux. | **Intro:** Last round, record to beat. Make me a dream drone!<br>**Thanks:** We won by a hair! The cup is ours, I'll lend it to you any time. |

### M. Brindille (7 commandes)

Livreur de quartier débordé qui voit sa petite flotte de drones tomber en panne chaque semaine. Chaleureux et un peu brouillon, il finit par faire de l'atelier son partenaire officiel.

| \# | Français | English |
|---|---|---|
| 11 | **Accueil :** Encore un livreur en rade. La tournée n'attend pas !<br>**Merci :** Parfait. À la semaine prochaine ! Enfin, j'espère que non. | **Intro:** Another courier out of service. The round won't wait!<br>**Thanks:** Perfect. See you next week! Well, I hope not. |
| 14 | **Accueil :** Mon drone livre toujours à côté de la boîte aux lettres. Il est déréglé, non ?<br>**Merci :** Il vise juste maintenant ! Ma voisine va enfin recevoir ses colis. | **Intro:** My drone keeps delivering next to the mailbox. It's out of tune, isn't it?<br>**Thanks:** It aims true now! My neighbor will finally get her parcels. |
| 19 | **Accueil :** Il a enflé d'un coup, comme un ballon. J'ai préféré vous l'apporter avant qu'il explose.<br>**Merci :** Ouf, pas d'explosion ! Je vous offre un café... enfin, un autre jour. | **Intro:** It swelled up all at once, like a balloon. I thought I'd bring it before it blew.<br>**Thanks:** Phew, no explosion! I'll buy you a coffee... some other day. |
| 24 | **Accueil :** Un drone qui s'arrête en plein ciel, c'est gênant. Surtout au-dessus du marché.<br>**Merci :** Tout marche ! Les poireaux sont saufs, merci ! | **Intro:** A drone that stops mid-air is awkward. Especially above the market.<br>**Thanks:** Everything works! The leeks are safe, thanks! |
| 33 | **Accueil :** J'en ai deux en panne ! Le premier hurle, le deuxième ne dit rien. Lequel est le pire ?<br>**Merci :** Les deux comme neufs. Vous m'évitez de démissionner ! | **Intro:** I've got two broken! One screams, the other says nothing. Which one's worse?<br>**Thanks:** Both as good as new. You're saving me from quitting! |
| 42 | **Accueil :** Trois drones, un camion de lait, une heure de délai. Je n'ose pas vous demander.<br>**Merci :** Le lait est parti à l'heure ! Vous êtes mon héros du quartier. | **Intro:** Three drones, a milk truck, one hour. I don't dare to ask.<br>**Thanks:** The milk left on time! You're my neighborhood hero. |
| 52 | **Accueil :** Toute la flotte est tombée en panne en même temps. Je crois qu'on a un problème de pluie.<br>**Merci :** Réparée ! Je vous propose un contrat officiel, et j'ai baptisé mon meilleur drone « Pico ». | **Intro:** The whole fleet broke down at once. I think we have a rain problem.<br>**Thanks:** Fixed! I'm offering you an official contract, and I named my best drone Pico. |


## Arcs du Prof. Ampère et de Dr Quartz, lettre et générique

### Prof. Ampère (7 commandes)

Inventeur distrait qui apporte des prototypes sans plan. Il a connu Maître Ohm et laisse tomber des indices à chaque visite, jusqu'à la lettre.

| \# | Français | English |
|---|---|---|
| 10<br>(examen) | **Accueil :** J'ai... construit ça. Je crois. Je n'ai plus le plan.<br>**Merci :** Extraordinaire ! Comment avez-vous deviné ? Vous me rappelez quelqu'un. | **Intro:** I... built this. I think. I lost the plans.<br>**Thanks:** Extraordinary! How did you guess? You remind me of someone. |
| 21 | **Accueil :** Mon drone ne vole plus droit. Il y avait un plan, quelque part, dans une autre poche.<br>**Merci :** Il vole droit ! Un homme faisait pareil, avant, avec ces mêmes gestes. | **Intro:** My drone doesn't fly straight anymore. There was a plan somewhere, in another pocket.<br>**Thanks:** It flies straight! A man used to do the same, with those same moves. |
| 30 | **Accueil :** Une méduse qui flotte ! Elle exige une lentille de cristal, paraît-il.<br>**Merci :** Elle flotte ! Maître Ohm m'avait appris cette astuce, il y a longtemps. | **Intro:** A floating jellyfish! It apparently demands a crystal lens.<br>**Thanks:** It floats! Master Ohm taught me that trick, long ago. |
| 40 | **Accueil :** Un oiseau en papier, mais miécanique. Il a besoin d'un ressort très ancien.<br>**Merci :** Il bat des ailes ! Savez-vous que Maître Ohm tenait un carnet ? Il a dû vous le laisser. | **Intro:** A paper bird, but mechanical. It needs a very old spring.<br>**Thanks:** It flaps its wings! Did you know Master Ohm kept a notebook? He must have left it to you. |
| 50 | **Accueil :** Une boîte à rêves : elle joue la musique de ce qu'on a oublié. Il lui faut un diapason et un fil d'or.<br>**Merci :** Elle chante ! Pour la première fois depuis des années, je me souviens d'une chanson. | **Intro:** A dream box: it plays the music of what we forgot. It needs a tuning fork and a gold thread.<br>**Thanks:** It sings! For the first time in years, I remember a song. |
| 55 | **Accueil :** Une tortue-horloge, trois engrenages. Maître Ohm m'a laissé un message pour vous, mais je l'ai perdu.<br>**Merci :** Elle marche ! Et... je l'ai retrouvé, le message. Il est dans la prochaine boîte. | **Intro:** A clock turtle, three gears. Master Ohm left me a message for you, but I lost it.<br>**Thanks:** It runs! And... I found it, the message. It's in the next box. |
| 59 | **Accueil :** Ceci est un drone-échantillon de Maître Ohm. Il y a une lettre à l'intérieur, pour vous.<br>**Merci :** Lisez-la. Moi, je vais pleurer discrètement derrière cette étagère. | **Intro:** This is a sample drone from Master Ohm. There's a letter inside, for you.<br>**Thanks:** Read it. I'll go and cry quietly behind that shelf. |

### Dr Quartz (5 commandes)

Directrice d'une grande clinique de robots, sérieuse et exigeante. Elle teste l'atelier avant de reconnaître sa valeur, et son respect se lit dans ses répliques de plus en plus chaleureuses.

| \# | Français | English |
|---|---|---|
| 35 | **Accueil :** Voyons si votre atelier tient la comparaison.<br>**Merci :** Passable. | **Intro:** Let's see if your workshop measures up.<br>**Thanks:** Passable. |
| 43 | **Accueil :** Une mante, des broches, un capteur. J'ai déjà perdu un technicien sur celle-là.<br>**Merci :** Correct. Je note votre nom. | **Intro:** A mantis, pins, a sensor. I've already lost a technician on this one.<br>**Thanks:** Adequate. I'm noting your name. |
| 46<br>(examen) | **Accueil :** Voici le prototype de ma clinique. Si vous le réussissez, je vous propose un partenariat.<br>**Merci :** Honorable. Mieux que cela. Tenez, un quartz taillé : il est à vous. | **Intro:** This is my clinic's prototype. If you succeed, I'm offering you a partnership.<br>**Thanks:** Honorable. Better than that. Here, a cut quartz: it's yours. |
| 53 | **Accueil :** Mon ours à musique préféré. Il joue faux depuis des mois. Montrez-moi ce que valent nos deux ateliers.<br>**Merci :** Je retire mes doutes. Nos deux ateliers valent mieux ensemble. | **Intro:** My favorite music bear. It's been playing out of tune for months. Show me what our two workshops are worth.<br>**Thanks:** I withdraw my doubts. Our two workshops are worth more together. |
| 58 | **Accueil :** Un rayon de miel. Mon dernier pari. Il exige un quartz taillé, et je sais que vous en avez un.<br>**Merci :** Correct. Plus que correct, même. Bienvenue chez les maîtres. | **Intro:** A honeycomb. My last bet. It demands a cut quartz, and I know you have one.<br>**Thanks:** Adequate. More than adequate, actually. Welcome among the masters. |

### La lettre de Maître Ohm (commande 59)

**FR :** « À mon successeur. Si tu lis ces lignes, mon atelier est entre de bonnes mains. Je suis parti parce qu'un atelier doit passer de main en main, comme un outil bien-aimé. Dans la dernière boîte, tu trouveras le seul prototype que je n'ai jamais su finir. Prends ton temps : il n'y a pas d'horloge pour ce travail. Garde la puce dorée, elle est à toi. — Ohm »<br><br>**EN:** « To my successor. If you're reading this, my workshop is in good hands. I left because a workshop has to pass from hand to hand, like a well-loved tool. In the last box, you'll find the only prototype I never managed to finish. Take your time: there is no clock for this job. Keep the golden chip, it's yours. — Ohm »

### Commande 60 : le dernier prototype

- **Accueil (Gribouille) :** C'est le dernier, patron. Il n'y a pas de temps limite. / *This is the last one, boss. There's no time limit.*
- **Fin :** le prototype s'envole vers la fenêtre en tenant une carte postale. Texte : « Merci. Je repars avec le sourire. Pense à graisser les charnières. — O. » / *« Thank you. I'm leaving with a smile. Remember to oil the hinges. — O. »*
- **Gribouille :** On a réussi, patron ! / *We did it, boss!*

### Générique (court)

Image de groupe de tous les clients devant l'atelier, enseigne repeinte « Pico-Clinic ». Les lignes défilent sur fond de musique d'atelier :

- Un jeu créé par \[nom du créateur à compléter\]
- Programmation : Claude
- Illustrations : générées avec Gemini
- Musiques et sons : \[outil utilisé à compléter\]
- Merci à Léa, Mme Volute, Turbo, M. Brindille, au Prof. Ampère, à Dr Quartz et à Maître Ohm
- Merci d'avoir joué — Thank you for playing


## Fin du jeu et contenus annexes

### Les 12 pièces rares

| Pièce | Obtention | Sert à |
|---|---|---|
| Engrenage de laiton d'horloger | 3 étoiles, commande 10 | Tortue-horloge (55) |
| Fil d'or ultra-fin | 3 étoiles, commande 14 | Boîte à rêves (50) |
| Aile de libellule en fibre | 3 étoiles, commande 16 | Collection |
| Lentille de cristal | 3 étoiles, commande 23 | Méduse volante (30) |
| Ressort de montre ancien | 3 étoiles, commande 25 | Oiseau en papier (40) |
| Pile au graphite | 3 étoiles, commande 41 | Collection |
| Diapason d'argent | 3 étoiles, commande 44 | Boîte à rêves (50) |
| Clé minuscule | Cadeau de Léa, commande 45 | Collection |
| Pierre de quartz taillée | Cadeau de Dr Quartz, commande 46 | Rayon de miel (58) |
| Papillon de verre | Cadeau de Mme Volute, commande 48 | Collection |
| Puce dorée de Maître Ohm | Commande 59 | Dernier prototype (60) |
| Médaillon de Maître Ohm | Commande 60 | Collection, à la toute fin |

### Succès (10)

- Premier envol : réparer le premier drone.
- Main de fée : 3 étoiles sur 10 commandes.
- Zéro court-circuit : une réparation complète sans court-circuit.
- Propre comme un sou neuf : 100 % de propreté sur 5 commandes.
- Maître soudeur : 50 soudures parfaites.
- Sauveur de Pantoufle : réparer la peluche de Léa 5 fois (toutes ses commandes).
- Collectionneur : les 12 pièces rares.
- Décorateur : les 8 décorations.
- Série en or : défi quotidien 7 jours d'affilée.
- Maître Micro-Chirurgien : atteindre le rang 5.

### La fin

- **Lettre de Maître Ohm (commande 59) :** il explique qu'un atelier doit passer de main en main, qu'il est parti voir le monde en laissant derrière lui un dernier prototype à réparer, le seul qu'il n'a jamais su finir.
- **Commande 60 :** le dernier prototype, sans limite de temps ; une fois réactivé, il s'envole vers la fenêtre avec une carte postale de Maître Ohm.
- **Final :** l'enseigne de l'atelier est repeinte « Pico-Clinic », tous les clients y sont montrés en une image de groupe, puis générique court.
- **Après la fin :** Atelier libre, défi quotidien et rejouabilité des commandes pour viser les 3 étoiles et la collection complète.

### Valeurs par défaut des réglages

- Son 80 %, musique 60 %, vibration activée, tremblement réduit désactivé, mode gaucher désactivé.
- Effacer la sauvegarde demande deux confirmations.


## Textes d'exemple (clés FR / EN)

Une clé par texte, jamais de phrase en dur dans le code. Les variables entre accolades sont remplacées au moment d'afficher.

| Clé | Français | English |
|---|---|---|
| ui.play | Jouer | Play |
| ui.continue | Continuer | Continue |
| ui.shop | Boutique | Shop |
| ui.notebook | Carnet | Notebook |
| ui.settings | Réglages | Settings |
| tool.solder | Fer à souder | Soldering iron |
| tool.laser | Laser de soudure | Solder laser |
| fault.cable_cut | Câble coupé | Cut cable |
| fault.chip_burnt | Puce grillée | Burnt chip |
| fault.rust | Rouille | Rust |
| result.stars | {n} étoile(s) sur 3 | {n} out of 3 stars |
| result.tip | Pourboire : +{n} crédits | Tip: +{n} credits |
| gribouille.hint1 | Tourne en cercle autour de la vis. | Draw a circle around the screw. |
| gribouille.hint2 | Doucement : la soudure aime la patience. | Easy now: solder likes patience. |
| arc.volute.7.intro | Mon scarabée Auguste, un amour ! Il traîne les élytres depuis une semaine. | My scarab Auguste, a darling! His wing cases have been dragging for a week. |
| arc.turbo.8.intro | Dix minutes avant la course ! Tu peux le faire en cinq ? | Ten minutes before the race! Can you do it in five? |

### Règles de traduction

- Les pluriels et les nombres passent par une petite fonction de formatage, pas par des chaînes coupées.
- Prévoir 30 % de place en plus dans les boutons et bulles (l'anglais et le français n'ont pas la même longueur).
- Le ton de chaque client doit rester reconnaissable dans les deux langues.
- Les clés des deux fichiers doivent être identiques ; un test automatique signale toute clé manquante.
