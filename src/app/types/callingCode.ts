export interface ICallingCode {
  country: string;
  countryCodes: string[];
  isoCode2: string;
  isoCode3: string;
}

export class CallingCode implements ICallingCode {
  country: string;
  countryCodes: string[];
  isoCode2: string;
  isoCode3: string;

  constructor(callingCode: ICallingCode) {
    Object.assign(this, callingCode);
  }

  public getFlagEmoji(): string {
    return this.isoCode2
      .toUpperCase()
      .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
  }
}
