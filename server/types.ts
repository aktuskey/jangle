export type User = {
  name: Name,
  email: string,
  role: Role
}

export type Name = {
  first: string,
  last: string
}

export type Role =
  string

export type UserInfo = {
  name: Name,
  email: string,
  password: string,
  role: Role
}
