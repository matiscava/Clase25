'use strict'
const express = require('express');
const session = require('express-session');
const app = express();

/*------------------------------PASSPORT------------------------------*/
const passport = require('passport');
// const FacebookStrategy = require('passport-facebook').Strategy;
const { Strategy: FacebookStrategy } = require('passport-facebook');



const FACEBOOK_APP_ID = '1226741764483851';
const FACEBOOK_APP_SECRET = '0a38d0bd50cba14407ccc86abec3b9fd';

passport.use( new FacebookStrategy( { 
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  // callbackURL: "http://localhost:8080/auth/facebook/callback"
  callbackURL: "/auth/facebook/callback"
},
(token , tokenSecret , profile , done ) => {

  // User.findOrCreate(profile.id , ( err , user ) => {
  //   if (err) { return done(err) }
  //   done( null , user )
  // } )
    
  console.log(profile);
  return done(null, profile);
} 
));

passport.serializeUser( ( user , cb) => {
    cb( null , user );
  } )
passport.deserializeUser( ( obj , cb ) => {
    cb( null , obj );
  } )

/*------------------------------------------------------------------*/

app.use( session( {
  secret: 'No le digas a nadie',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60000
  }
} ) )

/*-----------------------------PASSPORT------------------------------*/
app.use( passport.initialize() )
app.use( passport.session() )
/*------------------------------------------------------------------*/

app.use( express.json() )
app.use( express.urlencoded( { extended: true } ) )
app.use( express.static( 'public' ) )




app
  .get('/', ( req , res ) => {
    if ( req.isAuthenticated() ) {
      res.redirect( '/datos' )
    }
    else
    {
      res.redirect('/login')
    }
  });

/*---------------------LOGIN---------------------*/

app.
  get('/login', ( req , res ) => {
    res.sendFile(`${__dirname}/public/login.html`)
  })
  
  .get('/auth/facebook' , passport.authenticate('facebook') )

  .get('/auth/facebook/callback', 
    passport.authenticate('facebook', {
      successRedirect: '/',
      failureRedirect: '/faillogin'
  } ) );

/*---------------------DATOS---------------------*/

app
  .get('/datos' , ( req , res ) => {
    if( req.isAuthenticated() ){
      //reinicio contador
      if (!req.user.contador) req.user.contador = 0
      req.user.contador++
      res.render( 'datis' , {
        nombre: req.user.displayName,
        username: req.user.username,
        foto: req.user.photos[0].value,
        contador: req.user.contador
      } );
    } 
    else
    {
      res.redirect('/login')
    }
  })

/*---------------------LOGOUT---------------------*/

app.get('/logout' , ( req , res ) => {
  req.logout();
  res.redirect('/')
})

const PORT = process.env.PORT || 8080;
const server = app.listen( PORT, () => {
  console.log(`Server funcionando en http://localhost:${PORT}`);
})

server.on('error' , ( err ) => console.error(`Error en servidor: ${err}`) );