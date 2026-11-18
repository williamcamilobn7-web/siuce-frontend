import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // La sesión viaja en una cookie HttpOnly que pone el servidor. withCredentials le pide al navegador
  // que la envíe; además se quita cualquier header Authorization viejo para que mande solo la cookie.
  const peticion = req.clone({ withCredentials: true, headers: req.headers.delete('Authorization') });

  return next(peticion).pipe(
    catchError(err => {
      // En el login un 401 solo significa "credenciales incorrectas", no sesión vencida
      const esLogin = req.url.includes('/api/auth/login');
      if (err.status === 401 && !esLogin) {
        localStorage.clear();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};