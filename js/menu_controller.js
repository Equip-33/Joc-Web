var menu = new Vue({
	el: "#menu_id",
	data: {
		divided: false,
	},
	created: function () {
		this.divided= false
	},
	methods: {
		divideGame() {
			var x = document.getElementById("jocs");
			var b = document.getElementById("inici")
			console.log(x.style.display);
			console.log(b.style.display);
			if (x.style.display == 'grid'){
				console.log("Primer");
				x.style.display = "none";
			} 
			else {
				x.style.display = 'grid';
				b.style.display = 'none';
			}
		},
		load() {
		  // Lógica para el botón Load Game
		  loadpage("./html/load.html");
		},
		howToPlay() {
		  // Lógica para el botón Options
		  loadpage("./html/how_to_play.html");
		},
		scoreboard(){
			loadpage("./html/scoreboard.html");
		},
		clearData() {
		// Lógica para el botón Exit
		  	sessionStorage.clear();
			localStorage.clear();
		},
		mode1() {
		// Lógica para la opción normal
			sessionStorage.clear();
		  	name = prompt("User name");
		  	sessionStorage.setItem("playerName", name);
			loadpage("./html/aterratje_afortunat.html");
		},
		mode2() {
		 	// Lógica para la opción 2
			sessionStorage.clear();
		  	name = prompt("User name");
		  	sessionStorage.setItem("playerName", name);
			loadpage("./html/fly_doddging.html");
		}
	  }
});