import { Injectable, signal } from '@angular/core';
import { ConfirmOptions } from '../../interfaces/confirm-dialog.interface';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  public isOpen = signal(false);
  public options = signal<ConfirmOptions>({ message: '' });
  private resolveFn: ((result: boolean) => void) | null = null;

  public confirm(options: ConfirmOptions): Promise<boolean> {
    this.options.set(options);
    this.isOpen.set(true);
    return new Promise<boolean>((resolve) => {
      this.resolveFn = resolve;
    });
  }

  public handleConfirm(): void {
    this.isOpen.set(false);
    this.resolveFn?.(true);
    this.resolveFn = null;
  }

  public handleCancel(): void {
    this.isOpen.set(false);
    this.resolveFn?.(false);
    this.resolveFn = null;
  }
}