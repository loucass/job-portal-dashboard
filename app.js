const express = require("express");
const { default: helmet } = require("helmet");
const { createConnection } = require("mysql2");
const cookieParser = require("cookie-parser");
const { createHash } = require("crypto");
const multer = require("multer");
const path = require("path");
const { writeFile } = require("fs");
const app = express();
const port = 8082;

// encryption in one way
const encrypt = (text) => createHash("sha256").update(text).digest("hex");

// set cookie setter function

const cookieSetter = (MRes, name, val) => {
  MRes.cookie(name, val, {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: "strict",
  });
};

// set upload file save in memory until use it

const storeE = multer.memoryStorage();

const uploadC = multer({
  storage: storeE,
  // filter files only pdf accepted
  fileFilter: (req, file, CB) => {
    if (file.mimetype == "application/pdf") {
      return CB(null, true);
    }
    CB(null, false);
  },
  // limit file size to 2MG
  limits: { fieldNameSize: 2 * 1024 * 1024 },
});

const uploadP = multer({
  storage: storeE,
});

// set DB connection

const connection = createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "codealpha",
});

// set security headers

app.use(helmet());

// set view engine
app.set("view engine", "ejs");

// set public dir
app.use(express.static(path.join(__dirname, "public")));

// pase cookie
app.use(cookieParser());

// parse data
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // get form data

// root

app.get("/", (MReq, MRes) => {
  if (MReq.cookies.JID) {
    cookieSetter(MRes, "JID", MReq.cookies.JID);
    cookieSetter(MRes, "rule", MReq.cookies.rule);
    MRes.redirect("/home");
    MRes.end();
    return;
  }
  MRes.redirect("/signup");
  MRes.end();
});

// home pages

app.get("/home", (MReq, MRes) => {
  cookieSetter(MRes, "JID", MReq.cookies.JID);
  cookieSetter(MRes, "rule", MReq.cookies.rule);
  console.log(MReq.cookies.JID);
  let jid = MReq.cookies.JID,
    rule = MReq.cookies.rule;
  let q =
    rule == "seeker"
      ? `
  SELECT
    u.userName , u.userRule , u.ID , 
    ps.postContent , ps.createdDate , 
    p.img 
    FROM posts ps 
    LEFT JOIN users u ON u.ID = ps.userID 
    LEFT JOIN profilepictures p ON p.userID = u.ID
    ORDER by ps.createdDate DESC;
  `
      : rule == "employer"
      ? `
  SELECT
  u.userName , u.userRule , u.ID ,
  j.ID as JID , j.title , j.description , j.location , j.createdDate ,
  p.img 
  FROM jobs j 
  LEFT JOIN users u ON u.ID = j.hrID 
  LEFT JOIN profilepictures p ON p.userID = u.ID
  ORDER by j.createdDate DESC;
  `
      : `
  SELECT
  u.userName , u.userRule , u.ID , 
  j.title , j.description , j.location , j.createdDate ,
  p.img 
  FROM jobs j 
  LEFT JOIN users u ON u.ID = j.hrID 
  LEFT JOIN profilepictures p ON p.userID = u.ID
  ORDER by j.createdDate DESC;
  `;
  let q2 = `
  SELECT
    p.img ,
    u.userName , u.userRule , u.userJob
    FROM users u 
    LEFT JOIN profilepictures p ON u.ID = p.userID 
    WHERE u.ID = ${jid}
    `;
  let values_ = {};
  connection.query(q2, (err, result, fields) => {
    if (err) {
      return console.log("Error on connecting2 " + err.message);
    }
    console.log(result);
    values_.userName = result[0].userName;
    values_.userRule = result[0].userRule;
    values_.userJob = result[0].userJob ? result[0].userJob : null;
    values_.photo = result[0].img;
  });
  connection.query(q, (err, result, fields) => {
    if (err) {
      return console.log("Error on connecting2 " + err.message);
    }
    result.forEach((element) => {
      console.log(element, 338);
      let ror = new Date(element.createdDate);
      element.createdDate = `${ror.getDay()}/${ror.getMonth()}/${ror.getFullYear()}`;
    });
    console.log(result);
    console.log(values_);
    try {
      MRes.status(200).render("home", {
        name: values_.userName,
        rule: values_.userRule,
        jobTitle: values_.userJob,
        photo: values_.photo,
        posts: result,
      });
    } catch (error) {
      MRes.status(400).render("errors", {
        title: "error",
        header: "home page don't response",
        content: "error on loading home page",
      });
    }
  });
});

