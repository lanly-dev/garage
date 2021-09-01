export const injectScript = (html) => {

  // window.addEventListener('DOMContentLoaded', () => {
  //   console.log('Loaded!')
  // })

  const actionHandlers = new Map()

  const proxyHandler = {
    get(target, prop, receiver) {
      const value = target[prop]
      if (typeof value === 'function') {
        const fn = value.bind(target)
        if (typeof value === 'function') {
          if (prop === 'setActionHandler') return setActionHandler(fn)
          return fn
        }
      }
      return value
    },
    set(target, prop, value) {
      target[prop] =  value
      return true
    }
  }

  function setActionHandler(fn) {
    return (action, handler) => {
      handler ? actionHandlers.set(action, handler) : actionHandlers.delete(action)
      return fn
    }
  }

  // @ts-ignore
  window.btnClicked = (action) => {
    const theFn = actionHandlers.get(action)
    theFn ? theFn() : null
  }

  Object.defineProperty(navigator, 'mediaSession', {
    value: new Proxy(navigator.mediaSession, proxyHandler)
  })
}
