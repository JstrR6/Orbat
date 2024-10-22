export const checkPermission = (user, permission) => {
    if (!user || !user.roles) return false;
    
    const rolePermissions = {
      'High Command': ['manage_units', 'review_forms', 'manage_users', 'issue_orders'],
      'Officer': ['submit_forms', 'view_units', 'view_orders'],
      'Member': ['submit_forms', 'view_units']
    };
  
    return user.roles.some(role => 
      rolePermissions[role]?.includes(permission)
    );
  };