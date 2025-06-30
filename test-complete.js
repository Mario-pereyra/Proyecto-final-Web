// Test completo del sistema de categorías y subcategorías
console.log('🧪 Test completo del sistema AstroMarket');

async function runCompleteTest() {
  console.log('\n=== PRUEBA 1: API de categorías con conteo ===');
  try {
    const categorias = await fetch('http://localhost:3000/api/categorias/con-conteo').then(r => r.json());
    console.log('✅ Categorías obtenidas:', categorias.length);
    console.log('📊 Top 3 categorías:');
    categorias.slice(0, 3).forEach(cat => {
      console.log(`   - ${cat.nombre}: ${cat.totalAnuncios} productos`);
    });
  } catch (error) {
    console.error('❌ Error en categorías:', error);
  }

  console.log('\n=== PRUEBA 2: Búsqueda sin filtros ===');
  try {
    const anuncios = await fetch('http://localhost:3000/api/anuncios/buscar').then(r => r.json());
    console.log('✅ Anuncios obtenidos:', anuncios.length);
    console.log('📦 Muestra de anuncios:');
    anuncios.slice(0, 3).forEach(anuncio => {
      console.log(`   - ${anuncio.titulo}`);
      console.log(`     Categoría: ${anuncio.categoria}`);
      console.log(`     Subcategoría: ${anuncio.subcategoriaNombre || 'Sin subcategoría'}`);
      console.log(`     Estado: ${anuncio.estado}`);
      console.log(`     Imagen: ${anuncio.imagen_principal ? '✅' : '❌'}`);
    });
  } catch (error) {
    console.error('❌ Error en búsqueda:', error);
  }

  console.log('\n=== PRUEBA 3: Filtro por categoría ===');
  try {
    const smartphones = await fetch('http://localhost:3000/api/anuncios/buscar?categoria=Celulares%20y%20Smartphones').then(r => r.json());
    console.log('✅ Smartphones encontrados:', smartphones.length);
    smartphones.forEach(phone => {
      console.log(`   - ${phone.titulo} (${phone.subcategoriaNombre})`);
    });
  } catch (error) {
    console.error('❌ Error en filtro por categoría:', error);
  }

  console.log('\n=== PRUEBA 4: Subcategorías por categoría ===');
  try {
    const subcategorias = await fetch('http://localhost:3000/api/subcategorias/por-categoria/Celulares%20y%20Smartphones').then(r => r.json());
    console.log('✅ Subcategorías de smartphones:', subcategorias.length);
    subcategorias.forEach(sub => {
      console.log(`   - ${sub.nombre}`);
    });
  } catch (error) {
    console.error('❌ Error en subcategorías:', error);
  }

  console.log('\n=== PRUEBA 5: Filtro combinado ===');
  try {
    const galaxyPhones = await fetch('http://localhost:3000/api/anuncios/buscar?categoria=Celulares%20y%20Smartphones&subcategoria=Android&busquedaTexto=Galaxy').then(r => r.json());
    console.log('✅ Galaxy Android encontrados:', galaxyPhones.length);
    galaxyPhones.forEach(phone => {
      console.log(`   - ${phone.titulo} - $${phone.precio}`);
    });
  } catch (error) {
    console.error('❌ Error en filtro combinado:', error);
  }

  console.log('\n🎉 Pruebas completadas!');
  console.log('\n📋 URLs para probar manualmente:');
  console.log('🏠 Homepage: http://localhost:3000');
  console.log('📱 Ver Anuncios: http://localhost:3000/pages/VerAnuncios.html');
  console.log('📱 Filtro smartphones: http://localhost:3000/pages/VerAnuncios.html?categoria=Celulares%20y%20Smartphones');
  console.log('🔍 Búsqueda Galaxy: http://localhost:3000/pages/VerAnuncios.html?busqueda=Galaxy');
}

runCompleteTest();
