/*
import { Injectable } from '@angular/core';
import {Platform} from '@ionic/angular';
import {Network} from '@awesome-cordova-plugins/network/ngx';

declare let connection: any;

@Injectable( )

export class NetworkService {

  constructor(private platform: Platform, private network: Network){}
/*
  checkNetwork() {
    const connectSubscription = this.network.onConnect().subscribe(() => {
      console.log('network connected!');
      // We just got a connection but we need to wait briefly
      // before we determine the connection type. Might need to wait.
      // prior to doing any api requests as well.
      setTimeout(() => {
        if (this.network.type === 'wifi') {
          console.log('we got a wifi connection!');
        }
      }, 3000);
    });
  }


  /*
  online: Observable<boolean> = undefined;

  constructor(public platform: Platform, public network: Network) {
    this.online = Observable.create(observer => {
      observer.next(true);
    }).pipe(mapTo(true));

    if (this.platform.is('cordova')) {
      // on Device
      this.online = merge(
        this.network.onConnect().pipe(mapTo(true)),
        this.network.onDisconnect().pipe(mapTo(false))
      );
    } else {
      // on Browser
      this.online = merge(
        of(navigator.onLine),
        fromEvent(window, 'online').pipe(mapTo(true)),
        fromEvent(window, 'offline').pipe(mapTo(false))
      );
    }
  }

  public getNetworkType(): string {
    return this.network.type;
  }

  public getNetworkStatus(): Observable<boolean> {
    return this.online;
  }
}
*/


