export interface IStore {
  id: number;
  name: string;
  city: string;
  address?: string;
  comment?: string;
  image?: string;
  isPublic: boolean;
  user: string[];
  key?: string;
}

export class Store implements IStore {
  id: number;
  name: string;
  city: string;
  address?: string;
  comment?: string;
  image?: string;
  isPublic: boolean;
  user: string[];
  key?: string;

  constructor(obj: IStore) {
    Object.assign(this, obj);
  }
}
