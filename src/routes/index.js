const { Router } = require('express');
const admin = require('firebase-admin');
const firebase = require('firebase');
//const firebaseApp = require('../fire-connect');
//const storage = require('@google-cloud/storage');
const fs = require('fs');
const router = Router();
let serviceAccount = require("./doctor-caps-firebase-adminsdk-btq53-e0b82600b8.json");

//import * as firebase from 'firebase';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "doctor-caps.appspot.com"
});

const db = admin.firestore();

/*
const bucketName = 'pepito';
const storage = new Storage();

async function createBucket() {
    // Creates the new bucket
    await storage.createBucket(bucketName);
    console.log(`Bucket ${bucketName} created.`);
}
createBucket().catch(console.error);
*/

// INICIO -> VENTAS
router.get('/', (req, res) => {
    res.redirect('/sales');
});

// VENTAS
router.get('/sales', (req, res) => {
    const sales = [];
    db.collection('pedidos').get()
    .then((snapshot) => {
        snapshot.forEach((doc) => {
            //data.push(doc.data());
            sales[doc.id] = doc.data();
        });
        console.log(sales);
        //res.send("Sales");
        res.render('sales', {title:'Ventas', pedidos:sales });
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    }); 
});

// CATALOGO LISTAR
router.get('/catalog', (req, res) => {
    const data = [];
    db.collection('catalogo').get()
    .then((snapshot) => {
        snapshot.forEach((doc) => {
            let idn = doc.id;
            let cantidad = 0;

            for(let i=0 ; i < doc.data().cantidad.length ; i++){
                cantidad += doc.data().cantidad[i];
            }

            var data_temp = JSON.parse('{"id":"' + idn + '","activo":' + doc.data().activo + ',"modelo":"' + doc.data().modelo + '","categoria":"' + doc.data().categoria + '","marca":"' + doc.data().marca + '","tipo":"' + doc.data().tipo + '","precio":' + doc.data().precio + ',"oferta":' + doc.data().oferta + ',"cantidad":' + cantidad + '}');
            data.push(data_temp);
        });
        res.render('catalog', {title:'Catalogo', catalogo:data });
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
});
// CATALOGO EDITAR
router.post('/edit-catalog', (req, res) => {

    // INICIO SUBIDA IMAGEN AL STORAGE
    var base64str = base64_encode(req.files.imagen1.tempFilePath);
    let ref = firebase.storage().ref("Catalogo/DemoXXX").child("123456789"); //`Catalogo/${codigo}`

    ref.putString(base64str, 'base64').then(function(snapshot) {
        console.log('Uploaded a base64 string!');
    });
    
    console.log("base64str: ", base64str);
    // TERMINO SUBIDA IMAGEN AL STORAGE    

    let codigo = req.body.codigo;
    if(codigo == ""){
        let azar = parseInt((Math.random() * 899) + 100);
        codigo = "cap-" + req.body.categoria.toLowerCase() + "-" + azar;
    }
    let docRef = db.collection('catalogo').doc(codigo);
    let precio = parseInt(req.body.precio);
    let oferta = 0;    

    if(req.body.oferta != "") oferta = parseInt(req.body.oferta);

    let sizes = [parseFloat(req.body.size1)];
    let cants = [parseInt(req.body.cant1)];

    if(req.body.size2 != ""){
        sizes.push(parseFloat(req.body.size2));
        cants.push(parseInt(req.body.cant2));
    }
    if(req.body.size3 != ""){
        sizes.push(parseFloat(req.body.size3));
        cants.push(parseInt(req.body.cant3));
    }
    if(req.body.size4 != ""){
        sizes.push(parseFloat(req.body.size4));
        cants.push(parseInt(req.body.cant4));
    }
    if(req.body.size5 != ""){
        sizes.push(parseFloat(req.body.size5));
        cants.push(parseInt(req.body.cant5));
    }
    if(req.body.size6 != ""){
        sizes.push(parseFloat(req.body.size6));
        cants.push(parseInt(req.body.cant6));
    }

    const newCatalog = {
        activo: parseInt(req.body.visibilidad),
        cantidad: cants,
        categoria: req.body.categoria,        
        coleccion: req.body.coleccion.toUpperCase(),
        color: req.body.color,
        descripcion: req.body.descripcion.toUpperCase(),
        marca: req.body.marca.toUpperCase(),
        medidas: sizes,
        modelo: req.body.modelo.toUpperCase(),
        precio: precio,
        oferta: oferta,
        registro: admin.firestore.Timestamp.fromDate(new Date()),
        tipo: req.body.tipo        
    }
    console.log(newCatalog);
    let setAda = docRef.set(newCatalog);
    res.redirect('/catalog');
});
// CATALOGO ELIMINAR
router.get('/delete-catalog/:codigo', (req, res) => {
    let deleteDoc = db.collection('catalogo').doc(req.params.codigo).delete();
    res.redirect('/catalog');
});

// NOTICIAS

// USUARIOS LISTAR
router.get('/users', (req, res) => {
    const data = [];
    db.collection('usuarios').get()
    .then((snapshot) => {
        snapshot.forEach((doc) => {
            data.push(doc.data());
        });
        res.render('users', {title:'Usuarios', usuarios:data });
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
});
// USUARIOS EDITAR
router.post('/new-user', (req, res) => {
    const meses = ["","January", "February", "March", "April" , "May", "June", "July", "August", "September", "October", "November", "December"];
    let saveDate = 'January 1, 2000';

    if( (req.body.fech_dia != "") || (req.body.fech_mes != "") || (req.body.fech_anno != "") ){
        saveDate = meses[req.body.fech_mes] + " " + req.body.fech_dia + ", " + req.body.fech_anno;
        console.log(saveDate);
    } 

    let email = req.body.email.toLowerCase();
    let docRef = db.collection('usuarios').doc(email);

    const newContact = {
        activo: parseInt(req.body.visibilidad),
        uid: '',
        direccion: [req.body.dir_calle.toUpperCase(),req.body.dir_num_ext.toUpperCase(),req.body.dir_num_int.toUpperCase(),req.body.dir_fracc.toUpperCase(),req.body.dir_ciudad.toUpperCase(),req.body.dir_estado.toUpperCase(),req.body.dir_cp],
        nombre: [req.body.nombre.toUpperCase(), req.body.apellido1.toUpperCase(), req.body.apellido2.toUpperCase()],
        email: email,
        fecha_nac: admin.firestore.Timestamp.fromDate(new Date(saveDate)),
        fecha_registro: admin.firestore.Timestamp.fromDate(new Date()),
        telefono: req.body.telefono,
        genero: req.body.genero,
        password: '',
        ramdom: 100000,
        recompensa: 0
    }
    console.log(newContact);
    let setAda = docRef.set(newContact);
    res.redirect('/users');
});
// USUARIOS ELIMINAR
router.get('/delete-user/:email', (req, res) => {
    let deleteDoc = db.collection('usuarios').doc(req.params.email).delete();
    res.redirect('/users');
});

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

module.exports = router;