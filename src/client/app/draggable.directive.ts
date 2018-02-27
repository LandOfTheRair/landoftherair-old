import { Directive, Input, ElementRef, HostListener, OnInit } from '@angular/core';

import { isUndefined } from 'lodash';
import { WindowManagerService } from './windowmanager.service';

@Directive({
  selector: '[appDraggableWindow]'
})
export class DraggableWindowDirective implements OnInit {
  private topStart: number;
  private leftStart: number;
  private _allowDrag = true;
  private md: boolean;
  private _handle: HTMLElement;

  @Input('appDraggableWindow')
  set allowDrag(value: boolean){
    this._allowDrag = value;
    if(this._allowDrag) {
      this.element.nativeElement.className += ' cursor-draggable';
    } else {
      this.element.nativeElement.className = this.element.nativeElement.className.replace(' cursor-draggable', '');
    }
  }

  @Input('windowHandle')
  set windowHandle(handle: HTMLElement){
    this._handle = handle;
  }

  @Input()
  public windowName: string;

  @Input()
  public defaultX: number;

  @Input()
  public defaultY: number;

  @Input()
  public set windowLocation(data) {
    if(!data) return;

    const { x, y } = data;
    this.setElementCoords(y, x);
  }

  constructor(
    public windowManager: WindowManagerService,
    public element: ElementRef
  ) {}

  ngOnInit() {
    // css changes
    if(this._allowDrag) {
      this.element.nativeElement.style.position = 'relative';
      this.element.nativeElement.className += ' cursor-draggable';
    }

    if(this.windowName) {
      this.loadCoordinates();
    }
  }

  private loadCoordinates() {
    const coordinates = this.windowManager.getWindow(this.windowName);
    if(!coordinates && !isUndefined(this.defaultY) && !isUndefined(this.defaultX)) {
      this.setElementCoords(this.defaultY, this.defaultX);
    } else {
      const { x, y } = coordinates;
      if(isUndefined(y) || isUndefined(x)) return;
      this.setElementCoords(y, x);
    }
  }

  private saveCoordinates(top, left) {
    if(!this.windowName) return;

    this.windowManager.updateWindow(this.windowName, { x: left, y: top });
  }

  private setElementCoords(top, left) {
    this.saveCoordinates(top, left);
    this.element.nativeElement.style.top = `${top}px`;
    this.element.nativeElement.style.left = `${left}px`;
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    // prevents right click drag
    if(event.button === 2 || (this._handle !== undefined && event.target !== this._handle)) return;

    this.md = true;
    this.topStart = event.clientY - this.element.nativeElement.style.top.replace('px', '');
    this.leftStart = event.clientX - this.element.nativeElement.style.left.replace('px', '');
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this.md = false;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if(this.md && this._allowDrag) {
      this.setElementCoords(event.clientY - this.topStart, event.clientX - this.leftStart);
    }
  }

  @HostListener('document:mouseleave', ['$event'])
  onMouseLeave() {
    this.md = false;
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event) {
    this.md = true;
    this.topStart = event.changedTouches[0].clientY - this.element.nativeElement.style.top.replace('px', '');
    this.leftStart = event.changedTouches[0].clientX - this.element.nativeElement.style.left.replace('px', '');
    event.stopPropagation();
  }

  @HostListener('document:touchend', ['$event'])
  onTouchEnd() {
    this.md = false;
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event) {
    if(this.md && this._allowDrag) {
      this.setElementCoords(event.changedTouches[0].clientY - this.topStart, event.changedTouches[0].clientX - this.leftStart);
    }
    event.stopPropagation();
  }
}
