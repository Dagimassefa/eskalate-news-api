FROM node:20-alpine

WORKDIR /app

# Install deps from backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

# Copy backend source
COPY backend .

# Generate prisma client + build TS
RUN npx prisma generate
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start"]