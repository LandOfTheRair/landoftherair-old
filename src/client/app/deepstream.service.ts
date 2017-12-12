import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

import * as Deepstream from 'deepstream.io-client-js';

@Injectable()
export class DeepstreamService {

  private ds: any;

  public ground: any;

  constructor() {
    this.ds = Deepstream(environment.deepstream.url);
    this.ds.login();
  }

  init(mapName: string) {
    this.ground = this.ds.record.getRecord(`${mapName}/groundItems`);
  }

  uninit() {
    if(this.ground) this.ground.unsubscribe();
  }

}
