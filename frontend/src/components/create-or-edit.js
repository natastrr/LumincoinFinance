import "../styles/create-edit.css";
import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";
import {default as flatpickr} from "flatpickr";

export class CreateOrEdit {
    constructor() {
        this.findElements();
        sessionStorage.removeItem('createIncomeOrExpense');

        switch (location.pathname) {
            case '/create-income-or-expense':
                this.titleEl.innerText = 'Создание дохода/расхода';
                this.createButton.innerText = 'Создать';
                break;
            case '/edit-income-or-expense':
                this.titleEl.innerText = 'Редактирование дохода/расхода';
                this.createButton.innerText = 'Сохранить';
                this.editInfo = JSON.parse(sessionStorage.getItem('editInfo'));
                sessionStorage.removeItem('editInfo');
                break;
        }

        this.fillInputs().then();
        this.addEventListeners();
    }

    findElements() {
        this.titleEl = document.getElementById('content-title');
        this.createButton = document.getElementById('create-button');
        this.incomeOrExpense = sessionStorage.getItem('createIncomeOrExpense');
        this.categoryInput = document.getElementById('category-input');
        this.sumInput = document.getElementById('sum-input');
        this.dateInput = document.getElementById('date-input');
        this.dateInput = flatpickr("#date-input", {
            dateFormat: "d.m.Y",
            locale: "ru",
            allowInput: true,
        });
        this.commentInput = document.getElementById('comment-input');
    }

    addEventListeners() {
        document.getElementById('cancel-button').onclick = () => {
            history.back();
        }
        this.createButton.onclick = async () => {
            let requestBody = {
                type: this.incomeOrExpense,
                amount: parseFloat(this.sumInput.value.replaceAll(' ', '')),
                date: this.dateInput.input.value,
                comment: this.commentInput.value,
                category_id: parseInt(this.categoryInput.value)
            };
            let method, link = '/operations', errorMessage;
            if (this.editInfo) {
                const condition = requestBody.amount === parseFloat(this.editInfo.sum.replace(/[^\d.]/g, '')) &&
                    requestBody.date === this.editInfo.date &&
                    requestBody.comment === this.editInfo.comment &&
                    requestBody.category_id === parseInt(Array.from(this.categoryInput.options).find(option => option.text === this.editInfo.category).value);
                if (condition) {
                    history.back();
                    return;
                }
                method = 'PUT';
                link += `/${this.editInfo.id}`;
                errorMessage = 'Не удалось сохранить изменения!';
            } else {
                method = 'POST';
                errorMessage = `Не удалось создать ${this.incomeOrExpense === 'income' ? 'доход' : 'расход'}!`;
            }
            if (Object.values(requestBody).every(value => !!value)) {
                requestBody.date = requestBody.date.split('.').reverse().join('-');
                try {
                    const response = await CustomHttp.request(config.host + link, method, requestBody);
                    if (!response || !response.id || !response.type || !response.amount || !response.date || !response.comment) {
                        throw new Error(response.message);
                    }
                } catch (error) {
                    alert(errorMessage);
                }
                location.pathname = '/income&expense';
            } else {
                alert('Необходимо заполнить все данные!');
            }
        }
    }

    async fillInputs() {
        const option = document.getElementById('type-input').querySelector(`option[value="${this.incomeOrExpense}"]`);
        if (option) option.selected = true;

        await this.getCategories(this.incomeOrExpense).then();

        if (this.editInfo) {
            const option = Array.from(this.categoryInput.options).find(option => option.text === this.editInfo.category);
            if (option) {
                option.selected = true;
            }
            this.sumInput.value = this.editInfo.sum.replace(/\D/g, '');
            this.dateInput.setDate(this.editInfo.date);
            this.commentInput.value = this.editInfo.comment;
        }
    }

    async getCategories(category) {
        try {
            const response = await CustomHttp.request(config.host + '/categories/' + category);

            if (!response || !response.length) {
                throw new Error(`Отсутствуют категории ${this.incomeOrExpense === 'income' ? 'доходов' : 'расходов'}! Создайте категорию!`);
            }
            if (!response.every(item => item.id && item.title)) {
                throw new Error('Некорректные данные!');
            }
            response.forEach(item => {
                const optionEl = document.createElement('option');
                optionEl.setAttribute('value', item.id);
                optionEl.innerText = item.title;
                this.categoryInput.appendChild(optionEl);
            });
        } catch (error) {
            let messageText = error.message, locationPathname = '/income&expense';
            error.message.includes('Отсутствуют категории') ? locationPathname = '/create-' + this.incomeOrExpense : messageText = 'Возникла ошибка в получении данных!';
            alert(messageText);
            location.pathname = locationPathname;
        }
    }
}