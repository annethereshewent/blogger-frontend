
//Install express server
const express = require('express');
const path = require('path');
const ejs = require('ejs');
const { Client } = require('pg');
const app = express();

// Serve only the static files from the dist directory
app.use(express.static(__dirname + '/dist/blogger-frontend'));

app.set('view_engine', 'ejs')

app.get('/*', async function(req,res) {
    let stylesheet = null

    if (req.url.indexOf('blog') != -1) {
        // need to get the user id from the path

        let tokens = req.url.split('/')

        let username = tokens[2];

        const client = new Client();

        await client.connect()

        if (username != null) {
            stylesheet = await client.query(`SELECT theme_name from Theme where id = (SELECT theme_id from User where displayname = ${username} limit 1)`)
            console.log(stylesheet)   
        } 
        
    }

    res.render(path.join(__dirname+'/dist/blogger-frontend/index.ejs'));
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);