// profile

app.get("/profile", (MReq, MRes) => {
  if (!MReq.cookies.JID) return MRes.redirect("/login");
  cookieSetter(MRes, "JID", MReq.cookies.JID);
  cookieSetter(MRes, "rule", MReq.cookies.rule);
  let jid = MReq.cookies.JID;
  let q =
    MReq.cookies.rule == "employer"
      ? `
    SELECT
    u.userName , u.userRule ,
    ps.postContent , ps.createdDate , 
    p.img 
    FROM posts ps 
    LEFT JOIN users u ON u.ID = ps.userID 
    LEFT JOIN profilepictures p ON p.userID = u.ID
    WHERE u.ID = ${jid}
    ORDER by ps.createdDate DESC;
    `
      : `
    SELECT
    u.userName , u.userRule ,
    ps.description postContent , ps.createdDate  , ps.title ,
    p.img 
    FROM jobs ps 
    LEFT JOIN users u ON u.ID = ps.hrID 
    LEFT JOIN profilepictures p ON p.userID = u.ID
    WHERE u.ID = ${jid}
    ORDER by ps.createdDate DESC;
  `;
  let q2 = `
  SELECT
  u.userName , u.userRule , u.userJob , u.userAbout , u.userEmail , u.ID ,
  p.img ,
  c.CV ,
  s.skill
  FROM users u
  LEFT JOIN profilepictures p ON p.userID = u.ID
  LEFT JOIN cvs c ON c.userID = u.ID
  LEFT JOIN skills s on s.userID = u.ID
  WHERE u.ID = ${jid}
  `;
  var values_ = {};
  connection.query(q, (err, result, fields) => {
    if (err) {
      return console.log("Error on connecting1 " + err.message);
    }
    console.log(result);
    result.forEach((element) => {
      // console.log();
      let ror = new Date(element.createdDate);
      element.createdDate = `${ror.getDay()}/${ror.getMonth()}/${ror.getFullYear()}`;
    });
    values_.posts = result;
  });
  connection.query(q2, (err, result, fields) => {
    if (err) {
      return console.log("Error on connecting " + err.message);
    }
    console.log(result);
    values_.ID = result[0].ID;
    values_.userName = result[0].userName;
    values_.userEmail = result[0].userEmail;
    values_.userRule = result[0].userRule;
    values_.userPhoto = result[0].img;
    values_.userCV = result[0].CV;
    values_.userJob = result[0].userJob;
    values_.userAbout = result[0].userAbout;
    console.log(values_);
    if (result[0].skill) {
      values_.userSkills = [];
      for (let index = 0; index < result.length; index++) {
        values_.userSkills.push(result[index].skill);
      }
    }
    try {
      MRes.status(200).render("profile", {
        ID: values_.ID,
        name: values_.userName,
        rule: values_.userRule,
        email: values_.userEmail,
        about: values_.userAbout,
        jobTitle: values_.userJob,
        photo: values_.userPhoto,
        cv: values_.userCV,
        posts: values_.posts,
        skills: values_.userSkills ? values_.userSkills : null,
        view: "admin",
      });
    } catch (error) {
      MRes.redirect("/error");
    }
  });
});

// edit profile

app.post("/editDetails", multer().none(), (MReq, MRes) => {
  if (!MReq.cookies.JID) return MRes.json({ message: "authentication" });
  let skills = MReq.body.skills ? MReq.body.skills.split(",") : null,
    about = MReq.body.about;
  if (skills) {
    let q = `INSERT INTO skills VALUES (NULL, ${MReq.cookies.JID}, ?)`;
    for (let index of skills) {
      connection.query(q, [index], (err, result, fields) => {
        if (err) return console.log("error on insert " + err.message);
      });
    }
  }
  if (about) {
    let qq = `UPDATE users SET userAbout = ? WHERE ID = ${MReq.cookies.JID}`;
    connection.query(qq, [about], (err, result, fields) => {
      if (err) {
        return console.log("error on connecting " + err.message);
      }
    });
  }
  MRes.json({ message: "not done" });
  MRes.end();
});

