import bcrypt from "bcryptjs";
import passport from 'passport';



export const logout = (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
};
