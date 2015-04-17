/**
 * Created by vgarg on 4/16/2015.
 */
var express = require('express');

module.exports = function(app, io){
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

    var chat = io.on('connection', function(socket){
        socket.on('load', function(chatId){
           // get the chat Id and find if there are already users in this chatId
            var chatRoom = findClientsSocket(io, chatId);
            var temp = {
                number: 0,
                peopleInChat : []
            }
            for (var i = 0; i< chatRoom.length; i++){
                temp.number = temp.number + 1;
                var temp2 = {};
                temp2.user = chatRoom[i].username;
                temp2.avatar = chatRoom[i].avatar;
                temp2.chatId = chatId;
                temp.peopleInChat.push(temp2);
            }
            socket.emit('joinChat' , temp);
        });

        socket.on('login', function(user){
            var chatRoom = findClientsSocket(io, user.chatId);
            socket.userName = user.name;
            socket.email = user.avatar;
            socket.room = user.chatId;

            socket.join(user.chatId);

            var usernames = [],
                avatars = [];

            for (var i = 0; i< chatRoom.length; i++){
                usernames.push(chatRoom[i].username);
                usernames.push(socket.username);
                avatars.push(chatRoom[i].avatar);
                avatars.push(socket.avatar);
            }

            // Send the startChat event to all the people in the
            // room, along with a list of people that are in it.

            chat.in(user.chatId).emit('startChat', {
                boolean: true,
                id: user.chatId,
                users: usernames,
                avatars: avatars
            });

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
            socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
        });
    });
};

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
