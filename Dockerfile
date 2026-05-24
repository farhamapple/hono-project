# Gunakan image resmi Bun
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY package.json bun.lockb* ./
RUN bun install

# Copy source code
FROM base AS release
COPY --from=install /app/node_modules ./node_modules
COPY src ./src
COPY package.json tsconfig.json ./

# Expose port
EXPOSE 3000

# Jalankan aplikasi
CMD ["bun", "run", "start"]
