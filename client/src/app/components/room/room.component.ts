import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { ActivatedRoute, Router } from '@angular/router';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';

interface ChatMessage {
  sender: string;
  content: string;
}

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
  animations: [
    trigger('slideAnimation', [
      state('open', style({ left: '0' })),
      state('closed', style({ left: '-100%' })),
      transition('open <=> closed', animate('0.3s ease')),
    ]),
  ],
})
export class RoomComponent implements OnInit {

  
  @ViewChild('screenVideoElement') screenVideoElement!: ElementRef<HTMLVideoElement>;
  localStream: MediaStream | null = null;
  @ViewChild('localVideo') localVideoRef!: ElementRef;
  videoStreams: MediaStream[] = [];


  isAudioMuted = false;
  isVideoOff = false;
  isRecording = false;
  isChatOpen = true;
  isScreenSharing = false;
  chatMessages: ChatMessage[] = [];
  participants: any[] = [];
  newMessage: string = '';
  socket: any;
  mediaRecorders: any;
  mediaRecorder: any;
  showParticipants = false;
  currentUser: string = '';
  localVideo: any;
  localVideoElement: any;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.socket = io('http://localhost:3000');
    const token = localStorage.getItem('jwtToken')
    if (!token) {
      this.router.navigate(['/login'])
    }
    console.log(this.videoStreams)
  }

  
  getCurrentTime(): string {
    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }


  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    console.log(this.isChatOpen)
  }

  onShowParticipants() {
    this.showParticipants = !this.showParticipants
  }

  ngOnInit() {
    this.currentUser = localStorage.getItem('username') || ''
    this.openCamera();
    this.joinRoom();
    this.getNewChatArrivals().subscribe((data: ChatMessage) => {
      this.chatMessages.push(data);
    });
    const roomId = this.route.snapshot.paramMap.get('id');
    this.socket.emit('get-participants', roomId);
    this.socket.on('participants', (participants: any[]) => {
      this.participants = participants;
    });
  }

  joinRoom() {
    const roomId = this.route.snapshot.paramMap.get('id');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const meetingType = localStorage.getItem('meetType');

    console.log('Emitting join-room event');
    this.socket.emit('join-room', roomId, userId, username, meetingType);
  }

  openCamera() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream: MediaStream) => {
      this.videoStreams.push(stream);
      console.log(this.videoStreams)
    })
    .catch((error: any) => {
      console.log('Error accessing camera:', error);
    });
  }

  // openCamera() {
  //   // Get the local video stream and display it in the video element
  //   navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  //     .then((stream) => {
  //       const localVideoElement = this.localVideoElement.nativeElement;
  //       localVideoElement.srcObject = stream;
  //     })
  //     .catch((error) => {
  //       console.error('Error accessing user media:', error);
  //     });
  // }

  // openCamera() {
  //   navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  //     .then((stream: MediaStream) => {
  //       this.localStream = stream;
  //       this.localVideoRef.nativeElement.srcObject = stream;
  //       this.localVideoRef.nativeElement.play();
  //     })
  //     .catch((error: any) => {
  //       console.log('Error accessing camera:', error);
  //     });
  // }

  toggleAudio() {
    this.isAudioMuted = !this.isAudioMuted;
    this.videoStreams.forEach((stream: MediaStream) => {
      stream.getAudioTracks()[0].enabled = !this.isAudioMuted;
    });
  }

  toggleVideo() {
    this.isVideoOff = !this.isVideoOff;
    this.videoStreams.forEach((stream: MediaStream) => {
      stream.getVideoTracks()[0].enabled = !this.isVideoOff;
    });
  }

  stopVideo() {
    this.videoStreams.forEach((stream: MediaStream) => {
      stream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });
    });
    this.router.navigate(['/home']);
  }

  recordVideo() {
    this.isRecording = !this.isRecording;

    if (this.isRecording) {
      // Start recording
      const videoStream: MediaStream = this.videoStreams[0]; // Assuming you have only one video stream

      // Create a MediaRecorder instance with the video stream
      const mediaRecorder = new MediaRecorder(videoStream);
      const chunks: Blob[] = [];

      // Add event listeners for data available and stop recording
      mediaRecorder.addEventListener('dataavailable', (event: BlobEvent) => {
        chunks.push(event.data);
      });

      mediaRecorder.addEventListener('stop', () => {
        // Create a new Blob from the recorded chunks
        const videoBlob = new Blob(chunks, { type: 'video/webm' });

        // Generate a URL for the recorded video
        const videoURL = URL.createObjectURL(videoBlob);

        // Do something with the recorded video URL (e.g., display it in a video element or save it to a server)
        // For example, if you have a video element with id "recordedVideo", you can do:
        const recordedVideo: HTMLVideoElement = document.getElementById('recordedVideo') as HTMLVideoElement;
        recordedVideo.src = videoURL;
        recordedVideo.play();

        // Reset the chunks array for future recordings
        chunks.length = 0;
      });

      // Start recording
      mediaRecorder.start();
    } else {
      // Stop recording
      const videoStream: MediaStream = this.videoStreams[0]; // Assuming you have only one video stream

      // Get the MediaRecorder instance associated with the video stream
      const mediaRecorder = this.getMediaRecorder(videoStream);

      if (mediaRecorder && mediaRecorder.state === 'recording') {
        // Stop the recording
        mediaRecorder.stop();
      }
    }
  }

  private getMediaRecorder(stream: MediaStream): MediaRecorder | undefined {
    // Iterate over all active MediaRecorder instances and find the one associated with the specified stream
    const mediaRecorders = Array.from(this.mediaRecorders.values());
    for (const mediaRecorder of mediaRecorders) {
      if (this.mediaRecorder.stream === stream) {
        return this.mediaRecorder.recorder;
      }
    }

    return undefined;
  }


  shareScreen() {
    this.isScreenSharing = !this.isScreenSharing;

    if (this.isScreenSharing) {
      // Start screen sharing
      navigator.mediaDevices.getDisplayMedia({ video: true })
        .then((stream: MediaStream) => {
          // Add the screen stream to the video elements or send it to other participants
          // For example, if you have a video element with id "screenVideo", you can do:
          const screenVideo: HTMLVideoElement = document.getElementById('screenVideo') as HTMLVideoElement;
          screenVideo.srcObject = stream;
          screenVideo.play();

          // Send the screen stream to other participants using your socket implementation
          this.socket.sendScreenStream(stream);
        })
        .catch((error: any) => {
          console.error('Error accessing screen stream:', error);
          this.isScreenSharing = false; // Reset the screen sharing flag on error
        });
    } else {
      // Stop screen sharing
      // You can stop screen sharing by stopping the screen stream tracks and removing the video element
      const screenVideo: HTMLVideoElement = document.getElementById('screenVideo') as HTMLVideoElement;
      const screenStream: MediaStream = screenVideo.srcObject as MediaStream;
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      screenVideo.srcObject = null;

      // Inform other participants to stop receiving the screen stream
      this.socket.stopScreenSharing();
    }
  }

  sendMessage() {
    if (this.newMessage.trim() !== '') {
      const message: ChatMessage = {
        sender: 'You',
        content: this.newMessage.trim()
      };
      this.socket.emit('message', message.content);
      this.newMessage = '';
    }
  }

getNewChatArrivals(): Observable<ChatMessage> {
  return new Observable((observer) => {
    this.socket.on('createMessage', (message: string, username: string) => {
      const chatMessage: ChatMessage = {
        sender: username,
        content: message
      };
      observer.next(chatMessage);
    });
  });
}

  openChat() {
    this.isChatOpen = !this.isChatOpen;
  }
}






