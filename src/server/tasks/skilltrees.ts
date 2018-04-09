
require('dotenv').config({ silent: true });

import * as fs from 'fs';

import { cloneDeep, last } from 'lodash';

import { AllTraits } from '../../shared/traits/trait-hash';
import * as AllSkills from '../scripts/commands/skills/spells';

import { AllTrees as MageLayout } from './skilltree-layouts/Mage';

const Layouts = {
  Mage: MageLayout
};

export class SkillTreeCreator {
  static organize() {

    Object.keys(Layouts).forEach(baseClass => {
      const allTrees = cloneDeep(Layouts[baseClass]);
      const resultingLayout: any = {};

      allTrees.forEach(tree => {
        Object.keys(tree).forEach(traitOrSkillName => {

          const existingItem = tree[traitOrSkillName];
          if(existingItem.unbuyable) {
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
              if(!existingTraitItem) throw new Error(`${newName} not found in trait tree!`);

              const newItem = {
                name: newName,
                desc: traitRef.description,
                icon: traitRef.icon,
                capstone: upgrade.capstone,
                unlocks: existingTraitItem.unlocks
              };

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
              unlocks: existingItem.unlocks
            };

            resultingLayout[traitOrSkillName] = newItem;

          } else {
            throw new Error(`Trait or skill ${traitOrSkillName} does not exist!`);
          }

        });
      });

      fs.writeFileSync(`${__dirname}/../../shared/generated/skilltrees/${baseClass}.json`, JSON.stringify(resultingLayout, null, 4));
    });

  }
}

SkillTreeCreator.organize();
