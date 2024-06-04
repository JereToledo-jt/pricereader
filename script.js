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
			console.log(Object.keys(json))
			console.log('json: ', json)
			console.log("row")
			let table = document.getElementById('table').insertRow(1)
			let col1 = table.insertCell(0)
			let col2 = table.insertCell(1)
			let col3 = table.insertCell(2)
			col1.innerHTML = json.name
			col2.innerHTML = json.price
			col3.innerHTML = json.price * 0.80
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