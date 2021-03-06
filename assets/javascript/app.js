var ml4 = {};
ml4.opacityIn = [0, 1];
ml4.scaleIn = [0.2, 1];
ml4.scaleOut = 3;
ml4.durationIn = 800;
ml4.durationOut = 600;
ml4.delay = 500;

anime
    .timeline({ loop: true })
    .add({
        targets: '.ml4 .letters-1',
        opacity: ml4.opacityIn,
        scale: ml4.scaleIn,
        duration: ml4.durationIn,
    })
    .add({
        targets: '.ml4 .letters-1',
        opacity: 0,
        scale: ml4.scaleOut,
        duration: ml4.durationOut,
        easing: 'easeInExpo',
        delay: ml4.delay,
    })
    .add({
        targets: '.ml4 .letters-2',
        opacity: ml4.opacityIn,
        scale: ml4.scaleIn,
        duration: ml4.durationIn,
    })
    .add({
        targets: '.ml4 .letters-2',
        opacity: 0,
        scale: ml4.scaleOut,
        duration: ml4.durationOut,
        easing: 'easeInExpo',
        delay: ml4.delay,
    })
    .add({
        targets: '.ml4 .letters-3',
        opacity: ml4.opacityIn,
        scale: ml4.scaleIn,
        duration: ml4.durationIn,
    })
    .add({
        targets: '.ml4 .letters-3',
        opacity: 0,
        scale: ml4.scaleOut,
        duration: ml4.durationOut,
        easing: 'easeInExpo',
        delay: ml4.delay,
    })
    .add({
        targets: '.ml4',
        opacity: 0,
        duration: 500,
        delay: 500,
    });
// Initialize Firebase
alert('working');
var config = {
    apiKey: "AIzaSyAxY385UzXURDUG8Cjk-I-bu3_RTYXK98M",
    authDomain: "rps-multiplayer-c2eb0.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-c2eb0.firebaseio.com",
    projectId: "rps-multiplayer-c2eb0",
    storageBucket: "rps-multiplayer-c2eb0.appspot.com",
    messagingSenderId: "149953357379"
};
firebase.initializeApp(config);

var database = firebase.database();
var userRef = database.ref('users');
var user1Ref = database.ref('users/1');
var user1ChoiceRef = database.ref('users/1/choice');
var user2Ref = database.ref('users/2');
var user2ChoiceRef = database.ref('users/2/choice');
var turnRef = database.ref('turn');
var chatRef = database.ref('chat');

var existingUsers, currentUser;
var user1Choice = '';
var user2Choice = '';
var user1WinName = '';
var user2WinName = '';
var localUser = { id: [], name: '' };
var score1 = 0;
var score2 = 0;
var turn = 1;

//================================================ FUNCTIONS ================================================

/*insert photos for RPS*/
function setRPS() {
    var rockPNG = '<img title="Rock" src="assets/images/rock.png"/>';
    var paperPNG = '<img title="Paper" src="assets/images/paper.png"/>';
    var scissorsPNG = '<img title="Scissors" src="assets/images/scissors.png"/>';

    if (localUser.id === 1) {
        $('.rock1').html(rockPNG);
        $('.paper1').html(paperPNG);
        $('.scissors1').html(scissorsPNG);
    } else {
        $('.rock2').html(rockPNG);
        $('.paper2').html(paperPNG);
        $('.scissors2').html(scissorsPNG);
    }
}

/*create new user*/
function createNewUser() {
    var newUser = $('#newUser')
        .val()
        .trim();

    if (newUser) {
        if (
            existingUsers === 0 ||
            (existingUsers === 1 && currentUser.hasOwnProperty('2'))
        ) {
            console.log('curntUSER ' + currentUser);
            user1Ref.set({
                name: newUser,
                win: 0,
                loss: 0,
            });

            $('.userInfo').html('<p>Hi ' + newUser + "! You're Player 1</p>");

            localUser.id = 1;
            localUser.name = newUser;

            setRPS();
            user1Ref.onDisconnect().remove();
        } else if (existingUsers === 1 && currentUser.hasOwnProperty('1')) {
            console.log('curntUSER ' + currentUser);
            user2Ref.set({
                name: newUser,
                win: 0,
                loss: 0,
            });
            $('.userInfo').html('<p>Hi ' + newUser + "! You're Player 2</p>");

            localUser.id = 2;
            console.log("local user" + localUser.id)
            localUser.name = newUser;

            setRPS();
            user2Ref.onDisconnect().remove();
        } else if (existingUsers >= 2) {
            $('.userInfo').html('<p>Hi ' + newUser + '</p>');
            $('.notification').html('There are already 2 players!');
        }
    } else {
        return;
    }
}

userRef.on('value', function(snapshot) {
    /*start 1st turn when 2 users in*/
    if (snapshot.numChildren() === 2) {
        turnRef.set(turn);
    }

    /*check no of existing users*/
    existingUsers = snapshot.numChildren();

    /*check current user id on firebase*/
    currentUser = snapshot.val();
    console.log(" cir User    " + currentUser)
});

userRef.on('child_added', function(snapshot) {
    /*reset score if 3rd user joins*/
    if (existingUsers >= 1) {
        score1 = 0;
        score2 = 0;

        user1Ref.update({ win: 0, loss: 0 });
        user2Ref.update({ win: 0, loss: 0 });
    }
});

/*remove player's info if disconnected*/
userRef.on('child_removed', function(snapshot) {
    chatRef.remove();
    turnRef.remove();

    $('.box').css('border-color', '#cccccc');
    $('.notification').html('');
});

