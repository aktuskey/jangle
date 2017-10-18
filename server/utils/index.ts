import { createHmac } from 'crypto'

type Logger = {
  log : Function
  error : Function
  info : Function
}

const logger : Logger = console

export const logError =  <T>(prefix : string) => (thing : T) : T => {
  logger.error(prefix, thing)
  return thing
}

export const debug =  <T>(prefix : string) => (thing : T) : T => {
  logger.log(prefix, thing)
  return thing
}

export const sluggify = (words : string) : string =>
  words.split(' ')
    .filter(word => word.length > 0)
    .join('-')
    .toLowerCase()

export const hash = (thing : string) : string =>
  createHmac('sha256', process.env.SECRET || 'secret')
    .update(thing)
    .digest('hex')
