FROM node:20

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

RUN npx prisma generate

EXPOSE 4000

CMD ["node","dist/main.js"]
