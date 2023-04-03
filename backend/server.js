import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Jwt from "jsonwebtoken";
import dotenv from "dotenv";

const app = express();
const PORT = 3000;
dotenv.config();

app.use(cors());
app.use(bodyParser.json());

let users = [];

let accounts = [];

function validateToken(req, res, next) {
    console.log(
        "validating token --------------------------------------------------------------------------------------"
    );

    const token = req.headers["authorization"].split(" ")[1];

    Jwt.verify(token, process.env.SECRET_TOKEN, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        console.log(user);
        req.user = user;
        next();
    });
}

app.get("", (req, res) => {
    res.send("Hello");
});

app.post("/users", (req, res) => {
    console.log(req.body);
    const user = {
        username: req.body.username,
        password: req.body.password,
        id: Date.now(),
    };
    users.push(user);

    const account = {
        money: req.body.money,
        userid: user.id,
        id: accounts.length + 1,
    };
    accounts.push(account);

    console.log(accounts);
    console.log(users);
    res.send("User created");
});

app.post("/sessions", (req, res) => {
    console.log(req.body);

    const user = users.find((user) => {
        return (
            user.username == req.body.username &&
            user.password == req.body.password
        );
    });

    if (user) {
        const token = Jwt.sign(user, process.env.SECRET_TOKEN, {
            expiresIn: "900s",
        });

        res.send(token);
    } else {
        res.send("Username or password incorrect");
    }
});

app.get("/me/accounts", validateToken, (req, res) => {
    const account = accounts.find((account) => {
        return account.userid == req.user.id;
    });

    res.send(account.money);
});

app.listen(PORT, () => {
    console.log("Express server started listening on port " + PORT);
});
