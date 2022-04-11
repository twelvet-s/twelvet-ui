/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};
  return {
    canAdmin: currentUser && currentUser.access === 'admin',
    hasAuthority:(permission: string): boolean=>{
      return currentUser && currentUser.permissions && currentUser.permissions.indexOf(permission) > -1
    },
    hasRole:(role: string): boolean=>{
      return currentUser && currentUser.roles && currentUser.roles.indexOf(role) > -1
    }
  };
}
