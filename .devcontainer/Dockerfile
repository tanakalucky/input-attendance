FROM node:20-slim

ARG TERRAFORM_VERSION=1.9.2

RUN apt-get update && \
    apt-get install -y git vim curl unzip python3 && \
    npm update -g npm && \
    npm i -g pnpm@9.7.1 turbo vercel && \
    pnpm config set store-dir /home/node/.local/share/pnpm/store

RUN curl -O https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
    unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip -d /usr/bin && \
    rm terraform_${TERRAFORM_VERSION}_linux_amd64.zip
