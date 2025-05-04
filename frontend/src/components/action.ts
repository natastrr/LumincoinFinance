import "../styles/create-edit.css";
import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";
import {ErrorResponseType} from "../types";

enum actionRoutes {
    CREATE_INCOME = '/create-income',
    CREATE_EXPENSE = '/create-expense',
    EDIT_INCOME = '/edit-income-category',
    EDIT_EXPENSE = '/edit-expense-category',
}

export class Action {
    readonly titleEl: HTMLElement | null = null;
    readonly createButton: HTMLButtonElement | null = null;
    readonly inputEl: HTMLInputElement | null = null;
    private data?: {
        link: string,
        useId: boolean,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        route: string,
    };

    constructor() {
        this.titleEl = document.getElementById('content-title');
        const createButtonEl: HTMLElement | null = document.getElementById('create-button');
        this.createButton = createButtonEl instanceof HTMLButtonElement ? createButtonEl : null;
        const input: HTMLElement | null = document.getElementById('new-input');
        this.inputEl = input instanceof HTMLInputElement ? input : null;
        this.init();
        this.addEventListeners();
    }

    private init(): void {
        if (!this.titleEl || !this.createButton || !this.inputEl) return;

        this.data = {
            link: '/categories/',
            useId: false,
            method: 'POST',
            route: '/'
        };

        let titleText: string = '', greenButtonText: string = '', createButtonDisabled: boolean = false;

        switch (location.pathname) {
            case actionRoutes.CREATE_INCOME:
                titleText = 'Создание категории доходов';
                greenButtonText = 'Создать';
                createButtonDisabled = false;
                this.data.link += 'income'; this.data.route += 'income';
                break;
            case actionRoutes.CREATE_EXPENSE:
                titleText = 'Создание категории расходов';
                greenButtonText = 'Создать';
                createButtonDisabled = false;
                this.data.link += 'expense'; this.data.route += 'expense';
                break;
            case actionRoutes.EDIT_INCOME:
                titleText = 'Редактирование категории доходов';
                greenButtonText = 'Сохранить';
                createButtonDisabled = true;
                this.data.link += 'income'; this.data.useId = true; this.data.method = 'PUT'; this.data.route += 'income';
                break;
            case actionRoutes.EDIT_EXPENSE:
                titleText = 'Редактирование категории расходов';
                greenButtonText = 'Сохранить';
                createButtonDisabled = true;
                this.data.link += 'expense'; this.data.useId = true; this.data.method = 'PUT'; this.data.route += 'expense';
                break;
        }
        this.titleEl.innerText = titleText;
        this.createButton.innerText = greenButtonText;
        this.createButton.disabled = createButtonDisabled;

        const categoryName: string | null = sessionStorage.getItem('categoryName');
        if (categoryName ) this.inputEl.value = categoryName;

        this.inputEl.onmouseout = (): void => {
            if (!this.inputEl?.value || !this.createButton) return;

            this.inputEl.value = this.inputEl.value.trim().replace(/\s+/g, ' ');
            this.inputEl.value = this.inputEl.value.charAt(0).toUpperCase() + this.inputEl.value.slice(1).toLowerCase();

            if (this.inputEl.value !== categoryName) {
                this.createButton.disabled = false;
            }
        }
    }

    private addEventListeners(): void {
        const cancelButtonEl: HTMLElement | null = document.getElementById('cancel-button');
        if (cancelButtonEl) {
            cancelButtonEl.onclick = (): void => {
                this.clearSessionStorage();
                history.back();
            }
        }
        if (this.createButton) {
            this.createButton.onclick = async (): Promise<void> => {
                if (!this.data || !this.inputEl) return;
                const id: string | null = sessionStorage.getItem('id');
                const condition: boolean = this.data.useId ? !!this.inputEl.value && !!id : !!this.inputEl.value;
                const url: string = this.data.link + (this.data.useId ? '/' + id : '');
                if (condition) {
                    try {
                        const response: { id: number, title: string } | ErrorResponseType = await CustomHttp.request(config.host + url, this.data.method, { title: this.inputEl.value });
                        if ('id' in response && 'title' in response) {
                            this.clearSessionStorage();
                            location.pathname = this.data.route;
                        } else {
                            throw new Error;
                        }
                    } catch (error) {
                        alert('Не удалось сохранить изменения!');
                    }
                }
            }
        }
    }

    private clearSessionStorage(): void {
        sessionStorage.removeItem('categoryName');
        sessionStorage.removeItem('id');
    }
}