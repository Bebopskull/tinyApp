class User {
  constructor(id, email, password){
    this.id = id;
    this.email = email;
    this.password = password;
  }
}


const users = { 
  // model
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "superUser": {
    id: "superUser", 
    email: "a@b.c", 
    password: "sdsd"
  }

}



module.exports = { users, User};