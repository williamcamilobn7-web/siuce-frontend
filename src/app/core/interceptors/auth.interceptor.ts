import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/toast/toast';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  // La sesión viaja en una cookie HttpOnly que pone el servidor. withCredentials le pide al navegador
  // que la envíe; además se quita cualquier header Authorization viejo para que mande solo la cookie.
  const peticion = req.clone({ withCredentials: true, headers: req.headers.delete('Authorization') });

  return next(peticion).pipe(
    catchError((err: HttpErrorResponse) => {
      const esLogin = req.url.includes('/api/auth/login');

      // 401 Unauthorized fuera del login: sesión vencida o sin autenticación
      if (err.status === 401 && !esLogin) {
        localStorage.clear();
        router.navigate(['/login']);
        toast.show('Sesión vencida. Por favor ingresa nuevamente.', 'err');
        return throwError(() => err);
      }

      // En el login, el propio formulario se encarga de mostrar su mensaje específico
      if (esLogin) {
        return throwError(() => err);
      }

      // Para todos los demás errores (400, 403, 404, 409, 413, 429, 500, etc.)
      const errObj = err.error;
      let msg = 'Ocurrió un error en la operación';

      if (typeof errObj === 'string') {
        msg = errObj;
      } else if (errObj?.mensaje) {
        msg = errObj.mensaje;
      } else if (errObj?.error && typeof errObj.error === 'string') {
        msg = errObj.error;
      } else if (err.status === 403) {
        msg = 'Acceso denegado: no tienes permisos para esta acción.';
      } else if (err.status === 404) {
        msg = 'El registro o recurso solicitado no fue encontrado.';
      } else if (err.status === 409) {
        msg = 'Conflicto: ya existe un registro con esos datos.';
      } else if (err.status === 413) {
        msg = 'El archivo es demasiado grande (máximo 50MB).';
      } else if (err.status === 429) {
        msg = 'Demasiados intentos. Espera unos minutos.';
      } else if (err.status === 0) {
        msg = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      }

      toast.show(msg, 'err');
      return throwError(() => err);
    })
  );
};
