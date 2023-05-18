class GameScene extends Phaser.Scene {
    constructor (){
        super('GameScene');
		var sprite;
    }

    preload (){	
		this.load.image('plataforma', '../resources/plataforma.png');
		this.load.image('bomba', '../resources/bomba.png');
	}
	
	create() {
        this.cameras.main.setBackgroundColor(0x89BCEB);
        this.sprite = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY + this.cameras.main.centerY / 3, 'plataforma');
        this.sprite.setInteractive();
        this.input.on('pointermove', this.moveSprite, this);
    }

    moveSprite(pointer) {
        this.sprite.x = pointer.x;
    }
	
	update (){	}
}

