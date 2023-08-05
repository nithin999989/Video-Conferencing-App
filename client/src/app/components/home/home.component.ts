import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { v4 as uuid } from 'uuid'; // Import v4 from uuid package
declare const $: any; // Import jQuery

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('copyLinkModal') copyLinkModal!: ElementRef;
  showMeetings = false;
  meetLink: string = '';
  socket: any;
  meetType: string = '';

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit() {
    const token = localStorage.getItem("jwtToken")
    if (!token) {
      this.router.navigate(['/login'])
    } 
    this.socket = io('http://localhost:3000');
    
    // Perform any necessary Socket.IO event handling here
    this.socket.on('connect', () => {
      console.log('Connected to the server');
    });

  }

  toggleMeetings() {
    this.showMeetings = !this.showMeetings;
  }

  generateMeetLinkForLater() {
    const randomCode = uuid();
    this.meetType = 'later';
    return `http://localhost:4200/meet/${randomCode}`;
  }

  generateInstantMeetLink() {
    const randomCode = uuid();
    this.meetType = 'instant';
    return `${randomCode}`;
  }

  generateScheduledMeetLink() {
    const randomCode = uuid();
    this.meetType = 'schedule';
    return `http://localhost:4200/meet/${randomCode}`;
  }

  createMeetingForLater() {
    this.meetLink = this.generateMeetLinkForLater();
    this.copyToClipboard(this.meetLink);
    this.showPopup();
  }

  startInstantMeeting() {
    localStorage.setItem('meetType',this.meetType)
    const newMeetDate = '';
    const newMeetTime = '';
    this.meetLink = this.generateInstantMeetLink();
    this.router.navigate(['/meet', this.meetLink]);
  }

  scheduleMeeting() {
    this.meetLink = this.generateScheduledMeetLink();
    console.log(this.meetLink);
  }

  copyToClipboard(text: string) {
    const input = document.createElement('textarea');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
  }

  showMessage() {
    alert('Meet link has been copied to the clipboard.');
  }

  showPopup() {
    const modalElement = this.copyLinkModal.nativeElement;
    $(modalElement).modal('show');
  }

  hidePopup() {
    const modalElement = this.copyLinkModal.nativeElement;
    $(modalElement).modal('hide');
  }
}
