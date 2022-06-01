import {Injectable} from '@angular/core';
import {Camera, CameraResultType, CameraSource, PermissionStatus, Photo} from '@capacitor/camera';
import {Storage} from '@capacitor/storage';
import {FirebaseStorage, ref} from 'firebase/storage';
import {FirebaseApp} from '@angular/fire/app';
import {getDownloadURL, getStorage, StringFormat, uploadString} from '@angular/fire/storage';
import {FirebaseAuthentication} from '@capacitor-firebase/authentication';
import {AuthService} from './auth.service';
import {Capacitor} from '@capacitor/core';


@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  storage: FirebaseStorage;
  userId: string;
  public photo: Photo;
  public photos: Photo[] = [];
  private photoURIs: string[] = [];
  private storageKey = 'photos';
  private permissionsStatus: PermissionStatus = {camera: 'granted', photos: 'granted'};
  private url: string;

  constructor(private firebase: FirebaseApp, private authService: AuthService) {
    this.storage = getStorage(firebase);
    FirebaseAuthentication.addListener('authStateChange', user => {
      if(user) {
        this.userId = this.authService.getUserUID();
      } else {
        this.userId = undefined;
      }
    });
  }



  async writePhotoToFirebase(name: string, city: string): Promise<string> {
    const imgRef = ref(this.storage, name + '_' + city + '.png');
    const uploadResult = await uploadString(imgRef, 'data:image/jpeg;base64,' + this.photo.base64String, StringFormat.DATA_URL);

    console.log('uploadResult', uploadResult.metadata.name);

    this.url = await getDownloadURL(imgRef);
    this.photoURIs.push(this.url);
    this.photo.dataUrl = `data:image/${this.photo.format};base64,${this.photo.base64String}`;
    this.photos.push(this.photo);

    return uploadResult.metadata.name;
   }

   async writePhotoToLocalStorage(name: string, city: string): Promise<void> {
    localStorage.setItem(name + '_' + city + '.png', `data:image/${this.photo.format};base64,${this.photo.base64String}`);
    localStorage.setItem('imgName',name + '_' + city + '.png' );
    }

    async loadPhotoFromLocalStorageType(name: string, city: string): Promise<string> {
    let result;
      if(Capacitor.isNativePlatform()){
      //Native
        result = await this.loadPhotoFromLocalStorageNative(name, city);
      } else {
        //PWA
        result = await this.loadPhotoFromLocalStoragePWA(name, city);
      }

      return result;
    }

    async loadPhotoFromLocalStorageNative(name: string, city: string): Promise<string> {
      const result = await Storage.get({key: name + '_' + city + '.png'});
      return result.value;
    }

   async loadPhotoFromLocalStoragePWA(name: string, city: string): Promise<string> {
    const result = localStorage.getItem(name + '_' + city + '.png');
    return result;
   }

   async fetchPhotoFromFirebase(name: string): Promise<string>{
    let returnValue: string;
    returnValue = '';

    await getDownloadURL(ref(this.storage, name))
      .then((url) => {
        returnValue = url;

     }).catch((error) => {
      console.error('There is no image');
     });

    return returnValue;
   }

  public async takePhoto(storeName, cityName): Promise<void> {
      if(Capacitor.isNativePlatform()){
        await this.takePhotoNative();
        await this.persistPhotoURIs(storeName, cityName);
      } else {
        await this.takePhotoPWA();
        console.log('PWA take photo gelukt');
        console.log('base64', this.photo.base64String);
        await this.writePhotoToLocalStorage(storeName, cityName);
      }
  }

  public async finalSavePhoto(storeName, cityName): Promise<string> {

    const photoName = await this.writePhotoToFirebase(storeName, cityName);
    return photoName;
  }

  private async takePhotoPWA(): Promise<void> {
      this.photo = await Camera.getPhoto({
        quality: 80,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });
  }

  private async takePhotoNative(): Promise<void> {
    if(!this.haveCameraPermission() && ! this.havePhotosPermission()) {
      this.requestPermissions();
    }

    if(!this.haveCameraPermission() && ! this.havePhotosPermission()) {
      return;
    }

    this.photo = await Camera.getPhoto({
      quality: 80,
      source: await this.getCameraSourceNative(),
      resultType: CameraResultType.Base64
    });
  }

private async getCameraSourceNative(): Promise<CameraSource> {
      if (this.permissionsStatus.photos === 'granted' && this.permissionsStatus.camera === 'granted'){
        return CameraSource.Prompt;
      } else if (this.permissionsStatus.photos === 'granted') {
        return CameraSource.Photos;
      } else {
        return CameraSource.Camera;
      }
    }

    private haveCameraPermission(): boolean {
    return this.permissionsStatus.camera === 'granted';
    }

    private havePhotosPermission(): boolean {
    return this.permissionsStatus.photos === 'granted';
    }

  private async loadData(): Promise<void> {
    await this.checkPermissions();
    this.loadPhoto();
  }

  private async persistPhotoURIs(name: string, city: string): Promise<void> {
    await Storage.set({
      key: name + '_' + city + '.png',
      value: `data:image/${this.photo.format};base64,${this.photo.base64String}`
    });
  }

  private async checkPermissions(): Promise<void> {
    try{
      this.permissionsStatus = await Camera.checkPermissions();
    } catch(error){
      console.error('can\'t check permissions');
    }
  }

  private async requestPermissions(): Promise<void> {
    try{
      this.permissionsStatus = await Camera.requestPermissions();
    } catch (error) {
      console.error('can\'t request permissions');
    }
  }
  private loadPhoto() {

  }
}
