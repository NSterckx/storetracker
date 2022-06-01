import {Injectable} from '@angular/core';
import {AuthService} from './auth.service';
import {
  addDoc, collection, Firestore, CollectionReference,
  doc, DocumentReference,
  query, getDocs, updateDoc, where, onSnapshot, Unsubscribe, getDoc
} from '@angular/fire/firestore';

import {Auth} from '@angular/fire/auth';
import {IStore, Store} from '../../datatypes/store';
import {BusinessHours, Day} from '../../datatypes/businessHours';
import {update} from '@angular/fire/database';


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private readonly unsubscribeAll: Unsubscribe[] = [];
  private unsubscribe: Unsubscribe;


  constructor(private authService: AuthService, private fireStore: Firestore, auth: Auth) {
  }

  /**
   * Create a new message in the database.
   *
   * @param channel The channel on which the message must be placed.
   * @param message The message's content.
   */


  // eslint-disable-next-line max-len
  async newStore(name: string, city: string, isPublic: boolean, address?: string, comment?: string, key?: string, image?: string): Promise<void> {

    /*if(key === undefined){
      key = '';
    }*/

    const newUserArray = [];
    newUserArray.push(this.authService.getUserUID());

    const createStore: Store = {
      id: 0,
      user: newUserArray,
      name,
      city,
      address,
      comment,
      isPublic,
      image,
      //key
    };

    await addDoc<Store>(
      this.getCollectionRef<Store>('Stores'),
      createStore
    );

  }

  async newBusinessHours(name: string, city: string, day: Day, startDate: Date, endDate: Date ){

    const createBusinessHours: BusinessHours = {
      store: name,
      city,
      day,
      openTime: startDate,
      closeTime: endDate
    };


    await addDoc<BusinessHours>(
      this.getCollectionRef<BusinessHours>('BusinessHours'),
      createBusinessHours
    );
  }




  async retrievePublicStoresInRealTime(observer: ((stores: Store[]) => void)): Promise<Unsubscribe> {
    const resultToStoreTransform = x => observer(x.docs.map(d => ({...d.data(), key: d.id})));

    const unsubscribe = onSnapshot<Store>(
      query<Store>(
        this.getCollectionRef('Stores'),
        // Sort de messages by publication date, this is required because, by default, they are ordered by the ASCII values
        // of the characters that comprise the uuid.
        where('isPublic', '==', true)
      ),
      resultToStoreTransform
    );
    this.unsubscribeAll.push(unsubscribe);
    return unsubscribe;

  }

  // eslint-disable-next-line max-len
  async retrieveBusinessHoursInRealTime(name: string, city: string, observer: ((businessHours: BusinessHours[]) => void)): Promise<Unsubscribe> {
    const resultToHoursTransform = x => observer(x.docs.map(d => ({...d.data(), key: d.id})));

    const unsubscribe = onSnapshot<BusinessHours>(
      query<BusinessHours>(
        this.getCollectionRef('BusinessHours'),
        where('store', '==', name),
        where('city', '==', city)
      ),
      resultToHoursTransform
    );
    this.unsubscribeAll.push(unsubscribe);
    return unsubscribe;
  }


  async retrievePrivateStoresInRealTime(observer: ((stores: Store[]) => void)): Promise<Unsubscribe> {

    const resultToStoreTransform = x => observer(x.docs.map(d => ({...d.data(), key: d.id})));

    const unsubscribe = onSnapshot<Store>(
      query<Store>(
        this.getCollectionRef('Stores'),
        where('user', 'array-contains', this.authService.getUserUID())
      ),
      resultToStoreTransform
    );
    this.unsubscribeAll.push(unsubscribe);
    return unsubscribe;
  }

  async retrieveStoreInRealTime(name: string, city: string, observer: ((store: Store[]) => void)): Promise<Unsubscribe>{
    const resultToStoreTransform = x => observer(x.docs.map(d => ({...d.data(), key: d.id})));

    const unsubscribe = onSnapshot<Store>(
      query<Store>(
        this.getCollectionRef('Stores'),
        where('name', '==',name),
        where('city','==',city)
      ),
      resultToStoreTransform
    );
    this.unsubscribeAll.push(unsubscribe);
    return unsubscribe;
  }

  async retrievePublicStoresAsSnapshot(): Promise<Store[]> {
    const results = await getDocs<Store>(
      query<Store>(
        this.getCollectionRef('Stores'),

        where('isPublic', '==', true)

      )
    );
    return results
      .docs // Retrieve the documents, this is the same data that is returned by the getDoc method.
      .map(d => ({...d.data(), key: d.id}));
  }





  async retrievePrivateStoresAsSnapshot(): Promise<Store[]> {
    const results = await getDocs<Store>(
      query<Store>(
        this.getCollectionRef('Stores'),

        where('user', 'array-contains', this.authService.getUserUID())

      )
    );
    return results
      .docs // Retrieve the documents, this is the same data that is returned by the getDoc method.
      .map(d => ({...d.data(), key: d.id}));
  }

  async retrieveBusinessHoursAsSnapshot(name: string, city: string): Promise<BusinessHours[]> {
    const results = await getDocs<BusinessHours>(
      query<BusinessHours>(
        this.getCollectionRef('BusinessHours'),
        where('store', '==', name),
        where('city', '==', city)
      )
    );

    return results
      .docs // Retrieve the documents, this is the same data that is returned by the getDoc method.
      .map(d => ({...d.data(), key: d.id}));
  }

  async retrieveStoreDetail(name: string, city: string): Promise<Store[]>{
    const results = await getDocs<Store>(
      query<Store>(
        this.getCollectionRef('Stores'),
        where('name', '==', name ),
        where('city','==', city)
      )
    );

    return results
      .docs // Retrieve the documents, this is the same data that is returned by the getDoc method.
      .map(d => ({...d.data(), key: d.id}));
  }


  public async addUserToStore(key: string) {
    // get current users
    let updateStore: Store;
    await this.retrieveStoreAsSnapshot('Stores', key).then(store => {
      console.log('store', store);
      updateStore = store;

      if (updateStore.user.filter(x => x === this.authService.getUserUID()).length === 0) {
        console.log('store added to private list of user');
        updateStore.user.push(this.authService.getUserUID());
      } else {
        console.log('already registered to store');
      }
    });

    await this.updateStore('Stores', key, updateStore);
  }

    public async removeFromPrivate(key: string): Promise<void> {
      //get current users
      let updateStore: Store;
      await this.retrieveStoreAsSnapshot('Stores', key).then(store => {
        console.log('store', store);
        updateStore = store;

        if(updateStore.user.filter(x => x === this.authService.getUserUID()).length === 1){
          console.log('user removed from user list');
          updateStore.user = updateStore.user.filter(x => x !== this.authService.getUserUID());
        } else {
          console.log('could not remove user as user did not exist... strange');
        }

      });
      await this.updateStore('Stores', key, updateStore);

    }




  /*
  async updateStore(updateStore: IStore): Promise<void> {
    let stores: Store[];

    this.unsubscribe = await this.retrieveStoreInRealTime(updateStore.key, updateStore.city, b => stores = b);
    await this.retrieveStoreDetail(updateStore.name, updateStore.city);

    const store = stores[0];

    if(store === undefined) {
      console.error('Trying to update a nonexistent store');
      return;
    } else {

      const results = await getDocs<Store>(
        query<Store>(
          this.getCollectionRef('Store'),
          where('name', '==', store.name ),
          where('city','==', store.city)
        )
      );

      const storeRef = results[0];
      const test = this.getDocumentRef(storeRef, updateStore.name, updateStore.city);
      console.log('results', test);

      await updateDoc(test, {
        name: updateStore.name,
        city: updateStore.city,
        comment: updateStore.name,
        address: updateStore.address,
        isPublic: updateStore.isPublic
      });
    }


  }
*/
/*
  async createChannel(name, isPublicChannel, users: string[] = []): Promise<void> {
    const newChannel: Channel = {
      name,
      isPublicChannel,
      owner: this.authService.getUserUID(),
      users: [this.authService.getUserUID()].concat(...users)
    };
    await addDoc<Channel>(
      this.getCollectionRef<Channel>('Channels'),
      newChannel
    );
  }
*/

  /**
   * Retrieve a collection of messages, the messages are returned once, they won't be updated when the data
   * in the database changes.
   *
   * @param channel The channel that contains the message.
   */
  /*
  async retrieveMessagesAsSnapshot(channel: string): Promise<Message[]> {
    const results = await getDocs<Message>(
      query<Message>(
        this.getCollectionRef(channel),
        // Sort de messages by publication date, this is required because, by default, they are ordered by the ASCII values
        // of the characters that comprise the uuid.
        orderBy('date')
        // It is impossible to filter on 2 or more columns without an index.
        // If this is required, write the query, then open the developer console,
        // and click on the link in the error message. This will create an index on
        // combination of columns. After the index is done building, the query will work.
        // ,where('user', '==', this.authService.getUserUID())
      )
    );
    return results
      .docs // Retrieve the documents, this is the same data that is returned by the getDoc method.
      .map(d => ({...d.data(), key: d.id}));
  }
*/
  /**
   * Retrieve a single message, the message is returned once, it won't be updated when the data
   * in the database changes.
   *
   * @param channel The channel that contains the message.
   * @param id      The id of the message.
   */
  /*
  async retrieveMessageAsSnapshot(channel, id): Promise<Message> {
    const result = await getDoc<Message>(
      this.getDocumentRef(channel, id)
    );
    return {
      ...result.data(),     // This method retrieves the actual data in the object.
      key: result.id        // The id isn't included in the message data, so it's added here.
    };
  }
*/
  /**
   * Retrieve all users whose name matches the given searchvalue.
   *
   * @param name
   */
  /*
  async retrieveMatchingUsersAsSnapshop(name: string): Promise<Profile[]> {
    console.log(name);
    const results = await getDocs<Profile>(
      query<Profile>(
        this.getCollectionRef<Profile>('profiles'),
        where('name', '>=', name)
      )
    );
    return results.docs.map(d => d.data()).filter(d => d.id !== this.authService.getUserUID());
  }
*/
  /**
   * Retrieve messages in real-time, the observer is executed on every change in the data.
   *
   * @param channel  The name of the channel for which the messages must be retrieved.
   * @param observer A function that does something with the messages that were received from the server.
   */
  /*
  async retrieveMessagesInRealTime(channel: string, observer: ((messages: Message[]) => void)): Promise<Unsubscribe> {
    // Transform the resulting snapshot into an array of message objects, than call the received observer on this data.
    const resultToMessageTransform = x => observer(x.docs.map(d => ({...d.data(), key: d.id})));

    const unsubscribe = onSnapshot<Message>(
      query<Message>(
        this.getCollectionRef(channel),
        // Sort de messages by publication date, this is required because, by default, they are ordered by the ASCII values
        // of the characters that comprise the uuid.
        orderBy('date')
      ),
      resultToMessageTransform
    );
    this.unsubscribeAll.push(unsubscribe);
    return unsubscribe;
  }
*/
  /**
   * Retrieve a message in real-time, the observer is executed on every change in the data.
   *
   * @param channel  The name of the channel for which the messages must be retrieved.
   * @param id       The id of the message that must be retrieved.
   * @param observer A function that does something with the messages that were received from the server.
   */
  /*
  async retrieveMessageInRealTime(channel: string, id: string, observer: ((messages: Message) => void)): Promise<void> {
    // Transform the resulting snapshot into a message object, than call the received observer on this data.
    const resultToMessageTransform = x => observer({...x.data(), key: x.id});

    onSnapshot<Message>(
      this.getDocumentRef(channel, id),
      resultToMessageTransform
    );
  }
*/
  /**
   * Delete a specific message.
   *
   * @param channel   The channel that contains the message.
   * @param id The id of the message that is to be deleted.
   */
  /*
  async deleteMessage(channel: string, id: string): Promise<void> {
    await deleteDoc(this.getDocumentRef(channel, id));
  }
*/
  /**
   * Update an existing message with new data.
   *
   * @param channel The channel that contains the message.
   * @param id      The id of the message that is to be updated.
   * @param msg     The new data.
   */
  /*
  async updateMessage(channel: string, id: string, msg: Message): Promise<void> {
    // Note that the key is set to undefined.
    // There is no point in including it in the data because this would mean it is
    // saved twice, once in the document, and once as the document identifier.
    delete msg.key;
    await updateDoc(this.getDocumentRef(channel, id), msg);
  }

  /**
   * Retrieve a array containing all the channels in the chat app.
   *
   * @param observer A function that does something with the channels on each change.
   */

  /*
  async getPublicChannelListInRealTime(observer: ((channels: Channel[]) => void)): Promise<Unsubscribe> {
    const resultToChannelTransform = x => observer(x.docs.map(d => ({...d.data(), key: d.id})));

    const unsubscribe = onSnapshot<Channel>(
      query<Channel>(
        this.getCollectionRef('Channels'),
        where('isPublicChannel', '==', true)
      ),
      resultToChannelTransform
    );
    this.unsubscribeAll.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Retrieve a array containing all the channels that the current user has been added to.
   *
   * @param observer A function that does something with the channels on each change.
   */
  /*
  async getMyChannelListInRealTime(observer: ((channels: Channel[]) => void)): Promise<Unsubscribe> {
    const resultToChannelTransform = x => observer(x.docs.map(d => ({...d.data(), key: d.id})));

    const unsubscribe = onSnapshot<Channel>(
      query<Channel>(
        this.getCollectionRef('Channels'),
        where('users', 'array-contains', this.authService.getUserUID())
      ),
      resultToChannelTransform
    );
    this.unsubscribeAll.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Check if this is the first time that the user logs in.
   *
   * @private
   */

  /*
  private async isFirstLogIn(): Promise<boolean> {
    const result = await getDocs<Profile>(
      query<Profile>(
        this.getCollectionRef('profiles'),
        where('id', '==', this.authService.getUserUID())
      )
    );

    return result.docs.length === 0;
  }

  /**
   * If it's the first time the user logs in, a profile will be created.
   *
   * @private
   */
  /*
  private async handleLogIn(): Promise<void> {
    const isFirstLogIn = await this.isFirstLogIn();
    if (!isFirstLogIn) {
      return;
    }

    const newProfile: Profile = {
      name: this.authService.getDisplayName(),
      id: this.authService.getUserUID(),
      email: this.authService.getEmail(),
      profilePhoto: this.authService.getProfilePic()
    };

    await addDoc<Profile>(
      this.getCollectionRef<Profile>('profiles'),
      newProfile
    );
  }
*/

