function main(json) {

  /*_____PARSE_DATA_______*/
  let chars = [], c0 = ' '.charCodeAt(0),  cN = '~'.charCodeAt(0);
  for (; c0 <= cN; ++c0) {chars.push(String.fromCharCode(c0))}

  let nums = []
  let numsNorm = []
  let numsNormBipolar = []
  let numsSplit = []
  let numsSplitNorm = []
  let numsSplitBipolar = []
  let info = []

  info.push(json['location']['country'])
  info.push(json['location']['region'])
  info.push(json['location']['city'])
  info.push(json['location']['postalCode'])
  info.push(JSON.stringify(json['location']['lat']))
  info.push(JSON.stringify(json['location']['lng']))
  info.push(json['location']['timezone'])
  info.push(json['ip'])
  info.push(json['isp'])

  // if getting data fails, fill with Hunter's data
  if (info.length === 0) {
    info = [ "US", "Illinois", "Chicago", "60290", "41.85003", "-87.65005", "-05:00", "73.44.30.245", "Comcast Cable Communications, LLC"]
  }

  //Make empty multi-dim arrays to fill w/nums
  for (var t = 0; t < info.length; t++) numsSplit.push([])
  for (var n = 0; n < info.length; n++) numsSplitNorm.push([])
  for (var  b = 0; b < info.length; b++) numsSplitBipolar.push([0])

  //Store char vaules into split arrays and normalize (bipolar and standard)
  for (var j = 0; j < info.length; j++) {
    for (var a = 0; a < info[j].length; a++) {
      for (var p = 0; p < chars.length; p++) {
       if (info[j][a] === chars[p]) {
         numsSplit[j].push(p) //split Nums
         numsSplitNorm[j].push(p/chars.length) //split nums 0.0-1.0

         //if p < size of array, make negative else make positive (for wavetables)
         if (chars[p] < (chars.length/2)) {numsSplitBipolar[j].push(p/chars.length)}
          else {numsSplitBipolar[j].push((p/chars.length) * -1)}
        }
      }
    }
  }

  //concat aboves arrays together into one array
  for (var y = 0; y < numsSplit.length; y++) nums = nums.concat(numsSplit[y])

  //normalize (0 - 1)
  for (var m = 0; m < numsSplit.length; m++) {
    numsNorm = numsNorm.concat(numsSplitNorm[m])
  }
  //normalize/bipolar (-1 - 1)
  for (var o = 0; o < numsSplitBipolar.length; o++) {
    numsNormBipolar = numsNormBipolar.concat(numsSplitBipolar[o])
  }

  /*___AUDIO___________________________________________________________________*/
  //audio context, fft, fft canvas
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const fft = new AnalyserNode(ctx, { fftSize: 2048 })
  const time = ctx.currentTime

  //FUNCTIONS____________________________________________________________________
  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  function adsrExp (param, initVal, peak, val, t, a, d, s, r) {
    param.setValueAtTime(initVal, t)
    param.exponentialRampToValueAtTime(peak, t+a)
    param.exponentialRampToValueAtTime(val, time+a+d)
    param.exponentialRampToValueAtTime(val, time+a+d+s)
    param.linearRampToValueAtTime(initVal, time+a+d+s+r)
    //linear ramp sounds better on release
  }

  //make array of random numbers that equal a given sum
  function randomNumSum(numVals, scale) {
  let atks =[], atksDiv =[], sum = 0
  for (var i = 0; i < numVals; i++) {
    let atk = Math.random()
    atks.push(atk)
    sum = sum + atk
  }
  for (var i = 0; i < atks.length; i++) {
    let norm = (atks[i]/sum)*scale
    atksDiv.push(norm)
  }
  return atksDiv
  }

  //oscs, lvls, and pans
  var count, oscs = [], lvls = [], pans = []
  let panPos = [-1, 0, 1]
  panPos = shuffle(panPos)
  for (i = 0; i < numsSplit.length; i++) {
      oscs.push(new OscillatorNode( ctx ))
      lvls.push(new GainNode( ctx, {gain:0.25}))
      pans.push(new PannerNode( ctx, {positionX: 0}))
  }

  createWaveCanvas({
    element: 'section',
    analyser: fft,
    fill: '#000',         // optional, background color
    stroke: '#fff'        // optional, wave line color
  })

  createFrequencyCanvas({
      element:'body',
      analyser:fft,
      scale:5,
      background: '#000',
      color:'cyan'
  })

  /*___ Data -> Sound _________________________________________________________*/
  //dyanmically create arrays and fill
  let firstWaveFormReal = [0]
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
    let real = new Float32Array(array)
    let imag_array=[]
    for (var i = 0; i < array.length; i++) imag_array.push(0)
    let imag = new Float32Array(imag_array)
    return [real, imag]
  }

  //Add extended first array
  waveForms.push(
    ctx.createPeriodicWave(
      makeFloatArray(firstWaveFormReal)[0],
      makeFloatArray(firstWaveFormReal)[1]
    )
  )

  //add the rest (thats why i=1 here)
  for (var i = 1; i < numsSplitBipolar.length; i++) {
    waveForms.push(
      ctx.createPeriodicWave(
        makeFloatArray(numsSplitBipolar[i])[0],
        makeFloatArray(numsSplitBipolar[i])[1]
      )
    )
  }

  //shuffle for variety
  waveForms = shuffle(waveForms)

  //calculate sum of items in an array
  let arraySums = []
  for (var j = 0; j < numsSplit.length; j++) {
    let total = 0
    for (var i = 0; i < numsSplit[j].length; i++) {
      total = total + numsSplit[j][i]
    }
    arraySums.push(total)
  }

  //sum of all items in arrays -> total time of piece
  let totalTime = 0
  for (var i = 0; i < 7; i++) totalTime = totalTime + arraySums[i]

  /*_Section 1_________________________________________________________________*/
  for (var j = 0; j < waveForms.length; j++) {
    let scale = 5, add=40; //scale freqs, (add determines lowest pitch)

    //random scalr of 5 or 6
    scale = Math.round(Math.random())+5;

    oscs[j].connect(pans[j])
    pans[j].connect(lvls[j])
    lvls[j].connect(fft)
    lvls[j].connect(ctx.destination)

    //init synths & set freqs
    oscs[j].setPeriodicWave(waveForms[j])
    oscs[j].frequency.setValueAtTime(((numsSplit[j][0]*scale)+add), time)

    //set freq ramps from data arrays
    for (var i = 1; i < numsSplit[j].length; i++) {
      oscs[j].frequency.linearRampToValueAtTime(
        (numsSplit[j][i]*scale)+add,
        time + ((totalTime/numsSplit[j].length)*i)
      )
    }

    //set pans -> random/even across setero field
    if (j%3 === 1) panPos = shuffle(panPos)
    pans[j].setPosition(panPos[j%3],0,0)

    //set adsr
    let adsrArr = randomNumSum(4, totalTime/4)
    adsrExp(lvls[j].gain,0.00001,0.4,0.2,time,adsrArr[0],adsrArr[1],adsrArr[2],adsrArr[3])

    //run it
    oscs[j].start(ctx.currentTime ) // start now
    oscs[j].stop(ctx.currentTime + totalTime + 1 )
  }
}
