import { useState } from 'react'
import './App.css'

interface PlayerResult {
  iconPath?: string
  crossSaveOverride?: number
  applicableMembershipTypes?: number[]
  isPublic?: boolean
  membershipType: number
  membershipId: string
  displayName: string
  bungieGlobalDisplayName: string
  bungieGlobalDisplayNameCode: number
}

const platformName = (type: number) => {
  switch (type) {
    case 1:
      return 'Xbox'
    case 2:
      return 'PlayStation'
    case 3:
      return 'Steam'
    case 4:
      return 'Stadia'
    case 5:
      return 'Amazon'
    case 6:
      return 'Epic'
    default:
      return `Platform ${type}`
  }
}

function App() {
  const [name, setName] = useState('')
  const [players, setPlayers] = useState<PlayerResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('Search for a Destiny 2 player and see the matching accounts.')

  const handleSearch = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Enter a player name or display name first.')
      setPlayers([])
      return
    }

    setError('')
    setInfo('Searching for accounts...')
    setPlayers([])
    setLoading(true)

    try {
      const response = await fetch(
        `http://localhost:3001/api/search-player?name=${encodeURIComponent(trimmed)}`,
      )
      if (!response.ok) {
        throw new Error(`Server error ${response.status}`)
      }

      const data = await response.json()

      if (Array.isArray(data.Response) && data.Response.length > 0) {
        setPlayers(data.Response)
        setInfo(`Found ${data.Response.length} account(s).`)
      } else {
        setPlayers([])
        setInfo('No accounts found. Try a different name or include the full Bungie display name.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setInfo('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <main className="tracker-card">
        <h1>Destiny 2 Player Search</h1>
        <p>
          Enter a player name or display name and the app will show the Destiny 2
          accounts returned by Bungie.
        </p>

        <div className="form-row">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSearch()
              }
            }}
            placeholder="Enter player name, for example Bango#6791"
            disabled={loading}
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        {error && <div className="message error">{error}</div>}
        {!error && <div className="message info">{info}</div>}

        {players.length > 0 && (
          <div className="results">
            <h2>Search results</h2>
            <div className="player-list">
              {players.map((player) => (
                <article
                  key={`${player.membershipType}-${player.membershipId}`}
                  className="player-card"
                >
                  {player.iconPath ? (
                    <img
                      className="platform-icon"
                      src={`https://www.bungie.net${player.iconPath}`}
                      alt={platformName(player.membershipType)}
                    />
                  ) : (
                    <div className="platform-icon placeholder" />
                  )}

                  <div className="player-info">
                    <div className="player-name">
                      {player.displayName}#{player.bungieGlobalDisplayNameCode}
                    </div>
                    <div className="player-bungie">
                      {platformName(player.membershipType)} • ID {player.membershipId}
                    </div>
                    <div className="player-tags">
                      <span className="tag">Public: {player.isPublic ? 'Yes' : 'No'}</span>
                      <span className="tag">Cross-save: {player.crossSaveOverride ?? 'None'}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
