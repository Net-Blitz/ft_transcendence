FROM node:alpine

WORKDIR "/app"

ENTRYPOINT [ "/bin/sh", "-c", "sleep 10 && npm install && npx prisma migrate deploy && npm run start:dev" ]
