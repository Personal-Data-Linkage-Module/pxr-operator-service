# Copyright 2022 NEC Corporation
# Released under the MIT license.
# https://opensource.org/licenses/mit-license.php
#
FROM node:18-bullseye

WORKDIR /usr/src/app

# Install node modules
COPY package*.json ./
RUN apt-get update && apt-get upgrade -y
RUN npm install

# Build production
COPY . ./
RUN npm run build

# Node.js application port binding.
EXPOSE 3000

# Start a container with this line.
CMD [ "npm", "start" ]
