var opbeat = require('opbeat').start()

var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(opbeat.middleware.express())

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/pizarra-tactica-baloncesto', function(request, response) {
  response.render('pages/pizarra-tactica-baloncesto');
});

app.get('/mapa', function(request, response) {
  response.render('pages/map');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


