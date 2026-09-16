import { Router, Request, Response } from 'express';
import { determineAuthorityForDistrict, listAuthorities } from '../ikfz/authority-resolver.ts';

export const authoritiesRouter = Router();

/**
 * GET /api/authorities/lookup?district=...&postalCode=...
 */
authoritiesRouter.get('/lookup', async (req: Request, res: Response) => {
  try {
    const district = (req.query.district as string) || '';
    const postalCode = (req.query.postalCode as string) || undefined;

    if (!district) {
      return res.status(400).json({ error: 'Zulassungsbezirk oder Kennzeichen erforderlich' });
    }

    const resolution = await determineAuthorityForDistrict(district, postalCode);
    return res.json(resolution);
  } catch (error) {
    console.error('[Authorities] Authority lookup error:', error);
    return res.status(500).json({ error: 'Behördenermittlung fehlgeschlagen' });
  }
});

/**
 * GET /api/authorities
 * List all supported authorities
 */
authoritiesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const authorities = await listAuthorities();
    return res.json({ authorities });
  } catch (error) {
    console.error('[Authorities] List error:', error);
    return res.status(500).json({ error: 'Fehler beim Laden der Behörden' });
  }
});
