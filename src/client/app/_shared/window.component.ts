import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef } from '@angular/core';

import { kebabCase } from 'lodash';
import { LocalStorageService } from 'ngx-webstorage';
import { Subscription } from 'rxjs';
import { WindowManagerService } from '../windowmanager.service';

@Component({
  selector: 'app-window',
  styleUrls: ['../app.component.windows.scss'],
  template: `
    <div class="window"
         mwlResizable
         [id]="windowName"
         [resizeEdges]="minimized ? {} : windowLocation.resizeEdges"
         [resizeSnapGrid]="windowLocation.resizeSnapGrid"
         (resizing)="resize($event)"
         [validateResize]="validateResize"
         [style.width]="windowLocation.width + 'px'"
         [style.height]="windowLocation.height && !minimized ? windowLocation.height + 'px' : ''"
         [class.active-window]="isActive"
         [ngClass]="[windowClassName, otherWindowClasses]"
         (click)="active.emit(windowName)"
         [appDraggableWindow]="canDrag"
         [windowHandle]="windowDrag"
         [windowName]="windowName"
         [windowLocation]="windowLocation"
         [defaultX]="defaultPos.x"
         [defaultY]="defaultPos.y"
         [class.minimized]="minimized"
         [class.hidden]="hidden">
      <div class="window-header text-center" #windowDrag>
        <ng-template [ngTemplateOutlet]="headTemplate"></ng-template>
        <app-close-button *ngIf="canClose" (click)="close.emit(windowName)"></app-close-button>
        <app-minimize-button *ngIf="canMinimize" (click)="minimize.emit(windowName)"></app-minimize-button>
      </div>
      <div class="window-body" [class.hidden]="minimized">
        <ng-template [ngTemplateOutlet]="bodyTemplate"></ng-template>
      </div>
    </div>
  `
})
export class WindowComponent implements OnInit, OnDestroy {

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

  public get windowLocation() {
    return this.windowManager.getWindow(this.windowName);
  }

  public get defaultPos(): { x?: number, y?: number } {
    return this.windowManager.getWindowDefault(this.windowName);
  }

  private canDrag$: Subscription;
  public canDrag = true;

  private isActive$: Subscription;
  public isActive = false;

  constructor(
    public windowManager: WindowManagerService,
    private localStorage: LocalStorageService
  ) {}

  ngOnInit() {
    this.canDrag = !this.localStorage.retrieve('lockWindowPositions');
    this.canDrag$ = this.localStorage.observe('lockWindowPositions')
      .subscribe(val => this.canDrag = !val);

    this.isActive = this.localStorage.retrieve('activeWindow') === this.windowName;
    this.isActive$ = this.localStorage.observe('activeWindow')
      .subscribe(val => this.isActive = val === this.windowName);

    // ??? why
    this.validateResize = this.validateResize.bind(this);
  }

  ngOnDestroy() {
    this.canDrag$.unsubscribe();
    this.isActive$.unsubscribe();
  }

  public validateResize() {
    return this.canDrag;
  }

  public resize($event) {
    this.windowManager.updateWindow(this.windowName, { width: $event.rectangle.width, height: $event.rectangle.height });
  }
}
