import { Component, OnInit } from '@angular/core';
import {AuthService} from '../services/auth.service';
import {ModalController} from '@ionic/angular';
import {Capacitor} from '@capacitor/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  isNative = Capacitor.isNativePlatform();

  constructor(public authService: AuthService, private modalController: ModalController) { }

  ngOnInit() {}

  /*
  async showPhoneVerification(): Promise<void> {
    const modal = await this.modalController.create({
    });
    return await modal.present();
  }

   */
}
