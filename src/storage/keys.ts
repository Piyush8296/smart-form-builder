export const TEMPLATES_KEY = 'fb:templates';
export const templateKey = (id: string) => `fb:template:${id}`;
export const instancesKey = (tid: string) => `fb:instances:${tid}`;
export const instanceKey = (id: string) => `fb:instance:${id}`;
export const draftKey = (tid: string) => `fb:draft:${tid}`;
export const SESSION_KEY = 'fb:session';
export const USERS_KEY = 'fb:users';
export const userTemplatesKey = (userId: string) => `fb:user-templates:${userId}`;
