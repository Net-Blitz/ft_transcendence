FROM node:alpine

WORKDIR "/app"

ENTRYPOINT [ "/bin/sh", "-c", "npm install && npx prisma migrate deploy && npm run start:dev" ]
