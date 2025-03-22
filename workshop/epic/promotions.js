const axios = require('axios')

class EpicGamesAPI {

  async getGames() {
    try {
      const response = await axios.get('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions')

      if (!response.data || !response.data.data || !response.data.data.Catalog || !response.data.data.Catalog.searchStore) {
        console.error('Invalid response format from Epic Games API')
        return null
      }

      const games = response.data.data.Catalog.searchStore.elements
      return games.map(game => ({
        title: game.title || 'Unknown Title',
        description: game.description,
        price: game.price?.totalPrice?.discountPrice || 0,
        isFree: game.price?.totalPrice?.discountPrice === 0,
        status: game.status || 'Unknown Status'
      }))
    } catch (error) {
      console.error('Error fetching games:', error.message)
      return null
    }
  }
}

async function main() {
  const epicApi = new EpicGamesAPI()
  const games = await epicApi.getGames()

  if (games && games.length > 0) {
    console.log('\nEpic Games Store Games:')
    console.log('-'.repeat(50))
    games.forEach(game => {
      console.log(`Title: ${game.title}`)
      if (game.description) {
        console.log(`Description: ${game.description}`)
      }
      console.log(`Price: ${game.isFree ? 'Free' : `$${(game.price / 100).toFixed(2)}`}`)
      console.log(`Status: ${game.status}`)
      console.log('-'.repeat(50))
    })
    console.log(`Total Games: ${games.length}`)
  } else {
    console.log('Failed to fetch games.')
  }
}

main().catch(console.error)
