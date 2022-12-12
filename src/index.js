require("dotenv").config();
const http = require("http");
const app = require("./app");
const auth = require("./auth");
const fetch = require("node-fetch");

app.set("port", 3001);
const server = http.createServer(app);

const dbConnect = require("./db/dbConnect");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./db/userModel");

dbConnect();

app.use((req, res, next) => {
  const allowedOrigins = [process.env.FRONT_URL, process.env.FRONT_URL_DEV];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  return next();
});

app.get("/", (request, response) => {
  response.status(200);
  response.end("ok");
});

app.get("/test", (request, response) => {
  response.send("get request is working");
  response.end();
});

app.post("/test", (request, response) => {
  response.send("post request is working");
  response.end();
});

app.post("/register", (request, response) => {
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      const user = new User({
        email: request.body.email,
        password: hashedPassword,
      });

      user
        .save()
        .then((result) => {
          response.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        .catch((error) => {
          response.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

app.post("/login", (request, response) => {
  User.findOne({ email: request.body.email })

    .then((user) => {
      bcrypt
        .compare(request.body.password, user.password)

        .then((passwordCheck) => {
          if (!passwordCheck) {
            return response.status(400).send({
              message: "Passwords does not match",
              error,
            });
          }

          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            token,
          });
        })
        .catch((error) => {
          response.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

// TODO: [
//   create Review model
//   create add review endpoint
//   create get reviews by video id endpoint
// ]

app.get("/get-reviews", (request, response) => {
  response.json({ message: "You are free to access me anytime" });
});

app.post("/post-review", auth, async (request, response) => {
  const body = {
    secret: process.env.BACKEND_CONNECT_SECRET,
    ...request.body,
  };
  await fetch(process.env.BACKEND_URL + "/api/addReview", {
    method: "POST",
    body: JSON.stringify(body),
  }).then((r) => {
    if (r.ok) {
      response.status(200);
      response.json({ message: "ok" });
    } else {
      response.status(500);
      response.json({ message: "not ok" });
    }
  });
});

server.listen(3001);
