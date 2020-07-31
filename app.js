const express = require("express")
const app = express()
const handlebars = require('express-handlebars')
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const admin = require('./routes/admin')
const path = require('path')
const session = require('express-session');
const flash = require('connect-flash');
require('./models/Postagem')
const Postagem = mongoose.model("postagem")
require('./models/Categoria')
const Categoria = mongoose.model("categoria")
const usuario = require('./routes/usuario')


// Configuração 

    app.use(session({
        secret: 'cursodenode',
        resave: true,
        saveUninitialized: true
    }));
    app.use(flash());
    // Middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg');
        res.locals.error_msg = req.flash('error_msg');

        next();
    });

    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout: "main" }))
        app.set('view engine', 'handlebars')
    // BD
        mongoose.Promise = global.Promise
        mongoose.connect('mongodb://localhost/blogapp', {useNewUrlParser: true, useUnifiedTopology: true  }).then(() =>{
            console.log("MongoDB Conectado...")
        }).catch((err)=> {
            console.log("Houve um error" + err)
        })
    // Public
        app.use(express.static(path.join(__dirname,'public')))

// Routes
    app.get('/', (req, res)=>{
            Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagem)=>{
            res.render("index", {postagem: postagem})
        }).catch((err)=>{
            req.flash("error_msg", "houve um erro ao lista na pag. inicial" + err)
            res.redirect("/404")
        })
    })
    app.get('/404', (res,req)=>{
        res.send('Erro')
    })

    app.get('/postagem/:slug', (req,res) => {
        var slug = req.params.slug
        Postagem.findOne({slug}).then(postagem => {
            if(postagem){
                var post = {
                    titulo: postagem.titulo,
                    data: postagem.data,
                    conteudo: postagem.conteudo
                }
                res.render('postagem/index', post)
                }else{
                    req.flash("error_msg", "Essa postagem nao existe")
                    res.redirect("/")
                }
            }).catch(err => {
                req.flash("error_msg", "Houve um erro interno"+err)
                res.redirect("/")
        })
    })
    
    app.get('/categoria', (req,res) =>{
        Categoria.find().lean().then((categoria) =>{
            res.render('categoria/index', {categoria: categoria})
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro interno"+err)
            res.redirect("/")
        })
    })

    app.get('/categoria/:slug', (req,res) =>{
        var slug = req.params.slug
        Categoria.findOne({slug}).lean().then(categoria => {
            if(categoria){
                Postagem.find({categoria:categoria._id}).lean().then((postagem)=>{
                    res.render("categoria/postagem", {postagem:postagem , categoria: categoria})
                })
                }else{
                    req.flash("error_msg", "Essa postagem nao existe")
                    res.redirect("/")
                }
            }).catch(err => {
                req.flash("error_msg", "Houve um erro interno"+err)
                res.redirect("/")
        })
    })
    app.use('/admin',admin)
    app.use('/usuario', usuario)


// Server
const Port = 8081
app.listen(Port, function(){
    console.log("Servido conectado na url http://localhost:8081")
})
