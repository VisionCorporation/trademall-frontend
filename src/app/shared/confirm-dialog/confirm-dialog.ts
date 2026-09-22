import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from '../../services/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  public dialogService = inject(ConfirmDialogService);
}
