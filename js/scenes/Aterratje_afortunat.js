class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.velocitat = 200;
        this.puntuacion = 0;
    }

    preload() {
        this.load.image('plataforma', '../resources/plataforma.png');
        this.load.image('bomba', '../resources/bomba.png');
        this.load.image('globo', '../resources/globo.png');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x89BCEB);
        this.puntuacionText = this.add.text(16, 16, 'Puntuación: 0', { fontSize: '32px', fill: '#000' });
        this.plataforma = this.physics.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY + this.cameras.main.centerY / 3, 'plataforma');
        this.plataforma.setImmovable(true);
        this.plataforma.setCollideWorldBounds(true);
        this.plataforma.setInteractive();
        this.input.on('pointermove', this.movePlataforma, this);

        this.bombas = this.physics.add.group(); // Crea un grupo de objetos con físicas
        this.globus = this.physics.add.group(); // Crea un grupo de objetos con físicas

        this.time.addEvent({ // Evento para crear bombas cada cierto intervalo de tiempo
            delay: 1000,
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

        this.physics.add.collider(this.plataforma, this.globus, this.handleCollision, null, this);
    }

    createBombas() {
        var x = Phaser.Math.Between(0, this.sys.game.config.width);
        var object = this.bombas.create(x, 0, 'bomba');
        object.setScale(0.2);
        object.setVelocityY(this.velocitat);
    }

    createGlobus() {
        var x = Phaser.Math.Between(0, this.sys.game.config.width);
        var object = this.globus.create(x, 0, 'globo');
        object.setScale(0.2);
        object.setVelocityY(this.velocitat);
        object.setInteractive(); // Habilitar interacción para el nuevo globo
        this.physics.add.overlap(this.plataforma, object, this.handleCollision, null, this); // Agregar colisión para el nuevo globo
    }

    handleCollision(plataforma, globus) {
        globus.destroy();
        this.puntuacion += 10; // Incrementa la puntuación por cada globo guardado
        this.puntuacionText.setText('Puntuación: ' + this.puntuacion); // Actualiza el texto de puntuación
        // Aquí puedes agregar la lógica adicional que desees cuando la plataforma colisione con un globo
    }

    movePlataforma(pointer) {
        this.plataforma.x = pointer.x;
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