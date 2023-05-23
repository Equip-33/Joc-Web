class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('bomba', '../resources/bomba.png');
        this.load.image('globo', '../resources/globo.png');
		this.load.image('fitxer', '../resources/Fitxer.png');
    }

    create() {
		this.cameras.main.setBackgroundColor(0x89BCEB);
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
    }

    update() {
        // Mueve los misiles hacia la izquierda
        this.missiles.getChildren().forEach(function (missile) {
            missile.x -= 5;

            // Comprueba si hay colisión entre el globo y los misiles
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.globo.getBounds(), missile.getBounds())) {
                // Aquí puedes agregar el código para manejar la colisión
                console.log('Colisión con el globo');
            }

            // Elimina los misiles que salen de la pantalla
            if (missile.x < -missile.width) {
                missile.destroy();
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
}