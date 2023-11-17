const { io } = require('../server');

const Usuarios = require('../clases/usuarios');
const crearMensaje = require('../utils/utils');

const usuarios = new Usuarios();

io.on('connection', (client) => {


    client.on('entrarChat', ( data, callback )=>{
        if(!data.nombre || !data.sala){
            return callback({
                error: true,
                mensaje: 'El nombre es necesario',
            });
        };

        client.join(data.sala);

        const personas = usuarios.agregarPersona( client.id, data.nombre, data.sala );

        client.broadcast.to( data.sala ).emit('listaPersona', usuarios.getPersonasPorSala( data.sala ) );
        client.broadcast.to( data.sala ).emit('crearMensaje', crearMensaje('Administrador', `${ data.nombre } se unio al chat`));

        callback( usuarios.getPersonasPorSala( data.sala) );
    });

    client.on('disconnect', () => {

        const personaBorrada = usuarios.eliminarPersona( client.id );

        // console.log('La persona borrada deberia ser: ', personaBorrada);
        
        client.broadcast.to( personaBorrada.sala ).emit('crearMensaje', crearMensaje('Administrador', `${ personaBorrada.nombre } abandono el chat`));
        client.broadcast.to( personaBorrada.sala ).emit('listaPersona', usuarios.getPersonasPorSala( personaBorrada.sala ) );

    });

    client.on('crearMensaje', (data, callback) => {

        const persona = usuarios.getPersona( client.id );

        const mensaje = crearMensaje( persona.nombre, data.mensaje );

        
        client.broadcast.to( persona.sala ).emit('crearMensaje', mensaje )

        callback( mensaje );

    });

    client.on('mensajePrivado', (data) => {

        const { /* id, */ mensaje, para } = data;

        // if (!id) {
        //     return new Error(`No hay id`);
        // }

        if (!mensaje) {
            return new Error(`No hay mensaje`);
        }
        
        const persona = usuarios.getPersona( client.id );
        client.broadcast.to( para ).emit('mensajePrivado', crearMensaje( persona.nombre , data.mensaje))

    })

    
    

});