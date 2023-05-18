class GameScene extends Phaser.Scene {
    constructor (){
        super('GameScene');
		this.cards = null;
		this.firstClick = null;
		this.score = 100;
		this.totalPunts=0;
		this.correct = 0;
		this.level=0;
		this.user="";
		this.mostrantError=false;
    }

    preload (){	
		this.load.image('plataforma', '../resources/plataforma.png');
	}
	
    create (){	
		this.add.image(this.cameras.main.centerX,this.cameras.main.centerY,'plataforma')
	}
	
	update (){	}
}

