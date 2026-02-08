import { AfterViewInit, Component, inject } from '@angular/core';
import { UserTypes } from '../../data/constants/user-type.constant';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-type',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-type.html',
  styleUrl: './user-type.css',
})
export class UserType implements AfterViewInit {
  public userTypes = UserTypes;
  private fb = inject(FormBuilder);
  private router = inject(Router);

  public userTypeForm = this.fb.group({
    userType: [''],
  });

  ngAfterViewInit(): void {
    this.userTypeForm.get('userType')?.valueChanges.subscribe((value) => {
      this.userTypeForm.get('userType')?.setValue(value, { emitEvent: false });
    });
  }

  public selectUserType(userType: string): void {
    this.userTypeForm.get('userType')?.setValue(userType);
  }

  public onSubmit(): void {
    const selectedUserType = this.userTypeForm.get('userType')?.value;
    if (selectedUserType === 'customer') {
      this.router.navigate(['/customer/signup']);
    } else if (selectedUserType === 'vendor') {
      this.router.navigate(['/vendor/signup']);
    }
  }
}
