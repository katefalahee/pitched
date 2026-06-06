import Fastify from 'fastify'
import cors from '@fastify/cors'
import { venueRoutes } from './routes/venues'
import { matchRoutes } from './routes/matches'
import { logRoutes } from './routes/logs'
import 'dotenv/config'

const app = Fastify({ logger: true })

async function start() {
  await app.register(cors, {
    origin: true,
    credentials: true
  })

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', service: 'pitched-api', time: new Date() }
  })

  // Routes
  await app.register(venueRoutes, { prefix: '/v1/venues' })
  await app.register(matchRoutes, { prefix: '/v1/matches' })
  await app.register(logRoutes, { prefix: '/v1/logs' })

  try {
    await app.listen({ port: 4000, host: '0.0.0.0' })
    console.log('Pitched API running on http://localhost:4000')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()