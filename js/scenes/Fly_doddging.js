// Escena de la minipantalla
var MiniScreenScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function MiniScreenScene() {
        Phaser.Scene.call(this, { key: 'MiniScreen' });
    },

    preload: function () {
        this.load.image('boton', '../resources/boton.png');
        this.load.image('textInfo', '../resources/text_pauseFD.png');
    },

    create: function () {
        // Agrega un rectángulo verde como fondo de la escena
        var rect = this.add.rectangle(this.cameras.main.centerX-300, this.cameras.main.centerY-300, 600, 600, 0xe69a9a, 0.7);
        rect.setOrigin(0);
        rect.setStrokeStyle(4, 0xffffff);// Agrega un borde al rectángulo
        this.textIn = this.add.sprite(this.cameras.main.centerX , this.cameras.main.height-575, 'textInfo');
        this.textIn.setScale(0.4);
        const buttonExit = this.add.sprite(this.cameras.main.centerX , this.cameras.main.height - 300, 'boton');
        buttonExit.text
		buttonExit.scaleX = .4;
		buttonExit.scaleY = .4;
        buttonExit.setInteractive();
        buttonExit.on('pointerdown', () => {
			loadpage("../");
        });
        // Agrega un evento de teclado para la tecla Escape (para cerrar la minipantalla)
        this.input.keyboard.on('keydown-ESC', this.closeMiniScreen, this);
    },

    closeMiniScreen: function () {
        // Reanuda la escena anterior
        this.scene.resume('GameScene');

        // Habilita el procesamiento de entrada de la escena anterior
        this.scene.get('GameScene').input.enabled = true;

        // Destruye la escena de la minipantalla
        this.scene.remove('MiniScreen');    
    }
});

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
		this.puntuacion = 0;
        this.puntsTotals=0;
		this.priceU=200;
        this.delayB = 2000;
        this.bombasEvent = null; // Variable para almacenar la referencia al evento createMissile
        this.nuvolTimer = 0;
        this.gameTime = 0;
        this.gameDuration = 10 ; // 2 minutos 
        this.user="";
    }

    preload() {
        this.load.image('boton', '../resources/boton.png');
		this.load.image('bomba', '../resources/bomba.png');
        this.load.image('globo', '../resources/globo.png');
		this.load.image('fitxer', '../resources/Fitxer.png');
        this.load.image('nuvol', '../resources/nuvol.png');
        this.load.image('millora', '../resources/millora.png');
    }

    create() {
        this.user = sessionStorage.getItem("playerName","unknown");
		this.cameras.main.setBackgroundColor(0x89BCEB);
		this.input.keyboard.on('keydown-ESC', this.showMiniScreen, this);
		this.puntuacionText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#000', fontFamily: 'Valo' });
        this.updatePuntuacionText();
        this.preuText = this.add.text(16, 50, '', { fontSize: '32px', fill: '#000', fontFamily: 'Valo' });
        this.updatePreuText();

        this.nuvolRect = this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, 0xe2e7e8, 0.6);
        this.nuvolRect.setOrigin(0);
        this.nuvolRect.setDepth(1); // Asegura que el recuadro esté por encima de otros elementos de la escena
        this.nuvolRect.setVisible(false); // Inicialmente oculto

        const button = this.add.sprite(this.cameras.main.centerX , this.cameras.main.height - 200, 'millora');
		button.scaleX = .2;
		button.scaleY = .2;
        button.setInteractive();
        button.on('pointerdown', () => {
			this.compraMillora();
        });
        this.input.keyboard.on('keydown-B', this.compraMillora, this);

        window.addEventListener("keydown", function (e) {
			if (e.code === "Space" && e.target === document.body) {
				e.preventDefault();
			}
		});

        this.globo = this.physics.add.sprite(400, 100, 'globo');
        this.globo.setCollideWorldBounds(true);
        this.globo.setBounce(0.2);
        this.globo.setScale(0.2);

		// Agrega gravedad al globo
        this.globo.body.gravity.y = 400;

        // Crea los misiles
        this.missiles = this.physics.add.group();

		this.fitxers = this.physics.add.group();

        this.nuvols = this.physics.add.group();

        // Agrega el evento de teclado para la barra espaciadora
        this.input.keyboard.on('keydown-SPACE', function () {
            this.globo.setVelocityY(-300); // Aplica una fuerza hacia arriba cuando se presiona la barra espaciadora
        }, this);

        // Genera misiles cada delayB segundos
        this.bombasEvent = this.time.addEvent({
            delay: this.delayB,
            callback: this.createMissile,
            callbackScope: this,
            loop: true
        });

		// Genera archivos cada 3 segundo
        this.time.addEvent({
            delay: 3000,
            callback: this.createFile,
            callbackScope: this,
            loop: true,
        });

        // Genera nuvol cada 2 segundo
        this.time.addEvent({
            delay: 2000,
            callback: this.createNuvol,
            callbackScope: this,
            loop: true,
        });
    }

    update(time, delta) {
        // Mueve los misiles hacia la izquierda
        this.missiles.getChildren().forEach(function (missile) {
            missile.x -= 5;

            // Comprueba si hay colisión entre el globo y los misiles
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.globo.getBounds(), missile.getBounds())) {
                this.puntuacion -= 20; // Incrementa la puntuación por cada globo guardado
                this.puntsTotals-=20;
				if(this.puntuacion<0) {
                    this.puntuacion=0; 
                }
				this.updatePuntuacionText();
				missile.destroy();
            }

            // Elimina los misiles que salen de la pantalla
            if (missile.x < -missile.width) {
                missile.destroy();
            }
        }, this);

		this.fitxers.getChildren().forEach(function (fitxer) {

            // Comprueba si hay colisión entre el globo y los misiles
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.globo.getBounds(), fitxer.getBounds())) {
                this.puntuacion += 50; // Incrementa la puntuación por cada globo guardado
                this.puntsTotals+=50;
        		this.updatePuntuacionText(); // Actualiza el texto de puntuación
				fitxer.destroy();
            }

            // Elimina los misiles que salen de la pantalla
            if (fitxer.x < -fitxer.width) {
                fitxer.destroy();
            }
        }, this);

        this.nuvols.getChildren().forEach(function (nuvol) {

            // Comprueba si hay colisión entre el globo y los misiles
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.globo.getBounds(), nuvol.getBounds())) {
                this.nuvolRect.setVisible(true);
            }
            // Elimina los misiles que salen de la pantalla
            if (nuvol.x < -nuvol.width) {
                nuvol.destroy();
            }
        }, this);

        if (this.nuvolRect.visible) {
            // Controla la duración del recuadro transparente
            this.nuvolTimer += delta/1000;
            if (this.nuvolTimer >= 1) {
                this.nuvolRect.setVisible(false); // Oculta el recuadro transparente
                this.nuvolTimer = 0; // Reinicia el temporizador
            }
        }

        this.gameTime += delta / 1000; // Divide por 1000 para obtener el tiempo en segundos

        if (this.gameTime >= this.gameDuration) {
            // Lógica para finalizar la partida
            this.showGameOverScreen();
            this.destroyGameObjects();
        }
    }


    destroyGameObjects() {
        // Destruye todos los misiles
        this.missiles.getChildren().forEach(function (missile) {
            missile.destroy();
        });
    
        // Destruye todos los archivos
        this.fitxers.getChildren().forEach(function (fitxer) {
            fitxer.destroy();
        });
    }

    compraMillora(){
        if(this.puntuacion>=this.priceU){
            this.delayB+=2000;
            this.puntuacion-=this.priceU;
            this.priceU+=100;
            this.updatePuntuacionText();
            this.updatePreuText();
            if (this.bombasEvent) {
                // Si hay un evento createMissile activo, lo eliminamos
                this.time.removeEvent(this.bombasEvent);
                // Creamos un nuevo evento createMissile con el nuevo retardo
                this.bombasEvent = this.time.addEvent({
                    delay: this.delayB,
                    callback: this.createMissile,
                    callbackScope: this,
                    loop: true
                });
            }
        }
    }

    createMissile() {
        var x = this.game.config.width;
        var y = Phaser.Math.Between(100, this.game.config.height - 100);

        var missile = this.missiles.create(x, y, 'bomba');
		missile.setVelocityX(-200);
		missile.setScale(0.4);
		missile.setAngle(90);
        missile.setImmovable();

        if(this.delayB<600) this.delayB=800;
        else this.delayB-=200;
        if (this.bombasEvent) {
            // Si hay un evento createMissile activo, lo eliminamos
            this.time.removeEvent(this.bombasEvent);
            // Creamos un nuevo evento createMissile con el nuevo retardo
            this.bombasEvent = this.time.addEvent({
                delay: this.delayB,
                callback: this.createMissile,
                callbackScope: this,
                loop: true
            });
        }
    }
    createNuvol(){
        var x = this.game.config.width;
        var y = Phaser.Math.Between(100, this.game.config.height - 100);

        var nuvol = this.nuvols.create(x, y, 'nuvol');
		nuvol.setVelocityX(-200);
		nuvol.setScale(0.7);
        nuvol.setImmovable();
    }
	createFile() {
        var x = this.game.config.width;
        var y = Phaser.Math.Between(100, this.game.config.height - 100);

        var fitxer = this.fitxers.create(x, y, 'fitxer');
		fitxer.setVelocityX(-400);
		fitxer.setScale(0.6);
        fitxer.setImmovable();
    }

	showMiniScreen() {
        // Crea una nueva escena para la minipantalla
        if (!this.scene.isActive('MiniScreen')) {
            var miniScreenScene = this.scene.add('MiniScreen', MiniScreenScene, true);
            // Pausa la escena actual
            this.scene.pause();
            // Deshabilita el procesamiento de entrada de la escena actual
            this.input.enabled = false;
        }
    }

    updatePuntuacionText() {
        this.puntuacionText.setText('Score: ' + this.puntuacion);
    }
    
    updatePreuText() {
        this.preuText.setText('Price Upgrade: ' + this.priceU);
    }

    showGameOverScreen() {
        this.time.removeAllEvents();
        this.children.removeAll();
        
        const gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'Time Out', { fontSize: '64px', fill: '#000', fontFamily: 'Valo' });
        gameOverText.setOrigin(0.5);

        const scoreText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Final Score of ' + this.user + ": " + this.puntsTotals, { fontSize: '32px', fill: '#000', fontFamily: 'Valo' });
        scoreText.setOrigin(0.5);

        const exitButton = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY + 100, 'boton');
        exitButton.scaleX = 0.5;
        exitButton.scaleY = 0.5;
        exitButton.setInteractive();
        exitButton.on('pointerdown', () => {
            let scoreP = {
                punts: this.puntsTotals,
                username: this.user
             };
            let arrayScores = [];
            if (localStorage.scores) {
                arrayScores = JSON.parse(localStorage.scores);
            if (!Array.isArray(arrayScores)) {
                arrayScores = [];
            } else {
                let scoreExistente = arrayScores.find(scoreP => this.user === scoreP.username && this.puntsTotals > scoreP.punts);
                if (scoreExistente) {
                Object.assign(scoreExistente, scoreF);
                } else {
                    arrayScores.push(scoreP);
                }
            }
            } else {
                arrayScores.push(scoreP);
            }
            arrayScores.sort((a, b) => b.punts - a.punts);
            console.log(arrayScores);
            localStorage.scores = JSON.stringify(arrayScores);
            loadpage("../");
        });
    }
}