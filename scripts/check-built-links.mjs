import {readdir,readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('dist');
const base=(process.env.BASE_PATH||'').replace(/\/$/,'');
async function walk(dir){const entries=await readdir(dir,{withFileTypes:true});return(await Promise.all(entries.map(e=>e.isDirectory()?walk(path.join(dir,e.name)):path.join(dir,e.name)))).flat()}
const files=(await walk(root)).filter(f=>f.endsWith('.html'));let links=0;
for(const file of files){const html=await readFile(file,'utf8');const pagePath='/'+path.relative(root,file).replace(/index\.html$/,'');const pageURL=new URL(`${base}${pagePath}`,'https://test.invalid');
  for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
    const value=match[1].replaceAll('&amp;','&');if(/^(?:https?:|data:|mailto:|javascript:)/.test(value))continue;
    const url=new URL(value,pageURL);if(!url.pathname.startsWith(base+'/'))throw Error(`Outside base: ${file} -> ${value}`);
    let target=path.join(root,decodeURIComponent(url.pathname.slice(base.length)));const info=await stat(target).catch(()=>null);assert(info,`Missing: ${file} -> ${value}`);if(info.isDirectory())target=path.join(target,'index.html');
    if(url.hash&&target.endsWith('.html')){const dest=await readFile(target,'utf8');const id=decodeURIComponent(url.hash.slice(1));assert(dest.includes(`id="${id}"`),`Missing anchor: ${file} -> ${value}`)}links++;
  }
}
console.log(`Checked ${files.length} HTML pages and ${links} local links/assets/anchors (base: ${base||'/'}).`);
