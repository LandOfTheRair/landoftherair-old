
import { NPC } from '../../../shared/models/npc';
import { includes, capitalize, sample, get, random } from 'lodash';
import { Logger } from '../../logger';
import { AllNormalGearSlots } from '../../../shared/models/character';
import { Item } from '../../../shared/models/item';
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

      let errMessage = '';

      ground.Corpse.forEach(corpse => {
        if(corpse.$$isPlayerCorpse) return;

        if(!includes(corpse.$$playersHeardDeath, player.username)) {
          errMessage = 'You didn\'t have a hand in killing that!';
          return;
        }

        const corpseNPC = npc.$$room.state.findNPC(corpse.npcUUID);
        if(corpseNPC) corpseNPC.restore();
        else          npc.$$room.removeItemFromGround(corpse);

        if(!corpse.tansFor) return;

        NPCLoader.loadItem(corpse.tansFor)
          .then(item => {
            item.setOwner(player);
            npc.$$room.addItemToGround(npc, item);
          });
      });

      if(errMessage) return errMessage;

      return `Here you go, ${player.name}!`;
    });
};

export const PeddlerResponses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(!npc.peddleItem || !npc.peddleCost) {
        Logger.error(new Error(`Peddler at ${npc.x}, ${npc.y} - ${npc.map} does not have a valid peddleItem/peddleCost`));
        return;
      }

      if(npc.distFrom(player) > 2) return 'Please move closer.';

      return `Hello, ${player.name}! I can sell you a fancy ${npc.peddleItem} for ${npc.peddleCost.toLocaleString()} gold. Just tell me you want to BUY it!`;
    });

  npc.parser.addCommand('buy')
    .set('syntax', ['buy'])
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
      if(!npc.costPerThousand || !npc.repairsUpToCondition) {
        Logger.error(new Error(`Smith at ${npc.x}, ${npc.y} - ${npc.map} does not have a valid costPerThousand/repairsUpToCondition`));
        return;
      }

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

      return `Hello, ${player.name}! 
      I am a Smith. I can repair your weapons and armor - just hold them in your right hand! 
      Or, you can tell me REPAIRALL and I will repair what you're holding and what you're wearing.`;
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

      if(totalCosts === 0) {
        return `You are not wearing any items in need of repair.`;
      }

      return `Thank you, ${player.name}! I've done what I can. You've spent ${totalCosts.toLocaleString()} gold.`;
    });

};

export const RandomlyShouts = (npc: NPC, responses: string[] = []) => {
  let ticks = 0;
  let nextTick = random(5, 10);

  npc.$$ai.tick.add(() => {
    ticks++;

    if(ticks >= nextTick) {
      nextTick = random(5, 10);
      ticks = 0;

      let response = sample(responses);

      if(responses.length > 1 && response === npc.$$lastResponse) {
        do {
          response = sample(responses);
        } while(response === npc.$$lastResponse);
      }

      npc.$$lastResponse = response;

      const msgObject = { name: npc.name, message: response, subClass: 'chatter' };
      npc.sendClientMessageToRadius(msgObject, 8);
    }
  });
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
      if(!npc.alchCost || !npc.alchOz) {
        Logger.error(new Error(`Alchemist at ${npc.x}, ${npc.y} - ${npc.map} does not have a valid alchCost/alchOz!`));
        return;
      }

      if(npc.distFrom(player) > 2) return 'Please move closer.';
      return `Hello, ${player.name}! 
      You can tell me COMBINE while holding a bottle in your right hand to 
      mix together that with other bottles of the same type in your sack. 
      I can combine up to ${npc.alchOz}oz into one bottle. It will cost ${npc.alchCost} gold per ounce to do this.`;
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

export const VendorResponses = (npc: NPC, { classRestriction = '' } = {}) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.vendorItems.length === 0) {
        Logger.error(new Error(`Vendor at ${npc.x}, ${npc.y} - ${npc.map} does not have any vendorItems!`));
        return;
      }

      if(classRestriction && player.baseClass !== classRestriction) {
        return 'I have nothing to say to you.';
      }

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

  npc.parser.addCommand('sell')
    .set('syntax', ['sell <string:itemtype*>'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';
      const itemtype = args['itemtype*'].toLowerCase();

      // sell all items matching item type (player.sellItem)

      let sellValue = 0;

      const allItems = player.sack.allItems.filter((item, i) => {
        if(item.itemClass.toLowerCase() !== itemtype) return false;

        const itemValue = player.sellValue(item);
        if(itemValue <= 0) return false;

        sellValue += itemValue;

        return true;
      });

      if(allItems.length === 0) return 'You are not carrying any items of that type!';

      allItems.forEach(item => {
        player.sack.takeItem(item);
      });

      return `You sold me ${allItems.length} items for a grand total of ${sellValue.toLocaleString()} gold. Thank you!`;
    });

};

