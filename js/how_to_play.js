var menu = new Vue({
	el: "#howToPlay_id",
	data: {
		divided: false,
	},
	created: function () {
		this.divided= false
	},
	methods: {
		exit() {
			loadpage("../");
		}
	  }
});