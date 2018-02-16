import {AfterContentInit, Directive, ElementRef, HostListener, Input, OnDestroy} from '@angular/core';

@Directive({
  selector: '[appNgxAutoScroll]',
})
export class NgxAutoScrollDirective implements AfterContentInit, OnDestroy {
  @Input('lockYOffset') public lockYOffset = 10;
  @Input('observeAttributes') public observeAttributes = 'false';

  private nativeElement: HTMLElement;
  private isLocked = false;
  private mutationObserver: MutationObserver;

  constructor(element: ElementRef) {
    this.nativeElement = element.nativeElement;
    this.scrollHandler();
  }

  public getObserveAttributes(): boolean {
    return this.observeAttributes !== '' && this.observeAttributes.toLowerCase() !== 'false';
  }

  public ngAfterContentInit(): void {
    this.mutationObserver = new MutationObserver(() => {
      if (!this.isLocked) {
        this.scrollDown();
      }
    });
    this.mutationObserver.observe(this.nativeElement, {
      childList: true,
      subtree: true,
      attributes: this.getObserveAttributes(),
    });
  }

  public ngOnDestroy(): void {
    this.mutationObserver.disconnect();
  }

  public forceScrollDown(): void {
    this.scrollDown();
  }

  private scrollDown(): void {
    this.nativeElement.scrollTop = this.nativeElement.scrollHeight;
  }

  @HostListener('scroll')
  private scrollHandler(): void {
    const scrollFromBottom = this.nativeElement.scrollHeight - this.nativeElement.scrollTop - this.nativeElement.clientHeight;
    this.isLocked = scrollFromBottom > this.lockYOffset;
  }
}
