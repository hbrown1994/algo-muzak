//______ Generate array of chars for decoding into numbers ________
let chars = [], c0 = ' '.charCodeAt(0),  cN = '~'.charCodeAt(0);
for (; c0 <= cN; ++c0) {chars.push(String.fromCharCode(c0))}

/*______Get Location and Internet Provider Info and store into an array_______*/
init ip-api to retrieve data
const endpoint = 'http://ip-api.com/json/?fields=country,countryCode,city,zip,lat,lon,org,query';

//function that "gets" the user's info, returns data as an array when called
function getInfo () {
  let data = []
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var r = JSON.parse(this.responseText);
      data = [r.countryCode,r.city,r.zip,String(r.lat),String(r.lon),r.org,r.query]
    }
  }
  xhr.open('GET', endpoint, false) //must be synchronous!
  xhr.send()
  return data
}

//store getInfo(); to an array & array for storing char vaules
let info = getInfo();

console.log(info.length);

//if getInfo() fails, fill with Hunter's data
if (info.length === 0) {
  info = ["US", "Chicago", "60615", "41.8018", "-87.5993", "Comcast IP Services, L.L.C.", "73.44.30.245"]
}



let nums = []
let numsNorm = []
let numsNormBipolar = []
let numsSplit = []
let numsSplitNorm = []
let numsSplitBipolar = []

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
//nums normalized
for (var m = 0; m < numsSplit.length; m++) {
  numsNorm = numsNorm.concat(numsSplitNorm[m])
}
//nums normalized/bipolar
for (var o = 0; o < numsSplitBipolar.length; o++) {
  numsNormBipolar = numsNormBipolar.concat(numsSplitBipolar[o])
}

console.log(chars)
console.log(info)
console.log(nums)
console.log(numsSplitNorm)
console.log(numsNorm)
console.log(numsNormBipolar)
console.log(numsSplitBipolar)
console.log(numsNormBipolar)
