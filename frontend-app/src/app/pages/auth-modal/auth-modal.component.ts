import { Component, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DsaService } from '../../core/services/dsa.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative transition-colors">
        
        <!-- Close Button -->
        <button (click)="close.emit()" class="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-lg">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="text-center mb-6">
          <img src="assets/svg/dsa_logo.svg" class="w-12 h-12 rounded-2xl mx-auto mb-3 shadow-md object-contain" alt="JS DSA Logo">
          <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white m-0">
            {{ mode === 'forgot' ? 'Reset Password' : (mode === 'register' ? 'Create Your Account' : 'Sign In to JS DSA') }}
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            {{ mode === 'forgot' ? 'Enter your username to receive a 6-digit OTP code.' : 'Log in to save your code solutions, track your 30-day progress & upvote community methods.' }}
          </p>
        </div>

        <!-- Success Alert -->
        <div *ngIf="successMsg" class="mb-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 p-3 rounded-xl text-xs font-medium">
          {{successMsg}}
        </div>

        <!-- Error Alert -->
        <div *ngIf="errorMsg" class="mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 p-3 rounded-xl text-xs font-medium">
          {{errorMsg}}
        </div>

        <!-- Mode 1 & 2: LOGIN / REGISTER FORM -->
        <form *ngIf="mode !== 'forgot'" (ngSubmit)="submitForm()" class="space-y-4">
          <div *ngIf="mode === 'register'">
            <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
            <input 
              type="email" 
              [(ngModel)]="email" 
              name="email"
              placeholder="e.g. nishat@gmail.com"
              required
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-medium"
            >
          </div>

          <div>
            <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Username</label>
            <input 
              type="text" 
              [(ngModel)]="username" 
              name="username"
              placeholder="e.g. js_master"
              required
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-medium"
            >
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">Password</label>
              <button *ngIf="mode === 'login'" type="button" (click)="mode = 'forgot'; errorMsg = ''; successMsg = ''" class="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 hover:underline">
                Forgot password?
              </button>
            </div>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password"
              placeholder="••••••••"
              required
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-medium"
            >
          </div>

          <button type="submit" [disabled]="loading" class="btn-primary w-full justify-center py-3 text-sm mt-2">
            <i class="fa-solid fa-right-to-bracket"></i>
            {{ mode === 'register' ? 'Register Account' : 'Sign In' }}
          </button>
        </form>

        <!-- Mode 3: FORGOT PASSWORD FORM -->
        <form *ngIf="mode === 'forgot'" (ngSubmit)="submitForgotForm()" class="space-y-4">
          <div>
            <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Registered Username</label>
            <input 
              type="text" 
              [(ngModel)]="username" 
              name="username"
              placeholder="Enter your registered username"
              required
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-medium"
            >
          </div>

          <div *ngIf="otpSent">
            <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">6-Digit OTP Code</label>
            <input 
              type="text" 
              [(ngModel)]="otpCode" 
              name="otpCode"
              placeholder="123456"
              maxLength="6"
              required
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white outline-none font-mono font-bold tracking-widest text-center"
            >
          </div>

          <div *ngIf="otpSent">
            <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">New Password</label>
            <input 
              type="password" 
              [(ngModel)]="newPassword" 
              name="newPassword"
              placeholder="Enter new password"
              required
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-medium"
            >
          </div>

          <button type="submit" [disabled]="loading" class="btn-primary w-full justify-center py-3 text-sm mt-2">
            <i class="fa-solid fa-paper-plane"></i>
            {{ getSubmitButtonText() }}
          </button>
        </form>

        <!-- Google Sign-In Button Container -->
        <div *ngIf="mode !== 'forgot'" class="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div class="text-center mb-2">
            <span class="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wide">Or Sign In with</span>
          </div>
          <div id="googleSignInBtn" class="w-full flex justify-center min-h-[40px]"></div>
        </div>


        <!-- Toggle Links -->
        <div class="mt-5 text-center space-y-1">
          <button *ngIf="mode === 'login'" (click)="mode = 'register'; errorMsg = ''; successMsg = ''" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold block mx-auto">
            New learner? Create an Account
          </button>
          <button *ngIf="mode === 'register'" (click)="mode = 'login'; errorMsg = ''; successMsg = ''" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold block mx-auto">
            Already have an account? Sign In
          </button>
          <button *ngIf="mode === 'forgot'" (click)="mode = 'login'; otpSent = false; errorMsg = ''; successMsg = ''" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold block mx-auto">
            ← Back to Sign In
          </button>
        </div>

      </div>
    </div>
  `
})
export class AuthModalComponent implements AfterViewInit {
  @Output() close = new EventEmitter<void>();

  mode: 'login' | 'register' | 'forgot' = 'login';
  username = '';
  email = '';
  password = '';
  otpCode = '';
  newPassword = '';
  otpSent = false;
  loading = false;

  errorMsg = '';
  successMsg = '';

  constructor(
    private authService: AuthService,
    private dsaService: DsaService
  ) {}

  ngAfterViewInit() {
    setTimeout(() => this.initGoogleSignIn(), 200);
  }

  private initGoogleSignIn() {
    if (typeof window !== 'undefined' && (window as any).google) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: '305407856293-5gdm6e769q8jdphd1tmq6c18gmfa9cio.apps.googleusercontent.com',
          callback: (response: any) => this.handleGoogleCredential(response)
        });

        const container = document.getElementById('googleSignInBtn');
        if (container) {
          (window as any).google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: '280',
            shape: 'pill'
          });
        }
      } catch (err) {
        console.warn('Google Identity SDK notice:', err);
      }
    }
  }

  handleGoogleCredential(response: any) {
    if (!response || !response.credential) return;
    this.loading = true;
    this.errorMsg = '';
    this.authService.loginWithGoogle(response.credential).subscribe({
      next: (res) => {
        this.loading = false;
        this.dsaService.fetchCurriculum(res.user.id).subscribe();
        this.close.emit();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.error || 'Google Sign-In failed';
      }
    });
  }

  getSubmitButtonText(): string {
    if (this.mode === 'register') return 'Create Account';
    if (this.mode === 'forgot') return this.otpSent ? 'Reset Password' : 'Send OTP Code';
    return 'Sign In';
  }

  submitForm() {
    this.errorMsg = '';
    this.successMsg = '';
    this.loading = true;

    if (this.mode === 'register') {
      this.authService.register(this.username, this.email, this.password).subscribe({
        next: (res) => {
          this.loading = false;
          this.dsaService.fetchCurriculum(res.user.id).subscribe();
          this.close.emit();
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err.error?.error || 'Registration failed';
        }
      });
    } else {
      this.authService.login(this.username, this.password).subscribe({
        next: (res) => {
          this.loading = false;
          this.dsaService.fetchCurriculum(res.user.id).subscribe();
          this.close.emit();
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err.error?.error || 'Invalid credentials';
        }
      });
    }
  }

  submitForgotForm() {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.otpSent) {
      // Step 1: Send OTP
      if (!this.username) {
        this.errorMsg = 'Please enter your registered username.';
        return;
      }
      this.loading = true;
      this.authService.forgotPassword(this.username).subscribe({
        next: (res) => {
          this.loading = false;
          this.otpSent = true;
          this.successMsg = res.message || 'OTP code sent! Check server console / email.';
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err.error?.error || 'Failed to send OTP code.';
        }
      });
    } else {
      // Step 2: Reset Password with OTP
      if (!this.otpCode || !this.newPassword) {
        this.errorMsg = 'Please enter both OTP code and new password.';
        return;
      }
      this.loading = true;
      this.authService.resetPassword(this.username, this.otpCode, this.newPassword).subscribe({
        next: (res) => {
          this.loading = false;
          this.successMsg = res.message || 'Password reset successfully!';
          setTimeout(() => {
            this.mode = 'login';
            this.otpSent = false;
            this.successMsg = 'Password reset! You can now sign in.';
          }, 1500);
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err.error?.error || 'Password reset failed.';
        }
      });
    }
  }
}
