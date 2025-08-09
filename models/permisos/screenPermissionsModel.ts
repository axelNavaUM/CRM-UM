export interface ScreenPermission {
  screenName: string;
  allowedRoles: string[];
  allowedAreas?: string[];
}

export interface UserScreenAccess {
  hasAccess: boolean;
  reason?: string;
}

export interface ScreenPermissionsConfig {
  [screenName: string]: ScreenPermission;
} 