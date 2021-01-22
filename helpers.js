
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
      // console.log(userDatabase[email)
      return user;
    } 
  }
  return {}
}
const getUserByEmail = (userDatabase, email) => {
  for(let user in userDatabase){
    if (userDatabase[user].email===email) {
      // console.log(userDatabase[email)
      return user;
    } 
  }
  return undefined
}




module.exports = { emailExists, passwordMatching, fetchUser, getUserByEmail }