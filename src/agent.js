var Talk = require('../lib/talk/lib/talk');
var Document = require('../lib/document/document');
var fs = require('fs');

var schema = JSON.parse(fs.readFileSync(__dirname+ '/../data/schema.json', 'utf-8'));


var Agent = function(port) {
  var documents = {}; // Open documents
  var talk = new Talk.Server(port);

  // Utils
  // -----------------

  function registerDocument(line, document) {
    documents[document._id] = {
      document: document,
      lines: line
    };
  }

  // Create Document
  // -----------------

  talk.handle('document:create', function(line, message, cb) {
    console.log('handler.. doc:create called', message.name);
    
    // 1. create a new doc
    var document = Document.create(schema);

    // 2. register that doc within documents + add current client to session
    registerDocument(line, document);
    
    // 3. send client response (= fresh document data)
    cb(null, {"document": document.toJSON()});
  });


  // Open Document
  // -----------------

  talk.handle('document:open', function(socket, message, cb) {
    
  });

  // Insert Node
  // -----------------

  talk.handle('node:insert', function(socket, message, cb) {
    console.log('inserting a node');

    talk.broadcast(message);

    // Client response, do we need this here?
    // cb(null, {"status": "ok"});
  });
};

module.exports = Agent;