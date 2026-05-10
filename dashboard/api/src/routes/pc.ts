import type { FastifyInstance } from 'fastify'
import { runSSHCommand, targets } from '../lib/ssh.js'

export async function pcRoutes(app: FastifyInstance) {
    // -- POST /api/pc/wake
    // -- Tells the RPi to send a magic packet to wake the PC
    // -- The RPi has a 'wake' alias that already knows the PC's MAC address
    app.post('/wake', async (_, reply) => {
        try {
            await runSSHCommand(targets.rpi, 'wake')
            return { success: true }
        } catch (err) {
            reply.code(500).send({ error: 'Failed to send wake command to RPi' })
        }
    })

    // -- POST /api/pc/shutdown
    // -- SSH directly into the PC and shut it down immediately
    app.post('/shutdown', async (_, reply) => {
        try {
            await runSSHCommand(targets.pc, 'shutdown /s /t 0', true)
            return { success: true }
        } catch (err) {
            reply.code(500).send({ error: 'Failed to shutdown PC' })
        }
    })

    // -- POST /api/pc/reboot
    // -- SSH directly into the PC and reboot it immediately
    app.post('/reboot', async (_, reply) => {
        try {
            await runSSHCommand(targets.pc, 'shutdown /r /t 0', true)
            return { success: true }
        } catch (err) {
            reply.code(500).send({ error: 'Failed to reboot PC' })
        }
    })

    // -- POST /api/pc/comfyui/start
    // -- Launches ComfyUI on the PC via a command alias defined on Windows
    // -- The process is detached so it stays alive after SSH closes
    app.post('/comfyui/start', async (_, reply) => {
        try {
            await runSSHCommand(targets.pc, 'start-comfyui')
            return { success: true }
        } catch (err) {
            reply.code(500).send({ error: 'Failed to start ComfyUI' })
        }
    })
}
