const express = require('express'),
    router = express.Router(),
    Category = require('../models/category')

//GET Categories Index
router.get('/', function (req, res) {
   Category.find({}, function(err, categories){
       if(err) return console.log(err)

       res.render('admin/admin_categories', {categories: categories})
   })
})

//GET add category
router.get('/add-category', function(req, res){
    var title = '';

    res.render('admin/add_category', {title: title})
})

//POST add catagory
router.post('/add-category', function(req, res){
    req.checkBody('title', 'Title must have a value').notEmpty()

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase()

    var errors = req.validationErrors()

    if(errors){
        res.render('admin/add_category', { title: title, errors: errors })
    }else{
        Category.findOne({slug: slug}, function(err, category){
            if(category) {
                req.flash('danger', 'Category title exist, choose another')
                res.render('admin/add_category', {title: title})
            }else{
                var category = new Category({
                    title: title,
                    slug: slug
                })

                category.save(function(err){
                    if (err) return console.log(err)
                        
                    req.flash('success', 'Category added')
                    res.redirect('/admin/categories')
                })
            }   
        })
    }
})

//GET edit category
router.get('/edit-category/:id', function(req, res){
    Category.findById(req.params.id, function(err, category){
        if(err) return console.log(err)

        res.render('admin/edit_category', {title: category.title, id: category._id})
    })
})

//POST edit category
router.post('/edit-categories/:id', function(req, res){
    req.checkBody('title', 'Title must have a value').notEmpty()

    var title = req.body.title
    var slug = title.replace(/\s+/g, '-')
    var id = req.params.id

    var errors = req.validationErrors()

    if(errors){
        res.render('admin/edit_category', {title: title, errors: errors, id: id})
    }else{
        Category.findOne({slug: slug, _id: {'$ne': id}}, function(err, category){
            if(category){
                req.flash('danger', 'Category exist, choose another')

                res.render('admin/edit_category', {title: title, id: id})
            }else{
                Category.findById(id, function(err, category){
                    if(err) return console.log(err)

                    category.title = title
                    category.slug = slug

                    category.save(function(err){
                        if(err) return console.log(err)

                        req.flash('success', 'category edited')
                        res.redirect('/admin/categories/edit-category/' + id)
                    })
                })
            }
        })
    }
})

//GET delete category
router.get('/delete-category/:id', function(req, res){
    Category.findByIdAndRemove(req.params.id, function(err){
        if(err) return console.log(err)

        req.flash('success', 'Category deleted')
        res.redirect('/admin/categories')
    })
})

//Prodcuts model setup
const Product = require('../models/product')

module.exports = router