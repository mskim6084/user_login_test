function password_match(password, confirm_password){
    return password === confirm_password
}

module.exports = { password_match }