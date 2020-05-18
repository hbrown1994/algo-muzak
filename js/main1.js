/*
A piece of artware that takes the user's locataion data and creates a
generative audio/visual composition.

locataion data is parsed in js/getData.js
*/

/*___________________________________________________________________________*/

//Globals: audio context, fft, fft canvas
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode(ctx, { fftSize: 2048 })
const time = ctx.currentTime

//Make oscs, lvls, and pans
var count, oscs = [], lvls = [], pans = []
const panPos = [-1, -0.5, -0.25, 0, 0.25, 0.5, 1.0]
for (i = 0; i < numsSplit.length; i++) {
    oscs.push(new OscillatorNode( ctx ))
    lvls.push(new GainNode( ctx, {gain:0.25}))
    pans.push(new PannerNode( ctx, {positionX: 0}))
}

function adsr (param, peak, val, time, a, d, s, r) {
  const initVal = param.value
  param.setValueAtTime(initVal, time)
  param.linearRampToValueAtTime(peak, time+a)
  param.linearRampToValueAtTime(val, time+a+d)
  param.linearRampToValueAtTime(val, time+a+d+s)
  param.linearRampToValueAtTime(initVal, time+a+d+s+r)
}

// createWaveCanvas is causing an error
// createWaveCanvas({ element: 'section', analyser: fft })

/*___ Data -> Sound _________________________________________________________*/
// console.log(chars)
// console.log(info)
// console.log(nums)
// console.log(numsSplitNorm)
// console.log(numsNorm)
// console.log(numsNormBipolar)
// console.log(numsSplitBipolar)
// console.log(numsNormBipolar)

//dyanmically create arrays and fill
let firstWaveFormReal = []
let firstWaveFormImag = []
let waveForms = []

//lengthen first array since it orginally contains only 2 valuess
for (var i = 0; i < 30; i++) {
  let flip = i%2
  let odd = i%3
  if(odd === 2){firstWaveFormReal.push(numsSplitBipolar[0][flip]*-1)}
    else {firstWaveFormReal.push(numsSplitBipolar[0][flip])}
}

function makeFloatArray(array) {
  let waveTable = array
  let real = new Float32Array(waveTable)
  let imag_array=[]
  for (var i = 0; i < waveTable.length; i++) imag_array.push(0)
  let imag = new Float32Array(imag_array)
  return [real, imag]
}

waveForms.push(
  ctx.createPeriodicWave(
    makeFloatArray(firstWaveFormReal)[0],
    makeFloatArray(firstWaveFormReal)[1]
  )
)

for (var i = 1; i < numsSplitBipolar.length; i++) {
  waveForms.push(
    ctx.createPeriodicWave(
      makeFloatArray(numsSplitBipolar[i])[0],
      makeFloatArray(numsSplitBipolar[i])[1]
    )
  )
}

//calculate array sums
let arrayTotals = []
for (var j = 0; j < numsSplit.length; j++) {
  let total = 0
  for (var i = 0; i < numsSplit[j].length; i++) {
    total = total + numsSplit[j][i]
  }
  arrayTotals.push(total)
}

//first gesture in seconds
const gestureTime0 = arrayTotals[0]*2;
const gestureTime1 = arrayTotals[1]/2;
const gestureTime2 = arrayTotals[2]/2;
const gestureTime3 = arrayTotals[3]/2;
const gestureTime4 = arrayTotals[4]/2;
const gestureTime5 = arrayTotals[5]/4
const gestureTime6 = arrayTotals[6]/2;

/*_Section 1_________________________________________________________________*/
//NEED TO ADD ADSR FOR RANDOM FADE IN AND OUTS INTO 2ND SECTION TRANSITION

for (var j = 0; j < waveForms.length; j++) {
  let scale = 6, add=40;

  //init synths
  //set freqs
  oscs[j].setPeriodicWave(waveForms[j])
  oscs[j].frequency.setValueAtTime(((numsSplit[j][0]*scale)+add), time)
  for (var i = 1; i < numsSplit[j].length; i++) {
    oscs[j].frequency.linearRampToValueAtTime(
      (numsSplit[j][i]*scale)+add,
      time + ((gestureTime0/numsSplit[j].length)*i)
    )
  }
  //set pans
  pans[j].positionX.linearRampToValueAtTime(panPos[j], time + gestureTime0)

  oscs[j].connect(pans[j])
  pans[j].connect(lvls[j])
  lvls[j].connect(ctx.destination)
  oscs[j].start(ctx.currentTime) // start now
  oscs[j].stop(ctx.currentTime + gestureTime0) // stop 2 seconds later
}
