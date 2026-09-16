import { db } from '../../db/index.ts';
import { authorities } from '../../db/schema.ts';
import { eq, or, sql } from 'drizzle-orm';
import { AuthorityConfig } from './types.ts';

/**
 * Standard Catalog of German Zulassungsbehörden across federal states.
 * Used for initial database seeding and fallback resolution.
 */
export const DEFAULT_AUTHORITIES: Omit<AuthorityConfig, 'id'>[] = [
  {
    authorityId: 'DE-BY-MUC',
    name: 'Kreisverwaltungsreferat (KVR) München - Kraftfahrzeugzulassung',
    state: 'Bayern',
    city: 'München',
    postalCodes: '80331,80333,80335,80336,80337,80339,80469,80538,80539,80634,80636,80637,80638,80639,80686,80687,80689,80796,80797,80798,80799,80801,80802,80803,80804,80805,80807,80809,80933,80935,80937,80939,80992,80993,80995,80997,80999,81241,81243,81245,81247,81249,81369,81371,81373,81375,81377,81379,81475,81476,81477,81479,81539,81541,81543,81545,81547,81549,81667,81669,81671,81673,81675,81677,81679,81735,81737,81739,81825,81827,81829,81925,81927,81929',
    ikfzEndpoint: null,
    integrationType: 'mock',
    active: true,
    districtCodes: 'M,M-STADT',
    contactEmail: 'kfz-zulassung.kvr@muenchen.de',
    contactPhone: '+49 89 233-96000',
    supportsReservation: true,
  },
  {
    authorityId: 'DE-BE-BER',
    name: 'Landesamt für Bürger- und Ordnungsangelegenheiten (LABO) Berlin',
    state: 'Berlin',
    city: 'Berlin',
    postalCodes: '10115,10117,10119,10178,10179,10243,10245,10247,10249,10315,10317,10318,10319,10365,10367,10369,10405,10407,10409,10435,10437,10439,10551,10553,10555,10557,10559,10585,10587,10589,10623,10625,10627,10629,10707,10709,10711,10713,10715,10717,10719,10777,10779,10781,10783,10785,10787,10789,10823,10825,10827,10829,12043,12045,12047,12049,12051,12053,12055,12057,12059,12099,12101,12103,12105,12107,12109,12157,12159,12161,12163,12165,12167,12169,12203,12205,12207,12209,12247,12249,12277,12279,12305,12307,12309,12347,12349,12351,12353,12355,12357,12359,12435,12437,12439,12459,12487,12489,12524,12526,12527,12555,12557,12559,12587,12589,12619,12621,12623,12627,12629,12679,12681,12683,12685,12687,12689,13051,13053,13055,13057,13059,13086,13088,13089,13125,13127,13129,13156,13158,13159,13187,13189,13347,13349,13351,13353,13355,13357,13359,13403,13405,13407,13409,13435,13437,13439,13465,13467,13469,13503,13505,13507,13509,13581,13583,13585,13587,13589,13591,13593,13595,13597,13599,13627,13629',
    ikfzEndpoint: null,
    integrationType: 'mock',
    active: true,
    districtCodes: 'B',
    contactEmail: 'post.kfz-zulassung@labo.berlin.de',
    contactPhone: '+49 30 90269-3300',
    supportsReservation: true,
  },
  {
    authorityId: 'DE-NW-DUS',
    name: 'Straßenverkehrsamt Düsseldorf - Kfz-Zulassungsstelle',
    state: 'Nordrhein-Westfalen',
    city: 'Düsseldorf',
    postalCodes: '40210,40211,40212,40213,40215,40217,40219,40221,40223,40225,40227,40229,40231,40233,40235,40237,40239,40468,40470,40472,40474,40476,40477,40479,40489,40545,40547,40549,40589,40591,40593,40595,40597,40599,40625,40627,40629',
    ikfzEndpoint: 'https://api.duesseldorf.de/ikfz/stage4/v1',
    integrationType: 'production_api',
    active: true,
    districtCodes: 'D',
    contactEmail: 'zulassung@duesseldorf.de',
    contactPhone: '+49 211 899-1',
    supportsReservation: true,
  },
  {
    authorityId: 'DE-NW-KOL',
    name: 'Stadt Köln - Kundenzentrum Kfz-Zulassung',
    state: 'Nordrhein-Westfalen',
    city: 'Köln',
    postalCodes: '50667,50668,50670,50672,50674,50676,50677,50678,50679,50733,50735,50737,50739,50765,50767,50769,50823,50825,50827,50829,50858,50859,50931,50933,50935,50937,50939,50968,50969,50996,50997,50999,51061,51063,51065,51067,51069,51103,51105,51107,51109,51143,51145,51147,51149',
    ikfzEndpoint: null,
    integrationType: 'portal_manual', // Manual portal processing
    active: true,
    districtCodes: 'K',
    contactEmail: 'kfz-zulassung@stadt-koeln.de',
    contactPhone: '+49 221 221-0',
    supportsReservation: true,
  },
  {
    authorityId: 'DE-HH-HAM',
    name: 'Landesbetrieb Verkehr (LBV) Hamburg',
    state: 'Hamburg',
    city: 'Hamburg',
    postalCodes: '20095,20097,20099,20144,20146,20148,20149,20249,20251,20253,20255,20257,20259,20354,20355,20357,20359,20457,20459,20535,20537,20539,21029,21031,21033,21035,21037,21039,21073,21075,21077,21079,21107,21109,21129,21147,21149,22041,22043,22045,22047,22049,22081,22083,22085,22087,22089,22111,22113,22115,22117,22119,22143,22145,22147,22149,22159,22175,22177,22179,22297,22299,22301,22303,22305,22307,22309,22335,22337,22339,22359,22391,22393,22395,22397,22399,22415,22417,22419,22453,22455,22457,22459,22523,22525,22527,22529,22547,22549,22559,22587,22589,22605,22607,22609,22761,22763,22765,22767,22769',
    ikfzEndpoint: 'https://lbv-gateway.hamburg.de/ikfz/v4',
    integrationType: 'production_api',
    active: true,
    districtCodes: 'HH',
    contactEmail: 'lbv@hamburg.de',
    contactPhone: '+49 40 42858-0',
    supportsReservation: true,
  },
  {
    authorityId: 'DE-HE-FRA',
    name: 'Ordnungsamt Frankfurt am Main - Kfz-Zulassung',
    state: 'Hessen',
    city: 'Frankfurt am Main',
    postalCodes: '60306,60308,60310,60311,60313,60314,60316,60318,60320,60322,60323,60325,60326,60327,60329,60385,60386,60388,60389,60431,60433,60435,60437,60438,60439,60486,60487,60488,60489,60528,60529,60549,60594,60596,60598,60599,65929,65931,65933,65934,65936',
    ikfzEndpoint: null,
    integrationType: 'mock',
    active: true,
    districtCodes: 'F',
    contactEmail: 'kfz-zulassung@stadt-frankfurt.de',
    contactPhone: '+49 69 212-42222',
    supportsReservation: true,
  },
  {
    authorityId: 'DE-BW-STU',
    name: 'Landeshauptstadt Stuttgart - Kfz-Zulassungsstelle',
    state: 'Baden-Württemberg',
    city: 'Stuttgart',
    postalCodes: '70173,70174,70176,70178,70180,70182,70184,70186,70188,70190,70191,70192,70193,70195,70197,70199,70327,70329,70372,70374,70378,70435,70437,70439,70469,70499,70563,70565,70567,70569,70597,70599,70619,70629',
    ikfzEndpoint: null,
    integrationType: 'mock',
    active: true,
    districtCodes: 'S',
    contactEmail: 'kfz-zulassungsstelle@stuttgart.de',
    contactPhone: '+49 711 216-98200',
    supportsReservation: true,
  },
  {
    authorityId: 'DE-SN-DRE',
    name: 'Landeshauptstadt Dresden - Kfz-Zulassungsbehörde',
    state: 'Sachsen',
    city: 'Dresden',
    postalCodes: '01067,01069,01097,01099,01108,01109,01127,01129,01139,01156,01157,01159,01169,01187,01189,01217,01219,01237,01239,01257,01259,01277,01279,01307,01309,01324,01326,01328,01465',
    ikfzEndpoint: null,
    integrationType: 'mock',
    active: true,
    districtCodes: 'DD',
    contactEmail: 'kfz-zulassung@dresden.de',
    contactPhone: '+49 351 488-8044',
    supportsReservation: true,
  },
  {
    authorityId: 'DE-NI-HAN',
    name: 'Region Hannover - Team Kfz-Zulassungsangelegenheiten',
    state: 'Niedersachsen',
    city: 'Hannover',
    postalCodes: '30159,30161,30163,30165,30167,30169,30171,30173,30175,30177,30179,30419,30449,30451,30453,30455,30457,30459,30519,30521,30539,30559,30625,30627,30629,30655,30657,30659,30669',
    ikfzEndpoint: null,
    integrationType: 'portal_manual',
    active: true,
    districtCodes: 'H',
    contactEmail: 'kfz-zulassung@region-hannover.de',
    contactPhone: '+49 511 616-21744',
    supportsReservation: true,
  },
  {
    authorityId: 'DE-TH-RUR',
    name: 'Landkreis Saale-Holzland-Kreis (Offline/Nicht angebunden)',
    state: 'Thüringen',
    city: 'Eisenberg',
    postalCodes: '07607,07613,07616',
    ikfzEndpoint: null,
    integrationType: 'unsupported', // Explicitly unsupported authority
    active: true,
    districtCodes: 'SHK',
    contactEmail: 'zulassung@saale-holzland.de',
    contactPhone: '+49 36691 70-0',
    supportsReservation: false,
  }
];

