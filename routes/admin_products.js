const express = require('express'),
    router = express.Router(),
    mkdirp = require('mkdirp'),
    fs = require('fs-extra'),
    resizeImg = require('resize-img'),
    Product = require('../models/product'),
    Category = require('../models/category')

//GET product Index
router.get('/', function (req, res) {
    var count = 0

    Product.count(function (err, c) {
        count = c
    })

    Product.find(function (err, products) {
        if (err) return console.log(err)

        res.render('admin/products', { products: products, count: count })
    })
})

//GET add product                                                                   
router.get('/add-product', function (req, res) {
    var title = ''
    var desc = ''
    var price = ''

    Category.find(function (err, categories) {
        res.render('admin/add_product', { title: title, desc: desc, categories: categories, price: price })
    })
})

//POST add product
router.post('/add-product', function (req, res) {

    //To check that an image is uploaded
    var imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : ""

    req.checkBody('title', 'Title must have a value.').notEmpty()
    req.checkBody('desc', 'Description must have a value.').notEmpty()
    req.checkBody('price', 'Price must have a value.').isDecimal()

    //custom validator for allowed image file extensions written in app.js line 60
    req.checkBody('image', 'You must upload an image.').isImage(imageFile)

    var title = req.body.title
    var slug = title.replace(/\s+/g, '-')
    var desc = req.body.desc
    var price = req.body.price
    var category = req.body.category

    var errors = req.validationErrors()

    if (errors) {
        Category.find(function (err, categories) {
            res.render('admin/add_product', { title: title, desc: desc, categories: categories, price: price, errors: errors })
        })
    } else {
        //Check product being added does not already exist
        Product.findOne({ slug: slug }, function (err, product) {
            if (product) {
                req.flash('danger', 'Product already exist, choose another')
                Category.find(function (err, categories) {
                    res.render('admin/add_product', { title: title, desc: desc, categories: categories, price: price })
                })
            } else {
                var price2 = parseFloat(price).toFixed(2)

                var product = new Product({
                    title: title,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                })

                product.save(function (err) {
                    if (err) return console.log(err)

                    //create folders in the public directory
                    mkdirp('public/product_images/' + product._id, function (err) {
                        if (err) return console.log(err)
                    })

                    mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
                        if (err) return console.log(err)
                    })

                    mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
                        if (err) return console.log(err)
                    })

                    //check if image file is not an empty string
                    if (imageFile != "") {
                        var productImage = req.files.image
                        var path = 'public/product_images/' + product._id + '/' + imageFile

                        productImage.mv(path, function (err) {
                            return console.log(err)
                        })
                    }

                    req.flash('success', 'Product Added')
                    res.redirect('/admin/products')

                })
            }
        })
    }

})

//GET edit product
router.get('/edit-product/:id', function (req, res) {
    var errors;

    if (req.session.errors)
        errors = req.session.errors
    req.session.errors = null

    Category.find(function (err, categories) {

        Product.findById(req.params.id, function (err, p) {
            if (err) {
                console.log(err)
                res.redirect('/admin/products')
            } else {
                //get all gallery images for the product
                var galleryDir = 'public/product_images/' + p._id + '/gallery';
                var galleryImages = null;

                //Now read the directory and check for saved files
                fs.readdir(galleryDir, function (err, files) {
                    if (err) {
                        console.log(`There is ${err} here`)
                    } else {
                        galleryImages = files

                        res.render('admin/edit_product',
                            {
                                title: p.title,
                                desc: p.desc,
                                categories: categories,
                                category: p.category.replace(/\s+/g, '-').toLowerCase(),
                                price: parseFloat(p.price).toFixed(2),
                                image: p.image,
                                gallery: galleryImages,
                                id: p._id
                            })
                    }
                })
            }
        })
    })
})

//POST edit product
router.post('/edit-product/:id', function (req, res) {
    //To check that an image is uploaded
    var imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : ""

    req.checkBody('title', 'Title must have a value.').notEmpty()
    req.checkBody('desc', 'Description must have a value.').notEmpty()
    req.checkBody('price', 'Price must have a value.').isDecimal()

    //custom validator for allowed image file extensions written in app.js line 60
    req.checkBody('image', 'You must upload an image.').isImage(imageFile)

    var title = req.body.title
    var slug = title.replace(/\s+/g, '-')
    var desc = req.body.desc
    var price = req.body.price
    var category = req.body.category
    var pimage = req.body.pimage
    var id = req.params.id

    var errors = req.validationErrors()

    if(errors){
        req.session.errors = errors
        res.redirect('/admin/products/edit-product/'+id)
    }else{
        //check if the product already exist
        Product.findOne({slug: slug, _id:{'$ne':id}}, function(err, p){
            if(err) console.log(err)

            if(p){
                req.flash('danger', 'Product exist, choose another.')
                res.redirect('/admin/products/edit-product/' + id)
            }else{
                Product.findById(id, function(err, p){
                    if(err) console.log(err)

                    p.title = title
                    p.slug = slug
                    p.desc = desc
                    p.price = parseFloat(price).toFixed(2)
                    p.category = category
                    if(imageFile != ""){
                        p.image = imageFile
                    }

                    p.save(function(err){
                        if(err) console.log(err)

                        //check if there is new image being uploaded
                        if(imageFile != ""){
                            //remove the existing image to save the new one
                            if(pimage != ""){
                                fs.remove('public/product_images/'+ id+'/'+pimage, function(err){

                                })
                            }
                            //save new image
                            var productImage = req.files.image
                            var path = 'public/product_images/'+id+'/'+imageFile

                            productImage.mv(path, function(err){
                                if(err) console.log(err)
                            })
                        }

                        req.flash('success', 'Product edited.')
                        res.redirect('/admin/products/edit-product/' + id)
                    })
                })
            }
        })
    }

})

module.exports = router