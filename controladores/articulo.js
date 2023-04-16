const fs = require('fs');
const path = require('path');
const {validarArticulo} = require('../helpers/validar');
const Articulo = require('../modelos/Articulo');

const prueba = (req, res) => {
  return res.status(200).json({
    mensaje: 'Soy una accion de prueba en mi controlador de articulos',
  });
};

const curso = (req, res) => {
  console.log('Se a ejecutado el endpoint probando');

  return res.status(200).send({
    curso: 'master en react',
    autor: 'lol ',
  });
};

const crear = (req, res) => {
  //Recoger parametros por post a guardar
  let parametros = req.body;
  // Validar datos
  try {
    validarArticulo(parametros);
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      mensaje: 'Faltan datos por enviar',
    });
  }
  //Crear el objeto a guardar
  const articulo = new Articulo(parametros);
  //Asignar valores a objeto basado en el modelo (manual o automatico)
  // articulo.titulo =   <-- parametros.titulo; este es de forma manual

  //Guardar el articulo en la base de datos
  articulo
    .save()
    .then((articuloGuardado) => {
      return res.status(200).json({
        status: 'success',
        Articulo: articuloGuardado,
        mensaje: 'Articulo creado con exito',
      });
    }) //Devolver resultado
    .catch((error) => {
      return res.status(400).json({
        status: 'error',
        mensaje: 'No se ha guardado el articulo: ' + error.message,
      });
    });
};

const listar = async (req, res) => {
  try {
    const articulos = await Articulo.find({}).sort({fecha: -1}); //ordenar por ultima fecha

    // if (req.params.ultimos){
    //     articulo.limit(1);
    // }
    if (!articulos) {
      return res.status(404).json({
        status: 'error',
        mensaje: 'No se han encontrado articulos',
      });
    }
    return res.status(200).send({
      status: 'success',

      contador: articulos.length,
      articulos,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      mensaje: 'Error al obtener los articulos',
    });
  }
};

const uno = (req, res) => {
  //Recoger un id por la url
  let id = req.params.id;
  //Buscar el articulo
  Articulo.findById(id, (error, articulo) => {
    //Si no existe devolver error
    if (error || !articulo) {
      return res.status(404).json({
        status: 'error',
        mensaje: 'No se han encontrado el articulo',
      });
    }

    //devolver resultado
    return res.status(200).json({
      status: 'success',
      articulo,
    });
  });
};
const borrar = (req, res) => {
  let articuloId = req.params.id;

  Articulo.findOneAndDelete({_id: articuloId}, (error, articuloBorrado) => {
    if (error || !articuloBorrado) {
      return res.status(500).json({
        status: 'error',
        mensaje: 'Error al borrar el articulo',
      });
    }

    return res.status(200).json({
      status: 'success',
      articulo: articuloBorrado,
      mensaje: 'Metodo de borrar',
    });
  });
};

const editar = (req, res) => {
  //Recoger id articulo a editar
  let articuloId = req.params.id;
  //recoger datos del body
  let parametros = req.body;
  //validar datos
  try {
    validarArticulo(parametros);
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      mensaje: 'Faltan datos por enviar',
    });
  }
  //Buscar y actualizar articulo
  Articulo.findOneAndUpdate({_id: articuloId}, req.body, {new: true})
    .then((articuloActualizado) => {
      // Devolver respuesta
      return res.status(200).json({
        status: 'success',
        articulo: articuloActualizado,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        status: 'error',
        mensaje: 'Error al actualizar',
      });
    });
};

const subir = (req, res) => {
  // configurar multer

  //recoger el fichero de imagen subido
  if (!req.file && !Request.files) {
    return res.status(404).json({
      status: 'error',
      mensaje: 'Imagen invalida',
    });
  }
  //nombre del archivo
  let archivo = req.file.originalname;
  //extension del archivo
  let archivo_split = archivo.split('.');
  let extension = archivo_split[1];
  //comprobar extension correcta
  if (
    extension != 'png' &&
    extension != 'jpg' &&
    extension != 'jpeg' &&
    extension != 'gif'
  ) {
    //borrar respuesta
    fs.unlink(req.file.path, (error) => {
      return res.status(400).json({
        status: 'error',
        mensaje: 'Imagen invalida',
      });
    });
  } else {
    //Recoger el id del aritculo a editar
    let articuloId = req.params.id;

    //Buscar y actualizar articulo
    Articulo.findOneAndUpdate(
      {_id: articuloId},
      {imagen: req.file.filename},
      {new: true}
    )
      .then((articuloActualizado) => {
        // Devolver respuesta
        return res.status(200).json({
          status: 'success',
          articulo: articuloActualizado,
          fichero: req.file,
        });
      })
      .catch((error) => {
        return res.status(500).json({
          status: 'error',
          mensaje: 'Error al actualizar',
        });
      });
  }
};

const imagen = (req, res) => {
  let fichero = req.params.fichero;
  let ruta_fisica = './imagenes/articulos/' + fichero;

  fs.stat(ruta_fisica, (error, existe) => {
    if (existe) {
      return res.sendFile(path.resolve(ruta_fisica));
    } else {
      return res.status(404).json({
        status: 'error',
        mensaje: 'La iamgen no existe',
        existe,
        fichero,
        ruta_fisica,
      });
    }
  });
};

const buscador = (req, res) => {
  //sacar el string de busqueda
  let busqueda = req.params.busqueda;
  //find OR
  Articulo.find({
    $or: [
      {titulo: {$regex: busqueda, $options: 'i'}},
      {contenido: {$regex: busqueda, $options: 'i'}},
    ],
  })
    //orden
    .sort({fecha: -1})
    .then((articulosEncontrados) => {
      return res.status(200).json({
        status: 'success',
        articulos: articulosEncontrados,
      });
    })
    .catch((error) => {
      if (error || !articulosEncontrados || articulosEncontrados.length <= 0) {
        return res.status(404).json({
          status: 'error',
          mensajes: 'No se han encontrado articulos',
        });
      }
    });
};

module.exports = {
  prueba,
  curso,
  crear,
  listar,
  uno,
  borrar,
  editar,
  subir,
  imagen,
  buscador,
};
