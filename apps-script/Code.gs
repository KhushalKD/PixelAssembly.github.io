/**
 * Pixel Assembly — contact form endpoint
 * ---------------------------------------------------------------------------
 * Deploy:
 *   1. script.google.com → New project → paste this over Code.gs → Save
 *   2. Run `testSend` once and approve the Gmail permission prompt
 *   3. Deploy → New deployment → type "Web app"
 *        Execute as:        Me
 *        Who has access:    Anyone
 *   4. Copy the /exec URL. Open it in a browser — it should return
 *      {"ok":true,...}. That URL goes into ENDPOINT in assets/js/main.js.
 *
 * After ANY edit here you must Deploy → Manage deployments → edit → New
 * version, or the live URL keeps serving the old code.
 *
 * The site posts application/x-www-form-urlencoded (URLSearchParams), which
 * keeps it a "simple" CORS request — no preflight, which Apps Script cannot
 * answer. Do not switch the client to JSON.
 */

const CONFIG = {
  TO: 'info.pixelassembly@gmail.com',
  STUDIO: 'Pixel Assembly',
  REPLY_WINDOW: '48 hours',

  // Optional: paste a Google Sheet ID to keep a copy of every enquiry.
  // Safety net for the days Gmail quota is hit or a mail silently drops.
  SHEET_ID: '',
  SHEET_NAME: 'Enquiries',

  // Hidden field the real form leaves empty. Bots fill everything.
  HONEYPOT: 'website',

  ACCENT: '#D9380F',
  INK: '#16140F',
  PAPER: '#EFEBE3',
  RULE: '#DCD6C9',

  LIMITS: { name: 120, email: 180, company: 180, budget: 60, service: 60, message: 5000 }
};

/* -------------------------------------------------------------- endpoints */

function doPost(e) {
  try {
    const single = (e && e.parameter) || {};
    const multi = (e && e.parameters) || {};

    // Honeypot: accept silently so the bot records a success and moves on.
    if (oneLine(single[CONFIG.HONEYPOT], 200)) {
      return json({ ok: true });
    }

    const form = {
      name: oneLine(single.name, CONFIG.LIMITS.name),
      email: oneLine(single.email, CONFIG.LIMITS.email),
      company: oneLine(single.company, CONFIG.LIMITS.company),
      budget: oneLine(single.budget, CONFIG.LIMITS.budget),
      services: (multi.services || [])
        .map(function (s) { return oneLine(s, CONFIG.LIMITS.service); })
        .filter(String)
        .join(', '),
      message: multiLine(single.message, CONFIG.LIMITS.message)
    };

    const problems = validate(form);
    if (problems.length) {
      return json({ ok: false, error: problems.join(' ') });
    }

    MailApp.sendEmail({
      to: CONFIG.TO,
      replyTo: form.email,          // hit reply and it goes to the enquirer
      subject: subjectFor(form),
      htmlBody: htmlBody(form),
      body: textBody(form),         // for clients that refuse HTML
      name: CONFIG.STUDIO + ' website'
    });

    logToSheet(form);
    return json({ ok: true });

  } catch (err) {
    // Never report success on a failure — the original script did, which meant
    // a quota error looked identical to a delivered enquiry.
    console.error(err);
    return json({ ok: false, error: 'Could not send right now. Please email ' + CONFIG.TO + '.' });
  }
}

/** Health check — open the /exec URL in a browser to confirm the deployment. */
function doGet() {
  return json({ ok: true, service: CONFIG.STUDIO + ' contact endpoint' });
}

/* ------------------------------------------------------------- validation */

function validate(f) {
  const out = [];
  if (!f.name) out.push('Name is required.');
  if (!f.email) out.push('Email is required.');
  else if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(f.email)) out.push('That email address does not look right.');
  if (!f.message) out.push('Message is required.');
  return out;
}

function oneLine(v, max) {
  return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max);
}

