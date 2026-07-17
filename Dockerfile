FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM alpine:3.20
WORKDIR /out
COPY --from=build /app/dist/Admin/browser ./
CMD ["sh", "-c", "cp -a /out/. /dist/ && echo Admin assets copied"]
