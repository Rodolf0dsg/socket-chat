
const urlParam = new URLSearchParams( window.location.search );

const nombre = urlParam.get('nombre');
const sala = urlParam.get('sala')

//Referencias de jquery

const divUsuarios = $('#divUsuarios');
const formEnviar = $('#formEnviar');
const txtMensaje = $('#txtMensaje');
const divChatbox = $('#divChatbox');



// Funciones para renderizar usuarios

const renderizarUsuarios = ( personas ) => {
    console.log( personas );

    let html = ``;

    html += `<li>
                <a href="javascript:void(0)" class="active"> Chat de <span> ${ urlParam.get('sala') } </span></a>
            </li>`;

    personas.forEach( persona => {
        html +=`<li>
                    <a data-id="${ persona.id }" href="javascript:void(0)"><img src="assets/images/users/1.jpg" alt="user-img" class="img-circle"> <span> ${ persona.nombre } <small class="text-success">online</small></span></a>
                </li>`; 
    });

    divUsuarios.html(html);
    
}

const renderizarMensajes = ( mensaje, yo ) => {

    const { nombre, mensaje: sms } = mensaje;
    const time = renderizarTiempo();

    let html;
    let adminClass = 'info'

    if ( mensaje.nombre === 'Administrador') {
        adminClass = 'danger'
    }


    if ( yo ) {

        html = `<li class="reverse">
                <div class="chat-content">
                    <h5>${ nombre}</h5>
                    <div class="box bg-light-inverse">${ sms }</div>
                </div>
                <div class="chat-img"><img src="assets/images/users/5.jpg" alt="user" /></div>
                <div class="chat-time">${ time }</div>
            </li>`
        
    } else {
        
        html = `<li class="animated fadeIn">
                         <div class="chat-img">${ (adminClass === 'Administrador') ? '<img src="assets/images/users/1.jpg" alt="user"/>' : ''}</div>
                             <div class="chat-content">
                                 <h5> ${ nombre }</h5>
                                 <div class="box bg-light-${adminClass}"> ${ sms } </div>
                             </div>
                         <div class="chat-time"> ${ time } </div>
                     </li>`;

    }
    

    divChatbox.append( html );
} 

function scrollBottom() {

    // selectors
    const newMessage = divChatbox.children('li:last-child');

    // heights
    const clientHeight = divChatbox.prop('clientHeight');
    const scrollTop = divChatbox.prop('scrollTop');
    const scrollHeight = divChatbox.prop('scrollHeight');
    const newMessageHeight = newMessage.innerHeight();
    const lastMessageHeight = newMessage.prev().innerHeight() || 0;

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        divChatbox.scrollTop(scrollHeight);
    }
}


const renderizarTiempo = ( ) => {
    let ampm;

    const hora = new Date().getHours();
    const minutos = new Date().getMinutes();

    if ( hora == 12) ampm = 'md';

    ampm = ( hora > 12 ) ? 'pm' : 'am';

    return `${hora}:${minutos} ${ampm}`

};

//Listeners 

divUsuarios.on('click', 'a', function() {
    //atributo data-id
    const id = $(this).data('id');

    if( id ){

        console.log( id );

    }

    
});

formEnviar.on('submit', function (e) {

    e.preventDefault();

    if(txtMensaje.val().trim().length === 0){
        return;
    };

    socket.emit('crearMensaje', {
        nombre,
        mensaje: txtMensaje.val(),
        sala,
        }, function( mensaje ) {
            renderizarMensajes( mensaje, true );
            txtMensaje.val('').focus();
            scrollBottom();
        });
    

});


