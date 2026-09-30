import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { Router } from '@angular/router';
import { User } from '../../core/models/user.models';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

  private userService = inject(UserService);
  private router = inject(Router);

  isLogin = true;
  showPassword = false;

  name = '';
  email = '';
  password = '';

  errorMessage = '';
  successMessage = '';


  switchMode(): void {

    this.isLogin = !this.isLogin;

    this.name = '';
    this.email = '';
    this.password = '';

    this.errorMessage = '';
    this.successMessage = '';

    this.showPassword = false;
  }


  isNameValid(): boolean {

    if (this.isLogin) {
      return true;
    }

    const namePattern = /^[A-Za-z ]{2,50}$/;

    return namePattern.test(this.name.trim());
  }


  isEmailValid(): boolean {

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    return emailPattern.test(this.email.trim());
  }


  isPasswordValid(): boolean {

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    return passwordPattern.test(this.password);
  }


  isFormValid(): boolean {

    if (this.isLogin) {

      return (
        this.isEmailValid() &&
        this.isPasswordValid()
      );

    }

    return (
      this.isNameValid() &&
      this.isEmailValid() &&
      this.isPasswordValid()
    );
  }


  submitForm(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.isFormValid()) {

      this.errorMessage =
        'Please correct the validation errors before submitting.';

      return;
    }

    if (this.isLogin) {

      this.login();

    } else {

      this.register();

    }
  }


  login(): void {

    const email = this.email.trim().toLowerCase();

    this.userService
      .login(email, this.password)
      .subscribe({

        next: (users) => {

          if (users.length === 0) {

            this.userService
              .getUserByEmail(email)
              .subscribe({

                next: (existingUsers) => {

                  if (existingUsers.length === 0) {

                    this.errorMessage =
                      'No account found with this email address.';

                  } else {

                    this.errorMessage =
                      'Incorrect password. Please try again.';

                  }

                },

                error: (error) => {

                  console.error(error);

                  this.errorMessage =
                    'Unable to verify your email. Please try again later.';

                }

              });

            return;
          }


          const user = users[0];

          localStorage.setItem(
            'user',
            JSON.stringify(user)
          );

          localStorage.setItem(
            'token',
            'logged-in'
          );

          this.successMessage =
            'Login successful!';

          this.router.navigate(['/home']);

        },

        error: (error) => {

          console.error(error);

          this.errorMessage =
            'Unable to sign in right now. Please try again later.';

        }

      });
  }


  register(): void {

    const name = this.name.trim();
    const email = this.email.trim().toLowerCase();

    this.userService
      .getUserByEmail(email)
      .subscribe({

        next: (users) => {

          if (users.length > 0) {

            this.errorMessage =
              'An account with this email already exists. Please sign in.';

            return;
          }


          const user: User = {

            name: name,
            email: email,
            password: this.password

          };


          this.userService
            .register(user)
            .subscribe({

              next: () => {

                this.successMessage =
                  'Registration successful! Please sign in.';

                this.isLogin = true;

                this.name = '';
                this.email = email;
                this.password = '';

                this.errorMessage = '';

              },

              error: (error) => {

                console.error(error);

                this.errorMessage =
                  'Registration failed. Please try again later.';

              }

            });

        },

        error: (error) => {

          console.log(error);

          this.errorMessage =
            'Unable to check this email. Please try again later.';

        }

      });
  }


  togglePassword(): void {

    this.showPassword = !this.showPassword;

  }

}