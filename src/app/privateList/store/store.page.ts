import {Component, OnInit, ViewChild} from '@angular/core';
import {DatabaseService} from '../../services/database.service';
import {IonContent, NavController} from '@ionic/angular';
import {BusinessHours, Day} from '../../../datatypes/businessHours';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {Unsubscribe} from '@angular/fire/firestore';
import {Store} from '../../../datatypes/store';
import {AuthService} from '../../services/auth.service';
import {PhotoService} from '../../services/photo.service';

@Component({
  selector: 'app-store',
  templateUrl: './store.page.html',
  styleUrls: ['./store.page.scss'],
})
export class StorePage implements OnInit {

  @ViewChild(IonContent) content: IonContent;
  name: string;
  city: string;
  address?: string = '';
  comment?: string = '';
  isPublic: boolean;
  key: string;
  id: string;
  image?: string = '';
  fetchedURL: string;

  startHourMonday: number;
  startMinuteMonday: number;
  endHourMonday: number;
  endMinuteMonday: number;
  startHourTuesday: number;
  startMinuteTuesday: number;
  endHourTuesday: number;
  endMinuteTuesday: number;
  startHourWednesday: number;
  startMinuteWednesday: number;
  endHourWednesday: number;
  endMinuteWednesday: number;
  startHourThursday: number;
  startMinuteThursday: number;
  endHourThursday: number;
  endMinuteThursday: number;
  startHourFriday: number;
  startMinuteFriday: number;
  endHourFriday: number;
  endMinuteFriday: number;
  startHourSaturday: number;
  startMinuteSaturday: number;
  endHourSaturday: number;
  endMinuteSaturday: number;
  startHourSunday: number;
  startMinuteSunday: number;
  endHourSunday: number;
  endMinuteSunday: number;

  businessHours: BusinessHours[] = [];
  stores: Store[] = [];
  private unsubscribe: Unsubscribe;

  constructor(public navController: NavController,public activatedRoute: ActivatedRoute,
              private database: DatabaseService, private location: Location,
              private authService: AuthService,
              public photoService: PhotoService) {
    this.isPublic = false;
    this.resetValues();
  }

  async takePicture(): Promise<void>{

    //foto wegschrijven in local memory
    // en meteen terug ophalen

    //enkel bij het committen, moet deze foto in de firebase worden weggeschreven.
    //als de nieuwe foto niet wordt bevestigd, dan moet deze terug verdwijnen (niet saven naar firebase)
    await this.photoService.takePhoto(this.name, this.city).then(async () => {
      console.log();
      await this.photoService.loadPhotoFromLocalStorageType(this.name, this.city)
        .then(result => {
          console.log('loadResult', result);
          this.fetchedURL = result;
        });
    });

    // indien niet anders kan:
    // await this.photoService.takePhoto(this.name, this.city).then(res => {
    //   console.log('res', res);
    //   this.image = res;
    //   this.loadPhoto();
    //   }
    // );

    //this.image = await this.photoService.takePhoto(this.name, this.city);
  }

  ngOnInit() {
    this.setData();
    this.resetValues();

  }

