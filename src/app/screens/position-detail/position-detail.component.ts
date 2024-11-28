import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidationPattern } from '../../models/validationModel/form-validation-pattern';
import { FormValidationMessage } from '../../models/validationModel/form-validation-message';
import { CheckFormValidation } from '../../models/validationModel/check-form-validation';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { ActivatedRoute, Router } from '@angular/router';
import { SignalRService } from '../../services/signalr.service';
import { ProjectPlanningService } from '../../services/project-planning.service';
import { catchError, of } from 'rxjs';
import { PositionDetailsService } from '../../services/position-details.service';
import { CreatePositionDetailsDetail } from '../../models/requestModel/create-position-details-detail';
import { MoneyPipe } from "../../pipes/money.pipe";
import { LocalStorageConstants, MoneyPipeConstants, RouteConstants, SignalRConstants } from '../../constants/app.constants';

@Component({
  selector: 'app-position-detail',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, NgChartsModule, MoneyPipe],
  templateUrl: './position-detail.component.html',
  styleUrl: './position-detail.component.scss'
})
export class PositionDetailComponent implements OnInit {

  positionDetailForm!: FormGroup;
  validationPattern = new FormValidationPattern();
  validationMessage = new FormValidationMessage();
  checkValidation = new CheckFormValidation();

  positionDetailsFilteredDetails: any[] = [];
  positionDetailsDetails: any;
  projectPlanningDetails: any;

  INRSymbol = MoneyPipeConstants.INRSymbol;

  readonly formFields = {
    positionDesignation: 'positionDesignation',
    positionDepartment: 'positionDepartment',
    positionBudget: 'positionBudget',
    positionLocation: 'positionLocation'
  };

  readonly designations: string[] = ['HR', 'Engineering', 'Product', 'Sales', 'Marketing', 'Other'];
  readonly tableColumns: string[] = ['designation', 'department', 'budget', 'location', 'last Updated', ''];

  readonly filterCategory: { [key: string]: string } = {
    Designation: 'designation',
    Department: 'department',
    Budget: 'budget',
    Location: 'location',
    'Last Updated': 'lastUpdatedByUserName'
  };

  searchTerm: string = '';
  selectedColumn: string = 'designation';

  pagination = {
    currentPage: 1,
    pageSize: 10,
    start: 1,
    end: 10
  };

  totalProjects: number = 0;
  totalPages: number = 0;
  usedBudget: number = 0;

  departmentPercentages: any;
  datasetsData!: any[];
  datasetsDepartmentColor!: any[];

  isPopupShow: boolean = false;
  projectPlanningId!: any;

  constructor(private readonly positionDetailsService: PositionDetailsService,
    private readonly projectPlanningService: ProjectPlanningService,
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly signalRService: SignalRService,
    private readonly router: Router
  ) { }
  
  ngOnInit(): void {
    this.projectPlanningId = this.route.snapshot.paramMap.get('id');
    this.buildForm();
    this.loadProjects();
  }

  goBack() {
    this.router.navigate([RouteConstants.ProjectPlanning]);
  }

  loadProjects(): void {
    this.GetProjectPlanningById();
    this.positionDetailsDetails = this.getDetails();
    this.totalProjects = this.positionDetailsDetails?.length;
    this.totalPages = Math.ceil(this.totalProjects / this.pagination.pageSize);
    this.updatePagination();
    this.calculateTotalBudget();
  }

