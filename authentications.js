const jsonwebtoken = require("jsonwebtoken");

const config = require('./config/authentication');


// Use JWT auth to secure the api.
authentication = (req, res, next) => {
    const token = req.headers["token"];

    if (!token) {
        return res.status(403).send("No token provided!");
    }

    jsonwebtoken.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized access!" });
        }

        req.id = decoded.user.id;
        next();
    });
};


module.exports = authentication;