export function isValidName(name: string): boolean {
    const NAME_PATTERN: RegExp = /^[A-Za-z]+(?:['-][A-Za-z]+)*$/;
    return NAME_PATTERN.test(name);
};

export function isValidEmail(email: string): boolean {
    const EMAIL_PATTERN: RegExp = /^[a-zA-Z0-9](?:[a-zA-Z0-9-.]*[a-zA-Z0-9])?@(?:[a-zA-Z0-9]+\.)+[A-Za-z]+$/;
    return EMAIL_PATTERN.test(email);
};
  

export function passValid(pass: string): boolean {
    const PASSWORD_PATTERN: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#.-]{8,}$/;
    return PASSWORD_PATTERN.test(pass);
};

export function isValidCityStateName(cityName: string): boolean {
    const CITY_NAME_PATTERN: RegExp = /^[A-Za-z]+(?:[ \-'][A-Za-z]+)*$/;
    return CITY_NAME_PATTERN.test(cityName);
};

export function isValidPostalCode(postalCode: string): boolean {
    const POSTAL_CODE_PATTERN: RegExp = /^\d{3} \d{2}$/;
    return POSTAL_CODE_PATTERN.test(postalCode);
};

export function isValidPhoneNumber(phoneNumber: string): boolean {
    const PHONE_NUMBER_PATTERN: RegExp = /^\d{10}$/;
    return PHONE_NUMBER_PATTERN.test(phoneNumber);
};