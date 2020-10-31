const express = require('express');
const bcrypt = require('bcrypt');
const jsonwebtoken = require("jsonwebtoken");
const mongoose = require('mongoose');

const config = require('../config/authentication');
const authentication = require('../authentications');


const app = express();
const userRoute = express.Router();

// Agriculturist model.
let Agriculturist = require('../models/agriculturist');
// Enterprise model.
let Enterprise = require('../models/enterprise');
// Admin model.
let Admin = require('../models/admin');
// Request model.
let Request = mongoose.model('Request', new mongoose.Schema({ type: String }, { strict: false }))

// Add User.
userRoute.post('/register', async(req, res, next) => {

    // Check if this user already exisits.
    let username = await Agriculturist.findOne({ username: req.body.username });

    if (username) {
        return res.status(400).send("The username already exists. Please use a different username.");
    }

    username = await Enterprise.findOne({ username: req.body.username });

    if (username) {
        return res.status(400).send("The username already exists. Please use a different username.");
    }

    let email = await Agriculturist.findOne({ email: req.body.email });

    if (email) {
        return res.status(400).send("An account with this email already exists.");
    }

    email = await Enterprise.findOne({ email: req.body.email });

    if (email) {
        return res.status(400).send("An account with this email already exists.");
    }

    // Hash password.
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    Request.create(req.body, (error, data) => {
        if (error) {
            return next(error)
        }

        res.send(); // TODO: 
    });
});

// Login User.
userRoute.post('/login', async(req, res, next) => {

    let user = await Agriculturist.findOne({ username: req.body.username });
    let type = "agriculturist";

    if (!user) {
        user = await Enterprise.findOne({ username: req.body.username });
        type = "enterprise";

        if (!user) {
            user = await Admin.findOne({ username: req.body.username });
            type = "admin";

            if (!user) {
                return res.status(400).send("The username not exists.");
            }
        }
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
        return res.status(400).send("Incorrect password!");
    }

    const payload = { user: { id: user.id } };

    jsonwebtoken.sign(payload, config.secret, { expiresIn: 86400 }, (error, token) => {
        if (error) {
            return next(error);
        }

        res.json({type, token});
    });
});

// Change password.
userRoute.post('/change', [authentication], async(req, res, next) => {
    let user = await Agriculturist.findOne({ _id: req.id });

    if (!user) {
        user = await Enterprise.findOne({ _id: req.id });

        if (!user) {
            user = await Admin.findOne({ _id: req.id });
        }
    }

    const isMatch = await bcrypt.compare(req.body.old, user.password);

    if (!isMatch) {
        return res.status(400).send("Incorrect old password!");
    }

    if (req.body.old == req.body.password) {
        return res.status(400).send("New password is same!");
    }

    // Hash password.
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    await Agriculturist.updateOne({ _id: req.id }, { password: req.body.password });
    await Enterprise.updateOne({ _id: req.id }, { password: req.body.password });

    res.send(); // TODO: 
});

userRoute.get('/getRequests', [authentication], async(req, res, next) => {
    let requests = await Request.find({});

    res.json(requests);
});

userRoute.get('/getAgriculturists', [authentication], async(req, res, next) => {
    let requests = await Agriculturist.find({});

    res.json(requests);
});

userRoute.get('/getEnterprises', [authentication], async(req, res, next) => {
    let requests = await Enterprise.find({});

    res.json(requests);
});

userRoute.get('/accept/:id', [authentication], async(req, res, next) => {
    let request = await Request.findOneAndDelete({ _id: req.params.id });

    if (request.type == "agriculturist") {

        Agriculturist.create(request.toJSON(), (error, data) => {
            if (error) {
                return next(error)
            }

            res.send(); // TODO: 
        });

    } else if (request.type == "enterprise") {

        Enterprise.create(request.toJSON(), (error, data) => {
            if (error) {
                return next(error)
            }

            res.send(); // TODO: 
        });

    } else {
        return res.status(400).send("Wrong type.");
    }

    res.send();
});

userRoute.delete('/cancle/:id', [authentication], async(req, res, next) => {
    await Request.deleteOne({ _id: req.params.id });

    res.send();
});

userRoute.delete('/deleteAgriculturists/:id', [authentication], async(req, res, next) => {
    await Agriculturist.deleteOne({ _id: req.params.id });

    res.send();
});

userRoute.delete('/deleteEnterprises/:id', [authentication], async(req, res, next) => {
    await Enterprise.deleteOne({ _id: req.params.id });

    res.send();
});

userRoute.post('/changeAgriculturists', [authentication], async(req, res, next) => {
    await Agriculturist.replaceOne({ _id: req.body.agriculturist._id }, req.body.agriculturist);

    res.send();
});

userRoute.post('/changeEnterprises', [authentication], async(req, res, next) => {
    await Enterprise.replaceOne({ _id: req.body.enterprise._id }, req.body.enterprise);

    res.send();
});


module.exports = userRoute;