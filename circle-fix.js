// Script para remover círculos indesejados dinamicamente
document.addEventListener('DOMContentLoaded', function() {
  // Função para remover círculos indesejados
  function removeCircles() {
    // Selecionar todos os elementos SVG ou divs que possam ser círculos
    const possibleCircles = document.querySelectorAll('svg, div[style*="border-radius: 50%"], div[style*="border-radius:50%"]');
    
    possibleCircles.forEach(element => {
      // Verificar se é um círculo grande
      if (element.tagName === 'SVG' || 
          (element.style && element.style.borderRadius && element.style.borderRadius.includes('50%')) ||
          (element.getAttribute('style') && element.getAttribute('style').includes('border-radius: 50%'))) {
        
        // Verificar se não é um ícone ou elemento importante
        if (element.parentElement && 
            !element.parentElement.classList.contains('insight-icon') && 
            !element.parentElement.classList.contains('user-profile') &&
            !element.parentElement.classList.contains('status-badge')) {
          element.style.display = 'none';
        }
      }
    });
  }
  
  // Executar imediatamente
  removeCircles();
  
  // Executar novamente após um curto atraso para pegar elementos carregados dinamicamente
  setTimeout(removeCircles, 500);
  setTimeout(removeCircles, 1000);
  setTimeout(removeCircles, 2000);
});
