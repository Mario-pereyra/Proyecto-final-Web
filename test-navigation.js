// Script de prueba para verificar la navegación por categorías
console.log('🧪 Iniciando pruebas de navegación por categorías...');

// Simular diferentes escenarios de navegación
const testScenarios = [
  {
    name: 'Cargar página sin filtros',
    url: 'http://localhost:3000/pages/VerAnuncios.html',
    description: 'Debería mostrar todos los anuncios'
  },
  {
    name: 'Filtrar por categoría: Celulares',
    url: 'http://localhost:3000/pages/VerAnuncios.html?categoria=Celulares%20y%20Smartphones',
    description: 'Debería mostrar solo smartphones (3 anuncios)'
  },
  {
    name: 'Filtrar por categoría: Laptops',
    url: 'http://localhost:3000/pages/VerAnuncios.html?categoria=Laptops%20y%20Computadoras',
    description: 'Debería mostrar solo laptops (2 anuncios)'
  },
  {
    name: 'Búsqueda con texto: Galaxy',
    url: 'http://localhost:3000/pages/VerAnuncios.html?busqueda=Galaxy',
    description: 'Debería mostrar productos Galaxy'
  },
  {
    name: 'Filtro combinado',
    url: 'http://localhost:3000/pages/VerAnuncios.html?categoria=Celulares%20y%20Smartphones&busqueda=Galaxy',
    description: 'Debería mostrar solo Galaxy smartphones'
  }
];

// Función para probar cada escenario
async function probarEscenario(scenario) {
  console.log(`\n📋 Probando: ${scenario.name}`);
  console.log(`🔗 URL: ${scenario.url}`);
  console.log(`📝 Esperado: ${scenario.description}`);
  
  try {
    // Extraer parámetros de consulta de la URL
    const url = new URL(scenario.url);
    const params = new URLSearchParams(url.search);
    
    // Construir URL de API basada en los parámetros
    let apiUrl = 'http://localhost:3000/api/anuncios/buscar';
    if (params.toString()) {
      if (params.has('busqueda')) {
        params.set('busquedaTexto', params.get('busqueda'));
        params.delete('busqueda');
      }
      apiUrl += '?' + params.toString();
    }
    
    console.log(`🔍 API URL: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    const anuncios = await response.json();
    
    console.log(`✅ Estado: ${response.status}`);
    console.log(`📊 Resultados: ${anuncios.length} anuncios encontrados`);
    
    if (anuncios.length > 0) {
      console.log(`🎯 Muestra: ${anuncios[0].titulo} - ${anuncios[0].categoria}`);
    }
    
    return { success: true, count: anuncios.length, sample: anuncios[0] };
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Ejecutar todas las pruebas
async function ejecutarPruebas() {
  console.log('🚀 Ejecutando pruebas de integración...\n');
  
  for (const scenario of testScenarios) {
    await probarEscenario(scenario);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa entre pruebas
  }
  
  console.log('\n🎉 Pruebas completadas!');
}

ejecutarPruebas();
