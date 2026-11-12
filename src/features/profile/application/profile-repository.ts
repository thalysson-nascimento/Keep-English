export interface ProfileIdentity {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: Date;
}

export interface ProfileRepository {
  findById(userId: string): Promise<ProfileIdentity | null>;
}
