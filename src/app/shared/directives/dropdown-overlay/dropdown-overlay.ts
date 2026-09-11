import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Subscription } from 'rxjs';
import { POSITIONS } from '../../../data/constants/vendor-dashbaord.constant';

@Directive({
  selector: '[appDropdownOverlay]',
  standalone: true,
})
export class DropdownOverlay implements OnChanges, OnDestroy {
  @Input('appDropdownOverlayOpen') isOpen = false;
  @Input('appDropdownOverlayTemplate') template!: TemplateRef<unknown>;
  @Input('appDropdownOverlayWidth') widthStrategy: 'trigger' | 'auto' = 'trigger';
  @Output() appDropdownOverlayClosed = new EventEmitter<void>();

  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);
  private elementRef = inject(ElementRef<HTMLElement>);

  private overlayRef: OverlayRef | null = null;
  private outsideClickSub?: Subscription;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      this.isOpen ? this.open() : this.close();
    }
  }

  private open(): void {
    if (this.overlayRef || !this.template) return;

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions(POSITIONS)
      .withPush(true)
      .withViewportMargin(12);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close(),
      width:
        this.widthStrategy === 'trigger'
          ? this.elementRef.nativeElement.getBoundingClientRect().width
          : undefined,
      hasBackdrop: false,
    });

    this.overlayRef.attach(new TemplatePortal(this.template, this.viewContainerRef));

    this.outsideClickSub = this.overlayRef.outsidePointerEvents().subscribe((event) => {
      const target = event.target as Node;
      if (!this.elementRef.nativeElement.contains(target)) {
        this.appDropdownOverlayClosed.emit();
      }
    });

    this.overlayRef.detachments().subscribe(() => {
      this.appDropdownOverlayClosed.emit();
    });
  }

  private close(): void {
    this.outsideClickSub?.unsubscribe();
    this.outsideClickSub = undefined;
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  ngOnDestroy(): void {
    this.close();
  }
}