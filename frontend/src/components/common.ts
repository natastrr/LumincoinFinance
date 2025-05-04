import flatpickr from "flatpickr";
import "../../node_modules/flatpickr/dist/flatpickr.min.css";
import "../../node_modules/flatpickr/dist/l10n/ru.js";
import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";
import {Auth} from "../utils/auth";
import {Balance, operationType, ErrorResponseType} from "../types";
import {Modal} from "bootstrap";

export class Common {
    private burgerButton: HTMLElement | null = null;
    private body: HTMLElement | null = null;
    private menuButton: HTMLElement | null = null;
    private balanceEl: HTMLElement | null = null;
    private userNameEl: HTMLElement | null = null;

    constructor() {
        this.findElements();
        if (this.balanceEl) this.getBalance().then();

        const userName: string | null = localStorage.getItem('user');
        if (userName && this.userNameEl) {
            const userInfoObj: { name: string } = JSON.parse(userName);
            if ('name' in userInfoObj) this.userNameEl.innerText = userInfoObj.name;
        }

        this.elementsInteraction();
        const openLogoutElement: HTMLElement | null = document.getElementById('open-logout');
        if (openLogoutElement) {
            this.modalInteraction(openLogoutElement, 'logout');
        }
        if (this.balanceEl) {
            const balance: HTMLElement | null = this.balanceEl.closest('.balance');
            if (balance) {
                this.modalInteraction(balance, 'balance');
            }
        }
    }

    private findElements(): void {
        this.burgerButton = document.getElementById('burger-menu-button');
        this.body = document.body;
        this.menuButton = document.querySelector('button.nav-link');
        this.balanceEl = document.getElementById('balance');
        this.userNameEl = document.getElementById('user-name');
    }

    private async getBalance(): Promise<void> {
        try {
            const result: Balance | ErrorResponseType = await CustomHttp.request<Balance | ErrorResponseType>(config.host + '/balance');
            if ('error' in result) {
                return alert(`Ошибка в получении баланса: ${result.error}!`);
            }
            if (this.balanceEl) {
                this.balanceEl.innerText = `${result.balance}$`;
            }
        } catch (error) {
            console.log('Ошибка при получении баланса:', error);
        }
    }

    private elementsInteraction(): void {
        if (this.burgerButton && this.body) {
            const {burgerButton, body} = this;
            burgerButton.onclick = (): void => {
                burgerButton.classList.toggle('active');
                body.style.overflow = burgerButton.classList.contains('active') ? 'hidden' : '';
            }
        }

        if (!this.menuButton) return;
        this.menuButton.onclick = function (): void {
            const menuButton = this as HTMLButtonElement;
            menuButton.classList.toggle('active');
            menuButton.classList.toggle('link-dark', !menuButton.classList.contains('active'));
        }

        const currentPath: string = location.pathname;
        let activeLink: HTMLElement | null = null;

        if (currentPath === '/') {
            activeLink = document.getElementById('menu-main');
        } else if (currentPath === '/income&expense') {
            activeLink = document.querySelector('a[href="/income&expense"]');
        } else if ([
            '/income', '/expense', '/create-income', '/create-expense',
            '/edit-income-category', '/edit-expense-category'
        ].includes(currentPath)) {
            let link: string = currentPath.includes('income') ? '/income' : '/expense';
            const aLink: HTMLElement | null = document.querySelector(`a[href="${link}"]`);
            if (aLink) {
                aLink.classList.add('show-categories-active');
            }
            activeLink = this.menuButton;
        } else if (currentPath === '/create-income-or-expense' || currentPath === '/edit-income-or-expense') {
            const storedType: string | null = sessionStorage.getItem('createIncomeOrExpense');
            if (storedType === 'income' || storedType === 'expense') {
                const aStoredType: HTMLElement | null = document.querySelector(`a[href="/${storedType}"]`);
                if (aStoredType) {
                    aStoredType.classList.add('show-categories-active');
                }
            }
            activeLink = this.menuButton;
        }
        if (activeLink) {
            activeLink.classList.remove('link-dark');
            activeLink.classList.add('active');
        }
    }

