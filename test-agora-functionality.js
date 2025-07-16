/**
 * 🧪 Script de Testing para Funcionalidad Agora - Sirius Video Platform
 * 
 * Este script verifica que la implementación básica de Agora funciona correctamente.
 * Puede ejecutarse en la consola del navegador o como archivo independiente.
 */

// Configuración de testing
const AGORA_CONFIG = {
  appId: "0e9bc15cc29e45ba9dabf5e3adc37503", // App ID que funciona
  channel: "test-sirius",
  uid: null, // Agora asignará automáticamente
  useToken: false, // Modo testing sin certificado
  sdnVersion: "4.20.0" // Versión CDN que funciona
}

// Estado del test
let testResults = {
  sdkLoad: false,
  clientCreate: false,
  tracksCreate: false,
  connect: false,
  publish: false,
  cleanup: false
}

/**
 * Test 1: Cargar SDK de Agora desde CDN
 */
async function testAgoraSDKLoad() {
  console.log("🧪 Testing: Agora SDK Load...")
  
  return new Promise((resolve, reject) => {
    if (window.AgoraRTC) {
      console.log("✅ Agora SDK already loaded")
      testResults.sdkLoad = true
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://download.agora.io/sdk/release/AgoraRTC_N-${AGORA_CONFIG.sdnVersion}.js`
    
    script.onload = () => {
      console.log("✅ Agora SDK loaded successfully")
      testResults.sdkLoad = true
      resolve(true)
    }
    
    script.onerror = () => {
      console.error("❌ Failed to load Agora SDK")
      reject(new Error("SDK Load Failed"))
    }
    
    document.head.appendChild(script)
  })
}

/**
 * Test 2: Crear cliente Agora
 */
async function testClientCreation() {
  console.log("🧪 Testing: Client Creation...")
  
  try {
    const AgoraRTC = window.AgoraRTC
    AgoraRTC.setLogLevel(0) // Logging mínimo
    
    const client = AgoraRTC.createClient({ 
      mode: "rtc", 
      codec: "vp8" 
    })
    
    console.log("✅ Agora client created successfully")
    testResults.clientCreate = true
    return client
  } catch (error) {
    console.error("❌ Failed to create client:", error)
    throw error
  }
}

/**
 * Test 3: Crear tracks de audio y video
 */
async function testTracksCreation() {
  console.log("🧪 Testing: Tracks Creation...")
  
  try {
    const AgoraRTC = window.AgoraRTC
    
    const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
    
    console.log("✅ Audio and video tracks created successfully")
    testResults.tracksCreate = true
    return { audioTrack, videoTrack }
  } catch (error) {
    console.error("❌ Failed to create tracks:", error)
    throw error
  }
}

/**
 * Test 4: Conectar al canal
 */
async function testChannelConnection(client) {
  console.log("🧪 Testing: Channel Connection...")
  
  try {
    await client.join(
      AGORA_CONFIG.appId,
      AGORA_CONFIG.channel,
      AGORA_CONFIG.useToken ? "YOUR_TOKEN" : null,
      AGORA_CONFIG.uid
    )
    
    console.log("✅ Connected to channel successfully")
    testResults.connect = true
    return true
  } catch (error) {
    console.error("❌ Failed to connect to channel:", error)
    throw error
  }
}

/**
 * Test 5: Publicar tracks
 */
async function testPublishTracks(client, tracks) {
  console.log("🧪 Testing: Publishing Tracks...")
  
  try {
    await client.publish([tracks.audioTrack, tracks.videoTrack])
    
    console.log("✅ Tracks published successfully")
    testResults.publish = true
    return true
  } catch (error) {
    console.error("❌ Failed to publish tracks:", error)
    throw error
  }
}

/**
 * Test 6: Cleanup y desconexión
 */
async function testCleanup(client, tracks) {
  console.log("🧪 Testing: Cleanup...")
  
  try {
    // Detener tracks
    if (tracks.audioTrack) {
      tracks.audioTrack.stop()
      tracks.audioTrack.close()
    }
    if (tracks.videoTrack) {
      tracks.videoTrack.stop()
      tracks.videoTrack.close()
    }
    
    // Desconectar cliente
    await client.leave()
    
    console.log("✅ Cleanup completed successfully")
    testResults.cleanup = true
    return true
  } catch (error) {
    console.error("❌ Failed during cleanup:", error)
    throw error
  }
}

/**
 * Ejecutar todos los tests
 */
async function runAllTests() {
  console.log("🚀 Starting Agora Functionality Tests...")
  console.log("=" * 50)
  
  try {
    // Test 1: Load SDK
    await testAgoraSDKLoad()
    
    // Test 2: Create Client
    const client = await testClientCreation()
    
    // Test 3: Create Tracks
    const tracks = await testTracksCreation()
    
    // Test 4: Connect to Channel
    await testChannelConnection(client)
    
    // Test 5: Publish Tracks
    await testPublishTracks(client, tracks)
    
    // Wait 3 seconds to simulate real usage
    console.log("⏳ Simulating real usage for 3 seconds...")
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Test 6: Cleanup
    await testCleanup(client, tracks)
    
    // Report Results
    reportResults()
    
  } catch (error) {
    console.error("💥 Test suite failed:", error)
    reportResults()
  }
}

/**
 * Reportar resultados de testing
 */
function reportResults() {
  console.log("\n📊 TEST RESULTS:")
  console.log("=" * 30)
  
  Object.entries(testResults).forEach(([test, passed]) => {
    const icon = passed ? "✅" : "❌"
    console.log(`${icon} ${test}: ${passed ? "PASSED" : "FAILED"}`)
  })
  
  const totalTests = Object.keys(testResults).length
  const passedTests = Object.values(testResults).filter(result => result).length
  
  console.log(`\n🎯 Score: ${passedTests}/${totalTests} tests passed`)
  
  if (passedTests === totalTests) {
    console.log("🌟 ALL TESTS PASSED! Agora functionality is working correctly.")
  } else {
    console.log("⚠️  Some tests failed. Check implementation.")
  }
}

/**
 * Test rápido para verificar conectividad básica
 */
async function quickConnectivityTest() {
  console.log("⚡ Quick Connectivity Test...")
  
  try {
    await testAgoraSDKLoad()
    const client = await testClientCreation()
    await testChannelConnection(client)
    await client.leave()
    
    console.log("✅ Quick test PASSED - Basic connectivity works!")
    return true
  } catch (error) {
    console.log("❌ Quick test FAILED:", error.message)
    return false
  }
}

// Exportar funciones para uso en consola
if (typeof window !== 'undefined') {
  window.SiriusAgoraTests = {
    runAllTests,
    quickConnectivityTest,
    testResults,
    AGORA_CONFIG
  }
  
  console.log("🧪 Sirius Agora Tests loaded!")
  console.log("Run: SiriusAgoraTests.runAllTests() for full test")
  console.log("Run: SiriusAgoraTests.quickConnectivityTest() for quick test")
}

// Auto-run si se ejecuta directamente
if (typeof module === 'undefined' && typeof window !== 'undefined') {
  // Uncomment to auto-run tests when script loads
  // runAllTests()
} 