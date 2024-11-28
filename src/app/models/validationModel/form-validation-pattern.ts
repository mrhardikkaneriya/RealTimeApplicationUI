export class FormValidationPattern {
  emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"
  passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[.!@#$%^&*_=+-]).{6,16}$"
  onlyNumberPattern = "^[0-9]{0,}$"
}
