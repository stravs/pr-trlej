import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (_context, next) => {
  const upstream = await next();
  // Binding/cache responses can have immutable headers in workerd.
  const response = new Response(upstream.body, upstream);
  // _headers covers direct static assets, not Worker-generated responses.
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  const type = response.headers.get('Content-Type') ?? '';
  if (type.includes('text/html') || type.includes('application/json') || response.status >= 300) {
    // Date/guest-specific booking results and errors must never be shared-cached.
    response.headers.set('Cache-Control', 'no-store');
  }
  return response;
});
