
const emailExists = (userDatabase, email) => {
  for (let user in userDatabase ) {
    if (userDatabase[user].email === email) {
      return true;
    }
  }
  return false;
}

const passwordMatching = (userDatabase, email, password) => {
  for (let user in userDatabase ){
    if (userDatabase[user].password === password) {
      return true;
    } 
  } 
  return false;

}

const fetchUser = (userDatabase, email) => {
  for(let user in userDatabase){
    if (userDatabase[user].email===email) {
      
      return user;
    } 
  }
  return {}
}
const getUserByEmail = (userDatabase, email) => {
  for(let user in userDatabase){
    if (userDatabase[user].email===email) {
      
      return user;
    } 
  }
  return undefined
}

let generateRandomString = function makeid(length = 6) {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = { emailExists, passwordMatching, fetchUser, getUserByEmail, generateRandomString }