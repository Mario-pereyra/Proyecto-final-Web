// Test script to verify the complete integration
const tests = [
  {
    name: 'Categories with count',
    url: 'http://localhost:3000/api/categorias/con-conteo',
    expected: 'Array with category counts'
  },
  {
    name: 'Search all anuncios',
    url: 'http://localhost:3000/api/anuncios/buscar',
    expected: 'All active anuncios'
  },
  {
    name: 'Search by category',
    url: 'http://localhost:3000/api/anuncios/buscar?categoria=Celulares%20y%20Smartphones',
    expected: 'Only smartphone anuncios'
  },
  {
    name: 'Search by category and subcategory',
    url: 'http://localhost:3000/api/anuncios/buscar?categoria=Celulares%20y%20Smartphones&subcategoria=Android',
    expected: 'Only Android phone anuncios'
  },
  {
    name: 'Search by text',
    url: 'http://localhost:3000/api/anuncios/buscar?busquedaTexto=Galaxy',
    expected: 'Only Galaxy phone anuncios'
  },
  {
    name: 'Combined search',
    url: 'http://localhost:3000/api/anuncios/buscar?categoria=Celulares%20y%20Smartphones&subcategoria=Android&busquedaTexto=Galaxy',
    expected: 'Only Android Galaxy phones'
  },
  {
    name: 'Subcategories by category',
    url: 'http://localhost:3000/api/subcategorias/por-categoria/Celulares%20y%20Smartphones',
    expected: 'Subcategories for smartphones'
  }
];

async function runTests() {
  console.log('🚀 Starting AstroMarket Integration Tests\n');
  
  for (const test of tests) {
    try {
      console.log(`📋 Testing: ${test.name}`);
      console.log(`🔗 URL: ${test.url}`);
      
      const response = await fetch(test.url);
      const data = await response.json();
      
      console.log(`✅ Status: ${response.status}`);
      console.log(`📊 Results: ${Array.isArray(data) ? `${data.length} items` : 'Object'}`);
      
      if (Array.isArray(data) && data.length > 0) {
        console.log(`🎯 Sample: ${JSON.stringify(data[0], null, 2).substring(0, 200)}...`);
      }
      
      console.log('─'.repeat(50));
      
    } catch (error) {
      console.error(`❌ Test failed: ${test.name}`);
      console.error(`Error: ${error.message}`);
      console.log('─'.repeat(50));
    }
  }
  
  console.log('🎉 Integration tests completed!');
}

runTests();
