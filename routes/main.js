
/**
 * This is the main routes which is used to display, manipulate and update the database
 */

const express = require("express");
const router = express.Router();
const assert = require('assert');

/**
 * @desc retrieves the current articles
 */

/////////////////////////////////////// GET Statements ////////////////////////////////////////////////////////


//GET: The login page
router.get("/", (req, res, next) => {
  delete req.session.variable;
  res.render("login", { message: "okay"})
});

//GET: all the raticles for the home page
router.get("/home", (req, res, next) => {
  global.db.all("SELECT * FROM Articles ORDER BY publish_date DESC , create_date DESC", function (err, rows) {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      global.db.all("SELECT * FROM Users", function (err2, rows2) {
        if (err2) {
        } else {
          res.render("home", { model: rows, user: req.session.username, allUsers: rows2 });
        }
      });
    }
  });
});

//GET the specific article to edit and display it on the edit page
router.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Articles WHERE article_id = ?";
  global.db.get(sql, id, (err, row) => {
    const sql2 = "SELECT user_name FROM Users WHERE user_id = ?";
    const user_id = row.user_id;
    global.db.get(sql2, user_id, (err, row2) => {
      res.render("edit", { model: row, user: req.session.username, author: row2 });
    });
  });
});


// GET the create article page and prepopulate the data
router.get("/create", (req, res) => {
  const article = {
    article_name: "Default",
    article_subtitle: "Default",
    content: 'Default'
  }
  res.render("create", { model: article, user: req.session.username });
});

//GET the article that the user wants to delete and redirect to delete page
router.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Articles WHERE article_id = ?";
  global.db.get(sql, id, (err, row) => {
    const sql2 = "SELECT user_name FROM Users WHERE user_id = ?";
    const user_id = row.user_id;
    global.db.get(sql2, user_id, (err, row2) => {
      res.render("delete", { model: row, user: req.session.username, author: row2 });
    });
  });
});

//GET the article that corresponds to the ID to display to the user
router.get("/view/:id", (req, res,next) => {
  const id = req.params.id;
  //Get the article
  global.db.get("SELECT * FROM Articles WHERE article_id = ?", id, (err, row, next) => {
    if (err) {
      next(err);
    } else {
      const sql2 = "SELECT user_name FROM Users WHERE user_id = ?";
      const user_id = row.user_id;
      global.db.get(sql2, user_id, (err, row2) => {
        if (err) {
          next(err);
        } else {
          const sql3 = "SELECT * FROM Comments WHERE article_id = ? ORDER BY create_date DESC ";
          const article_id = row.article_id;
          global.db.all(sql3, article_id, (err, row3) => {
            if (err) {
              next(err);
            } else {
              const sql4 = "SELECT * FROM Users";
              global.db.all(sql4, (err, row4) => {
                if (err) {
                  next(err);
                } else {
                  res.render("view", { model: row, user: req.session.username, author: row2, comments: row3, userList: row4 });
                }
              });
            }
          });
        }
      });
    }
  });
});

//GET the settings page
router.get("/settings/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Users WHERE user_id = ?";
  global.db.get(sql, id, (err, row) => {
    res.render("settings", { model: row, user: req.session.username, });
  });
});

//GET settings Page
router.get("/settings", (req, res) => {
  res.render("settings", { user: req.session.username });
});

router.get("/signup", (req, res, next) => {
  delete req.session.variable;
  res.render("signup")
});


/////////////////////////////////////// POST Statements ////////////////////////////////////////////////////////


//POST changes from the edit page
router.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const article = [req.body.article_name, req.body.content, req.body.article_subtitle, id];
  const sql = "UPDATE Articles SET article_name= ?, content = ?,article_subtitle = ?, change_date = CURRENT_TIMESTAMP WHERE (article_id = ?)";
  db.run(sql, article, err => {
    // if (err) ...
    res.redirect("/home");
  });
});


// POST new articles to the database
router.post("/create", (req, res, next) => {
  const sql = "INSERT INTO Articles ('article_name', 'content', 'article_subtitle', 'user_id','create_date') VALUES(?,?,?,?,CURRENT_TIMESTAMP)";
  const article = [req.body.article_name, req.body.content, req.body.article_subtitle, req.session.username.user_id];
  global.db.run(sql, article, err => {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      res.redirect('/home');
    }
  });
});


//POST delete to the databasse
router.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM Articles WHERE article_id = ?";
  global.db.run(sql, id, err => {
    // if (err) ...
    res.redirect("/home");
  });
});

//POST Publish update to the database
router.post("/publish/:id", (req, res) => {
  const id = req.params.id;
  const article = [id];
  const sql = "UPDATE Articles SET publish_date = CURRENT_TIMESTAMP WHERE (article_id = ?)";
  global.db.run(sql, article, err => {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      res.redirect("/home");
    }
  });
});