let isSeeded = false;

/**
 * Seeds default authorities into the database if the table is empty.
 */
export async function ensureDefaultAuthoritiesSeeded(): Promise<void> {
  if (isSeeded) return;
  try {
    const existing = await db.select({ count: sql<number>`count(*)` }).from(authorities);
    const count = Number(existing[0]?.count || 0);

    if (count === 0) {
      console.log('[AuthorityResolver] Seeding default Zulassungsbehörden...');
      for (const auth of DEFAULT_AUTHORITIES) {
        await db.insert(authorities).values(auth).onConflictDoNothing();
      }
      console.log(`[AuthorityResolver] Seeded ${DEFAULT_AUTHORITIES.length} authorities.`);
    }
    isSeeded = true;
  } catch (err) {
    console.warn('[AuthorityResolver] Could not seed authorities into database:', err);
  }
}

/**
 * Normalizes a license plate or district string to extract prefix:
 * e.g. "M-AB 1234" -> "M"
 *      "HH-XY 999" -> "HH"
 *      "München" -> "München"
 */
export function extractDistrictPrefix(plateOrDistrict: string): string {
  if (!plateOrDistrict) return '';
  const trimmed = plateOrDistrict.trim().toUpperCase();

  // If input is e.g. "D-AB 123" or "D AB 123"
  const match = trimmed.match(/^([A-ZÄÖÜ]{1,3})[- \t]/);
  if (match) {
    return match[1];
  }

  // If input is single district prefix e.g. "M" or "HH"
  if (/^[A-ZÄÖÜ]{1,3}$/.test(trimmed)) {
    return trimmed;
  }

  return plateOrDistrict.trim();
}