app.get("/editprofile", (MReq, MRes) => {
  if (!MReq.cookies.JID) return MRes.redirect("/login");
  let jid = MReq.cookies.JID;
  let q = `SELECT * FROM users WHERE ID = ${jid}`;
  let q2 = `SELECT img from profilepictures inner join users on users.ID = profilepictures.userID AND users.ID = ${jid};`;
  let q3 = `SELECT CV from cvs inner join users on users.ID = cvs.userID AND users.ID = ${jid};`;
  var values_ = {};
  connection.query(q, (err, result, fields) => {
    if (err) {
      return console.log("Error on connecting " + err.message);
    }
    values_.userName = result[0].userName;
    values_.userJob = result[0].userJob;
    values_.userEmail = result[0].userEmail;
    values_.userRule = result[0].userRule;
    values_.userAbout = result[0].userAbout;
    console.log(result[0]);
  });
  connection.query(q2, (err, result, fields) => {
    if (err) {
      return console.log("Error on connecting " + err.message);
    }
    console.log(result[0]);
    values_.userPhoto = result[0] ? result[0].img : null;
  });
  connection.query(q3, (err, result, fields) => {
    if (err) {
      return console.log("Error on connecting " + err.message);
    }
    console.log(result[0]);
    values_.userCV = result[0] ? result[0].CV : null;
    console.log(values_);
    MRes.status(200).render("editProfile", {
      name: values_.userName,
      rule: values_.userRule,
      email: values_.userEmail,
      about: values_.userAbout,
      jobTitle: values_.userJob,
      photo: values_.userPhoto,
      cv: values_.userCV,
      posts: "",
    });
  });
});

app.post("/editprofilepic", uploadP.single("profile"), (MReq, MRes) => {
  // console.log(MReq.file.originalname, MReq.file.buffer);
  console.log(MReq.cookies.JID);
  let fileN = encrypt(MReq.file.originalname);
  let q = `DELETE FROM profilepictures WHERE userID = ${MReq.cookies.JID}`;
  connection.query(q, (err, result, fields) => {
    if (err) console.log("error in deleting " + err.message);
    console.log("delete " + MReq.cookies.JID);
  });
  writeFile(
    "./public/uploads/profileP/" + fileN + path.extname(MReq.file.originalname),
    MReq.file.buffer,
    (err) => {
      if (err) console.log("error on file " + err.message);
    }
  );
  let q3 = `INSERT INTO profilepictures VALUES(NULL, ${MReq.cookies.JID} , ? ,  null)`;
  connection.query(
    q3,
    [fileN + path.extname(MReq.file.originalname)],
    (err, result, fields) => {
      if (err) {
        return console.log("error on connecting " + err.message);
      }
      console.log("profile pic saved " + result.insertId);
    }
  );
  console.log(MReq.body, MReq.file);
  MRes.status(200).json({
    message: "done",
    path: "uploads/profileP/" + fileN + path.extname(MReq.file.originalname),
  });
});

app.post("/editCV", uploadP.single("newCV"), (MReq, MRes) => {
  let fileN = encrypt(MReq.file.originalname);
  let q = `DELETE FROM cvs WHERE userID = ${MReq.cookies.JID}`;
  connection.query(q, (err, result, fields) => {
    if (err) console.log("error in deleting " + err.message);
    console.log("delete cv " + MReq.cookies.JID);
  });
  writeFile(
    "./public/uploads/" + fileN + path.extname(MReq.file.originalname),
    MReq.file.buffer,
    (err) => {
      if (err) console.log("error on file " + err.message);
    }
  );
  let q3 = `INSERT INTO cvs VALUES(NULL, ${MReq.cookies.JID} , ? ,  null)`;
  connection.query(
    q3,
    [fileN + path.extname(MReq.file.originalname)],
    (err, result, fields) => {
      if (err) {
        return console.log("error on connecting " + err.message);
      }
      console.log("profile pic saved " + result.insertId);
    }
  );
  console.log(MReq.body, MReq.file);
  MRes.status(200).json({
    message: "done",
  });
});

// view cv

app.get("/cv/:id", (MReq, MRes) => {
  let q = `SELECT cvs.CV FROM cvs INNER JOIN users on users.ID = cvs.userID where users.ID = ${MReq.params.id}`;
  connection.query(q, (err, r) => {
    if (err) return console.log("error on connecting " + err.message);
    try {
      MRes.sendFile(__dirname + "/public/uploads/" + r[0].CV);
    } catch (error) {
      MRes.redirect("/error");
    }
  });
});

// others profile

