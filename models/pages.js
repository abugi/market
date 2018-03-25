const mongoose = require('mongoose')

//Page Schema
const pageShema = mongoose.Schema({
    title: {type: String, required: true},
    slug: {type: String},
    content: {type: String, required: true},
    sorting: {type: Number}
})

const Page = mongoose.model('Page', pageShema)

module.exports = Page;