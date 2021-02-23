import { useEffect } from 'react'
import styles from '../styles/Home.module.css'

export function ParticipantVideo({ id }) {
  return (
    <div>
      Participant
      <div id={id} className={styles.video}></div>
    </div>
  )
}
