import {default as flatpickr} from "flatpickr";
import "../../node_modules/flatpickr/dist/flatpickr.min.css";
import "../../node_modules/flatpickr/dist/l10n/ru.js";
import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";
import {Auth} from "../utils/auth";

export class Common {
    constructor() {
        this.findElements();
        if (this.balanceEl) {
            this.getBalance().then();
        }
        if (this.userNameEl) {
            this.userNameEl.innerText = JSON.parse(localStorage.getItem('user')).name;
        }
        this.elementsInteraction();
        this.modalInteraction(document.getElementById('open-logout'), 'logout');
        this.modalInteraction(this.balanceEl.closest('.balance'), 'balance');
    }

    findElements() {
        this.burgerButton = document.getElementById('burger-menu-button');
        this.body = document.body;
        this.menuButton = document.querySelector('button.nav-link');
        this.balanceEl = document.getElementById('balance');
        this.userNameEl = document.getElementById('user-name');
    }
    async getBalance() {
        try {
            const result = await CustomHttp.request(config.host + '/balance');
            if (!result || result.error) {
                return alert('Ошибка в получении баланса!');
            }
            this.balanceEl.innerText = result.balance + '$';
        } catch (error) {
            console.log(error);
        }
    }
    elementsInteraction() {
        this.menuButton.onclick = function () {
            this.classList.toggle('active');
            this.classList.toggle('link-dark', !this.classList.contains('active'));
        }
        const currentPath = location.pathname; let activeLink;
        if (currentPath === '/') {
            activeLink = document.getElementById('menu-main');
        } else if (currentPath === '/income&expense') {
            activeLink = document.querySelector('a[href="/income&expense"]');
        } else if ([
            '/income', '/expense', '/create-income', '/create-expense',
            '/edit-income-category', '/edit-expense-category'
        ].includes(currentPath)) {
            let link = currentPath.includes('income') ? '/income' : '/expense';
            document.querySelector(`a[href="${link}"]`).classList.add('show-categories-active');
            activeLink = this.menuButton;
        } else if (currentPath === '/create-income-or-expense' || currentPath === '/edit-income-or-expense') {
            const storedType = sessionStorage.getItem('createIncomeOrExpense');
            if (storedType === 'income' || storedType === 'expense') {
                document.querySelector(`a[href="/${storedType}"]`).classList.add('show-categories-active');
            }
            activeLink = this.menuButton;
        }
        if (activeLink) {
            activeLink.classList.remove('link-dark');
            activeLink.classList.add('active');
        }
        this.burgerButton.onclick = () => {
            this.burgerButton.classList.toggle('active');
            this.body.style.overflow = this.burgerButton.classList.contains('active') ? 'hidden' : '';
        }
    }
    modalInteraction(openModalEl, target) {
        let modalElement = document.getElementById('modal');
        const openModal = openModalEl;
        modalElement = new bootstrap.Modal(modalElement);
        modalElement.onclick = (event) => {
            if (event.target === modalElement) {
                modalElement.hide();
            }
        }
        openModal.onclick = () => {
            const modalBody = document.getElementById('modal-body');
            modalBody.innerHTML = '';
            if (target === 'logout') {
                modalBody.innerHTML = '<button class="btn logout-button" id="action-button">Выйти из аккаунта<i class="fa-solid fa-arrow-right-from-bracket"></i></button>';
            }
            if (target === 'balance') {
                modalBody.innerHTML = `
                    <div class="delete-popup-text">Изменить баланс:</div>
                    <input type="number" class="form-control text-center" value="${parseInt(this.balanceEl.innerText)}">
                    <div class="buttons">
                        <button type="button" class="btn btn-success" id="action-button">Сохранить</button>
                        <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Отменить</button>
                    </div>
                `;
                modalBody.style.flexDirection = 'column';
            }
            modalElement.show();
            modalBody.querySelector('#action-button').onclick = async () => {
                if (target === 'logout') {
                    try {
                        const response = await CustomHttp.request(config.host + '/logout', 'POST', {
                            refreshToken: Auth.refreshTokenKey
                        });
                        if (!response.error) {
                            Auth.removeTokens();
                            location.pathname = '/login';
                        }
                    } catch(error) {
                        alert('Не удалось выполнить выход!');
                        modalElement.hide();
                    }
                }
                if (target === 'balance') {
                    const inputBalanceValue = parseInt(modalBody.querySelector('input[type="number"]').value);
                    if (inputBalanceValue === parseInt(this.balanceEl.innerText)) {
                        modalElement.hide();
                    } else {
                        try {
                            const result = await CustomHttp.request(config.host + '/balance', 'PUT', {newBalance: inputBalanceValue});
                            if (!result || result?.error) {
                                throw new Error(result.message);
                            }
                            this.balanceEl.innerText = result.balance + '$';
                            modalElement.hide();
                        } catch(error) {
                            alert('Не удалось обновить баланс!');
                            modalElement.hide();
                        }
                    }
                }
            }
        }
    }
    static sortButtonsInteraction(sortButtons, callback) {
        const intervalButton = sortButtons.find(element => element.id === 'interval-button');

        let that = this;
        this.dateFrom = flatpickr("#date-from", {
            dateFormat: "d.m.Y",
            locale: "ru",
            allowInput: true,
            onChange: function (selectedDates) {
                that.dateTo.set("minDate", selectedDates[0]);
            }
        });
        this.dateTo = flatpickr("#date-to", {
            dateFormat: "d.m.Y",
            locale: "ru",
            allowInput: true,
            onChange: function (selectedDates) {
                that.dateFrom.set("maxDate", selectedDates[0]);
            }
        });

        let date1, date2;
        sortButtons.forEach(button => {
            button.onclick = () => {

                sortButtons.forEach(item => item.checked = false);
                if (button !== intervalButton) {
                    this.dateFrom.clear();
                    this.dateFrom.input.style.width = '63px';
                    this.dateTo.clear();
                    this.dateTo.input.style.width = '63px';
                    intervalButton.checked = false;

                    date1 = new Date();
                    date2 = new Date();
                    switch (button.id) {
                        case 'today-button':
                            break;
                        case 'week-button':
                            date1.setDate(date2.getDate() - 7);
                            break;
                        case 'month-button':
                            date1.setMonth(date2.getMonth() - 1);
                            break;
                        case 'year-button':
                            date1.setFullYear(date2.getFullYear() - 1);
                            break;
                        case 'all-button':
                            date1.setTime(0);
                    }
                    date1 = date1.toISOString().split('T')[0];
                    date2 = date2.toISOString().split('T')[0];
                } else {
                    if (that.dateFrom.input.value && that.dateTo.input.value) {
                        date1 = that.dateFrom.input.value.split('.').reverse().join('-');
                        date2 = that.dateTo.input.value.split('.').reverse().join('-');
                    } else {
                        date1 = null;
                        date2 = null;
                    }
                }
                button.checked = true;
                if (date1 && date2) {
                    callback(date1, date2);
                }
            }
        });

        function intervalButtonSelected(date) {
            date.input.onchange = function () {
                this.style.width = '115px';
                sortButtons.forEach(button => button.checked = false);
                intervalButton.checked = true;
                if (that.dateFrom.input.value && that.dateTo.input.value) {
                    date1 = that.dateFrom.input.value.split('.').reverse().join('-');
                    date2 = that.dateTo.input.value.split('.').reverse().join('-');
                    callback(date1, date2);
                }
            };
        }
        intervalButtonSelected(this.dateFrom);
        intervalButtonSelected(this.dateTo);
    }
    static async getData(date1, date2) {
        try {
            const response = await CustomHttp.request(config.host + '/operations' + '?period=interval&dateFrom=' + date1 + '&dateTo=' + date2);
            if (response && !!response.length) {
                return response;
            }
        } catch (error) {
            alert('Ошибка при получении данных!');
        }
    }
}