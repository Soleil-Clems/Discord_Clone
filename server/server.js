require("dotenv").config();
const port = process.env.PORT || 4242;
const mongoose = require("mongoose")
const mongoUrl = process.env.mongoDbUrl
const server = require("./app");

mongoose.connect(mongoUrl)
    .then((connect) => {
        console.log("Database connection success");
        server.listen(port, (err) => {
            if (err) {
                console.error(`Echec de connexion au port ${port}:`);
            } else {
                console.log(`Server is successfully running on port ${port}`);
            }
        });
    })
    .catch((error) => console.log("Database connection failed"))

