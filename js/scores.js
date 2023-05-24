var vue_instance = new Vue({
	el: "#scores_id",
	data: {
		scoresAA: [],
		scoresFD: []
	},
	created: function(){
		let arrayScoresAA = [];
		if(localStorage.scoresAA){
			arrayScoresAA = JSON.parse(localStorage.scoresAA);
			if(!Array.isArray(arrayScoresAA)) arrayScoresAA = [];
		}
		this.scoresAA = arrayScoresAA;
		let arrayScoresFD = [];
		if(localStorage.scoresFD){
			arrayScoresFD = JSON.parse(localStorage.scoresFD);
			if(!Array.isArray(arrayScoresFD)) arrayScoresFD = [];
		}
		this.scoresFD = arrayScoresFD;
	},
	methods: {
		exit() {
			loadpage("../");
		}
	}
});

