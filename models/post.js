var MongoClient = require('./db');
var setting = require('../setting');

function Post(username, post, time){
    this.user = username;
    this.post = post;
    if (time) {
        this.time = time;
    } else {
        this.time = new Date();
    }
}

Post.prototype.save = function save(callback){
    var post = {
        user : this.user,
        post : this.post,
        time : this.time,
    };

    var mongodb = new MongoClient();

    mongodb.connect(function(err){
        if (err) {
            return callback(err);
        }

        const db = mongodb.db(setting.db);

        db.collection('posts', function(err, collection){
            if (err){
                mongodb.close();
                return callback(err);
            }

            collection.createIndex('user');
            collection.insertOne(post, function(err, post){
                mongodb.close();
                return callback(err, post);
            });
        });
    });
}

Post.get = function get(username, callback){
    var mongodb = new MongoClient();
    mongodb.connect(function(err){
        if (err){
            return callback(err);
        }
        
        const db = mongodb.db(setting.db);

        db.collection('posts', function(err, collection){
            if (err){
                mongodb.close();
                return callback(err);
            }

            var query = {};

            if (username) {
                query.user = username;
            }

            collection.find(query).sort({time:-1}).toArray(function(err, docs){
                if (err){
                    mongodb.close();
                    callback(err, null);
                }

                var posts = [];
                docs.forEach(function(doc, index){
                    var post = new Post(doc.user, doc.post, doc.time);
                    posts.push(post);
                });
                mongodb.close();
                callback(null, posts);
            });
        });
    });
};

module.exports = Post;