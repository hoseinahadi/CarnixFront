import { existsSync, readFileSync, readdirSync } from 'node:fs';

const failures = [];
for (const duplicate of ['middleware.ts', 'src/middleware.ts']) {
  if (existsSync(duplicate)) failures.push(`Duplicate route guard exists: ${duplicate}`);
}

const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const path = `${directory}/${entry.name}`;
  return entry.isDirectory() ? walk(path) : (/\.tsx?$/.test(entry.name) ? [path] : []);
});
const sourceFiles = walk('src').filter((file) => file !== 'src/config/runtime.ts');
for (const file of sourceFiles) {
  const source = readFileSync(file, 'utf8');
  if (/NEXT_PUBLIC_(?:API_URL|BACKEND_URL)|localhost:7191/.test(source)) {
    failures.push(`Scattered API configuration: ${file}`);
  }
}

const authStorage = readFileSync('src/services/api/common/authTokenStorage.ts', 'utf8');
if (/localStorage\.setItem\(\s*(?:ACCESS_TOKEN_KEY|REFRESH_TOKEN_KEY)/.test(authStorage)) {
  failures.push('Authentication tokens are persisted in localStorage.');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('P0 architecture checks passed.');
