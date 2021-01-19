const { response } = require("express");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

///route handlers



app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});
///gets the urls in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// gets the urls and display them in html format
app.get("/urls", (req, res) => {
  // res.render('/views/url_index.ejs');// BAD
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

///shows a single shorthened_url and its url equivalent
app.get("/urls/:shortURL", (req, res) => {
  
  /////here is important to know that you can set pass ANY expression to look for an element in an object.//
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});