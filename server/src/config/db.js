const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable public DNS servers to resolve MongoDB Atlas SRV and hostnames
// even when ISP/router/hotspot DNS fails to resolve SRV records (querySrv ENOTFOUND)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);
} catch (dnsErr) {
  console.warn('[DNS Warning] Could not set custom DNS servers:', dnsErr.message);
}

// Custom lookup function that resolves hostnames via public DNS, handling CNAME chains and options.all
const customLookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  dns.resolve4(hostname, (err, addresses) => {
    if (err) {
      dns.resolveCname(hostname, (cErr, cnames) => {
        if (cErr || !cnames || !cnames.length) {
          return dns.lookup(hostname, options, callback);
        }
        dns.resolve4(cnames[0], (c4Err, cAddresses) => {
          if (c4Err || !cAddresses || !cAddresses.length) {
            return dns.lookup(hostname, options, callback);
          }
          if (options && options.all) {
            callback(null, cAddresses.map((a) => ({ address: a, family: 4 })));
          } else {
            callback(null, cAddresses[0], 4);
          }
        });
      });
      return;
    }

    if (options && options.all) {
      callback(null, addresses.map((a) => ({ address: a, family: 4 })));
    } else {
      callback(null, addresses[0], 4);
    }
  });
};

let cachedConnection = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  const mongoURI =
    process.env.MONGODB_URI ||
    'mongodb+srv://mubeeth17_db_user:omDriAeanrm9g1qM@cluster0.hctj1le.mongodb.net/icetalk_restaurant?retryWrites=true&w=majority&appName=Cluster0';

  try {
    cachedConnection = mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000,
      lookup: customLookup,
    });
    const conn = await cachedConnection;
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);

    try {
      const { autoSeedIfNeeded } = require('../seed');
      await autoSeedIfNeeded();
    } catch (seedErr) {
      console.warn('[AutoSeed warning]:', seedErr.message);
    }

    return conn;
  } catch (error) {
    cachedConnection = null;
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;

