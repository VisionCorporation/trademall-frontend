import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast/toast.service';
import { fadeInOutAnimation } from '../../animations/toast.animations';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [AsyncPipe],
  templateUrl: './toast.html',
  styleUrls: ['./toast.css'],
  animations: [fadeInOutAnimation],
})
export class Toast {
  private readonly toastService = inject(ToastService);
  public toasts$ = this.toastService.toasts$;

  public trackById(item: any): any {
    return item.id;
  }
}
