function decodeBase64ToUtf8(base64String) {
  return decodeURIComponent(escape(atob(base64String)));
}

const longT = 'UGxlYXNlS2VlcFRoaXNTZWNyZXRnaXRodWJfcGF0XzExQURNTDZQQTA5TGE0aWRtVld4MWNfOVY2ZmNscEpucHNKS0lRaUQxb1h5bkhQR0tyZUh2RjRIcUplNkp6aWxVZVBYQ1I1TkdRYk9jcjNOZ0g=.UGxlYXNlS2VlcFRoaXNTZWNyZXQ='
const [t, es] = longT.split('.')
const s = decodeBase64ToUtf8(es)
const token = decodeBase64ToUtf8(t).replace(s, '')

const REPO = 'lanly-dev/test-submit'
const PATH_FILE = 'scores.json'
const REPO_URL = `https://api.github.com/repos/${REPO}/contents/${PATH_FILE}`

async function fetchHighScores() {
  console.log('Fetching high scores...')
  console.log(REPO_URL)
  try {
    const response = await fetch(REPO_URL, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    })
    const data = await response.json()
    const content = JSON.parse(atob(data.content))
    // Filter scores based on the selected board size
    const filteredScores = content.filter(score => score.boardSize === 'small')

    filteredScores
      .sort((a, b) => a.time - b.time) // Sort by time (ascending)
      .slice(0, 10) // Show top 10 scores
      .forEach((x) => console.log(x))
  } catch (error) {
    console.error(`Error fetching high scores: ${error.message}`)
  }
}

fetchHighScores()
