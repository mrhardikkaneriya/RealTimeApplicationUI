import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { CreateProjectPlanningDetail } from '../models/requestModel/create-project-planning-detail';

@Injectable({
  providedIn: 'root'
})
export class ProjectPlanningService {

  private readonly baseProjectPlanningAPIUrl = environment.apiUrl + 'ProjectPlanning/';

  constructor(private readonly http: HttpClient) { }

  GetDetails(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseProjectPlanningAPIUrl}GetProjectPlanning`);
  }

  GetProjectPlanningById(projectPlanningId:number): Observable<any> {
    return this.http.get<any>(`${this.baseProjectPlanningAPIUrl}GetProjectPlanning/${projectPlanningId}`);
  }

  CreateProjectPlanning(projectPlanningDetail:CreateProjectPlanningDetail): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseProjectPlanningAPIUrl}CreateProjectPlanning`, projectPlanningDetail);
  }
}
