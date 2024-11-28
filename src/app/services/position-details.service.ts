import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreatePositionDetailsDetail } from '../models/requestModel/create-position-details-detail';

@Injectable({
  providedIn: 'root'
})
export class PositionDetailsService {

  private readonly basePositionDetailsAPIUrl = environment.apiUrl + 'PositionDetails/';
  constructor(private readonly http: HttpClient) { }

  GetPositionDetails(projectPlanningId:number): Observable<any[]> {
    return this.http.get<any[]>(`${this.basePositionDetailsAPIUrl}GetPositionDetails/${projectPlanningId}`);
  }

  DeletePositionDetails(positionDetailsId:number): Observable<any[]> {
    return this.http.delete<any[]>(`${this.basePositionDetailsAPIUrl}DeletePositionDetails/${positionDetailsId}`);
  }

  CreatePositionDetails(projectPlanningDetail:CreatePositionDetailsDetail): Observable<any[]> {
    return this.http.post<any[]>(`${this.basePositionDetailsAPIUrl}CreatePositionDetails`, projectPlanningDetail);
  }
}
