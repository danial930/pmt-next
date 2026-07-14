// src/modules/user/user.dto.ts
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleIds?: number[];
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roleIds?: number[];
}

export interface UserListItemDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  roles: string[];
  createdAt: Date;
}
