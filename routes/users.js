// Create a new router
const express = require("express")
const bcrypt = require('bcrypt')
const router = express.Router()

const { check, validationResult } = require('express-validator');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('./login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

router.get('/register', function (req, res, next) {
    res.render('register', { error: [], formData: {} });                                                     
})    

router.post('/registered', [
    check('first').notEmpty().withMessage('First name is required'),
    check('last').notEmpty().withMessage('Last name is required'),
    check('username')
        .notEmpty().withMessage('Username is required')
        .isAlphanumeric().withMessage('Username must contain only letters and numbers')
        .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters'),
    check('email').isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail(),
    check('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&#]/).withMessage('Password must contain at least one special character')
    ],function (req, res, next) {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        // res.redirect('./register'); 
        const firstError = errors.array()[0];
        return res.render('register', { error: firstError.msg, formData: req.body });
    } else {
        const saltRounds = 10
        const firstName = req.sanitize(req.body.first); // Add sanitization here
        const lastName = req.sanitize(req.body.last);   // Example for last name as well
        const username = req.sanitize(req.body.username);
        const email = req.sanitize(req.body.email);
        const plainPassword = req.body.password
        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
            // saving data in database
            let sqlquery = "INSERT INTO users (first, last, username, email, password) VALUES (?,?,?,?,?)"
            // execute sql query
            let newrecord = [
                firstName, 
                lastName, 
                username, 
                email, 
                hashedPassword
            ];
            db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                next(err)
            }
            else
                // saving data in database
            result = 'Hello '+ firstName + ' '+ lastName +' you are now registered!  We will send an email to you at ' + req.body.email
            result += 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword
            res.send(result)
        })
      })
    }
})

router.get('/list', redirectLogin, function(req, res, next) {
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
    // Save user session here, when login is successful
    req.session.userId = req.body.username;
})

// Export the router object so index.js can access it
module.exports = router