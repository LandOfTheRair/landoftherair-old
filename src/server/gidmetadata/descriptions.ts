
import { range } from 'lodash';

export const GetGidDescription = (gid) => {
  if(gid === 0) return '';

  // terrain
  if(gid <= 960) return DESCS[Math.floor((gid - 1) / 48)];

  // decor
  if(gid > 1313) {
    return DecorGids[gid - 1313];
  }

  // whatever
  return '';
};

const WEAPON_RACK_DESC = 'You are standing near a rack of weapons. They look very pointy.';
const ARMOR_STATUE_DESC = 'You are standing near a suit of armor.';
const LOCKER_DESC = 'You are standing near a wardrobe. Every time you touch it, it feels warm and strangely familiar.';

const DecorGids = {
  204: WEAPON_RACK_DESC,
  205: WEAPON_RACK_DESC,
  206: WEAPON_RACK_DESC,
  207: WEAPON_RACK_DESC,

  208: ARMOR_STATUE_DESC,
  209: ARMOR_STATUE_DESC,
  210: ARMOR_STATUE_DESC,
  211: ARMOR_STATUE_DESC,

  216: LOCKER_DESC,
  217: LOCKER_DESC,
  218: LOCKER_DESC,
  219: LOCKER_DESC,
};

const DESCS = [
  'You are standing on darkened cobblestone.',
  'You are standing in sand.',
  'You are standing on finely-polished tile.',
  'You are standing on a finished wooden floor.',
  'You are standing in fire.',
  'You are standing in a thick, black ooze. Eww.',
  'You are standing in a thin mist.',
  'You are standing on a pile of treasure.',
  'You are swimming in water.',
  'You are swimming in lava.',
  'You are standing in a thick, acrid mist. It is hard to breathe.',
  'You are standing on a pile of unidentifiable bones.',
  'You are standing on grass.',
  'You are standing near a hole.',
  'You are standing on cobblestone.',
  'You are standing in snow.',
  'You are swimming in deep water.',
  'You are standing in flowery grass.',
  'You are standing knee-deep in weeds and bog flowers',
  'You are standing on dirt.'
];
