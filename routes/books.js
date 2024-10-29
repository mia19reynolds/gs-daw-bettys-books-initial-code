const express = require("express")
const router = express.Router()
const { check, validationResult } = require('express-validator');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('../users/login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

router.get('/search',function(req, res, next){
    res.render("search.ejs")
})

router.get('/search_result', function (req, res, next) {
    // Search the database
    let sqlquery = "SELECT * FROM books WHERE name LIKE '%" + req.query.search_text + "%'" // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("list.ejs", {availableBooks:result})
     }) 
})


router.get('/list', function(req, res, next) {
    let sqlquery = "SELECT * FROM books" // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("list.ejs", {availableBooks:result})
     })
})

router.get('/addbook', redirectLogin, function (req, res, next) {
    res.render('addbook.ejs', { errors: [], formData: {} });
})

router.post('/bookadded', [
    check('name')
        .notEmpty().withMessage('Book name is required')
        .isLength({ max: 255 }).withMessage('Book name must be less than 255 characters'),
    check('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0')
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If there are validation errors, re-render the form with errors
        return res.render('addbook.ejs', { errors: errors.array(), formData: req.body });
    }

    // If validation passes, save data in the database
    const bookName = req.sanitize(req.body.name);
    const price = req.sanitize(req.body.price);

    const sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
    const newrecord = [bookName, price];
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            return next(err); // Pass error to the error handler
        }
        // Successfully added book
        res.send(`This book is added to the database, name: ${req.body.name}, price: ${req.body.price}`);
    });
});


router.get('/bargainbooks', function(req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE price < 20"
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("bargains.ejs", {availableBooks:result})
    })
}) 


// Export the router object so index.js can access it
module.exports = router