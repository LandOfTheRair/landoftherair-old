
// 2388 - vertical cave wall
// 2399 - horizontal cave wall

import { invert } from 'lodash';

export const TrueSightMap = {
  62: 1076,
  63: 1075,

  78: 1087,
  79: 1086,

  111: 1100,
  112: 1101
};

export const TrueSightMapReversed = invert(TrueSightMap);
