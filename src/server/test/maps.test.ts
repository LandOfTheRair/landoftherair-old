
import test from 'ava-ts';

import * as recurse from 'recursive-readdir';
import * as fs from 'fs';
import * as path from 'path';

import { includes, find, isNumber } from 'lodash';

import { MapLayer } from '../../shared/models/maplayer';

let allMaps = [];
const allMapNames = {};

const tagFor = (map: any, key: string, key2?: string): string => {
  return `${map._name}:${key}${key2 ? ':' + key2 : ''}`;
};

const isInBounds = (mapName: string, x: number, y: number): boolean => {
  if(!allMapNames[mapName]) return false;
  const { width, height } = allMapNames[mapName];
  return x > 4 && y > 4 && x < width - 4 && y < height - 4;
};

test.before(async () => {
  return new Promise(resolve => {
    recurse(`${__dirname}/../../content/maps`).then(files => {
      allMaps = files.map(x => {
        const map = require(x);
        map._name = path.basename(x, path.extname(x));
        allMapNames[map._name] = map;
        return map;
      });
      resolve(allMaps);
    });
  });
});

// map tests
test('All maps have valid script references', t => {
  allMaps.forEach(map => {
    if(!map.properties.script) return;

    t.true(fs.existsSync(`${__dirname}/../scripts/dungeons/${map.properties.script}.ts`), tagFor(map, 'mapscript'));
  });
});

test('All maps have the correct number of tilesets in the correct order', t => {
  allMaps.forEach(map => {
    const tilesets = map.tilesets;

    t.is(tilesets[0].name, 'Terrain');
    t.is(tilesets[1].name, 'Walls');
    t.is(tilesets[2].name, 'Decor');
    t.is(tilesets[3].name, 'Creatures');
  });
});

test('All maps have a respawn point', t => {
  allMaps.forEach(map => {

    const { respawnMap, respawnX, respawnY } = map.properties;

    if(respawnMap) {
      t.truthy(allMapNames[respawnMap], tagFor(map, 'respawnmap'));
    }
    t.truthy(isNumber(respawnX), tagFor(map, 'respawnx'));
    t.truthy(isNumber(respawnY), tagFor(map, 'respawny'));
    t.true(isInBounds(respawnMap || map._name, respawnX, respawnY), tagFor(map, 'respawnbounds'));
  });
});

test('All maps have a region', t => {
  allMaps.forEach(map => {
    t.truthy(map.properties.region, tagFor(map, 'mapregion'));
  });
});

// bgm layer tests
test('All map bgms are valid', t => {
  allMaps.forEach(map => {
    const bgmObjects = map.layers[MapLayer.BackgroundMusic].objects;
    bgmObjects.forEach(bgm => {
      t.true(includes(['town', 'combat', 'wilderness', 'dungeon'], bgm.name), tagFor(map, 'bgm', bgm.x + ',' + bgm.y));
    });
  });
});

// bgm layer tests
test('All map desc squares are valid', t => {
  allMaps.forEach(map => {
    const descObjects = map.layers[MapLayer.RegionDescriptions].objects;
    descObjects.forEach(desc => {
      t.truthy(desc.properties.desc, tagFor(map, 'desc', desc.name));
    });
  });
});

// spawner layer tests
test('All map spawners have a valid script and AI script', t => {
  allMaps.forEach(map => {
    const spawnerObjects = map.layers[MapLayer.Spawners].objects;
    spawnerObjects.forEach(spawner => {

      if(!spawner.properties) {
        t.fail(`Interactable (${map._name}) ${JSON.stringify(spawner)} has no properties!`);
        return;
      }

      t.true(fs.existsSync(`${__dirname}/../scripts/spawners/${spawner.properties.script}.ts`),
        tagFor(map, 'spawnerscript', spawner.properties.script || `unspecified @ ${spawner.x / 64}, ${spawner.y / 64}`));

      if(spawner.properties.npcAISettings) {
        t.true(fs.existsSync(`${__dirname}/../scripts/ai/${spawner.properties.npcAISettings}.ts`),
          tagFor(map, 'npcAISettings', spawner.properties.npcAISettings || `unspecified @ ${spawner.x / 64}, ${spawner.y / 64}`));
      }
    });
  });
});

