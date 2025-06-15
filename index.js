const express = require('express');
const port = 9000
const app = express();

const path = require('path');

const db = require('./config/database');

const fs = require('fs');

const multer = require('multer');

const Book = require('./models/booktbl');
const { error } = require('console');


app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

app.use((err,req,res,next)=>{
  console.error(err.stack);
  res.status(500).send("Something went wrong");

});

app.get('/', (req, res) => {
  Book.find({})
    .then(books => {
      res.render('index', {
        books: books,
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error fetching books');
    });
});

app.get('/books/add', (req, res) => {
  res.render('form');
});

app.post('/books/add', upload.single('image'), (req, res) => {
  const { title, author, publishingDate, price, rating, description, language, pagecount, updateId } = req.body;

  if (updateId) {
    if (req.file) {
      Book.findById(updateId).then((oldBook) => {
        if (oldBook && oldBook.image) {
          try {
            fs.unlinkSync(oldBook.image);
          } catch (err) {
            console.error('Error deleting old image:', err);
          }
        }
        let image = req.file.path;
        Book.findByIdAndUpdate(updateId, {
          title,
          author,
          publishingDate,
          price: parseFloat(price),
          rating: parseFloat(rating),
          description,
          language,
          pagecount: parseInt(pagecount),
          image
        }).then(() => {
          console.log("Book updated successfully");
          return res.redirect('/');
        }).catch(err => {
          console.error(err);
          res.status(500).send('Error updating book');
        });
      }).catch(err => {
        console.error(err);
        res.status(500).send('Error finding book');
      });
    } else {
      Book.findByIdAndUpdate(updateId, {
        title,
        author,
        publishingDate,
        price: parseFloat(price),
        rating: parseFloat(rating),
        description,
        language,
        pagecount: parseInt(pagecount)
      }).then(() => {
        console.log("Book updated successfully");
        return res.redirect('/');
      }).catch(err => {
        console.error(err);
        res.status(500).send('Error updating book');
      });
    }
  } else {
    if (!req.file) {
      return res.status(400).send('Image is required for new books');
    }
    Book.create({
      title,
      author,
      publishingDate,
      price: parseFloat(price),
      rating: parseFloat(rating),
      description,
      language,
      pagecount: parseInt(pagecount),
      image: req.file.path
    }).then(() => {
      console.log("Book added successfully");
      return res.redirect('/');
    }).catch(err => {
      console.error(err);
      res.status(500).send('Error adding book');
    });
  }
});

app.get('/updateData', (req, res) => {
  let updateId = req.query.updateId;
  if (!updateId) {
    return res.status(400).send('Update ID is required');
  }
  Book.findById(updateId)
    .then((book) => {
      if (!book) {
        return res.status(404).send('Book not found');
      }
      return res.render('update', { book });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error fetching book');
    });
});

app.get('/delete/:id', (req, res) => {
  let deleteId = req.params.id;
  if (!deleteId) {
    return res.status(400).send('Delete ID is required');
  }

  Book.findById(deleteId)
    .then((book) => {
      if (!book) {
        return res.status(404).send('Book not found');
      }
      if (book.image) {
        try {
          fs.unlinkSync(book.image);
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      }
      return Book.findByIdAndDelete(deleteId);
    })
    .then(() => {
      console.log("Book deleted successfully");
      return res.redirect('/');
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error deleting book');
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});