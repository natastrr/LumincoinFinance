import "../styles/create-edit.css";
import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";
import flatpickr from "flatpickr";
import {categoryType, createOrEditOperationRequestType, createOrEditOperationType, EditInfoType, ErrorResponseType} from "../types";

enum texts {
    CreateTitle = 'Создание дохода/расхода',
    EditTitle = 'Редактирование дохода/расхода',
    CreateButtonText = 'Создать', SaveButtonText = 'Сохранить',
    IncomeText = 'доход', IncomesText = 'доходов',
    ExpenseText = 'расход', ExpensesText = 'расходов',
}

enum Routes {
    Create = '/create-income-or-expense',
    Edit = '/edit-income-or-expense',
    Main = '/income&expense'
}

enum StorageKeys {
    CreateType = 'createIncomeOrExpense',
    EditInfo = 'editInfo',
}

export class CreateOrEdit {
    private titleEl: HTMLElement | null = null;
    private createButton: HTMLElement | null = null;
    private incomeOrExpense: string | null = null;
    private categoryInput: HTMLSelectElement | null = null;
    private sumInput: HTMLInputElement | null = null;
    readonly dateInput: flatpickr.Instance;
    private commentInput: HTMLTextAreaElement | null = null;
    readonly editInfo: EditInfoType | null = null;

    constructor() {
        this.findElements();
        this.dateInput = flatpickr("#date-input", {
            dateFormat: "d.m.Y",
            locale: "ru",
            allowInput: true,
        }) as flatpickr.Instance;
        sessionStorage.removeItem(StorageKeys.CreateType);
        switch (location.pathname) {
            case Routes.Create:
                if (this.titleEl) this.titleEl.innerText = texts.CreateTitle;
                if (this.createButton) this.createButton.innerText = texts.CreateButtonText;
                break;
            case Routes.Edit:
                if (this.titleEl) this.titleEl.innerText = texts.EditTitle;
                if (this.createButton) this.createButton.innerText = texts.SaveButtonText;

                const editInfo: string | null = sessionStorage.getItem(StorageKeys.EditInfo);
                if (editInfo) this.editInfo = JSON.parse(editInfo);
                sessionStorage.removeItem(StorageKeys.EditInfo);
                break;
        }
        this.fillInputs().then();
        this.addEventListeners();
    }

    private findElements(): void {
        this.titleEl = document.getElementById('content-title');
        this.createButton = document.getElementById('create-button');
        this.incomeOrExpense = sessionStorage.getItem(StorageKeys.CreateType);
        this.categoryInput = getInputElement('category-input', HTMLSelectElement);
        this.sumInput = getInputElement('sum-input', HTMLInputElement);
        this.commentInput = getInputElement('comment-input', HTMLTextAreaElement);

        function getInputElement<T extends HTMLElement>(id: string, type: new () => T): T | null {
            const element: HTMLElement | null = document.getElementById(id);
            return element instanceof type ? element : null;
        }
    }

    private addEventListeners(): void {
        const cancelButton: HTMLElement | null = document.getElementById('cancel-button');
        if (cancelButton) {
            cancelButton.onclick = (): void => history.back();
        }
        if (!this.createButton) return;
        this.createButton.onclick = (): Promise<void> => this.createOrEditRequest();
    }

    private async createOrEditRequest(): Promise<void> {
        let requestBody: createOrEditOperationRequestType = {
            type: this.incomeOrExpense ? this.incomeOrExpense : '',
            amount: this.sumInput ? parseFloat(this.sumInput.value.replaceAll(' ', '')) : 0,
            date: this.dateInput.input.value,
            comment: this.commentInput ? this.commentInput.value : '',
            category_id: this.categoryInput ? parseInt(this.categoryInput.value) : 0
        };
        let method, link: string = '/operations', errorMessage;
        await new Promise(resolve => setTimeout(resolve, 0));
        if (this.editInfo) {
            const condition: boolean = (
                !!this.editInfo.sum && !!this.editInfo.date && !!this.editInfo.comment && !!this.editInfo.category &&
                this.categoryInput !== null &&
                requestBody.amount === parseFloat(this.editInfo.sum.replace(/[^\d.]/g, '')) &&
                requestBody.date === this.editInfo.date &&
                requestBody.comment === this.editInfo.comment &&
                ((): boolean => {
                    const selectedOption: HTMLOptionElement | undefined = Array.from(this.categoryInput.options).find(option => option.text === this.editInfo?.category);
                    return selectedOption ? requestBody.category_id === parseInt(selectedOption.value) : false;
                })()
            );
            if (condition) return history.back();
            method = 'PUT';
            link += `/${this.editInfo.id}`;
            errorMessage = 'Не удалось сохранить изменения!';
        } else {
            method = 'POST';
            errorMessage = `Не удалось создать ${this.incomeOrExpense === 'income' ? texts.IncomeText : texts.ExpenseText}!`;
        }
        if (Object.values(requestBody).every(value => !!value)) {
            requestBody.date = requestBody.date.split('.').reverse().join('-');
            await new Promise(resolve => setTimeout(resolve, 0));
            try {
                const response: createOrEditOperationType | ErrorResponseType = await CustomHttp.request(config.host + link, method, requestBody);
                if ('error' in response) {
                    throw new Error(response.message);
                }
            } catch (error) {
                alert(errorMessage);
            }
            location.pathname = Routes.Main;
        } else {
            alert('Необходимо заполнить все данные!');
        }
    }

    private async fillInputs(): Promise<void> {
        const typeInput: HTMLElement | null = document.getElementById('type-input');
        let option: HTMLOptionElement | null = null;
        if (typeInput) {
            const optionElement: HTMLElement | null = typeInput.querySelector(`option[value="${this.incomeOrExpense}"]`);
            if (optionElement instanceof HTMLOptionElement) option = optionElement;
        }
        if (option) option.selected = true;
        if (!this.incomeOrExpense) location.pathname = Routes.Main;
        try {
            if (this.incomeOrExpense) await this.getCategories(this.incomeOrExpense);
            if (this.editInfo && this.categoryInput && this.sumInput && this.commentInput) {
                const option: HTMLOptionElement | undefined = Array.from(this.categoryInput.options).find(option => option.text === this.editInfo?.category);
                if (option) option.selected = true;
                this.sumInput.value = this.editInfo.sum.replace(/\D/g, '');
                this.dateInput.setDate(this.editInfo.date);
                this.commentInput.value = this.editInfo.comment;
            }
        } catch (error) {

        }
    }

    private async getCategories(category: string): Promise<void> {
        try {
            const response: categoryType[] | [] | ErrorResponseType = await CustomHttp.request(config.host + '/categories/' + category);
            if ('error' in response) {
                throw new Error(response.message);
            }
            if (Array.isArray(response) && response.length === 0) {
                throw new Error(`Отсутствуют категории ${this.incomeOrExpense === 'income' ? texts.IncomesText : texts.ExpensesText}!`);
            }
            if (!response.every(item => item.id && item.title)) {
                throw new Error('Некорректные данные!');
            }
            response.forEach((item: categoryType): void => {
                const optionEl: HTMLOptionElement = document.createElement('option');
                optionEl.setAttribute('value', item.id.toString());
                optionEl.innerText = item.title;
                if (this.categoryInput) this.categoryInput.appendChild(optionEl);
            });
        } catch (error) {
            location.pathname = Routes.Main;
        }
    }
}