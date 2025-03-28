import "../styles/login-signup.css";
import {Validation} from "../utils/validation";
import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";
import {Auth} from "../utils/auth";

export class LoginAndSignup {
    constructor() {
        this.locationPathname = location.pathname;
        this.findElements();
        this.initActions();
    }

    findElements() {
        this.emailElement = document.getElementById('email');
        this.emailErrorElement = document.getElementById('email-error');
        this.passwordElement = document.getElementById('password');
        this.passwordErrorElement = document.getElementById('password-error');

        if (this.locationPathname === '/login') {
            this.rememberMeElement = document.getElementById('remember-me');
        }
        if (this.locationPathname === '/sign-up') {
            this.nameElement = document.getElementById('name');
            this.nameErrorElement = document.getElementById('name-error');
            this.repeatPasswordElement = document.getElementById('repeat-password');
            this.repeatPasswordErrorElement = document.getElementById('repeat-password-error');
        }
    }
    initActions() {
        if (this.locationPathname === '/login') {
            this.loginActions();
        } else if (this.locationPathname === '/sign-up') {
            this.signUpActions();
        }
    }
    loginActions() {
        document.getElementById('login-button').addEventListener('click', async () => {
            const emailValidation = Validation.fieldValidation(this.emailElement, this.emailErrorElement, /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(this.emailElement.value));
            const passwordValidation = Validation.fieldValidation(this.passwordElement, this.passwordErrorElement, this.passwordElement.value);

            if (emailValidation && passwordValidation) {
                await this.logIn(this.emailElement.value, this.passwordElement.value, this.rememberMeElement.checked);
            }
        });
    }
    signUpActions() {
        this.nameElement.onkeydown = (event) => {
            if (!/[а-яА-ЯёЁ\s]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
                return false;
            }
        };
        this.nameElement.onblur = () => {
            this.nameElement.value = this.nameElement.value
                .trim()
                .replace(/[^а-яА-ЯёЁ\s]/g, '')
                .replace(/\s+/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        };
        document.getElementById('signup-button').addEventListener('click', async () => {
            if (this.formValidation()) {
                await this.signUp();
            }
        });
    }
    formValidation() {
        const name = Validation.fieldValidation(this.nameElement, this.nameErrorElement, this.nameElement.value.split(' ').length >= 3);
        const email = Validation.fieldValidation(this.emailElement, this.emailErrorElement, /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(this.emailElement.value));
        const password = Validation.fieldValidation(this.passwordElement, this.passwordErrorElement, /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(this.passwordElement.value), !this.passwordElement.value ? 'Заполните пароль!' : 'Пароль должен быть не менее 8 символов, содержать как минимум одну латинскую букву в верхнем регистре и как минимум одну цифру!');
        const repeatPassword = Validation.fieldValidation(this.repeatPasswordElement, this.repeatPasswordErrorElement, this.repeatPasswordElement.value === this.passwordElement.value && this.repeatPasswordElement.value.length, !this.repeatPasswordElement.value ? 'Повторите пароль!' : 'Пароли должны совпадать!');
        return (name && email && password && repeatPassword);
    }
    async logIn(email, password, rememberMe = false) {
        try {
            const result = await CustomHttp.request(config.host + '/login', 'POST', {
                email: email,
                password: password,
                rememberMe: rememberMe
            });
            if (result) {
                if (result?.error || !result.tokens || !result?.user || !result.tokens.accessToken || !result.tokens.refreshToken) {
                    throw new Error(result.message);
                }
                Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);

                localStorage.setItem('user', JSON.stringify({
                    name: `${result.user.name} ${result.user.lastName}`,
                }));

                location.pathname = '/';
            } else {
                throw new Error();
            }
        } catch (error) {
            alert('Неверный адрес электронной почты или пароль!');
        }
    }
    async signUp() {
        const [lastName, name] = this.nameElement.value.split(' ');
        try {
            const result = await CustomHttp.request(config.host + '/signup', 'POST', {
                "name": name,
                "lastName": lastName,
                "email": this.emailElement.value,
                "password": this.passwordElement.value,
                "passwordRepeat": this.repeatPasswordElement.value,
            });
            if (result) {
                if (result.error || !result.user) {
                    throw new Error(result);
                }
                await this.logIn(this.emailElement.value, this.passwordElement.value);
            }
        } catch (error) {
            alert('Ошибка! Проверьте данные и попробуйте снова!');
        }
    }
}