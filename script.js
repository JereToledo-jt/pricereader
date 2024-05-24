var canvas = document.getElementById("canvas").getContext('2d', { willReadFrequently: true });

try {
var button = document.getElementById("scan-button");
button.addEventListener("click", () => {
	const $resultados = document.querySelector("#resultado");
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
			readers: ["code_128_reader"]
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
		var terminalToken = "7787f36f0bcbe048ad0a12801";
		var url = `https://terminalbff.duxsoftware.com.ar/productInfo?terminalToken=${terminalToken}&productId=${data.codeResult.code}`;
		fetch(url)
    		.then(response => response.json())  // convertir a json
    		.then(json => { 
				console.log(Object.keys(json))
				console.log('json: ', json)
				// let table = document.getElementById('table').insertRow(0)
				// let col1 = table.insertCell(0)
				// let col2 = table.insertCell(1)

				// col1.innerHTML = json.name
				// col2.innerHTML = json.price
			})
    		.catch(err => console.log('Solicitud fallida', err)); // Capturar errores
		
		// Imprimimos todo el data para que puedas depurar
		console.log(data);
	});




	// mostrar las lineas
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

} catch (err) {
	console.log("salio el errooor")
}