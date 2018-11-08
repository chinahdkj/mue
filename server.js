var express = require('express');
var app = express();
app.use(express.static('dist'));
app.get('/', function (req, res) {
    res.location('/dist/index.html');
})
var server = app.listen(8087, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("address: http://%s:%s", host, port)
})
