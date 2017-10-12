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
