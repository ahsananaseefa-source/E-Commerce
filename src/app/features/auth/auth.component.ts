import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import emailjs from '@emailjs/browser';

import { UserService } from '../../core/services/user.service';
import { CartService } from '../../core/services/cart.service';
import { loadCart } from '../../store/cart/cart.actions';
import { User } from '../../core/models/user.models';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnDestroy {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private cartService = inject(CartService);
  private store = inject(Store);

  // =========================================================
  // EMAILJS CONFIG
  // =========================================================

  private readonly EMAILJS_SERVICE_ID = 'service_f05s6xe';
  private readonly EMAILJS_TEMPLATE_ID = 'template_cdey1ve';
  private readonly EMAILJS_PUBLIC_KEY = 'SJmmkU0Oe21BQ0hER';

  private readonly OTP_VALID_MS = 5 * 60 * 1000;
  private readonly RESEND_SECONDS = 30;
  private readonly MAX_OTP_ATTEMPTS = 5;

  // =========================================================
  // AUTH
  // =========================================================

  isLogin = true;
  showPassword = false;

  // =========================================================
  // FORM
  // =========================================================

  name = '';
  email = '';
  phone = '';
  password = '';

  // =========================================================
  // MESSAGES
  // =========================================================

  errorMessage = '';
  successMessage = '';

  // =========================================================
  // OTP
  // OTP is ONLY used for registration
  // =========================================================

  otp = '';
  generatedOtp = '';
  otpSent = false;
  otpVerified = false;
  otpExpiryTime = 0;

  resendAvailable = true;
  resendSeconds = 0;

  otpSending = false;
  otpVerifying = false;

  private otpEmail = '';
  private otpAttempts = 0;

  private resendInterval: ReturnType<typeof setInterval> | null = null;
  private verifyTimeout: ReturnType<typeof setTimeout> | null = null;

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor() {

    emailjs.init({
      publicKey: this.EMAILJS_PUBLIC_KEY
    });

    this.route.queryParams.subscribe(params => {

      if (params['mode'] === 'register') {
        this.isLogin = false;
      }

    });
  }

  // =========================================================
  // DESTROY
  // =========================================================

  ngOnDestroy(): void {
    this.clearTimers();
  }

  // =========================================================
  // HELPERS
  // =========================================================

  private get normalizedEmail(): string {
    return this.email.trim().toLowerCase();
  }

  private clearTimers(): void {

    if (this.resendInterval) {
      clearInterval(this.resendInterval);
      this.resendInterval = null;
    }

    if (this.verifyTimeout) {
      clearTimeout(this.verifyTimeout);
      this.verifyTimeout = null;
    }
  }

  // =========================================================
  // SWITCH LOGIN / REGISTER
  // =========================================================

  switchMode(): void {

    this.isLogin = !this.isLogin;

    this.name = '';
    this.email = '';
    this.phone = '';
    this.password = '';

    this.errorMessage = '';
    this.successMessage = '';

    this.resetOtp();
  }

  // =========================================================
  // VALIDATIONS
  // =========================================================

  private validateName(): boolean {

    if (!/^[A-Za-z ]{3,}$/.test(this.name.trim())) {

      this.errorMessage =
        'Please enter a valid name with at least 3 letters.';

      return false;
    }

    return true;
  }

  private validatePhone(): boolean {

    if (!/^[0-9]{10}$/.test(this.phone.trim())) {

      this.errorMessage =
        'Please enter a valid 10-digit phone number.';

      return false;
    }

    return true;
  }

  private validateEmail(): boolean {

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.email.trim())) {

      this.errorMessage =
        'Please enter a valid email address.';

      return false;
    }

    return true;
  }

  private validatePassword(): boolean {

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(this.password)) {

      this.errorMessage =
        'Password must contain 8 characters, uppercase, lowercase, number and special character.';

      return false;
    }

    return true;
  }

  // =========================================================
  // SUBMIT FORM
  // =========================================================

  submitForm(): void {

    this.errorMessage = '';
    this.successMessage = '';

    // =======================================================
    // LOGIN
    // OTP IS NOT USED FOR LOGIN
    // =======================================================

   // LOGIN
if (this.isLogin) {

  if (!this.validateEmail()) return;

  if (!this.validatePassword()) return;

  this.userService
    .login(
      this.normalizedEmail,
      this.password
    )
    .subscribe({

      next: (users) => {

        if (!users || users.length === 0) {

          this.errorMessage =
            'Incorrect email or password. Please try again.';

          return;
        }

        const user = users[0];

        this.setLoggedInUser(user);

        this.mergeGuestCartAndNavigate();
      },

      error: (error) => {

        console.error(
          'Login error:',
          error
        );

        this.errorMessage =
          'Unable to login. Please try again.';
      }

    });

  return;
}

    // =======================================================
    // REGISTER
    // OTP IS REQUIRED FOR REGISTER
    // =======================================================

    if (!this.validateName()) {
      return;
    }

    if (!this.validatePhone()) {
      return;
    }

    if (!this.validateEmail()) {
      return;
    }

    if (!this.validatePassword()) {
      return;
    }

    // =======================================================
    // IF OTP IS ALREADY VERIFIED
    // =======================================================

    if (this.otpVerified) {

      this.register();

      return;
    }

    // =======================================================
    // CHECK IF EMAIL ALREADY EXISTS
    // =======================================================

    this.userService.getUserByEmail(this.normalizedEmail).subscribe({

      next: (users) => {

        console.log('Existing users:', users);

        if (users && users.length > 0) {

          this.errorMessage =
            'An account already exists with this email. Please login.';

          return;
        }

        // No existing account
        // Send OTP for registration

        this.sendOtp();
      },

      error: (error) => {

        console.error('Error checking email:', error);

        this.errorMessage =
          'Unable to check email. Please try again.';
      }

    });
  }

  // =========================================================
  // GENERATE OTP
  // =========================================================

  private generateOtp(): string {

    const array = new Uint32Array(1);

    crypto.getRandomValues(array);

    return (100000 + (array[0] % 900000)).toString();
  }

  // =========================================================
  // SEND OTP
  // OTP ONLY FOR REGISTER
  // =========================================================

  sendOtp(): void {

    if (this.otpSending) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validateEmail()) {
      return;
    }

    this.otpSending = true;

    const otpValue = this.generateOtp();

    const toEmail = this.normalizedEmail;

    console.log('Entered email:', this.email);
    console.log('Normalized email:', this.normalizedEmail);
    console.log('EmailJS recipient:', toEmail);

    const templateParams = {

      name: this.name.trim(),

      to_name: this.name.trim(),

      email: toEmail,

      otp: otpValue,

      time: '5 minutes'
    };

    console.log('Template params:', templateParams);

    emailjs.send(
      this.EMAILJS_SERVICE_ID,
      this.EMAILJS_TEMPLATE_ID,
      templateParams
    )

      .then(() => {

        console.log('OTP email sent successfully.');

        this.generatedOtp = otpValue;

        this.otpExpiryTime =
          Date.now() + this.OTP_VALID_MS;

        this.otpEmail = toEmail;

        this.otpAttempts = 0;

        this.otp = '';

        this.otpSent = true;

        this.otpVerified = false;

        this.otpSending = false;

        this.successMessage =
          'OTP sent to ' +
          toEmail +
          '. Please check your inbox (and spam folder).';

        this.startResendTimer();
      })

      .catch(error => {

        console.error('EmailJS Error:', error);

        this.otpSending = false;

        this.otpSent = false;

        this.otpVerified = false;

        this.generatedOtp = '';

        const detail =
          error?.text
            ? ` (${error.text})`
            : '';

        this.errorMessage =
          'Unable to send OTP' +
          detail +
          '. Please check your email address and try again.';
      });
  }

  // =========================================================
  // VERIFY OTP
  // =========================================================

  verifyOtp(): void {

    this.errorMessage = '';
    this.successMessage = '';

    const enteredOtp = this.otp.trim();

    if (!this.generatedOtp) {

      this.errorMessage =
        'Please request an OTP first.';

      return;
    }

    if (!enteredOtp) {

      this.errorMessage =
        'Please enter the OTP sent to your email.';

      return;
    }

    if (!/^\d{6}$/.test(enteredOtp)) {

      this.errorMessage =
        'Please enter a valid 6-digit OTP.';

      return;
    }

    // =======================================================
    // CHECK EXPIRY
    // =======================================================

    if (Date.now() > this.otpExpiryTime) {

      this.errorMessage =
        'OTP has expired. Please request a new OTP.';

      this.resetOtpOnly();

      return;
    }

    // =======================================================
    // CHECK WRONG OTP
    // =======================================================

    if (enteredOtp !== this.generatedOtp) {

      this.otpAttempts++;

      if (this.otpAttempts >= this.MAX_OTP_ATTEMPTS) {

        this.errorMessage =
          'Too many wrong attempts. Please request a new OTP.';

        this.resetOtpOnly();

        return;
      }

      this.errorMessage =
        'Invalid OTP. Please check the OTP and try again.';

      return;
    }

    // =======================================================
    // OTP VERIFIED
    // =======================================================

    this.otpVerified = true;

    this.otpVerifying = true;

    this.successMessage =
      'OTP verified successfully.';

    this.verifyTimeout = setTimeout(() => {

      this.otpVerifying = false;

      // OTP is only used for registration
      this.register();

    }, 400);
  }

  // =========================================================
  // RESEND OTP
  // =========================================================

  resendOtp(): void {

    if (!this.resendAvailable || this.otpSending) {
      return;
    }

    this.otpVerified = false;

    this.sendOtp();
  }

  // =========================================================
  // RESEND TIMER
  // =========================================================

  private startResendTimer(): void {

    if (this.resendInterval) {

      clearInterval(this.resendInterval);
    }

    this.resendAvailable = false;

    this.resendSeconds =
      this.RESEND_SECONDS;

    this.resendInterval =
      setInterval(() => {

        this.resendSeconds--;

        if (this.resendSeconds <= 0) {

          this.resendAvailable = true;

          this.resendSeconds = 0;

          if (this.resendInterval) {

            clearInterval(this.resendInterval);

            this.resendInterval = null;
          }
        }

      }, 1000);
  }

  // =========================================================
  // RESET OTP
  // =========================================================

  private resetOtp(): void {

    this.clearTimers();

    this.otp = '';

    this.generatedOtp = '';

    this.otpEmail = '';

    this.otpAttempts = 0;

    this.otpSent = false;

    this.otpVerified = false;

    this.otpExpiryTime = 0;

    this.resendAvailable = true;

    this.resendSeconds = 0;

    this.otpSending = false;

    this.otpVerifying = false;
  }

  // =========================================================
  // RESET OTP ONLY
  // =========================================================

  private resetOtpOnly(): void {

    this.otp = '';

    this.generatedOtp = '';

    this.otpAttempts = 0;

    this.otpSent = false;

    this.otpVerified = false;

    this.otpExpiryTime = 0;

    this.otpVerifying = false;
  }

  // =========================================================
  // LOGIN
  // =========================================================

  private login(): void {

  this.userService
    .login(
      this.normalizedEmail,
      this.password
    )
    .subscribe({

      next: (users) => {

        if (!users || users.length === 0) {

          this.errorMessage =
            'Login failed. Please try again.';

          this.resetOtp();

          return;
        }

        const user = users[0];

        this.setLoggedInUser(user);

        this.mergeGuestCartAndNavigate();
      },

      error: (error) => {

        console.error(
          'Login error:',
          error
        );

        this.errorMessage =
          'Unable to login. Please try again.';

        this.resetOtp();
      }

    });
}

  // =========================================================
  // REGISTER
  // =========================================================

 private register(): void {

  const email =
    this.normalizedEmail;

  const newUser: User = {

    name:
      this.name.trim(),

    email:
      email,

    phone:
      this.phone.trim(),

    password:
      this.password

  };

  this.userService
    .register(newUser)
    .subscribe({

      next: (registeredUser) => {

        this.setLoggedInUser(
          registeredUser
        );

        this.mergeGuestCartAndNavigate();
      },

      error: (error) => {

        console.error(
          'Registration error:',
          error
        );

        this.errorMessage =
          'Registration failed. Please try again.';
      }

    });
}

  // =========================================================
  // SAVE LOGIN DETAILS
  // =========================================================

 private setLoggedInUser(user: User): void {

  console.log(
    'Logged in user:',
    user
  );

  localStorage.setItem(
    'user',
    JSON.stringify(user)
  );

  localStorage.setItem(
    'userId',
    String(user.id)
  );

  localStorage.setItem(
    'token',
    'logged-in'
  );
}

  // =========================================================
  // MERGE GUEST CART
  // =========================================================

  private mergeGuestCartAndNavigate(): void {

    const userId =
      localStorage.getItem('userId');

    if (!userId) {

      this.router.navigate(['/home']);

      return;
    }

    this.cartService
      .mergeGuestCart(userId)
      .subscribe({

        next: () => {

          this.store.dispatch(loadCart());

          this.router.navigate(['/home']);
        },

        error: error => {

          console.error(
            'Guest cart merge error:',
            error
          );

          this.store.dispatch(loadCart());

          this.router.navigate(['/home']);
        }

      });
  }

  // =========================================================
  // PASSWORD VISIBILITY
  // =========================================================

  togglePassword(): void {

    this.showPassword =
      !this.showPassword;
  }

}