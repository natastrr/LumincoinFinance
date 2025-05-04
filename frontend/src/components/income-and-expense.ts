import "../styles/common-styles.css";
import "../styles/income-and-expense.css";
import {Common} from "./common";
import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";
import {categoryType, EditInfoType, ErrorResponseType, operationType} from "../types";

enum Texts {
    income = 'income',
    expense = 'expense',
    createIncomeOrExpense = 'createIncomeOrExpense',
    editInfo = 'editInfo',
    editButtons = 'edit-buttons',
    deleteButtons = 'delete-buttons',
}

enum Routes {
    createIncomeOrExpense = '/create-income-or-expense',
    editIncomeOrExpense = '/edit-income-or-expense',
    incomeAndExpense = '/income&expense',
}

export class IncomeAndExpense {
    readonly sortButtons: HTMLInputElement[] | null = null;
    readonly tableEl: HTMLTableSectionElement | null;
    readonly createIncomeButton: HTMLButtonElement | null;
    readonly createExpenseButton: HTMLButtonElement | null;

    constructor() {
        this.sortButtons = Array.from(document.querySelectorAll<HTMLInputElement>('.sort-by-period > input'));
        const table: HTMLElement | null = document.getElementById('table');
        this.tableEl = table instanceof HTMLTableSectionElement ? table : null;
        const createIncome: HTMLElement | null = document.getElementById('create-income');
        this.createIncomeButton = createIncome instanceof HTMLButtonElement ? createIncome : null;
        const createExpense: HTMLElement | null = document.getElementById('create-expense');
        this.createExpenseButton = createExpense instanceof HTMLButtonElement ? createExpense : null;
        this.init();
    }

    private init(): void {
        this.addEventListeners();
        if (this.sortButtons) {
            Common.sortButtonsInteraction(this.sortButtons, async (date1: string | null, date2: string | null): Promise<void> => {
                if (this.tableEl) this.tableEl.innerHTML = ''; if (!date1 || !date2) return;
                const data: operationType[] | undefined = await Common.getData(date1, date2);
                if (data && data.length > 0) {
                    this.fillData(data);
                    this.addActionListeners();
                }
            });
            if (this.sortButtons.length > 0) this.sortButtons[0].click();
        }

        this.getCategories(Texts.income).then((response: boolean): void => {
            if (this.createIncomeButton) this.createIncomeButton.disabled = !response;
        });
        this.getCategories(Texts.expense).then((response: boolean): void=> {
            if (this.createExpenseButton) this.createExpenseButton.disabled = !response
        });
    }

    private addEventListeners(): void {
        if (this.createIncomeButton) {
            this.createIncomeButton.onclick = (): void => {
                sessionStorage.setItem(Texts.createIncomeOrExpense, Texts.income);
                location.pathname = Routes.createIncomeOrExpense;
            }
        }
        if (this.createExpenseButton) {
            this.createExpenseButton.onclick = (): void => {
                sessionStorage.setItem(Texts.createIncomeOrExpense, Texts.expense);
                location.pathname = Routes.createIncomeOrExpense;
            }
        }
    }

    private fillData(data: operationType[]): void {
        data.forEach((item: operationType, index: number): void => {
            const lineEl: HTMLTableRowElement = document.createElement('tr');
            lineEl.id = item.id.toString();
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
            const typeEl: HTMLElement | null = lineEl.querySelector('.type');
            if (!typeEl) return;
            if (item.type === Texts.income) {
                typeEl.classList.add('text-success');
                typeEl.innerText = 'Доход';
            }
            if (item.type === Texts.expense) {
                typeEl.classList.add('text-danger');
                typeEl.innerText = 'Расход';
            }
            if (this.tableEl) this.tableEl.appendChild(lineEl);
        });
    }

    private addActionListeners(): void {
        editOrDeleteButtonsOnclick(Texts.editButtons);
        editOrDeleteButtonsOnclick(Texts.deleteButtons);

        function editOrDeleteButtonsOnclick(className: string): void {
            Array.from(document.getElementsByClassName(className)).forEach(button => {
                (button as HTMLButtonElement).onclick = (): void => {
                    if (className === Texts.editButtons) {
                        const trEl: HTMLTableRowElement | null = button.closest('tr');
                        if (!trEl) return;
                        const typeElement: HTMLElement | null = trEl.querySelector('.type');
                        if (!typeElement) return;
                        const type: string = typeElement.innerText;
                        const [categoryElement, sumElement, dateElement, commentElement]: Array<HTMLElement | null> =
                            ['.category', '.sum', '.date', '.comment'].map(selector => trEl.querySelector(selector));
                        if (!categoryElement || !sumElement || !dateElement || !commentElement) return;
                        let editInfo: EditInfoType = {
                            id: parseInt(trEl.id),
                            type: type,
                            category: categoryElement.innerText,
                            sum: sumElement.innerText,
                            date: dateElement.innerText,
                            comment: commentElement.innerText
                        };
                        sessionStorage.setItem(Texts.editInfo, JSON.stringify(editInfo));
                        sessionStorage.setItem(Texts.createIncomeOrExpense, type === 'Доход' ? Texts.income : Texts.expense);
                        location.pathname = Routes.editIncomeOrExpense;
                    }
                    if (className === Texts.deleteButtons) {
                        let confirmDeleteButton: HTMLElement | null = document.getElementById('confirm-delete');
                        confirmDeleteButton = confirmDeleteButton instanceof HTMLButtonElement ? confirmDeleteButton : null;
                        if (!confirmDeleteButton) return;
                        confirmDeleteButton.onclick = async (): Promise<void> => {
                            try {
                                const trEl: HTMLTableRowElement | null = button.closest('tr');
                                if (!trEl) throw new Error;
                                const response: ErrorResponseType = await CustomHttp.request(config.host + `/operations/${trEl.id}`, 'DELETE');
                                if (response.error) throw new Error;
                                const modal: HTMLElement | null = document.querySelector('[data-bs-dismiss="modal"].btn-danger');
                                if (modal) modal.click();
                                location.pathname = Routes.incomeAndExpense;
                            } catch (error) {
                                alert('Не удалось удалить операцию!');
                            }
                        }
                    }
                }
            });
        }
    }

    private async getCategories(category: Texts.income | Texts.expense): Promise<boolean> {
        try {
            const response: categoryType[] | [] | ErrorResponseType = await CustomHttp.request(config.host + '/categories/' + category);
            return !('error' in response) && Array.isArray(response) && response.length > 0 && response.every(item => 'id' in item && 'title' in item);
        } catch (error) {
            console.log(error instanceof Error ? error.message : error);
            return false;
        }
    }
}