export function isLoggedIn(req, res, next) {
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

export function applyLocals(req, res, next) {
  res.locals.loggedIn = req.session ? req.session.loggedIn : false;
  next();
}
