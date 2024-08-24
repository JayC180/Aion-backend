const express = require("express");
const mongoose = require("mongoose");
const config = require("./config.js");
const cors = require("cors");
const app = express();

const PORT = config.PORT || 5000;
const MONGODB_URL = config.MONGODB_URL;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Calendar!");
});

mongoose
    .connect(MONGODB_URL)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => console.error(err));

const eventsRouter = require("./routes/events");
const usersRouter = require("./routes/users");

app.use("/api/events", eventsRouter);
app.use("/api/auth", usersRouter);

app.get("/test", (req, res) => {
    res.send("Test route is working!");
});
