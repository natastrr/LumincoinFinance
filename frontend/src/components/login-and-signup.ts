import "../styles/login-signup.css";
import {Validation} from "../utils/validation";
import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";
import {Auth} from "../utils/auth";
import {ErrorResponseType, LoginResponseType, SignupResponseType} from "../types";

enum AuthPage {
    LOGIN = '/login',
    SIGNUP = '/sign-up',
}

export class LoginAndSignup {
    readonly locationPathname: string;

    private emailElement: HTMLInputElement | null = null;
    private emailErrorElement: HTMLElement | null = null;
    private passwordElement: HTMLInputElement | null = null;
    private passwordErrorElement: HTMLElement | null = null;

    private rememberMeElement?: HTMLInputElement | null;
    private nameElement?: HTMLInputElement | null;
    private nameErrorElement?: HTMLElement | null;
    private repeatPasswordElement?: HTMLInputElement | null;
    private repeatPasswordErrorElement?: HTMLElement | null;

    readonly emailRegex: RegExp;
    readonly passwordRegex: RegExp;
    readonly nameRegex: RegExp;

    constructor() {
        this.locationPathname = location.pathname;
        this.findElements();
        this.initActions();

        this.emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        this.passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        this.nameRegex = /[а-яА-ЯёЁ\s]/;
    }

    private findElements(): void {
        const getInputElement = (id: string): HTMLInputElement | null => {
            const element: HTMLElement | null = document.getElementById(id);
            return element instanceof HTMLInputElement ? element : null;
        }

        this.emailElement = getInputElement('email');
        this.emailErrorElement = document.getElementById('email-error');
        this.passwordElement = getInputElement('password');
        this.passwordErrorElement = document.getElementById('password-error');

        if (this.locationPathname === AuthPage.LOGIN) {
            this.rememberMeElement = getInputElement('remember-me');
        }

        if (this.locationPathname === AuthPage.SIGNUP) {
            this.nameElement = getInputElement('name');
            this.nameErrorElement = document.getElementById('name-error');
            this.repeatPasswordElement = getInputElement('repeat-password');
            this.repeatPasswordErrorElement = document.getElementById('repeat-password-error');
        }
    }

    private initActions(): void {
        if (this.locationPathname === AuthPage.LOGIN) {
            this.loginActions();
        } else if (this.locationPathname === AuthPage.SIGNUP) {
            this.signUpActions();
        }
    }

    private loginActions(): void {
        const loginButtonElement: HTMLElement | null = document.getElementById('login-button');
        const loginButton: HTMLButtonElement | null = loginButtonElement instanceof HTMLButtonElement ? loginButtonElement : null;
        if (!loginButton) return;
        loginButton.onclick = async (): Promise<void> => {
            let emailValidation: boolean = false, passwordValidation: boolean = false;
            if (this.emailElement && this.emailErrorElement) emailValidation = Validation.fieldValidation(this.emailElement, this.emailErrorElement, this.emailRegex.test(this.emailElement.value));
            if (this.passwordElement && this.passwordErrorElement) passwordValidation = Validation.fieldValidation(this.passwordElement, this.passwordErrorElement, !!this.passwordElement.value);
            if (!!this.emailElement && !!this.passwordElement && emailValidation && passwordValidation && !!this.rememberMeElement) {
                loginButton.disabled = true;
                try {
                    await this.logIn(this.emailElement.value, this.passwordElement.value, this.rememberMeElement.checked);
                } catch(error) {
                    loginButton.disabled = false;
                    alert('Ошибка авторизации!');
                }
            }
        }
    }

    private signUpActions(): void {
        if (!this.nameElement) return;
        this.nameElement.onkeydown = (event: KeyboardEvent): void => {
            if (!this.nameRegex.test(event.key) && !['Backspace', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                event.preventDefault();
            }
        }
        this.nameElement.onblur = (): void => {
            if (this.nameElement && this.nameElement.value.length > 0) {
                this.nameElement.value = this.nameElement.value
                    .trim()
                    .replace(/[^а-яА-ЯёЁ\s]/g, '')
                    .replace(/\s+/g, ' ')
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            }
        };

        const signupButton: HTMLElement | null = document.getElementById('signup-button');
        if (signupButton) {
            signupButton.onclick = async (): Promise<void> => {
                if (this.formValidation()) await this.signUp();
            }
        }
    }

    private formValidation(): boolean {
        let [name, email, password, repeatPassword] = Array(4).fill(false);

        if (this.nameElement && this.nameErrorElement) {
            name = Validation.fieldValidation(this.nameElement, this.nameErrorElement, this.nameElement.value.split(' ').length >= 3);
        }
        if (this.emailElement && this.emailErrorElement) {
            email = Validation.fieldValidation(this.emailElement, this.emailErrorElement, this.emailRegex.test(this.emailElement.value));
        }
        if (this.passwordElement && this.passwordErrorElement) {
            password = Validation.fieldValidation(this.passwordElement, this.passwordErrorElement, this.passwordRegex.test(this.passwordElement.value), !this.passwordElement.value ? 'Заполните пароль!' : 'Пароль должен быть не менее 8 символов, содержать как минимум одну латинскую букву в верхнем регистре и как минимум одну цифру!');
        }
        if (this.passwordElement && this.repeatPasswordElement && this.repeatPasswordErrorElement) {
            repeatPassword = Validation.fieldValidation(this.repeatPasswordElement, this.repeatPasswordErrorElement, this.repeatPasswordElement.value === this.passwordElement.value && this.repeatPasswordElement.value.length > 0, !this.repeatPasswordElement.value ? 'Повторите пароль!' : 'Пароли должны совпадать!');
        }

        return (name && email && password && repeatPassword);
    }

    private async logIn(email: string, password: string, rememberMe: boolean = false): Promise<void> {
        try {
            let result: LoginResponseType | ErrorResponseType = await CustomHttp.request(config.host + AuthPage.LOGIN, 'POST', {
                email: email,
                password: password,
                rememberMe: rememberMe
            });
            if (result && 'message' in result) {
                throw new Error(result.message);
            }
            result = result as LoginResponseType;
            Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
            localStorage.setItem('user', JSON.stringify({
                name: `${result.user.name} ${result.user.lastName}`,
            }));
            location.pathname = '/';
        } catch (error) {
            throw error;
            // console.warn(error);
            // alert('Ошибка авторизации! ' + (error as Error).message);
        }
    }

    private async signUp(): Promise<void> {
        if (!this.nameElement || !this.emailElement || !this.passwordElement || !this.repeatPasswordElement) return;
        const [lastName, name] = this.nameElement.value.split(' ');
        try {
            let result: SignupResponseType | ErrorResponseType = await CustomHttp.request(config.host + '/signup', 'POST', {
                "name": name,
                "lastName": lastName,
                "email": this.emailElement.value,
                "password": this.passwordElement.value,
                "passwordRepeat": this.repeatPasswordElement.value,
            });
            if (result && 'message' in result) {
                throw new Error(result.message);
            }
            await this.logIn(this.emailElement.value, this.passwordElement.value);
        } catch (error) {
            alert('Ошибка! Проверьте данные и попробуйте снова!');
        }
    }
}