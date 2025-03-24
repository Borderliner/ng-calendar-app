import { mergeApplicationConfig, ApplicationConfig, REQUEST, inject } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRouting } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { CalendarEvent } from '../event-dialog/event-dialog.component';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRouting(serverRoutes),
    provideHttpClient(withFetch()),
    {
      provide: 'SERVER_EVENTS',
      useFactory: () => {
        const req = inject(REQUEST);
        if (!req) return
        const eventsHeader = req.headers.get('X-Calendar-Events');
        if (eventsHeader) {
          return JSON.parse(decodeURIComponent(eventsHeader as string)).map(
            (e: any) => ({
              ...e,
              date: new Date(e.date),
            })
          ) as CalendarEvent[];
        }
        return null;
      },
    },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
