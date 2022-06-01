export interface IBusinessHours {
  store: string;
  city: string;
  day: Day;
  openTime: Date;
  closeTime: Date;
  key?: string;
}

export enum Day {
  monday= 'Monday',
  tuesday = 'Tuesday',
  wednesday = 'Wednesday',
  thursday = 'Thursday',
  friday = 'Friday',
  saturday = 'Saturday',
  sunday = 'Sunday'
}

export class BusinessHours implements IBusinessHours {
  store: string;
  city: string;
  day: Day;
  openTime: Date;
  closeTime: Date;
  key?: string;

  constructor(obj: IBusinessHours) {
    Object.assign(this, obj);
  }
}
