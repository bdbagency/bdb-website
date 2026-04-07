// netlify/functions/contact-submit.js
//
// Recibe el submit del form de contacto y crea el contacto + oportunidad en GHL
// usando la API oficial de LeadConnector. Cero costo recurrente.
//
// Variables de entorno requeridas en Netlify:
//   GHL_PRIVATE_TOKEN       - Private Integration Token (pit-...)
//   GHL_LOCATION_ID         - Sub-account location ID
//   GHL_PIPELINE_ID         - (opcional) pipeline donde crear la oportunidad
//   GHL_PIPELINE_STAGE_ID   - (opcional) etapa inicial dentro del pipeline

const GHL_API = 'https://services.leadconnectorhq.com';
const VERSION = '2021-07-28';

const ALLOWED_ORIGINS = [
  'https://bdbagency.com',
  'https://www.bdbagency.com',
  'http://localhost:8080',
  'http://localhost:8888'
];

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  const headers = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  // Honeypot — bots tipicamente llenan todos los inputs
  if (data.website) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  // Sanitize + validate
  const trim = (s, max = 500) => String(s || '').trim().slice(0, max);
  const first_name = trim(data.first_name, 80);
  const last_name  = trim(data.last_name, 80);
  const email      = trim(data.email, 120).toLowerCase();
  const phone      = trim(data.phone, 30);
  const servicio   = trim(data.servicio, 40);
  const mensaje    = trim(data.mensaje, 2000);

  if (!first_name || !last_name || !email || !phone || !mensaje) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Faltan campos requeridos' }) };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email invalido' }) };
  }

  const TOKEN       = process.env.GHL_PRIVATE_TOKEN;
  const LOCATION_ID = process.env.GHL_LOCATION_ID;
  const PIPELINE_ID = process.env.GHL_PIPELINE_ID;
  const STAGE_ID    = process.env.GHL_PIPELINE_STAGE_ID;

  if (!TOKEN || !LOCATION_ID) {
    console.error('[contact-submit] Missing env vars: GHL_PRIVATE_TOKEN or GHL_LOCATION_ID');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server not configured' }) };
  }

  const ghlHeaders = {
    'Authorization': `Bearer ${TOKEN}`,
    'Version': VERSION,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  try {
    // 1. Upsert contact (crea o actualiza si email existe)
    const upsertRes = await fetch(`${GHL_API}/contacts/upsert`, {
      method: 'POST',
      headers: ghlHeaders,
      body: JSON.stringify({
        locationId: LOCATION_ID,
        firstName: first_name,
        lastName: last_name,
        email,
        phone,
        source: 'Website - contacto.html',
        tags: ['web-contacto', servicio ? `servicio-${servicio}` : null].filter(Boolean)
      })
    });

    if (!upsertRes.ok) {
      const errText = await upsertRes.text();
      console.error('[contact-submit] Contact upsert failed', upsertRes.status, errText);
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'No pudimos crear el contacto' }) };
    }

    const upsertJson = await upsertRes.json();
    const contactId = upsertJson?.contact?.id || upsertJson?.id;

    // 2. Add note with the message (non-fatal)
    if (contactId) {
      try {
        await fetch(`${GHL_API}/contacts/${contactId}/notes`, {
          method: 'POST',
          headers: ghlHeaders,
          body: JSON.stringify({
            body: `Mensaje desde bdbagency.com\n\nServicio de interes: ${servicio || 'no especificado'}\n\n${mensaje}`
          })
        });
      } catch (e) {
        console.error('[contact-submit] Note creation failed (non-fatal):', e);
      }
    }

    // 3. Create opportunity in pipeline (non-fatal)
    if (contactId && PIPELINE_ID && STAGE_ID) {
      try {
        await fetch(`${GHL_API}/opportunities/`, {
          method: 'POST',
          headers: ghlHeaders,
          body: JSON.stringify({
            pipelineId: PIPELINE_ID,
            locationId: LOCATION_ID,
            pipelineStageId: STAGE_ID,
            name: `${first_name} ${last_name} - ${servicio || 'Web'}`,
            status: 'open',
            contactId
          })
        });
      } catch (e) {
        console.error('[contact-submit] Opportunity creation failed (non-fatal):', e);
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, contactId }) };
  } catch (err) {
    console.error('[contact-submit] Unexpected error', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'No pudimos procesar tu mensaje' }) };
  }
};
