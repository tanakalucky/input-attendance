data "local_file" "graphql_schema" {
  filename = "../schema.graphql"
}

resource "aws_appsync_graphql_api" "this" {
  name                = "${var.app_name}_${var.env}"
  authentication_type = "AMAZON_COGNITO_USER_POOLS"
  schema              = data.local_file.graphql_schema.content

  user_pool_config {
    default_action = "ALLOW"
    user_pool_id   = var.user_pool_id
  }
}

resource "aws_iam_role" "appsync_role" {
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "appsync.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "appsync_policy" {
  role = aws_iam_role.appsync_role.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "lambda:InvokeFunction"
        ],
        Resource = [
          module.this.lambda_function_arn,
        ]
      }
    ]
  })
}

resource "aws_appsync_datasource" "this" {
  api_id           = aws_appsync_graphql_api.this.id
  name             = "${var.app_name}_datasource"
  service_role_arn = aws_iam_role.appsync_role.arn
  type             = "AWS_LAMBDA"

  lambda_config {
    function_arn = module.this.lambda_function_arn
  }
}

resource "aws_appsync_resolver" "this" {
  api_id      = aws_appsync_graphql_api.this.id
  type        = "Mutation"
  field       = "inputAttendance"
  data_source = aws_appsync_datasource.this.name
  kind        = "UNIT"
}

module "this" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "${var.app_name}-${var.env}"
  timeout       = 60
  memory_size   = 4096

  create_package = false

  package_type  = "Image"
  architectures = ["x86_64"]

  image_uri = var.image_uri

  attach_policies = true
  policies = [
    "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"
  ]
  number_of_policies = 1

}

resource "aws_cognito_user_pool_client" "this" {
  name = "${var.app_name}_${var.env}"

  user_pool_id = var.user_pool_id

  generate_secret = true

  allowed_oauth_flows = ["code"]
  explicit_auth_flows = ["ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_SRP_AUTH"]
  supported_identity_providers = [
    "COGNITO"
  ]
  allowed_oauth_scopes                 = ["openid", "email", "phone"]
  allowed_oauth_flows_user_pool_client = true
  callback_urls                        = [var.callback_url]

  prevent_user_existence_errors = "ENABLED"
}
