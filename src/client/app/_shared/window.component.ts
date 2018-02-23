import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

import { kebabCase } from 'lodash';

@Component({
  selector: 'app-window',
  styleUrls: ['../app.component.windows.scss'],
  template: `
    <div class="window"
         [class.active-window]="isActive"
         [ngClass]="[windowClassName, otherWindowClasses]"
         (click)="active.emit(windowName)"
         [appDraggableWindow]="windowDraggable"
         [windowHandle]="windowDrag"
         [windowName]="windowName"
         [windowLocation]="windowLocation.location"
         [defaultX]="windowLocation.defaultX"
         [defaultY]="windowLocation.defaultY"
         [class.minimized]="minimized"
         [class.hidden]="hidden">
      <div class="window-header text-center" #windowDrag>
        <ng-template [ngTemplateOutlet]="headTemplate"></ng-template>
        <app-minimize-button *ngIf="canMinimize" (click)="minimize.emit(windowName)"></app-minimize-button>
        <app-close-button *ngIf="canClose" (click)="close.emit(windowName)"></app-close-button>
      </div>
      <div class="window-body" [class.hidden]="minimized">
        <ng-template [ngTemplateOutlet]="bodyTemplate"></ng-template>
      </div>
    </div>
  `
})
export class WindowComponent {

  @Output()
  public active = new EventEmitter();

  @Output()
  public minimize = new EventEmitter();

  @Output()
  public close = new EventEmitter();

  @Input()
  public windowName: string;

  @Input()
  public windowMinimized: boolean;

  @Input()
  public otherWindowClasses = '';

  @Input()
  public windowDraggable: boolean = true;

  @Input()
  public windowLocation: { location: any, defaultX: number, defaultY: number } = { location: {}, defaultX: 0, defaultY: 0 };

  @Input()
  public isActive: boolean;

  @Input()
  public hidden: boolean;

  @Input()
  public canClose: boolean;

  @Input()
  public canMinimize: boolean;

  @Input()
  public minimized: boolean;

  @Input()
  public headTemplate: TemplateRef<any>;

  @Input()
  public bodyTemplate: TemplateRef<any>;

  public get windowClassName(): string {
    return kebabCase(this.windowName);
  }
}
