// Cerință: Se va crea în rădăcina proiectului un fișier index.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const sass=require("sass");
//const pg=require("pg");

//Postgres
//const Client=pg.Client;

//client=new Client({
   // database:"proiectw",
  //  user:"Alexia",
  //  password:"Alexia",
  //  host:"localhost",
   // port:5432
//})

//client.connect()
//client.query("select * from prajituri", function(err, rezultat ){
  //  console.log(err)    
//    console.log(rezultat)
//})
//client.query("select * from unnest(enum_range(null::categ_prajitura))", function(err, rezultat ){
   // console.log(err)    
 //   console.log(rezultat)
//})

// Cerință: Se va crea un obiect server express care va asculta pe portul 8080
app = express();
app.set('trust proxy', true);

// Cerință: Se va crea o variabilă globală numită obGlobal
obGlobal = { obErori: null,
    folderScss:path.join(__dirname,"resurse/scss"),
    folderCss:path.join(__dirname,"resurse/scss"),
    folderBackup:path.join(__dirname, "backup")

 };

// Cerință: Vector cu numele folderelor generate de aplicație
const paginiValide = ["index", "despre", "contact", "parfumuri", "recenzii", "branduri", "cautare"];
vect_foldere = ["temp", "backup", "temp1"];
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
    }
}

// Cerință: Definirea folderelor statice pentru resurse (css, imagini, video etc.)
app.use("/css", express.static(path.join(__dirname, 'css')));
app.use('/resurse/imagini', express.static(path.join(__dirname, 'resurse/imagini')));
app.use("/resurse", express.static(path.join(__dirname, "resurse")));
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));

// Cerință: Se va folosi EJS pentru randarea paginilor
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');




function compileazaScss(caleScss, caleCss){
    console.log("Compilare SCSS pentru:", caleScss);
    if(!caleCss){
        let numeFisExt=path.basename(caleScss);
        let numeFis=numeFisExt.split(".")[0];
        caleCss=numeFis+".css";
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss );
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss );

    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true});
    }

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss));
    }
    rez=sass.compile(caleScss, {"sourceMap":true, loadPaths: ["node_modules"]});
    fs.writeFileSync(caleCss, rez.css);
    console.log("Compilare SCSS reușită pentru:", caleCss);
}

//compileazaScss("a.scss");
//vectorul de nume de fisiere
vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    //ne da extensia din numeFis
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    console.log(eveniment, numeFis);
    if (numeFis && (eveniment=="change" || eveniment=="rename")){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})









// Cerință t4: Se va crea o funcție initErori care citește fișierul erori.json
function initErori() {
    let continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json")).toString("utf-8");
    obGlobal.obErori = JSON.parse(continut);

    // Se setează calea absolută pentru imaginile de eroare
    obGlobal.obErori.eroare_default.imagine = path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine);
    for (let eroare of obGlobal.obErori.info_erori) {
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine);
    }
    console.log(obGlobal.obErori);
}
initErori();

// Cerință t4: Se va crea o funcție de afișare a erorilor afișareEroare()
function afisareEroare(res, identificator, titlu, text, imagine) {
    let eroare = null;
    if (identificator !== undefined && identificator !== null) {
        eroare = obGlobal.obErori.info_erori.find(function (elem) {
            return elem.identificator == identificator
        });
    }

    if (eroare) {
        if (eroare.status)
            res.status(identificator);
        var titluCustom = titlu || eroare.titlu;
        var textCustom = text || eroare.text;
        var imagineCustom = imagine || eroare.imagine;
    } else {
        var err = obGlobal.obErori.eroare_default;
        var titluCustom = titlu || err.titlu;
        var textCustom = text || err.text;
        var imagineCustom = imagine || err.imagine;
    }

    // Cerință: Se va folosi eroare.ejs pentru randarea paginii de eroare
    res.locals.titlu = titluCustom;
    res.locals.text = textCustom;
    res.locals.imagine = imagineCustom;
    
    res.render("pagini/eroare");
}

// Cerință: Afișarea căii fișierului, folderului, etc.
console.log("Calea proiectului (dirname):", __dirname);
console.log("Calea fișierului (filename):", __filename);
console.log("Directorul curent de lucru (process.cwd()):", process.cwd());

// Cerință: Servirea faviconului cu sendFile
app.get("/favicon.ico", function (req, res) {
    res.sendFile(path.join(__dirname, "resurse/imagini/favicon/favicon.ico"));
});

// Cerință 8 si 16(ip ut): Prima pagină (index) trebuie să se poată accesa cu /, /index, /home
app.get(['/', "/index", "/home"], (req, res) => {
    res.render('pagini/index', { ip: req.ip });
});

// Cerință: Pagină suplimentară accesibilă prin meniu
app.get("/despre", function (req, res) {
    res.render("pagini/despre");
});

// Test GET simplu
app.get("/cerere", function (req, res) {
    res.send("<p style='color:blue'>Buna seara!</p>");
});

// Cerință: Trimitere fișier la cerere
app.get("/fisier", function (req, res) {
    res.sendFile(path.join(__dirname + "/" + "package.json"));
});

// Alt test de cerere
app.get("/abc", function (req, res, next) {
    res.write((new Date()) + "");
    res.end();
});


//app.get produse


// Cerință: Eroare 403 dacă se accesează direct o cale din /resurse fără fișier
app.get(/^\/resurse\/[a-zA-Z0-9_\/]*$/, function (req, res, next) {
    afisareEroare(res, 403);
});

// Cerință: Eroare 400 dacă se accesează un fișier .ejs
app.get("/*.ejs", function (req, res, next) {
    afisareEroare(res, 400);
});

// Cerință: Ultimul app.get("/*") pentru pagini dinamice
app.get("/*", function (req, res, next) {
    try {
        res.render("pagini" + req.url, function (err, rezultatRandare) {
            if (err) {
                // Cerință: Dacă eroarea începe cu "Failed to lookup view", se afișează eroare 404
                if (err.message.startsWith("Failed to lookup view")) {
                    afisareEroare(res, 404);
                } else {
                    afisareEroare(res);
                }
            } else {
                res.send(rezultatRandare);
            }
        });
    }
    catch (errRandare) {
        if (errRandare.message.startsWith("Cannot find module")) {
            afisareEroare(res, 404);
        }
        else {
            afisareEroare(res);
        }
    }
});

// Cerință: Serverul ascultă pe portul 8080
app.listen(8080, () => {
    console.log('Serverul rulează pe portul 8080');
});

// Afișare fișiere css la pornire (nu e cerință, dar util)
fs.readdir(path.join(__dirname, 'css'), (err, files) => {
    if (err) return console.log("Eroare la citirea folderului CSS:", err);
    console.log("Fișiere găsite în folderul css:", files);
});
