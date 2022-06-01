import {Injectable} from '@angular/core';
import {FirebaseAuthentication} from '@capacitor-firebase/authentication';
import {Router} from '@angular/router';
import {
  Auth,
  signInWithCredential,
  signOut
} from '@angular/fire/auth';
import {updateProfile, GoogleAuthProvider, PhoneAuthProvider, User} from 'firebase/auth';
import {Capacitor} from '@capacitor/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public currentUser: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  private verificationId: string;

  constructor(public auth: Auth, public router: Router) {
    this.auth.onAuthStateChanged(user => this.setCurrentUser(user));
  }

  isLoggedIn(): boolean {
    return this.currentUser.getValue() !== null;
  }

  getProfilePic(): string {
    // eslint-disable-next-line max-len
    return this.currentUser.getValue() && this.currentUser.getValue().photoURL ? this.currentUser.getValue().photoURL : '/assets/Portrait_Placeholder.png';
  }

  getDisplayName(): string | undefined {
    return this.currentUser.getValue() ? this.currentUser.getValue().displayName : undefined;
  }

  getEmail(): string | undefined {
    return this.currentUser.getValue() ? this.currentUser.getValue().email : undefined;
  }

  getUserUID(): string | undefined {
    return this.currentUser.getValue()? this.currentUser.getValue().uid : undefined;
  }

  async signOut(): Promise<void> {
    await FirebaseAuthentication.signOut();

    if (Capacitor.isNativePlatform()) {
      await signOut(this.auth);
    }
  }

  async signInWithGoogle(): Promise<void> {
    // Sign in on the native layer.
    const {credential: {idToken, accessToken}} = await FirebaseAuthentication.signInWithGoogle();

    // Sign in on the web layer.
    // The plug-in only handles the native layer, for PWA this isn't a problem.
    // However, for native apps this is a problem, as the app is web-based.
    if (Capacitor.isNativePlatform()) {
      // A credential can be generated for each supported provider,
      // however, the signature of these methods is varied.
      // Make sure to check the Firebase JavaScript SDK docs to find the required parameters.
      // https://firebase.google.com/docs/auth/web/google-signin
      const googleCredential = GoogleAuthProvider.credential(idToken, accessToken);
      await signInWithCredential(this.auth, googleCredential);

    }
  }

  async signInWithFacebook(): Promise<void>{
    //const provider = new FacebookAuthProvider();

    /*signInWithPopup(this.auth, provider)
      .then(async (result) => {
        const user = result.user;

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;
        await signInWithCredential(this.auth, credential);

      }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email;
      // The AuthCredential type that was used.
      const credential = FacebookAuthProvider.credentialFromError(error);
      });


    //await signInWithRedirect(this.auth, provider);*/

    const {credential: {idToken, accessToken}} = await FirebaseAuthentication.signInWithFacebook();

    if (Capacitor.isNativePlatform()) {


      const facebookCredential = GoogleAuthProvider.credential(idToken, accessToken);
      await signInWithCredential(this.auth, facebookCredential);
    }
/*    if (Capacitor.isNativePlatform()) {

      getRedirectResult(this.auth)
        .then(async (result) => {
          // This gives you a Facebook Access Token. You can use it to access the Facebook API.
          const facebookCredential = FacebookAuthProvider.credentialFromResult(result);
          await signInWithCredential(this.auth, facebookCredential);

        }).catch((error) => {
        // Handle Errors here.
        const facebookerrorCode = error.code;
        const facebookerrorMessage = error.message;
        // The email of the user's account used.
        const facebookemail = error.email;
        // AuthCredential type that was used.
        const facebookcredential = FacebookAuthProvider.credentialFromError(error);

      });
    }*/
  };

  /**
   * The login process for a phone is seperated in 2 part.
   *  1. A Verification code is send to the user. <-- This method.
   *  2. The verification code is entered on the website and used to log in.
   *
   * @param phoneNumber The phone number to which the verification code must be sent.
   */
  async sendPhoneVerificationCode(phoneNumber: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const {verificationId} = await FirebaseAuthentication.signInWithPhoneNumber({phoneNumber});
    this.verificationId = verificationId;
  }

  /**
   * Authenticate the user through the verification send to his phone number.
   *
   * @param verificationCode
   */
  async signInWithPhoneNumber(verificationCode: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // We can't log in through the plug-in here, we must either choose
    // authentication on the web layer, or on the native layer.
    // A verification code can only be used once.
    const credential = PhoneAuthProvider.credential(this.verificationId, verificationCode);
    await signInWithCredential(this.auth, credential);
  };

  async updateDisplayName(displayName: string): Promise<void> {
    await updateProfile(this.auth.currentUser, {
      displayName
    });
  }

  /**
   * Save the new user as an instance variable, and perform any necessary reroutes.
   *
   * @param user The new user.
   * @private
   */
  private async setCurrentUser(user: User): Promise<void> {
    this.currentUser.next(user);
    console.log(user);
    if (this.currentUser.getValue()) {
      await this.router.navigate(['/']);
    } else {
      await this.router.navigate(['/', 'login']);
    }
  }
}
