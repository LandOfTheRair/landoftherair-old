
import { exec } from 'child_process';
import * as fs from 'fs-extra';

import * as AllSkills from '../scripts/commands/skills/spells';
import { AllTraits } from '../../shared/traits/trait-hash';

import { sortBy, startCase } from 'lodash';
import { EWOULDBLOCK } from 'constants';

let markdown = ``;

const addMarkdown = line => markdown = `${markdown}\n${line}`;

addMarkdown('# Skills');
addMarkdown('Skill Name | Description');
addMarkdown('---------- | -----------');

sortBy(Object.keys(AllSkills)).forEach(skillName => {
  const { name, tooltipDesc } = AllSkills[skillName].macroMetadata;

  addMarkdown(`${startCase(name)} | ${tooltipDesc}`);
});

addMarkdown('# Traits');
addMarkdown('Trait Name | Trait Class | Description');
addMarkdown('---------- | ----------- | -----------');

sortBy(Object.keys(AllTraits)).forEach(className => {
  sortBy(Object.keys(AllTraits[className])).forEach(trait => {
    const { traitName, baseClass, description } = AllTraits[className][trait];

    const realDesc = description.split('|').join('/').split('$').join('*')
    addMarkdown(`${startCase(traitName)} | ${baseClass || '-'} | ${realDesc}`);
  });
});

exec(`git clone git@github.com:landoftherair/landoftherair.wiki.git wiki`, () => {

  fs.writeFileSync(`${__dirname}/../../../wiki/Traits-And-Skills.md`, markdown, 'utf-8');

  exec('npm run changelog', () => {
    exec(`cd ${__dirname}/../../../wiki && git add . && git commit -am "Updated wikidocs." && git push`, () => {
      fs.removeSync(`${__dirname}/../../../wiki`);
    });
  });

});
