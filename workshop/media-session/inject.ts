export const injectScript = (html) => {
  // window.addEventListener('DOMContentLoaded', () => {
  //   console.log('Loaded!')
  // })
  const ID = 'MEDIA_SESSION_CONTROLLER'
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
      target[prop] = value
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

  // Make the DIV element draggable:
  const id = setInterval(() => {
    if(document.getElementById(ID)) {
      dragElement()
      clearInterval(id)
    }
  }, 1000)

  function dragElement() {
    let pos1 = 0
    let pos2 = 0
    let pos3 = 0
    let pos4 = 0

    const elm = document.getElementById(ID)
    elm.onmousedown = dragMouseDown

    function dragMouseDown(e) {
      e = e || window.event
      e.preventDefault()
      pos3 = e.clientX
      pos4 = e.clientY
      document.onmouseup = closeDragElement
      document.onmousemove = elementDrag
    }

    function elementDrag(e) {
      e = e || window.event
      e.preventDefault()
      pos1 = pos3 - e.clientX
      pos2 = pos4 - e.clientY
      pos3 = e.clientX
      pos4 = e.clientY
      elm.style.top = elm.offsetTop - pos2 + 'px'
      elm.style.left = elm.offsetLeft - pos1 + 'px'
    }

    function closeDragElement() {
      document.onmouseup = null
      document.onmousemove = null
    }
  }
}
