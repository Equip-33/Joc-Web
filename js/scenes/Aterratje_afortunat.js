// Escena de la minipantalla
var MiniScreenScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function MiniScreenScene() {
        Phaser.Scene.call(this, { key: 'MiniScreen' });
    },

    preload: function () {
        this.load.image('boton', '../resources/boton.png');
        this.load.image('textInfo', '../resources/text_pauseAF.png');
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
        this.velocitat = 200;
        this.delayB = 3000;
        this.puntuacion = 0;
        this.puntsTotals=0;
        this.priceU=200;
        this.bombasEvent = null; // Variable para almacenar la referencia al evento createBombas
        this.gameTime = 0;
        this.gameDuration = 120 ; // 2 minutos 
        this.user="";
    }

    preload() {
        this.load.image('plataforma', '../resources/plataforma.png');
        this.load.image('bomba', '../resources/bomba.png');
        this.load.image('globo', '../resources/globo.png');
        this.load.image('boton', '../resources/boton.png');
        this.load.image('millora', '../resources/millora.png');
        this.load.image('background', '../resources/fons.png');
    }

    create() {
        this.user = sessionStorage.getItem("playerName","unknown");
        this.cameras.main.setBackgroundColor(0x89BCEB);
        this.add.image(0, 0, 'background').setOrigin(0).setScale(2,1.4)
        this.puntuacionText = this.add.text(16, 16, 'Score: ', { fontSize: '32px', fill: '#000',fontFamily: 'Valo' });
        this.updatePuntuacionText();
        this.preuText = this.add.text(16, 50, 'Price Upgrade: ', { fontSize: '32px', fill: '#000',fontFamily: 'Valo' });
        this.updatePreuText();
        this.plataforma = this.physics.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY + this.cameras.main.centerY / 3, 'plataforma');
        this.plataforma.setImmovable(true);
        this.plataforma.setCollideWorldBounds(true);
        this.plataforma.setInteractive();
        this.plataforma.setScale(0.5)
        this.input.on('pointermove', this.movePlataforma, this);
        this.input.keyboard.on('keydown-ESC', this.showMiniScreen, this);
        this.input.keyboard.on('keydown-B', this.compraMillora, this);
        this.bombas = this.physics.add.group(); // Crea un grupo de objetos con físicas
        this.globus = this.physics.add.group(); // Crea un grupo de objetos con físicas
        
        this.bombasEvent = this.time.addEvent({
            delay: this.delayB,
            callback: this.createBombas,
            callbackScope: this,
            loop: true
        });

        this.time.addEvent({ // Evento para crear globos cada cierto intervalo de tiempo
            delay: 1500,
            callback: this.createGlobus,
            callbackScope: this,
            loop: true
        });

        this.physics.world.setBoundsCollision(true, true, true, false); // Habilita la colisión con los límites del mundo

        this.physics.add.collider(this.plataforma, this.globus, this.handleCollisionG, null, this);
        this.physics.add.collider(this.plataforma, this.bombas, this.handleCollisionB, null, this);

        const button = this.add.sprite(this.cameras.main.centerX , this.cameras.main.height - 200, 'millora');
		button.scaleX = .2;
		button.scaleY = .2;
        button.setInteractive();
        button.on('pointerdown', () => {
			this.compraMillora
        });
    }

    compraMillora(){
        if(this.puntuacion>=this.priceU){
            this.delayB+=3000;
            this.puntuacion-=this.priceU;
            this.priceU+=100;
            this.updatePuntuacionText(); // Actualiza el texto de puntuación
            this.updatePreuText();
            if (this.bombasEvent) {
                // Si hay un evento createBombas activo, lo eliminamos
                this.time.removeEvent(this.bombasEvent);
                // Creamos un nuevo evento createBombas con el nuevo retardo
                this.bombasEvent = this.time.addEvent({
                    delay: this.delayB,
                    callback: this.createBombas,
                    callbackScope: this,
                    loop: true
                });
            }
        }
    }
    createBombas() {
        var x = Phaser.Math.Between(30, this.sys.game.config.width-30);
        var object = this.bombas.create(x, 0, 'bomba');
        object.setScale(0.4
            );
        object.setVelocityY(this.velocitat);
        object.setInteractive();
        this.physics.add.overlap(this.plataforma, object, this.handleCollisionB, null, this);
        if(this.delayB<600) this.delayB=700;
        else this.delayB-=200;
        if (this.bombasEvent) {
            // Si hay un evento createBombas activo, lo eliminamos
            this.time.removeEvent(this.bombasEvent);
            // Creamos un nuevo evento createBombas con el nuevo retardo
            this.bombasEvent = this.time.addEvent({
                delay: this.delayB,
                callback: this.createBombas,
                callbackScope: this,
                loop: true
            });
        }
    }
    updatePuntuacionText() {
        this.puntuacionText.setText('Score: ' + this.puntuacion);
    }
    
    updatePreuText() {
        this.preuText.setText('Price Upgrade: ' + this.priceU);
    }
    createGlobus() {
        var x = Phaser.Math.Between(0, this.sys.game.config.width);
        var object = this.globus.create(x, 0, 'globo');
        object.setScale(0.2);
        object.setVelocityY(this.velocitat);
        object.setInteractive(); // Habilitar interacción para el nuevo globo
        this.physics.add.overlap(this.plataforma, object, this.handleCollisionG, null, this); // Agregar colisión para el nuevo globo
    }

    handleCollisionG(plataforma, globus) {
        globus.destroy();
        this.puntuacion += 10; // Incrementa la puntuación por cada globo guardado
        this.puntsTotals+=10;
        this.updatePuntuacionText();
    }

    handleCollisionB(plataforma, bomba) {
        bomba.destroy();
        this.puntuacion -= 20; // Incrementa la puntuación por cada globo guardado
        this.puntsTotals-=20;
        if(this.puntuacion<0) this.puntuacion=0;
        this.updatePuntuacionText(); // Actualiza el texto de puntuación
    }

    movePlataforma(pointer) {
        this.plataforma.x = pointer.x;
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

    update(time, delta) {
        this.bombas.getChildren().forEach(function (object) {
            // Verifica si el objeto ha tocado el final de la pantalla
            if (object.y >= this.sys.game.config.height) {
                object.destroy();
            }
        }, this);
        this.globus.getChildren().forEach(function (object) {
            // Verifica si el objeto ha tocado el final de la pantalla
            if (object.y >= this.sys.game.config.height) {
                object.destroy();
            }
        }, this);

        this.gameTime += delta / 1000; // Divide por 1000 para obtener el tiempo en segundos
        if (this.gameTime >= this.gameDuration) {
            // Lógica para finalizar la partida
            this.showGameOverScreen();
            this.destroyGameObjects();
        }
    }
    destroyGameObjects() {
        // Destruye todos los misiles
        this.bombas.getChildren().forEach(function (bomba) {
            bomba.destroy();
        });
    
        // Destruye todos los archivos
        this.globus.getChildren().forEach(function (globu) {
            globu.destroy();
        });
    }
    showGameOverScreen() {
        this.time.removeAllEvents();
        this.children.removeAll();
        
        const gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'Time Out', { fontSize: '64px', fill: '#000', fontFamily: 'Valo' });
        gameOverText.setOrigin(0.5);

        const scoreText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Final Score of '+this.user+ ": " + this.puntsTotals, { fontSize: '32px', fill: '#000', fontFamily: 'Valo' });
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
            if (localStorage.scoresAA) {
                arrayScores = JSON.parse(localStorage.scoresAA);
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
            localStorage.scoresAA = JSON.stringify(arrayScores);
            loadpage("../");
        });
    }
}