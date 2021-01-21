const { response } = require("express");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bcrypt = require('bcrypt');

////users database and user class imports.
const { users } = require('./usersDb');
const { User } = require('./usersDb')

////helper import
const { emailExists, passwordMatching, fetchUser } = require('./helpers');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));
// app.use(bcrypt());

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
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca",userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com",userID: "user2RandomID"}
};


///ROUTE HANDLERS///

app.get("/hello", (req, res) => {
  const templateVars = { 
    greeting: 'Hello World!', 
    // user: users[req.cookies["user_id"]],
  };
  res.render("hello_world", templateVars);
});
///gets the urls in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

////LOGIN///


app.post('/logIn',(req, res)=>{
  //lookup for the email submited in the users object
  
  if (emailExists(users, req.body.email )) {
    console.log('User recognized...' + req.body.email );
    if (passwordMatching(users, req.body.email, req.body.password)) {
      console.log('Password Accepted...')
      // console.log(fetchUser(users, req.body.email).id);
      let userObj = fetchUser(users, req.body.email);
      console.log(userObj)
      let user_id = userObj;
      res.cookie('user_id', user_id)
      console.log(req.cookies);
    }else{
      res.sendStatus(403);
    }
    res.redirect('/urls');
    return
  }
  res.sendStatus(403);
  // console.log(req.cookies);
  res.redirect(`/urls`);
})

app.get('/login',(req, res)=>{


  const templateVars = { 
    
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
   };
  
 
  res.render(`login`, templateVars);
})

///LOGOUT///
app.post('/logOut',(req, res)=>{
  // res.cookie("username", req.body.username);
  res.clearCookie('user_id');
  res.redirect(`/urls`);
})

// gets the urls and display them in html format
app.get("/urls", (req, res) => {
  // res.render('/views/url_index.ejs');// BAD
  // console.log(req.cookies)

  ///define a new filtered newdatabase/////
  
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
    userID: req.cookies["user_id"],
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

////SignUp route////

app.get("/signUp", (req, res)=>{
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
   };
  
  res.render('signup', templateVars)
})

app.post('/signUp',(req, res) => {
 
  // if email or passowrd are empty strings return error 404
  // res.header('status', 400)
  
  if(req.body.email === '' || req.body.password === ''){
    res.status(400);
    res.redirect('signUp');
  }
  ///seting up the userobject name by its email
  console.log(req.body)
  let userMail = req.body.email;
  ///veryfing that the user don't exist already.
  if (emailExists(users, userMail)) {
    res.sendStatus(400);
    console.log("email already exists");

    res.redirect('/urls');
  } else {
     ///generate random user ID
    let userID = generateRandomString(5);

    ////lets hash the password
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    ///declaring the newuser as an instance of the User class. 
    let newUser = new User(userID, req.body.email, hashedPassword);//req.body.password

    ///adding the newUser to the users database;
    users[userID] = newUser;
    
    ///place newuser in a cookie, also.
    res.cookie('user_id', newUser.id);
    
    // console.log(req.cookies);
    
    res.redirect('/urls');
  };
});


/////route to the 'input new url page'///
app.get("/urls/new", (req, res) => {
  // console.log(req.cookies.user_id);
  let isLogged = req.cookies.user_id;
  if(!isLogged){
    res.redirect('/login');
    return
  }
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
   };
  res.render("urls_new", templateVars);
});

///shows a single shorthened_url and its url equivalent
app.get("/urls/:shortURL", (req, res) => {
  
  /////here is important to know that you can set pass ANY expression to look for an element in an object.//
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

/////posts///// 

/////submit new url
app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  ///generate random key
  // console.log("req.cookies", req.cookies);
  let shortURL = generateRandomString(6);
  ////asign the random value to the req body.
  urlDatabase[shortURL] = {'longURL' : req.body.longURL, 'userID': req.cookies["user_id"]};

  ///lets send the user to a new link with their newly generated shortURL
  // const templateVars = { shortURL: [shortURL].longURL, longURL: req.body.longURL};

  res.redirect(`/urls/${shortURL}`);
  
});


// 

///redirects to longURL////
app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  console.log(urlDatabase);
  const extURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(extURL);
});


// DELETE /URLS/:url 
// POST /URLS/:url/delete
// post requests are used to CHANGE/DELETE/UPDATE/CREATE data 
app.post( '/urls/:shortURL/delete', (req, res)=>{
  let id = req.cookies.user_id;
  if(id){
    const urlToDelete = req.params.shortURL;
    delete urlDatabase[urlToDelete];
    res.redirect('/urls');
    return
  }
  res.sendStatus(403), res.redirect('login')
});


///phantom////
app.post('/urls/:shortURL',(req, res) => {
    urlDatabase[req.params.shortURL] = req.body.editedURL;
    res.redirect(`/urls`);
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});