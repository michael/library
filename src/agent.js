var Talk = require('../lib/talk/lib/talk');
var Document = require('../lib/document').AnnotatedDocument;
var fs = require('fs');
var _  = require('underscore');

// var schema = JSON.parse(fs.readFileSync(__dirname+ '/../data/schema.json', 'utf-8'));
var emptyDoc = JSON.parse(fs.readFileSync(__dirname+ '/../data/empty_document.json', 'utf-8'));

// Storage interface and implementation
// -----------------

var DocumentStore = function() {

  // In-memory storage, to be replaced with LevelDB
  var documents = {};

  this.get = function(id) {
    return documents[id];
  };

  // TODO: find a good format to store a document incrementally
  this.set = function(id, document) {
    documents[id] = document;
    console.log('JUST STORED A DOCUMENT:', documents);
  };

  // TODO: We need a smart way to deal with this, and just append operations
  // Challenge how do we keep up to date references? (branches, tags)
  // Probably we need to add an operation interface for references
  // ["addref", {"name": "patch-michael" "operation": "a6eac1a63de0ec7df012087e28704c3e"}]
  // Also see: https://github.com/substance/document/issues/2
  this.update = function(id, operations) {
    
  };

  // Deletes a document from the store
  this.del = function(id) {
    delete documents[id];
  };
};


// The Public face the frontend is talking to
// -----------------

var Agent = function(port) {
  var documents = {}; // Open documents
  var lines = {}; // Assign document id to every line
  var talk = new Talk.Server(port);
  var store = new DocumentStore();

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

    console.log('active document editing sessions:', Object.keys(documents));

    // Assign document id to current line
    lines[line.id] = document.id;
  }

  function unregisterDocument(id) {
    var docId = lines[id];
    var doc = documents[docId];

    if (doc && doc.lines.length > 1) {
      doc.lines = _.reject(doc.lines, function(line) {
        return line.id === id
      });
    } else {
      delete documents[docId]
    }

    delete lines[id];
    console.log('line '+id+ ' just hung up.');
  }

  // For a particular line get document
  function getDocument(line) {
    var id = lines[line.id];
    return id ? documents[id].document : null;
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
    // 1. Fetch or create document
    var docSpec = store.get(options.id);

    // Or Create a new doc and store it
    if (!docSpec) {
      docSpec = _.clone(emptyDoc);
      docSpec.id = options.id;
      store.set(options.id, docSpec);
      console.log('created new doc '+options.id);
    } else {
      console.log('loaded existing doc: '+options.id);
    }

    // 2. Create session instance
    var document = new Document(docSpec);

    // 3. Register that doc within documents + add current client to session
    registerDocument(line, document);

    // 4. Send client response (= as fresh JSON)
    cb(null, docSpec);
  });


  // Unregister document when line gets closed
  // -----------------

  talk.handle('documetn:close', function(line, options, cb) {
    unregisterDocument(line.id);
  });


  // Insert Node
  // -----------------

  // Operations might come in batches, since the client 
  talk.handle('document:update', function(line, operations, cb) {
    var document = getDocument(line);

    if (!document) {
      console.log('NO DOCUMENT FOR THIS LINE....');
    }

    _.each(operations, function(op) {
      document.apply(op);
    });

    console.log('new doc json structure:', document.toJSON());

    store.set(document.id, document.toJSON());

    // TODO: in this case the sender should receive a confirmation
    // all other clients users participating in that session should
    // get a copy of the original operation
    broadcastDocUpdate(line, operations);

    // Client response, do we need this here?
    cb(null);
  });
};

module.exports = Agent;