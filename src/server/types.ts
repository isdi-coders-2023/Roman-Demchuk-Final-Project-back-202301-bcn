export interface UserCredentials {
  password: string;
  email: string;
}

export interface UserStructure extends UserCredentials {
  username: string;
}
