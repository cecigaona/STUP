FROM node:20-alpine
WORKDIR /app

COPY . .

RUN npm i

ENV NODE_ENV=development

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "npm run dev -- --host 0.0.0.0 --port 5173"]
