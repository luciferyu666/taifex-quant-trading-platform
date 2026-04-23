FROM node:lts-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

FROM node:lts-alpine AS runner
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
