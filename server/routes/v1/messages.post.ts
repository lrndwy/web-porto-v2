import { runGateway } from '~~/server/utils/gateway'

/** The Anthropic-compatible face of the gateway. */
export default defineEventHandler((event) => runGateway(event, 'anthropic'))
