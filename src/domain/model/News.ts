import DomainValidationError from '@domain/errors/DomainValidationError';
import IdGenerator from './IdGenerator';
import DataValidator from './DataValidator';

export type ConstructorParams = {
    id?: string
    date?: Date
    title: string
    shortDescription: string
    text: string
}

export default class News {
  private id: string;
  private date: Date;
  private title: string;
  private shortDescription: string;
  private text: string;

  constructor(params: ConstructorParams) {
    this.id = params.id || IdGenerator.generate();

    if (params.date !== undefined) {
      this.validateDate(params.date);
      this.date = params.date;
    } else {
      this.date = new Date();
    }

    this.validateTitle(params.title);
    this.title = params.title;

    this.validateShortDescription(params.shortDescription);
    this.shortDescription = params.shortDescription;

    this.validateText(params.text);
    this.text = params.text;
  }

  getId(): string {
    return this.id;
  }

  getDate(): Date {
    return this.date;
  }

  getTitle(): string {
    return this.title;
  }

  getShortDescription(): string {
    return this.shortDescription;
  }

  getText(): string {
    return this.text;
  }

  changeTitle(newTitle: string): void {
    this.validateTitle(newTitle);

    this.title = newTitle;
  }

  changeShortDescription(newShortDescription: string): void {
    this.validateShortDescription(newShortDescription);

    this.shortDescription = newShortDescription;
  }

  changeText(newText: string): void {
    this.validateText(newText);

    this.text = newText;
  }

  private validateDate(date: Date) {
    if (!DataValidator.isValidDate(date)) {
      throw new DomainValidationError('date', date, 'valid date');
    }
  }

  private validateTitle(title: string) {
    if (!DataValidator.isAlphaNumericStringOfSize(title, 4, 128)) {
      throw new DomainValidationError('title', title, 'alphanumeric string between 4 and 128 symbols');
    }
  }

  private validateShortDescription(shortDescription: string) {
    if (!DataValidator.isAlphaNumericStringOfSize(shortDescription, 4, 256)) {
      throw new DomainValidationError('shortDescription', shortDescription, 'alphanumeric string between 4 and 256 symbols');
    }
  }

  private validateText(text: string) {
    if (!DataValidator.isAlphaNumericStringOfSize(text, 4, 2048)) {
      throw new DomainValidationError('text', text, 'alphanumeric string between 4 and 2048 symbols');
    }
  }
}