  async setData(): Promise<void>{
    const id = this.activatedRoute.snapshot.paramMap.get('id');

    if (id === null) {
      return;
    }

    const storeTest = await this.database.retrieveStoreAsSnapshot('stores', id);

    this.name = storeTest.name;
    this.city = storeTest.city;
    this.address = storeTest.address;
    this.comment = storeTest.comment;
    this.isPublic = storeTest.isPublic;
    this.key = storeTest.key;
    this.image = storeTest.image;

    this.unsubscribe = await this.database.retrieveBusinessHoursInRealTime(this.name, this.city, b => this.businessHours = b);
    await this.database.retrieveBusinessHoursAsSnapshot(this.name, this.city);
    console.log('this.businessHours',this.businessHours);

    this.startHourMonday = this.toDateTime(this.businessHours.filter(b => b.day===Day.monday)[0].openTime).getHours();
    this.startMinuteMonday = this.toDateTime(this.businessHours.filter(b => b.day===Day.monday)[0].openTime).getMinutes();
    this.endHourMonday = this.toDateTime(this.businessHours.filter(b => b.day===Day.monday)[0].closeTime).getHours();
    this.endMinuteMonday= this.toDateTime(this.businessHours.filter(b => b.day===Day.monday)[0].closeTime).getMinutes();
    this.startHourTuesday = this.toDateTime(this.businessHours.filter(b => b.day===Day.tuesday)[0].openTime).getHours();
    this.startMinuteTuesday = this.toDateTime(this.businessHours.filter(b => b.day===Day.tuesday)[0].openTime).getMinutes();
    this.endHourTuesday = this.toDateTime(this.businessHours.filter(b => b.day===Day.tuesday)[0].closeTime).getHours();
    this.endMinuteTuesday = this.toDateTime(this.businessHours.filter(b => b.day===Day.tuesday)[0].closeTime).getMinutes();
    this.startHourWednesday= this.toDateTime(this.businessHours.filter(b => b.day===Day.wednesday)[0].openTime).getHours();
    this.startMinuteWednesday= this.toDateTime(this.businessHours.filter(b => b.day===Day.wednesday)[0].openTime).getMinutes();
    this.endHourWednesday= this.toDateTime(this.businessHours.filter(b => b.day===Day.wednesday)[0].closeTime).getHours();
    this.endMinuteWednesday= this.toDateTime(this.businessHours.filter(b => b.day===Day.wednesday)[0].closeTime).getMinutes();
    this.startHourThursday= this.toDateTime(this.businessHours.filter(b => b.day===Day.thursday)[0].openTime).getHours();
    this.startMinuteThursday= this.toDateTime(this.businessHours.filter(b => b.day===Day.thursday)[0].openTime).getMinutes();
    this.endHourThursday= this.toDateTime(this.businessHours.filter(b => b.day===Day.thursday)[0].closeTime).getHours();
    this.endMinuteThursday= this.toDateTime(this.businessHours.filter(b => b.day===Day.thursday)[0].closeTime).getMinutes();
    this.startHourFriday= this.toDateTime(this.businessHours.filter(b => b.day===Day.friday)[0].openTime).getHours();
    this.startMinuteFriday= this.toDateTime(this.businessHours.filter(b => b.day===Day.friday)[0].openTime).getMinutes();
    this.endHourFriday= this.toDateTime(this.businessHours.filter(b => b.day===Day.friday)[0].closeTime).getHours();
    this.endMinuteFriday= this.toDateTime(this.businessHours.filter(b => b.day===Day.friday)[0].closeTime).getMinutes();
    this.startHourSaturday= this.toDateTime(this.businessHours.filter(b => b.day===Day.saturday)[0].openTime).getHours();
    this.startMinuteSaturday= this.toDateTime(this.businessHours.filter(b => b.day===Day.saturday)[0].openTime).getMinutes();
    this.endHourSaturday= this.toDateTime(this.businessHours.filter(b => b.day===Day.saturday)[0].closeTime).getHours();
    this.endMinuteSaturday= this.toDateTime(this.businessHours.filter(b => b.day===Day.saturday)[0].closeTime).getMinutes();
    this.startHourSunday= this.toDateTime(this.businessHours.filter(b => b.day===Day.sunday)[0].openTime).getHours();
    this.startMinuteSunday= this.toDateTime(this.businessHours.filter(b => b.day===Day.sunday)[0].openTime).getMinutes();
    this.endHourSunday= this.toDateTime(this.businessHours.filter(b => b.day===Day.sunday)[0].closeTime).getHours();
    this.endMinuteSunday= this.toDateTime(this.businessHours.filter(b => b.day===Day.sunday)[0].closeTime).getMinutes();

    await this.loadPhoto();
  }

  async loadPhoto(): Promise<void> {
    await this.photoService.fetchPhotoFromFirebase(this.image).then(result => {
      this.fetchedURL = result;
    });
  }

