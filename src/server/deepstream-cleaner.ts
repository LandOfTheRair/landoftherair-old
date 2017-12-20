
import * as recurse from 'recursive-readdir';
import * as path from 'path';
import * as Deepstream from 'deepstream.io-client-js';

export class DeepstreamCleaner {
  static async init() {
    const ds = Deepstream(process.env.DEEPSTREAM_URL);
    ds.login({ map: 'Cleaner Service', token: process.env.DEEPSTREAM_TOKEN });

    const files = await recurse(`${__dirname}/maps`);

    files.forEach(file => {
      const mapName = path.basename(file, path.extname(file));

      this.cleanMap(mapName, ds);
    });
  }

  static cleanMap(mapName: string, ds: any) {

    ds.record.getRecord(`${mapName}/groundItems`).set({});
    ds.record.getRecord(`${mapName}/npcHash`).set({});
    ds.record.getRecord(`${mapName}/npcData`).set({});
    ds.record.getRecord(`${mapName}/npcVolatile`).set({});

  }
}
