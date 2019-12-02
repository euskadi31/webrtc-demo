const rtc_config = {
    iceServers : [
        {
            "urls" : "stun:stun.l.google.com:19302"
        }
    ]
};

var sdpConstraints = {
    optional: [
        {
            RtpDataChannels: true
        }
    ],
    mandatory: {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: true
    }
};

var pc = new RTCPeerConnection(rtc_config);
var dc;


// UI
var $status;
var $video;
var $offer;
var $answer;
var $connect;

pc.ondatachannel = (e) => {
    console.log('onDataChannel');

    dc = e.channel;
    dcInit(dc);
};

pc.onicecandidate = (e) => {
    console.log('onIceCandidate');

    if (e.candidate) {
        return;
    }

    console.log('previous offer:', $offer.value);

    $offer.value = JSON.stringify(pc.localDescription);

    console.log('next offer:', $offer.value);
};

pc.oniceconnectionstatechange = (e) => {
    console.log('onIceConnectionStateChange');

    var state = pc.iceConnectionState;
    $status.innerText = state;
    if (state == "connected") {
        //$("#msg, #send").attr("disabled", false);
    }
};

pc.ontrack = (e) => {
    console.log("onTrack");

    $video.srcObject = e.streams[0];
};

pc.onaddstream = (e) => {
    console.log("onAddStream");

    $video.srcObject = e.stream;
};

pc.onsignalingstatechange = (e) => {
    console.log('onsignalingstatechange', pc.signalingState || pc.readyState)
};


pc.onconnectionstatechange = (e) => {
    console.log('onconnectionstatechange');
};


function dcInit(dc) {
    dc.onopen = () => {
        console.log('onOpen');
    };

    dc.onmessage = (e) => {
        console.log('onMessage', e.data);
    };
}

function createOfferSDP() {
    console.log('Creating offer...');

    pc.createOffer().then((offer) => {
        return pc.setLocalDescription(offer);
    }).then(() => {
        console.log('Create offer');

        $offer.value = JSON.stringify(pc.localDescription);
    }).catch((err) => {
        throw err;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log('DOMContentLoaded');

    $status = document.getElementById('status');
    $video = document.getElementById('remote-video');
    $offer = document.getElementById('offer-sdp');
    $answer = document.getElementById('answer-sdp');
    $chat = document.getElementById('chat-screen');
    $chatScreen = document.getElementById('chat-screen-wp');
    $connect = document.getElementById('connect');

    $connect.addEventListener('click', (e) => {
        let answer = JSON.parse($answer.value);

        pc.setRemoteDescription(new RTCSessionDescription(answer)).then(() => {
            console.log('setRemoteDescription');
        });
    });

    navigator.mediaDevices.getUserMedia({video: true, audio: true}).then((stream) => {
        console.log('getUserMedia');

        // stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.addStream(stream);

        $video.srcObject = stream;

        createOfferSDP();
    }).catch((err) => {
        console.error(err);
    });
});
