import { Trait } from '../../shared/models/trait';

require('dotenv').config({ silent: true });

import * as fs from 'fs';

import { cloneDeep, last, includes } from 'lodash';

import { AllTraits } from '../../shared/traits/trait-hash';
import * as AllSkills from '../scripts/commands/skills/spells';

import { AllTrees as MageLayout } from './skilltree-layouts/Mage';
import { AllTrees as HealerLayout } from './skilltree-layouts/Healer';
import { AllTrees as ThiefLayout } from './skilltree-layouts/Thief';
import { AllTrees as WarriorLayout } from './skilltree-layouts/Warrior';

const Layouts = {
  Mage: MageLayout,
  Healer: HealerLayout,
  Thief: ThiefLayout,
  Warrior: WarriorLayout
};

export class SkillTreeCreator {
  static organize() {

    Object.keys(Layouts).forEach(baseClass => {
      const allTrees = cloneDeep(Layouts[baseClass]);
      const resultingLayout: any = {};

      // build base tre
      allTrees.forEach((tree, treeIndex) => {
        Object.keys(tree).forEach(traitOrSkillName => {

          const existingItem = tree[traitOrSkillName];
          if(existingItem.unbuyable) {
            existingItem.name = traitOrSkillName;
            existingItem.cluster = treeIndex + 1;
            resultingLayout[traitOrSkillName] = existingItem;
            return;
          }

          let entireName = traitOrSkillName;

          if(!isNaN(+last(traitOrSkillName.split('')))) {
            entireName = entireName.substring(0, entireName.length - 1);
          }

          const traitRef = AllTraits[baseClass][entireName] || AllTraits.Common[entireName];
          const skillRef = AllSkills[entireName];

          // is trait
          if(traitRef) {

            traitRef.upgrades.forEach((upgrade, index) => {

              const newName = entireName + index;

              const existingTraitItem = tree[newName];
              if(!existingTraitItem) throw new Error(`${newName} not found in (${baseClass}) trait tree!`);

              const newItem: any = {
                name: newName,
                traitName: entireName,
                desc: traitRef.description,
                icon: traitRef.icon,
                capstone: upgrade.capstone,
                requireCharacterLevel: upgrade.requireCharacterLevel,
                requireSkillLevel: upgrade.requireSkillLevel,
                cost: Trait.determineUpgradeCost(upgrade),
                unlocks: existingTraitItem.unlocks,
                cluster: treeIndex + 1
              };

              if(includes(entireName, 'Party')) newItem.isParty = true;

              resultingLayout[newName] = newItem;

            });

          } else if(skillRef) {

            const newItem = {
              name: traitOrSkillName,
              desc: skillRef.macroMetadata.tooltipDesc,
              icon: skillRef.macroMetadata.icon,
              iconColor: skillRef.macroMetadata.color,
              bgColor: skillRef.macroMetadata.bgColor,
              capstone: existingItem.capstone,
              requireCharacterLevel: skillRef.macroMetadata.requireCharacterLevel,
              requireSkillLevel: skillRef.macroMetadata.requireSkillLevel,
              cost: skillRef.macroMetadata.skillTPCost || 3,
              unlocks: existingItem.unlocks,
              cluster: treeIndex + 1
            };

            resultingLayout[traitOrSkillName] = newItem;

          } else {
            throw new Error(`Trait or skill ${traitOrSkillName} does not exist (${baseClass})!`);
          }

        });
      });

      // add linked-list style nodes
      Object.keys(resultingLayout).forEach(nodeName => {

        const node = resultingLayout[nodeName];

        if(!node.unlocks) return;

        node.unlocks.forEach(unlock => {
          const unlockedNode = resultingLayout[unlock];

          if(!unlockedNode) throw new Error(`Node ${unlock} (${baseClass}) does not exist!`);

          if(!unlockedNode.unlockedBy) unlockedNode.unlockedBy = [];

          unlockedNode.unlockedBy.push(nodeName);
        });
      });

      fs.writeFileSync(`${__dirname}/../../shared/generated/skilltrees/${baseClass}.json`, JSON.stringify(resultingLayout, null, 4));
    });

  }
}

SkillTreeCreator.organize();
