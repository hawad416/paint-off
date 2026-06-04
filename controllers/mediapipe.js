// controllers/mediapipe.js
// Isaac owns this file.
// Initializes MediaPipe Hands + webcam.
// Exposes window.handData for any screen to consume.

window.handData = []

function initMediaPipe() {
  const video = document.createElement('video')
  video.style.display = 'none'
  video.setAttribute('playsinline', '')
  document.body.appendChild(video)

  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  })

  hands.setOptions({
    maxNumHands: 4,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.6,
  })

  hands.onResults((results) => {
    window.handData = []
    if (!results.multiHandLandmarks) return

    results.multiHandLandmarks.forEach((landmarks) => {
      const tip = landmarks[8]
      // Stable-ish ID from quantized position
      const id = `${Math.round(tip.x * 10)}_${Math.round(tip.y * 10)}`
      const player = tip.x > 0.5 ? 'p1' : 'p2'
      window.handData.push({ landmarks, player, id })
    })
  })

  navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
    .then((stream) => {
      video.srcObject = stream
      video.onloadedmetadata = () => {
        const camera = new Camera(video, {
          onFrame: async () => { await hands.send({ image: video }) },
          width: 1280,
          height: 720,
        })
        camera.start()
        console.log('MediaPipe camera started')
      }
    })
    .catch((err) => console.warn('MediaPipe camera error:', err.message))
}

function getAudienceHandCount() {
  return window.handData.length
}