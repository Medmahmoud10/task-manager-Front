// route-role.directive.ts
import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { PermissionService } from './permission.service';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit {
  @Input() appHasRole: string | string[] = '';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.updateView();
  }

  private updateView() {
    const hasRole = this.checkRole();
    
    if (hasRole) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  private checkRole(): boolean {
    if (!this.appHasRole) return true;
    
    if (typeof this.appHasRole === 'string') {
      return this.permissionService.hasRole(this.appHasRole);
    }
    
    if (Array.isArray(this.appHasRole)) {
      return this.appHasRole.some(role => 
        this.permissionService.hasRole(role)
      );
    }
    
    return false;
  }
}