import http from 'node:http';
import { env } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import app from './src/app.js';
import { initSockets } from './src/sockets/index.js';

const server = http.createServer(app);
initSockets(server);

connectDB()
  .then(() => server.listen(env.port, () => console.log(`API + sockets on :${env.port}`)))
  .catch((e) => { console.error('Mongo connection failed:', e.message); process.exit(1); });
