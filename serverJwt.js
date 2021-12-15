'use strict'
const express = require('express');
const session = require('express-session');
const app = express();


/*------------------------------PASSPORT------------------------------*/

const jwt = require('jsonwebtoken')

const PRIVATE_KEY = 'chewbaccaKey'

function generateToken(user) {
  let token = jwt.sign( { data: user }, PRIVATE_KEY , { expiresIn: '24h'} )
  return token
}

function auth( req , res , next ) {
  let authHeader = req.headers.authorization;

  if( !authHeader ) {
    return res.status(401).json({
      error: 'not authenticated'
    });
  }

  let token = authHeader.split(' ')[1];

  jwt.verify( token , PRIVATE_KEY , ( err , decoded ) => {
    if(err) {
      return res.status(403).json({
        error: 'not authenticated'
      })
    }

    req.user = decoded.data;
    next();
  } );
}

/*------------------------------DATABASE------------------------------*/
const usuarios = [];

/*------------------------------ROUTES------------------------------*/

app.use( express.json() )

//REGISTER

app.post('/register', ( req , res ) => {
  const { nombre , password , direccion } = req.body;
  
  const yaExiste = usuarios.find( usuario => usuario.nombre === nombre)
  if ( yaExiste ) return res.json({error: 'ya existe ese usuario'});
  
  const usuario = { nombre , password , direccion };

  usuarios.push(usuario);
  const access_token = generateToken(usuario);

  res.json( { access_token } )
})

//LOGIN

app.post( '/login' , ( req , res ) => {
  const { nombre , password } = req.body;

  const usuario = usuarios.find( usuario => usuario.nombre == nombre && usuario.password == password )
  if(!usuario) return res.json( { error: 'credenciales invalidas' } )

  const access_token = generateToken(usuario);
  res.json( { access_token } )
})

//DATOS 

app.get( '/datos' , auth , ( req , res ) => {
 const usuario = usuarios.find(usuario => usuario.nombre == req.user.nombre);
 
 res.json(usuario)
})


const PORT = process.env.PORT || 8080;
const server = app.listen( PORT, () => {
  console.log(`Server funcionando en http://localhost:${PORT}`);
})

server.on('error' , ( err ) => console.error(`Error en servidor: ${err}`) );