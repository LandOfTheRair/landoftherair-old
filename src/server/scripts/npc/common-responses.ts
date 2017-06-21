
import { NPC } from '../../../models/npc';
import { includes, capitalize } from 'lodash';
import { Logger } from '../../logger';

export const RecallerResponses = (npc: NPC) => {
  npc.parser.addCommand('recall')
    .set('syntax', ['recall'])
    .set('logic', (args, { client, player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      player.respawnPoint = { map: npc.$room.state.mapName, x: npc.x, y: npc.y };
      return `I will recall you here when you die, ${player.name}. Safe travels.`;
    });
};

export const AlchemistResponses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { client, player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';
      return `Hello, ${player.name}! You can tell me COMBINE while holding a bottle in your right hand to mix together that with other bottles of the same type in your sack. I can combine up to ${npc.alchOz}oz into one bottle. It will cost ${npc.alchCost} gold per ounce to do this.`;
    });

  npc.parser.addCommand('combine')
    .set('syntax', ['combine'])
    .set('logic', (args, { client, player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      const item = player.rightHand;
      if(!item || item.itemClass !== 'Bottle') return 'You are not holding a bottle.';
      if(item.ounces >= npc.alchOz) return 'That bottle is already too full for me.';

      let itemsRemoved = 0;

      player.sack.forEach((checkItem, i) => {
        if(checkItem.name !== item.name) return;
        if(checkItem.ounces + item.ounces > npc.alchOz) return;

        const cost = checkItem.ounces * npc.alchCost;
        if(npc.alchCost > cost) return;

        player.loseGold(cost);
        player.takeItemFromSack(i);
        item.ounces += checkItem.ounces;
        itemsRemoved++;
      });

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
    .set('logic', (args, { client, player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';
      player.addBankMoney(npc.bankId, 0);
      npc.$room.showBankWindow(client, npc);
      return `Greetings ${player.name}! Welcome to the ${npc.bankId} National Bank, ${npc.branchId} branch. You can WITHDRAW or DEPOSIT your coins here!`;
    });

  npc.parser.addCommand('deposit')
    .set('syntax', ['deposit <string:amount>'])
    .set('logic', (args, { client, player }) => {
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
    .set('logic', (args, { client, player }) => {
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
    .set('logic', (args, { client, player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';
      npc.$room.showShopWindow(client, npc);
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

export const BaseClassTrainerResponses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player, client }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      npc.$room.showTrainerWindow(client, npc);
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
      if(level > npc.maxLevelUpLevel) return 'You are too advanced for my teachings.';

      player.tryLevelUp(npc.maxLevelUpLevel);
      const newLevel = player.level;

      if(newLevel === level) return 'You are not experienced enough to train with me.';

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
};
