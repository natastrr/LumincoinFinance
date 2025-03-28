export class Validation {
    static validField(element, errorElement) {
        errorElement.style.display = 'none';
        element.classList.add('is-valid');
        element.classList.remove('is-invalid');
    }
    static invalidField(element, errorElement, errorElementText = null) {
        errorElement.style.display = 'block';
        element.classList.add('is-invalid');
        element.classList.remove('is-valid');
        if (errorElementText) {
            errorElement.innerText = errorElementText;
        }
    }
    static fieldValidation(element, errorElement, condition, errorInnerText = null) {
        if (condition) {
            this.validField(element, errorElement);
            return true;
        } else {
            errorInnerText ? this.invalidField(element, errorElement, errorInnerText) : this.invalidField(element, errorElement);
            return false;
        }
    }
}