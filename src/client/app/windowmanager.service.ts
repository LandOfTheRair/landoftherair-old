import { Injectable } from '@angular/core';
import { cloneDeep, extend } from 'lodash';
import { LocalStorageService } from 'ngx-webstorage';

interface WindowProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  canResize?: boolean;
  resizeEdges?: { left?: boolean, right?: boolean, top?: boolean, bottom?: boolean };
  resizeSnapGrid?: { left?: number, right?: number, top?: number, bottom?: number };
}

const WindowDefaults: { [key: string]: WindowProps } = {
  lobby:                      { x: 299,  y: 55,  width: 900,  height: 400,
                                canResize: true, resizeEdges: { right: true, bottom: true } },
  characterSelect:            { x: 0,    y: 55,  width: 300 },
  map:                        { x: 389,  y: 56 },
  stats:                      { x: 389,  y: 96 },
  skills:                     { x: 389,  y: 96 },
  tradeSkills:                { x: 389,  y: 96 },
  commandLine:                { x: 389,  y: 844 },
  log:                        { x: 3,    y: 365, width: 385,  height: 230,
                                canResize: true, resizeEdges: { bottom: true } },
  status:                     { x: 389,  y: 743 },
  ground:                     { x: 3,    y: 625 },
  sack:                       { x: 966,  y: 538 },
  belt:                       { x: 966,  y: 433 },
  pouch:                      { x: 866,  y: 538 },
  equipment:                  { x: 966,  y: 56 },
  equipmentViewOnly:          { x: 866,  y: 56 },
  npcs:                       { x: 3,    y: 56, width: 385, height: 310,
                                canResize: true, resizeEdges: { bottom: true } },
  macros:                     { x: 389,  y: 661 },
  trainer:                    { x: 670,  y: 120 },
  shop:                       { x: 670,  y: 120 },
  bank:                       { x: 670,  y: 120 },
  locker:                     { x: 670,  y: 120 },
  party:                      { x: 670,  y: 120 },
  traits:                     { x: 670,  y: 120 },
  tradeskillAlchemy:          { x: 670,  y: 120 },
  tradeskillSpellforging:     { x: 670,  y: 120 },
  tradeskillMetalworking:     { x: 670,  y: 120 }
};

@Injectable()
export class WindowManagerService {

  public windowLocations: any = {
    lobby: null,
    characterSelect: null,
    map: null,
    stats: null,
    skills: null,
    tradeSkills: null,
    commandLine: null,
    log: null,
    status: null,
    ground: null,
    sack: null,
    belt: null,
    pouch: null,
    equipment: null,
    equipmentViewOnly: null,
    npcs: null,
    macros: null,
    trainer: null,
    shop: null,
    bank: null,
    locker: null,
    party: null,
    traits: null,
    tradeskillAlchemy: null,
    tradeskillSpellforging: null,
    tradeskillMetalworking: null
  };

  public defaultWindowLocations = cloneDeep(WindowDefaults);

  constructor(
    private localStorage: LocalStorageService
  ) {
    this.init();
  }

  init() {
    Object.keys(this.defaultWindowLocations).forEach(key => {
      const retrieved = this.localStorage.retrieve(`window-${key}`);
      this.windowLocations[key] = extend({}, this.getWindowDefault(key), retrieved);

      if(!this.windowLocations[key].resizeEdges) this.windowLocations[key].resizeEdges = {};
      if(!this.windowLocations[key].resizeSnapGrid) this.windowLocations[key].resizeSnapGrid = {};
    });
  }

  getWindowDefault(window) {
    return cloneDeep(this.defaultWindowLocations[window]);
  }

  getWindow(window) {
    return this.windowLocations[window];
  }

  updateWindow(window, props: WindowProps) {
    extend(this.windowLocations[window], props);
    this.saveWindow(window);
  }

  saveWindow(window) {
    if(!this.windowLocations[window]) return;

    const { x, y, width, height } = this.windowLocations[window];
    this.localStorage.store(`window-${window}`, { x, y, width, height });
  }

}