  filteredProjects() {
    this.positionDetailsFilteredDetails = this.positionDetailsDetails;
    if (this.searchTerm) {
      this.positionDetailsFilteredDetails = this.positionDetailsDetails.filter((project: any) =>
        String(project[this.selectedColumn]).toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.totalProjects = this.positionDetailsFilteredDetails?.length;
    this.totalPages = Math.ceil(this.totalProjects / this.pagination.pageSize);

    if (this.pagination.currentPage > this.totalPages) {
      this.pagination.currentPage = this.totalPages > 0 ? this.totalPages : 1;
    }

    this.updatePagination(this.positionDetailsFilteredDetails);
    this.positionDetailsFilteredDetails = this.positionDetailsFilteredDetails?.slice(this.pagination.start - 1, this.pagination.end);
  }

  updatePagination(filteredProjects: any[] = this.positionDetailsDetails): void {
    this.pagination.start = (this.pagination.currentPage - 1) * this.pagination.pageSize + 1;
    this.pagination.end = this.pagination.currentPage * this.pagination.pageSize;
    if (this.pagination?.end > filteredProjects?.length) {
      this.pagination.end = filteredProjects.length;
    }
  }

  onSearchTermChange(): void {
    this.pagination.currentPage = 1;
    this.filteredProjects();
  }

  onColumnChange(): void {
    this.pagination.currentPage = 1;
    this.filteredProjects();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pagination.currentPage = page;
    this.filteredProjects();
  }

  pageNumbers(): number[] {
    const numbers = [];
    for (let i = 1; i <= this.totalPages; i++) {
      numbers.push(i);
    }
    return numbers;
  }

  totalPage(): number {
    return Math.ceil(this.totalProjects / this.pagination.pageSize);
  }

  showPopUp(state: boolean): void {
    this.isPopupShow = state;
    this.positionDetailForm.reset();
  }

  markFormAsTouched() {
    Object.keys(this.positionDetailForm.controls).forEach((key) => { this.positionDetailForm.get(key)?.markAsTouched(); });
  }

  createPositionDetails(): void {

    if (this.positionDetailForm.invalid) {
      this.markFormAsTouched();
      return;
    }
    const projectPlanningDetail: CreatePositionDetailsDetail = this.getFormValue();
    projectPlanningDetail.projectPlanningId = this.projectPlanningId;
    projectPlanningDetail.lastUpdatedBy = Number(localStorage.getItem(LocalStorageConstants.UserId));
    this.positionDetailsService.CreatePositionDetails(projectPlanningDetail)
      .pipe(
        catchError(error => {
          if (error.error != '') {
            alert(error.error);
          }
          return of([]);
        })
      )
      .subscribe({
        next: () => {
          this.positionDetailForm.reset();
          this.isPopupShow = false;
        },
        error: () => { },
        complete: () => { }
      });
  }

  private buildForm() {
    const formGroup = this.formBuilder.group({});
    formGroup.addControl(this.formFields.positionDesignation, this.formBuilder.control('', { validators: [Validators.required, Validators.minLength(3), Validators.maxLength(150)], updateOn: 'change' }));
    formGroup.addControl(this.formFields.positionDepartment, this.formBuilder.control('', { validators: [Validators.required], updateOn: 'change' }));
    formGroup.addControl(this.formFields.positionBudget, this.formBuilder.control('', { validators: [Validators.required, Validators.pattern(this.validationPattern.onlyNumberPattern)], updateOn: 'change' }));
    formGroup.addControl(this.formFields.positionLocation, this.formBuilder.control('', { validators: [Validators.required, Validators.minLength(3), Validators.maxLength(150)], updateOn: 'change' }));
    this.positionDetailForm = formGroup;
  }

  getFormValue(): CreatePositionDetailsDetail {
    const positionDetailForm = this.positionDetailForm;
    const positionDetailsDetail = new CreatePositionDetailsDetail;
    positionDetailsDetail.designation = positionDetailForm.get(this.formFields.positionDesignation)?.value;
    positionDetailsDetail.department = positionDetailForm.get(this.formFields.positionDepartment)?.value;
    positionDetailsDetail.budget = positionDetailForm.get(this.formFields.positionBudget)?.value;
    positionDetailsDetail.location = positionDetailForm.get(this.formFields.positionLocation)?.value;
    return positionDetailsDetail;
  }

  deleteProject(positionDetailsId: number): void {
    this.positionDetailsService.DeletePositionDetails(positionDetailsId)
      .pipe(
        catchError(() => {
          return of([]);
        })
      )
      .subscribe({
        next: () => { },
        error: () => { },
        complete: () => { }
      });
  }

  calculateTotalBudget() {
    const departmentBudgets: { [key: string]: number } = {};
    this.positionDetailsDetails?.forEach((position: { department: string | number; budget: number; }) => {
      departmentBudgets[position.department] = (departmentBudgets[position.department] || 0) + position.budget;
    });

    this.usedBudget = this.positionDetailsDetails?.reduce((total: any, position: { budget: any; }) => total + position.budget, 0);

    const departmentPercentages = Object.keys(departmentBudgets).map(department => {
      const departmentBudget = departmentBudgets[department];
      const percentage = (departmentBudget / this.projectPlanningDetails?.totalBudget) * 100;
      return {
        department,
        percentage: percentage
      };
    });

    this.departmentPercentages = departmentPercentages;
    this.datasetsData = [];
    this.datasetsDepartmentColor = [];
    const departmentColors: { [key: string]: string } = {
      [this.designations[0]]: '#ff0000',
      [this.designations[1]]: '#00ff08',
      [this.designations[2]]: '#00b573',
      [this.designations[3]]: '#002aff',
      [this.designations[4]]: '#f7de00',
      [this.designations[5]]: '#e034d2',
    };

    for (const element of departmentPercentages) {
      this.datasetsData.push(Number(element.percentage));
      this.datasetsDepartmentColor.push(departmentColors[element.department] || '');
    }

    this.chartData = {
      datasets: [
        {
          hoverBackgroundColor: this.datasetsDepartmentColor,
          hoverBorderColor: ['black'],
          backgroundColor: this.datasetsDepartmentColor,
          data: this.datasetsData
        }
      ]
    }
  };

  public chartData!: ChartData<'doughnut'>;
  public chartType = 'doughnut' as const;
  public chartOptions: ChartOptions<'doughnut'> = {
    cutout: '70%',
    plugins: {
      legend: {
        display: true,
        position: 'center',
        align: 'center'
      },
      tooltip: { enabled: true }
    },

  };

  GetProjectPlanningById() {
    this.projectPlanningService.GetProjectPlanningById(this.projectPlanningId)
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
  }
  getDetails() {
    this.positionDetailsService.GetPositionDetails(this.projectPlanningId)
      .pipe(
        catchError(error => {
          return of([]);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.positionDetailsDetails = response;
        },
        error: () => { },
        complete: () => {
          this.filteredProjects();
          this.calculateTotalBudget();
        }
      });

    this.signalRService.startConnection();
    this.signalRService.itemListener(SignalRConstants.PositionDetails, (message: any, item: any) => {
      switch (message) {
        case SignalRConstants.PositionDetailsCreated:
          if(item?.projectPlanningId == this.projectPlanningId){
            this.positionDetailsDetails.push(item);
          }
          break;
        case SignalRConstants.PositionDetailsDeleted:
          this.positionDetailsDetails = this.positionDetailsDetails.filter((i: { positionDetailsId: number; }) => i.positionDetailsId !== item);
          this.totalProjects = this.positionDetailsDetails?.length;
          this.totalPages = Math.ceil(this.totalProjects / this.pagination.pageSize);
          break;
        default:
          break;
      }
      this.filteredProjects();
      this.calculateTotalBudget();
    });
  }
}