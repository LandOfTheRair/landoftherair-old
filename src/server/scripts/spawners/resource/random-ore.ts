
import { ResourceSpawner } from '../global/resource';

export class RandomOreSpawner extends ResourceSpawner {

  constructor(room, opts, properties: any = {}) {
    properties.resourceIds = [
      { chance: 20, result: 'Basic Copper Vein' },
      { chance: 1, result: 'Rich Copper Vein' },
      { chance: 20, result: 'Basic Silver Vein' },
      { chance: 1, result: 'Rich Silver Vein' },
      { chance: 20, result: 'Basic Gold Vein' },
      { chance: 1, result: 'Rich Gold Vein' }
    ];

    super(room, opts, properties);
  }

}
