import {Component, OnInit} from '@angular/core';
import {FirebaseApp} from '@angular/fire/app';
import {AuthService} from './services/auth.service';
import {debounceTime} from 'rxjs/operators';
declare let $: any;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent{
  public isConnected: boolean;

  constructor(firebaseApp: FirebaseApp, public authService: AuthService) {
  }





}
