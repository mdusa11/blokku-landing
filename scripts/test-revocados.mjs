// Hash del panel (admin/panel/62-revocados.js) contra los vectores de la app
// (blocktetris: test/revocados_test.dart). Uso: node scripts/test-revocados.mjs
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../admin/panel/62-revocados.js', import.meta.url), 'utf8').split('\nfunction vRevocados')[0];
const { rvHashV1, rvHashV2, rvHashFor } = new Function(src + '\nreturn { rvHashV1, rvHashV2, rvHashFor };')();
const V = {
  ' bk-7qk2 m9xf–t4rw ': ['303cb0c882c367d4bf0b94c39183dddbbea8c60ebde0399d814b68fefd58e41f', '0e865c9aa3aabcbcdabd3ed65a4be9cb62db5dc61291bd9f19f30dbadd275b93'],
  'blokku-mx': ['5c0829100aa87d24134ffc97fb04e5dd1945957c758d7880e188e9ec470e7652', '96ea58b3766a53d2e1b729fd1bcd3f4c62a78e42868cd2975e30fa3835ccbbce'],
  'BLOKKU—DUSA 2026': ['4e17dc2c06a1848447967f0e11534222b4e6d665d3e41f07f12166eee97d9a18', '4b2a7685bc0b2bfc7628458448a0d965e9f6a96f8dcd011fafe0df590ae3b2e4'],
  'straße': ['b6529f0dfc81f412c6ef5d895d214f84e039b1959054f80c2446987baf44aa03', 'd185eae68c0d766445afe6602f511fb3f7955169792a9b712b2699b8bb226e39'],
};
let bad = 0;
for (const [code, [v2, v1]] of Object.entries(V)) {
  if (await rvHashV2(code) !== v2) { bad++; console.error('v2 distinto:', JSON.stringify(code)); }
  if (await rvHashV1(code) !== v1) { bad++; console.error('v1 distinto:', JSON.stringify(code)); }
}
const a = await rvHashFor('bk-7qk2 m9xf-t4rw'), b = await rvHashFor('BLOKKU-MX'), c = await rvHashFor('A'.repeat(64));
if (a.k !== 'v2' || a.h !== V[' bk-7qk2 m9xf–t4rw '][0]) { bad++; console.error('BK → v2'); }
if (b.k !== 'v1' || b.h !== V['blokku-mx'][1]) { bad++; console.error('sticker → v1'); }
if (c.k !== 'hash' || c.h !== 'a'.repeat(64)) { bad++; console.error('hash pegado'); }
console.log(bad ? `FALLÓ (${bad})` : 'OK: el hash del panel coincide con el de la app');
process.exit(bad ? 1 : 0);
