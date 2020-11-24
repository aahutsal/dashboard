/**
 * Download CSV from https://unstats.un.org/unsd/methodology/m49/overview/ to m49.csv
 * Execute 
 *   node buildM49tree.js m49.csv > m49-tree.json
 * 
 * Author: Kosta Korenkov <kosta@korenkov.net>
 */
const fs = require('fs');

const rawData = fs.readFileSync(process.argv[2]).toString();

const tree = [];

const getOrCreate = (subTree, id, name) => {
  let entry = subTree.find(a => a.key === id);
  if (entry) return entry;
  entry = { key:id, title: name.trim(), children: [] };
  subTree.push(entry);
  return entry;
};

const getBucket = (bucket, line, idx) => {
  if (!line[idx] || idx > 7) return bucket;
  return getBucket(getOrCreate(bucket.children, line[idx], line[idx + 1]), line, idx + 2);
};

rawData.split('\n').slice(1).forEach((line) => {
  const data = line.split(',');
  const bucket = getBucket({ children: tree }, data, 0);
  bucket.children.push({ key: data[9], title: data[8].trim() });
});

console.log(JSON.stringify(tree, null, 2))