document.getElementById('saveAsImage').addEventListener('click', function() {
    html2canvas(document.getElementById('calendar')).then(function(canvas) {
        let link = document.createElement('a');
        link.download = 'calendario.png';
        link.href = canvas.toDataURL();
        link.click();
    });
});
