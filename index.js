const Application = require('./app.js');
const app = new Application();

app.prepare({}, (err) => {
    if (err)
        console.log('Error on prepare', err);
    app.start({}, (err) => {
        if (err)
            console.log('Error on start');
    });
});
