// server/middlewares/logger.middleware.js
// HTTP logger avec x-request-id, skip des assets, masquage de champs sensibles

const { randomUUID } = require('crypto');
const isProd = process.env.NODE_ENV === 'production';

// Champs sensibles à masquer
const SENSITIVE = /pass(word)?|token|secret|authorization|api[-_]?key/i;
function maskObject(obj) {
  try {
    if (!obj || typeof obj !== 'object') return obj;
    const out = Array.isArray(obj) ? [] : {};
    for (const [k, v] of Object.entries(obj)) {
      if (SENSITIVE.test(k)) out[k] = '••••••';
      else if (v && typeof v === 'object') out[k] = maskObject(v);
      else if (typeof v === 'string' && v.length > 300) out[k] = v.slice(0, 300) + '…';
      else out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

// Ignorer le bruit (fichiers statiques, favicon…)
function shouldSkip(path = '') {
  return (
    path === '/favicon.ico' ||
    path.startsWith('/assets/') ||
    path.startsWith('/img/') ||
    path.startsWith('/icons/') ||
    path.startsWith('/css/') ||
    path.startsWith('/js/')
  );
}

// Couleurs terminal
function color(code, str) {
  return process.stdout.isTTY ? `\x1b[${code}m${str}\x1b[0m` : String(str);
}

function logger(req, res, next) {
  if (shouldSkip(req.path)) return next();

  const id = randomUUID().slice(0, 8);
  req.id = id;
  res.setHeader('x-request-id', id);

  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durMs = Number(process.hrtime.bigint() - start) / 1e6;
    const ms = durMs.toFixed(1);
    const ua = req.headers['user-agent'] || '';
    const { method, originalUrl } = req;
    const status = res.statusCode;

    const statusStr =
      status >= 500 ? color('31', status) : // rouge
      status >= 400 ? color('33', status) : // jaune
      status >= 300 ? color('36', status) : // cyan
      color('32', status);                  // vert

    const base = `[${new Date().toISOString()}] [${id}] ${req.ip} ${method} ${originalUrl} -> ${statusStr} ${ms}ms`;
    const isError = status >= 400;
    const isSlow = durMs > 1200; // > 1200 ms

    // Plus de détails en DEV, en erreur, ou si lent
    let extras = '';
    if (!isProd || isError || isSlow) {
      const parts = [`UA:${ua.slice(0, 80)}`];
      if (Object.keys(req.query || {}).length) parts.push(`query=${JSON.stringify(maskObject(req.query))}`);
      if (['POST', 'PUT', 'PATCH'].includes(method) && req.body && Object.keys(req.body).length) {
        parts.push(`body=${JSON.stringify(maskObject(req.body))}`);
      }
      extras = ' ' + parts.join(' ');
    }

    const line = base + extras;
    if (isError) console.error(line);
    else console.log(line);
  });

  next();
}

module.exports = { logger };
