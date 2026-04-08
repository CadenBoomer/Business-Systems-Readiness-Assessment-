import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export const authGuard = () => {
  const router = inject(Router);
  const token = localStorage.getItem('admin_token');

  if (!token) {
    router.navigate(['/admin/login']);
    return false;
  }

  try {
    const decoded: any = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();
    
    if (isExpired) {
      localStorage.removeItem('admin_token');
      router.navigate(['/admin/login']);
      return false;
    }

    return true;
  } catch {
    localStorage.removeItem('admin_token');
    router.navigate(['/admin/login']);
    return false;
  }
};