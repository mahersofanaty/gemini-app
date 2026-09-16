// German License Plate Parser, Normalizer & Zulassungsbezirk resolver

export interface PlateParseResult {
  isValid: boolean;
  normalized: string;
  city: string;
  letters: string;
  numbers: string;
  suffix?: string;
  suggestedDistrict: string;
  errorMessage?: string;
}

// Major German registration districts dictionary (Unterscheidungszeichen -> Zulassungsbezirk)
export const GERMAN_DISTRICTS_MAP: Record<string, string> = {
  // Cities & Districts from User Prompts
  'B': 'Berlin (Landesamt für Bürger- und Ordnungsangelegenheiten)',
  'D': 'Düsseldorf (Landeshauptstadt Düsseldorf, NRW)',
  'ME': 'Kreis Mettmann (Nordrhein-Westfalen)',
  
  // Metropolises & Major Cities
  'M': 'München (Kreisverwaltungsreferat der Landeshauptstadt München, Bayern)',
  'HH': 'Hamburg (Landesbetrieb Verkehr der Freien und Hansestadt Hamburg)',
  'F': 'Frankfurt am Main (Ordnungsamt der Stadt Frankfurt am Main, Hessen)',
  'K': 'Köln (Bürgeramt der Stadt Köln, NRW)',
  'S': 'Stuttgart (Amt für öffentliche Ordnung, Baden-Württemberg)',
  'HB': 'Bremen / Bremerhaven (Bürgeramt Bremen)',
  'H': 'Hannover (Region Hannover, Niedersachsen)',
  'N': 'Nürnberg (Ordnungsamt der Stadt Nürnberg, Bayern)',
  'DO': 'Dortmund (Bürgerdienste der Stadt Dortmund, NRW)',
  'E': 'Essen (Bürgeramt der Stadt Essen, NRW)',
  'L': 'Leipzig (Ordnungsamt der Stadt Leipzig, Sachsen)',
  'DD': 'Dresden (Landeshauptstadt Dresden, Sachsen)',
  'WI': 'Wiesbaden (Landeshauptstadt Wiesbaden, Hessen)',
  'MZ': 'Mainz (Landeshauptstadt Mainz, Rheinland-Pfalz)',
  'BN': 'Bonn (Bundesstadt Bonn, NRW)',
  'MS': 'Münster (Stadt Münster, NRW)',
  'AC': 'Städteregion Aachen (NRW)',
  'BO': 'Bochum (Stadt Bochum, NRW)',
  'W': 'Wuppertal (Stadt Wuppertal, NRW)',
  'BI': 'Bielefeld (Bürgerberatung Bielefeld, NRW)',
  'MA': 'Mannheim (Bürgerdienste Mannheim, Baden-Württemberg)',
  'KA': 'Karlsruhe (Stadtamt Karlsruhe, Baden-Württemberg)',
  'FR': 'Freiburg im Breisgau (Baden-Württemberg)',
  'SB': 'Regionalverband Saarbrücken (Saarland)',
  'KI': 'Kiel (Landeshauptstadt Kiel, Schleswig-Holstein)',
  'HL': 'Lübeck (Hansestadt Lübeck, Schleswig-Holstein)',
  'HRO': 'Rostock (Hanse- und Universitätsstadt Rostock, MV)',
  'SN': 'Schwerin (Landeshauptstadt Schwerin, MV)',
  'EF': 'Erfurt (Landeshauptstadt Erfurt, Thüringen)',
  'MD': 'Magdeburg (Landeshauptstadt Magdeburg, Sachsen-Anhalt)',
  'HAL': 'Halle (Saale) (Stadt Halle, Sachsen-Anhalt)',
  'P': 'Potsdam (Landeshauptstadt Potsdam, Brandenburg)',
  'CB': 'Cottbus (Stadt Cottbus, Brandenburg)',
  'FF': 'Frankfurt (Oder) (Stadt Frankfurt an der Oder, Brandenburg)',
  'R': 'Regensburg (Stadt Regensburg, Bayern)',
  'IN': 'Ingolstadt (Stadt Ingolstadt, Bayern)',
  'A': 'Augsburg (Bürgeramt Augsburg, Bayern)',
  'WÜ': 'Würzburg (Stadt / Landkreis Würzburg, Bayern)',
  'BA': 'Bamberg (Stadt / Landkreis Bamberg, Bayern)',
  'BT': 'Bayreuth (Stadt / Landkreis Bayreuth, Bayern)',
  'FS': 'Landkreis Freising (Bayern)',
  'DAH': 'Landkreis Dachau (Bayern)',
  'FFB': 'Landkreis Fürstenfeldbruck (Bayern)',
  'STA': 'Landkreis Starnberg (Bayern)',
  'LL': 'Landkreis Landsberg am Lech (Bayern)',
  'RO': 'Rosenheim (Stadt / Landkreis Rosenheim, Bayern)',
  'GAP': 'Landkreis Garmisch-Partenkirchen (Bayern)',
  'TÜ': 'Landkreis Tübingen (Baden-Württemberg)',
  'UL': 'Stadt Ulm / Alb-Donau-Kreis (Baden-Württemberg)',
  'HD': 'Heidelberg / Rhein-Neckar-Kreis (Baden-Württemberg)',
  'HN': 'Heilbronn (Stadt / Landkreis Heilbronn, Baden-Württemberg)',
  'PF': 'Pforzheim / Enzkreis (Baden-Württemberg)',
  'BAD': 'Baden-Baden (Stadt Baden-Baden, Baden-Württemberg)',
  'OG': 'Ortenaukreis (Baden-Württemberg)',
  'RA': 'Landkreis Rastatt (Baden-Württemberg)',
  'KN': 'Landkreis Konstanz (Baden-Württemberg)',
  'RW': 'Landkreis Rottweil (Baden-Württemberg)',
  'RW-': 'Landkreis Rottweil (Baden-Württemberg)',
  'BB': 'Landkreis Böblingen (Baden-Württemberg)',
  'ES': 'Landkreis Esslingen (Baden-Württemberg)',
  'GP': 'Landkreis Göppingen (Baden-Württemberg)',
  'LB': 'Landkreis Ludwigsburg (Baden-Württemberg)',
  'WN': 'Rems-Murr-Kreis (Baden-Württemberg)',
  'KÜN': 'Hohenlohekreis (Baden-Württemberg)',
  'SHA': 'Landkreis Schwäbisch Hall (Baden-Württemberg)',
  'AA': 'Ostalbkreis (Baden-Württemberg)',
  'HDH': 'Landkreis Heidenheim (Baden-Württemberg)',
  'BC': 'Landkreis Biberach (Baden-Württemberg)',
  'RV': 'Landkreis Ravensburg (Baden-Württemberg)',
  'FN': 'Bodenseekreis (Baden-Württemberg)',
  'SIG': 'Landkreis Sigmaringen (Baden-Württemberg)',
  'TUT': 'Landkreis Tuttlingen (Baden-Württemberg)',
  'VS': 'Schwarzwald-Baar-Kreis (Baden-Württemberg)',
  'WT': 'Landkreis Waldshut (Baden-Württemberg)',
  'LÖ': 'Landkreis Lörrach (Baden-Württemberg)',
  'EM': 'Landkreis Emmendingen (Baden-Württemberg)',
  'CW': 'Landkreis Calw (Baden-Württemberg)',
  'FDS': 'Landkreis Freudenstadt (Baden-Württemberg)',
  'RÜG': 'Landkreis Vorpommern-Rügen (Mecklenburg-Vorpommern)',
  'PI': 'Kreis Pinneberg (Schleswig-Holstein)',
  'SE': 'Kreis Segeberg (Schleswig-Holstein)',
  'OD': 'Kreis Stormarn (Schleswig-Holstein)',
  'RZ': 'Kreis Herzogtum Lauenburg (Schleswig-Holstein)',
  'OH': 'Kreis Ostholstein (Schleswig-Holstein)',
  'PLÖ': 'Kreis Plön (Schleswig-Holstein)',
  'RD': 'Kreis Rendsburg-Eckernförde (Schleswig-Holstein)',
  'SL': 'Kreis Schleswig-Flensburg (Schleswig-Holstein)',
  'NF': 'Kreis Nordfriesland (Schleswig-Holstein)',
  'HEI': 'Kreis Dithmarschen (Schleswig-Holstein)',
  'IZ': 'Kreis Steinburg (Schleswig-Holstein)',
};

