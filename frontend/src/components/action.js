import "../styles/create-edit.css";
import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";

export class Action {
    constructor() {
        this.titleEl = document.getElementById('content-title');
        this.createButton = document.getElementById('create-button');
        this.inputEl = document.getElementById('new-input');

        this.init();
        this.addEventListeners();
    }

    init() {
        this.data = {
            link: '/categories/',
            useId: false,
            method: 'POST',
            route: '/'
        };
        let titleText, greenButtonText, createButtonDisabled;

        switch (location.pathname) {
            case '/create-income':
                titleText = 'Создание категории доходов';
                greenButtonText = 'Создать';
                createButtonDisabled = false;
                this.data.link += 'income'; this.data.route += 'income';
                break;
            case '/create-expense':
                titleText = 'Создание категории расходов';
                greenButtonText = 'Создать';
                createButtonDisabled = false;
                this.data.link += 'expense'; this.data.route += 'expense';
                break;
            case '/edit-income-category':
                titleText = 'Редактирование категории доходов';
                greenButtonText = 'Сохранить';
                createButtonDisabled = true;
                this.data.link += 'income'; this.data.useId = true; this.data.method = 'PUT'; this.data.route += 'income';
                break;
            case '/edit-expense-category':
                titleText = 'Редактирование категории расходов';
                greenButtonText = 'Сохранить';
                createButtonDisabled = true;
                this.data.link += 'expense'; this.data.useId = true; this.data.method = 'PUT'; this.data.route += 'expense';
                break;
        }
        this.titleEl.innerText = titleText;
        this.createButton.innerText = greenButtonText;
        this.createButton.disabled = createButtonDisabled;

        const categoryName = sessionStorage.getItem('categoryName');
        if (categoryName) this.inputEl.value = categoryName;

        this.inputEl.onmouseout = () => {
            this.inputEl.value = this.inputEl.value.trim().replace(/\s+/g, ' ');
            this.inputEl.value = this.inputEl.value.charAt(0).toUpperCase() + this.inputEl.value.slice(1).toLowerCase();

            if (this.inputEl.value !== categoryName) {
                this.createButton.disabled = false;
            }
        }
    }
    addEventListeners() {
        document.getElementById('cancel-button').onclick = () => {
            this.clearSessionStorage();
            history.back();
        }
        this.createButton.onclick = async () => {
            const id = sessionStorage.getItem('id');
            const condition = this.data.useId ? !!this.inputEl.value && id : !!this.inputEl.value;
            const url = this.data.link + (this.data.useId ? '/' + id : '');
            if (condition) {
                try {
                    const response = await CustomHttp.request(config.host + url, this.data.method, {
                        title: this.inputEl.value
                    });
                    if (response.id && response.title) {
                        this.clearSessionStorage();
                        location.pathname = this.data.route;
                    }
                } catch (error) {
                    alert('Не удалось сохранить изменения!');
                }
            }
        }
    }
    clearSessionStorage() {
        sessionStorage.removeItem('categoryName');
        sessionStorage.removeItem('id');
    }
}