// Global stuff

Date.prototype.toAusDate = function () {
	return this.getDate() + "/" + this.getMonth() + "/" + this.getFullYear();
}