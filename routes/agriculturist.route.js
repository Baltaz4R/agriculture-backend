const express = require('express');
const sendMail = require('../mail');


const app = express();
const agriculturistRoute = express.Router();

// Garden model.
let Garden = require('../models/garden');
// Store model.
let Store = require('../models/store');
// Order model.
let Order = require('../models/order');
// Agriculturist model.
let Agriculturist = require('../models/agriculturist');
// Comment model.
let Comment = require('../models/comment');

agriculturistRoute.get('/getAll', async(req, res, next) => {
    let gardens = await Garden.find({ agriculturist: req.id });

    res.json(gardens);
});

agriculturistRoute.get('/get/:id', async(req, res, next) => {
    let garden = await Garden.findOne({ _id: req.params.id });

    res.json(garden);
});

agriculturistRoute.get('/store/comment/get/:id', async(req, res, next) => {
    let comments = await Comment.find({ product: req.params.id });
    let returnComments = [];

    for (let i = 0; i < comments.length; i++) {
        let agriculturist = await Agriculturist.findOne({ _id: comments[i].agriculturist });

        returnComments.push({
            _id: comments[i]._id,
            agriculturist: agriculturist,
            product: comments[i].product,
            reviews: comments[i].reviews,
            text: comments[i].text
        });
    }
        
    res.json(returnComments);
});

agriculturistRoute.get('/store/comment/is/:id', async(req, res, next) => {
    let comment = await Comment.findOne({ product: req.params.id, agriculturist: req.id });

    if (comment) {
        return res.send(true);
    }

    res.send(false);
});

agriculturistRoute.get('/garden/tank/inc/:id', async(req, res, next) => {
    let garden = await Garden.findOneAndUpdate({ _id: req.params.id }, { $inc: { tank: 1 } });

    garden.tank++;

    res.json(garden);
});

agriculturistRoute.get('/garden/tank/dec/:id', async(req, res, next) => {
    let garden = await Garden.findOneAndUpdate({ _id: req.params.id }, { $inc: { tank: -1 } });

    garden.tank--;

    if (garden.tank == 74) {
        let agriculturist = await Agriculturist.findOne({ _id: garden.agriculturist });

        sendMail(agriculturist.email);
    }

    res.json(garden);
});

agriculturistRoute.get('/garden/temperature/inc/:id', async(req, res, next) => {
    let garden = await Garden.findOneAndUpdate({ _id: req.params.id }, { $inc: { temperature: 1 } });

    garden.temperature++;

    res.json(garden);
});

agriculturistRoute.get('/garden/temperature/dec/:id', async(req, res, next) => {
    let garden = await Garden.findOneAndUpdate({ _id: req.params.id }, { $inc: { temperature: -1 } });

    garden.temperature--;

    if (garden.temperature < 12 && garden.temperature >= 11) {
        let agriculturist = await Agriculturist.findOne({ _id: garden.agriculturist });

        sendMail(agriculturist.email);
    }

    res.json(garden);
});

agriculturistRoute.get('/warehouse/get/:id', async(req, res, next) => {
    let garden = await Garden.findOne({ _id: req.params.id });

    res.json(garden.warehouse);
});

agriculturistRoute.post('/warehouse/cancle/:id', async(req, res, next) => {
    await Garden.updateOne({ _id: req.body.id }, { "$pull": { "warehouse": { "status": req.params.id } } });

    let order = await Order.findOne({ _id: req.params.id });

    await Store.updateOne({ _id: order.product }, { $inc: { quantity: order.quantity } });

    await Order.updateOne({ _id: req.params.id }, { status: "DELETE" });

    order = await Order.findOne({ enterprise: order.enterprise, status: "WAITING" });

    if (order) {
        await Order.updateOne({ _id: order._id }, { status: "ACCEPTED" });
    }

    res.send();
});

