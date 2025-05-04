import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";
import '../styles/income-or-expense.css';
import {categoryType, createOrEditOperationType, ErrorResponseType} from "../types";

export class IncomeOrExpense {
    readonly title: HTMLElement | null = null;
    readonly addCard: HTMLElement | null = null;
    private editButtonHref: string;

    constructor() {
        this.title = document.getElementById('content-title');
        this.addCard = document.getElementById('add');
        this.editButtonHref = '';
        this.init();
    }

    private init(): void {
        if (!this.title || !this.addCard) return;
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

    private async creatingCards(): Promise<void> {
        const cardsEl: HTMLElement | null = document.getElementById('cards');
        if (!cardsEl) return;
        cardsEl.querySelectorAll('div.card').forEach(card => card.remove());
        try {
            const result: categoryType[] | [] | ErrorResponseType = await CustomHttp.request(config.host + '/categories' + location.pathname);

            if (!(Array.isArray(result) && result.every(item => item.id && item.title))) {
                throw new Error('Данные отсутствуют или некорректны!');
            }
            result.forEach((item: categoryType): void => {
                const newCard: HTMLDivElement = document.createElement('div');
                newCard.classList.add('card');
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
        } catch (error) {
            alert('Ошибка в получении данных!');
        }
    }

    private addEventListeners(): void {
        Array.from(document.getElementsByClassName('edit-button')).forEach(button => {
            (button as HTMLButtonElement).onclick = (): void => {
                const cardBody: HTMLElement | null = button.closest('.card-body');
                if (!cardBody) return;
                sessionStorage.setItem('categoryName', cardBody.getElementsByTagName('h5')[0].innerText);
                sessionStorage.setItem('id', cardBody.id);
                location.pathname = this.editButtonHref;
            }
        });
        Array.from(document.getElementsByClassName('delete-button')).forEach(button => {
            (button as HTMLButtonElement).onclick = (): void => {
                const confirmDeleteButtonElement: HTMLElement | null = document.getElementById('confirm-delete');
                const confirmDeleteButton: HTMLButtonElement | null = confirmDeleteButtonElement instanceof HTMLButtonElement ? confirmDeleteButtonElement : null;
                if (!confirmDeleteButton) return;

                confirmDeleteButton.onclick = async (): Promise<void> => {
                    try {
                        const cardBody: HTMLElement | null = button.closest('.card-body');
                        if (!cardBody) throw new Error;
                        const cardTitle: HTMLElement | null = cardBody.querySelector('.card-title');
                        if (!cardTitle) throw new Error;
                        const categoryName: string = cardTitle.innerText;

                        const allOperationsResponse: createOrEditOperationType[] | [] | ErrorResponseType = await CustomHttp.request(config.host + '/operations' + '?period=interval&dateFrom=' + (new Date(0)).toISOString().split('T')[0] + '&dateTo=' + (new Date().toISOString().split('T')[0]));

                        if ('error' in allOperationsResponse || Array.isArray(allOperationsResponse) && allOperationsResponse.length === 0) {
                            throw new Error;
                        }

                        const operationsIdForDelete: number[] = allOperationsResponse.filter(item => item?.category === categoryName).map(item => item.id);

                        for (const operationId of operationsIdForDelete) {
                            await CustomHttp.request(config.host + '/operations/' + operationId, 'DELETE');
                        }

                        await CustomHttp.request(config.host + '/categories' + location.pathname + '/' + cardBody.id, 'DELETE');
                        const modal: HTMLElement | null = document.querySelector('[data-bs-dismiss="modal"].btn-danger');
                        if (modal) modal.click();
                        this.init();
                    } catch (error) {
                        alert('Не удалось удалить категорию!');
                    }
                }
            }
        });
    }
}