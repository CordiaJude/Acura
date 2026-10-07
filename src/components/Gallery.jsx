import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { Img } from './ui.jsx'

function useSwipe(onLeft, onRight) {
  const start = useRef(null)
  return {
    onPointerDown: (e) => (start.current = e.clientX),
    onPointerUp: (e) => {
      if (start.current == null) return
      const dx = e.clientX - start.current
      start.current = null
      if (dx > 50) onRight()
      else if (dx < -50) onLeft()
    },
  }
}

export function Lightbox({ photos, index, onIndex, onClose, name }) {
  const ref = useRef(null)
  const n = photos.length
  const prev = () => onIndex((index - 1 + n) % n)
  const next = () => onIndex((index + 1) % n)
  const swipe = useSwipe(next, prev)
  useEffect(() => {
    const d = ref.current
    d?.showModal()
    return () => d?.open && d.close()
  }, [])
  const onKey = (e) => {
    if (e.key === 'ArrowLeft') prev()
    else if (e.key === 'ArrowRight') next()
  }
  return (
    <dialog ref={ref} className="lightbox" aria-label={`${name} photo viewer`} onCancel={(e) => { e.preventDefault(); onClose() }} onKeyDown={onKey}>
      <div className="lb-toolbar glass-dark on-dark">
        <span className="num" aria-live="polite">
          Photo {index + 1} of {n}
        </span>
        <button type="button" className="icon-btn icon-btn-dark" onClick={onClose} aria-label="Close photo viewer" autoFocus>
          <Icon name="close" />
        </button>
      </div>
      <div className="lb-stage" {...swipe}>
        <img src={photos[index]} alt={`${name} — photo ${index + 1} of ${n}`} draggable="false" />
      </div>
      <button type="button" className="lb-arrow prev glass-dark on-dark" onClick={prev} aria-label="Previous photo">
        <Icon name="chevL" size={26} />
      </button>
      <button type="button" className="lb-arrow next glass-dark on-dark" onClick={next} aria-label="Next photo">
        <Icon name="chevR" size={26} />
      </button>
    </dialog>
  )
}

export default function Gallery({ photos, name, stockPhotos }) {
  const [i, setI] = useState(0)
  const [lb, setLb] = useState(false)
  const n = photos.length
  const strip = useRef(null)
  const swipe = useSwipe(() => setI((i + 1) % n), () => setI((i - 1 + n) % n))
  useEffect(() => {
    // Scroll only the thumbnail strip, never the page.
    const s = strip.current
    const t = s?.querySelector(`[data-i="${i}"]`)
    if (!s || !t) return
    const left = t.offsetLeft - s.offsetLeft
    if (left < s.scrollLeft || left + t.offsetWidth > s.scrollLeft + s.clientWidth) s.scrollTo({ left: left - 8, behavior: 'smooth' })
  }, [i])
  return (
    <section className="gallery" aria-label={`${name} photo gallery`}>
      <div className="gallery-main" {...swipe}>
        <button type="button" className="gallery-open" onClick={() => setLb(true)}>
          <span className="sr-only">Open full-screen photo viewer: </span>
          <Img src={photos[i]} alt={`${name} — photo ${i + 1} of ${n}`} eager={i === 0} ratio="4 / 3" />
        </button>
        {stockPhotos && <span className="stock-label">Stock photo</span>}
        <button type="button" className="car-arrow glass-dark prev lg" onClick={() => setI((i - 1 + n) % n)} aria-label="Previous photo">
          <Icon name="chevL" />
        </button>
        <button type="button" className="car-arrow glass-dark next lg" onClick={() => setI((i + 1) % n)} aria-label="Next photo">
          <Icon name="chevR" />
        </button>
        <button type="button" className="photos-pill glass-dark on-dark" onClick={() => setLb(true)}>
          <Icon name="camera" size={18} /> ({n}) Photos
        </button>
      </div>
      <ul className="thumbs" ref={strip} aria-label="Photo thumbnails">
        {photos.map((p, k) => (
          <li key={p + k}>
            <button type="button" data-i={k} className={`thumb${k === i ? ' is-on' : ''}`} aria-current={k === i ? 'true' : undefined} onClick={() => setI(k)} aria-label={`Show photo ${k + 1} of ${n}`}>
              <Img src={p} alt="" ratio="4 / 3" />
            </button>
          </li>
        ))}
      </ul>
      {lb && <Lightbox photos={photos} index={i} onIndex={setI} onClose={() => setLb(false)} name={name} />}
    </section>
  )
}
