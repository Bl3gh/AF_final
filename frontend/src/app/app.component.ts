import { Component, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  
  readonly VAPID_PUBLIC_KEY = 'PUBLIC_VAPID_KEY';

  constructor(private swPush: SwPush, private http: HttpClient) {}

  ngOnInit(): void {
    if (this.swPush.isEnabled) {
      this.swPush
        .requestSubscription({
          serverPublicKey: this.VAPID_PUBLIC_KEY,
        })
        .then((subscription) => {
          console.log('Push subscription:', subscription);
          // Отправьте объект подписки на ваш бэкенд, чтобы сохранять его
          this.sendSubscriptionToTheServer(subscription);
        })
        .catch((err) =>
          console.error('Не удалось подписаться на push уведомления', err)
        );
    }
  }

  private sendSubscriptionToTheServer(subscription: PushSubscription): void {
    // Например, отправляем подписку на сервер по API
    this.http
      .post('http://localhost:8000/api/save-subscription', subscription)
      .subscribe({
        next: (res) => console.log('Подписка сохранена на сервере', res),
        error: (err) => console.error('Ошибка сохранения подписки', err),
      });
  }
}