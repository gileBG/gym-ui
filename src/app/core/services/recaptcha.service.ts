import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RecaptchaService {

  private readonly siteKey = '6Lc_pjwtAAAAAAMh-Chy-OTaNEZHRYgB9Nxz5bmD';

  execute(): Promise<string> {
    return new Promise((resolve) => {
      const win = window as any;
      if (win.grecaptcha) {
        win.grecaptcha.ready(() => {
          win.grecaptcha.execute(this.siteKey, { action: 'register' }).then((token: string) => {
            resolve(token);
          });
        });
      } else {
        // Ako reCAPTCHA nije učitan, šaljemo prazan string
        resolve('');
      }
    });
  }
}
