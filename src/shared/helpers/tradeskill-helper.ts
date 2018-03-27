
export const VALID_TRADESKILLS = ['Alchemy', 'Spellforging', 'Metalworking'];
export const VALID_TRADESKILLS_HASH = {};

VALID_TRADESKILLS.forEach(skill => {
  VALID_TRADESKILLS_HASH[skill] = true;
  VALID_TRADESKILLS_HASH[skill.toLowerCase()] = true;
});
