import {Component, OnInit} from '@angular/core';
import {AuthService} from '../services/auth.service';

import {Network} from '@capacitor/network';
import {PluginListenerHandle} from '@capacitor/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss']
})
export class SettingsPage implements OnInit{
  networkListener: PluginListenerHandle;

  public connected: boolean;
  public connectionType: string;

  constructor(public authService: AuthService) {}

  ngOnInit() {
    this.checkStatus();
  }

  checkStatus() {
    this.networkListener = Network.addListener('networkStatusChange', status => {
      console.log('world');
      console.log('Network status changed', status.connected? 'online': 'offline');
    });

    Network.getStatus().then(x => {
      this.connectionType = x.connectionType;
      this.connected = x.connected;
    });

  }

}
