import {Main} from "./components/main";
import {Common} from "./components/common";
import {LoginAndSignup} from "./components/login-and-signup";
import {IncomeOrExpense} from "./components/income-or-expense";
import {Action} from "./components/action";
import {IncomeAndExpense} from "./components/income-and-expense";
import {CreateOrEdit} from "./components/create-or-edit";
import {Auth} from "./utils/auth";

export class Router {
    constructor() {
        this.titlePageElement = document.getElementById('title');
        this.contentPageElement = document.getElementById('content');

        this.initEvents();
        this.routes = [
            {
                route: '/',
                title: 'Главная',
                filePathTemplate: '/templates/main.html',
                useSidebar: '/templates/sidebar.html',
                authRequired: true,
                load: () => {
                    new Common();
                    new Main();
                }
            },
            {
                route: '/404',
                title: 'Страница не найдена',
                filePathTemplate: '/templates/404.html',
                useSidebar: false,
            },
            {
                route: '/login',
                title: 'Вход',
                filePathTemplate: '/templates/login.html',
                useSidebar: false,
                load: () => {
                    new LoginAndSignup();
                }
            },
            {
                route: '/sign-up',
                title: 'Регистрация',
                filePathTemplate: '/templates/sign-up.html',
                useSidebar: false,
                load: () => {
                    new LoginAndSignup();
                }
            },
            {
                route: '/income',
                title: 'Доходы',
                filePathTemplate: '/templates/income-or-expense.html',
                useSidebar: '/templates/sidebar.html',
                authRequired: true,
                load: () => {
                    new Common();
                    new IncomeOrExpense();
                }
            },
            {
                route: '/expense',
                title: 'Расходы',
                filePathTemplate: '/templates/income-or-expense.html',
                useSidebar: '/templates/sidebar.html',
                authRequired: true,
                load: () => {
                    new Common();
                    new IncomeOrExpense();
                }
            },
            {
                route: '/income&expense',
                title: 'Доходы и расходы',
                filePathTemplate: '/templates/income-and-expense.html',
                useSidebar: '/templates/sidebar.html',
                authRequired: true,
                load: () => {
                    new Common();
                    new IncomeAndExpense();
                }
            },
            {
                route: '/create-income',
                title: 'Создать доход',
                filePathTemplate: '/templates/action.html',
                useSidebar: '/templates/sidebar.html',
                authRequired: true,
                load: () => {
                    new Common();
                    new Action();
                }
            },
            {
                route: '/create-expense',
                title: 'Создать расход',
                filePathTemplate: '/templates/action.html',
                useSidebar: '/templates/sidebar.html',
                authRequired: true,
                load: () => {
                    new Common();
                    new Action();
                }
            },
            {
                route: '/edit-income-category',
                title: 'Редактировать доход',
                filePathTemplate: '/templates/action.html',
                useSidebar: '/templates/sidebar.html',
                authRequired: true,
                load: () => {
                    new Common();
                    new Action();
                }
            },
            {
                route: '/edit-expense-category',
                title: 'Редактировать расход',
                filePathTemplate: '/templates/action.html',
                useSidebar: '/templates/sidebar.html',
                authRequired: true,
                load: () => {
                    new Common();
                    new Action();
                }
            },
            {
                route: '/create-income-or-expense',
                title: 'Создание дохода или расхода',
                filePathTemplate: '/templates/create.html',
                useSidebar: '/templates/sidebar.html',
                authRequired: true,
                load: () => {
                    new Common();
                    new CreateOrEdit();
                }
            },
            {
                route: '/edit-income-or-expense',
                title: 'Редактирование дохода или расхода',
                filePathTemplate: '/templates/create.html',
                useSidebar: '/templates/sidebar.html',
                authRequired: true,
                load: () => {
                    new Common();
                    new CreateOrEdit();
                }
            },
        ];
    }

    initEvents() {
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this));
        window.addEventListener('popstate', this.activateRoute.bind(this));
    }
    async activateRoute() {
        const urlRoute = window.location.pathname;
        const newRoute = this.routes.find(item => item.route === urlRoute);
        if (!newRoute) {
            window.location = '/404';
            return;
        }
        if (newRoute.authRequired) {
            const isLoggedIn = await this.checkAuth();
            if (!isLoggedIn) return;
        }
        if (newRoute.title) {
            this.titlePageElement.innerText = newRoute.title + ' | Lumincoin Finance';
        }
        if (newRoute.filePathTemplate) {
            let contentBlock = this.contentPageElement;
            if (newRoute.useSidebar) {
                this.contentPageElement.innerHTML = await fetch(newRoute.useSidebar).then(response => response.text());
                contentBlock = document.getElementById('main');
            }
            contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(response => response.text());
        }
        if (newRoute.load && typeof newRoute.load === 'function') {
            newRoute.load();
        }
    }

    async checkAuth() {
        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        if (accessToken) return true;
        return await Auth.processUnauthorizedResponse();
    }
}