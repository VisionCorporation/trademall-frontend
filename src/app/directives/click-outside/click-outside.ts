import { Directive, ElementRef, HostListener, output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutside {
  public clickOutside = output<void>();

  constructor(private readonly el: ElementRef) { }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target as HTMLElement)) {
      this.clickOutside.emit();
    }
  }
}
