var Talk = require('../lib/talk/lib/talk');
var Document = require('../lib/document').AnnotatedDocument;
var fs = require('fs');
var _  = require('underscore');

// var schema = JSON.parse(fs.readFileSync(__dirname+ '/../data/schema.json', 'utf-8'));
var emptyDoc = JSON.parse(fs.readFileSync(__dirname+ '/../data/empty_document.json', 'utf-8'));

var Agent = function(port) {
  var documents = {}; // Open documents
  var lines = {}; // Assign document id to every line
  var talk = new Talk.Server(port);

  // Utils
  // -----------------

  function registerDocument(line, document) {
    console.log('registering document... on line:', line.id);

    // Keep track of document session
    if (documents[document.id]) {
      documents[document.id].lines.push(line);
    } else {
      documents[document.id] = {
        document: document,
        lines: [line]
      };      
    }

    // Assign document id to current line
    lines[line.id] = document.id;
  }

  function unregisterDocument(id) {
    var docId = lines[id];
    var doc = documents[docId];

    if (doc.lines.length > 1) {
      doc.lines = _.reject(doc.lines, function(line) {
        return line.id === id
      });
    } else {
      delete documents[docId]
    }

    delete lines[id];
  }

  // Broadcasts the latest confirmed operation to all active sessions
  // but leaves out the original sender, as the op is already applied
  function broadcastDocUpdate(line, message) {
    talk.lines.forEach(function() {
      
    });
  }

  
  // Bind handlers
  // -----------------

  talk.on('close', function(line) {
    unregisterDocument(line.id);
  });


  // Open Document
  // -----------------

  talk.handle('document:open', function(line, options, cb) {
    // TODO: serve DB from database if exists. Max, over to you. :)

    // 1. Create a new doc
    var documentSpec = _.clone(emptyDoc);
    documentSpec.id = options.id;
    var document = new Document(documentSpec);

    // 2. Register that doc within documents + add current client to session
    registerDocument(line, document);

    // 3. Send client response (= as fresh JSON)
    cb(null, {"document": documentSpec});
  });

  talk.handle('documetn:close', function(line, options, cb) {

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