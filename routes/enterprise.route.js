const express = require('express');
const mongoose = require('mongoose');


const app = express();
const enterpriseRoute = express.Router();

// Order model.
let Order = require('../models/order');
// Store model.
let Store = require('../models/store');
// Garden model.
let Garden = require('../models/garden');

enterpriseRoute.get('/orders/getAll', async(req, res, next) => {
    let orders = await Order.find({ enterprise: req.id });
    let returnOrders = [];

    for (let i = 0; i < orders.length; i++) {
        if (orders[i].status != "DELETE") {
            let product = await Store.findOne({ _id: orders[i].product });

            if(product) {

                returnOrders.push({
                    _id: orders[i]._id,
                    name: product.name,
                    product: product,
                    quantity: orders[i].quantity,
                    enterprise: orders[i].enterprise,
                    garden: orders[i].garden,
                    date: orders[i].date.toDateString(),
                    time: orders[i].date.getTime(),
                    status: orders[i].status
                });

            }
        }
    }

    res.json(returnOrders);
});

enterpriseRoute.post('/orders/cancle/:id', async(req, res, next) => {
    await Store.updateOne({ _id: req.body.order.product._id }, { $inc: { quantity: req.body.order.quantity } });
    await Order.updateOne({ _id: req.params.id }, { status: "DELETE" });

    res.send();
});

enterpriseRoute.post('/orders/accept/:id', async(req, res, next) => {
    let orders = await Order.find({ enterprise: req.body.order.enterprise, status: "ACCEPTED" });

    if ((orders && orders.length < 5) || orders == null) {
        await Order.updateOne({ _id: req.params.id }, { status: "ACCEPTED" });
    } else {
        await Order.updateOne({ _id: req.params.id }, { status: "WAITING" });
    }

    await Garden.updateOne({ _id: req.body.order.garden }, { $push: { warehouse: {
        _id: mongoose.Types.ObjectId(),
        type: req.body.order.product.type,
        name: req.body.order.product.name,
        manufacturer: req.body.order.product.manufacturer,
        quantity: req.body.order.quantity,
        days: req.body.order.product.days,
        status: req.params.id
    } } });

    res.send();
});

enterpriseRoute.post('/orders/deliver/:id', async(req, res, next) => {
    await Garden.updateOne({ _id: req.body.order.garden, 'warehouse.status': req.params.id}, { $set: { 'warehouse.$.status': null } });

    await Order.updateOne({ _id: req.params.id }, { status: "DELETE" });

    let order = await Order.findOne({ enterprise: req.body.order.enterprise, status: "WAITING" });

    if (order) {
        await Order.updateOne({ _id: order._id }, { status: "ACCEPTED" });
    }

    res.send();
});

enterpriseRoute.get('/store/getAll', async(req, res, next) => {
    let store = await Store.find({ enterprise: req.id });

    res.json(store);
});

enterpriseRoute.get('/orders/statistics', async(req, res, next) => {
    let stat = new Array(30).fill(0);

    for (let i = 0; i < 30; i++) {
        let orders = await Order.find({ status: "DELETE", date: { $gte: new Date(new Date().setDate(new Date().getDate() - i - 1)), '$lte': new Date(new Date().setDate(new Date().getDate() - i))} });

        stat[i] += orders.length;
    }

    res.json(stat);
});

enterpriseRoute.delete('/store/delete/:id', async(req, res, next) => {
    await Store.deleteOne({ _id: req.params.id });

    res.send();
});

enterpriseRoute.post('/store/add', async(req, res, next) => {
    req.body.enterprise = req.id;

    req.body.reviews = 0;

    Store.create(req.body, (error, data) => {
        if (error) {
            return next(error);
        }

        res.send();
    });
});


module.exports = enterpriseRoute;