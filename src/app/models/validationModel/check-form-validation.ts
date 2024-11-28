import { FormGroup } from "@angular/forms";

export class CheckFormValidation {
    hasError(formGroup: FormGroup, controlName: string, validator: string) {
        const control = formGroup.get(controlName);
        if (!control)
          return false;
        return (control.touched || control.dirty) && control.hasError(validator);
      }
    
      hasTouched(formGroup: FormGroup, controlName: string) {
        const control = formGroup.get(controlName);
        if (!control)
          return false;
        return (control.touched || control.dirty);
      }
}
