import { pathToFileURL } from 'node:url';
import { createRuntimeServer } from './server.mjs';
export { createRuntimeServer } from './server.mjs';

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createRuntimeServer();
  server.listen(Number(process.env.BACKEND_PORT), '127.0.0.1', () => console.log(`${process.env.RUNTIME_PROJECT_NAME || 'Application'} runtime API listening on ${process.env.BACKEND_PORT}`));
}
