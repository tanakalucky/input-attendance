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
          module.lambda1.lambda_function_arn,
          module.lambda2.lambda_function_arn,
          module.get_data.lambda_function_arn,
        ]
      }
    ]
  })
}

resource "aws_appsync_datasource" "lambda1_datasource" {
  api_id           = aws_appsync_graphql_api.this.id
  name             = "lambda1_datasource"
  service_role_arn = aws_iam_role.appsync_role.arn
  type             = "AWS_LAMBDA"

  lambda_config {
    function_arn = module.lambda1.lambda_function_arn
  }
}

resource "aws_appsync_datasource" "lambda2_datasource" {
  api_id           = aws_appsync_graphql_api.this.id
  name             = "lambda2_datasource"
  service_role_arn = aws_iam_role.appsync_role.arn
  type             = "AWS_LAMBDA"

  lambda_config {
    function_arn = module.lambda2.lambda_function_arn
  }
}

resource "aws_appsync_datasource" "get_data" {
  api_id           = aws_appsync_graphql_api.this.id
  name             = "get_data"
  service_role_arn = aws_iam_role.appsync_role.arn
  type             = "AWS_LAMBDA"

  lambda_config {
    function_arn = module.get_data.lambda_function_arn
  }
}

resource "aws_appsync_resolver" "query_example" {
  api_id      = aws_appsync_graphql_api.this.id
  type        = "Query"
  field       = "test1"
  data_source = aws_appsync_datasource.lambda1_datasource.name
  kind        = "UNIT"
}

resource "aws_appsync_resolver" "mutation_example" {
  api_id      = aws_appsync_graphql_api.this.id
  type        = "Query"
  field       = "test2"
  data_source = aws_appsync_datasource.lambda2_datasource.name
  kind        = "UNIT"
}

resource "aws_appsync_resolver" "get_data" {
  api_id      = aws_appsync_graphql_api.this.id
  type        = "Query"
  field       = "getData"
  data_source = aws_appsync_datasource.get_data.name
  kind        = "UNIT"
}

module "lambda1" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "${var.app_name}-lambda-function-1-${var.env}"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  source_path   = "../dist/test"

  attach_policies = true
  policies = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "arn:aws:iam::aws:policy/AWSAppSyncInvokeFullAccess"
  ]
  number_of_policies = 2

}
module "lambda2" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "${var.app_name}-lambda-function-2-${var.env}"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  source_path   = "../dist/test2"

  attach_policies = true
  policies = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "arn:aws:iam::aws:policy/AWSAppSyncInvokeFullAccess"
  ]
  number_of_policies = 2
}

module "get_data" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "${var.app_name}-get-data-lambda-${var.env}"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  source_path   = "../dist/get_data"

  attach_policies = true
  policies = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "arn:aws:iam::aws:policy/AWSAppSyncInvokeFullAccess",
    "arn:aws:iam::aws:policy/AmazonDynamoDBReadOnlyAccess"
  ]
  number_of_policies = 3
  environment_variables = {
    TABLE_NAME = aws_dynamodb_table.this.name
  }
}

resource "aws_dynamodb_table" "this" {
  name           = "${var.app_name}_${var.env}"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "Id"

  attribute {
    name = "Id"
    type = "S"
  }
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
