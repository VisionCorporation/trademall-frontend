import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-vendor-application-status',
  imports: [RouterLink],
  templateUrl: './vendor-application-status.html',
  styleUrl: './vendor-application-status.css',
})
export class VendorApplicationStatus implements OnInit {
  public user: any;
  private readonly loginService = inject(LoginService);

  ngOnInit() {
    this.loginService.user$.pipe(
      filter((user) => user !== null),
      take(1)
    ).subscribe((user) => {
      this.user = user;
    });
  }
}
