const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, 'public/images');
    },
    filename:(req,file,cb)=>{
        cb(null, file.originalname);
    }
});

const upload = multer({storage:storage});


// Create MySQL connection
const connection = mysql.createConnection({
host: 'localhost',
user: 'root',
password: '',
database: 'c237_mouseapp'
});
connection.connect((err) => {
if (err) {
console.error('Error connecting to MySQL:', err);
return;
}
console.log('Connected to MySQL database');
});

// Set up view engine
app.set('view engine', 'ejs');
// enable static files
app.use(express.static('public'));

app.use(express.urlencoded({
    extended: false
}));

// Define routes
// Example:
// app.get('/', (req, res) => {
// connection.query('SELECT * FROM TABLE', (error, results) => {
// if (error) throw error;
// res.render('index', { results }); // Render HTML page with data
// });
// });


app.get("/",(req,res)=> {
    connection.query("SELECT * FROM mouse", (error, results) => {
        if (error) throw error;
        res.render("index", {mouse:results});
    });
});


app.get("/mouse/:id", (req,res)=>{
    const mouseId = req.params.id;
    connection.query("SELECT * FROM mouse WHERE mouseId = ?",
    [mouseId], (error, results)=>{
        if (error) throw error;
        if (results.length > 0){
            res.render("mouse",{mouse:results[0]})
        } else{
            res.status(404).send("mouse not found")
        }
    });
});


app.get("/addMouse", (req, res)=>{
    res.render("addMouse");
});

app.post("/addMouse", upload.single('image'), (req, res) => {
    const {name, price, quantity} = req.body;
    let image;
    if (req.file){
        image = req.file.filename;
    } else {
        image = null;
    }

    const sql = "INSERT INTO mouse(mouseName, price, quantity, image) VALUES (?, ?, ?, ?)";
    connection.query(sql, [name, price, quantity, image], (error, results) =>{
        if (error){
            console.error("Error adding mouse", error);
            res.status(500).send("Error adding mouse");
        }else{
            res.redirect("/");
        }
    });
});



app.get("/editMouse/:id", (req,res) => {
    const mouseId = req.params.id;
  
    const sql = "SELECT * FROM mouse WHERE mouseId = ?";
    connection.query(sql, [mouseId], (error, results)=>{
        if (error){
            console.error("Database query error:", error.message);
            return res.status(500).send("Error retrieving mouse");
        }
        if (results.length > 0){
            res.render("editMouse", {mouse: results[0]});
        } else{
            res.status(404).send("Mouse not found");
        }
    });
})

app.post("/editMouse/:id", upload.single('image'), (req,res) => {
    const mouseId = req.params.id;
    const {name, price, quantity} = req.body;
   let image = req.body.currentImage;
   if (req.file){
    image = req.file.filename;
   }

    const sql = 'UPDATE mouse SET mouseName=?, price=?, quantity=?, image = ? WHERE mouseId= ?';
    connection.query(sql, [name, price, quantity, image, mouseId], (error, results)=>{
        if (error){
            console.error("Database query error:", error.message);
            return res.status(500).send("Error retrieving mouse");
        }else{
            res.redirect("/");
        }
    });
})


app.get("/deleteMouse/:id", (req,res) => {
    const mouseId = req.params.id;
  
    const sql = "DELETE FROM mouse WHERE mouseId = ?";
    connection.query(sql, [mouseId], (error, results)=>{
        if (error){
            console.error("Error deleting mouse:", error);
            res.status(500).send("Error deleting mouse");
        
        }else{
            res.redirect('/');
        }
    });
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));