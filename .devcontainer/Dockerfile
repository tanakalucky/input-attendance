FROM node:20-slim

ARG TERRAFORM_VERSION=1.9.2

RUN apt-get update && \
    apt-get install -y git vim curl unzip python3 \
    ca-certificates gnupg lsb-release && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && apt-get install -y docker-ce-cli && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    npm update -g npm && \
    npm i -g pnpm@9.7.1 turbo vercel && \
    pnpm config set store-dir /home/node/.local/share/pnpm/store

RUN curl -O https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_arm64.zip && \
    unzip terraform_${TERRAFORM_VERSION}_linux_arm64.zip -d /usr/bin && \
    rm terraform_${TERRAFORM_VERSION}_linux_arm64.zip
