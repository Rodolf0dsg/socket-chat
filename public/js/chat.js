let usuario = null;
let socket = null;
const url = 'http://localhost:8080/api/auth/';

//Referencias html

const txtUid     = document.querySelector('#txtUid');
const txtMensaje = document.querySelector('#txtMensaje');
const ulUsuarios = document.querySelector('#ulUsuarios');
const ulMensajes = document.querySelector('#ulMensajes');
const btnSalir   = document.querySelector('#btnSalir');

const validarJWT = async() =>{

    const token = localStorage.getItem('token') || '';

    if (token.length <= 10 ) {
        window.location = 'index.html';
        throw new Error('No hay token');
    }

    const resp = await fetch( url, {
        headers: {'x-token': token,}
    });

    const { usuario: userDB, token: tokenDB } = await resp.json();

    localStorage.setItem( 'token', tokenDB );

    usuario = userDB;

    document.title = usuario.nombre;

    conectarSocket();
} 


const conectarSocket = () => {

    socket = io({
        'extraHeaders': { //headers personalizados
            'x-token': localStorage.getItem('token'),
        }
    });

    socket.on('connect', ()=> {
        console.log('Socket online');
    });

    
    socket.on('disconnect', ()=> {
        console.log('Socket offline');
    });

    socket.on('recibir-mensajes', dibujarMensajes );

    socket.on('usuarios-activos', dibujarUsuarios );

    socket.on('mensaje-privado', ( payload )=> {

        
        dibujarMensajePrivado( payload );
        
    });
}

const dibujarUsuarios = ( usuarios = [] ) => {
    let usersHtml = '';
    usuarios.forEach( ({ nombre, uid }) => {

        usersHtml += `
        <li>
            <p>
                <h5 class="text-success"> ${ nombre }</h5>
                <span class="fs-6 text-muted"> ${ uid } </span>
            </p>
        </li>
        `;
    });

    ulUsuarios.innerHTML = usersHtml; 

}

const dibujarMensajes = ( mensajes = [] ) => {
    let mensajesHtml = '';
    mensajes.forEach( ({ mensaje, nombre }) => {

        mensajesHtml += `
        <li>
            <p>
                <span class="text-primary"> ${ nombre }: </span>
                <span class="fs-6 text-muted"> ${ mensaje } </span>
            </p>
        </li>
        `;
    });

    ulMensajes.innerHTML = mensajesHtml; 

}

const dibujarMensajePrivado = ( {de, mensaje} ) => {
    let mensajesHtml = `
        <li>
            <p>
                <span class="text-danger"> [PRIVADO] ${ de }: </span>
                <span class="fs-6 text-muted"> ${ mensaje } </span>
            </p>
        </li>
        `;


    ulMensajes.innerHTML = mensajesHtml; 

}


txtMensaje.addEventListener('keyup', ({keyCode}) => {
    
    if ( keyCode !== 13) { return; };

    const mensaje = txtMensaje.value;
    const uid = txtUid.value;
    if ( mensaje.length === 0) { return; };

    socket.emit('enviar-mensaje', {mensaje, uid} );

    txtMensaje.value = '';
    txtUid.value = '';

})

const main = async() => {

    await validarJWT();

}

main();

// const socket = io();

