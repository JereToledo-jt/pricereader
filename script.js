var codes
fetch('codes.json')
    .then(res=>res.text())
    .then(datos=>{
        codes = JSON.parse(datos)
    })

const myModal = document.getElementById('escanerModal')
const modal = new bootstrap.Modal('#escanerModal');

myModal.addEventListener('shown.bs.modal', () => {
	Quagga.init({
		inputStream: {
			constraints: {
				width: 1920,
				height: 1080,
			},
			name: "Live",
			type: "LiveStream",
			target: document.querySelector('#contenedor'), // Pasar el elemento del DOM
		},
		decoder: {
			readers: ["code_128_reader"],
			multiple: false
		},
	}, function (err) {
		if (err) {
			console.log(err);
			return
		}
		console.log("Iniciado correctamente");
		Quagga.start()
	});

	Quagga.onDetected((data) => {
		requestAPI(data.codeResult.code)
		Quagga.offDetected();
		modal.hide();
		Quagga.stop();
	});

	Quagga.onProcessed(function (result) {
		var drawingCtx = Quagga.canvas.ctx.overlay,
			drawingCanvas = Quagga.canvas.dom.overlay;

		if (result) {
			if (result.boxes) {
				drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
				result.boxes.filter(function (box) {
					return box !== result.box;
				}).forEach(function (box) {
					Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
				});
			}

			if (result.box) {
				Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
			}

			if (result.codeResult && result.codeResult.code) {
				Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
			}
		}
	});
});

const codeModal = new bootstrap.Modal('#codeModal');
const codeButtom = document.getElementById('code-button')

codeButtom.addEventListener('click', () => {
	const codigo = document.getElementById('code')
	if (!(codigo.value in codes)){
		appendAlert('El codigo ingresado no existe.', 'danger')
		codigo.value = ''
	} else {
		requestAPI(codes[codigo.value])
		codeModal.hide()
		codigo.value = ''
	}
})


function requestAPI(code){
	var terminalToken = "7787f36f0bcbe048ad0a12801";
	var url = `https://terminalbff.duxsoftware.com.ar/productInfo?terminalToken=${terminalToken}&productId=${code}`;
	fetch(url)
		.then(response => response.json())  // convertir a json
		.then(json => { 
			// Make Bootstrap Card
			
			const itemsContainer = document.getElementById('items-container');

			const card = document.createElement('div');
  			card.classList.add('card', 'mt-2');
			
			card.innerHTML = `
				<div class="card-body">
					<div class="row text-center">
						<div class="col-6">
							${json.name}
						</div>
						<div class="col-6">
							<div class="row">
							<div class="col-6 text-start text-nowrap">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-credit-card-2-back" viewBox="0 0 16 16">
								<path d="M11 5.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5z"/>
								<path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm13 2v5H1V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1m-1 9H2a1 1 0 0 1-1-1v-1h14v1a1 1 0 0 1-1 1"/>
								</svg>                         
								${json.price}
							</div>
							<div class="col-6 text-start text-nowrap">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cash-coin" viewBox="0 0 16 16">
								<path fill-rule="evenodd" d="M11 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8m5-4a5 5 0 1 1-10 0 5 5 0 0 1 10 0"/>
								<path d="M9.438 11.944c.047.596.518 1.06 1.363 1.116v.44h.375v-.443c.875-.061 1.386-.529 1.386-1.207 0-.618-.39-.936-1.09-1.1l-.296-.07v-1.2c.376.043.614.248.671.532h.658c-.047-.575-.54-1.024-1.329-1.073V8.5h-.375v.45c-.747.073-1.255.522-1.255 1.158 0 .562.378.92 1.007 1.066l.248.061v1.272c-.384-.058-.639-.27-.696-.563h-.668zm1.36-1.354c-.369-.085-.569-.26-.569-.522 0-.294.216-.514.572-.578v1.1zm.432.746c.449.104.655.272.655.569 0 .339-.257.571-.709.614v-1.195z"/>
								<path d="M1 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4.083q.088-.517.258-1H3a2 2 0 0 0-2-2V3a2 2 0 0 0 2-2h10a2 2 0 0 0 2 2v3.528c.38.34.717.728 1 1.154V1a1 1 0 0 0-1-1z"/>
								<path d="M9.998 5.083 10 5a2 2 0 1 0-3.132 1.65 6 6 0 0 1 3.13-1.567"/>
								</svg> 
								${json.price * 0.8}
							</div> 
							</div>
						</div>
					</div>
				</div>
			`

			// Agrega la tarjeta al contenedor
			itemsContainer.appendChild(card);

		})
		.catch(err => console.log('Solicitud fallida', err));
}


const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
const appendAlert = (message, type) => {
	if (alertPlaceholder.innerHTML == '') {
		const wrapper = document.createElement('div')
		  wrapper.innerHTML = [
			`<div class="alert alert-${type}" role="alert">`,
			`   <div>${message}</div>`,
			'</div>'
		  ].join('')
		  alertPlaceholder.append(wrapper) 
	}
}