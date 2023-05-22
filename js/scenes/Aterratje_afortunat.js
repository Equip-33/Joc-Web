// Escena de la minipantalla
var MiniScreenScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function MiniScreenScene() {
        Phaser.Scene.call(this, { key: 'MiniScreen' });
    },

    create: function () {
        // Agrega un rectángulo verde como fondo de la escena
        var rect = this.add.rectangle(0, 0, this.cameras.main.centerX, this.cameras.main.centerY, 0x00ff00);
        rect.setOrigin(0);

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
        this.velocitat = 200;
        this.delayB = 3000
        this.puntuacion = 0;
        this.priceU=200;
        this.bombasEvent = null; // Variable para almacenar la referencia al evento createBombas
    }

    preload() {
        this.load.image('plataforma', '../resources/plataforma.png');
        this.load.image('bomba', '../resources/bomba.png');
        this.load.image('globo', '../resources/globo.png');
        this.load.image('millora', '../resources/millora.png');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x89BCEB);
        this.puntuacionText = this.add.text(16, 16, 'Puntuación: 0', { fontSize: '32px', fill: '#000' });
        this.preuText = this.add.text(16, 50, 'Preu Millora: 200', { fontSize: '32px', fill: '#000' });
        this.plataforma = this.physics.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY + this.cameras.main.centerY / 3, 'plataforma');
        this.plataforma.setImmovable(true);
        this.plataforma.setCollideWorldBounds(true);
        this.plataforma.setInteractive();
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
            this.puntuacion-=200;
            this.priceU+=100;
            this.puntuacionText.setText('Puntuación: ' + this.puntuacion); // Actualiza el texto de puntuación
            this.preuText.setText('Preu: ' + this.priceU);
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
        object.setScale(0.2);
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
        this.puntuacionText.setText('Puntuación: ' + this.puntuacion); // Actualiza el texto de puntuación
        // Aquí puedes agregar la lógica adicional que desees cuando la plataforma colisione con un globo
    }

    handleCollisionB(plataforma, bomba) {
        bomba.destroy();
        this.puntuacion -= 20; // Incrementa la puntuación por cada globo guardado
        if(this.puntuacion<0) this.puntuacion=0;
        this.puntuacionText.setText('Puntuación: ' + this.puntuacion); // Actualiza el texto de puntuación
        // Aquí puedes agregar la lógica adicional que desees cuando la plataforma colisione con una bomba
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

    update() {
        this.bombas.getChildren().forEach(function (object) {
            // Verifica si el objeto ha tocado el final de la pantalla
            if (object.y >= this.sys.game.config.height) {
                object.destroy();
            }
        }, this);
    }
}