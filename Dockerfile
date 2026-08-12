FROM node:20-bookworm-slim

# bcrypt falls back to a source build when no prebuilt binary matches
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# sequelize-cli is a devDependency but is needed to run migrations
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# 8000 = REST API + static client, 9000 = auth service
EXPOSE 8000 9000

CMD ["npm", "start"]
