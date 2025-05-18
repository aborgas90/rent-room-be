# Use the official Node.js v22 Alpine image as the base image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Tambahkan baris ini supaya schema prisma ikut ke image
COPY prisma ./prisma

# Copy the rest of the application code to the working directory
COPY . .

# Generate Prisma Client (harus setelah copy semua file)
RUN npx prisma generate

# Expose the application port
EXPOSE 8080

# Jalankan entrypoint script yang akan migrasi dulu, baru start app
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]