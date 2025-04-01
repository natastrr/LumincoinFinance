import "../styles/common-styles.css";
import "../styles/income-and-expense.css";
import {Common} from "./common";
import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";

export class IncomeAndExpense {
    constructor() {
        this.sortButtons = [...document.querySelectorAll('.sort-by-period > input')];
        this.tableEl = document.getElementById('table');
        this.createIncomeButton = document.getElementById('create-income');
        this.createExpenseButton = document.getElementById('create-expense');
        this.init();
    }

    init() {
        this.addEventListeners();
        if (this.sortButtons) {
            Common.sortButtonsInteraction(this.sortButtons, async (date1, date2) => {
                this.tableEl.innerHTML = '';
                const data = await Common.getData(date1, date2);
                if (data && !!data.length) {
                    this.fillData(data);
                    this.addActionListeners();
                }
            });
            if (this.sortButtons.length > 0) {
                this.sortButtons[0].click();
            }
        }
        this.getCategories('income').then(response => this.createIncomeButton.disabled = response);
        this.getCategories('expense').then(response => this.createExpenseButton.disabled = response);
    }
    addEventListeners() {
        this.createIncomeButton.onclick = () => {
            sessionStorage.setItem('createIncomeOrExpense', 'income');
            location.pathname = '/create-income-or-expense';
        }
        this.createExpenseButton.onclick = () => {
            sessionStorage.setItem('createIncomeOrExpense', 'expense');
            location.pathname = '/create-income-or-expense';
        }
    }
    fillData(data) {
        data.forEach((item, index) => {
            const lineEl = document.createElement('tr'); lineEl.id = item.id;
            lineEl.innerHTML = `
                    <td>${index + 1}</td>
                    <td class="type">Доход/Расход</td>
                    <td class="category">${item.category}</td>
                    <td class="sum">${item.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} $</td>
                    <td class="date">${item.date.split('-').reverse().join('.')}</td>
                    <td class="comment">${item.comment}</td>
                    <td>
                        <div class="icons">
                            <button class="delete-buttons" data-bs-toggle="modal" data-bs-target="#delete-popup"><i class="fa-regular fa-trash-can"></i></button>
                            <button class="edit-buttons"><i class="fa-solid fa-pencil"></i></button>
                        </div>
                    </td>
                `;
            const typeEl = lineEl.querySelector('.type');
            if (item.type === 'income') {
                typeEl.classList.add('text-success');
                typeEl.innerText = 'Доход';
            }
            if (item.type === 'expense') {
                typeEl.classList.add('text-danger');
                typeEl.innerText = 'Расход';
            }
            this.tableEl.appendChild(lineEl);
        });
    }
    addActionListeners() {
        editOrDeleteButtonsOnclick('edit-buttons');
        editOrDeleteButtonsOnclick('delete-buttons');
        function editOrDeleteButtonsOnclick(className) {
            Array.from(document.getElementsByClassName(className)).forEach(button => {
                button.onclick = () => {
                    if (className === 'edit-buttons') {
                        const trEl = button.closest('tr');
                        const type = trEl.querySelector('.type').innerText;

                        let editInfo = {
                            id: parseInt(trEl.id),
                            type: type,
                            category: trEl.querySelector('.category').innerText,
                            sum: trEl.querySelector('.sum').innerText,
                            date: trEl.querySelector('.date').innerText,
                            comment: trEl.querySelector('.comment').innerText
                        };
                        sessionStorage.setItem('editInfo', JSON.stringify(editInfo));
                        sessionStorage.setItem('createIncomeOrExpense', type === 'Доход' ? 'income' : 'expense');
                        location.pathname = '/edit-income-or-expense';
                    }
                    if (className === 'delete-buttons') {
                        document.getElementById('confirm-delete').onclick = async () => {
                            try {
                                const response = CustomHttp.request(config.host + `/operations/${button.closest('tr').id}`, 'DELETE');
                                if (response.error) {
                                    throw new Error();
                                }
                                document.querySelector('[data-bs-dismiss="modal"].btn-danger')?.click();
                                location.pathname = '/income&expense';
                            } catch(error) {
                                alert('Не удалось удалить операцию!');
                            }
                        }
                    }
                }
            });
        }
    }
    async getCategories(category) {
        try {
            const response = await CustomHttp.request(config.host + '/categories/' + category);
            return !(response && response.length && response.every(item => item.id && item.title));
        } catch (error) {
            console.log(error.message);
        }
    }
}