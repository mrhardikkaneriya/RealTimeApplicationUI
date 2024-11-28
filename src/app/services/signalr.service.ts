import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment.development';
import { SignalRConstants } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;

  public startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
                              .withUrl(environment.api + SignalRConstants.SignalRDataHub, { withCredentials: true })
                              .configureLogging(signalR.LogLevel.Debug)
                              .withAutomaticReconnect()
                              .build();

    this.hubConnection
      .start()
      .then()
      .catch();

    this.hubConnection.onclose((error) => {
      setTimeout(() => this.startConnection(), 5000);
    });
  }

  public itemListener(method:string, callback: (message: any, data: any) => void) {
    this.hubConnection.on(method, callback);
  }
  
}
