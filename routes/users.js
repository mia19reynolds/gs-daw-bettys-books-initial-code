// Create a new router
const express = require("express")
const bcrypt = require('bcrypt')
const router = express.Router()

router.get('/register', function (req, res, next) {
    res.render('register.ejs')
                                                                     
})    

router.post('/registered', function (req, res, next) {
    const saltRounds = 10
    const plainPassword = req.body.password
    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
        // saving data in database
        let sqlquery = "INSERT INTO users (first, last, username, email, password) VALUES (?,?,?,?,?)"
        // execute sql query
        let newrecord = [req.body.first, req.body.last, req.body.username, req.body.email, hashedPassword]
        db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err)
        }
        else
            // saving data in database
        result = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email
        result += 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword
        res.send(result)
        })
      })

})

router.get('/list', function(req, res, next) {
    let sqlquery = "SELECT username FROM users" // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("listusers.ejs", {username:result})
     })
})

router.get('/login', function (req, res, next) {
    res.render('login.ejs')
                                                                     
})    

router.post('/loggedin', function (req, res, next) {
    let sqlquery = "SELECT password FROM users WHERE username=?;"
    db.query(sqlquery, req.body.username , (err, result) => {
        console.log(result)
        if (err) {
            next(err)
        }
        else if(result.length > 0){
            hashedPassword = result[0].password

            console.log(result)
            console.log(req.body.password)
            // Compare the password supplied with the password in the database
            bcrypt.compare(req.body.password, hashedPassword, function(err, result) {
                if (err) {
                    // TODO: Handle error
                    next(err)
                }
                else if (result == true) {
                    // TODO: Send message
                    result = "Password Correct"
                    res.send(result)
                }
                else {
                    // TODO: Send message
                    result = "Password Incorrect"
                    res.send(result)
                }
            })
        } else {
            result = "User doesn't exist"
            res.send(result)
        }

    })

})

// Export the router object so index.js can access it
module.exports = router