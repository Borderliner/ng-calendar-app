import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const localStorageInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  if (typeof window !== 'undefined' && localStorage) {
    const events = localStorage.getItem('calendar_events');
    if (events) {
      req = req.clone({
        setHeaders: {
          'X-Calendar-Events': encodeURIComponent(events),
        },
      });
    }
  }
  return next(req);
};