    private modalInteraction(openModalEl: HTMLElement, target: string): void {
        const modalEl: HTMLElement | null = document.getElementById('modal');
        if (!modalEl) return;
        const modalElement: Modal = new Modal(modalEl);

        openModalEl.onclick = (): void => {
            const modalBody: HTMLElement | null = document.getElementById('modal-body');

            if (!modalBody) return;
            modalBody.innerHTML = '';

            if (target === 'logout') {
                modalBody.innerHTML = '<button class="btn logout-button" id="action-button">Выйти из аккаунта<i class="fa-solid fa-arrow-right-from-bracket"></i></button>';
            }
            if (target === 'balance') {
                modalBody.innerHTML = `
                    <div class="delete-popup-text">Изменить баланс:</div>
                    <input type="number" class="form-control text-center" value="${this.balanceEl ? parseInt(this.balanceEl.innerText) : ''}">
                    <div class="buttons">
                        <button type="button" class="btn btn-success" id="action-button">Сохранить</button>
                        <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Отменить</button>
                    </div>
                `;
                modalBody.style.flexDirection = 'column';
            }

            modalElement.show();

            const modalBodyActionButton: HTMLElement | null = modalBody.querySelector('#action-button');
            if (!modalBodyActionButton) return;

            modalBodyActionButton.onclick = async (): Promise<void> => {
                if (target === 'logout') {
                    try {
                        const response: ErrorResponseType = await CustomHttp.request(config.host + '/logout', 'POST', {
                            refreshToken: Auth.refreshTokenKey
                        });
                        if (!response.error) {
                            Auth.removeTokens();
                            location.pathname = '/login';
                        }
                    } catch (error) {
                        alert('Не удалось выполнить выход!');
                        modalElement.hide();
                    }
                }
                if (target === 'balance') {
                    const modalBodyNumberInput: HTMLInputElement | null = modalBody.querySelector('input[type="number"]');
                    if (!modalBodyNumberInput || !this.balanceEl) return;
                    const inputBalanceValue: number = parseInt(modalBodyNumberInput.value);

                    if (inputBalanceValue === parseInt(this.balanceEl.innerText)) {
                        modalElement.hide();
                    } else {
                        try {
                            const result: Balance = await CustomHttp.request(config.host + '/balance', 'PUT', {newBalance: inputBalanceValue});
                            this.balanceEl.innerText = result.balance + '$';
                            modalElement.hide();
                        } catch (error) {
                            alert('Не удалось обновить баланс!');
                            modalElement.hide();
                        }
                    }
                }
            }
        }
    }

    public static sortButtonsInteraction(sortButtons: HTMLInputElement[], callback: (date1: string | null, date2: string | null) => Promise<void>): void {
        const intervalButton: HTMLInputElement | undefined = sortButtons.find(element => element.id === 'interval-button');

        const dateFrom = flatpickr("#date-from", {
            dateFormat: "d.m.Y",
            locale: "ru",
            allowInput: true,
            onChange: (selectedDates: Date[]): void => {
                dateTo.set("minDate", selectedDates[0]);
            }
        }) as flatpickr.Instance;
        const dateTo = flatpickr("#date-to", {
            dateFormat: "d.m.Y",
            locale: "ru",
            allowInput: true,
            onChange: (selectedDates: Date[]): void => {
                dateFrom.set("maxDate", selectedDates[0]);
            }
        }) as flatpickr.Instance;

        let date1: string | null, date2: string | null;

        sortButtons.forEach((button: HTMLInputElement): void => {
            button.onclick = (): void => {
                sortButtons.forEach(item => item.checked = false);
                if (button !== intervalButton) {
                    dateFrom.clear();
                    dateFrom.input.style.width = '63px';
                    dateTo.clear();
                    dateTo.input.style.width = '63px';
                    if (intervalButton) intervalButton.checked = false;

                    const tempDate1 = new Date(), tempDate2 = new Date();

                    switch (button.id) {
                        case 'today-button':
                            break;
                        case 'week-button':
                            tempDate1.setDate(tempDate2.getDate() - 7);
                            break;
                        case 'month-button':
                            tempDate1.setMonth(tempDate2.getMonth() - 1);
                            break;
                        case 'year-button':
                            tempDate1.setFullYear(tempDate2.getFullYear() - 1);
                            break;
                        case 'all-button':
                            tempDate1.setTime(0);
                    }
                    date1 = tempDate1.toISOString().split('T')[0];
                    date2 = tempDate2.toISOString().split('T')[0];
                } else {
                    if (dateFrom.input.value && dateTo.input.value) {
                        date1 = dateFrom.input.value.split('.').reverse().join('-');
                        date2 = dateTo.input.value.split('.').reverse().join('-');
                    } else {
                        date1 = null;
                        date2 = null;
                    }
                }
                button.checked = true;
                if (date1 && date2) {
                    callback(date1, date2).then();
                }
            }
        });

        function intervalButtonSelected(date: flatpickr.Instance): void {
            date.input.onchange = function (): void {
                date.input.style.width = '115px';
                sortButtons.forEach(button => button.checked = false);
                if (intervalButton) intervalButton.checked = true;
                if (dateFrom.input.value && dateTo.input.value) {
                    date1 = dateFrom.input.value.split('.').reverse().join('-');
                    date2 = dateTo.input.value.split('.').reverse().join('-');
                    callback(date1, date2).then();
                }
            };
        }

        intervalButtonSelected(dateFrom);
        intervalButtonSelected(dateTo);
    }

    public static async getData(date1: string, date2: string): Promise<operationType[] | undefined> {
        try {
            const response: operationType[] | [] = await CustomHttp.request(config.host + '/operations' + '?period=interval&dateFrom=' + date1 + '&dateTo=' + date2);
            if (response && response.length > 0) {
                return response;
            }
        } catch (error) {
            alert('Ошибка при получении данных!');
        }
    }
}