// BgSlideshow.jsx
// Renders 5 images side by side and animates them scrolling left in a loop.
// When the last image exits, it seamlessly loops back to the first.

import img911 from '../assets/911 (1).jpeg'
import imgGtr from '../assets/GTR.jpeg'
import imgPurple from '../assets/purple.jpg'
import imgZoro from '../assets/ZORO.jpg'
import imgLuffyGear5 from '../assets/LUFFY GEAR 5 WALLPAPER PC.jpeg'
// You can add more images later, but `index.css` is currently tuned for the IMAGES count.

const IMAGES = [
  { url: img911, label: '911' },
  { url: imgGtr, label: 'GTR' },
  { url: imgPurple, label: 'Purple' },
  { url: imgZoro, label: 'Zoro' },
  { url: imgLuffyGear5, label: 'Luffy Gear 5' },
]

export default function BgSlideshow() {
  return (
    // Outer wrapper: clips overflow so only one image shows at a time
    <div className="slideshow-wrapper" aria-hidden="true">
      {/*
        Inner track: holds all images laid out horizontally.
        CSS animation slides this track leftward continuously.
        We duplicate the images (10 total) so the loop is seamless:
        when the first 5 scroll off, the duplicate 5 are already in view.
      */}
      <div className="slideshow-track">
        {[...IMAGES, ...IMAGES].map((img, i) => (
          <div
            key={i}
            className="slideshow-slide"
            style={{ backgroundImage: `url(${img.url})` }}
            role="img"
            aria-label={img.label}
          />
        ))}
      </div>

      {/* Dark overlay so UI text stays readable over any image */}
      <div className="slideshow-overlay" />
    </div>
  )
}