  async handleCreateAndUpdate(): Promise<void> {

    if (this.key === undefined) {
      await this.createStore();
    } else {
    let tempUsers = [];
    const checkPhotoString: string = this.name + '_'+this.city + '.png';
    let checkImage: string;
    let photoUpdateNeeded: boolean;

      await this.database.retrieveStoreDetail(this.name, this.city)
        .then(res => tempUsers = res[0].user);

      console.log('users', tempUsers);

      if(localStorage.getItem(checkPhotoString) !== undefined && localStorage.getItem(checkPhotoString) !== null){
      console.log('localStorage check', localStorage.getItem(checkPhotoString));
      //Image needs updating
      photoUpdateNeeded = true;
      checkImage = checkPhotoString;
    } else {
      photoUpdateNeeded = false;
      //Image doesn't need updating

      await this.photoService.loadPhotoFromLocalStorageType(this.name, this.city)
        .then(async result => {
          this.fetchedURL = result;
        });
      checkImage = localStorage.getItem('imgName');
    }


  let updateStore: Store;

      if(photoUpdateNeeded) {
        //image needs to be updated
        await this.photoService.finalSavePhoto(this.name, this.city);
        updateStore = {
          id: 0,
          city: this.city,
          isPublic: this.isPublic,
          user: tempUsers,
          name: this.name,
          comment: this.comment,
          address: this.address,
          image: checkImage
        };
      } else {
        updateStore = {
          id: 0,
          city: this.city,
          isPublic: this.isPublic,
          user: tempUsers,
          name: this.name,
          comment: this.comment,
          address: this.address,
          //image: checkImage
        };
      }

      localStorage.clear();

      const today = new Date();

      console.log('businessHours', this.businessHours);

      const mondayKey = this.businessHours.find(x => x.day === Day.monday).key;
      console.log('mondayKey', mondayKey);
      const updateMonday: BusinessHours = {
        store: this.name,
        city: this.city,
        day: Day.monday,
        openTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), this.startHourMonday, this.startMinuteMonday, 0),
        closeTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), this.endHourMonday, this.endMinuteMonday, 0)
      };

      const tuesdayKey = this.businessHours.find(x => x.day === Day.tuesday).key;
      const updateTuesday: BusinessHours = {
        store: this.name,
        city: this.city,
        day: Day.tuesday,
        openTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), this.startHourTuesday, this.startMinuteTuesday, 0),
        closeTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), this.endHourTuesday, this.endMinuteTuesday, 0)
      };

      const wednesdayKey = this.businessHours.find(x => x.day === Day.wednesday).key;
      const updateWednesday: BusinessHours = {
        store: this.name,
        city: this.city,
        day: Day.wednesday,
        openTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), this.startHourWednesday, this.startMinuteWednesday, 0),
        closeTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), this.endHourWednesday, this.endMinuteWednesday, 0)
      };

      const thursdayKey = this.businessHours.find(x => x.day === Day.thursday).key;
      const updateThursday: BusinessHours = {
        store: this.name,
        city: this.city,
        day: Day.thursday,
        openTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), this.startHourThursday, this.startMinuteThursday, 0),
        closeTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), this.endHourThursday, this.endMinuteThursday, 0)
      };

      const fridayKey = this.businessHours.find(x => x.day === Day.friday).key;
      const updateFriday: BusinessHours = {
        store: this.name,
        city: this.city,
        day: Day.friday,
        openTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), this.startHourFriday, this.startMinuteFriday, 0),
        closeTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), this.endHourFriday, this.endMinuteFriday, 0)
      };

      const saturdayKey = this.businessHours.find(x => x.day === Day.saturday).key;
      const updateSaturday: BusinessHours = {
        store: this.name,
        city: this.city,
        day: Day.saturday,
        openTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), this.startHourSaturday, this.startMinuteSaturday, 0),
        closeTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), this.endHourSaturday, this.endMinuteSaturday, 0)
      };

      const sundayKey = this.businessHours.find(x => x.day === Day.sunday).key;
      const updateSunday: BusinessHours = {
        store: this.name,
        city: this.city,
        day: Day.sunday,
        openTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), this.startHourSunday, this.startMinuteSunday, 0),
        closeTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), this.endHourSunday, this.endMinuteSunday, 0)
      };

      await this.database.updateStore('Stores', this.key, updateStore);
      await this.database.updateBusinessHours('BusinessHours', mondayKey, updateMonday);
      await this.database.updateBusinessHours('BusinessHours', tuesdayKey, updateTuesday);
      await this.database.updateBusinessHours('BusinessHours', wednesdayKey, updateWednesday);
      await this.database.updateBusinessHours('BusinessHours', thursdayKey, updateThursday);
      await this.database.updateBusinessHours('BusinessHours', fridayKey, updateFriday);
      await this.database.updateBusinessHours('BusinessHours', saturdayKey, updateSaturday);
      await this.database.updateBusinessHours('BusinessHours', sundayKey, updateSunday);


    }
    this.navController.back();

  }

  async createStore(): Promise<void> {

    if(localStorage.getItem('imgName') !== null && localStorage.getItem('imgName') !== undefined){
      this.image = localStorage.getItem('imgName');
      await this.photoService.finalSavePhoto(this.name, this.city);
    } else {
      this.image = 'default.jpg';
    }


    await this.database.newStore(this.name, this.city, this.isPublic, this.address, this.comment, this.key, this.image);

    this.address = '';
    this.comment = '';
    this.isPublic = false;
    this.key = '';
    await this.createBusinessHours();

    this.location.back();
  }

  async createBusinessHours(): Promise<void> {
    const today = new Date();
    //Monday
    const startMondayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
      this.startHourMonday, this.startMinuteMonday, 0);
    const endMondayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
      this.endHourMonday, this.endMinuteMonday, 0);
    await this.database.newBusinessHours(this.name, this.city, Day.monday, startMondayDate, endMondayDate);

    const startTuesdayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
      this.startHourTuesday, this.startMinuteTuesday, 0);
    const endTuesdayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
      this.endHourTuesday, this.endMinuteTuesday, 0);
    await this.database.newBusinessHours(this.name, this.city, Day.tuesday, startTuesdayDate, endTuesdayDate);

    const startWednesdayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
      this.startHourWednesday, this.startMinuteWednesday, 0);
    const endWednesdayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
      this.endHourWednesday, this.endMinuteWednesday, 0);
    await this.database.newBusinessHours(this.name, this.city, Day.wednesday, startWednesdayDate, endWednesdayDate);

    const startThursdayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
      this.startHourThursday, this.startMinuteThursday, 0);
    const endThursdayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
      this.endHourThursday, this.endMinuteThursday, 0);
    await this.database.newBusinessHours(this.name, this.city, Day.thursday, startThursdayDate, endThursdayDate);

    const startFridayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
      this.startHourFriday, this.startMinuteFriday, 0);
    const endFridayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), this.endHourFriday, this.endMinuteFriday, 0);
    await this.database.newBusinessHours(this.name, this.city, Day.friday, startFridayDate, endFridayDate);

    const startSaturdayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
      this.startHourSaturday, this.startMinuteSaturday, 0);
    const endSaturdayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
      this.endHourSaturday, this.endMinuteSaturday, 0);
    await this.database.newBusinessHours(this.name, this.city, Day.saturday, startSaturdayDate, endSaturdayDate);

    const startSundayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
      this.startHourSunday, this.startMinuteSunday, 0);
    const endSundayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
      this.endHourSunday, this.endMinuteSunday, 0);
    await this.database.newBusinessHours(this.name, this.city, Day.sunday, startSundayDate, endSundayDate);

    this.name = '';
    this.city = '';
    this.image = '';
    this.resetValues();
  }

  private resetValues(): void {
    this.startHourMonday = 0;
    this.startMinuteMonday = 0;
    this.endHourMonday = 0;
    this.endMinuteMonday= 0;
    this.startHourTuesday = 0;
    this.startMinuteTuesday = 0;
    this.endHourTuesday = 0;
    this.endMinuteTuesday = 0;
    this.startHourWednesday= 0;
    this.startMinuteWednesday= 0;
    this.endHourWednesday= 0;
    this.endMinuteWednesday= 0;
    this.startHourThursday= 0;
    this.startMinuteThursday= 0;
    this.endHourThursday= 0;
    this.endMinuteThursday= 0;
    this.startHourFriday= 0;
    this.startMinuteFriday= 0;
    this.endHourFriday= 0;
    this.endMinuteFriday= 0;
    this.startHourSaturday= 0;
    this.startMinuteSaturday= 0;
    this.endHourSaturday= 0;
    this.endMinuteSaturday= 0;
    this.startHourSunday= 0;
    this.startMinuteSunday= 0;
    this.endHourSunday= 0;
    this.endMinuteSunday= 0;

  }

  private toDateTime(secs): Date {
    const t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs);
    //Timezone GMT +2
    t.setHours(t.getHours() + 2);
    return t;
  }


}