turnRef.on('value', function(snapshot) {
    var t = snapshot.val();

    /*switch colours of user boxes*/
    if (t === 1) {
        $('.user1').css('border-color', 'red');
        $('.user2').css('border-color', '#cccccc');

        if (localUser.id === 1) {
            $('.notification').html("It's your turn");
        } else {
            $('.notification').html('Waiting for player 1');
        }
    }

    if (t === 2) {
        $('.user2').css('border-color', 'red');
        $('.user1').css('border-color', '#cccccc');

        if (localUser.id === 2) {
            $('.notification').html("It's your turn");
        } else {
            $('.notification').html('Waiting for player 2');
        }
    }

    if (t === 3) {
        /*show results and choices*/
        $('.toolChosen1').html('<h1>' + user1Choice + '</h1>');
        $('.toolChosen2').html('<h1>' + user2Choice + '</h1>');
    }
});

/*print user 1 info when joined*/
user1Ref.on('value', function(snapshot) {
    var name = snapshot.child('name').val();
    var win = snapshot.child('win').val();
    var loss = snapshot.child('loss').val();

    user1WinName = name;

    if (name !== null) {
        $('.userName1').html('<h3>' + snapshot.child('name').val() + '</h3>');
        $('.userScore1').html('Wins: ' + win + ' Losses: ' + loss);
    }
});

/*print user 2 info when joined*/
user2Ref.on('value', function(snapshot) {
    var name = snapshot.child('name').val();
    var win = snapshot.child('win').val();
    var loss = snapshot.child('loss').val();

    user2WinName = name;

    if (name !== null) {
        $('.userName2').html('<h3>' + snapshot.child('name').val() + '</h3>');
        $('.userScore2').html('Wins: ' + win + ' Losses: ' + loss);
    }
});

/*clear user 1 info when left*/
user1Ref.on('child_removed', function(snapshot) {
    $('.userName1').html('Waiting for Player 1');
    $('.userScore1').html('');
});

/*clear user 2 info when left*/
user2Ref.on('child_removed', function(snapshot) {
    $('.userName2').html('Waiting for Player 2');
    $('.userScore2').html('');
});

function chosenTool() {
    var chosenTool = $(this).data().tool;

    if (existingUsers === 2) {
        if (localUser.id === 1 && turn === 1) {
            user1ChoiceRef.set(chosenTool);

            $('.userRPS1').hide();
            $('.toolChosen1').html('<h1>' + chosenTool + '</h1>');
        } else if (localUser.id === 2 && turn === 2) {
            user2ChoiceRef.set(chosenTool);

            $('.userRPS2').hide();
            $('.toolChosen2').html('<h1>' + chosenTool + '</h1>');
        } else {
            return;
        }
    } else {
        return;
    }
}

/*get choice from user 1*/
user1ChoiceRef.on('value', function(snapshot) {
    user1Choice = snapshot.val();

    if (user1Choice) {
        turn++;
    }

    compareChoice();
});

/*get choice from user 2*/
user2ChoiceRef.on('value', function(snapshot) {
    user2Choice = snapshot.val();

    if (user2Choice) {
        turn++;
    }

    compareChoice();
});

function compareChoice() {
    if (user1Choice !== null && user2Choice !== null) {
        if (user1Choice === user2Choice) {
            $('.gameInfo').html("<h1>It's a tie!</h1>");

            turn = 3;

            setTimeout(newRound, 1000 * 3);
        } else if (
            (user1Choice === 'Rock' && user2Choice === 'Scissors') ||
            (user1Choice === 'Paper' && user2Choice === 'Rock') ||
            (user1Choice === 'Scissors' && user2Choice === 'Paper')
        ) {
            $('.gameInfo').html('<h1>' + user1WinName + ' wins!</h1>');

            score1++;

            user1Ref.update({ win: score1 });
            user2Ref.update({ loss: score1 });

            turn = 3;

            setTimeout(newRound, 1000 * 3);
        } else if (
            (user2Choice === 'Rock' && user1Choice === 'Scissors') ||
            (user2Choice === 'Paper' && user1Choice === 'Rock') ||
            (user2Choice === 'Scissors' && user1Choice === 'Paper')
        ) {
            $('.gameInfo').html('<h1>' + user2WinName + ' wins!</h1>');

            score2++;

            user2Ref.update({ win: score2 });
            user1Ref.update({ loss: score2 });

            turn = 3;

            setTimeout(newRound, 1000 * 3);
        }
    }
}

function newRound() {
    /*remove data on firsebase*/
    user1ChoiceRef.remove();
    user2ChoiceRef.remove();

    /*clear choices*/
    user1Choice = '';
    user2Choice = '';
    $('.gameInfo').html('');

    /*reset turn and push to firebase*/
    turn = 1;
    turnRef.set(turn);

    /*show the right user RPS options again*/
    if (localUser.id === 1) {
        $('.userRPS1').show();
    } else {
        $('.userRPS2').show();
    }

    /*clear shown chosen tools*/
    $('.toolChosen1').html('');
    $('.toolChosen2').html('');
}

/*send message*/
function sendMessage() {
    var text = $('#newMessage').val();
    var message = localUser.name + ': ' + text;

    if (localUser.id === 1) {
        chatRef.push('<span class="green">' + message + '</span>');
    }

    if (localUser.id === 2) {
        chatRef.push('<span class="blue">' + message + '</span>');
    }

    $('#newMessage').val('');
}

/*print message from firebase*/
chatRef.on('child_added', function(snapshot) {
    var currentMessage = snapshot.val();

    $('.messageHolder').append('<p>' + currentMessage + '</p>');
});

/*clear chat on firebase if disconnected*/
chatRef.on('child_removed', function() {
    $('.messageHolder').html('');
});

//================================================ OPERATIONS ================================================

$('.tool').on('click', chosenTool);
$('#startButton').on('click', createNewUser);
$('#sendButton').on('click', sendMessage);