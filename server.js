const express = require('express');
const bodyParser = require('body-parser');
const mustacheExpress = require('mustache-express');
const { Client } = require('pg');

require('dotenv').config();

const app = express();
const mustache = mustacheExpress();
mustache.cache = null;
app.engine('mustache', mustache);
app.set('view engine', 'mustache');

const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/books', (req, res) => {

  const client = new Client();
  client.connect()
    .then(() => {
      return client.query('SELECT * FROM books ORDER BY id');
    })
    .then((results) => {
  	  res.render('book-list', {
  	  	books: results.rows
  	  });
    })
    .catch((err) => {
	  console.log('error', err);
	  res.send('Oops, something bad happened');
    });
});

app.get('/book/add', (req, res) => {
  res.render('book-form');
});

app.post('/book/add', (req, res) => {
  console.log('post body', req.body);

  const client = new Client();
  client.connect()
    .then(() => {
	  const sql = 'INSERT INTO books (title, author) VALUES ($1, $2)';
	  const params = [req.body.title, req.body.author];
	  return client.query(sql, params);
    })
    .then((result) => {
	  console.log('result?', result);
	  res.redirect('/books');
    })
    .catch((err) => {
	  console.log('err', err);
	  res.redirect('/book-list');
    });
});

app.post('/book/delete/:id', (req, res) => {
  const client = new Client();
  client.connect()
    .then(() => {
	  const sql = 'DELETE FROM books WHERE id = $1'
	  const params = [req.params.id];
	  return client.query(sql, params);
    })
    .then((result) => {
	  res.redirect('/books');
    })
    .catch((err) => {
	  // console.log('error', err);
	  res.redirect('/books');
    });
});

app.get('/book/edit/:id', (req, res) => {

  const client = new Client();

  client.connect()
    .then(() => {
	  const sql = 'SELECT * FROM books WHERE id = $1';
	  const params = [req.params.id];

	  return client.query(sql, params);
    })
    .then((results) => {
	  res.render('book-edit', {
	  	book: results.rows[0]
	  })
    })
    .catch((err) => {
  	  console.log('edit get err', err);
   	  res.redirect('/books');
    });
});

app.post('/book/edit/:id', (req, res) => {
  const client = new Client();
  
  client.connect()
  .then(() => {
  
  	const sql = 'UPDATE books SET title = $1, author = $2 WHERE id = $3';
  	const params = [req.body.title, req.body.author, req.params.id];
  
  	return client.query(sql, params);
  })
  .then((results) => {
  	res.redirect('/books');
  })
  .catch((err) => {
  	console.log('err', err);
  	res.redirect('/books');
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
