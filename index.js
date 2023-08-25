import express from "express";
import bodyParser from "body-parser";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday","Thursday","Friday","Saturday"];
const monthNames = ["January", "February", "March", "April","May","June","July","August", "September", "October", "November","December"];
const app = express();
const port = 3000;
var todoList = ["Bring lighter fluid"];
var worktodoList = []

var date = new Date();
var dayOfWeek = dayNames[date.getDay()];
var dayOfMonth = date.getDate();
var month = monthNames[date.getMonth()];
var timestamp = dayOfWeek + ", " + month + " " + dayOfMonth;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index.ejs", 
    {worktodoList:worktodoList, todoList:todoList, timestamp:timestamp})
});

app.post("/submitHome", (req,res) => {
    console.log(req.body)
    var newItem = req.body["addList"];
    todoList.push(newItem);
    res.render("index.ejs", 
    {worktodoList:worktodoList, todoList:todoList, timestamp:timestamp})
})

app.post("/clearHome", (req,res) =>{
    todoList = [];
    res.render("index.ejs",
    {worktodoList:worktodoList, todoList:todoList, timestamp:timestamp}
    )
})

app.get("/work", (req, res) => {
    res.render("work.ejs", 
    {worktodoList:worktodoList, todoList:todoList, timestamp:timestamp})
});

app.post("/submitWork", (req,res) => {
    console.log(req.body)
    var newItem = req.body["addList"];
    worktodoList.push(newItem);
    res.render("work.ejs", 
    {worktodoList:worktodoList, todoList:todoList, timestamp:timestamp})
})

app.post("/clearWork", (req,res) =>{
    worktodoList = [];
    res.render("work.ejs",
    {worktodoList:worktodoList, todoList:todoList, timestamp:timestamp})
})

app.listen(port,() =>{
    console.log(`Server is active on port ${port}.`);
})