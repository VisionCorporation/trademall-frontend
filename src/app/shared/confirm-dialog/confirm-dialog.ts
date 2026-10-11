import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from '../../services/confirm-dialog/confirm-dialog';
import { fadeInOutAnimation } from '../../animations/toast.animations';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
  animations: [fadeInOutAnimation]
})
export class ConfirmDialog {
  public dialogService = inject(ConfirmDialogService);
}
