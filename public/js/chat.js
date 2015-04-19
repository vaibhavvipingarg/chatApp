/**
 * Created by vgarg on 4/16/2015.
 */
$(function(){
    var chatId = Number(window.location.pathname.match(/\/chat\/(\d+)$/)[1]);
    var socket = io();

    socket.on('connect', function(){
        socket.emit('load', chatId);
    });

    // variables which hold the data for each person
    var name = "",
        email = "",
        img = "",
        friend = "";

    // cache some jQuery objects
    var section = $(".section"),
        footer = $("footer"),
        onConnect = $(".connected"),
        inviteSomebody = $(".invite-textfield"),
        personInside = $(".personinside"),
        chatScreen = $(".chatscreen"),
        left = $(".left"),
        noMessages = $(".nomessages"),
        tooManyPeople = $(".toomanypeople");

    // some more jquery objects
    var chatNickname = $(".nickname-chat"),
        leftNickname = $(".nickname-left"),
        loginForm = $(".loginForm"),
        yourName = $("#yourName"),
        yourEmail = $("#yourEmail"),
        hisName = $("#hisName"),
        hisEmail = $("#hisEmail"),
        chatForm = $("#chatform"),
        textarea = $("#message"),
        messageTimeSent = $(".timesent"),
        chats = $(".chats");

    // these variables hold images
    var ownerImage = $("#ownerImage"),
        leftImage = $("#leftImage"),
        noMessagesImage = $("#noMessagesImage");


    socket.on('createChat', function(data){
        showMessage('connected', {});
        if (data.number === 0) {
            //make signup and invite more people
            var chatUrl = '' + chatId;
            loginForm.on('submit', function(e){
                e.preventDefault();
                name = $.trim(yourName.val());
                if(name.length < 1){
                    alert("Please enter a nick name longer than 1 character!");
                    return;
                }
                email = yourEmail.val();
                if(!isValid(email)){
                    alert("Wrong e-mail format!");
                }
                else {
                    showMessage('invitePeople', {chatUrl: chatUrl});
                    socket.emit('login', {user: name, avatar: email, chatId: chatId});
                }
            });


        } else {
            //display all the people already in the chat
            var peopleInChat = data.people;
            showMessage('showPeople', peopleInChat);
            loginForm.on('submit', function(e){
                e.preventDefault();
                name = $.trim(yourName.val());
                if(name.length < 1){
                    alert("Please enter a nick name longer than 1 character!");
                    return;
                }
                email = yourEmail.val();
                if(!isValid(email)){
                    alert("Wrong e-mail format!");
                }
                else {
                    showMessage('startChat', {chatUrl: chatUrl});
                    socket.emit('login', {user: name, avatar: email, chatId: chatId});
                }
            });
            //make the user signup, once done, then redirect
        }

    });

    //Called when there is already 1 logged in user
    socket.on('startChat', function(data){
        console.log(data);
        if(data.boolean && data.id == chatId) {

            chats.empty();

            if(name === data.users[0]) {

                showMessage("youStartedChatWithNoMessages",data);
            }
            else {

                showMessage("theyStartedChatWithNoMessages",data);
            }

            var friendNames = '';
            for (var i = 0; i < data.users.length; i++){
                if (data.users[i].name !== name) {
                    friendNames += data.users[i].name + ', ';
                }
            }
            chatNickname.text(friendNames);
        }
    });

    //Called when there are already >2 logged in users
    socket.on('joinChat', function(data){
        console.log(data);
        if(data.boolean && data.id == chatId) {

            chats.empty();

            showMessage("theyStartedChatWithMessages",data);

            var friendNames = '';
            for (var i = 0; i < data.users.length; i++){
                if (data.users[i].name !== name) {
                    friendNames += data.users[i].name + ', ';
                }
            }
            chatNickname.text(friendNames);
        }
    });

    function isValid(thatemail) {

        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(thatemail);
    }

    function showMessage(msg, data){
        switch(msg){
        case 'invitePeople':
            // Set the invite link content
            $("#link").text(window.location.href);
            onConnect.fadeOut(1200, function(){
                inviteSomebody.fadeIn(1200);
            });
            break;

            case 'connected':
            section.children().css('display', 'none');
            onConnect.fadeIn(1200);
            //show share link message.. data.chatUrl
            break;
        case 'showPeople':
            //show each user
            break;
            case 'youStartedChatWithNoMessages':

            left.fadeOut(1200, function() {
                inviteSomebody.fadeOut(1200,function(){
                    noMessages.fadeIn(1200);
                    footer.fadeIn(1200);
                });
            });

            friend = data.users[1];
            noMessagesImage.attr("src",data.avatars[1]);
        break;

            case 'theyStartedChatWithNoMessages':

            personInside.fadeOut(1200,function(){
                onConnect.fadeOut(1200);
                noMessages.fadeIn(1200);
                footer.fadeIn(1200);
            });

            friend = data.users[0];
            noMessagesImage.attr("src",data.avatars[0]);
        break;

            case 'theyStartedChatWithMessages':

                personInside.fadeOut(1200,function(){
                    onConnect.fadeOut(1200);
                    var oldMsgs = data.msgs;
                    for(var i = 0; i< oldMsgs.length; i++){
                        var d = oldMsgs[i];
                        if(d.msg.trim().length) {
                            createChatMessage(d.msg, d.user, d.img, moment());
                        }
                    }
                    scrollToBottom();
                    footer.fadeIn(1200);
                });
                section.children().css('display','none');
                chatScreen.css('display','block');
                noMessagesImage.attr("src",data.avatars[0]);
                break;

            case 'chatStarted':
                section.children().css('display','none');
                chatScreen.css('display','block');
                break;
        }
    }

    socket.on('receive', function(data){

        showMessage('chatStarted');

        if(data.msg.trim().length) {
            createChatMessage(data.msg, data.user, data.img, moment());
            scrollToBottom();
        }
    });

    textarea.keypress(function(e){

        // Submit the form on enter

        if(e.which == 13) {
            e.preventDefault();
            chatForm.trigger('submit');
        }

    });

    chatForm.on('submit', function(e){

        e.preventDefault();

        // Create a new chat message and display it directly

        showMessage("chatStarted");

        if(textarea.val().trim().length) {
            createChatMessage(textarea.val(), name, img, moment());
            scrollToBottom();

            // Send the message to the other person in the chat
            socket.emit('msg', {msg: textarea.val(), user: name, img: img, id: chatId});

        }
        // Empty the textarea
        textarea.val("");
    });

    // Update the relative time stamps on the chat messages every minute

    setInterval(function(){

        messageTimeSent.each(function(){
            var each = moment($(this).data('time'));
            $(this).text(each.fromNow());
        });

    },60000);

    // Function that creates a new chat message
    function scrollToBottom(){
        $("html, body").animate({ scrollTop: $(document).height()-$(window).height() },1000);
    }

    function createChatMessage(msg,user,imgg,now){

        var who = '';

        if(user===name) {
            who = 'me';
        }
        else {
            who = 'you';
        }

        var li = $(
            '<li class=' + who + '>'+
            '<div class="image">' +
            '<img src=' + imgg + ' />' +
            '<b></b>' +
            '<i class="timesent" data-time=' + now + '></i> ' +
            '</div>' +
            '<p></p>' +
            '</li>');

        // use the 'text' method to escape malicious user input
        li.find('p').text(msg);
        li.find('b').text(user);

        chats.append(li);

        messageTimeSent = $(".timesent");
        messageTimeSent.last().text(now.fromNow());
    }

    function peopleInChat(people){

    }
});