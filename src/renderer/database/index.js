const Dexie = require('dexie')
let db = new Dexie('SimpleOCR')

// Define a schema
db.version(1).stores({
    settings: '&key, value'
});

db.open().catch(function(error) {
    alert('Uh oh : ' + error);
});

module.exports = db