
import test from 'ava-ts';

import * as recurse from 'recursive-readdir';
import * as fs from 'fs';
import * as path from 'path';

import { includes } from 'lodash';

import { MapLayer } from '../../shared/models/maplayer';

let allMaps = [];
let allMapNames = {};

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
    recurse(`${__dirname}/../maps`).then(files => {
      allMaps = files.map(x => {
        const map = require(x);
        map._name = path.basename(x, path.extname(x));
        allMapNames[map._name] = map;
        return map;
      });
      resolve(allMaps);
    });
  })
});

// map tests
test('All maps have valid script references', t => {
  allMaps.forEach(map => {
    if(!map.properties.script) return;

    t.true(fs.existsSync(`${__dirname}/../scripts/rooms/${map.properties.script}.ts`), tagFor(map, 'mapscript'));
  });
});

test('All maps have a respawn point', t => {
  allMaps.forEach(map => {

    const { respawnMap, respawnX, respawnY } = map.properties;

    if(respawnMap) {
      t.truthy(allMapNames[respawnMap], tagFor(map, 'respawnmap'));
    }
    t.truthy(respawnX, tagFor(map, 'respawnx'));
    t.truthy(respawnY, tagFor(map, 'respawny'));
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
      t.true(fs.existsSync(`${__dirname}/../scripts/spawners/${spawner.properties.script}.ts`), tagFor(map, 'script', spawner.properties.script));

      if(spawner.properties.npcAISettings) {
        t.true(fs.existsSync(`${__dirname}/../scripts/ai/${spawner.properties.npcAISettings}.ts`), tagFor(map, 'npcAISettings', spawner.properties.npcAISettings));
      }
    });
  });
});

// npc layer tests
test('All NPCs have valid properties', t => {
  allMaps.forEach(map => {
    const npcObjects = map.layers[MapLayer.NPCs].objects;
    npcObjects.forEach(npc => {
      t.true(fs.existsSync(`${__dirname}/../scripts/npc/${npc.properties.script}.ts`), tagFor(map, 'script', npc.properties.script));

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

      if(includes(['StairsUp', 'StairsDown', 'ClimbUp', 'ClimbDown', 'Teleport'], interactable.type)) {
        const { teleportMap, teleportX, teleportY } = interactable.properties;
        t.truthy(teleportMap, tagFor(map, 'teleportmap'));
        t.truthy(teleportX, tagFor(map, 'teleportx'));
        t.truthy(teleportY, tagFor(map, 'teleporty'));
        t.true(isInBounds(teleportMap, teleportX, teleportY), tagFor(map, 'teleportbounds'));
      }

      if(interactable.type === 'Door') {
        if(!interactable.properties) return;

        const { requireHeld, requireLockpick, skillRequired } = interactable.properties;

        if(requireLockpick) {
          t.truthy(skillRequired, tagFor(map, 'skillrequired'));
        }
      }

    });
  });
});
