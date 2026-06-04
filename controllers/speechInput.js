// controllers/speechInput.js
// Web Speech API word capture, triggered by arcade button.
// Hawa owns this file.

let recognition = null

function initSpeechInput() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    console.warn('Speech recognition not supported.')
    return
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition = new SpeechRecognition()
  recognition.lang = 'en-US'
  recognition.interimResults = false
  recognition.maxAlternatives = 1
}

function startListening(onResult) {
  if (!recognition) return
  recognition.onresult = (event) => {
    const word = event.results[0][0].transcript.trim().split(' ')[0]
    onResult(word)
  }
  recognition.start()
}

function stopListening() {
  if (recognition) recognition.stop()
}
