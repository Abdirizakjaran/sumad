import { useEffect, useRef, useState } from 'react';
import { FiCamera, FiSearch, FiRefreshCw } from 'react-icons/fi';
import api from '../services/api';
import DetectionResult from '../components/DetectionResult';
import { playSuccessSound, playAlertSound } from '../utils/sounds';
import { connectSocket } from '../services/socket';

export default function CameraDetection() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [plateInput, setPlateInput] = useState('');
  const [check, setCheck] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [scanning, setScanning] = useState(false);

  const fetchHistory = () => {
    api.get('/camera/history', { params: { limit: 10 } }).then((r) => setHistory(r.data.detections));
  };

  useEffect(() => {
    fetchHistory();
    const socket = connectSocket();
    socket.on('detection:new', fetchHistory);
    return () => socket.off('detection:new');
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setScanning(true);
      const socket = connectSocket();
      socket.emit('camera:scanning', { status: 'active' });
    } catch {
      alert('Camera access denied. Use manual plate entry.');
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setScanning(false);
  };

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setLoading(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      const fd = new FormData();
      fd.append('snapshot', blob, 'capture.jpg');
      if (plateInput) fd.append('plateNumber', plateInput);
      try {
        const { data } = await api.post('/camera/detect', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        handleResult(data.check);
      } catch (err) {
        alert(err.response?.data?.message || 'Detection failed');
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg', 0.9);
  };

  const manualDetect = async () => {
    if (!plateInput.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/camera/detect', { plateNumber: plateInput });
      handleResult(data.check);
    } catch (err) {
      alert(err.response?.data?.message || 'Detection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResult = (result) => {
    setCheck(result);
    setShowResult(true);
    if (result.result === 'APPROVED') playSuccessSound();
    else if (result.result === 'UNPAID') playAlertSound();
    else playAlertSound();
    fetchHistory();
    setTimeout(() => setShowResult(false), 5000);
  };

  return (
    <div className="space-y-6">
      {showResult && <DetectionResult check={check} />}
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Smart Camera Detection</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            {scanning && (
              <div className="absolute inset-0 border-4 border-sumad-orange animate-pulse pointer-events-none" />
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {!stream ? (
              <button onClick={startCamera} className="btn-primary flex items-center gap-2">
                <FiCamera /> Start Camera
              </button>
            ) : (
              <>
                <button onClick={captureAndDetect} disabled={loading} className="btn-secondary flex items-center gap-2">
                  <FiCamera /> {loading ? 'Scanning...' : 'Capture & Scan'}
                </button>
                <button onClick={stopCamera} className="py-2 px-4 border rounded-lg">Stop</button>
              </>
            )}
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="font-semibold">Manual Plate Entry</h3>
          <input
            value={plateInput}
            onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
            placeholder="e.g. MOG1234"
            className="input-field text-2xl font-mono text-center tracking-widest"
          />
          <button onClick={manualDetect} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            <FiSearch /> Check Plate
          </button>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm">
            <p className="font-semibold mb-2">How it works:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
              <li>Scan plate via camera or enter manually</li>
              <li>System checks database instantly</li>
              <li>GREEN = Approved / CLEARED</li>
              <li>RED = Unpaid fines warning</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Detection History</h3>
          <button onClick={fetchHistory} className="text-sumad-blue flex items-center gap-1 text-sm">
            <FiRefreshCw /> Refresh
          </button>
        </div>
        <div className="space-y-2">
          {history.map((d) => (
            <div key={d.id} className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="font-mono font-bold">{d.plateNumber}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                d.result === 'APPROVED' ? 'bg-green-100 text-green-700' :
                d.result === 'UNPAID' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>{d.result}</span>
              <span className="text-xs text-slate-500">{new Date(d.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