/**
 * Normalizes and validates German license plate inputs.
 * Accepts formats such as:
 * - "D-AB 123"
 * - "ME-XY 1234"
 * - "B-AB 123"
 * - "d ab 123"
 * - "me-xy1234"
 * - "b ab 123 e" (Electric)
 * - "m-xy 456 h" (Historical)
 */
export function parseAndNormalizePlate(rawInput: string): PlateParseResult {
  if (!rawInput || !rawInput.trim()) {
    return {
      isValid: false,
      normalized: '',
      city: '',
      letters: '',
      numbers: '',
      suggestedDistrict: '',
      errorMessage: 'Bitte geben Sie ein amtliches deutsches Kennzeichen ein.',
    };
  }

  // 1. Clean and normalize: uppercase, replace multiple whitespace / dashes
  let cleaned = rawInput.trim().toUpperCase();
  // Standardize hyphens
  cleaned = cleaned.replace(/[\u2010-\u2015\u2212]/g, '-');

  // Check for optional trailing badge suffix 'E' or 'H'
  let suffix: string | undefined = undefined;
  const suffixMatch = cleaned.match(/[\s\-]+(E|H)$/);
  if (suffixMatch) {
    suffix = suffixMatch[1];
    cleaned = cleaned.replace(/[\s\-]+(E|H)$/, '');
  }

  // Try matching various common German plate input representations:
  // German plate structure:
  // 1-3 letters (Unterscheidungszeichen: A-Z, Ä, Ö, Ü)
  // 1-2 letters (Erkennungsbuchstaben: A-Z)
  // 1-4 digits (Erkennungsnummer: 1-9999)

  // Pattern 1: City-Letters Numbers (e.g. "D-AB 123", "ME-XY 1234", "B-AB 123")
  // Pattern 2: City Letters Numbers (e.g. "D AB 123", "ME XY 1234", "B AB 123")
  // Pattern 3: City-LettersNumbers (e.g. "D-AB123", "ME-XY1234")
  // Pattern 4: CityLettersNumbers with space (e.g. "DAB 123" -> D-AB 123, "MEXY 1234" -> ME-XY 1234)

  const standardRegex = /^([A-ZÄÖÜ]{1,3})[\s\-]+([A-Z]{1,2})[\s\-]*([1-9][0-9]{0,3})$/;
  const dashedCompactRegex = /^([A-ZÄÖÜ]{1,3})-([A-Z]{1,2})([1-9][0-9]{0,3})$/;
  const spaceCompactRegex = /^([A-ZÄÖÜ]{1,3})[\s]+([A-Z]{1,2})([1-9][0-9]{0,3})$/;

  let match = cleaned.match(standardRegex) || cleaned.match(dashedCompactRegex) || cleaned.match(spaceCompactRegex);

  // If not matched yet, try smart split where city is known or 1-3 chars
  if (!match) {
    // Try matching if user wrote e.g. "D-AB-123"
    const tripleDashRegex = /^([A-ZÄÖÜ]{1,3})-([A-Z]{1,2})-([1-9][0-9]{0,3})$/;
    match = cleaned.match(tripleDashRegex);
  }

  if (!match) {
    // Check if user just typed all connected e.g. "DAB123"
    const connectedRegex = /^([A-ZÄÖÜ]{1,3})([A-Z]{1,2})([1-9][0-9]{0,3})$/;
    const connectedMatch = cleaned.match(connectedRegex);
    if (connectedMatch) {
      // Check if the prefix is in known districts
      const candidateCity1 = connectedMatch[1];
      const candidateCity2 = cleaned.slice(0, 2);
      const candidateCity3 = cleaned.slice(0, 3);
      
      if (GERMAN_DISTRICTS_MAP[candidateCity3]) {
        const rest = cleaned.slice(3);
        const restMatch = rest.match(/^([A-Z]{1,2})([1-9][0-9]{0,3})$/);
        if (restMatch) {
          match = [cleaned, candidateCity3, restMatch[1], restMatch[2]] as RegExpMatchArray;
        }
      } else if (GERMAN_DISTRICTS_MAP[candidateCity2]) {
        const rest = cleaned.slice(2);
        const restMatch = rest.match(/^([A-Z]{1,2})([1-9][0-9]{0,3})$/);
        if (restMatch) {
          match = [cleaned, candidateCity2, restMatch[1], restMatch[2]] as RegExpMatchArray;
        }
      } else if (GERMAN_DISTRICTS_MAP[candidateCity1]) {
        const rest = cleaned.slice(1);
        const restMatch = rest.match(/^([A-Z]{1,2})([1-9][0-9]{0,3})$/);
        if (restMatch) {
          match = [cleaned, candidateCity1, restMatch[1], restMatch[2]] as RegExpMatchArray;
        }
      }
    }
  }

  if (!match) {
    return {
      isValid: false,
      normalized: cleaned,
      city: '',
      letters: '',
      numbers: '',
      suggestedDistrict: '',
      errorMessage: 'Ungültiges deutsches Kennzeichenformat. Erlaubt sind z.B. "D-AB 123", "ME-XY 1234" oder "B-AB 123".',
    };
  }

  const city = match[1];
  const letters = match[2];
  const numbers = match[3];

  // Letters cannot contain umlauts in the middle part in Germany
  if (/[ÄÖÜ]/.test(letters)) {
    return {
      isValid: false,
      normalized: cleaned,
      city,
      letters,
      numbers,
      suggestedDistrict: '',
      errorMessage: 'Die mittleren Erkennungsbuchstaben dürfen keine Umlaute (Ä, Ö, Ü) enthalten.',
    };
  }

  // Canonical normalized representation: [CITY]-[LETTERS] [NUMBERS] [SUFFIX]
  let normalized = `${city}-${letters} ${numbers}`;
  if (suffix) {
    normalized += ` ${suffix}`;
  }

  // Determine suggested Zulassungsbezirk
  const suggestedDistrict = GERMAN_DISTRICTS_MAP[city] || `Zulassungsbezirk ${city} (Kfz-Zulassungsstelle)`;

  return {
    isValid: true,
    normalized,
    city,
    letters,
    numbers,
    suffix,
    suggestedDistrict,
  };
}

