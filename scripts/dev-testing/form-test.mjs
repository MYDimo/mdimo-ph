import { launch } from './cdp.mjs';
const c = await launch({ width: 1280, height: 900 });

for (const lang of ['en', 'bg']) {
  await c.goto(`http://localhost:4400/${lang}/contact/`, 2500);
  // Record what the page tries to send instead of sending anything.
  await c.eval(`window.__sent = []; window.fetch = (url, opts) => { window.__sent.push({ url, method: opts && opts.method, body: opts && opts.body }); return Promise.resolve({ ok: true, status: 200 }); }; 1`);

  console.log(`\n=== ${lang.toUpperCase()}: email validation`);
  const emails = process.env.QUICK ? [] : ['dsa@dasads', 'dsa@dasads.', 'a@b.c', '@example.com', 'name@', 'name@example.com', '  name@example.com  ', 'ivan.petrov+x@mail.example.co.uk', 'иван@пример.бг'];
  for (const e of emails) {
    const r = await c.eval(`(() => {
      const f = document.querySelector('[data-inquiry-form]');
      const i = f.querySelector('input[name=email]');
      i.value = ${JSON.stringify(e)};
      i.dispatchEvent(new Event('input', { bubbles: true }));
      return { valid: i.checkValidity(), message: i.validationMessage };
    })()`);
    console.log(`${r.valid ? 'ACCEPTED' : 'rejected'}  ${JSON.stringify(e).padEnd(38)} ${r.valid ? '' : r.message}`);
  }

  console.log(`\n=== ${lang.toUpperCase()}: submit with a valid email`);
  await c.eval(`(() => {
    const f = document.querySelector('[data-inquiry-form]');
    f.querySelector('input[name=name]').value = 'Test Person';
    const em = f.querySelector('input[name=email]'); em.value = ' test@example.com '; em.dispatchEvent(new Event('input', { bubbles: true }));
    f.querySelector('textarea[name=message]').value = 'Hello';
    f.requestSubmit();
  })()`);
  await c.sleep(1800);
  console.log(JSON.stringify(await c.eval(`({ sent: window.__sent, successShown: !document.querySelector('[data-form-success]').hidden })`), null, 1));
}
await c.close();
