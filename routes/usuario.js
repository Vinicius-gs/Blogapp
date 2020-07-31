const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
mongoose.model("usuario")
const bcrypt = require('bcrypt')


router.get("/registro", (req,res)=>{
    res.render("usuario/registro")
})

router.post("/registro", (req,res) =>{

    var erros =[]

    if(req.body.nome == null || req.body.nome == undefined || !req.body.nome ){
        erros.push({texto: "Nome inválido"})
    }

    if(req.body.email == null || req.body.email == undefined || !req.body.email ){
        erros.push({texto: "E-mail inválido"})
    }
    if(req.body.password == null || req.body.password == undefined || !req.body.password ){
        erros.push({texto: "Senha inválido"})
    }
    if(req.body.password.length < 4){
        erros.push({texto: "Senha muito curta. Sua senha deve conter no minimo 5 caracteres"})
    }
    if(req.body.password != req.body.password2){
        erros.push({texto: "As senhas são diferentes. Tente novamente!"})
    }

    if(erros.length > 0){
        res.render('usuario/registro', {erros: erros})
    }else{
        Usuario.findOne({email: req.body.email}).lean().then((usuario)=>{
            if(usuario){
                res.flash("error_msg", "Esse e-mail já esta cadastrado no sistema.")
                res.redirect("/usuario/registro")      
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    password: req.body.password
                })

                bcrypt.genSalt(10,(err,salt) =>{   
                    bcrypt.hash ( novoUsuario.password , salt ,( err , hash ) => {   
                        if(erros){
                            res.flash("error_msg", "Houve um erro tente novamente.")
                            res.redirect("/")
                        }else{
                            novoUsuario.password = hash
                            novoUsuario.save().then(()=>{
                                res.flash("success_msg", "Usuario cadastrado com sucesso.")
                                res.redirect("/")
                            }).catch((err)=>{
                                res.flash("error_msg", "Houve um erro tente novamente."+ err)
                                res.redirect("/usuario/registro")
                            })
                        }
                    })
                }) 
            }
        }).catch((err)=>{
            res.flash("error_msg", "Houve um error interno, tente novamente")
            res.redirect("/")
        })
    }
})

module.exports = router