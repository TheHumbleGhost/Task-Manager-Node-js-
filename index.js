require('./src/db/mongoose');
const express = require('express');
const UserRoutes = require('./routers/user');
const TaskRoutes = require('./routers/task');

const app = new express();
const port = process.env.PORT;

app.use(express.json());
app.use(TaskRoutes);
app.use(UserRoutes);

app.listen(port, () => {
    console.log("Server is up");
});