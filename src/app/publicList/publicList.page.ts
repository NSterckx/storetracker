import {Component, OnInit, ViewChild} from '@angular/core';
import {IonContent} from '@ionic/angular';
import {Store} from '../../datatypes/store';
import {Unsubscribe} from '@angular/fire/firestore';
import {DatabaseService} from '../services/database.service';
import {BusinessHours} from '../../datatypes/businessHours';
import {DisplayStore} from '../../datatypes/displayStore';
import {ActivatedRoute, Router} from '@angular/router';
import {PhotoService} from '../services/photo.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'publicList.html',
  styleUrls: ['publicList.scss']
})
export class PublicListPage implements OnInit {

  @ViewChild(IonContent) content: IonContent;
  publicStores: Store[] = [];
  businessHours: BusinessHours[] = [];
  visPublicStores: DisplayStore[] = [];
  private unsubscribe: Unsubscribe;
  private unsubscribe2: Unsubscribe;


  constructor(private databaseService: DatabaseService, public router: Router, public activatedRoute: ActivatedRoute, private photoService: PhotoService) {
  }

  ngOnInit() {
    this.loadData().then(r => console.log('public data loaded'));
  }

  public async addToPrivate(key: string) {

    this.databaseService.addUserToStore(key);
  }

  private async loadData(): Promise<void> {
    this.unsubscribe = await this.databaseService.retrievePublicStoresInRealTime( s => this.publicStores = s);
    await this.databaseService.retrievePublicStoresAsSnapshot();

    await this.convertStoreToVisibleLabel();

  }

  private async convertStoreToVisibleLabel(): Promise<void> {
    for (const store of this.publicStores) {
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
      //console.log('businessHours', this.businessHours);
      // eslint-disable-next-line max-len
      for(const hour of this.businessHours){
        const startDate = this.toDateTime(hour.openTime);
        const endDate = this.toDateTime(hour.closeTime);

        //console.log(displayStore.name);
        //console.log('StartDate',startDate);
        //console.log('today.gethours', today.getHours());

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


      if (this.visPublicStores.filter(e => e.city === displayStore.city && e.name === displayStore.name).length > 0) {
      } else {
        this.visPublicStores.push(displayStore);
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
