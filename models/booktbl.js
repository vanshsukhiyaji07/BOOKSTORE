const mongoose = require('mongoose');

const bookSchema =  mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    author:{
        type:String,
        required:true,
    },
    publishingDate:{
        type:Date,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    rating:{
        type:Number,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    language:{
        type:String,
        required:true,
    },
    pagecount:{
        type:Number,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
})
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;

