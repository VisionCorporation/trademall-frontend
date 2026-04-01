import { animate, style, transition, trigger } from '@angular/animations';

export const slideDown = trigger('slideDown', [
  transition(':enter', [
    style({ display: 'grid', gridTemplateRows: '0fr', opacity: 0 }),
    animate('250ms ease-out', style({ gridTemplateRows: '1fr', opacity: 1 }))
  ]),
  transition(':leave', [
    style({ display: 'grid', gridTemplateRows: '1fr', opacity: 1 }),
    animate('250ms ease-out', style({ gridTemplateRows: '0fr', opacity: 0 }))
  ])
]);