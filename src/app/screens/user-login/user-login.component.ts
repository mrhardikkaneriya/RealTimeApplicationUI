import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserLogin } from '../../models/requestModel/user-login';
import { CheckFormValidation } from '../../models/validationModel/check-form-validation';
import { FormValidationMessage } from '../../models/validationModel/form-validation-message';
import { FormValidationPattern } from '../../models/validationModel/form-validation-pattern';
import { LocalStorageConstants, RouteConstants } from '../../constants/app.constants';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.scss'
})
export class UserLoginComponent implements OnInit {
  constructor(private readonly authService: AuthService, private readonly router: Router,
    private readonly formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.buildForm();
  }

  loginform!: FormGroup;
  
  formFields = {
    email: 'email',
    password: 'password'
  }

  validationPattern = new FormValidationPattern();
  validationMessage = new FormValidationMessage();
  checkValidation = new CheckFormValidation();  

  private buildForm() {
    const formGroup = this.formBuilder.group({});
    formGroup.addControl(this.formFields.email, this.formBuilder.control('', { validators: [Validators.required, Validators.pattern(this.validationPattern.emailPattern), Validators.maxLength(75)], updateOn: 'change' }));
    formGroup.addControl(this.formFields.password, this.formBuilder.control('', { validators: [Validators.required, Validators.pattern(this.validationPattern.passwordPattern)], updateOn: 'change' }));

    this.loginform = formGroup;
  }
  
  markFormAsTouched() {
    Object.keys(this.loginform.controls).forEach((key) => { this.loginform.get(key)?.markAsTouched(); });
  }

  getFormValue(): UserLogin {
    const loginForm = this.loginform;
    const userLogin = new UserLogin;
    userLogin.email = loginForm.get(this.formFields.email)?.value;
    userLogin.password = loginForm.get(this.formFields.password)?.value;
    return userLogin;
  }

  userLogin() {
    if (this.loginform.invalid) {
      this.markFormAsTouched();
      return;
    }
    const loginDetails: UserLogin = this.getFormValue();
    this.authService.userLogin(loginDetails)
      .pipe(
        catchError(error => {
          if (error.error && error.status == 401) {
            alert(error.error);
          }
          return of([]);
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.token != "" && response.userDetails != null && response.userDetails != undefined) {
            localStorage.setItem(LocalStorageConstants.Token, response.token);
            localStorage.setItem(LocalStorageConstants.UserId, response.userDetails.userId);
            this.router.navigate([RouteConstants.ProjectPlanning]);
          }
        },
        error: () => {},
        complete: () => {}
      });
  }
}