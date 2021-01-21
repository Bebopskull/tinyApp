
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
    if (userDatabase[email]) {
      return userDatabase[email]
    } 
  }
  return {}
}


module.exports = { emailExists, passwordMatching, fetchUser }