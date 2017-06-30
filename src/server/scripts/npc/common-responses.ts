
import { NPC } from '../../../models/npc';
import { includes, capitalize, sample, get } from 'lodash';
import { Logger } from '../../logger';
import { AllNormalGearSlots } from '../../../models/character';
import { Item } from '../../../models/item';
import { NPCLoader } from '../../helpers/npc-loader';

export const TannerResponses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      return `Greetings, ${player.name}, and welcome to my Tannery. Bring me your kills, and I will TAN them for you!`;
    });

  npc.parser.addCommand('tan')
    .set('syntax', ['tan'])
    .set('logic', (args, { player }) => {

      const ground = npc.$$room.state.getGroundItems(npc.x, npc.y);
      if(!ground.Corpse || !ground.Corpse.length) return 'There are no corpses here!';

      ground.Corpse.forEach(corpse => {
        const corpseNPC = npc.$$room.state.findNPC(corpse.npcUUID);
        corpseNPC.restore();
        if(!corpseNPC.tansFor) return;

        NPCLoader.loadItem(corpseNPC.tansFor)
          .then(item => {
            item.setOwner(player);
            npc.$$room.addItemToGround(npc, item);
          });
      });

      return `Here you go, ${player.name}!`;
    });
};

export const PeddlerResponses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(player.rightHand) return 'Please empty your right hand!';

      if(player.gold < npc.peddleCost) return `I can't offer this for free. You need ${npc.peddleCost.toLocaleString()} gold for a ${npc.peddleItem}.`;

      player.loseGold(npc.peddleCost);

      const item = new Item(npc.rightHand);
      item.regenerateUUID();

      player.setRightHand(item);

      return `Thank you, ${player.name}!`;
    });
};

export const SmithResponses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(player.rightHand) {
        const myCondition = npc.repairsUpToCondition || 20000;
        const cpt = npc.costPerThousand || 1;

        const missingCondition = myCondition - player.rightHand.condition;
        if(missingCondition < 0) return 'That item is already beyond my capabilities!';

        const cost = Math.floor(missingCondition / 1000 * cpt);

        if(cost === 0) return 'That item is not in need of repair!';
        if(player.gold < cost) return `You need ${cost.toLocaleString()} gold to repair that item.`;

        player.loseGold(cost);
        player.rightHand.condition = myCondition;
        return `Thank you, ${player.name}! I've repaired your item for ${cost.toLocaleString()} gold.`;
      }

      return `Hello, ${player.name}! I am a Smith. I can repair your weapons and armor - just hold them in your right hand! Or, you can tell me REPAIRALL and I will repair what you're holding and what you're wearing.`;
    });

  npc.parser.addCommand('repairall')
    .set('syntax', ['repairall'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      const myCondition = npc.repairsUpToCondition || 20000;
      const cpt = npc.costPerThousand || 1;

      let totalCosts = 0;

      AllNormalGearSlots.forEach(slot => {
        const item = get(player, slot);
        if(!item || item.condition > myCondition) return;

        const cost = Math.floor((myCondition - item.condition) / 1000 * cpt);
        if(cost === 0 || cost > player.gold) return;

        totalCosts += cost;

        player.loseGold(cost);
        item.condition = myCondition;
      });

      return `Thank you, ${player.name}! I've done what I can. You've spent ${totalCosts.toLocaleString()} gold.`;
    });

};

export const RandomlyShouts = (npc: NPC, responses: string[] = []) => {
  let ticks = 0;

  npc.ai = { tick: () => {
    ticks++;

    if(ticks >= 5) {
      ticks = 0;

      const msgObject = { name: npc.name, message: sample(responses) };
      npc.sendClientMessageToRadius(msgObject, 4);
    }
  }};
};

export const CrierResponses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      return `Hello, ${player.name}! I am the Crier, and my voice is the voice of the people!`;
    });
};

export const RecallerResponses = (npc: NPC) => {
  npc.parser.addCommand('recall')
    .set('syntax', ['recall'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      player.respawnPoint = { map: npc.$$room.state.mapName, x: npc.x, y: npc.y };
      return `I will recall you here when you die, ${player.name}. Safe travels.`;
    });
};

export const AlchemistResponses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';
      return `Hello, ${player.name}! You can tell me COMBINE while holding a bottle in your right hand to mix together that with other bottles of the same type in your sack. I can combine up to ${npc.alchOz}oz into one bottle. It will cost ${npc.alchCost} gold per ounce to do this.`;
    });

  npc.parser.addCommand('combine')
    .set('syntax', ['combine'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      const item = player.rightHand;
      if(!item || item.itemClass !== 'Bottle') return 'You are not holding a bottle.';
      if(item.ounces >= npc.alchOz) return 'That bottle is already too full for me.';

      let itemsRemoved = 0;

      const indexes = [];

      player.sack.items.forEach((checkItem, i) => {
        if(checkItem.name !== item.name) return;
        if(checkItem.ounces + item.ounces > npc.alchOz) return;

        const cost = checkItem.ounces * npc.alchCost;
        if(npc.alchCost > cost) return;

        player.loseGold(cost);
        indexes.push(i);
        item.ounces += checkItem.ounces;
        itemsRemoved++;
      });

      NPCLoader.takeItemsFromPlayerSack(player, indexes);

      if(itemsRemoved === 0) return 'I was not able to combine any bottles.';

      return `I've taken ${itemsRemoved} bottles from your sack and combined them with the item in your hand. Enjoy!`;
    });
};

