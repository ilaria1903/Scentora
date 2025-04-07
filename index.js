const express= require("express");
const path=require("path");
const fs = require("fs");
const sharp=require("sharp");
app= express();
obGlobal={obErori:null}

const paginiValide = ["index", "despre", "contact", "parfumuri", "recenzii", "branduri", "cautare"];


app.use("/css", express.static(path.join(__dirname, 'css')));


app.set('views', __dirname + '/views');


app.set('view engine', 'ejs');


function initErori(){
  let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
  
  obGlobal.obErori=JSON.parse(continut)
  
  obGlobal.obErori.eroare_default.imagine=path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)
  for (let eroare of obGlobal.obErori.info_erori){
      eroare.imagine=path.join(obGlobal.obErori.cale_baza, eroare.imagine)
  }
  console.log(obGlobal.obErori)

}



initErori()

function afisareEroare(res, identificator, titlu, text, imagine){
  let eroare= obGlobal.obErori.info_erori.find(function(elem){ 
                      return elem.identificator==identificator
                  });
  if(eroare){
      if(eroare.status)
          res.status(identificator)
      var titluCustom=titlu || eroare.titlu;
      var textCustom=text || eroare.text;
      var imagineCustom=imagine || eroare.imagine;


  }
  else{
      var err=obGlobal.obErori.eroare_default
      var titluCustom=titlu || err.titlu;
      var textCustom=text || err.text;
      var imagineCustom=imagine || err.imagine;


  }
  res.render("pagini/eroare", { //transmit obiectul locals
      titlu: titluCustom,
      text: textCustom,
      imagine: imagineCustom
})

}



console.log("Calea proiectului", __dirname);

app.use('/resurse/imagini', express.static(path.join(__dirname, 'resurse/imagini')));


app.use("/resurse", express.static(path.join(__dirname, "resurse")))
app.get(['/', "/index", "/home"], (req, res) => {
    res.render('pagini/index');
  });

 // app.get("/index/a", function(req, res)
 // {res.render("pagini/index");})

 app.get("/despre", function(req, res)
 {res.render("pagini/despre");})

app.get("/cerere", function(req, res)
{res.send("<p style='color:blue'>Buna seara!</p>");})

app.get("/fisier", function(req, res)
{res.sendile(path.join(__dirname+"/"+"package.json"))})




app.get("/abc", function(req, res, next)
{res.write((new Date())+"");
    res.end()
})



app.get("/*", (req, res) => {
  const cale = req.path;
  const numePagina = cale.substring(1); // ex: 'despre' din '/despre'

  const caleFisier = path.join(__dirname, "views", "pagini", `${numePagina}.ejs`);

  res.render(`pagini/${numePagina}`, (err, rezultatRandare) => {
    if (err) {
      if (err.message.startsWith("Failed to lookup view")) {
        res.status(404).render("pagini/404");
      } else {
        res.status(500).render("pagini/eroare_generica", { eroare: err.message });
      }
    } else {
      res.send(rezultatRandare);
    }
  });
});

app.listen(8080, () => {
    console.log('Serverul rulează pe portul 8080');
  });



fs.readdir(path.join(__dirname, 'css'), (err, files) => {
    if (err) return console.log("Eroare la citirea folderului CSS:", err);
    console.log(" Fișiere găsite în folderul css:", files);
});