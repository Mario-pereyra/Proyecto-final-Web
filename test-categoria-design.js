// Script de verificación del diseño de categorías
console.log('🎨 Verificando diseño de categorías dinámicas...');

// Obtener categorías desde la API
fetch('http://localhost:3000/api/categorias/con-conteo')
  .then(res => res.json())
  .then(categorias => {
    console.log('\n📊 Categorías disponibles:');
    
    // Filtrar categorías con productos
    const categoriasConProductos = categorias
      .filter(categoria => categoria.totalAnuncios > 0)
      .sort((a, b) => b.totalAnuncios - a.totalAnuncios);
    
    categoriasConProductos.forEach((categoria, index) => {
      console.log(`${index + 1}. ${categoria.nombre}: ${categoria.totalAnuncios} productos`);
    });
    
    console.log('\n🎯 Top 6 categorías que se mostrarán en el index:');
    const top6 = categoriasConProductos.slice(0, 6);
    
    // Mapeo de diseños (igual que en el JS)
    const categoriaDesigns = {
      'Laptops y Computadoras': {
        bgClass: 'bg-laptops',
        icon: 'fa-solid fa-laptop',
        color: '🔵 Azul'
      },
      'Celulares y Smartphones': {
        bgClass: 'bg-smartphones',
        icon: 'fa-solid fa-mobile-screen-button',
        color: '🟢 Verde'
      },
      'Tablets y E-readers': {
        bgClass: 'bg-tablets',
        icon: 'fa-solid fa-tablet-screen-button',
        color: '🟡 Amarillo'
      },
      'Audio y Sonido': {
        bgClass: 'bg-audio',
        icon: 'fa-solid fa-headphones',
        color: '🟣 Morado'
      },
      'Smartwatches y Wearables': {
        bgClass: 'bg-smartwatches',
        icon: 'fa-solid fa-stopwatch',
        color: '🔵 Cyan'
      },
      'Dispositivos de Hogar Inteligente': {
        bgClass: 'bg-hogar',
        icon: 'fa-solid fa-house-signal',
        color: '🩷 Rosa'
      },
      'Gaming': {
        bgClass: 'bg-gaming',
        icon: 'fa-solid fa-gamepad',
        color: '🔴 Rojo'
      },
      'Cámaras y Drones': {
        bgClass: 'bg-camaras',
        icon: 'fa-solid fa-camera-retro',
        color: '⚫ Gris'
      },
      'Accesorios Electrónicos Generales': {
        bgClass: 'bg-accesorios',
        icon: 'fa-solid fa-plug',
        color: '🟠 Naranja'
      },
      'Almacenamiento': {
        bgClass: 'bg-almacenamiento',
        icon: 'fa-solid fa-hard-drive',
        color: '🟦 Azul claro'
      }
    };
    
    top6.forEach((categoria, index) => {
      const design = categoriaDesigns[categoria.nombre];
      if (design) {
        console.log(`   ${index + 1}. ${categoria.nombre}`);
        console.log(`      ${design.color} | ${design.icon} | ${categoria.totalAnuncios} productos`);
      } else {
        console.log(`   ${index + 1}. ${categoria.nombre} ⚠️  Sin diseño específico`);
      }
    });
    
    console.log('\n✅ Verificación de diseño completada!');
    console.log('🌐 Abre http://localhost:3000 para ver el resultado');
    
  })
  .catch(error => {
    console.error('❌ Error al verificar categorías:', error);
  });
