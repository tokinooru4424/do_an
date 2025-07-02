interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roleId: number;
  phoneNumber: string;
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

interface Cinema {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FilterParam {
  column: any,
  confirm: Function,
  ref: any
}