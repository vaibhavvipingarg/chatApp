/**
 * Created by vgarg on 4/16/2015.
 */
var express = require('express');
var app = express();

var port = process.env.port || 8080;
var io = require('socket.io').listen(app.listen(port));
app.set('view engine', 'html');
    app.engine('html', require('ejs').renderFile);
    app.set('views', __dirname + '/views');
    app.use(express.static(__dirname + '/public'));

   app.get('/', function(req, res){
        res.render('home');
    });

    app.get('/create', function(req, res){
        var chatId = Math.round(Math.random() * 100000);
        res.redirect('/chat/' + chatId);
    });

    app.get('/chat/:id', function(req, res){
        res.render('chat');
    });
    var chats = {};
    var chat = io.on('connection', function(socket){
        socket.on('load', function(chatId){
           // get the chat Id and find if there are already users in this chatId
            var chatRoom = findClientsSocket(io, chatId);
            if(chatRoom.length === 0 ) {
                socket.emit('createChat', {number: 0});
                chats[chatId] = [];
            }
            else {
                var people = [];
                var num = 0;
                for(var i = 0; i < chatRoom.length; i++){
                    people.push({user: chatRoom[i].userName,
                                 avatar: chatRoom[i].avatar});
                    num++;
                }
                socket.emit('createChat', {
                    number: num,
                    people: people,
                    id: chatId
                });
            }
        });

        socket.on('login', function(user){
            var chatRoom = findClientsSocket(io, user.chatId);
            console.log('login entered');
            socket.userName = user.user;
            socket.email = user.avatar;
            socket.room = user.chatId;

            socket.join(user.chatId);
            console.log('socket joined');
            var usernames = [],
                avatars = [];

            for (var i = 0; i< chatRoom.length; i++){
                usernames.push(chatRoom[i].userName);
                usernames.push(socket.userName);
                avatars.push(chatRoom[i].avatar);
                avatars.push(socket.avatar);
            }

            // Send the startChat event to all the people in the
            // room, along with a list of people that are in it.
            if (usernames.length < 1){
                console.log('username < 1');
            } else if (usernames.length == 2){
                console.log('username < 2');
                chat.in(user.chatId).emit('startChat', {
                    boolean: true,
                    id: user.chatId,
                    users: usernames,
                    avatars: avatars
                });
            } else {
                chat.in(user.chatId).emit('joinChat', {
                    boolean: true,
                    id: user.chatId,
                    users: usernames,
                    avatars: avatars,
                    msgs: chats[user.chatId]
                });
            }
        });

        // Somebody left the chat
        socket.on('disconnect', function() {

            // Notify the other person in the chat room
            // that his partner has left

            socket.broadcast.to(this.room).emit('leave', {
                boolean: true,
                room: this.room,
                user: this.username,
                avatar: this.avatar
            });

            // leave the room
            socket.leave(socket.room);
        });

        // Handle the sending of messages
        socket.on('msg', function(data){

            // When the server receives a message, it sends it to the other person in the room.
            var msg = {msg: data.msg, user: data.user, img: data.img};
            socket.broadcast.to(socket.room).emit('receive', msg);
            chats[data.id].push(msg);
        });
    });

function findClientsSocket(io, roomId, namespace) {
    var res = [],
        ns = io.of(namespace ||"/");    // the default namespace is "/"

    if (ns) {
        for (var id in ns.connected) {
            if(roomId) {
                var index = ns.connected[id].rooms.indexOf(roomId) ;
                if(index !== -1) {
                    res.push(ns.connected[id]);
                }
            }
            else {
                res.push(ns.connected[id]);
            }
        }
    }
    return res;
}


console.log('Chat server started on port' + port);