export const EncrusterResponses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Hail, ${player.name}! I am the Encruster, and I can put magical gems into your weapons and armor. 
      You can only set one gem at a time, and subsequent encrusts will replace the old gem.
      It will cost a fair price - the value of the gem, some insurance for the item, and then a little bit for me.
      If you would like to do this, hold the item in your right hand, the gem in your left, and tell me ENCRUST.
      Beware - encrusting an item will bind it to you!`;
    });

  npc.parser.addCommand('encrust')
    .set('syntax', ['encrust'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(!player.rightHand) return 'You must hold an item in your right hand!';
      if(player.rightHand.itemClass === 'Corpse') return 'That would be disrespectful.';
      if(!player.leftHand || player.leftHand.itemClass !== 'Gem') return 'You must hold a gem in your left hand!';

      const cost = player.leftHand.value + player.rightHand.value + 500;

      if(player.gold < cost) return `I require ${cost.toLocaleString()} gold for this transaction.`;

      const prevEncrust = player.rightHand.encrust;

      const nextEncrust = {
        desc: player.leftHand.desc,
        stats: player.leftHand.stats,
        sprite: player.leftHand.sprite
      };

      player.loseGold(cost);
      player.setLeftHand(null);
      player.rightHand.setOwner(player);

      player.rightHand.encrust = nextEncrust;
      const replaceText = prevEncrust ? ` This has replaced your ${prevEncrust.desc}.` : '';
      player.recalculateStats();

      return `I have set your ${player.rightHand.itemClass} with ${nextEncrust.desc}.${replaceText}`;
    });
};

export const BaseClassTrainerResponses = (npc: NPC, skills?: any) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(!npc.maxSkillTrain || !npc.trainSkills || !npc.classTrain || !npc.maxLevelUpLevel) {
        Logger.error(new Error(`Trainer at ${npc.x}, ${npc.y} - ${npc.map} does not have a valid maxSkillTrain/trainSkills/classTrain/maxLevelUpLevel`));
        return;
      }

      if(npc.distFrom(player) > 0) return 'Please move closer.';
      npc.$$room.showTrainerWindow(player, npc);
      return `Hail, ${player.name}! 
      If you want to try to level up, TRAIN with me. 
      Alternatively, I can let you know how your combat skills are progressing if you want to ASSESS them! 
      You can also JOIN the ${npc.classTrain} profession if you haven't chosen one already!`;
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
      if(player.gold < assessCost) return `I require ${assessCost.toLocaleString()} gold for my assessment.`;

      player.loseGold(assessCost);

      if(skillLevel >= maxAssessSkill) return 'You are too advanced for my teachings.';

      const nextLevel = skillLevel === 0 ? 100 : player.calcSkillXP(skillLevel);
      const prevLevel = skillLevel === 0 ? 0 : player.calcSkillXP(skillLevel - 1);

      const normalizedCurrent = skillValue - prevLevel;
      const normalizedMax = nextLevel - prevLevel;

      const percentWay = Math.max(0, (normalizedCurrent / normalizedMax * 100)).toFixed(3);
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

      if(level >= npc.maxLevelUpLevel) return 'You are too advanced for my teachings.';

      player.tryLevelUp(npc.maxLevelUpLevel);
      const newLevel = player.level;

      if(newLevel === level) return 'You are not experienced enough to train with me.';

      player.loseGold(trainCost);

      return `You have gained ${newLevel - level} experience levels.`;
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

      if(!skills) return 'I have no skills to teach you.';

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
