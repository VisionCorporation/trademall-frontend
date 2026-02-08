import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { fadeInOutAnimation } from '../../animations/toast.animations';

@Component({
  selector: 'app-input-error-message',
  template: `
    @if (errorMessage) {
      <span
        [@fadeInOut]
        class="text-[#ff6b6b] mt-2 text-[15px] text-left customise-sub-title flex items-center gap-2"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.5 7.5L12 12M12 7.5L7.5 12M18.75 9.75C18.75 14.7206 14.7206 18.75 9.75 18.75C4.77944 18.75 0.75 14.7206 0.75 9.75C0.75 4.77944 4.77944 0.75 9.75 0.75C14.7206 0.75 18.75 4.77944 18.75 9.75Z"
            stroke="#ff6b6b"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ errorMessage }}
      </span>
    }
  `,
  animations: [fadeInOutAnimation],
})
export class InputErrorMessage {
  @Input() control: AbstractControl | null = null;
  @Input() messages: Record<string, string> = {};

  get errorMessage(): string | null {
    const control = this.control;

    if (!control) return null;

    if (control.invalid && (control.dirty || control.touched) && control.errors) {
      const errorKey = Object.keys(control.errors)[0];
      return this.messages[errorKey] ?? null;
    }

    return null;
  }
}
