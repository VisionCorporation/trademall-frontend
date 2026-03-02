import { animate, style, transition, trigger } from "@angular/animations";

export const smoothCollapse = trigger('smoothCollapse', [
  transition(':enter', [
    style({
      height: 0,
      opacity: 0,
      overflow: 'hidden',
    }),
    animate(
      '300ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      style({
        height: '*',
        opacity: 1,
      }),
    ),
  ]),
  transition(':leave', [
    style({ overflow: 'hidden' }),
    animate(
      '300ms cubic-bezier(0.4, 0.0, 1, 1)',
      style({
        height: 0,
        opacity: 0,
      }),
    ),
  ]),
]);