app.get("/users/:id", (MReq, MRes) => {
  if (MReq.params.id == MReq.cookies.JID) return MRes.redirect("/profile");
  // let q = `
  // SELECT
  // u.* ,
  // p.img , p.createdDate ,
  // cvs.CV , cvs.createdDate ,
  // posts.postContent , posts.createdDate
  // FROM users u
  // INNER JOIN profilepictures p ON p.userID = u.ID
  // INNER JOIN cvs on cvs.userID = u.ID
  // INNER JOIN posts on posts.userID = u.ID
  // INNER JOIN skills on skills.userID = u.ID
  // WHERE u.ID = ${MReq.params.id}
  // `;
  if (isNaN(Number(MReq.params.id))) return;
  console.log(MReq.params.id);
  let q = `
  SELECT
  u.userName , u.userRule ,
  ps.postContent , ps.createdDate
  FROM users u
  LEFT JOIN posts ps ON u.ID = ps.userID 
  WHERE u.ID = ${MReq.params.id}
  ORDER by ps.createdDate DESC
  `;
  let q2 = `
  SELECT
  u.userName , u.userRule , u.userJob , u.userAbout ,
  p.img ,
  c.CV ,
  s.skill
  FROM users u
  LEFT JOIN profilepictures p ON p.userID = u.ID
  LEFT JOIN cvs c ON c.userID = u.ID
  LEFT JOIN skills s on s.userID = u.ID
  WHERE u.ID = ${MReq.params.id}
  `;
  var values_ = {};
  connection.query(q, (err, result, fields) => {
    if (err) {
      return console.log("Error on connecting1 " + err.message);
    }
    result.forEach((element) => {
      let ror = new Date(element.createdDate);
      element.createdDate = `${ror.getDay()}/${ror.getMonth()}/${ror.getFullYear()}`;
    });
    console.log(result);
    values_.posts = result;
  });
  connection.query(q2, (err, result, fields) => {
    if (err) {
      return console.log("Error on connecting " + err.message);
    }
    console.log(result);
    values_.userName = result[0].userName;
    values_.userRule = result[0].userRule;
    values_.userPhoto = result[0].img;
    values_.userCV = result[0].CV;
    values_.userJob = result[0].userJob;
    values_.userAbout = result[0].userAbout;
    if (result[0].skill) {
      values_.userSkills = [];
      for (let index = 0; index < result.length; index++) {
        values_.userSkills.push(result[index].skill);
      }
    }
    try {
      MRes.status(200).render("profile", {
        name: values_.userName,
        rule: values_.userRule,
        about: values_.userAbout,
        jobTitle: values_.userJob,
        photo: values_.userPhoto,
        cv: values_.userCV,
        posts: values_.posts,
        skills: values_.userSkills ? values_.userSkills : null,
        view: "guest",
      });
    } catch (error) {
      MRes.redirect("/error");
    }
  });
});

// add posts

app.get("/createPost", (MReq, MRes) => {
  if (!MReq.cookies.JID) return MRes.redirect("/login");
  MRes.status(200).render("createPost", { type: "post" });
});

app.post("/createPost", multer().none(), (MReq, MRes) => {
  // console.log(MReq.body);
  let { content } = MReq.body;
  let q = `INSERT INTO posts VALUES (null , ${MReq.cookies.JID} , ?  , null)`;
  connection.query(q, [content], (err, result, field) => {
    if (err) return console.log("error on insert " + err.message);
    MRes.status(200).json({ message: "done" });
  });
});

// add job

app.get("/createJob", (MReq, MRes) => {
  if (!MReq.cookies.JID) return MRes.redirect("/login");
  MRes.status(200).render("createPost", { type: "job" });
});

app.post("/createJob", multer().none(), (MReq, MRes) => {
  // console.log(MReq.body);
  let { jobTitle, jobLocation, content } = MReq.body;
  let q = `INSERT INTO jobs VALUES (null , ? , ?  , ?  , ${MReq.cookies.JID} , null)`;
  connection.query(
    q,
    [jobTitle, content, jobLocation ? jobLocation : "online"],
    (err, result, field) => {
      if (err) return console.log("error on insert " + err.message);
      MRes.status(200).json({ message: "done" });
    }
  );
});

// apply for job

