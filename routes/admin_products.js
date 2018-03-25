const express = require('express'),
    router = express.Router(),
    mkdirp = require('mkdirp'),
    fs = require('fs-extra'),
    resizeImg = require('resize-img'),
    Product = require('../models/product'),
    Category = require('../models/category')

//GET product Index
router.get('/', function(req, res){
    var count = 0

    Product.count(function(err, c){
        count = c
    })

    Product.find(function(err, products){
        if(err) return console.log(err)

        res.render('admin/products', {products: products, count: count})
    })
})

//GET add product                                                                   
router.get('/add-product', function(req, res){
    var title = ''
    var desc = ''
    var price = ''

    Category.find(function (err, categories) {
        res.render('admin/add_product', {title: title, desc: desc, categories: categories, price: price})
    })
})

module.exports = router