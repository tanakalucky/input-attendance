variable "app_name" {
  type = string
}

variable "env" {
  type = string
}

variable "region" {
  type = string
}

variable "access_key" {
  type = string
}

variable "secret_key" {
  type = string
}

variable "user_pool_id" {
  type = string
}

variable "callback_url" {
  type    = string
  default = "http://localhost:3000/api/auth/callback/cognito"
}
