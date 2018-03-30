
require('dotenv').config({ silent: true });

import { PNG } from 'pngjs';
import * as fs from 'fs';
import * as path from 'path';
import * as recurse from 'recursive-readdir';
import { ensureDir } from 'fs-extra';

import { MapLayer } from '../../../shared/models/maplayer';

const isDense = (map, x, y): boolean => {
  const adjustedY = y * map.width;
  return map.layers[MapLayer.Walls].data[x + adjustedY];
};

const analyze = (mapName, map) => {

  const png = new PNG({
    width: map.width,
    height: map.height,
    bgColor: {
      red: 100,
      green: 100,
      blue: 100,
      alpha: 0
    }
  });

  // draw base map
  for(let x = 0; x < map.width; x++) {
    for(let y = 0; y < map.height; y++) {

      const writeIdx = (map.width * y + x) << 2;

      const xyDense = isDense(map, x, y);
      const setColor = xyDense ? 0 : 200;

      png.data[writeIdx    ] = setColor;
      png.data[writeIdx + 1] = setColor;
      png.data[writeIdx + 2] = setColor;
      png.data[writeIdx + 3] = 255;
    }
  }

  // draw each spawner + radius
  map.layers[MapLayer.Spawners].objects.forEach(spawner => {
    const x = spawner.x / 64;
    const y = (spawner.y / 64) - 1;

    // lair spawners are fine
    if(spawner.properties.script === 'global/lair') return;

    const script = require(`${__dirname}/../../scripts/spawners/${spawner.properties.script}`);
    const classRef = script[Object.keys(script)[0]];

    const props = spawner.properties;
    const spawnerObj = new classRef(null, { x, y, name: spawner.name }, props);

    const radius = spawnerObj.leashRadius;
    for(let xx = x - radius; xx < x + radius; xx++) {
      for(let yy = y - radius; yy < y + radius; yy++) {

        const xyDense = isDense(map, xx, yy);

        const writeIdx = (map.width * yy + xx) << 2;

        if(!xyDense) {
          png.data[writeIdx    ] = png.data[writeIdx    ] - 30;
        }
        // png.data[writeIdx + 1] = 0;
        // png.data[writeIdx + 2] = 0;
        png.data[writeIdx + 3] = png.data[writeIdx + 3] - 10;
      }
    }
  });

  // invert map
  for(let x = 0; x < map.width; x++) {
    for(let y = 0; y < map.height; y++) {

      const writeIdx = (map.width * y + x) << 2;

      png.data[writeIdx    ] = 255 - png.data[writeIdx    ];
      png.data[writeIdx + 1] = 255 - png.data[writeIdx + 1];
      png.data[writeIdx + 2] = 255 - png.data[writeIdx + 2];
      png.data[writeIdx + 3] = png.data[writeIdx + 3];
    }
  }

  fs.writeFileSync(`${__dirname}/heatmaps/${mapName}.png`, PNG.sync.write(png));
};


ensureDir(`${__dirname}/heatmaps`)
  .then(() => {
    recurse(`${__dirname}/../../../content/maps`).then(files => {
      files.forEach(file => {
        const mapName = path.basename(file, path.extname(file));

        analyze(mapName, require(file));
      });
    });
  });
