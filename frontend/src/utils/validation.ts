export class Validation {
    public static validField(element: HTMLElement, errorElement: HTMLElement): void {
        errorElement.style.display = 'none';
        element.classList.add('is-valid');
        element.classList.remove('is-invalid');
    }
    public static invalidField(element: HTMLElement, errorElement: HTMLElement, errorElementText: string | null = null): void {
        errorElement.style.display = 'block';
        element.classList.add('is-invalid');
        element.classList.remove('is-valid');
        if (errorElementText) {
            errorElement.innerText = errorElementText;
        }
    }
    public static fieldValidation(element: HTMLElement, errorElement: HTMLElement, condition?: boolean, errorInnerText?:string): boolean {
        if (condition) {
            this.validField(element, errorElement);
            return true;
        } else {
            errorInnerText ? this.invalidField(element, errorElement, errorInnerText) : this.invalidField(element, errorElement);
            return false;
        }
    }
}