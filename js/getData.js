function getInfo (callback) {
  let array = []
  const url = "https://geo.ipify.org/api/v1?apiKey=at_3ItWfXcFPjP5i796rNgDqRwZoqNZV"
  const req = { method: 'GET' }
  fetch(url, req)
    .then(res => res.json())
    .then(data => {
      array.push(data['location']['country'])
      array.push(data['location']['region'])
      array.push(data['location']['city'])
      array.push(data['location']['postalCode'])
      array.push(JSON.stringify(data['location']['lat']))
      array.push(JSON.stringify(data['location']['lng']))
      array.push(data['location']['timezone'])
      array.push(data['ip'])
      array.push(data['isp'])
    })
    return array
}
