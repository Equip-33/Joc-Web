class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
		this.velocitat=200;
    }

    preload() {
        this.load.image('plataforma', '../resources/plataforma.png');
        this.load.image('bomba', '../resources/bomba.png');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x89BCEB);
        this.sprite = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY + this.cameras.main.centerY / 3, 'plataforma');
        this.sprite.setInteractive();
        this.input.on('pointermove', this.moveSprite, this);

        this.objectsGroup = this.physics.add.group(); // Crea un grupo de objetos con físicas

        this.time.addEvent({ // Evento para crear objetos cada cierto intervalo de tiempo
            delay: 1000,
            callback: this.createObject,
            callbackScope: this,
            loop: true
        });

        this.physics.world.setBoundsCollision(true, true, true, false); // Habilita la colisión con los límites del mundo

        this.input.on('gameobjectup', this.destroyObject, this); // Evento para destruir objetos al tocarlos
    }

    createObject() {
        var x = Phaser.Math.Between(0, this.sys.game.config.width);
        var object = this.objectsGroup.create(x, 0, 'bomba');
		object.setScale(.2);
        object.setVelocityY(this.velocitat);
    }

    destroyObject(pointer, gameObject) {
        gameObject.destroy();
    }

    moveSprite(pointer) {
        this.sprite.x = pointer.x;
    }

    update() {
        this.objectsGroup.getChildren().forEach(function (object) {
            // Verifica si el objeto ha tocado el final de la pantalla
            if (object.y >= this.sys.game.config.height) {
                object.destroy();
            }
        }, this);
    }
}