app.post("/apply", (MReq, MRes) => {
  console.log(MReq.body);
  let q2 = `SELECT * FROM applications WHERE jobID = ? AND userID = ?`;
  connection.query(q2, [MReq.body.jobID, MReq.body.userID], (err, res, f) => {
    if (res.length > 0) {
      MRes.end();
    }
  });
  let q = `INSERT INTO applications VALUES (NULL, ? , ? , 'bending' , 'false')`;
  connection.query(
    q,
    [MReq.body.jobID, MReq.body.userID],
    (err, result, fields) => {
      if (err) return console.log("error on insert " + err.message);
      MRes.status(200).json({ message: "done" });
    }
  );
});

// display job applications

app.post("/applications", (MReq, MRes) => {
  console.log(MReq.body);
  let q2 = `SELECT a.* , j.title FROM applications a INNER JOIN jobs j on a.jobID = j.ID WHERE a.userID = ?`;
  connection.query(q2, [MReq.body.userID], (err, res, f) => {
    if (res.length > 0) {
      MRes.status(200).json({ applications: res });
    }
    for (let index = 0; index < res.length; index++) {
      const element = res[index].ID;
      console.log(element);
      let q = `UPDATE applications SET feedbackReceived = 'true' WHERE ID = ${element}`;
      connection.query(q, (err2) => {
        if (err2) console.log(err2.message);
      });
    }
  });
});

app.get("/viewJobs", (MReq, MRes) => {
  let q = `
  SELECT
   j.title , j.createdDate , j.ID , COUNT(*) as total
   FROM jobs j 
   INNER JOIN applications a 
   on j.ID = a.jobID
   where j.hrID = ${MReq.cookies.JID}
   GROUP BY j.title , j.createdDate
   `;
  connection.query(q, (err, result, f) => {
    if (err) return console.log("error " + err.message);
    result.forEach((element) => {
      let ror = new Date(element.createdDate);
      element.createdDate = `${ror.getDay()}/${ror.getMonth()}/${ror.getFullYear()}`;
    });
    console.log(result);
    MRes.render("viewJobs", { content: result });
  });
});

app.get("/jobs/Applications/:jobID", (MReq, MRes) => {
  let q = `
  SELECT
   u.userName , u.userEmail , u.userJob,
   a.statue , a.ID
   FROM jobs j 
   INNER JOIN applications a 
   on j.ID = a.jobID
   INNER JOIN users u
   on u.ID = a.userID
   where j.hrID = ${MReq.cookies.JID}
   `;
  connection.query(q, (err, result, f) => {
    if (err) return console.log("error " + err.message);
    console.log(result);
    MRes.render("applicationsDetails", { content: result });
  });
});

app.post("/jobs/Applications/modify/:jobID", multer().none(), (MReq, MRes) => {
  let q =
    MReq.body.type == "reject"
      ? `UPDATE applications SET statue = 'rejected' , feedbackReceived = 'false' WHERE applications.ID = ${MReq.body.oid}`
      : MReq.body.type == "accept"
      ? `UPDATE applications SET statue = 'approved' , feedbackReceived = 'false' WHERE applications.ID = ${MReq.body.oid}`
      : `UPDATE applications SET statue = 'bending' , feedbackReceived = 'false' WHERE applications.ID = ${MReq.body.oid}`;
  connection.query(q, (err, r, f) => {
    if (err) {
      console.log(err.message);
      MRes.status(400).json({ message: "error" });
      return;
    }
    MRes.status(200).json({ message: "done" });
  });
  console.log(MReq.body);
});

// add about

app.get("/about", (MReq, MRes) => {
  if (!MReq.cookies.JID) return MRes.redirect("/login");
  MRes.render("AddAbout", { back: "skip" });
});

app.post("/about", (MReq, MRes) => {
  console.log(MReq.body);
  console.log(MReq.cookies.rule, MReq.cookies.JID);
  let q = `UPDATE users SET userAbout = ? WHERE ID = ${MReq.cookies.JID}`;
  connection.query(q, [MReq.body.about], (err, result, fields) => {
    if (err) {
      return console.log("error on connecting " + err.message);
    }
    console.log("updated successfully");
    MRes.status(200).json({ message: "done" });
  });
});

// search

app.post("/search", (MReq, MRes) => {
  let jid = MReq.cookies.JID;
  let q = `
  SELECT
  u.userName , u.userRule ,
  ps.postContent , ps.createdDate
  FROM users u
  LEFT JOIN posts ps ON u.ID = ps.userID 
  ${
    MReq.body.location == "profile" ? "WHERE u.ID = " + jid + " AND " : "WHERE "
  }
  ps.postContent LIKE '%${MReq.body.content}%'
  ORDER by ps.createdDate DESC
  `;
  connection.query(q, (err, result, fields) => {
    if (err) {
      return console.log("Error on connecting1 " + err.message);
    }
    result.forEach((element) => {
      let ror = new Date(element.createdDate);
      element.createdDate = `${ror.getDay()}/${ror.getMonth()}/${ror.getFullYear()}`;
    });
    console.log(result);
    MRes.status(200).json({ posts: result });
  });
});

