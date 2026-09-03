export type AuthUser = {
  id: string;
  email: string;
  role: 'user' | 'admin';
};

export type JwtPayload = {
  sub: string;
  email: string;
  role: 'user' | 'admin';
};
