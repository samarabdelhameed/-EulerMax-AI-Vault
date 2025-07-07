const { getVaultData } = require('./controllers/vaultController');

async function testVaultController() {
  try {
    console.log('🔧 اختبار VaultController...');
    
    // محاكاة request و response objects
    const req = {};
    const res = {
      status: (code) => {
        console.log('📊 Status Code:', code);
        return {
          json: (data) => {
            console.log('✅ Vault Data:', data);
          }
        };
      }
    };
    
    // اختبار قراءة بيانات الفولت
    await getVaultData(req, res);
    
    console.log('🎉 VaultController يعمل بشكل صحيح!');
    
  } catch (error) {
    console.error('❌ خطأ في VaultController:', error.message);
  }
}

testVaultController(); 