export const injectScript = (html) => {

  const actionHandlers = new Map()

  const proxyHandler = {
    get(target, prop, receiver) {
      const value = target[prop]
      if (typeof value === 'function') {
        const fn = value.bind(target)
        if (typeof value === 'function') {
          if (prop === 'setActionHandler') return setActionHandler
          return fn
        }
      }
      return value
    }
  }

  function setActionHandler(action, handler) {
    console.log(action)
    console.log(handler)
    if (handler === null) actionHandlers.delete(action)
    else actionHandlers.set(action, handler)
  }

  Object.defineProperty(navigator, 'mediaSession', {
    value: new Proxy(navigator.mediaSession, proxyHandler)
  })
}
