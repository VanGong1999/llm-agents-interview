import { articles, topics } from '../data/content.js';
export const matchesTaxonomy = (article, topic = 'all', tag = '') =>
  (topic === 'all' || (article.topicIds || [article.topic]).includes(topic)) && (!tag || article.tags.includes(tag));
export const topicIndex = topics.map(topic => {
  const entries = articles.filter(article => matchesTaxonomy(article, topic.id));
  const tags = [...new Set([...topic.children, ...entries.flatMap(article => article.tags)])];
  return {...topic, count: entries.length, tags: tags.map(name => ({name, count: entries.filter(article => matchesTaxonomy(article, topic.id, name)).length}))};
});
