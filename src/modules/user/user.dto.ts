// src/modules/user/user.dto.ts
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleIds?: string[];
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roleIds?: string[];
}

export interface UserListItemDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  roles: string[];
  createdAt: Date;
}
