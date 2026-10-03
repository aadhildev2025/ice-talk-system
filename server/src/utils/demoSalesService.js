const User = require('../models/User');

/**
 * Provision dsuper user account (SuperADMIN)
 */
const initDemoUser = async () => {
  try {
    const existing = await User.findOne({ username: 'dsuper' });
    if (!existing) {
      const demoUser = new User({
        name: 'SuperADMIN',
        username: 'dsuper',
        password: 'dsuper123',
        role: 'superadmin',
        department: 'ALL',
        status: 'ACTIVE',
        phone: '+94 77 999 9999',
        isDemo: true,
      });
      await demoUser.save();
      console.log('[Demo Service] Created initial SuperADMIN user (dsuper / dsuper123)');
    } else {
      let needsSave = false;
      if (existing.name !== 'SuperADMIN') {
        existing.name = 'SuperADMIN';
        needsSave = true;
      }
      if (!existing.isDemo || existing.role !== 'superadmin' || existing.status !== 'ACTIVE') {
        existing.isDemo = true;
        existing.role = 'superadmin';
        existing.status = 'ACTIVE';
        needsSave = true;
      }
      if (needsSave) {
        await existing.save();
      }
    }
  } catch (err) {
    console.error('[Demo Service] Error initializing demo user:', err.message);
  }
};

module.exports = {
  initDemoUser,
  generateDemoSalesIfNeeded: async () => {}, // No-op, clean slate
};
