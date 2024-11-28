import { Component, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidationPattern } from '../../models/validationModel/form-validation-pattern';
import { FormValidationMessage } from '../../models/validationModel/form-validation-message';
import { CheckFormValidation } from '../../models/validationModel/check-form-validation';
import { ProjectPlanningService } from '../../services/project-planning.service';
import { CreateProjectPlanningDetail } from '../../models/requestModel/create-project-planning-detail';
import { SignalRService } from '../../services/signalr.service';
import { Router } from '@angular/router';
import { MoneyPipe } from "../../pipes/money.pipe";
import { MoneyPipeConstants, RouteConstants, SignalRConstants } from '../../constants/app.constants';

@Component({
  selector: 'app-project-planning',
  standalone: true,
  imports: [ReactiveFormsModule, MoneyPipe],
  templateUrl: './project-planning.component.html',
  styleUrl: './project-planning.component.scss'
})
export class ProjectPlanningComponent implements OnInit {

  constructor(private readonly projectPlanningService: ProjectPlanningService,
    private readonly formBuilder: FormBuilder, private readonly signalRService: SignalRService,
    private readonly router: Router) { }

  ngOnInit(): void {
    this.getDetails();
    this.buildForm();
  }
  
  isPopupShow: boolean = false;
  projectPlanningDetails!: any;
  projectPlanningForm!: FormGroup;

  INRSymbol = MoneyPipeConstants.INRSymbol;

  formFields = {
    projectName: 'projectName',
    projectDescription: 'projectDescription',
    projectBudget: 'projectBudget',
    projectCoPlanner: 'projectCoPlanner',
  }

  validationPattern = new FormValidationPattern();
  validationMessage = new FormValidationMessage();
  checkValidation = new CheckFormValidation();

  getDetails() {
    this.projectPlanningService.GetDetails()
      .pipe(
        catchError(error => {
          return of([]);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.projectPlanningDetails = response;
        },
        error: () => { },
        complete: () => { }
      });

    this.signalRService.startConnection();
    this.signalRService.itemListener(SignalRConstants.ProjectPlanning, (message: any, item: any) => {
      switch (message) {
        case SignalRConstants.ProjectPlanningCreated:
          this.projectPlanningDetails.push(item);
          break;
        default:
          break;
      }
    });
  }

  private buildForm() {
    const formGroup = this.formBuilder.group({});
    formGroup.addControl(this.formFields.projectName, this.formBuilder.control('', { validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)], updateOn: 'change' }));
    formGroup.addControl(this.formFields.projectDescription, this.formBuilder.control('', { validators: [Validators.required, Validators.minLength(5), Validators.maxLength(200)], updateOn: 'change' }));
    formGroup.addControl(this.formFields.projectBudget, this.formBuilder.control('', { validators: [Validators.required, Validators.pattern(this.validationPattern.onlyNumberPattern), Validators.maxLength(9)], updateOn: 'change' }));
    formGroup.addControl(this.formFields.projectCoPlanner, this.formBuilder.control('', { validators: [Validators.required, Validators.pattern(this.validationPattern.emailPattern), Validators.maxLength(75)], updateOn: 'change' }));

    this.projectPlanningForm = formGroup;
  }

  goToPositionDetail(id: number) {
    this.router.navigate([RouteConstants.PositionDetail, id]);
  }

  showPopUp(isShow: boolean) {
    this.isPopupShow = isShow;
    this.projectPlanningForm.reset();
  }
  
  markFormAsTouched() {
    Object.keys(this.projectPlanningForm.controls).forEach((key) => { this.projectPlanningForm.get(key)?.markAsTouched(); });
  }

  getFormValue(): CreateProjectPlanningDetail {
    const projectPlanningForm = this.projectPlanningForm;
    const projectPlanningDetail = new CreateProjectPlanningDetail;
    projectPlanningDetail.projectName = projectPlanningForm.get(this.formFields.projectName)?.value;
    projectPlanningDetail.projectDescription = projectPlanningForm.get(this.formFields.projectDescription)?.value;
    projectPlanningDetail.totalBudget = projectPlanningForm.get(this.formFields.projectBudget)?.value;
    projectPlanningDetail.userEmail = projectPlanningForm.get(this.formFields.projectCoPlanner)?.value;
    return projectPlanningDetail;
  }

  createProjectPlanning() {
    if (this.projectPlanningForm.invalid) {
      this.markFormAsTouched();
      return;
    }
    const projectPlanningDetail: CreateProjectPlanningDetail = this.getFormValue();
    this.projectPlanningService.CreateProjectPlanning(projectPlanningDetail)
      .pipe(
        catchError((error:any) => {
          if(error.status == 404 && error.error != undefined){
            alert(error.error);
          }
          return of([]);
        })
      )
      .subscribe({
        next: () => {
          this.isPopupShow = false;
          this.projectPlanningForm.reset();
         },
        error: () => { },
        complete: () => { }
      });
  }
}