//POST the views from clicking the view button 
router.post("/view/:id", (req, res) => {
  const id = req.params.id;
  const sql = "UPDATE Articles SET views = views + 1 WHERE (article_id = ?)";
  global.db.run(sql, id, (err) => {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      //Get the article
      global.db.get("SELECT * FROM Articles WHERE article_id = ?", id, (err, row, next) => {
        if (err) {
          next(err);
        } else {
          const sql2 = "SELECT user_name FROM Users WHERE user_id = ?";
          const user_id = row.user_id;
          global.db.get(sql2, user_id, (err, row2, next) => {
            if (err) {
              next(err);
            } else {
              const sql3 = "SELECT * FROM Comments WHERE article_id = ? ORDER BY create_date DESC";
              const article_id = row.article_id;
              global.db.all(sql3, article_id, (err, row3, next) => {
                if (err) {
                  next(err);
                } else {
                  const sql4 = "SELECT * FROM Users";
                  global.db.all(sql4, (err, row4, next) => {
                    if (err) {
                      next(err);
                    } else {
                      res.render("view", { model: row, user: req.session.username, author: row2, comments: row3, userList: row4 });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});


//POST the likes to the databasae form clicking the like button
router.post("/like/:id", (req, res) => {
  const id = req.params.id;
  const sql = "UPDATE Articles SET likes = likes + 1 WHERE (article_id = ?)";
  global.db.run(sql, id, (err) => {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      //Get the article
      global.db.get("SELECT * FROM Articles WHERE article_id = ?", id, (err, row, next) => {
        if (err) {
          next(err);
        } else {
          const sql2 = "SELECT user_name FROM Users WHERE user_id = ?";
          const user_id = row.user_id;
          global.db.get(sql2, user_id, (err, row2, next) => {
            if (err) {
              next(err);
            } else {
              const sql3 = "SELECT * FROM Comments WHERE article_id = ? ORDER BY create_date DESC";
              const article_id = row.article_id;
              global.db.all(sql3, article_id, (err, row3, next) => {
                if (err) {
                  next(err);
                } else {
                  const sql4 = "SELECT * FROM Users";
                  global.db.all(sql4, (err, row4, next) => {
                    if (err) {
                      next(err);
                    } else {
                      res.render("view", { model: row, user: req.session.username, author: row2, comments: row3, userList: row4 });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});


//POST any updates to the settings page
router.post("/settings/:id", (req, res, next) => {
  const id = req.params.id;
  const sql = "UPDATE Users SET blog_title = ?, blog_subtitle = ?";
  const blog = [req.body.blog_title, req.body.blog_subtitle]
  global.db.run(sql, blog, (err) => {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      const sql2 = "UPDATE Users SET user_name = ?, user_email = ? WHERE (user_id = ?)";
      const user = [req.body.user_name, req.body.user_email, id]
      global.db.run(sql2, user, (err) => {
        res.redirect("/home");
      });
    }
  });
});


//POST authorization check for log in page
router.post('/auth', function (req, res) {
  // Capture the input fields
  let user_email = req.body.user_email;
  let password = req.body.password;
  // Ensure the input fields exists and are not empty
  if (user_email && password) {
    const sql = 'SELECT * FROM Users WHERE user_email = ? AND password = ?';
    // Execute SQL query that'll select the account from the database based on the specified username and password
    global.db.get(sql, [user_email, password], (error, row, fields) => {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
            if (row) {
        // Authenticate the user
        console.log("Successful Log In");
        req.session.loggedin = true;
        req.session.username = row;
        // Redirect to home page
        res.redirect("home");
      } else {
        
        res.render('login', { message: "Incorrect username or password" });
      }
    });
  } else {
    res.render('login', { message: "Please enter username and password" });
  }
});


//POST add comments
router.post("/add-comment/:id", (req, res) => {
  const id = req.params.id;
  const article = [id, req.session.username.user_id, req.body.comment];
  const sql = "INSERT INTO Comments ('article_id', 'user_id', 'comment', 'create_date') VALUES(?,?,?,CURRENT_TIMESTAMP)";
  db.run(sql, article, err => {
    res.redirect('/view/' + id);
  });
});

//POST add user
router.post("/add-user", (req, res, next) => {
  const id = req.params.id;
  console.log(JSON.stringify(req.body));
  if (Object.keys(req.body).length > 3) {
    var author = 1;
  } else {
    var author = 0;
  }
  const user = [req.body.user_name, req.body.user_email, req.body.password, author];
  const sql = "INSERT INTO Users ('user_name', 'user_email', 'password', 'author') VALUES(?,?,?,?)";
  db.run(sql, user, err => {
    if (err) {
      next(err);
    }
    console.log('User Created Successfully');
    res.redirect('/');
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


module.exports = router;


