const { response } = require("express");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

///generate random string
let generateRandomString = function makeid(length = 6) {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


///ROUTE HANDLERS///

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!', username: req.cookies["username"] };
  res.render("hello_world", templateVars);
});
///gets the urls in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

////LOGIN///

app.post('/logIn',(req, res)=>{

  res.cookie("username", req.body.username);
  // console.log(req.cookies);
  res.redirect(`/urls`);
})

///LOGOUT///
app.post('/logOut',(req, res)=>{
  // res.cookie("username", req.body.username);
  res.clearCookie('username');
  res.redirect(`/urls`);
})

// gets the urls and display them in html format
app.get("/urls", (req, res) => {
  // res.render('/views/url_index.ejs');// BAD
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"],
   };
  res.render("urls_index", templateVars);
});

/////route to the 'input new url page'///
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"],
   };
  res.render("urls_new", templateVars);
});

///shows a single shorthened_url and its url equivalent
app.get("/urls/:shortURL", (req, res) => {
  
  /////here is important to know that you can set pass ANY expression to look for an element in an object.//
  const templateVars = { 
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
 
app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});


/////posts///// 

/////submit new url
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  ///generate random key
  let shortURL = generateRandomString(6);
  ////asign the random value to the req body.
  urlDatabase[shortURL] = req.body.longURL;

  ///lets send the user to a new link with their newly generated shortURL
  const templateVars = { shortURL: [shortURL], longURL: req.body.longURL};
  res.redirect(`/urls/${shortURL}`);
  
});

app.post('/urls/:shortURL/:kljk',(req, res) => {
  console.log(req.body)
  urlDatabase[req.params.shortURL] = req.body.editedURL;
  console.log(req.body)
  res.redirect(`/urls`);
})


///redirects to longURL////
app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  console.log(req.body);
  const longURL = req.body;

  res.redirect(longURL);
});


// DELETE /URLS/:url 
// POST /URLS/:url/delete
// post requests are used to CHANGE/DELETE/UPDATE/CREATE data 
app.post( '/urls/:shortURL/delete', (req, res)=>{
  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});