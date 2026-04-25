import type { FastifyRequest, FastifyReply } from 'fastify'

// -- This hook runs on every request in production.
// -- Authelia injects the Remote-User header after successful authentication.
// -- If the header is missing, someone is bypassing Caddy - reject immediately.
export async function authHook(request: FastifyRequest, reply: FastifyReply) {
	const remoteUser = request.headers['remote-user']

	if (!remoteUser) {
		reply.code(401).send({ error: 'Unauthorized' })
	}
}
