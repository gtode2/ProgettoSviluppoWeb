function closeProduct() {
    window.parent.document.getElementById("lat-iframe").src="/admin/report/report.html"
}
function openProduct(id){
    window.parent.document.getElementById("lat-iframe").src="/prodotti/dettaglio/dettagli.html?id="+id
}
