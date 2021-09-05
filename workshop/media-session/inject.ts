export const injectScript = () => {
  // window.addEventListener('DOMContentLoaded', () => {
  //   console.log('Loaded!')
  // })
  const ID = 'MEDIA_SESSION_CONTROLS'
  const ID2 = 'MEDIA_SESSION_INFO'
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
      updateInfoPanel()
      return true
    }
  }

  function setActionHandler(fn) {
    return (action, handler) => {
      handler ? actionHandlers.set(action, handler) : actionHandlers.delete(action)
      updateInfoPanel()
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

  const id = setInterval(() => {
    if (document.body && document.getElementById(ID)) {
      setupInfoPanel()
      dragElement(ID)
      dragElement(ID2)
      clearInterval(id)
    }
  }, 1000)

  function setupInfoPanel() {
    const div = document.createElement('div')
    div.innerHTML = getInfoHtml()
    div.setAttribute('id', ID2)
    document.body.appendChild(div)
  }

  function getInfoHtml() {
    const { playbackState, metadata } = navigator.mediaSession
    let metaString = '<pre>'
    if (metadata) {
      const { title, artist, album, artwork } = metadata
      metaString = `title: ${title}<br>artist: ${artist}<br>album: ${album}<br>artwork: ${JSON.stringify(artwork)}`
    } else metaString += `metadata: ${metadata}`
    return (
      `${metaString}<br>playbackState: ${playbackState}<br>` +
      `actionsHandlers: ${Array.from(actionHandlers.keys()).join(', ')}<pre>`
    )
  }

  function updateInfoPanel() {
    const elm = document.getElementById(ID2)
    if (elm) elm.innerHTML = getInfoHtml()
  }

  function dragElement(elemId) {
    let pos1 = 0
    let pos2 = 0
    let pos3 = 0
    let pos4 = 0

    if (elemId === 'MEDIA_SESSION_CONTROLS') document.getElementById('THE-HEADER').onmousedown = dragMouseDown
    else document.getElementById(elemId).onmousedown = dragMouseDown
    const elm = document.getElementById(elemId)

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
