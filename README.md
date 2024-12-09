# Personal Finance Management Tool

This project is a group collaboration to develop a web application for our university course. The app will help users track their income, expenses, and budgets. It can provide insights and visualizations to help users manage their finances better.

🗒️[Requirements Document](https://cordundiana6.atlassian.net/wiki/spaces/WW/overview?atlOrigin=eyJpIjoiZTY0NzFiY2U4ZDA0NDkwNDg1ZWM4MTRhNDRmY2EwMmUiLCJwIjoiaiJ9)

## Technologies
### MERN stack
- MongoDB
- Express
- React
- Node. js


# Build and run the project
In the root folder of the project paste the command below to install required dependencies at project level.
```
npm install
```
## Backend
Make sure you have an `.env` file in the root of your `server` folder.
Add the `MONGO_URL=<your_connection_string>` in the `.env` file.
> [!WARNING]
> Don't forget to add your ip address in [MongoDB Atlas Cloud Database](https://cloud.mongodb.com/v2/6741940615d0a0648f9e2be0#/overview).

Go to the `server` folder and paste:
```
npm install // install required dependencies on the backend
npm run dev or npm start
```
Your application should run by default on [port 5000](http://localhost:5000/).
You should also see the following messages: 
```
Connected to MongoDB
Connected to database: wealth_wise
```

## Frontend
Go to the `client` folder and paste:
```
npm install // install required dependencies on the frontend
npm run dev
```
Your application should run by default on [port 5173](http://localhost:5173/).


## Group Members
- Cordun Diana
- Danescu Adela
- Hurloi Selena
- Sandu Anastasia
- Teleaga Dragos
