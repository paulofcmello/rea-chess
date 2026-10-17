import { useSettings } from '../lib/storage'
import { boardUrl, pieceUrl } from '../lib/theme'

export function BoardPreview({ fen, orientation = 'white' }: { fen: string; orientation?: 'white' | 'black' }) {
  const [settings] = useSettings()
  const pieces = fen.split(' ')[0].split('/').flatMap((row, rowIndex) => {
    let file = 0
    return [...row].flatMap((piece) => {
      if (/\d/.test(piece)) {
        file += Number(piece)
        return []
      }
      const x = file++
      if (!/[prnbqk]/i.test(piece)) return []
      const rank = 7 - rowIndex
      const code = `${piece === piece.toUpperCase() ? 'w' : 'b'}${piece.toLowerCase()}`
      return <img key={`${x}-${rank}`} src={pieceUrl(code, settings.pieceSet, 150)} alt="" loading="lazy" draggable={false}
        style={{ left: `${(orientation === 'white' ? x : 7 - x) * 12.5}%`, bottom: `${(orientation === 'white' ? rank : 7 - rank) * 12.5}%` }} />
    })
  })
  return <div className="board-preview" role="img" aria-label={`Chess position, ${orientation} at the bottom`} style={{ backgroundImage: `url(${boardUrl(settings.board)})` }}>{pieces}</div>
}
