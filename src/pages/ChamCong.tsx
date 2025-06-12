import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { searchFace } from '../service/employeeApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faSpinner } from "@fortawesome/free-solid-svg-icons";
import { getEmployeesByDate, updateShiftTime } from '../service/employeeApi';
export interface Employee {
  id: number;
  name: string;
  address: string;
  birthday: string;
  created_at: string;
  email: string;
  gender: boolean;
  image: string;
  phone_number: string;
  position: string;
  salary: number;
  employeeShifts?: number[];
  bills?: number[];
  receipts?: number[];
}
const ChamCong: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [captureTime, setCaptureTime] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [matchedEmployee, setMatchedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCheck, setIsCheck] = useState(false);


  const location = useLocation();

  useEffect(() => {
   const fetchEmployeesToday = async () => {
    try {
      const today = new Date().toISOString().split('T')[0] + 'T00:00:00';
      const employeesToday = await getEmployeesByDate(today);
      console.log(employeesToday)
      setEmployees(employeesToday);
    } catch (err) {
      setEmployees([]);
      console.error('Lỗi khi lấy danh sách nhân viên có ca làm hôm nay:', err);
    }
  };
  fetchEmployeesToday();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Không thể truy cập camera:', error);
      setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const handleChamCong = async () => {
    if (!capturedImage) return;

    
    setIsCheck(true);
    try {
      setIsProcessing(true);
      setError(null);

      const blob = await (await fetch(capturedImage)).blob();
      const file = new File([blob], 'capture.jpg', { type: blob.type });

      const res = await searchFace(file);

      const confidence = res.confidence;
      const userId = res.user_id;

      console.log('→ Độ tin cậy:', confidence);
      console.log('→ ID nhân viên:', userId);

      if (confidence > 80 && userId) {
        const matched = employees.find(emp => emp.id === Number(userId));
        if (matched) {
          setMatchedEmployee(matched);
          console.log(matchedEmployee)
        } else {
          setError('Nhân viên không có trong hệ thống.');
        }
      } else if (confidence <= 80) {
        setError('Độ tin cậy nhận diện quá thấp. Vui lòng thử lại.');
      } else {
        setError('Không tìm thấy thông tin nhân viên trong hệ thống.');
      }
    } catch (err) {
      console.error('Lỗi khi nhận diện khuôn mặt:', err);
      setError('Không thể nhận diện khuôn mặt. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    if (canvas.width === 0 || canvas.height === 0) {
      setError('Camera chưa sẵn sàng. Vui lòng đợi một chút.');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);

      const now = new Date();
      const timeString = now.toLocaleString('vi-VN');
      setCaptureTime(timeString);

      setTimeout(() => {
        handleChamCong();
      }, 100);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      if (!location.pathname.includes('/chamcong')) {
        stopCamera();
      }
    };
    handleRouteChange();
    return () => stopCamera();
  }, [location.pathname]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopCamera();
      } else if (location.pathname.includes('/chamcong')) {
        startCamera();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopCamera();
    };
  }, [location.pathname]);

  const handleDiemDanh = async (type: 'in' | 'out') => {
    setLoading(true);
    handleChamCong();
    if (!matchedEmployee ) 
    {
      return;

    }
    const now = new Date().toISOString(); // ISO format

    const payload =
      type === 'in' ? { time_in: now } : { time_out: now };

    try {
      await updateShiftTime(matchedEmployee.employeeShifts[0], payload);
      setLoading(false)
    } catch (err) {
      alert('❌ Lỗi khi điểm danh. Vui lòng thử lại.');
    }
  };


  return (
    <div className="flex flex-col items-center p-6">
  <h1 className="text-2xl font-bold mb-2">Điểm danh bằng nhận diện gương mặt</h1>

  {error && (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded w-full max-w-lg mb-4">
      {error}
    </div>
  )}

  {!capturedImage && (
    <div className="bg-white flex flex-col items-center p-4 rounded-lg shadow-md w-full max-w-lg max-h-1/2">
      <div className="relative w-full aspect-video mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover rounded"
        />
      </div>

      <button
        className="bg-blue-600  cursor-pointer hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:bg-gray-400"
        onClick={captureImage}
        disabled={!stream || isProcessing}
      >
        {isProcessing ? 'Đang xử lý...' : 'Chấm công'}
      </button>
    </div>
  )}
  {matchedEmployee ? (
    <div className="mt-6 w-full max-w-md p-2 bg-green-50 border justify-center items-center flex flex-col border-green-300 rounded shadow">
      <h2 className="text-lg font-semibold text-green-800 "> Điểm danh thành công</h2>
      <div className="flex items-center gap-4">
        {matchedEmployee.image && (
          <img
            src={matchedEmployee.image}
            alt="Avatar"
            className="w-14 h-14 rounded-full object-cover"
          />
        )}
        <div>
          <p><strong>ID:</strong> {matchedEmployee.id}</p>
          <p><strong>Họ tên:</strong> {matchedEmployee.name}</p>
        </div>
      </div>      
    </div>
  ):(
    loading ? (
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-4xl text-blue-500 animate-spin m-4"
          />

    ): (
<div></div>
    )
  )}
  {matchedEmployee && (
    <div className="mt-2 max-w-md p-2 bg-green-50 cursor-pointer border-green-300 border justify-center items-center flex flex-col rounded shadow">
           <button
              onClick={() => {
  setCapturedImage(null);
  setIsProcessing(false);
  setMatchedEmployee(null);
  setCaptureTime(null);
  setError(null);
  setLoading(false);
  setIsCheck(false);
  startCamera(); // Đảm bảo camera chạy lại
}}

            >
              Hoàn tất
            </button>

    </div>
  )}
  {error && (
    <div className="mt-2 max-w-md p-2 bg-blue-300 cursor-pointer border-blue-300 border justify-center items-center flex flex-col rounded shadow">
           <button
              onClick={() => {
  setCapturedImage(null);
  setIsProcessing(false);
  setMatchedEmployee(null);
  setCaptureTime(null);
  setError(null);
  setLoading(false);
  setIsCheck(false);
  startCamera(); // Đảm bảo camera chạy lại
}}

            >Thử lại
            </button>

    </div>
  )}


  

  {capturedImage && (
    <div className="w-full max-w-xl bg-white p-4 text-center items-center justify-center flex flex-col rounded-lg shadow-md mt-4">
      <h2 className="text-lg font-semibold mb-2">Ảnh đã chụp</h2>
      <img src={capturedImage} alt="Captured" className="w-full rounded mb-2" />
      <p className="text-sm text-center flex text-gray-600">Thời gian: {captureTime}</p>

      {!isCheck &&
      (
        <div className="flex gap-4 mt-4">
        <button
          className="bg-green-600  cursor-pointer text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => handleDiemDanh('in')}
        >
          Điểm danh vào
        </button>
        <button
          className="bg-yellow-600  cursor-pointer text-white px-4 py-2 rounded hover:bg-yellow-700"
          onClick={() => handleDiemDanh('out')}
        >
          Điểm danh ra
        </button>
      </div>
      )}
    </div>
  )}

  
</div>

  );
};

export default ChamCong;