//Uit les
  async retrieveStoreAsSnapshot(channel, id): Promise<Store> {
    const result = await getDoc<Store>(
      this.getDocumentRef('Stores', id)
    );

    return {
      ...result.data(),     // This method retrieves the actual data in the object.
      key: result.id        // The id isn't included in the message data, so it's added here.
    };
  }

//uit les
  async updateStore(channel: string, id: string, updateStore: Store): Promise<void> {
    await updateDoc(this.getDocumentRef('Stores', id), updateStore);
  }

  async updateBusinessHours(channel: string, id: string, updateBusinessHours: BusinessHours): Promise<void>{
    //console.log('updateBusinessHours', updateBusinessHours);
    await updateDoc(this.getDocumentRef('BusinessHours', id), updateBusinessHours);
  }



  /**
   * Retrieve a reference to a specific collection, this is required to retrieve data in that collection.
   * The type of the reference (<T>) can be set to the type of object that is stored in the collection.
   *
   * @param collectionName The name of the collection.
   * @private
   */




  private getCollectionRef<T>(collectionName: string): CollectionReference<T> {
    return collection(this.fireStore, collectionName) as CollectionReference<T>;
  }

  /**
   * Retrieve a reference to a specific document in a specific collection, this is required to perform read, update and
   * delete operations on the data in that collection. The type of the reference (<T>) can be set to the type of object
   * that is stored in the document.
   *
   * @param collectionName The name of the collection.
   * @param id             The id of the document to which the reference points.
   * @private
   */
  private getDocumentRef<T>(collectionName: string, id: string): DocumentReference<T> {
    return doc(this.fireStore, `${collectionName}/${id}`) as DocumentReference<T>;
  }


}
