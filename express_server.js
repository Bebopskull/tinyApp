const { response } = require("express");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session')
const morgan = require('morgan');
const bcrypt = require('bcrypt');

////users database and user class imports.
const { users } = require('./usersDb');
const { User } = require('./usersDb')

////helper import
const { emailExists, passwordMatching, fetchUser } = require('./helpers');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.use(morgan('dev'));

app.use(cookieSession({
  name: 'session',
  keys: [/* secret keys */'key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
// app.use(bcrypt());

///generate random string, found from StackOverflow at https://stackoverflow.com/a/1349426 then modified a bit.
let generateRandomString = function makeid(length = 6) {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
//////////////////////////


let urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca",userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com",userID: "user2RandomID"}
};


///ROUTE HANDLERS///
app.get('/',(req, res)=>{

  let isLogged = req.session.user_id;
  if(isLogged){
    res.redirect('/urls');
    return
  }

  const templateVars = { 
    
    urls: urlDatabase,
    user: users[req.session.user_id]
   };

  res.render(`logIn`, templateVars);
})


///gets the urls in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

////LOGIN///

app.post('/logIn',(req, res) => {
  //lookup for the email submited in the users object
  if (emailExists(users, req.body.email )) {
    console.log('User recognized...' + req.body.email );
    // if (passwordMatching(users, req.body.email, req.body.password)) { //oldie
    let targetUser = fetchUser(users, req.body.email)
    if (bcrypt.compareSync( req.body.password, users[targetUser].password)) { //
      console.log('Password Accepted...')
      
      let userObj = fetchUser(users, req.body.email);
      
      req.session.user_id = userObj;  
    }
    res.redirect('/urls');
    return
  }
  // tried console.log: console.log(`Ups, you don't appear to be in our system. Please register before logging In`)
  // tried setting status message: res.statusMessage = `Ups, you don't appear to be in our system. Please register before logging In`;
  // throw new Error(`Ups, you don't appear to be in our system. Please register before logging In`)
  res.sendStatus(404);
  // res.redirect(`/urls`);
})

app.get('/login',(req, res)=>{

  const templateVars = { 
    
    urls: urlDatabase,
    user: users[req.session.user_id]
   };
  
  res.render(`login`, templateVars);
})

///LOGOUT///
app.post('/logOut',(req, res)=>{
  // res.cookie("username", req.body.username);
  req.session = null;
  res.redirect(`/urls`);
})

// gets the urls and display them in html format
app.get("/urls", (req, res) => {
  
  ///define a new filtered newdatabase////
  const isLoged = users[req.session["user_id"]]
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.session["user_id"]],
    userID: req.session["user_id"],
  };
  // if(isLoged ){
  //   res.render("urls_index", templateVars);
  // }
  res.render("urls_index", templateVars)
});

////SignUp route////

app.get("/signUp", (req, res)=>{
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.session.user_id],
   };
  
  res.render('signup', templateVars)
})


app.post('/signUp',(req, res) => {
 
  // if email or password are empty strings return error 404
  // res.header('status', 400)

  ///veryfing that the user don't exist already.
  if (emailExists(users, req.body.email)) {
    res.sendStatus(404);
    throw new Error("email already exists");
    res.redirect('/urls');
  } else {
    if(req.body.email === ''){
      res.status(400);
      res.redirect('signUp');
    }else if(req.body.password === ''){
      res.status(400);
      res.redirect('signUp');
    }else{

      const userID = generateRandomString(5);
  
      ////lets hash the password
      const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  
      ///declaring the newuser as an instance of the User class. 
      const newUser = new User(userID, req.body.email, hashedPassword);//req.body.password
  
      ///adding the newUser to the users database;
      users[userID] = newUser;
      
      ///place newuser in a cookie, also.
      // res.cookie('user_id', newUser.id);
      let userObj = fetchUser(users, req.body.email);
      
      req.session.user_id = userObj;

      res.redirect('/urls');
    }
  };
});


/////route to the 'input new url page'///
app.get("/urls/new", (req, res) => {
  
  let isLogged = req.session.user_id;
  if(!isLogged){
    res.redirect('/urls');
    return
  }

  const templateVars = { 
    urls: urlDatabase,
    user: users[req.session["user_id"]],
   };
  res.render("urls_new", templateVars);
});


///shows a single shorthened_url and its url equivalent
app.get("/urls/:shortURL", (req, res) => {

  // add cond let isLogged = req.session.user_id;
  let isLoged = req.session.user_id;
  if(!isLoged){
    res.redirect('/login');
    return
  }
  /////here is important to know that you can set pass ANY expression to look for an element in an object.///
  console.log(req.params.shortURL)
  const shortUrl= req.params.shortURL;
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[shortUrl]["longURL"],
    user: users[req.session["user_id"]],
  };  
  

  // console.log('urlDb Id',urlDatabase[req.params.shortURL])
  ///only give acces to the :url page in the App if logged user === creator user 
  if(urlDatabase[req.params.shortURL][`userID`] === req.session.user_id){
    // console.log('url object', urlDatabase[req.params.shortURL])
    res.render("urls_show", templateVars);
  }

  res.redirect("/urls");
});

/////posts///// 

/////submit new url
app.post("/urls", (req, res) => {
 
  ///generate random key
  const shortURL = generateRandomString(6);
  ////asign the random value to the req body.
  urlDatabase[shortURL] = {'longURL' : req.body.longURL, 'userID': req.session["user_id"]};
  // console.log('req.session:', req.session)
  ///lets send the user to a new link with their newly generated shortURL

  res.redirect(`/urls/${shortURL}`);
  
});


// 

///redirects to longURL////
app.get("/u/:shortURL", (req, res) => {
 
  const extURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(extURL);
});


// DELETE /URLS/:url 
// POST /URLS/:url/delete
// post requests are used to CHANGE/DELETE/UPDATE/CREATE data 
app.post( '/urls/:shortURL/delete', (req, res)=>{
  // let id = req.session.user_id;
  if(req.session.user_id){
    const urlToDelete = req.params.shortURL;
    delete urlDatabase[urlToDelete];
    res.redirect('/urls');
    return
  }
  res.sendStatus(403), res.redirect('login')
});


///phantom for urlDatabase////
app.post('/urls/:shortURL',(req, res) => {
    const editedURL=req.body.editedURL;
    const userPostID=req.session["user_id"];
    let sessObj= {longURL: editedURL, userID: userPostID};
    urlDatabase[req.params.shortURL] = sessObj;
 
    res.redirect(`/urls`);
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});