function multiLine(v, max) {
  return String(v == null ? '' : v)
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

/**
 * Everything a visitor typed goes through this before it reaches the HTML
 * body. Without it, anyone can post markup straight into your inbox.
 */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function nl2br(s) {
  return escapeHtml(s).replace(/\n/g, '<br>');
}

/* ----------------------------------------------------------------- email */

function subjectFor(f) {
  const who = f.company || f.name;
  const what = f.services ? ' — ' + f.services : '';
  return oneLine('Enquiry: ' + who + what, 160);
}

function htmlBody(f) {
  const rows = [
    ['Name', escapeHtml(f.name)],
    ['Email', '<a href="mailto:' + escapeHtml(f.email) + '" style="color:' + CONFIG.ACCENT + ';text-decoration:none">' + escapeHtml(f.email) + '</a>'],
    ['Company', escapeHtml(f.company || '—')],
    ['Budget', escapeHtml(f.budget || '—')],
    ['Services', escapeHtml(f.services || 'Not specified')]
  ];

  const cells = rows.map(function (r) {
    return '' +
      '<tr>' +
        '<td style="padding:10px 0;border-bottom:1px solid ' + CONFIG.RULE + ';' +
                   'font:500 11px/1.4 -apple-system,Segoe UI,Arial,sans-serif;' +
                   'letter-spacing:.12em;text-transform:uppercase;color:#8B8379;' +
                   'width:120px;vertical-align:top">' + r[0] + '</td>' +
        '<td style="padding:10px 0;border-bottom:1px solid ' + CONFIG.RULE + ';' +
                   'font:400 15px/1.5 -apple-system,Segoe UI,Arial,sans-serif;' +
                   'color:' + CONFIG.INK + '">' + r[1] + '</td>' +
      '</tr>';
  }).join('');

  const stamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'd MMM yyyy, HH:mm') + ' IST';

  return '' +
    '<div style="background:' + CONFIG.PAPER + ';padding:28px 16px">' +
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" ' +
             'style="max-width:600px;margin:0 auto;background:#fff;border:1px solid ' + CONFIG.INK + '">' +
        '<tr>' +
          '<td style="background:' + CONFIG.INK + ';padding:20px 24px">' +
            '<div style="font:700 17px/1 -apple-system,Segoe UI,Arial,sans-serif;' +
                        'letter-spacing:-.02em;color:' + CONFIG.PAPER + '">' +
              'Pixel<span style="color:' + CONFIG.ACCENT + '">Assembly</span>' +
            '</div>' +
            '<div style="margin-top:8px;font:400 11px/1.4 -apple-system,Segoe UI,Arial,sans-serif;' +
                        'letter-spacing:.12em;text-transform:uppercase;color:rgba(239,235,227,.6)">' +
              'New enquiry · ' + stamp +
            '</div>' +
          '</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="padding:24px">' +
            '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">' +
              cells +
            '</table>' +
            '<div style="margin-top:24px;font:500 11px/1.4 -apple-system,Segoe UI,Arial,sans-serif;' +
                        'letter-spacing:.12em;text-transform:uppercase;color:#8B8379">Message</div>' +
            '<div style="margin-top:10px;padding:16px;background:' + CONFIG.PAPER + ';' +
                        'border-left:3px solid ' + CONFIG.ACCENT + ';' +
                        'font:400 15px/1.6 -apple-system,Segoe UI,Arial,sans-serif;' +
                        'color:' + CONFIG.INK + '">' + nl2br(f.message) + '</div>' +
            '<div style="margin-top:24px;padding-top:16px;border-top:1px solid ' + CONFIG.RULE + ';' +
                        'font:400 13px/1.5 -apple-system,Segoe UI,Arial,sans-serif;color:#55504A">' +
              'Reply to this email and it goes straight back to ' + escapeHtml(f.name) + '.' +
              ' They were told to expect an answer within ' + CONFIG.REPLY_WINDOW + '.' +
            '</div>' +
          '</td>' +
        '</tr>' +
      '</table>' +
    '</div>';
}

function textBody(f) {
  return [
    'NEW ENQUIRY — ' + CONFIG.STUDIO,
    '',
    'Name:     ' + f.name,
    'Email:    ' + f.email,
    'Company:  ' + (f.company || '—'),
    'Budget:   ' + (f.budget || '—'),
    'Services: ' + (f.services || 'Not specified'),
    '',
    'Message:',
    f.message,
    '',
    '— Reply to this email to answer them directly.'
  ].join('\n');
}

/* ------------------------------------------------------------ sheet backup */

function logToSheet(f) {
  if (!CONFIG.SHEET_ID) return;
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.insertSheet(CONFIG.SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Received', 'Name', 'Email', 'Company', 'Budget', 'Services', 'Message']);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([new Date(), f.name, f.email, f.company, f.budget, f.services, f.message]);
  } catch (err) {
    // A failed backup must never fail the enquiry itself.
    console.error('Sheet log failed: ' + err);
  }
}

/* ------------------------------------------------------------------ utils */

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Run this once from the editor to approve permissions and check the layout. */
function testSend() {
  const res = doPost({
    parameter: {
      name: 'Test Enquiry',
      email: 'someone@example.com',
      company: 'Example Co',
      budget: '$5,000 – $15,000',
      message: 'First line of the test message.\n\nSecond line, to check spacing.'
    },
    parameters: { services: ['Website', 'Video editing'] }
  });
  console.log(res.getContent());
}
