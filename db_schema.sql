
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

--create your tables with SQL commands here (watch out for slight syntactical differences with SQLite)
CREATE TABLE IF NOT EXISTS Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    user_email TEXT,
    password varchar(255) NOT NULL,
    author INT(1),
    blog_title TEXT DEFAULT 'MrBlogger',
    blog_subtitle TEXT DEFAULT 'Your Everyday Blog'
); 

CREATE TABLE IF NOT EXISTS Articles (
    article_id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_name TEXT NOT NULL,
    article_subtitle TEXT NOT NULL,
    publish_date TIMESTAMP,
    create_date TIMESTAMP,
    change_date TIMESTAMP,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    user_id INTEGER
);  

CREATE TABLE IF NOT EXISTS Comments (
    comment_id INTEGER PRIMARY KEY,
    user_id INTEGER,
    article_id InTEGER,
    create_date TIMESTAMP,
    comment TEXT NOT NULL
);  


--insert default data (if necessary here)

INSERT INTO Articles ("article_name", "content", "user_id","article_subtitle", "views", "create_date") VALUES ("The boy who cried wolf", "A shepherd-boy", 1, "Wolf boy", 12, CURRENT_TIMESTAMP);
INSERT INTO Users ("user_name", "user_email","author","password") VALUES( "Jane Doe","lake.kirsten@gmail.com",1, 'test'); 
COMMIT;