// sign up

app.get("/signup", (MReq, MRes) => {
  if (MReq.cookies.JID) {
    cookieSetter(MRes, "JID", MReq.cookies.JID);
    cookieSetter(MRes, "rule", MReq.cookies.rule);
    MRes.redirect("/home");
    MRes.end();
    return;
  }
  MRes.status(200).render("signup");
  MRes.end();
});

app.post("/signup", uploadC.single("cvFile"), (MReq, MRes) => {
  // console.log("12", MReq.file, MReq.body.user);
  // {
  //   fieldname: 'cvFile',
  //   originalname: 'loucas monir william.pdf',
  //   encoding: '7bit',
  //   mimetype: 'application/pdf',
  //   destination: 'uploads/',
  //   filename: 'loucas monir william.pdf',
  //   path: 'uploads\\loucas monir william.pdf',
  //   size: 183613
  // }
  let userName = MReq.body.user,
    userEmail = MReq.body.email,
    userPassword = MReq.body.pass,
    userJob = MReq.body.job,
    userRule = MReq.body.rule;
  if (["hell", "sex", "porn", "fuck"].includes(userName.toLowerCase())) {
    return MRes.status(200).json({ message: "name-invalid" });
  }
  userPassword = encrypt(userPassword);
  let q = `SELECT * FROM users WHERE userEmail = ?`;
  connection.query(q, [userEmail], (err, result, fields) => {
    if (err) {
      console.log("Error on connecting in select " + err.message);
      return;
    }
    if (result.length > 0) {
      MRes.json({ message: "user-exist" });
      // MRes.end();
      return;
    }
    let q2 = `INSERT INTO users VALUES(NULL, ? , ? , ? , ? , ? , null , null)`;
    let values = [
      userName,
      userEmail,
      userPassword,
      userRule,
      userJob,
      null,
      null,
    ];
    connection.query(q2, values, (err, result, fields) => {
      if (err) {
        console.log("Error on connecting" + err.message);
        return;
      }
      if (MReq.file) {
        let fileN = encrypt(MReq.file.originalname);
        writeFile(
          "./public/uploads/" + fileN + path.extname(MReq.file.originalname),
          MReq.file.buffer,
          (err) => {
            if (err) console.log("error in file " + err.message);
          }
        );
        let q3 = `INSERT INTO cvs VALUES(NULL, ${MReq.cookies.JID} , ? , null)`;
        connection.query(q3, [fileN], (err, result, fields) => {
          if (err) {
            return console.log("error on connecting " + err.message);
          }
          console.log("cv saved " + result.insertId);
        });
      }
      cookieSetter(MRes, "JID", result.insertId);
      cookieSetter(MRes, "rule", userRule);
      MRes.json({ message: "user-created" });
      MRes.end();
    });
  });
});

// log in

app.get("/login", (MReq, MRes) => {
  if (MReq.cookies.JID) {
    cookieSetter(MRes, "JID", MReq.cookies.JID);
    cookieSetter(MRes, "rule", MReq.cookies.rule);
    MRes.redirect("/home");
    MRes.end();
    return;
  }
  MRes.status(200).render("login");
  MRes.end();
});

app.post("/login", (MReq, MRes) => {
  let userEmail = MReq.body.email,
    userPassword = MReq.body.password;
  userPassword = encrypt(userPassword);
  const q = "SELECT * FROM users WHERE userEmail = ? AND userPassword = ?";
  connection.query(q, [userEmail, userPassword], (err, result, fields) => {
    if (err) {
      console.log("Error on connecting" + err.message);
      return;
    }
    if (result.length > 0) {
      cookieSetter(MRes, "JID", result[0]["ID"]);
      cookieSetter(MRes, "rule", result[0]["userRule"]);
      MRes.json({ message: "done" });
    } else {
      MRes.status(200).json({ message: "no" });
    }
  });
});

app.use((MReq, MRes) => {
  MRes.status(404).render("errors", {
    title: "url not found",
    header: "404 not found",
    content: "oops:) url not found ",
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
