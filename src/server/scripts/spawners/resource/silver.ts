
import { ResourceSpawner } from '../global/resource';

export class SilverOreSpawner extends ResourceSpawner {

  constructor(room, opts, properties: any = {}) {
    properties.resourceIds = [
      { chance: 20, result: 'Basic Silver Vein' },
      { chance: 1, result: 'Rich Silver Vein' }
    ];

    super(room, opts, properties);
  }

}
