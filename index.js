const express = require('express');
const app = express();
require("dotenv").config(); // Get environment variables from .env file(s)
const port = 3000;
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); 

const session = require('express-session');
const path = require('path');

global.url = `http://localhost:${3000}`

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));


//items in the global namespace are accessible throught out the node application
global.db = new sqlite3.Database('./database.db',function(err){
  if(err){
    console.error(err);
    process.exit(1); //Bail out we can't connect to the DB
  }else{
    console.log("Database connected");
    global.db.run("PRAGMA foreign_keys=ON"); }
  })


const mainRoute= require('./routes/main');

//set the app to use ejs for rendering
 app.set('view engine', 'ejs');
 app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(
  express.urlencoded(),
  cors({
      origin: 'http://localhost:3000'
  })
); 


//this adds all the routes in mainRoutes to the app under the path /user
app.use('/', mainRoute);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

