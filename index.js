import express from 'express';
import dotenv from 'dotenv'
import session from 'express-session';
import nocache from 'nocache';
import mongoose from 'mongoose';
import { default as connectMongoDBSession} from 'connect-mongodb-session';
const MongoDBStore = connectMongoDBSession(session);


dotenv.config();

import homeRoutes from './routes/user/homeRoutes.js';
import userRoutes from './routes/user/userRoutes.js';
import shopRoutes from './routes/user/shopRoutes.js';
import adminAuthRoutes from './routes/admin/adminAuthRoutes.js'
import adminUserRoutes from './routes/admin/adminUserRoutes.js'
import adminProductRoutes from './routes/admin/adminProductRoutes.js'
import adminCategoryRoutes from './routes/admin/adminCategoryRoutes.js'

const app = express();
app.disable('x-powered-by');

// Setup all the middlewares.
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
.then(() => {
  console.log(`🍃 Mongoose connected to Database: ${mongoose.connection.name}`)
})
.catch(err => {
  console.log("❌ Mongoose could not establish a connection with MongoDB")
  console.error(err);
  process.exit(1);
});

const mongoStore = new MongoDBStore({
  uri: process.env.MONGO_URL,
  collection: 'sessions',
  expires: 1000 * 60 * 60 * 24 * 30, // 30 days in milliseconds
}, err => {
  if (err) {
    console.log(`❌ MongoDB session could not connect with MongoDB`)
  } else {
    console.log(`🍃 MongoDB session store connected to MongoDB`)
  }
});

const ONE_DAY = 1000 * 60 * 60 * 24;
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  cookie: { maxAge: ONE_DAY },
  saveUninitialized: true,
  name: process.env.SESSION_NAME,
  store: mongoStore
}));

app.use((req, res, next) => {
  console.log(`[hit] ${req.method} - ${req.url}`)
  next();
})
 
app.use(nocache())
app.use('/', homeRoutes);
app.use('/', shopRoutes);
app.use('/user', userRoutes);

app.use('/admin', adminAuthRoutes);
app.use('/admin/users', adminUserRoutes);
app.use('/admin/product', adminProductRoutes);
app.use('/admin/category', adminCategoryRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🔥 Server started listening on http://localhost:${port}`);
})