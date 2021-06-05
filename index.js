const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
require('dotenv').config();




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bfykj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('faculty.json'));
app.use(fileUpload());

app.get('/', (req, res) => {

    res.sendFile(__dirname + "/index.html");

})




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  // console.log(err);
  //databases
  const studentInfoCollection = client.db("eceAcademicWebsite").collection("studentInfo");
  const noticeCollection = client.db("eceAcademicWebsite").collection("noticeBoard");
  const facultyCollection = client.db("eceAcademicWebsite").collection("facultyMembers");
  const classTestCollection = client.db("eceAcademicWebsite").collection("classTest");
  const labMarksCollection = client.db("eceAcademicWebsite").collection("labTask");


/////////////////////posting into DB

  //student information insertion into the database
  //collection.insertOne
  app.post("/addStudentInfo", (req, res) => {
    const studentInfo = req.body;
    studentInfoCollection.insertOne(studentInfo)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })

  //notice insertion to DB
  app.post("/addNotice", (req, res) => {
    const notice = req.body;
    noticeCollection.insertOne(notice)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })

  //faculty member adding to database
  app.post('/addFaculty', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const designation = req.body.designation;
    const mobile = req.body.mobile;
    const facebook = req.body.facebook;
    const linkedIn = req.body.linkedIn;
    //console.log(file, name, email, designation, address, mobile);
    const filePath = `${__dirname}/faculty/${file.name}`;
    file.mv(filePath, err => {
      if(err){
        console.log(err);
        res.status(500).send({msg: 'Failed to upload image'});
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');
      var image = {
        contentType: req.files.file.mimetype,
        size: req.files.file.size,
        img: Buffer.from(encImg, 'base64')
      };
      facultyCollection.insertOne({name, email, designation, mobile, image, facebook, linkedIn})
      .then(result => {
        fs.remove(filePath, error => {
          if (error){
            console.log(error);
            res.status(500).send({msg: 'Failed to upload image'});
          }
          res.send(result.insertedCount > 0);
        })
        
      })
      //return res.send({name: file.name, path: '/${file.name}'})
    })
    
  })

  //CT MARKS ADDING TO DATABASE
  app.post("/addClassTestMark", (req, res) => {
    const classTest = req.body;
    classTestCollection.insertOne(classTest)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })

  //LAB MARKS ADDING TO DATABASE
  app.post("/addLabMark", (req, res) => {
    const lab = req.body;
    labMarksCollection.insertOne(lab)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })


//////////////////////reading from database //////////////////


  //student information reading and showing in the UI
  app.get('/showStudentInfo',(req, res) => {
    studentInfoCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
    })
  })

  //notice reading and showing in the UI
  app.get('/showNotice',(req, res) => {
    noticeCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
    })
  })

  //faculty members reading and showing in the UI
  app.get('/showFaculty', (req, res) => {
        facultyCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
  });

  //CT MARKS READING AND SHOWING IN THE UI
  app.get('/showClassTestMarks', (req, res) => {
    classTestCollection.find({})
    .toArray((err, documents) => {
        res.send(documents);
    })
  });

  //LAB MARKS READING AND SHOWING IN THE UI
  app.get('/showLabMarks', (req, res) => {
    labMarksCollection.find({})
    .toArray((err, documents) => {
        res.send(documents);
    })
  });

  //LOGIN THROUGH STUDENT OR TEACHERS
  app.get('/loginTeacher', (req, res) => {
    facultyCollection.find({})
    .toArray((err, documents) => {
        res.send(documents);
    })
  });
  app.get('/loginStudent', (req, res) => {
    studentInfoCollection.find({})
    .toArray((err, documents) => {
        res.send(documents);
    })
  });


});


app.listen(5000, () => console.log('Listening to port 5000'));