/**
 * Created by vgarg on 4/16/2015.
 */
(function(){
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


    socket.on('joinChat', function(people){
        if (people.number === 0) {
            //make signup and invite more people
            var chatUrl = '' + chatId;
            showMessage('invitePeople', {chatUrl: chatUrl});
        } else {
            //display all the people already in the chat
            var peopleInChat = people.peopleInChat;
            showMessage('showPeople', peopleInChat);
            //make the user signup, once done, then redirect
        }
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
                socket.emit('login', {user: name, avatar: email, chatId: chatId});
            }
        });
    });

    function showMessage(msg, data){
        switch(msg){
        case 'invitePeople':
            section.children().css('display', 'none');
            onConnect.fadeIn(1200);
            //show share link message.. data.chatUrl
            break;
        case 'showPeople':
            //show each user
            break;
        }
    }
    function peopleInChat(people){

    }
})();