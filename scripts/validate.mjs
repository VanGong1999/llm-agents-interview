import assert from 'node:assert/strict';
import { articles, topics, paths } from '../src/data/content.js';
const unique=(values,label)=>assert.equal(new Set(values).size,values.length,`${label}: duplicate ID`);
unique(articles.map(a=>a.id),'articles');unique(topics.map(t=>t.id),'topics');unique(articles.filter(a=>a.insight).map(a=>a.insight.id),'insights');
for(const a of articles){assert(a.title&&a.summary&&a.sections.length);assert(topics.some(t=>t.id===a.topic),`${a.id}: unknown topic`);unique(a.sections.map(s=>s.id),a.id);if(a.isCollection){assert(a.sourceCount>0&&a.sourcePath&&a.sourceFiles.length,`${a.id}: incomplete collection`);assert(a.insight===null,`${a.id}: collection must not have insight`);}else{assert(a.sections.some(s=>s.id===a.insight.sectionId),`${a.id}: broken evidence`);assert(a.demo===true,'Non-demo content needs a real source model and editorial review');}}
for(const path of paths)for(const id of path.ids)assert(articles.some(a=>a.id===id),`${path.id}: missing article`);
console.log(`Validated ${articles.length} articles, ${articles.length} evidence links, ${topics.length} topics and ${paths.length} learning paths.`);
