var MongoClient = require('./db');
var setting = require('../setting');


function User(user){
    this.name = user.name;
    this.password = user.password;
};

User.prototype.save = function save(callback){
    var user = {
        name: this.name,
        password: this.password,
    };

    // var mongodb = new MongoClient('mongodb://'+setting.host+':'+setting.port, { useNewUrlParser: true });
    var mongodb = new MongoClient();

    mongodb.connect(function(err){
        if (err)
            return callback(err);
        console.log('Connected to server');

        const db = mongodb.db(setting.db);

        db.collection('users', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            collection.createIndex('name',{unique: true});
            collection.insertOne(user, function(err, user){
                mongodb.close();
                callback(err, user);
            });
        });
    });
};

User.get = function get(username, callback){
    // var mongodb = new MongoClient('mongodb://'+setting.host+':'+setting.port, { useNewUrlParser: true });
    var mongodb = new MongoClient();
    console.log('Connecting to server...');
    mongodb.connect(function(err){
        console.log('Connecting to server.');
        if (err){
            console.log('error: ' + JSON.stringify(err));
            return callback(err);
        }
        
        const db = mongodb.db(setting.db);

        db.collection('users', function(err, collection){
            if (err){
                mongodb.close();
                return callback(err);
            }

            collection.findOne({name: username}, function(err, doc){
                mongodb.close();
                if (doc){
                    var user = new User(doc);
                    callback(err, user);
                }else{
                    callback(err, null);
                }
            });
        });
    });
}

module.exports = User;