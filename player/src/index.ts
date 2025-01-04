import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { play } from './play.js'
import endpoint from "../../endpoint.json";

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/', async (c) => {
  const audio = await c.req.arrayBuffer()
  await play(audio);
  return c.text('ok')
})

const port = Number(endpoint.audio.port);
const hostname = endpoint.audio.ip;
console.log(`Server is running on http://${hostname}:${port}`);

serve({
  fetch: app.fetch,
  port
})
