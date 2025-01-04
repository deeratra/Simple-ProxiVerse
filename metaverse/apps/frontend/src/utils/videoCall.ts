const initateVideoCall = async (userId: string) => {
    const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    });
    const peerConnection = new RTCPeerConnection({
        iceServers: [
          {
            urls: 'stun:stun.l.google.com:19302',  // STUN server for NAT traversal
          },
        ],
      });

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    })

    peerConnection.ontrack = (event) => {
        const remoteVideo = document.createElement('remoteVideo');
        if(remoteVideo) {
            remoteVideo.srcObject = event.streams[0];
            remoteVideo.play();
        }
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            console.log('ICE candidate:', event.candidate);
            wsRef.current?.send(
                JSON.stringify({
                    type: 'iceCandidate',
                    payload: {
                        target: userId,
                        candidate: event.candidate,
                    },
                }),
            );
        }



}