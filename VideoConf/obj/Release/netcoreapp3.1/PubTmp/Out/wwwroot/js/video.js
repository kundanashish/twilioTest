
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

    var identity = getUrlParameter("name") + "-" + Math.floor(Math.random() * 100);
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


            document.getElementById("mute" + identity).onclick = function () {
                console.log("Mute");
                document.getElementById("unmute" + identity).style.display = 'block';
                document.getElementById("mute" + identity).style.display = 'none';
                room.localParticipant.audioTracks.forEach(function (track) {
                    track.track.disable();
                })
            }

            document.getElementById("unmute" + identity).onclick = function () {
                console.log("Unmute");
                document.getElementById("unmute" + identity).style.display = 'none';
                document.getElementById("mute" + identity).style.display = 'block';
                room.localParticipant.audioTracks.forEach(function (track) {
                    track.track.enable();
                })
            }

            document.getElementById("VideoOff" + identity).onclick = function () {
                console.log("VideoOff");
                document.getElementById("VideoOn" + identity).style.display = 'block';
                document.getElementById("VideoOff" + identity).style.display = 'none';
                room.localParticipant.videoTracks.forEach(function (track) {
                    track.track.disable();
                })
            }
            document.getElementById("VideoOn" + identity).onclick = function () {
                console.log("VideoOn");
                document.getElementById("VideoOn" + identity).style.display = 'none';
                document.getElementById("VideoOff" + identity).style.display = 'block';
                room.localParticipant.videoTracks.forEach(function (track) {
                    track.track.enable();
                })
            }
                     
        });
    
    }

   

    //function attachTrack(participant, track) {
    //    const id = `participant-${participant.sid}`;
    //    const video = document.getElementById(id) || document.createElement('video');
    //    video.id = id;
    //    track.attach(video);
    //    if (participant.identity === 'someone-i-want-to-mute') {
    //        video.muted = true;
    //    }
    //    document.body.appendChild(video);
    //}



    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }



    function participantConnected(participant) {
        console.log("Participant : " + participant);      

        // Create new <div> for participant and add it to the page
        var hostUser = participant.identity;

        var cssClass = "";
        if (hostUser == participant.identity) {
            cssClass = "hostUser";
        }
        else {
            cssClass = "guestUser";
        }
        var el = document.createElement("div");
        el.setAttribute("id", hostUser);
        el.setAttribute("class", cssClass);
        console.log("id " + hostUser);

        var guestName = document.createElement("p");
        guestName.setAttribute("id", "p_" + hostUser);   
        guestName.setAttribute("class", "name");

        //Start Video Element 
        var videoPanel = document.createElement("p");
        videoPanel.setAttribute("class", "video");

        var videoOff = document.createElement("span");
        videoOff.setAttribute("id", "VideoOff" + hostUser);

        var videoOffIcon = document.createElement("i");
        videoOffIcon.setAttribute("class", "fa fa-video-camera videoOff");
        videoOffIcon.setAttribute("aria-hidden", "true");

        var videoOn = document.createElement("span");
        videoOn.setAttribute("id", "VideoOn" + hostUser);
        videoOn.setAttribute("class", "VideoOn");

        var videoOnIcon = document.createElement("i");
        videoOnIcon.setAttribute("class", "fa fa-video-camera videoOn");
        videoOnIcon.setAttribute("aria-hidden", "true");
        //End Video Element

        //Start Audio Element
        var AudioPanel = document.createElement("p");
        AudioPanel.setAttribute("class", "audio");

        var AudioOff = document.createElement("span");
        AudioOff.setAttribute("id", "mute" + hostUser);

        var AudiooffIcon = document.createElement("i");
        AudiooffIcon.setAttribute("class", "fa fa-microphone videoOff");
        AudiooffIcon.setAttribute("aria-hidden", "true");

        var AudioOn = document.createElement("span");
        AudioOn.setAttribute("id", "unmute" + hostUser);
        AudioOn.setAttribute("class", "AudioOn");

        var AudioOnIcon = document.createElement("i");
        AudioOnIcon.setAttribute("class", "fa fa-microphone-slash audioOn");
        AudioOnIcon.setAttribute("aria-hidden", "true");
        //End Audion Element

       

      
        participants.appendChild(el);

        el.appendChild(videoPanel);
        videoPanel.appendChild(videoOff);
        videoPanel.appendChild(videoOn);
        videoOff.appendChild(videoOffIcon);
        videoOn.appendChild(videoOnIcon);

        el.appendChild(AudioPanel);
        AudioPanel.appendChild(AudioOff);
        AudioPanel.appendChild(AudioOn);
        AudioOff.appendChild(AudiooffIcon);
        AudioOn.appendChild(AudioOnIcon);

        el.appendChild(guestName);       
        var userName = hostUser.split("-");
        document.getElementById("p_" + hostUser).innerHTML = userName[0];

        navigator.getMedia = (navigator.getUserMedia || // use the proper vendor prefix
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);

        navigator.getMedia({ video: true }, function () {
            console.log("webcam is available");
        }, function () {
                el.setAttribute("class", "noVideo");
        });

        // Find all the participant's existing tracks and publish them to our page

        participant.tracks.forEach((trackPublication) => {
            trackPublished(trackPublication, participant);
        });
        // Listen for the participant publishing new tracks
        participant.on("trackPublished", trackPublished);

       
       
    }

  

    function trackPublished(trackPublication, participant) {
        // Get the participant's <div> we created earlier
        console.log("trackPublication : " + trackPublication);
        console.log("participant : " + participant);
        var el = document.getElementById(participant.identity);
        var videoStop = document.getElementById("VideoOff" + participant.identity);
        var videoStart = document.getElementById("VideoOn" + participant.identity);
        var auidomute = document.getElementById("mute" + participant.identity);
        var auidounmute = document.getElementById("unmute" + participant.identity);
        // Find out if the track has been subscribed to and add it to the page or
        // listen for the subscription, then add it to the page.

        // First create a function that adds the track to the page
        var trackSubscribed = (track) => {
            // track.attach() creates the media elements <video> and <audio> to
            // to display the track on the page.
            el.appendChild(track.attach());
            //videoStop.appendChild(track.attach());
            //videoStart.appendChild(track.attach());
            //auidomute.appendChild(track.attach());
            //auidounmute.appendChild(track.attach());
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
        console.log("participantDisconnected : "+participant);
        participant.removeAllListeners();
        var el = document.getElementById(participant.identity);
        var guestName = document.getElementById("p_" + participant.identity);
        el.remove();
        guestName.remove();
    }

   


    function trackUnpublished(trackPublication) {
        trackPublication.track.detach().forEach(function (mediaElement) {
            mediaElement.remove();
        });
    }


  

    function tidyUp(room) {
        console.log("TidyUp : "+room);
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


