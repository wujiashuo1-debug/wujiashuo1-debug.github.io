import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { projects } from '../src/data/projects.mjs';
const root=resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const files=[];
async function walk(dir){for(const item of await readdir(dir,{withFileTypes:true})){const path=join(dir,item.name);if(item.isDirectory())await walk(path);else if(path.endsWith('.html'))files.push(path);}}
await walk(root);
assert.equal(new Set(projects.map(p=>p.slug)).size,projects.length,'Project slugs must be unique');
let links=0;
for(const file of files){
  const html=await readFile(file,'utf8');
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${file}: exactly one h1`);
  assert.match(html,/<html lang="zh-CN">/);
  assert.match(html,/<meta name="description" content="[^"]+"/);
  assert.match(html,/<meta name="viewport"/);
  assert.match(html,/<main id="main">/);
  const json=html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  assert.ok(json,`${file}: structured data missing`);JSON.parse(json[1]);
  for(const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    if(url.startsWith('#')) {assert.ok(html.includes(`id="${url.slice(1)}"`),`${file}: missing anchor ${url}`);continue;}
    if(!url.startsWith('/')||url.startsWith('//'))continue;
    const path=url.split(/[?#]/)[0];
    const target=join(root,path.endsWith('/')?`${path}index.html`:path);
    assert.ok((await stat(target)).isFile(),`${file}: broken asset/link ${url}`);links++;
  }
  for(const [,image] of html.matchAll(/<meta property="og:image" content="(\/[^\"]+)"/g))assert.ok((await stat(join(root,image))).isFile());
}
const total=(await Promise.all(files.map(f=>stat(f)))).reduce((n,s)=>n+s.size,0);
console.log(`PASS: ${files.length} HTML documents, ${links} local references, metadata, structured data, anchors and unique project slugs.`);
console.log(`Total HTML: ${(total/1024).toFixed(1)} KiB. No runtime or network dependencies.`);
