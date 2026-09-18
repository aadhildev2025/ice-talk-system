# Ice Talk POS — Client Setup & Deployment Guide

This guide explains how to generate, share, and run the **Ice Talk POS** setup installer with your restaurant clients.

---

## 1. How to Build the Setup Package (.exe)
To create the installer for clients:
1. Double-click **`build-setup.bat`** in the root directory (or run `npm run dist`).
2. The builder will automatically:
   - Sync the latest favicon & application icons from `client/src/favicon.png`
   - Build the optimized production frontend
   - Package the standalone Windows installer and portable `.exe` into the **`dist-setup`** folder.
3. When the build finishes, the **`dist-setup`** folder will open automatically.

---

## 2. Files to Share with Clients
Inside `dist-setup/`, you will find:
- **`Ice-Talk-POS-Setup-1.0.0.exe`** (Recommended): Full Windows installer that creates Desktop and Start Menu shortcuts with the Ice Talk icon.
- **`Ice Talk POS 1.0.0.exe`**: Portable single-file version that runs immediately without installation.

---

## 3. MongoDB & Menu Database Behavior
- **MongoDB in MongoDB Database**: All categories, menu items, prices, departments, and active statuses are stored dynamically in MongoDB.
- **Automatic First-Time Initialization**: When a client starts the app on a fresh MongoDB connection, the system automatically initializes:
  - Full default restaurant menu (Fried Rice, Kottu, Burgers, Buns, Short Eats, Fresh Juices, Milkshakes, Falooda, Sundaes, etc.)
  - Default restaurant table configurations (Family, Couple, VIP, Outdoor)
  - Staff & Manager accounts:
    - **Admin / Cashier**: `admin` / `admin123`
    - **Waiter 1**: `ahmed` / `waiter123`
    - **Waiter 2**: `fatima` / `waiter123`
    - **Kitchen Chef**: `kitchen` / `kitchen123`
    - **Juice Master**: `juice` / `juice123`
- **Restoring Default Menu**:
  In the **Admin Portal** -> **Menu Management**, admins can click the **"Restore Default Menu"** button at any time to re-sync or restore any missing factory default items directly into MongoDB.

---

## 4. Connecting MongoDB (Local or Cloud Atlas)
- **Local MongoDB**: Ensure MongoDB Community Server is running on the client machine (`mongodb://127.0.0.1:27017/icetalk_restaurant`).
- **Cloud MongoDB Atlas (Multi-Device / Remote)**: If the client wants multiple terminals (e.g. Waiter tablets + Cashier Desktop + Kitchen screens) connected together, set `MONGODB_URI` in `server/.env` to the MongoDB Atlas connection URI:
  ```env
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/icetalk_restaurant?retryWrites=true&w=majority
  ```

---

## 5. Favicon & Branding
The custom restaurant favicon (`client/src/favicon.png`) is linked across:
- Web browser tabs (`/favicon.png`)
- Desktop application title bar & taskbar
- Windows installer icon (`.exe`)

---

## 6. Silent Receipt Printing (No Printer Selection Dialog)
When running the **Ice Talk POS** desktop executable (`.exe`):
- **Zero Dialogs**: Every receipt and kitchen order slip is routed directly to the thermal printer with `silent: true`. No Windows print dialog, no print preview, and no prompt appears.
- **Default Printer Auto-Detection**: The desktop app automatically detects and prints to your Windows default printer.
- **Dedicated Off-Screen Thermal Engine**: Prints are formatted specifically for 58mm / 80mm continuous thermal paper roll widths with crisp black & white text and zero unwanted blank pages.
- **Printer Selection (Optional)**: If you have multiple printers connected, an admin can choose a specific printer in the top Navbar, or leave it set to **"Default Printer (Auto)"**.

