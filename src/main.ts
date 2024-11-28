import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    BrowserModule,
    provideHttpClient(withInterceptorsFromDi()),
    ...appConfig.providers
  ]
})
.catch((err) => console.error(err));
