var load_objS = function(){
	var vue_instance = new Vue({
		el: "#scores_id",
		data: {
			scores: []
		},
		created: function(){
			let arrayScores = [];
			console.log(localStorage);
			if(localStorage.scores){
				arrayScores = JSON.parse(localStorage.scores);
				if(!Array.isArray(arrayScores)) arrayScores = [];
			}
			this.scores = arrayScores;
			console.log(this.scores);
		},
	});
	return {}; 
}();

