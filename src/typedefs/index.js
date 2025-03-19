import { readdirSync } from 'fs';
import { join } from 'path';

const typeDefFiles = readdirSync(__dirname)
  .filter(file => file.endsWith('.typeDefs.js') && file !== 'index.js');

export default typeDefFiles.flatMap(file => {
  const module = require(join(__dirname, file));
  return Object.values(module);
});
