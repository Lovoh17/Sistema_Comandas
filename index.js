const express = require('express');
const path = require('path')

// Import routes
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

const app = express();

const port = parseInt(process.env.PORT) || process.argv[3] || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

// Use routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api', (req, res) => {
  res.json({"msg": "Hello world"});
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
})