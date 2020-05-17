/*
A piece of artware that takes the user's locataion data and creates a
generative audio/visual composition.

locataion data is parsed in js/getData.js
*/

/*___________________________________________________________________________*/

//Globals: audio context, fft, fft canvas
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode(ctx, { fftSize: 2048 })

//createWaveCanvas is causing an error
// createWaveCanvas({ element: 'section', analyser: fft })

/*___ Data -> Sound _________________________________________________________*/
console.log(chars)
console.log(info)
console.log(nums)
console.log(numsSplitNorm)
console.log(numsNorm)
console.log(numsSplitBipolar)
console.log(numsNormBipolar)
