const { test } = require('node:test');
const assert = require('node:assert/strict');
const { handler } = require('../netlify/functions/gerar');

test('recusa métodos incompatíveis e informa o método aceito', async () => {
  const result = await handler({ httpMethod: 'GET' });
  assert.equal(result.statusCode, 405);
  assert.equal(result.headers.Allow, 'POST');
});

test('retorna 400 para JSON inválido, tipos errados e descrições inválidas', async () => {
  for (const body of ['{', 'null', '[]', '42', '{}', '{"texto":2}', '{"texto":"  "}', JSON.stringify({ texto: 'x'.repeat(1201) })]) {
    const result = await handler({ httpMethod: 'POST', body });
    assert.equal(result.statusCode, 400, body);
    assert.equal(typeof JSON.parse(result.body).erro, 'string');
  }
});

test('devolve o rascunho sem chamar o serviço real', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: '<!DOCTYPE html><html></html>' } }] }) }));
  const result = await handler({ httpMethod: 'POST', body: JSON.stringify({ texto: 'Uma padaria' }) });
  assert.equal(result.statusCode, 200);
  assert.match(JSON.parse(result.body).resultado, /DOCTYPE/);
});

test('traduz limite de requisições e timeout em respostas recuperáveis', async (t) => {
  const mock = t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 429, json: async () => ({}) }));
  const event = { httpMethod: 'POST', body: JSON.stringify({ texto: 'Uma padaria' }) };
  assert.equal((await handler(event)).statusCode, 429);
  mock.mock.mockImplementation(async () => { throw Object.assign(new Error('timeout'), { name: 'AbortError' }); });
  assert.equal((await handler(event)).statusCode, 504);
});

