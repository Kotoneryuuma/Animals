var express = require('express');
var app = express();
var session = require('express-session');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/db_animals');

var AnimalSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 2},
    age: { type: Number, required: true, min: 1, max: 150 }
}, {timestamps: true });

app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.model('Animal', AnimalSchema); 
var Animal = mongoose.model('Animal')

var path = require('path');
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');


app.get('/', function(req, res) {
    Animal.find({}, function(err, animals) {
        // console.log(animals)
        res.render('dashboard',{ animals: animals});
    })
})


// #Add new animal
const flash = require('express-flash');
app.use(flash());
app.post('/process', function(req, res) {
    console.log("POST DATA", req.body);
    var animal = new Animal({name: req.body.name, age: req.body.age});
    animal.save(function(err) {
        if(err) {
            console.log('something went wrong',err);
            for(var key in err.errors){
                req.flash('registration', err.errors[key].message);
            }
            res.redirect('/new');
        } else { 
            console.log('successfully added your mongoose!');
            req.session.name = req.body.name;
            req.session.age = req.body.age;
            res.redirect('/');
        }
        
    })
})

app.get('/new', function(req, res) {
    Animal.find({}, function(err, animals) {
        console.log(animals)
        res.render('new',{ animals: animals});
        // res.render('new',animals); both work
        // res.render('new',{animals}); borth work
    })
})






app.get('/info/:id', function(req, res) {
    Animal.findById(req.params.id, function(err, animals) {
        // console.log(req.params.id)
        res.render('show',{data: animals});
    })
})

app.post('/edit/:id', function(req, res) {
    Animal.findById(req.params.id, function(err, animals) {
        // console.log(req.params.id)
        // req.params.name doesn;t work
        res.render('edit',{data: animals});
    })
})


app.post('/edit/process/:id', function(req, res) {
    Animal.findByIdAndUpdate (req.params.id, {
        name : req.body.name ,
        age : req.body.number
    }, function(err, animals){
        // console.log("HIHIHIHIH      " +animals.id)
        res.redirect('/')
    })
})


app.post('/destroy/:id', function(req, res) {
    Animal.findByIdAndDelete(req.params.id, function(err){
        res.redirect ( '/' );
        
    })
})











app.listen(8000, function() {
    console.log("listening on port 8000");
})
