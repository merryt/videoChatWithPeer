const socket = io('/')
const videoGrid = document.getElementById('video-grid')

// if you pass in undefined it will generate it own id
// everytime you reload the page it generates a new id
const myPeer = new Peer(undefined,{
    host: '/',
    // this is the port of the peer server that you create using
    // `peerjs --port 3001` from shell
    port: '3001',
})
const myVideo = document.createElement('video')
myVideo.muted = true

const peers = {}


navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then( stream =>{
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        console.log("answering call")
        call.answer(stream)

        const video = document.createElement('video')
        call.on('stream', userVideoStream =>{
            addVideoStream(video, userVideoStream)
        })
    })


    socket.on('user-connected', userId =>{
        connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected', userId =>{
    if(peers[userId]){
        peers[userId].close();
    }
})

function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream =>{
        addVideoStream(video, userVideoStream)
    })
    call.on('close',() =>{
        video.remove()
    })

    peers[userId] = call
} 

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
});


function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () =>{
        video.play()
    })
    videoGrid.append(video)
} 