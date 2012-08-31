var Talk = require('../lib/talk/lib/talk');
var Document = require('../lib/document');
var fs = require('fs');

var schema = JSON.parse(fs.readFileSync(__dirname+ '/../data/schema.json', 'utf-8'));
var emptyDoc = JSON.parse(fs.readFileSync(__dirname+ '/../data/empty_document.json', 'utf-8'));

var Agent = function(port) {
  var documents = {}; // Open documents
  var lines = {}; // Assigns an active document to an open line
  var talk = new Talk.Server(port);

  // Utils
  // -----------------

  function registerDocument(line, document) {
    documents[document.id] = {
      document: document,
      lines: line
    };

    console.log('registered docs', documents);
  }

  // Broadcasts the latest confirmed operation to all active sessions
  // but leaves out the original sender, as the op is already applied
  function broadcastDocUpdate(line, message) {
    talk.lines.forEach(function() {
      
    });
  }

  // Create Document
  // -----------------

  talk.handle('document:create', function(line, data, cb) {
    console.log('handler.. doc:create called', data);
    
    // 1. create a new doc
    // var document = Document.create(schema);
    var document = _.clone(emptyDoc);


    // 2. register that doc within documents + add current client to session
    registerDocument(line, document);
    
    // 3. send client response (= fresh document data)
    cb(null, {"document": document.toJSON()});
  });

  // Open Document
  // -----------------

  talk.handle('document:open', function(line, data, cb) {
    // TODO: open an existing document
    // We could a doc from an active session from memory,
    // until we have a database setup
  });

  // Insert Node
  // -----------------

  talk.handle('document:update', function(line, message, cb) {
    console.log('inserting a node');

    // TODO: in this case the sender should receive a confirmation
    // all other clients users participating in that session should
    // get a copy of the original operation
    talk.broadcast(message);

    // Client response, do we need this here?
    // cb(null, {"status": "ok"});
  });
};

module.exports = Agent;