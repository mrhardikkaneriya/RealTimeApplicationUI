import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './interceptor/auth.interceptor';
// import { HttpRequestInterceptor } from './interceptor/http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(),
    provideAnimations(),
    BrowserModule,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ]
};