agriculturistRoute.post('/add', async(req, res, next) => {
    req.body.agriculturist = req.id;

    req.body.numberOfFreeSpace = req.body.width * req.body.height;

    var positions = [];
    for (let i = 0; i < req.body.height; i++) {
        positions[i] = new Array(req.body.width).fill(null);
    }

    req.body.positions = positions;

    Garden.create(req.body, (error, data) => {
        if (error) {
            return next(error);
        }

        res.send();
    });
});

agriculturistRoute.put('/garden/put/:id', async(req, res, next) => {
    let garden = await Garden.findOne({ _id: req.params.id });

    if (garden.positions[req.body.i][req.body.j] == null) {

        garden.positions[req.body.i][req.body.j] = { name: req.body.tree.name, manufacturer:  req.body.tree.manufacturer, progress: 0, days: req.body.tree.days };
        await Garden.updateOne({ _id: req.params.id }, { $set: { positions: garden.positions }, $inc: { numberOfTrees: 1, numberOfFreeSpace: -1 }  });
        await Garden.updateOne({ _id: req.params.id, 'warehouse._id': req.body.tree._id}, { $inc: { 'warehouse.$.quantity': -1 } });

    } else {
        return res.status(400).send("Hole is not empty!");
    }

    res.send();
});

agriculturistRoute.put('/store/comment/:id', async(req, res, next) => {
    Comment.create({ agriculturist: req.id, product: req.params.id, reviews: 2.5, text: req.body.text.text }, (error, data) => {
        if (error) {
            return next(error);
        }

        res.send();
    });

    res.send();
});

agriculturistRoute.put('/garden/preparation/:id', async(req, res, next) => {
    let garden = await Garden.findOne({ _id: req.params.id });
    let tree = garden.positions[req.body.i][req.body.j];

    if (garden.positions[req.body.i][req.body.j]) {
        let progress = tree.progress + req.body.preparation.days;

        garden.positions[req.body.i][req.body.j] = { name: tree.name, manufacturer:  tree.manufacturer, progress: progress, days: tree.days };
        await Garden.updateOne({ _id: req.params.id }, { $set: { positions: garden.positions } });
        await Garden.updateOne({ _id: req.params.id, 'warehouse._id': req.body.preparation._id}, { $inc: { 'warehouse.$.quantity': -1 } });

    } else {
        return res.status(400).send("Hole is not empty!");
    }

    res.send();
});

agriculturistRoute.post('/garden/remove/:id', async(req, res, next) => {
    let garden = await Garden.findOne({ _id: req.params.id });

    garden.positions[req.body.i][req.body.j] = false;

    await Garden.updateOne({ _id: req.params.id }, { $set: { positions: garden.positions } });

    res.send();
});

agriculturistRoute.get('/store/getAll', async(req, res, next) => {
    let store = await Store.find({});

    res.json(store);
});

agriculturistRoute.get('/store/product/get/:id', async(req, res, next) => {
    let product = await Store.findOne({ _id: req.params.id });

    res.json(product);
});

agriculturistRoute.post('/store/addOrders', async(req, res, next) => {
    let store = req.body.store;
    let orders = req.body.orders;
    let garden = req.body.garden;

    orders.forEach(async(order, index) => {
        if (order && order > 0) {
            await Store.updateOne({ _id: store[index]._id }, { $inc: { quantity: -order } });
            await Order.create({ 
                enterprise: store[index].enterprise,
                garden: garden,
                product: store[index]._id,
                quantity: order
            });
        }
    });

    res.send();
});

agriculturistRoute.get('/store/comment/bought/:id', async(req, res, next) => {
    let gardens = await Garden.find({ agriculturist: req.id });

    for (let i = 0; i < gardens.length; i++) {
        let ordered = await Order.findOne({ product: req.params.id, garden: gardens[i]._id });

        if (ordered) {
            return res.send(true);
        }

    }

    res.send(false);
});


module.exports = agriculturistRoute;