import { useState, useCallback } from 'react'
import Image from 'next/image'
import Modal from 'react-modal'
import useEmblaCarousel from 'embla-carousel-react'
import {ReactSVG} from 'react-svg'

import Tile2 from '@/assets/tiles/2.jpg'
import Tile4 from '@/assets/tiles/4.jpg'
import Tile8 from '@/assets/tiles/8.jpg'
import Tile16 from '@/assets/tiles/16.jpg'
import Tile32 from '@/assets/tiles/32.jpg'
import Tile64 from '@/assets/tiles/64.jpg'
import Tile128 from '@/assets/tiles/128.jpg'
import Tile256 from '@/assets/tiles/256.jpg'
import Tile512 from '@/assets/tiles/512.jpg'
import Tile1024 from '@/assets/tiles/1024.jpg'
import Tile2048 from '@/assets/tiles/2048.jpg'
import GalleryIcon from '@/assets/gallery-icon.svg'

import styles from '@/styles/tile-gallery.module.css'

const tileImages = [
  { src: Tile2, label: '2' },
  { src: Tile4, label: '4' },
  { src: Tile8, label: '8' },
  { src: Tile16, label: '16' },
  { src: Tile32, label: '32' },
  { src: Tile64, label: '64' },
  { src: Tile128, label: '128' },
  { src: Tile256, label: '256' },
  { src: Tile512, label: '512' },
  { src: Tile1024, label: '1024' },
  { src: Tile2048, label: '2048' },
]

Modal.setAppElement('#__next')

const customModalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '0',
    border: 'none',
    borderRadius: '16px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'hidden',
    background: '#1a1a2e',
  },
}

export default function TileGallery() {
  const [isOpen, setIsOpen] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <>
      <button className={styles.galleryButton} onClick={openModal}>
        <ReactSVG src={GalleryIcon.src} />
      </button>

      <Modal
        isOpen={isOpen}
        onRequestClose={closeModal}
        style={customModalStyles}
      >
        <div className={styles.modalContent}>
          <button className={styles.closeButton} onClick={closeModal}>
            ×
          </button>          
          <div className={styles.carouselContainer}>
            <div className={styles.embla} ref={emblaRef}>
              <div className={styles.emblaContainer}>
                {tileImages.map((tile, index) => (
                  <div className={styles.emblaSlide} key={index}>
                    <Image
                      src={tile.src}
                      alt={`Tile ${tile.label}`}
                      width={300}
                      height={300}
                      className={styles.tileImage}
                    />
                    <p className={styles.tileLabel}>{tile.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <button className={styles.navButton} onClick={scrollPrev} aria-label="Previous">
              ‹
            </button>
            <button className={`${styles.navButton} ${styles.navButtonNext}`} onClick={scrollNext} aria-label="Next">
              ›
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