// npc layer tests
test('All NPCs have valid properties', t => {
  allMaps.forEach(map => {
    const npcObjects = map.layers[MapLayer.NPCs].objects;
    npcObjects.forEach(npc => {
      t.true(fs.existsSync(`${__dirname}/../scripts/npc/${npc.properties.script}.ts`),
        tagFor(map, 'npcscript', npc.properties.script || `unspecified @ ${npc.x / 64}, ${npc.y / 64}`));

      switch(npc.properties.script) {
        case 'global/smith': {
          t.truthy(npc.properties.costPerThousand, tagFor(map, 'costPerThousand'));
          t.truthy(npc.properties.repairsUpToCondition, tagFor(map, 'repairsUpToCondition'));
          break;
        }
        case 'global/alchemist': {
          t.truthy(npc.properties.alchOz, tagFor(map, 'alchOz'));
          t.truthy(npc.properties.alchCost, tagFor(map, 'alchCost'));
          break;
        }
        case 'global/banker': {
          t.truthy(npc.properties.bankId, tagFor(map, 'bankId'));
          t.truthy(npc.properties.branchId, tagFor(map, 'branchId'));
          break;
        }
        case 'global/peddler': {
          t.truthy(npc.properties.peddleCost, tagFor(map, 'peddleCost'));
          t.truthy(npc.properties.peddleItem, tagFor(map, 'peddleItem'));
          break;
        }
        case 'global/hpdoc': {
          t.truthy(npc.properties.hpTier, tagFor(map, 'hpTier'));
          break;
        }
        case 'trainer/healer':
        case 'trainer/thief':
        case 'trainer/warrior':
        case 'trainer/mage': {
          t.truthy(npc.properties.maxLevelUpLevel, tagFor(map, 'maxLevelUpLevel'));
          t.truthy(npc.properties.maxSkillTrain, tagFor(map, 'maxSkillTrain'));
          break;
        }
      }
    });
  });
});

// interactables layer tests
test('All Interactables have valid properties', t => {
  allMaps.forEach(map => {
    const intObjects = map.layers[MapLayer.Interactables].objects;
    intObjects.forEach(interactable => {

      if(!interactable.type) {
        t.fail(`Interactable (${map._name}) ${JSON.stringify(interactable)} has no type!`);
        return;
      }

      if(interactable.type === 'Locker') {
        t.truthy(interactable.name, tagFor(map, 'name'));
        t.truthy(interactable.properties.lockerId, tagFor(map, 'lockerId'));
      }

      if(includes(['StairsUp', 'StairsDown', 'ClimbUp', 'ClimbDown', 'Teleport', 'Fall'], interactable.type)) {
        const { teleportMap, teleportX, teleportY } = interactable.properties;
        t.truthy(teleportMap, tagFor(map, 'teleportmap'));
        t.truthy(teleportX, tagFor(map, 'teleportx'));
        t.truthy(teleportY, tagFor(map, 'teleporty'));
        t.true(isInBounds(teleportMap, teleportX, teleportY), tagFor(map, 'teleportbounds'));
      }

      if(interactable.type === 'Door') {
        if(!interactable.properties) return;

        const { requireLockpick, skillRequired } = interactable.properties;

        if(requireLockpick) {
          t.truthy(skillRequired, tagFor(map, 'skillrequired'));
        }
      }

    });
  });
});

test('All 2-way Teleports are bi-directional', t => {
  allMaps.forEach(map => {
    const intObjects = map.layers[MapLayer.Interactables].objects;
    intObjects.forEach(interactable => {
      if(!includes(['StairsUp', 'StairsDown', 'ClimbUp', 'ClimbDown', 'Teleport', 'Fall'], interactable.type)) return;

      const myX = interactable.x / 64;
      const myY = (interactable.y / 64) - 1;
      const { teleportX, teleportY, teleportMap } = interactable.properties;
      const checkObjs = allMapNames[teleportMap].layers[MapLayer.Interactables].objects;

      const checkRef = find(checkObjs, { x: teleportX * 64, y: (teleportY + 1) * 64 });

      // one-way teleport
      if(!checkRef && (interactable.type === 'Teleport' || interactable.type === 'Fall')) return;

      if(!checkRef) {
        t.fail(`Interactable (${map._name}) @ ${myX}, ${myY} has an invalid teleport destination!`);
        return;
      }

      // not a valid return point
      if(!includes(['StairsUp', 'StairsDown', 'ClimbUp', 'ClimbDown', 'Teleport', 'Fall'], checkRef.type)) return;

      const checkX = checkRef.x / 64;
      const checkY = (checkRef.y / 64) - 1;

      const checkTPX = checkRef.properties.teleportX;
      const checkTPY = checkRef.properties.teleportY;

      const myTag = `source-${interactable.type}-${myX},${myY}-to-${checkRef.type}-${checkX},${checkY} (${interactable.name || 'no name'})`;
      const checkTag = `dest-${checkRef.type}-${checkX},${checkY}-from-${interactable.type}-${myX},${myY} (${checkRef.name || 'no name'})`;

      t.is(teleportX, checkX, tagFor(map, 'teleport-source-x', myTag));
      t.is(teleportY, checkY, tagFor(map, 'teleport-source-y', myTag));

      t.is(checkTPX, myX, tagFor(map, 'teleport-dest-x', checkTag));
      t.is(checkTPY, myY, tagFor(map, 'teleport-dest-y', checkTag));
    });
  });
});
