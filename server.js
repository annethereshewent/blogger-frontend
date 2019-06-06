
//Install express server
const express = require('express');
const path = require('path');
const ejs = require('ejs');
const { Client } = require('pg');
const app = express();



app.set('view engine', 'ejs');

// Serve only the static files from the dist directory
app.use(express.static(__dirname + '/dist/blogger-frontend'));

app.get('/*', function(req,res) {
    let data = {};

    if (req.url.indexOf('blog') != -1) {
        // need to get the user id from the path

        let user_id = req.url.split('/').filter(($token) => {
            return !isNaN(parseInt($token))
        })

        const client = new Client();

        await client.connect()

        data.stylesheet = await client.query(`SELECT theme_name from Theme where id = (SELECT theme_id from User where id = ${user_id})`)
    }

    res.render(path.join(__dirname+'/dist/blogger-frontend/index.ejs'), data);
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);