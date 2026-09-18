import { runGateway } from '~~/server/utils/gateway'

/** The OpenAI-compatible face of the gateway. */
export default defineEventHandler((event) => runGateway(event, 'openai'))
