const express = require("express")
const router = express.Router()
const moongose = require("mongoose")
require("../models/Categoria")
const Categoria = moongose.model("categoria")
require("../models/Postagem")
const Postagem = moongose.model("postagem")

// CATEGORIA
router.get('/',(req,res) => {
  res.render("admin/index")
})
router.get('/post',(req,res) => {
    res.send("Pagina Post")
})
router.get('/categoria',(req,res) =>{
  Categoria.find().then((categorias => {
    res.render('admin/categoria', {categorias: categorias.map(categorias => categorias.toJSON())})
  })).catch((err)=> {
    req.flash('error_msg','Houve um erro')
    res.redirect("admin/categoria")
  })
})
router.get('/categoria/add',(req,res) =>{
  res.render("admin/addCategoria")
})
router.post('/categoria/nova', (req,res) =>{

  var erros = []

  if(!req.body.nome || req.body.nome == undefined || req.body.nome == null ){
    erros.push({texto: "Acrecente um no campo nome"})
  } 
  if (req.body.nome.length < 2 ) {
    erros.push({texto: "Informe um nome com mais de 3 caracteres"})
  }
  if(!req.body.slug || req.body.slug == undefined || req.body.slug == null ){
    erros.push({texto: "Acrecente um valor no campo slug"})
  }
  if (erros.length > 0 ){
    res.render("admin/addCategoria", {erros: erros})
  }else {
      const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
      }
      new Categoria(novaCategoria).save().then(()=>{
        res.redirect("/admin/categoria")
      }).catch((err)=> {
        console.log("Houve erro para cadastrar no categoria" + err)
      })
    }
})

router.get('/categoria/edit/:id',(req,res) => {
  Categoria.findOne({_id: req.params.id}).lean().then((categoria) =>{
    res.render('admin/editCategoria', {categoria: categoria})
  }).catch((err) =>{
    req.flash("error_msg","Houve um erro")
    res.redirect('/admin/categoria')
  })
})

router.post('/categoria/edit',(req,res) =>{

    let filter = { _id: req.body.id }
    let update = { nome: req.body.nome, slug: req.body.slug }
  
  Categoria.findOneAndUpdate(filter, update).then(() => {
    req.flash("success_msg", "Categoria atualizada")
    res.redirect('/admin/categoria')
  }).catch(err => {
      req.flash("error_msg", "Erro ao atualizar categoria")
  })
})

router.post('/categoria/deletar', (req,res)=>{
  Categoria.deleteOne({_id : req.body.id}).then(()=>{
    req.flash("success_msg", "Categoria removida com sucesso")
    res.redirect('/admin/categoria')
  }).catch((err)=>{
    req.flash("error_msg", "Erro ao deletar categoria")
    res.redirect('/admin/categoria')
  })
})


//POSTAGEM

router.get('/postagem', (req,res) =>{
  Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagem) =>{
    res.render('admin/postagem', {postagem: postagem})
  }).catch((err) =>{
    req.flash("error_msg", "Erro ao buscar postagem" + err)
    res.redirect('/admin')
  })

})

router.get('/postagem/add',(req,res)=>{
  Categoria.find().lean().then((categoria)=>{
    res.render('admin/addPostagem', {categoria: categoria})
  }).catch((err) =>{
    req.flash("error_msg", "Erro ao buscar postagem" + err)
    res.redirect('/admin')
  })
 
})

router.post('/postagem/nova', (req,res) =>{
  var erros = []

  if(req.body.categoria == 0){
    erros.push({texto: "Informe uma categoria"})
  }

  if (erros.length > 0 ){
    res.render("admin/addPostagem", {erros: erros})
  }else {

    const NovaPostagem = {
      titulo : req.body.titulo,
      slug : req.body.slug,
      descricao: req.body.descricao,
      conteudo : req.body.conteudo,
      categoria : req.body.categoria
    }
    new Postagem(NovaPostagem).save().then(() =>{
      req.flash("success_msg","Postagem criada com sucesso")
      res.redirect('/admin/postagem')
    }).catch(()=>{
      req.flash("error_msg","Houve um erro na criação da postagem")
      res.redirect('/admin/postagem')
    })
  }
})

router.get("/postagem/edit/:id", (req, res) =>{
  Postagem.findOne({_id: req.params.id}).lean().then((postagem) =>{
      Categoria.find().lean().then((categoria) => {
          res.render("admin/editPostagem", {categoria: categoria, postagem: postagem})
      }).catch((err)=>{
          req.flash("error_msg", "Houve um erro ao listar as categorias")
          res.redirect("/admin/postagem")
      })
  }).catch((err)=>{
      req.flash("error_msg", "Houve um erro ao carregar o formulario de edição")
      res.redirect("/admin/postagem")
  })
})

router.post('/postagem/edit',(req,res) =>{

  Postagem.findOne({_id: req.body.id}).then((postagem) =>{
    postagem.titulo = req.body.titulo,
    postagem.slug = req.body.slug,
    postagem.descricao = req.body.descricao,
    postagem.conteudo = req.body.conteudo,
    postagem.categoria = req.body.categoria

    postagem.save().then(()=>{
      req.flash("success_msg", "Postagem editada com sucesso!")
      res.redirect("/admin/postagem")
    })
  }).catch((err)=>{
    req.flash("error_msg", "Houve um erro ao editar postagem")
    res.redirect("/admin/postagem")
  })
})

router.post('/postagem/deletar', (req,res)=>{
  Postagem.deleteOne({_id : req.body.id}).then(()=>{
    req.flash("success_msg", "Postagem removida com sucesso")
    res.redirect('/admin/postagem')
  }).catch((err)=>{
    req.flash("error_msg", "Erro ao deletar postagem")
    res.redirect('/admin/postagem')
  })
})


module.exports = router