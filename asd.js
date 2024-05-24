// Solicitud GET (Request).
fetch('https://terminalbff.duxsoftware.com.ar/productInfo?terminalToken=7787f36f0bcbe048ad0a12801&productId=1111139601')
    // Exito
    .then(response => response.json())  // convertir a json
    .then(json => console.log(json))    //imprimir los datos en la consola
    .catch(err => console.log('Solicitud fallida', err)); // Capturar errores



    // 
    // https://terminalbff.duxsoftware.com.ar/productInfo?terminalToken=7787f36f0bcbe048ad0a12801&productId=1111139601
    // 