import type { FastifyInstance } from 'fastify'
import { sendUdpCommand } from '../lib/udp.js'

export async function remoteRoutes(app: FastifyInstance) {
  
  // GET /api/remote/list
  app.get('/list', async (request, reply) => {
    try {
      const rawData = await sendUdpCommand('list', 2501, '10.0.0.2')
      
      // Filtramos para quedarnos solo con la sección de comandos
      const sectionMarker = '---------------[COMANDOS]---------------'
      const parts = rawData.split(sectionMarker)

      if (parts.length < 2) {
        return { success: true, commands: [], count: 0 }
      }

      // Regex para extraer el nombre: busca "[n] - Nombre" y captura el "Nombre"
      const matches = parts[1].matchAll(/\[\d+\]\s-\s(.+)/g)
      const commands = Array.from(matches, m => m[1].trim())

      return { 
        success: true, 
        commands: commands,
        count: commands.length 
      }

    } catch (err) {
      app.log.error(err)
      return reply.status(504).send({ 
        success: false, 
        error: 'UDP Bridge offline o Timeout' 
      })
    }
  })

  // POST /api/remote/command
  app.post('/command', async (request, reply) => {
    const { name } = request.body as { name: string }
    if (!name) return reply.status(400).send({ error: 'Falta el nombre del comando' })

    try {
      const response = await sendUdpCommand(name, 2501, '10.0.0.2')
      
      // Si la respuesta tiene (done) es que fue bien
      const ok = response.includes('(done)')
      
      return {
        success: ok,
        message: response.trim()
      }
    } catch (err) {
      return reply.status(504).send({ error: 'Error enviando comando UDP' })
    }
  })
}