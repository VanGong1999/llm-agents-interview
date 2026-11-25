import {readFileSync,readdirSync,statSync} from 'node:fs';
import {join,relative,basename,extname} from 'node:path';
const docsRoot=join(process.cwd(),'docs');
const sources={
  'cs329a-self-improving-agents':'01-course-packs/CS329A自我改进智能体',
  'hardcore-agentic-engineering':'01-course-packs/硬核智能体工程',
  'huggingface-post-training-agents':'01-course-packs/huggingface后训练agent',
  'vizuara-harness-workshop':'01-course-packs/Vizuara-harness',
  'agent-memory-video-notes':'02-themes/03-memory/videos',
  'hermes-agentic-rl-notes':'02-themes/15-training-and-adaptation/agentic-rl',
  'little-book-agent-engineering':'01-course-packs/智能体工程小书'
};
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const full=join(dir,entry.name);return entry.isDirectory()?walk(full):extname(entry.name).toLowerCase()==='.md'?[full]:[]})}
function titleOf(raw,file){return raw.match(/^#\s+(.+)$/m)?.[1]?.trim()||basename(file,'.md')}
function slugFor(index){return `doc-${String(index+1).padStart(3,'0')}`}
export const documents=Object.entries(sources).flatMap(([collection,dirName])=>walk(join(docsRoot,dirName)).sort().map((file,index)=>{const raw=readFileSync(file,'utf8');return {id:slugFor(index),collection,title:titleOf(raw,file),fileName:basename(file),relativePath:relative(docsRoot,file),raw,bytes:statSync(file).size}}));
export const documentsByCollection=Object.fromEntries(Object.keys(sources).map(collection=>[collection,documents.filter(doc=>doc.collection===collection)]));
