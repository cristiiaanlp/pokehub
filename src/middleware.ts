import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // No interceptamos:
  //  - /api/* (endpoints REST)
  //  - /admin/* (panel interno, español únicamente)
  //  - /auth/* (callback de Supabase)
  //  - rutas técnicas (_next, _vercel, sitemap, robots, manifest, opengraph-image, icon, apple-icon, favicon)
  matcher: [
    '/((?!api|admin|auth|_next|_vercel|sitemap.xml|robots.txt|manifest.webmanifest|opengraph-image|icon|apple-icon|favicon).*)',
  ],
};
