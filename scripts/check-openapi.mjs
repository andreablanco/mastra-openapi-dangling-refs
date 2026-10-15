import SwaggerParser from '@apidevtools/swagger-parser';

const url = process.env.OPENAPI_URL ?? 'http://localhost:4111/api/openapi.json';
const doc = await (await fetch(url)).json();

const refs = [];
const walk = (node) => {
  if (Array.isArray(node)) {
    node.forEach(walk);
    return;
  }
  if (node && typeof node === 'object') {
    if (typeof node.$ref === 'string') refs.push(node.$ref);
    Object.values(node).forEach(walk);
  }
};
walk(doc);

const resolves = (ref) =>
  ref
    .slice(2)
    .split('/')
    .reduce((n, k) => (n && typeof n === 'object' ? n[k.replace(/~1/g, '/').replace(/~0/g, '~')] : undefined), doc) !==
  undefined;
const dangling = refs.filter((r) => r.startsWith('#/') && !resolves(r));

console.log(`openapi ${doc.openapi}, components: ${'components' in doc}`);
console.log(`$refs: ${refs.length}, dangling: ${dangling.length}`);
console.log(`dangling targets: ${[...new Set(dangling)].join(', ')}`);

try {
  await SwaggerParser.validate(doc);
  console.log('swagger-parser: valid');
} catch (e) {
  console.log(`swagger-parser: invalid (${e.message})`);
  process.exitCode = 1;
}
