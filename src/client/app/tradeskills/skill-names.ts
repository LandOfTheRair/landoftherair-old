
const skills = {
  alchemy: [
    'Unpracticed',
    'Dropper of Flasks',
    'Novice of Alchemy',
    'Practicer of Alchemy',
    'Student of Alchemy',
    'Skilled Alchemist',
    'Proficient Alchemist',
    'Astute Alchemist',
    'Adept Alchemist',
    '1st Prodigious Alchemist',
    '2nd Prodigious Alchemist',
    '3rd Prodigious Alchemist',
    '4th Prodigious Alchemist',
    '1st Master Alchemist',
    '2nd Master Alchemist',
    '3rd Master Alchemist',
    '4th Master Alchemist',
    '1st Renowned Alchemist',
    '2nd Renowned Alchemist',
    '3rd Renowned Alchemist',
    '4th Renowned Alchemist',
    'Legendary Alchemist'
  ],
  spellforging: [
    'Unpracticed',
    'Breaker of Magic',
    'Novice Disenchanter',
    'Learned Disenchanter',
    'Skilled Disenchanter',
    'Master Disenchanter',
    'Novice Runic',
    'Learned Runic',
    'Skilled Runic',
    'Master Runic',
    'Novice Enchanter',
    'Skilled Enchanter',
    'Proficient Enchanter',
    'Astute Enchanter',
    'Adept Enchanter',
    '1st Prodigious Enchanter',
    '2nd Prodigious Enchanter',
    '3rd Prodigious Enchanter',
    '4th Prodigious Enchanter',
    '1st Master Enchanter',
    '2nd Master Enchanter',
    '3rd Master Enchanter',
    '4th Master Enchanter',
    '1st Renowned Enchanter',
    '2nd Renowned Enchanter',
    '3rd Renowned Enchanter',
    '4th Renowned Enchanter',
    'Legendary Enchanter'
  ]
};

export class SkillNames {
  static determineArray(skill) {
    return skills[skill];
  }

  static getName(level, skill) {
    const arr = this.determineArray(skill);
    if(level < 0) level = 0;
    if(level >= arr.length) return arr[arr.length - 1];
    return arr[level];
  }
}
