import { useState, useEffect } from 'react'
import styles from '../styles/Home.module.css'
import { ParticipantVideo } from "../components/ParticipantVideo";

export default function Home() {
  const [streams, setStreams] = useState({})

  const handleError = (error) => {
    console.error(error)
  }

  useEffect(() => {
    const AgoraRTC = require('agora-rtc-sdk')
    console.warn(AgoraRTC)
    let client = AgoraRTC.createClient({
      mode: "rtc",
      codec: "vp8",
    });

    client.init(process.env.appId);
    client.join(
      process.env.token,
      'TestChannel',
      null,
      (uid) => {
        let localStream = AgoraRTC.createStream({
          audio: true,
          video: true,
        });
        // Initialize the local stream
        localStream.init(()=>{
          // Play the local stream
          localStream.play("me", { fit: 'contain' });
          // Publish the local stream
          client.publish(localStream, (error) => {
            console.error(error)
          });
        }, (error) => {
          console.error(error)
        });
      },
      (error) => {
        console.error(error)
      })

    client.on('stream-added', (evt) => {
      console.log('stream-added')
      client.subscribe(evt.stream, handleError)
    })

    client.on('stream-subscribed', (evt) => {
      console.log('stream-subscribed')
      const stream = evt.stream
      const streamId = String(stream.getId())
      setStreams({
        ...streams,
        [streamId]: {
          stream: stream,
          added: false,
          removed: false,
        },
      })
    })

    client.on('stream-removed', (evt) => {
      console.log('stream-removed')
      const stream = evt.stream
      const streamId = String(stream.getId())

      setStreams(strs => {
        strs[streamId].removed = true
        return { ...strs }
      })
    })

    client.on('stream-unpublished', (evt) => {
      console.log('stream-unpublished')
    })

    client.on('videoTrackEnded', (evt) => {
      console.log('videoTrackEnded')
    })

    client.on("peer-leave", function(evt){
      console.log('peer-leave')
      const stream = evt.stream
      const streamId = String(stream.getId())

      setStreams(strs => {
        strs[streamId].removed = true
        return { ...strs }
      })
    });
  },[])

  useEffect(() => {
    if(!Object.keys(streams).find((streamId) => !streams[streamId].added || streams[streamId].removed)) return

    setStreams(strs => {
      Object.keys(strs).forEach((streamId) => {
        if (!strs[streamId].added) {
          strs[streamId].added = true
          strs[streamId].stream.play(streamId, { fit: 'contain' })
        } else if (strs[streamId].removed) {
          strs[streamId].stream.close()
          delete strs[streamId]
        }
      })
      return { ... strs }
    })
  }, [streams])

  return (
    <div className={styles.container}>
      <h1>Agoraサンプル</h1>
      <div id="me" className={styles.video} />
      {
        Object.keys(streams).map((streamId) => {
          return <ParticipantVideo id={streamId} key={streamId} />
        })
      }
    </div>
  )
}
