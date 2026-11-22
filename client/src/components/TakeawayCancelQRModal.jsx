import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import {
  ShieldAlert,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Lock,
  ExternalLink,
  Copy,
} from 'lucide-react';

const TakeawayCancelQRModal = ({ isOpen, order, onClose, onCancelled }) => {
  const { socket } = useSocket();

  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null); // { qrDataUrl, qrUrl, token, orderNumber, total }
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualPassword, setManualPassword] = useState('');
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const pollIntervalRef = useRef(null);

  // 1. Request cancellation QR code when modal opens
  useEffect(() => {
    if (!isOpen || !order) {
      setQrData(null);
      setIsSuccess(false);
      setError('');
      setManualMode(false);
      setManualPassword('');
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError('');

    const initCancelRequest = async () => {
      try {
        const orderId = order._id || order.orderId;
        const res = await axios.post(`/api/orders/${orderId}/request-cancel`);
        if (isMounted && res.data?.success) {
          setQrData(res.data);
        } else if (isMounted) {
          setError(res.data?.message || 'Failed to generate cancellation QR code');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Could not initiate cancellation request');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initCancelRequest();

    return () => {
      isMounted = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, order]);

  // 2. Poll cancel status & listen to socket events
  useEffect(() => {
    if (!isOpen || !order || isSuccess || !qrData?.token) return;

    const orderId = order._id || order.orderId;

    const checkStatus = async () => {
      try {
        const res = await axios.get(`/api/orders/${orderId}/cancel-status?token=${qrData.token}`);
        if (res.data?.isCancelled) {
          triggerSuccess();
        }
      } catch (_) {}
    };

    pollIntervalRef.current = setInterval(checkStatus, 1500);

    // Socket listener for instant cancellation response
    const handleSocketOrderCancelled = (cancelledOrder) => {
      if (
        cancelledOrder &&
        (String(cancelledOrder._id) === String(orderId) ||
          String(cancelledOrder.orderNumber) === String(order.orderNumber))
      ) {
        triggerSuccess();
      }
    };

    if (socket) {
      socket.on('order:cancelled', handleSocketOrderCancelled);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (socket) {
        socket.off('order:cancelled', handleSocketOrderCancelled);
      }
    };
  }, [isOpen, order, qrData, isSuccess, socket]);

  const triggerSuccess = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setIsSuccess(true);
    setTimeout(() => {
      onCancelled && onCancelled(order._id || order.orderId);
      onClose && onClose();
    }, 1400);
  };

  // 3. Fallback: Submit Super Admin password manually
  const handleManualSubmit = async (e) => {
    e?.preventDefault();
    if (!manualPassword.trim()) {
      setError('Please enter Super Admin password');
      return;
    }

    setManualSubmitting(true);
    setError('');
    try {
      const orderId = order._id || order.orderId;
      const res = await axios.post('/api/orders/authorize-cancel', {
        orderId,
        orderNumber: order.orderNumber,
        token: qrData?.token,
        superAdminPassword: manualPassword.trim(),
        reason: 'Takeaway cancelled directly via Super Admin password',
      });

      if (res.data?.success) {
        triggerSuccess();
      } else {
        setError(res.data?.message || 'Authorization failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid Super Admin password.');
    } finally {
      setManualSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (qrData?.qrUrl) {
      navigator.clipboard.writeText(qrData.qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#141419] border border-purple-500/50 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2A2A38] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success State */}
        {isSuccess ? (
          <div className="py-6 space-y-3 animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/60 flex items-center justify-center mx-auto text-3xl font-black shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-display">Cancellation Approved!</h3>
              <p className="text-xs text-emerald-300 mt-1">
                Takeaway Order #{order.orderNumber} was successfully cancelled by Super Admin.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-black uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Super Admin Authorization</span>
              </div>
              <h3 className="text-base font-black text-white font-display pt-1">
                Cancel Takeaway Order #{order.orderNumber}
              </h3>
              <p className="text-xs text-neutral-400">
                Amount: <span className="text-[#FF6B00] font-black">Rs. {(order.total || 0).toLocaleString()}</span>
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Mode 1: QR Code Scanner Mode (Default) */}
            {!manualMode ? (
              <div className="space-y-3.5">
                {/* QR Code Card */}
                <div className="p-3 bg-white rounded-2xl shadow-xl max-w-[240px] mx-auto relative group">
                  {loading ? (
                    <div className="w-52 h-52 flex flex-col items-center justify-center gap-2 bg-neutral-100 rounded-xl">
                      <RefreshCw className="w-8 h-8 text-neutral-500 animate-spin" />
                      <span className="text-[11px] font-bold text-neutral-600">Generating Secure QR...</span>
                    </div>
                  ) : qrData?.qrDataUrl ? (
                    <img
                      src={qrData.qrDataUrl}
                      alt="Cancellation QR Code"
                      className="w-52 h-52 object-contain mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-52 h-52 flex items-center justify-center text-xs text-rose-600 font-bold bg-neutral-100 rounded-xl">
                      Could not load QR code.
                    </div>
                  )}
                </div>

                {/* Radar live polling indicator */}
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/25 py-2 px-3 rounded-xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping"></span>
                  <span>Awaiting Super Admin scan...</span>
                </div>

                <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
                  Scan this code with the <span className="text-purple-300 font-bold">Super Admin Scanner</span> web page or phone camera to authorize this cancellation.
                </p>

                {/* Manual Fallback & Copy Link buttons */}
                <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-400 border-t border-[#24242E]">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="hover:text-purple-300 flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setManualMode(true)}
                    className="hover:text-white flex items-center gap-1 font-bold transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Enter Password</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Mode 2: Manual Password Input Mode */
              <form onSubmit={handleManualSubmit} className="space-y-3 pt-1 text-left">
                <div>
                  <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                    Super Admin Security Password / PIN
                  </label>
                  <input
                    type="password"
                    value={manualPassword}
                    onChange={(e) => setManualPassword(e.target.value)}
                    placeholder="Enter Super Admin Password / PIN (0000)"
                    className="w-full bg-[#1C1C24] border border-[#2B2B38] focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setManualMode(false)}
                    className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold"
                  >
                    ← Back to QR
                  </button>
                  <button
                    type="submit"
                    disabled={manualSubmitting}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow"
                  >
                    {manualSubmitting ? 'Checking...' : 'Authorize'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TakeawayCancelQRModal;
