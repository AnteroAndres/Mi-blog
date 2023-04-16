const {conexion} = require("./database/conexion");
const express = require("express");
const cors = require("cors");
//Inicializar app
console.log("hola que tal");

// Conectar a la bse de datos
conexion();

//crear servidor node
const app = express();
const puerto =3900;

// configurar cors
app.use(cors());

//convertir body a objeto js
app.use(express.json());//recibir datos con content-type app/json
app.use(express.urlencoded({extended:true}));//recibir datos form -urlenconded o formularios
//rutas
const rutas_articulo = require("./rutas/articulo");

//cargo de rutas
app.use("/api", rutas_articulo);


//crear rutas pruebas

app.get("/probando", (req, res) =>{
    return res.status(200).send({
        curso: "master en react",
        autor:"lol "
    });
})

//crear servidor y escuchar peticiones http 
app.listen(puerto, () => {
    console.log("Servidor corriendo en el puerto" +puerto);
});
