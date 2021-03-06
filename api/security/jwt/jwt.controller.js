import jwt from "jsonwebtoken";
import passport from "passport";
import UserService from "../../user/user.service";
import config from 'config';

class JwtController {
  login(req, res, next) {
    if (req.body.email && req.body.password) {
      let password = req.body.password;

      new Promise((resolve, reject) => {
        UserService.findOneByEmail(req.body.email, (err, user) => {
          if (!user) {
            reject();
          } else {
            resolve(user);
          }
        });
      })
        .then(user => {
          //FIXME:  implement Scrypt for password before verify
          if (user.password === password) {
            const payload = {
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
              }
            };

            const token = jwt.sign(payload, config.security.secretkey);

            return res.json({ message: "ok", token: token });
          } else {
            return res.status(401).json({ message: "passwords did not match" });
          }
        })
        .catch(err => {
          return res.status(401).json({ message: "no such user found" });
        });
    }
  }
  testsecret(req, res, next) {
    return res.json({ message: "ok" });
  }
  unauthenticatedRequestsHandler(err, req, res, next) {
    if (err.name === "UnauthorizedError") {
      res.status(401).redirect("/app/login/");
    }
  }
}

export default new JwtController();
