output "graphql_url" {
  value = aws_appsync_graphql_api.this.uris["GRAPHQL"]
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.this.id
}

output "cognito_client_secret" {
  sensitive = true
  value     = aws_cognito_user_pool_client.this.client_secret
}

output "cognito_issuer" {
  value = "https://cognito-idp.${var.region}.amazonaws.com/${var.user_pool_id}"
}
