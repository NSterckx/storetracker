import {Component, OnInit, ViewChild} from '@angular/core';
import {IonContent} from '@ionic/angular';
import {Store} from '../../datatypes/store';
import {Unsubscribe} from '@angular/fire/firestore';
import {DatabaseService} from '../services/database.service';
import {DisplayStore} from '../../datatypes/displayStore';
import {AuthService} from '../services/auth.service';
import {BusinessHours} from '../../datatypes/businessHours';
import {ActivatedRoute, Router} from '@angular/router';
import {PhotoService} from '../services/photo.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'privateList.page.html',
  styleUrls: ['privateList.page.scss']
})
export class PrivateListPage {

  @ViewChild(IonContent) content: IonContent;
  privateStores: Store[] = [];
  businessHours: BusinessHours[] = [];
  visPrivateStores: DisplayStore[] = [];

  private unsubscribe: Unsubscribe;
  private unsubscribe2: Unsubscribe;


  // eslint-disable-next-line max-len
  constructor(public router: Router, public activatedRoute: ActivatedRoute, private databaseService: DatabaseService, private authService: AuthService, private photoService: PhotoService) {
    //this.loadData().then(r => (console.log('Private stores',this.privateStores)));
  }

  ionViewWillEnter() {
   this.authService.currentUser.subscribe(x => this.loadData().then(r => (console.log('Private stores',this.privateStores))));

   }

  public async removeFromPrivate(key: string) {
    await this.databaseService.removeFromPrivate(key);
    //await this.loadData();
    window.location.reload();
  }

  private async loadData(): Promise<void> {
    this.unsubscribe = await this.databaseService.retrievePrivateStoresInRealTime( s => this.privateStores = s);
    await this.databaseService.retrievePrivateStoresAsSnapshot();

    await this.convertStoreToVisibleLabel();
  }

  private async convertStoreToVisibleLabel(): Promise<void> {
    for (const store of this.privateStores) {

      let tempImage = await this.loadPhoto(store.image);

      if(store.image === ''){
        tempImage = await this.loadPhoto('default.jpg');
      }

      const displayStore = {
        image: tempImage,
        checkOpen: 'test',
        city: store.city,
        name: store.name,
        color: '',
        key: store.key
      };

      // eslint-disable-next-line max-len
      this.unsubscribe2 = await this.databaseService.retrieveBusinessHoursInRealTime(displayStore.name, displayStore.city, b => this.businessHours = b);
      await this.databaseService.retrieveBusinessHoursAsSnapshot(displayStore.name, displayStore.city);

      const today = new Date();
      // eslint-disable-next-line max-len
      for(const hour of this.businessHours){
        const startDate = this.toDateTime(hour.openTime);
        const endDate = this.toDateTime(hour.closeTime);

        if(displayStore.name === hour.store && displayStore.city === hour.city && this.getDayOfWeek(today) === hour.day){
            if(today.getHours() < startDate.getHours()){
              displayStore.checkOpen = 'The store is currently closed';
              displayStore.color = 'color: red';
            }

            if(today.getHours() >= startDate.getHours() && today.getHours() < endDate.getHours()-1){
              displayStore.checkOpen = 'Store is open';
              displayStore.color = 'color: green';
            }

          if(today.getHours() >= endDate.getHours() -1 && today.getHours() < endDate.getHours()){
            displayStore.checkOpen = 'Store will close soon';
            displayStore.color = 'color: yellow';
          }

          if(today.getHours() >= endDate.getHours()){
            displayStore.checkOpen = 'The store has been closed for today';
            displayStore.color = 'color: red';
          }
        }
      }

      if (this.visPrivateStores.filter(e => e.key === displayStore.key).length > 0) {
      } else {
        this.visPrivateStores.push(displayStore);
      }
    }
  }

  private async loadPhoto(image: string): Promise<string> {
    let base64string: string;
    await this.photoService.fetchPhotoFromFirebase(image).then(result => {
      console.log('result', result);
      base64string = result;
    });

    return base64string;
  }

  private getDayOfWeek(date): string {
    const dayOfWeek = new Date(date).getDay();
    return isNaN(dayOfWeek) ? null :
      ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
  }

  private toDateTime(secs): Date {
    const t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs);
    t.setHours(t.getHours() + 2);
    return t;
  }



}



