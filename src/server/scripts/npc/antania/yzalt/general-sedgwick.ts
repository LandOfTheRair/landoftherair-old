import { NPC } from '../../../../../shared/models/npc';

import { values } from 'lodash';
import { HenizFindSedgwick } from '../../../../quests/antania/Yzalt/HenizFindSedgwick';
import { SteffenFindSedgwick } from '../../../../quests/antania/Yzalt/SteffenFindSedgwick';
import { KillRanata } from '../../../../quests/antania/Yzalt/KillRanata';

const RANATA_KEY = 'Ranata\'s Key';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.allegiance = 'Pirates';
  npc.affiliation = 'Exiled General';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Well met, ${player.name}! You might have been led to believe that I perished in the war. As you can see, that's not true.
      To be honest, I was exiled. I threatened to expose the war, and this is the price I paid.
      I have a bed, water, food, and a coffin for when I finally die down here.
      Let me tell you the TRUTH of this pointless struggle.`;
    });

  npc.parser.addCommand('truth')
    .set('syntax', ['truth'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `The truth. Yes, the truth. Let's see here. In the not-so-distant past, the Heniz and Steffen were one. 
      A valiant, noble kin. It seems like forever ago now. Then the magical FRUIT started growing.
      Oh boy, was it growing. Before we knew it, it was everywhere nearest the castle.
      That's when a civil WAR broke out.`;
    });

  npc.parser.addCommand('fruit')
    .set('syntax', ['fruit'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Those damned, magical apples. No matter what anyone tells you, the WAR happened because of them. 
      They bestowed gifts of powerful magic, but they slowly wore on the sanity of the person eating them. 
      I think the NAMELESS were trying to experiment on us. 
      You can see the result of the apples in the wasteland - shells of warriors everywhere, fighting forever.`;
    });

  npc.parser.addCommand('war')
    .set('syntax', ['war'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `The fruit tasted too good. The effects were too great. 
      What is now the Heniz was formed because of their dedication to the dark arts. 
      They stole apples -- too many apples. They craved the knowledge.
      You can probably guess -- the royal faction didn't take too kindly to this, and every thief was exiled from the land. 
      Thus, they made their home in the bog, where they now exist solely to pillage from the Steffen.`;
    });

  npc.parser.addCommand('nameless')
    .set('syntax', ['nameless'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Yes, the Nameless. A strange group, they were. Their feet never touched the ground, and they spoke with their minds. 
      They said they had come bearing gifts, and to plant the seeds they had given us in our land, promising prosperity for ages to come. 
      We know nothing of where they came from, and where they went to, just that our society is forever ruined because of them.`;
    });

  npc.parser.addCommand('ranata')
    .set('syntax', ['ranata'])
    .set('logic', (args, { player }) => {

      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(!player.hasQuest(KillRanata)) {
        if(player.hasPermanentCompletionFor('HenizFindSedgwick') || !HenizFindSedgwick.isComplete(player)) return 'Why are you bringing Ranata up?';
      }

      if(player.rightHand) return 'Please empty your right hand.';

      npc.$$room.npcLoader.loadItem(RANATA_KEY)
        .then(item => {
          player.setRightHand(item);
        });

      return `It's sad - Ranata and I go way back, but he must be stopped.
        There isn't any secret magic like I told Ergorat, but there is this key.
        Ranata gave it to me as a sign of trust - I pray he's too far gone to know what hit him.`;
    });

  npc.parser.addCommand('friend')
    .set('syntax', ['friend'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(!player.hasQuest(KillRanata)) {
        if(player.hasPermanentCompletionFor('SteffenFindSedgwick') || !SteffenFindSedgwick.isComplete(player)) return 'What about my friend?';
      }

      if(player.rightHand) return 'Please empty your right hand.';

      npc.$$room.npcLoader.loadItem(RANATA_KEY)
        .then(item => {
          player.setRightHand(item);
        });

      return `Well, I suppose it's no surprise, but at least now I'll know what happens to him.
      Down in the madhouse, no one's ever been down there but me, once, and that's when it wasn't called the madhouse.
      Ranata entrusted this key to me just in case he were to go insane like his experiments, now I hope you'll do what I couldn't all these years.`;
    });

  npc.parser.addCommand('password')
    .set('syntax', '<string:password*>')
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      const password = (values(args)[0] || '').trim();

      const henizProgress = player.getQuestData(HenizFindSedgwick);
      const steffenProgress = player.getQuestData(SteffenFindSedgwick);

      if(steffenProgress && steffenProgress.keyword) {
        if(steffenProgress.keyword !== password) return 'Huh? What is that supposed to mean?';

        SteffenFindSedgwick.updateProgress(player, { foundSedgwick: true });
        return `So even Kranton wants to take care of my FRIEND? I'd heard rumblings from the Heniz, but it seems like they're united under this one threat...`;
      }

      if(henizProgress && henizProgress.keyword) {
        if(henizProgress.keyword !== password) return 'What nonsense are you spouting?';

        HenizFindSedgwick.updateProgress(player, { foundSedgwick: true });
        return `Ah, you\'ve spoken with Ergorat. That was a phrase we used to communicate secretly, back when we were, you know, on the same side.
        So, he wants RANATA taken care of?`;
      }

      return 'Huh? Yes, that is indeed a word...?';
    });

};
