import { useEffect } from 'react'

import styles from '@/styles/background.module.css'
import mainStyles from '@/styles/index.module.css'

type Props = {
    children: React.ReactNode
}

export default function Background({ children }: Props) {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // @ts-expect-error particles.js doesn't have types
            import('particles.js').then(() => {
                // @ts-expect-error particlesJS is added to window
                window.particlesJS('particles-js', {
                    particles: {
                        number: {
                            value: 50,
                            density: {
                                enable: true,
                                value_area: 800
                            }
                        },
                        color: {
                            value: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff']
                        },
                        shape: {
                            type: 'circle'
                        },
                        opacity: {
                            value: 0.6,
                            random: true,
                            anim: {
                                enable: true,
                                speed: 1,
                                opacity_min: 0.1,
                                sync: false
                            }
                        },
                        size: {
                            value: 6,
                            random: true,
                            anim: {
                                enable: true,
                                speed: 2,
                                size_min: 2,
                                sync: false
                            }
                        },
                        line_linked: {
                            enable: false
                        },
                        move: {
                            enable: true,
                            speed: 2,
                            direction: 'bottom',
                            random: true,
                            straight: false,
                            out_mode: 'out',
                            bounce: false
                        }
                    },
                    interactivity: {
                        detect_on: 'canvas',
                        events: {
                            onhover: {
                                enable: true,
                                mode: 'repulse'
                            },
                            onclick: {
                                enable: true,
                                mode: 'push'
                            },
                            resize: true
                        },
                        modes: {
                            repulse: {
                                distance: 100,
                                duration: 0.4
                            },
                            push: {
                                particles_nb: 4
                            }
                        }
                    },
                    retina_detect: true
                })
            })
        }
    }, [])

    return (
        <div className={styles.background}>
            <div id="particles-js" className={styles.particles} />
            <div className={mainStyles.twenty48}>
                {children}
            </div>
        </div>
    )
}