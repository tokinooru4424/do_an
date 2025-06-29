interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roleId: number;
  createdAt: Date;
}

interface Role {
  id: number;
  name: string;
  description: string;
  parentId: number;
  key: string;
  createdAt: Date;
}

interface FilterParam {
  column: any,
  confirm: Function,
  ref: any
}