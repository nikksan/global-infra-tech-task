export default class DataValidator {
  static isAlphaNumericStringOfSize(str: string, min: number, max: number): boolean {
    const regex = /^[a-zA-Z0-9 _@./"'#&+-]*$/;

    return (
      regex.test(str) &&
      str.trim().length >= min &&
      str.length <= max
    );
  }

  static isValidDate(date: Date): boolean {
    return date.toString() !== 'Invalid Date';
  }
}
