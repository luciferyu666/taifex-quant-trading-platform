FROM mcr.microsoft.com/devcontainers/python:1-3.12-bookworm

ARG NODE_VERSION="lts"

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      ca-certificates \
      curl \
      git \
      make \
      postgresql-client \
      redis-tools \
    && apt-get clean

RUN su vscode -c "source /usr/local/share/nvm/nvm.sh && nvm install ${NODE_VERSION} && nvm alias default ${NODE_VERSION}"
