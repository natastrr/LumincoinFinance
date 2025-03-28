import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";
import '../styles/income-or-expense.css';

export class IncomeOrExpense {
    constructor() {
        this.title = document.getElementById('content-title');
        this.addCard = document.getElementById('add');
        this.editButtonHref = '';
        this.init();
    }

    init() {
        switch (location.pathname) {
            case '/income':
                this.title.innerText = 'Доходы';
                this.addCard.setAttribute('href', '/create-income');
                this.editButtonHref = '/edit-income-category';
                break;
            case '/expense':
                this.title.innerText = 'Расходы';
                this.addCard.setAttribute('href', '/create-expense');
                this.editButtonHref = '/edit-expense-category';
                break;
        }
        this.creatingCards().then();
    }
    async creatingCards() {
        const cardsEl = document.getElementById('cards');
        cardsEl.querySelectorAll('div.card').forEach(card => card.remove());

        try {
            const result = await CustomHttp.request(config.host + '/categories' + location.pathname);
            if (!result.every(item => item.id && item.title)) {
                throw new Error('Данные отсутствуют или некорректны!');
            }
            result.forEach(item => {
                const newCard = document.createElement('div'); newCard.classList.add('card');
                newCard.innerHTML = `<div class="card-body" id="${item.id}">
                        <h5 class="card-title">${item.title}</h5>
                        <div class="buttons">
                            <button class="btn btn-primary edit-button">Редактировать</button>
                            <button class="btn btn-danger delete-button" data-bs-toggle="modal" data-bs-target="#delete-popup">Удалить</button>
                        </div>
                    </div>`;
                cardsEl.insertBefore(newCard, this.addCard);
            });
            this.addEventListeners();
        } catch(error) {
            alert('Ошибка в получении данных!');
        }
    }
    addEventListeners() {
        Array.from(document.getElementsByClassName('edit-button')).forEach(button => {
            button.onclick = () => {
                const cardBody = button.closest('.card-body');
                sessionStorage.setItem('categoryName', cardBody.getElementsByTagName('h5')[0].innerText);
                sessionStorage.setItem('id', cardBody.id);
                location.pathname = this.editButtonHref;
            }
        });
        Array.from(document.getElementsByClassName('delete-button')).forEach(button => {
            button.onclick = () => {
                document.getElementById('confirm-delete').onclick = async () => {
                    try {
                        const categoryName = button.closest('.card-body').querySelector('.card-title').innerText;
                        const allOperationsResponse = await CustomHttp.request(config.host + '/operations' + '?period=interval&dateFrom=' + (new Date(0)).toISOString().split('T')[0] + '&dateTo=' + (new Date().toISOString().split('T')[0]));
                        if (allOperationsResponse && !!allOperationsResponse.length) {
                            const operationsIdForDelete = allOperationsResponse.filter(item => item?.category === categoryName).map(item => item.id);
                            for (const operationId of operationsIdForDelete) {
                                await CustomHttp.request(config.host + '/operations/' + operationId, 'DELETE');
                            }
                            await CustomHttp.request(config.host + '/categories' + location.pathname + '/' + button.closest('.card-body').id, 'DELETE');
                            document.querySelector('[data-bs-dismiss="modal"].btn-danger')?.click();
                            this.init();
                        }
                    } catch(error) {
                        alert('Не удалось удалить категорию!');
                    }
                }
            }
        });
    }
}