/**
 * Validates German Vehicle Identification Number (FIN / VIN)
 * 17 characters, uppercase alphanumeric excluding I, O, Q
 */
export function validateGermanVIN(vin: string): { isValid: boolean; errorMessage?: string } {
  const cleanVin = vin.trim().toUpperCase();
  if (!cleanVin) {
    return { isValid: false, errorMessage: 'Die Fahrzeug-Identifizierungsnummer ist leer.' };
  }
  if (cleanVin.length !== 17) {
    return { 
      isValid: false, 
      errorMessage: `Die FIN muss genau 17 Zeichen lang sein (aktuell: ${cleanVin.length} Zeichen).` 
    };
  }
  if (/[IOQ]/.test(cleanVin)) {
    return { 
      isValid: false, 
      errorMessage: 'Die Buchstaben I, O und Q sind in einer amtlichen FIN aus Verwechslungsgründen nicht zulässig.' 
    };
  }
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleanVin)) {
    return { 
      isValid: false, 
      errorMessage: 'Die FIN darf nur lateinische Großbuchstaben (ohne I, O, Q) und Ziffern enthalten.' 
    };
  }
  return { isValid: true };
}

/**
 * Validates issue date of Zulassungsbescheinigung Teil I
 * Online deregistration (i-KfZ) is strictly only possible for documents issued since 01.01.2015.
 */
export function validateZBIssueDate(dateStr: string): { isValid: boolean; errorMessage?: string } {
  if (!dateStr) {
    return { isValid: false, errorMessage: 'Bitte geben Sie das Ausstellungsdatum der Zulassungsbescheinigung Teil I an.' };
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { isValid: false, errorMessage: 'Ungültiges Datumsformat.' };
  }
  const minDate = new Date('2015-01-01');
  if (date < minDate) {
    return { 
      isValid: false, 
      errorMessage: 'Die Online-Abmeldung ist nur für Fahrzeuge mit Zulassungsbescheinigung Teil I möglich, die ab dem 01.01.2015 ausgestellt wurden (mit verdecktem Sicherheitscode).' 
    };
  }
  const today = new Date();
  if (date > today) {
    return { isValid: false, errorMessage: 'Das Ausstellungsdatum kann nicht in der Zukunft liegen.' };
  }
  return { isValid: true };
}
