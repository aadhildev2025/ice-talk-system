import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  QrCode,
  Lock,
  ArrowLeft,
  Flame,
  ShoppingBag,
  Clock,
  Sparkles,
} from 'lucide-react';

const SuperAdminCancelScanner = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login } = useAuth();

  // URL Query Parameters (from direct camera scan)
  const paramOrderId = searchParams.get('orderId');
  const paramOrderNumber = searchParams.get('orderNumber');
  const paramToken = searchParams.get('token');
  const paramAmount = searchParams.get('amount');

  // Super Admin Auth state
  const isSuperAdmin =
    user?.role === 'superadmin' ||
    user?.username === 'superadmin' ||
    user?.username === 'dsuper';

  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Manual search state
  const [manualSearchVal, setManualSearchVal] = useState('');
  const [manualSearchError, setManualSearchError] = useState('');

  // Scanner state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Active target order to cancel
  const [targetOrder, setTargetOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [cancelReason, setCancelReason] = useState('Takeaway cancelled via Super Admin QR scan');

  // Execution state
  const [submitting, setSubmitting] = useState(false);
  const [resultState, setResultState] = useState(null); // { success: true, message: '' } | { success: false, message: '' }

  // 1. If URL has orderId or token, load the order directly
  useEffect(() => {
    if (paramOrderId || paramOrderNumber) {
      loadOrderDetails(paramOrderId, paramOrderNumber, paramToken, paramAmount);
    }
  }, [paramOrderId, paramOrderNumber, paramToken]);

  const loadOrderDetails = async (id, orderNumber, token, amount) => {
    setLoadingOrder(true);
    setResultState(null);
    setManualSearchError('');
    try {
      if (id) {
        try {
          const res = await axios.get(`/api/orders/${id}`);
          if (res.data?.success && res.data.order) {
            setTargetOrder({ ...res.data.order, token });
            return;
          }
        } catch (_) {}
      }
      if (orderNumber) {
        try {
          const allRes = await axios.get('/api/orders');
          const allOrders = allRes.data?.orders || [];
          const matched = allOrders.find(
            (o) => String(o.orderNumber) === String(orderNumber) || String(o._id) === String(orderNumber)
          );
          if (matched) {
            setTargetOrder({ ...matched, token });
            return;
          }
        } catch (_) {}
      }
      // Fallback: construct card from query params
      setTargetOrder({
        _id: id || '',
        orderNumber: orderNumber || 'Unknown',
        total: Number(amount) || 0,
        tableNameSnapshot: 'Takeaway',
        orderType: 'TAKEAWAY',
        token,
        items: [],
      });
    } catch (_) {
      setTargetOrder({
        _id: id || '',
        orderNumber: orderNumber || 'Takeaway Order',
        total: Number(amount) || 0,
        tableNameSnapshot: 'Takeaway',
        orderType: 'TAKEAWAY',
        token,
        items: [],
      });
    } finally {
      setLoadingOrder(false);
    }
  };

  // 2. Handle Super Admin Login from Scanner screen
  const handleAuthSubmit = async (e) => {
    e?.preventDefault();
    if (!authPassword.trim()) {
      setAuthError('Please enter Super Admin password');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      // Try logging in with dsuper or superadmin
      let res = await login('superadmin', authPassword.trim());
      if (!res.success) {
        res = await login('dsuper', authPassword.trim());
      }
      if (!res.success) {
        setAuthError(res.message || 'Invalid Super Admin credentials');
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // 3. Camera lifecycle
  const startCamera = async () => {
    setCameraError('');
    setCameraActive(true);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access unavailable. Please grant permission or enter cancellation details.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Barcode / QR detection loop
  useEffect(() => {
    let animId = null;
    let detector = null;

    if ('BarcodeDetector' in window) {
      try {
        detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      } catch (_) {}
    }

    const checkFrame = async () => {
      if (
        cameraActive &&
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
        detector
      ) {
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes && codes.length > 0) {
            const rawVal = codes[0].rawValue;
            handleScannedUrl(rawVal);
            return;
          }
        } catch (_) {}
      }
      if (cameraActive) {
        animId = requestAnimationFrame(checkFrame);
      }
    };

    if (cameraActive) {
      animId = requestAnimationFrame(checkFrame);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [cameraActive]);

  const handleScannedUrl = (scannedText) => {
    stopCamera();
    try {
      const url = new URL(scannedText);
      const id = url.searchParams.get('orderId');
      const num = url.searchParams.get('orderNumber');
      const tok = url.searchParams.get('token');
      const amt = url.searchParams.get('amount');
      loadOrderDetails(id, num, tok, amt);
    } catch (_) {
      // If raw token or ID was scanned
      loadOrderDetails(scannedText, '', '', '');
    }
  };

  // 4. Authorize Takeaway Order Cancellation
  const handleAuthorizeCancellation = async () => {
    if (!targetOrder) return;
    setSubmitting(true);
    setResultState(null);
    try {
      const payload = {
        orderId: targetOrder._id,
        orderNumber: targetOrder.orderNumber,
        token: targetOrder.token || paramToken,
        reason: cancelReason || 'Takeaway order cancelled via Super Admin QR scan',
        superAdminPassword: authPassword || 'superadmin123',
      };

      const res = await axios.post('/api/orders/authorize-cancel', payload, {
        headers: {
          'x-superadmin-password': authPassword || 'superadmin123',
        },
      });

      if (res.data?.success) {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setResultState({
          success: true,
          message: res.data.message || `Order #${targetOrder.orderNumber} successfully cancelled!`,
        });
      } else {
        setResultState({
          success: false,
          message: res.data?.message || 'Failed to authorize cancellation.',
        });
      }
    } catch (err) {
      setResultState({
        success: false,
        message: err.response?.data?.message || err.message || 'Authorization failed. Check connection.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-white flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#141418] border-b border-[#24242E] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white font-display uppercase tracking-wider flex items-center gap-1.5">
              <span>Super Admin Scanner</span>
              <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded font-black">
                STRICT SECURITY
              </span>
            </h1>
            <p className="text-[10px] text-neutral-400">Takeaway Cancellation Authorization</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/admin')}
          className="p-2 rounded-xl bg-[#1C1C24] hover:bg-[#252530] text-neutral-300 hover:text-white border border-[#2B2B38] text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 space-y-4">
        {/* Step A: Super Admin Authentication Guard */}
        {!isSuperAdmin && (
          <div className="bg-[#141419] border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400 mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Super Admin Access Only</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Enter your Super Admin credentials or security password to activate the takeaway cancellation scanner.
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3 pt-2 text-left">
              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                  Super Admin Security Password / PIN
                </label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Enter Password or PIN (0000)"
                  className="w-full bg-[#1C1C24] border border-[#2B2B38] focus:border-purple-500 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none"
                  autoFocus
                />
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Unlock Scanner</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step B: Authenticated View */}
        {isSuperAdmin && (
          <>
            {/* Scanned Result Banner */}
            {resultState && (
              <div
                className={`p-5 rounded-3xl border shadow-2xl text-center space-y-3 animate-fadeIn ${
                  resultState.success
                    ? 'bg-gradient-to-b from-[#122417] to-[#141419] border-emerald-500/80 ring-2 ring-emerald-500/30'
                    : 'bg-[#1F1214] border-rose-500/60'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black ${
                    resultState.success
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                  }`}
                >
                  {resultState.success ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {resultState.success ? 'Takeaway Cancellation Approved!' : 'Cancellation Failed'}
                  </h3>
                  <p className="text-xs text-neutral-300 mt-1">{resultState.message}</p>
                </div>
                {resultState.success && (
                  <button
                    onClick={() => {
                      setTargetOrder(null);
                      setResultState(null);
                    }}
                    className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg uppercase tracking-wider"
                  >
                    Scan Next Order
                  </button>
                )}
              </div>
            )}

            {/* Target Order Card ready to be Cancelled */}
            {targetOrder && !resultState?.success && (
              <div className="bg-[#141419] border border-orange-500/40 rounded-3xl p-5 shadow-2xl space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#24242E] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500 animate-ping"></span>
                    <span className="font-black text-lg text-white font-display">
                      Takeaway Order #{targetOrder.orderNumber}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/40">
                    Awaiting Approval
                  </span>
                </div>

                {/* Amount Highlight */}
                <div className="bg-[#1C1C24] border border-[#2B2B38] rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Order Total</p>
                    <p className="text-2xl font-black text-[#FF6B00] font-display">
                      Rs. {(targetOrder.total || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Channel</p>
                    <p className="text-xs font-bold text-white bg-neutral-800 px-2 py-0.5 rounded mt-0.5">
                      {targetOrder.tableNameSnapshot || 'Takeaway'}
                    </p>
                  </div>
                </div>

                {/* Items Preview if available */}
                {targetOrder.items && targetOrder.items.length > 0 && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Items ({targetOrder.items.length})
                    </p>
                    {targetOrder.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-xs p-2 rounded-xl bg-[#1C1C24] border border-[#282834]"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded bg-neutral-800 text-neutral-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {it.quantity}x
                          </span>
                          <span className="font-bold text-white truncate">{it.name}</span>
                          {it.portion && it.portion !== 'Portion' && (
                            <span className="text-[9px] text-orange-400 bg-orange-500/10 px-1 rounded">
                              {it.portion}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-neutral-300 text-xs shrink-0">
                          Rs. {(it.total || it.price * it.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reason Input */}
                <div>
                  <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                    Cancellation Reason
                  </label>
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Reason (e.g. Customer cancelled, changed mind)"
                    className="w-full bg-[#1C1C24] border border-[#2B2B38] focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={handleAuthorizeCancellation}
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4" />
                        <span>Authorize & Cancel Takeaway Order</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setTargetOrder(null)}
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold transition-colors"
                  >
                    Cancel & Return to Scanner
                  </button>
                </div>
              </div>
            )}

            {/* Camera QR Viewfinder */}
            {!targetOrder && (
              <div className="bg-[#141419] border border-[#24242E] rounded-3xl p-5 shadow-2xl space-y-4 text-center">
                <div className="relative overflow-hidden rounded-2xl bg-black border border-[#2B2B38] aspect-square flex items-center justify-center">
                  {cameraActive ? (
                    <>
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      ></video>
                      {/* Animated Futuristic Laser Viewfinder overlay */}
                      <div className="absolute inset-8 border-2 border-dashed border-purple-500/80 rounded-2xl pointer-events-none flex items-center justify-center">
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse absolute top-1/2"></div>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 space-y-3">
                      <div className="w-16 h-16 rounded-3xl bg-[#1C1C24] border border-[#2B2B38] flex items-center justify-center text-neutral-400 mx-auto">
                        <Camera className="w-8 h-8" />
                      </div>
                      <p className="text-xs text-neutral-400 max-w-xs">
                        Point your camera at the Cancellation QR Code on the POS screen to instantly authorize order cancellation.
                      </p>
                    </div>
                  )}
                </div>

                {cameraError && (
                  <p className="text-xs text-rose-400 font-medium">{cameraError}</p>
                )}

                {/* Camera Toggle Button */}
                {!cameraActive ? (
                  <button
                    onClick={startCamera}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Camera Scanner</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="w-full bg-[#1C1C24] hover:bg-[#252530] text-neutral-300 hover:text-white font-bold py-3 rounded-2xl text-xs border border-[#2B2B38] transition-colors"
                  >
                    Stop Camera
                  </button>
                )}

                {/* Manual Order Number Entry Alternative */}
                <div className="pt-3 border-t border-[#24242E] text-left">
                  <p className="text-[11px] font-bold text-neutral-400 mb-2 flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-purple-400" />
                    <span>Or enter Order # / Scan Link directly:</span>
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const val = manualSearchVal.trim();
                      if (!val) return;
                      handleScanSuccess(val);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={manualSearchVal}
                      onChange={(e) => setManualSearchVal(e.target.value)}
                      placeholder="e.g. 42 or paste QR code link"
                      className="flex-1 bg-[#1C1C24] border border-[#2B2B38] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={loadingOrder || !manualSearchVal.trim()}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50"
                    >
                      {loadingOrder ? 'Finding...' : 'Review'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SuperAdminCancelScanner;
