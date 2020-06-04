const url = "https://geo.ipify.org/api/v1?apiKey=at_3ItWfXcFPjP5i796rNgDqRwZoqNZV"
const req = { method: 'GET' }
fetch(url, req)
  .then(res => res.json())
  .then(main)
