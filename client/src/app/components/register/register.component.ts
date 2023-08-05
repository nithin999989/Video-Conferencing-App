import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  regForm: FormGroup;

  constructor(private http: HttpClient, private route: Router) {
    this.regForm = new FormGroup({
      firstname: new FormControl(null, Validators.required),
      lastname: new FormControl(null, Validators.required),
      username: new FormControl(null, Validators.required),
      email: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required),
    })

    const token = localStorage.getItem("jwtToken")
    if (token) {
      this.route.navigate(['/home'])
    }
  }

  onSubmit(details: { firstname: string, lastname: string, username: string, email: string, password: string }): void {
    console.log(details)
    this.http.post('http://localhost:3000/register', details).subscribe(
      (response) => {
        console.log(response)
        window.alert('Registered Successfully!');
        this.route.navigate(['/login']);
      },
      (error) => {
        if (error.status === 400) {
          window.alert('User already exists');
        } else {
          window.alert('Registration Failed!');
        }
        console.log(error);
      }
    );
  }

}
