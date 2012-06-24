var express = require('express');
var app     = express.createServer();
var fs      = require('fs');
var _       = require('underscore');


// Load config defaults from JSON file.
// Environment variables override defaults.
function loadConfig() {
  var config = JSON.parse(fs.readFileSync(__dirname+ '/config.json', 'utf-8'));
  for (var i in config) {
    config[i] = process.env[i.toUpperCase()] || config[i];
  }
  console.log('Configuration');
  console.log(config);
  return config;
}

var config = loadConfig();


// Web Server
// =============

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname));
app.listen(3000);

console.log('Server started @ '+ config.server_port);

