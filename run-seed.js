// run-seed.js
import { connectDB, closeDB } from './src/config/database.js';
import { cleanAndSeed, cleanupDatabase, runDatabaseSeeds } from './src/scrips/seed.js';

async function main() {
    let exitCode = 0;
    
    try {
        console.log('\n╔═══════════════════════════════════════════════════════╗');
        console.log('║        🌱 SEED DATABASE - NEON POSTGRESQL 🌱         ║');
        console.log('╚═══════════════════════════════════════════════════════╝\n');
        
        // Conectar a la base de datos
        console.log('🔌 Conectando a Neon PostgreSQL...');
        await connectDB();
        console.log('✅ Conexión establecida\n');
        
        // Determinar qué operación realizar
        const cleanupOnly = process.argv.includes('--cleanup-only');
        const seedOnly = process.argv.includes('--seed-only');
        const forceMode = process.argv.includes('--force');
        const yesMode = process.argv.includes('--yes');
        
        if (cleanupOnly) {
            console.log('🧹 Ejecutando solo limpieza de base de datos...\n');
            await cleanupDatabase();
            console.log('\n✅ Limpieza completada\n');
        } else if (seedOnly) {
            console.log('🌱 Ejecutando solo seeding (sin limpiar)...\n');
            await runDatabaseSeeds();
        } else {
            // Mostrar advertencia para limpieza completa
            if (!forceMode && !yesMode) {
                console.log('⚠️  ADVERTENCIA: Se borrarán TODOS los datos antes de sembrar.');
                console.log('   Para continuar, usa --yes o --force');
                console.log('   Ejemplo: node run-seed.js --yes\n');
                console.log('Opciones disponibles:');
                console.log('   --cleanup-only   Solo limpiar base de datos');
                console.log('   --seed-only      Solo sembrar (sin limpiar)');
                console.log('   --yes            Limpiar y sembrar sin confirmación');
                console.log('   --force          Forzar limpieza y siembra\n');
                process.exit(0);
            }
            
            console.log('🔄 Ejecutando limpieza y seeding completo...');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            
            await cleanAndSeed();
        }
        
        console.log('\n🎉 ¡Operación completada exitosamente!');
        console.log('📊 Los datos están listos para usar.\n');
        
    } catch (error) {
        console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('\n❌ ERROR DURANTE EL PROCESO');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.error('📋 Detalles del error:');
        console.error(error.message);
        
        if (error.code) {
            console.error('\n🔧 Código de error:', error.code);
        }
        
        console.error('\n💡 Posibles soluciones:');
        console.error('   1. Verifica que todas las tablas existan');
        console.error('   2. Revisa las restricciones de llaves foráneas');
        console.error('   3. Confirma que no haya datos duplicados');
        console.error('   4. Verifica la conexión a Neon PostgreSQL\n');
        
        exitCode = 1;
    } finally {
        // Cerrar conexión
        console.log('🔌 Cerrando conexión con Neon PostgreSQL...');
        await closeDB();
        console.log('✅ Conexión cerrada\n');
        
        process.exit(exitCode);
    }
}

// Manejar errores no capturados
process.on('unhandledRejection', (error) => {
    console.error('💥 Error no manejado:', error);
    process.exit(1);
});

// Ejecutar
main().catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
});