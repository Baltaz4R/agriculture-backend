var schedule = require('node-schedule');
const sendMail = require('../agriculture-backend/mail');


// Garden model.
let Garden = require('./models/garden');
let Agriculturist = require('./models/agriculturist');

var gardenCycle = schedule.scheduleJob('0 */1 * * *', async() => {
    await Garden.updateMany({ }, { $inc: { tank: -1, temperature: -0.5 } });

    let gardens = await Garden.find({ });
    
    gardens.forEach(async(garden) => {
        if (garden.tank < 75 || garden.temperature < 12) {
            let agriculturist = await Agriculturist.findOne({ _id: garden.agriculturist });

            sendMail(agriculturist.email);
        }
    })
});

var growthCycle = schedule.scheduleJob('0 0 */1 * *', async() => {
    let gardens = await Garden.find({ });

    gardens.forEach(async(garden) => {
        await garden.positions.forEach(async(i, index) => {
            await i.forEach(async(tree) => {
                if (tree == false) {
                    i[index] = null;
                }
                if (tree && tree.progress < tree.days) {
                    tree.progress++;
                }
            });
        });

        await Garden.updateOne({ _id: garden._id }, { $set: { positions: garden.positions } });
    });
});


module.exports = gardenCycle;
module.exports = growthCycle;