export function isLoggedIn(req, res, next) {
  res.locals.loggedIn = req.session.loggedIn;
  if (req.session.loggedIn) {
    if (req.session.isBlocked) {
      res.redirect('/login');
      return;
    }
    next();
  } else {
    res.redirect('/login');
  }
}

export function alreadyLoggedIn(req, res, next) {
  if (req.session.loggedIn) {
    res.redirect('/');
  } else {
    next();
  }
}

export function checkIfUserIsBlocked(req, res, next) {
  if (req.session.loggedIn && req.session.email) {
   User.findOne({ email: req.session.email }).then(user => {
     if (user && user.isBlocked) {
       req.session = null;
       res.redirect('/login');
     } else {
       next();
     }
   });
  } else {
   next();
  }
 }
 
