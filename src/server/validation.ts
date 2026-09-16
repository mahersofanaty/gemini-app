export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  isValid: boolean;
  errors: ValidationError[];
  data?: T;
}

const GERMAN_PLATE_REGEX = /^[A-ZÄÖÜ]{1,3}-[A-Z]{1,2}\s?[0-9]{1,4}[EH]?$/i;
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GERMAN_PLZ_REGEX = /^[0-9]{5}$/;
const CODE_ZB_I_REGEX = /^[A-Z0-9]{7}$/i;
const BADGE_CODE_REGEX = /^[A-Z0-9]{3}$/i;

export function validateOrderInput(body: any): ValidationResult<any> {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== 'object') {
    return { isValid: false, errors: [{ field: 'body', message: 'Ungültiger Request-Body' }] };
  }

  const { vehicle, securityCodes, customer, reservation, confirmations } = body;

  // 1. Vehicle Validation
  if (!vehicle) {
    errors.push({ field: 'vehicle', message: 'Fahrzeugdaten fehlen vollständig.' });
  } else {
    // License plate
    const plate = (vehicle.licensePlate || vehicle.licensePlateNormalized || '').trim().toUpperCase();
    if (!plate) {
      errors.push({ field: 'vehicle.licensePlate', message: 'Amtliches Kennzeichen ist erforderlich.' });
    } else if (!GERMAN_PLATE_REGEX.test(plate.replace(/\s+/g, ' '))) {
      errors.push({ field: 'vehicle.licensePlate', message: 'Ungültiges deutsches Kennzeichen-Format (z.B. "D-AB 1234").' });
    }

    // VIN / FIN
    if (vehicle.vin) {
      const cleanVin = vehicle.vin.trim().toUpperCase();
      if (!VIN_REGEX.test(cleanVin)) {
        errors.push({ field: 'vehicle.vin', message: 'Die Fahrzeug-Identifikationsnummer (FIN) muss genau 17 Zeichen lang sein (ohne I, O, Q).' });
      }
    } else if (!vehicle.vinNotRequired) {
      // VIN optional if user specifically marked it not required
    }

    // Zulassungsbezirk
    if (!vehicle.registrationDistrict || vehicle.registrationDistrict.trim().length < 2) {
      errors.push({ field: 'vehicle.registrationDistrict', message: 'Zulassungsbezirk ist erforderlich.' });
    }

    // Issue Date ZB I (Must be on or after 2015-01-01)
    if (!vehicle.issueDateZBI) {
      errors.push({ field: 'vehicle.issueDateZBI', message: 'Ausstellungsdatum der ZB I ist erforderlich.' });
    } else {
      const date = new Date(vehicle.issueDateZBI);
      if (isNaN(date.getTime())) {
        errors.push({ field: 'vehicle.issueDateZBI', message: 'Ungültiges Ausstellungsdatum.' });
      } else if (date < new Date('2015-01-01')) {
        errors.push({ field: 'vehicle.issueDateZBI', message: 'Das Fahrzeug kann nur online abgemeldet werden, wenn die Zulassungsbescheinigung nach dem 01.01.2015 ausgestellt wurde.' });
      }
    }
  }

  // 2. Security Codes Validation (Strict)
  if (!securityCodes) {
    errors.push({ field: 'securityCodes', message: 'Sicherheitscodes fehlen vollständig.' });
  } else {
    // ZB I Code (7 alphanumeric)
    const zbiCode = (securityCodes.zbISecurityCode || '').trim().toUpperCase();
    if (!zbiCode) {
      errors.push({ field: 'securityCodes.zbISecurityCode', message: 'Sicherheitscode der ZB I ist erforderlich.' });
    } else if (!CODE_ZB_I_REGEX.test(zbiCode)) {
      errors.push({ field: 'securityCodes.zbISecurityCode', message: 'Der Sicherheitscode der ZB I muss genau 7 Zeichen lang sein (Buchstaben und Ziffern).' });
    }

    const isSinglePlate = securityCodes.singlePlateOnly || vehicle?.plateConfiguration === 'single_rear';

    // Front plate code (if not single plate)
    if (!isSinglePlate) {
      const frontCode = (securityCodes.frontPlateCode || '').trim().toUpperCase();
      if (!frontCode) {
        errors.push({ field: 'securityCodes.frontPlateCode', message: 'Sicherheitscode der vorderen Stempelplakette ist erforderlich.' });
      } else if (!BADGE_CODE_REGEX.test(frontCode)) {
        errors.push({ field: 'securityCodes.frontPlateCode', message: 'Der vordere Plakettencode muss aus genau 3 Zeichen bestehen (z.B. "4X9").' });
      }
    }

    // Rear plate code
    const rearCode = (securityCodes.rearPlateCode || securityCodes.singlePlateCode || '').trim().toUpperCase();
    if (!rearCode) {
      errors.push({ field: 'securityCodes.rearPlateCode', message: 'Sicherheitscode der hinteren Stempelplakette ist erforderlich.' });
    } else if (!BADGE_CODE_REGEX.test(rearCode)) {
      errors.push({ field: 'securityCodes.rearPlateCode', message: 'Der hintere Plakettencode muss aus genau 3 Zeichen bestehen (z.B. "8R2").' });
    }
  }

  // 3. Customer Validation
  if (!customer) {
    errors.push({ field: 'customer', message: 'Kundendaten fehlen vollständig.' });
  } else {
    if (!customer.firstName || customer.firstName.trim().length < 2) {
      errors.push({ field: 'customer.firstName', message: 'Vorname muss mindestens 2 Zeichen enthalten.' });
    }
    if (!customer.lastName || customer.lastName.trim().length < 2) {
      errors.push({ field: 'customer.lastName', message: 'Nachname muss mindestens 2 Zeichen enthalten.' });
    }
    if (!customer.email || !EMAIL_REGEX.test(customer.email.trim())) {
      errors.push({ field: 'customer.email', message: 'Gültige E-Mail-Adresse für die Bescheidzustellung erforderlich.' });
    }
    if (!customer.street || customer.street.trim().length < 2) {
      errors.push({ field: 'customer.street', message: 'Straße ist erforderlich.' });
    }
    if (!customer.houseNumber || customer.houseNumber.trim().length < 1) {
      errors.push({ field: 'customer.houseNumber', message: 'Hausnummer ist erforderlich.' });
    }
    if (!customer.postalCode || !GERMAN_PLZ_REGEX.test(customer.postalCode.trim())) {
      errors.push({ field: 'customer.postalCode', message: 'Postleitzahl muss aus genau 5 Ziffern bestehen.' });
    }
    if (!customer.city || customer.city.trim().length < 2) {
      errors.push({ field: 'customer.city', message: 'Wohnort ist erforderlich.' });
    }
  }

  // 4. Mandatory Confirmations Validation
  if (confirmations) {
    if (!confirmations.confirmDataAccurate) {
      errors.push({ field: 'confirmations.confirmDataAccurate', message: 'Die Bestätigung der Datenrichtigkeit ist gesetzlich vorgeschrieben.' });
    }
    if (!confirmations.confirmPrivacy) {
      errors.push({ field: 'confirmations.confirmPrivacy', message: 'Die Bestätigung der Datenschutzbestimmungen ist erforderlich.' });
    }
    if (!confirmations.confirmAgb) {
      errors.push({ field: 'confirmations.confirmAgb', message: 'Die Annahme der AGB ist erforderlich.' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
