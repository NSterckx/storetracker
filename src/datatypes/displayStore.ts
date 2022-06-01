export interface IDisplayStore {
  name: string;
  city: string;
  image?: string;
  checkOpen: string;
  color?: string;
  key?: string;
}

export class DisplayStore implements IDisplayStore {
  name: string;
  city: string;
  image?: string;
  checkOpen: string;
  color?: string;
  key?: string;

  constructor(obj: IDisplayStore) {
    Object.assign(this, obj);
  }
}
