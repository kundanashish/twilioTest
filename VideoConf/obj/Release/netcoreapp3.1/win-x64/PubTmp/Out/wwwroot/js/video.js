
window.addEventListener("load", () => {
    console.log(getUrlParameter("name"));
    var login = document.getElementById("login");
    var loginForm = document.getElementById("login-form");
    //const identityField =document.getElementById("identity");
    var chat = document.getElementById("chat");
    var participants = document.getElementById("participants");
    var usernameSpan = document.getElementById("username");
    var roomSpan = document.getElementById("room");
    var room = "hello";


    //loginForm.addEventListener("submit", (event) => {
    //    event.preventDefault();
    //    var identity =getUrlParameter("name");
    //    login.setAttribute("hidden", "true");
    //    // Fetch the access token
    //    data = "{identity:'" + identity + "'}";
    //    fetch("/Home/GetToken", {
    //        method: "POST",
    //        headers: {
    //            "Content-Type": "application/json",
    //        },
    //        body: JSON.stringify({ identity: identity }),
    //    })
    //        .then((res) => res.json())
    //        .then(({ token, room, identity }) => {
    //            usernameSpan.textContent = identity;
    //            roomSpan.textContent = room;
    //            chat.removeAttribute("hidden");
    //            startVideoChat(room, token);
    //        });
    //});

    var identity = getUrlParameter("name");
    //login.setAttribute("hidden", "true");
    // Fetch the access token
    data = "{identity:'" + identity + "'}";
    fetch("/Home/GetToken", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ identity: identity }),
    })
        .then((res) => res.json())
        .then(({ token, room, identity }) => {
            usernameSpan.textContent = identity;
            roomSpan.textContent = room;
            chat.removeAttribute("hidden");
            startVideoChat(room, token);
        });


    function startVideoChat(room, token) {
        // Start video chat and listen to participant connected events
        Twilio.Video.connect(token, {
            room: room,
            audio: true,
            video: true,
        }).then((room) => {
            // Once we're connected to the room, add the local participant to the page
            participantConnected(room.localParticipant);
            // Add any existing participants to the page.
            room.participants.forEach(participantConnected);
            // Listen for other participants to join and add them to the page when they
            // do.
            room.on("participantConnected", participantConnected);
            // Listen for participants to leave the room and remove them from the page
            room.on("participantDisconnected", participantDisconnected);
            // Eject the participant from the room if they reload or leave the page
            window.addEventListener("beforeunload", tidyUp(room));
            window.addEventListener("pagehide", tidyUp(room));


            document.getElementById("mute").onclick = function () {
                console.log("Mute");
                document.getElementById("unmute").style.display = 'block';
                document.getElementById("mute").style.display = 'none';
                room.localParticipant.audioTracks.forEach(function (track) {
                    track.track.disable();
                })
            }

            document.getElementById("unmute").onclick = function () {
                console.log("Unmute");
                document.getElementById("unmute").style.display = 'none';
                document.getElementById("mute").style.display = 'block';
                room.localParticipant.audioTracks.forEach(function (track) {
                    track.track.enable();
                })
            }

            document.getElementById("VideoOff").onclick = function () {
                console.log("VideoOff");
                document.getElementById("VideoOn").style.display = 'block';
                document.getElementById("VideoOff").style.display = 'none';
                room.localParticipant.videoTracks.forEach(function (track) {
                    track.track.enable();
                })
            }

            document.getElementById("VideoOn").onclick = function () {
                console.log("VideoOn");
                document.getElementById("VideoOn").style.display = 'none';
                document.getElementById("VideoOff").style.display = 'block';
                room.localParticipant.videoTracks.forEach(function (track) {
                    track.track.enable();
                })
            }


        });
    }





    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }



    function participantConnected(participant) {
        console.log("Participant : " + participant);

        navigator.getMedia = (navigator.getUserMedia || // use the proper vendor prefix
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);

        navigator.getMedia({ video: true }, function () {
            console.log("webcam is available");
        }, function () {
            console.log("webcam is not available");
        });

        // Create new <div> for participant and add it to the page
        var hostUser = getUrlParameter("name");
        var cssClass = "";
        if (hostUser == participant.identity) {
            cssClass = "hostUser";
        }
        else {
            cssClass = "guestUser";
        }
        var el = document.createElement("div");
        el.setAttribute("id", participant.identity);
        el.setAttribute("class", cssClass);
        console.log("id " + participant.identity);

        var guestName = document.createElement("p");
        guestName.setAttribute("id", "p_" + participant.identity);   
        guestName.setAttribute("class", "name");
        //document.getElementById("sp_" + participant.identity).textContent = participant.identity;
        participants.appendChild(el);
        participants.appendChild(guestName);
        document.getElementById("p_" + participant.identity).innerHTML = participant.identity;
        // Find all the participant's existing tracks and publish them to our page

        participant.tracks.forEach((trackPublication) => {
            trackPublished(trackPublication, participant);
        });
        // Listen for the participant publishing new tracks
        participant.on("trackPublished", trackPublished);
    }

    function trackPublished(trackPublication, participant) {
        // Get the participant's <div> we created earlier
        var el = document.getElementById(participant.identity);
        // Find out if the track has been subscribed to and add it to the page or
        // listen for the subscription, then add it to the page.

        // First create a function that adds the track to the page
        var trackSubscribed = (track) => {
            // track.attach() creates the media elements <video> and <audio> to
            // to display the track on the page.
            el.appendChild(track.attach());
        };
        // If the track is already subscribed, add it immediately to the page
        if (trackPublication.track) {
            trackSubscribed(trackPublication.track);
        }
        // Otherwise listen for the track to be subscribed to, then add it to the
        // page
        trackPublication.on("subscribed", trackSubscribed);
    }

    function participantDisconnected(participant) {
        participant.removeAllListeners();
        var el = document.getElementById(participant.identity);
        el.remove();
    }

    function trackUnpublished(trackPublication) {
        trackPublication.track.detach().forEach(function (mediaElement) {
            mediaElement.remove();
        });
    }


  

    function tidyUp(room) {
        return function (event) {
            if (event.persisted) {
                return;
            }
            if (room) {
                room.disconnect();
                room = null;
            }
        };
    }
});


