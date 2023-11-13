const { Socket } = require("socket.io");
const { comprobarJWT } = require("../helpers");
const { ChatMensajes } = require("../models");

const chatMensajes = new ChatMensajes();

const socketController = async( socket = new Socket(), io) => {

    const token = (socket.handshake.headers['x-token']);

    const usuario = await comprobarJWT( token );
    
    if ( !usuario ) {
        return socket.disconnect();
    }

    // socket.to(socket.id).emit('xxx', ()=>{})
    //Socket.to recibe el socket id pero es muy volatil

    //Agregar el usuario conectado
    chatMensajes.conectarUsuario( usuario );
    io.emit('usuarios-activos',  chatMensajes.usuariosArr);
    //Renderizar los ultimos mensajes
    socket.emit('recibir-mensajes', chatMensajes.ultimos10 );

    //conectarlo a su sala especial para mensajes privados

    socket.join( usuario.id );

    //Limpiar cuando alguien se desconecta
    socket.on('disconnect', () => {
        chatMensajes.desconectarUsuario( usuario.id );
        io.emit('usuarios-activos',  chatMensajes.usuariosArr);
    });

    socket.on('enviar-mensaje', ( {uid, mensaje} )=> {

        if (uid) {
            //mensaje privado
            socket.to( uid ).emit('mensaje-privado',{ de: usuario.nombre, mensaje })

        } else {
            
            chatMensajes.enviarMensaje( usuario.uid, usuario.nombre, mensaje );
            io.emit('recibir-mensajes', chatMensajes.ultimos10 );

        }
        
    })
    
}

module.exports = {
    socketController,
}