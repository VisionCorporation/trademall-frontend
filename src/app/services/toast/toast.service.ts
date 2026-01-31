import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Toast } from '../../interfaces/toast.interface';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private activeMessages = new Set<string>();

  public show(message: string, type: Toast['type'] = 'info', duration = 3000): void {
    if (this.activeMessages.has(message)) return;

    const id = crypto.randomUUID();

    const toast: Toast = { id, message, type, duration };

    this.activeMessages.add(message);
    this.toastsSubject.next([...this.toastsSubject.value, toast]);

    setTimeout(() => this.remove(id, message), duration);
  }

  private remove(id: string, message: string): void {
    const updated = this.toastsSubject.value.filter((t) => t.id !== id);
    this.toastsSubject.next(updated);
    this.activeMessages.delete(message);
  }

  public success(msg: string): void {
    this.show(msg, 'success');
  }

  public error(msg: string): void {
    this.show(msg, 'error');
  }
}
