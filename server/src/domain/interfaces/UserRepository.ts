export type UserRecord = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // hashed password
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export interface UserRepository {
  create(input: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
  }): Promise<UserRecord>;

  findByEmail(email: string): Promise<UserRecord | null>;
}

