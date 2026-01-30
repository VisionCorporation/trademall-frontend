import { inject, Injectable } from '@angular/core';
import { timer } from 'rxjs';
import { map, takeWhile, shareReplay } from 'rxjs/operators';
import { SignupService } from '../signup/signup.service';

@Injectable({
  providedIn: 'root',
})
export class CountdownTimerService {
  private readonly signupService = inject(SignupService);
  public start(key: string, durationInSeconds: number) {
    const now = Date.now();
    const storedExpiry = localStorage.getItem(key);

    let expiryTime: number;

    if (storedExpiry) {
      expiryTime = parseInt(storedExpiry, 10);
    } else {
      expiryTime = now + durationInSeconds * 1000;
      localStorage.setItem(key, expiryTime.toString());
    }

    const timer$ = timer(0, 1000).pipe(
      map(() => Math.max(0, Math.floor((expiryTime - Date.now()) / 1000))),
      takeWhile((time) => time >= 0),
      shareReplay(1),
    );

    const time$ = timer$.pipe(map((time) => this.formatTime(time)));
    const finished$ = timer$.pipe(map((time) => time === 0));
    return { time$, finished$ };
  }

  public clear(key: string): void {
    localStorage.removeItem(key);
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${this.padZero(minutes)}:${this.padZero(secs)}s`;
  }

  private padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }
}
