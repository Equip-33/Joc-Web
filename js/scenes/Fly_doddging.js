// Escena de la minipantalla
var MiniScreenScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function MiniScreenScene() {
        Phaser.Scene.call(this, { key: 'MiniScreen' });
    },

    preload: function () {
        this.load.image('boton', '../resources/boton.png');
        this.load.image('textInfo', '../resources/text_menu.png');
    },

    create: function () {
        // Agrega un rectángulo verde como fondo de la escena
        var rect = this.add.rectangle(this.cameras.main.centerX-300, this.cameras.main.centerY-300, 600, 600, 0xe69a9a, 0.7);
        rect.setOrigin(0);
        rect.setStrokeStyle(4, 0xffffff);// Agrega un borde al rectángulo
        this.textIn = this.add.sprite(this.cameras.main.centerX , this.cameras.main.height-500, 'textInfo');
        this.textIn.setScale(0.4);
        const buttonExit = this.add.sprite(this.cameras.main.centerX , this.cameras.main.height - 300, 'boton');
        buttonExit.text
		buttonExit.scaleX = .5;
		buttonExit.scaleY = .5;
        buttonExit.setInteractive();
        buttonExit.on('pointerdown', () => {
			loadpage("../");
        });

        // Aquí puedes crear los elementos adicionales de la minipantalla
        // Por ejemplo, puedes agregar texto, botones, etc.

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

    // Resto del código de la escena de la minipantalla...
});

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
		this.puntuacion = 0;
		this.priceU=200;
    }

    preload() {
		this.load.image('bomba', '../resources/bomba.png');
        this.load.image('globo', '../resources/globo.png');
		this.load.image('fitxer', '../resources/Fitxer.png');
    }

    create() {
		this.cameras.main.setBackgroundColor(0x89BCEB);
		this.input.keyboard.on('keydown-ESC', this.showMiniScreen, this);
		this.puntuacionText = this.add.text(16, 16, 'Score: ', { fontSize: '32px', fill: '#000',fontFamily: 'Valo' });
        this.puntuacionText.setText("Score: " + this.puntuacion);
        this.preuText = this.add.text(16, 50, 'Price Upgrade: ', { fontSize: '32px', fill: '#000',fontFamily: 'Valo' });
        this.preuText.setText("Price Upgrade: " + this.priceU)


        this.globo = this.physics.add.sprite(400, 100, 'globo');
        this.globo.setCollideWorldBounds(true);
        this.globo.setBounce(0.2);
        this.globo.setScale(0.2);

		// Agrega gravedad al globo
        this.globo.body.gravity.y = 400;

        // Crea los misiles
        this.missiles = this.physics.add.group();

		this.fitxers = this.physics.add.group();

        // Agrega el evento de teclado para la barra espaciadora
        this.input.keyboard.on('keydown-SPACE', function () {
            this.globo.setVelocityY(-300); // Aplica una fuerza hacia arriba cuando se presiona la barra espaciadora
        }, this);

        // Genera misiles cada 1 segundo
        this.time.addEvent({
            delay: 1000,
            callback: this.createMissile,
            callbackScope: this,
            loop: true,
        });

		// Genera archivos cada 3 segundo
        this.time.addEvent({
            delay: 3000,
            callback: this.createFile,
            callbackScope: this,
            loop: true,
        });

		window.addEventListener("keydown", function (e) {
			if (e.code === "Space" && e.target === document.body) {
				e.preventDefault();
			}
		});
    }

    update() {
        // Mueve los misiles hacia la izquierda
        this.missiles.getChildren().forEach(function (missile) {
            missile.x -= 5;

            // Comprueba si hay colisión entre el globo y los misiles
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.globo.getBounds(), missile.getBounds())) {
                // Aquí puedes agregar el código para manejar la colisión
                this.puntuacion -= 20; // Incrementa la puntuación por cada globo guardado
				if(this.puntuacion<0) this.puntuacion=0;
				this.puntuacionText.setText('Score: ' + this.puntuacion);
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
                // Aquí puedes agregar el código para manejar la colisión
                this.puntuacion += 50; // Incrementa la puntuación por cada globo guardado
        		this.puntuacionText.setText('Score: ' + this.puntuacion); // Actualiza el texto de puntuación
				fitxer.destroy();
            }

            // Elimina los misiles que salen de la pantalla
            if (fitxer.x < -fitxer.width) {
                fitxer.destroy();
            }
        }, this);
    }

    createMissile() {
        var x = this.game.config.width;
        var y = Phaser.Math.Between(100, this.game.config.height - 100);

        var missile = this.missiles.create(x, y, 'bomba');
		missile.setVelocityX(-200);
		missile.setScale(0.4);
		missile.setAngle(90);
        missile.setImmovable();
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
}