export const BankResponses = (npc: NPC) => {
  if(!npc.bankId || !npc.branchId) {
    Logger.error(new Error(`Banker at ${npc.x}, ${npc.y} - ${npc.map} does not have a valid bank/branch id`));
    return;
  }

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';
      player.addBankMoney(npc.bankId, 0);
      npc.$$room.showBankWindow(player, npc);
      return `Greetings ${player.name}! Welcome to the ${npc.bankId} National Bank, ${npc.branchId} branch. You can WITHDRAW or DEPOSIT your coins here!`;
    });

  npc.parser.addCommand('deposit')
    .set('syntax', ['deposit <string:amount>'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      const amount = +args.amount;
      const region = npc.bankId;
      const res = player.addBankMoney(region, amount);
      if(res === false) return 'That amount of gold is not valid.';
      if(res === 0) return 'What, do you think you\'re funny? Get out of line, there are other people to service!';
      return `Thank you, you have deposited ${res.toLocaleString()} gold into the ${region} National Bank. Your new balance is ${player.banks[region].toLocaleString()} gold.`;
    });

  npc.parser.addCommand('withdraw')
    .set('syntax', ['withdraw <string:amount>'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      const amount = +args.amount;
      const region = npc.bankId;
      const res = player.loseBankMoney(region, amount);
      if(res === false) return 'That amount of gold is not valid.';
      if(res === 0) return 'Hey, do I look like a charity to you? Get lost!';
      return `Thank you, you have withdrawn ${res.toLocaleString()} gold into the ${region} National Bank. Your new balance is ${player.banks[region].toLocaleString()} gold.`;
    });
};

export const VendorResponses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';
      npc.$$room.showShopWindow(player, npc);
      return `Greetings ${player.name}! Please view my wares.`;
    });

  npc.parser.addCommand('appraise')
    .set('syntax', ['appraise'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(!player.rightHand) return 'I cannot give you as value for your hand.';

      const value = player.rightHand.value;
      if(value === 0) return 'That item is worthless.';

      return `That item is worth about ${value.toLocaleString()} coins, but I'd only buy it for ${player.sellValue(player.rightHand).toLocaleString()} coins.`;
    });
};

export const BaseClassTrainerResponses = (npc: NPC, skills?: any) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      npc.$$room.showTrainerWindow(player, npc);
      return `Hail, ${player.name}! If you want to try to level up, TRAIN with me. Alternatively, I can let you know how your combat skills are progressing if you want to ASSESS them! You can also JOIN the ${npc.classTrain} profession if you haven't chosen one already!`;
    });

  npc.parser.addCommand('assess')
    .set('syntax', ['assess <string:skill*>'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      const skill = args['skill*'].toLowerCase();

      if(!includes(npc.trainSkills, capitalize(skill))) return 'I cannot teach you anything about this.';

      const skillValue = player.skills[skill] || 0;
      const skillLevel = player.calcSkillLevel(skill);

      const maxAssessSkill = npc.maxSkillTrain;

      const assessCost = maxAssessSkill * 50;
      if(player.gold < assessCost) return `I require ${assessCost} gold for my assessment.`;

      player.loseGold(assessCost);

      if(skillLevel >= maxAssessSkill) return 'You are too advanced for my teachings.';

      const nextLevel = skillLevel === 0 ? 100 : player.calcSkillXP(skillLevel + 1);
      const prevLevel = skillLevel === 0 ? 0 : player.calcSkillXP(skillLevel);

      const normalizedCurrent = skillValue - prevLevel;
      const normalizedMax = nextLevel - prevLevel;

      const percentWay = Math.max(0, (normalizedCurrent/normalizedMax * 100)).toFixed(3);

      return `You are ${percentWay}% on your way towards the next level of ${skill.toUpperCase()} proficiency.`;
    });

  npc.parser.addCommand('train')
    .set('syntax', ['train'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      if(player.baseClass !== npc.classTrain) return 'I have nothing to teach you.';

      const level = player.level;

      const trainCost = npc.maxLevelUpLevel * 200;
      if(player.gold < trainCost) return `I require ${trainCost} gold for my training.`;

      if(level > npc.maxLevelUpLevel) return 'You are too advanced for my teachings.';

      player.tryLevelUp(npc.maxLevelUpLevel);
      const newLevel = player.level;

      if(newLevel === level) return 'You are not experienced enough to train with me.';

      player.loseGold(trainCost);

      return `You have gained ${newLevel-level} experience levels.`;
    });

  npc.parser.addCommand('join')
    .set('syntax', ['join'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      if(player.baseClass !== 'Undecided') return 'You have already joined a profession.';

      player.changeBaseClass(npc.classTrain);

      return `Welcome to the ${npc.classTrain} profession, ${player.name}!`;
    });

  npc.parser.addCommand('learn')
    .set('syntax', ['learn'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      if(player.baseClass !== npc.classTrain) return 'I have nothing to teach you.';

      const learnCost = npc.maxSkillTrain * 100;
      if(player.gold < learnCost) return `I require ${learnCost} gold for my teaching.`;

      const learnedSkills = [];

      Object.keys(skills).forEach(skillName => {
        Object.keys(skills[skillName]).forEach(spellLevel => {
          if(player.calcSkillLevel(skillName) < +spellLevel) return;
          skills[skillName][spellLevel].forEach(spellName => {
            if(!player.learnSpell(spellName)) return;
            learnedSkills.push(spellName);
          });
        });
      });

      if(learnedSkills.length === 0) return 'I cannot currently teach you anything new.';

      player.loseGold(learnCost);

      return `You have learned the abilities: ${learnedSkills.join(', ')}.`;
    });
};
