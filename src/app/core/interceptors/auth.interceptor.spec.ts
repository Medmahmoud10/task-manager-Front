import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../../auth/auth.service';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  const mockToken = 'test-token';

  beforeEach(() => {
    // Create a spy object for AuthService
    mockAuthService = jasmine.createSpyObj('AuthService', ['getToken']);
    mockAuthService.getToken.and.returnValue(mockToken);

    TestBed.configureTestingModule({
      providers: [
        AuthInterceptor,
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    interceptor = TestBed.inject(AuthInterceptor);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should add authorization header when token exists', () => {
    const mockRequest = new HttpRequest('GET', '/test');
    const mockHandler: HttpHandler = {
      handle: (req: HttpRequest<unknown>) => {
        // Verify the request was modified
        expect(req.headers.has('Authorization')).toBeTrue();
        expect(req.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
        return of({} as HttpEvent<any>);
      }
    };

    interceptor.intercept(mockRequest, mockHandler).subscribe();
    expect(mockAuthService.getToken).toHaveBeenCalled();
  });

  it('should not add authorization header when no token exists', () => {
    mockAuthService.getToken.and.returnValue(null);
    const mockRequest = new HttpRequest('GET', '/test');
    const mockHandler: HttpHandler = {
      handle: (req: HttpRequest<unknown>) => {
        expect(req.headers.has('Authorization')).toBeFalse();
        return of({} as HttpEvent<any>);
      }
    };

    interceptor.intercept(mockRequest, mockHandler).subscribe();
    expect(mockAuthService.getToken).toHaveBeenCalled();
  });
});