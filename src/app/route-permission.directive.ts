// route-permission.directive.ts
import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { PermissionService } from './permission.service';

@Directive({
  selector: '[appHasPermission]'
})
export class HasPermissionDirective implements OnInit {
  @Input() appHasPermission: string | string[] = '';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.updateView();
  }

  private updateView() {
    const hasPermission = this.checkPermission();
    
    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  private checkPermission(): boolean {
    if (!this.appHasPermission) return true;
    
    if (typeof this.appHasPermission === 'string') {
      return this.permissionService.hasPermission(this.appHasPermission);
    }
    
    if (Array.isArray(this.appHasPermission)) {
      return this.appHasPermission.some(permission => 
        this.permissionService.hasPermission(permission)
      );
    }
    
    return false;
  }
}