export interface AuthorityResolutionResult {
  authority: AuthorityConfig | null;
  supported: boolean;
  requiresManualReview: boolean;
  reason?: string;
}

/**
 * Determines the responsible authority based on vehicle registration district,
 * license plate prefix, and customer postal code.
 * 
 * If no supported integration exists:
 * status = MANUAL_REVIEW (requiresManualReview: true)
 */
export async function determineAuthorityForDistrict(
  districtOrPlate: string,
  postalCode?: string
): Promise<AuthorityResolutionResult> {
  await ensureDefaultAuthoritiesSeeded();

  const districtPrefix = extractDistrictPrefix(districtOrPlate);
  const searchPattern = `%${districtPrefix}%`;
  const cleanDistrict = districtOrPlate.trim();

  try {
    // 1. Query by district code or city name from database
    const rows = await db
      .select()
      .from(authorities)
      .where(
        or(
          sql`LOWER(${authorities.districtCodes}) LIKE LOWER(${searchPattern})`,
          sql`LOWER(${authorities.city}) = LOWER(${cleanDistrict})`,
          sql`LOWER(${authorities.name}) LIKE LOWER(${'%' + cleanDistrict + '%'})`
        )
      )
      .limit(1);

    let authRecord: AuthorityConfig | null = null;

    if (rows.length > 0) {
      const r = rows[0];
      authRecord = {
        id: r.id,
        authorityId: r.authorityId,
        name: r.name,
        state: r.state,
        city: r.city,
        postalCodes: r.postalCodes,
        ikfzEndpoint: r.ikfzEndpoint,
        integrationType: r.integrationType as any,
        active: r.active,
        districtCodes: r.districtCodes,
        contactEmail: r.contactEmail,
        contactPhone: r.contactPhone,
        supportsReservation: r.supportsReservation,
      };
    } else {
      // 2. Try matching from default in-memory list
      const foundInCatalog = DEFAULT_AUTHORITIES.find((a) => {
        const codes = a.districtCodes.split(',').map((c) => c.trim().toUpperCase());
        return (
          codes.includes(districtPrefix.toUpperCase()) ||
          a.city.toLowerCase() === cleanDistrict.toLowerCase() ||
          (postalCode && a.postalCodes.includes(postalCode.trim()))
        );
      });

      if (foundInCatalog) {
        authRecord = { ...foundInCatalog };
      }
    }

    // 3. Evaluate support status
    if (!authRecord) {
      return {
        authority: null,
        supported: false,
        requiresManualReview: true,
        reason: `Für den Zulassungsbezirk "${districtOrPlate}" konnte keine autorisierte Zulassungsbehörde automatisch ermittelt werden. Der Vorgang erfordert manuelle Prüfung.`,
      };
    }

    if (!authRecord.active) {
      return {
        authority: authRecord,
        supported: false,
        requiresManualReview: true,
        reason: `Die Zulassungsbehörde ${authRecord.name} ist vorübergehend deaktiviert. Der Vorgang wird manuell bearbeitet.`,
      };
    }

    if (authRecord.integrationType === 'unsupported') {
      return {
        authority: authRecord,
        supported: false,
        requiresManualReview: true,
        reason: `Für die Behörde ${authRecord.name} existiert keine automatisierte i-KfZ Anbindung. Manuelle Bearbeitung erforderlich.`,
      };
    }

    if (authRecord.integrationType === 'portal_manual') {
      return {
        authority: authRecord,
        supported: false,
        requiresManualReview: true,
        reason: `Behörde ${authRecord.name} unterstützt ausschließlich manuelle Portal-Erfassung.`,
      };
    }

    // Supported automated integration (mock or production_api)
    return {
      authority: authRecord,
      supported: true,
      requiresManualReview: false,
    };
  } catch (err) {
    console.error('[AuthorityResolver] Error resolving authority:', err);
    return {
      authority: null,
      supported: false,
      requiresManualReview: true,
      reason: 'Datenbankabfrage für Zulassungsbehörde fehlgeschlagen. Manuelle Prüfung aktiviert.',
    };
  }
}

/**
 * Lists all registered authorities
 */
export async function listAuthorities(): Promise<AuthorityConfig[]> {
  try {
    await ensureDefaultAuthoritiesSeeded();
    const rows = await db.select().from(authorities);
    return rows.map(r => ({
      id: r.id,
      authorityId: r.authorityId,
      name: r.name,
      state: r.state,
      city: r.city,
      postalCodes: r.postalCodes || '',
      ikfzEndpoint: r.ikfzEndpoint,
      integrationType: (r.integrationType as AuthorityConfig['integrationType']) || 'mock',
      active: r.active,
      districtCodes: r.districtCodes || undefined,
      contactEmail: r.contactEmail || undefined,
      contactPhone: r.contactPhone || undefined,
      supportsReservation: r.supportsReservation,
    }));
  } catch (err) {
    console.warn('[AuthorityResolver] Falling back to default authorities catalog:', err);
    return DEFAULT_AUTHORITIES.map((a, idx) => ({ ...a, id: idx + 1 }));
  }
}

