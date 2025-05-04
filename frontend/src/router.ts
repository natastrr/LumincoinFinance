import {Main} from "./components/main";
import {Common} from "./components/common";
import {LoginAndSignup} from "./components/login-and-signup";
import {IncomeOrExpense} from "./components/income-or-expense";
import {Action} from "./components/action";
import {IncomeAndExpense} from "./components/income-and-expense";
import {CreateOrEdit} from "./components/create-or-edit";
import {Auth} from "./utils/auth";
import {RouteType} from "./types";

export class Router {
    readonly titlePageElement: HTMLElement | null;
    readonly contentPageElement: HTMLElement | null;
    private routes: RouteType[];

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
                load: (): void => {
                    new Common();
                    new Main();
                }
            },
            {
                route: '/404',
                title: 'Страница не найдена',
                filePathTemplate: '/templates/404.html',
            },
            {
                route: '/login',
                title: 'Вход',
                filePathTemplate: '/templates/login.html',
                load: (): void => {
                    new LoginAndSignup();
                }
            },
            {
                route: '/sign-up',
                title: 'Регистрация',
                filePathTemplate: '/templates/sign-up.html',
                load: (): void => {
                    new LoginAndSignup();
                }
            },
            {
                route: '/income',
                title: 'Доходы',
                filePathTemplate: '/templates/income-or-expense.html',
                useSidebar: '/templates/sidebar.html',
                authRequired: true,
                load: (): void => {
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
                load: (): void => {
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
                load: (): void => {
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
                load: (): void => {
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
                load: (): void => {
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
                load: (): void => {
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
                load: (): void => {
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
                load: (): void => {
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
                load: (): void => {
                    new Common();
                    new CreateOrEdit();
                }
            },
        ];
    }

    private initEvents(): void {
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this));
        window.addEventListener('popstate', this.activateRoute.bind(this));
    }

    private async activateRoute(): Promise<void> {
        const urlRoute: string = window.location.pathname;
        const newRoute: RouteType | undefined = this.routes.find(item => item.route === urlRoute);
        if (!newRoute) {
            window.location.pathname = '/404';
            return;
        }
        if (newRoute.authRequired && !localStorage.getItem(Auth.accessTokenKey)) {
            await Auth.processUnauthorizedResponse();
            return;
        }
        if (newRoute.title && this.titlePageElement) {
            this.titlePageElement.innerText = newRoute.title + ' | Lumincoin Finance';
        }
        if (newRoute.filePathTemplate) {
            let contentBlock: HTMLElement | null = this.contentPageElement;
            if (newRoute.useSidebar && this.contentPageElement) {
                this.contentPageElement.innerHTML = await fetch(newRoute.useSidebar).then(response => response.text());
                contentBlock = document.getElementById('main');
            }
            if (contentBlock) {
                contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(response => response.text());
            }
        }
        if (newRoute.load && typeof newRoute.load === 'function') {
            newRoute.load();
        }
    }
}