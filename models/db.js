var setting = require('../setting');
var MongoClient = require('mongodb').MongoClient;



function mongodb(){   
    var url = 'mongodb://'+setting.host+':'+setting.port;
    console.log('url: '+url);
    return new MongoClient(url, { useNewUrlParser: true });
}

module.exports = mongodb;