
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
    let stylesheet = 'default'

    is_blog = false
    if (req.url.indexOf('blog') != -1) {
        // need to get the user id from the path
        is_blog = true
        let tokens = req.url.split('/')

        let username = tokens[3];

        const client = new Client();

        await client.connect()

        if (username != null) {
            let result = await client.query(`SELECT theme_name from themes where id = (SELECT theme_id from users where displayname = '${username}' limit 1)`)
            stylesheet = result.rows[0].theme_name  
        } 
        
    }

    res.render(path.join(__dirname+'/dist/blogger-frontend/index.ejs'), { stylesheet, is_blog });
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);