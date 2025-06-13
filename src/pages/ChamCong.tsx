import React, { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { searchFace } from "../service/employeeApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { getEmployeesByDate, updateShiftTime } from "../service/employeeApi";
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
        const today = new Date().toISOString().split("T")[0] + "T00:00:00";
        const employeesToday = await getEmployeesByDate(today);
        console.log(employeesToday);
        setEmployees(employeesToday);
      } catch (err) {
        setEmployees([]);
        console.error(
          "Lỗi khi lấy danh sách nhân viên có ca làm hôm nay:",
          err
        );
      }
    };
    fetchEmployeesToday();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Không thể truy cập camera:", error);
      setError("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
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
      const file = new File([blob], "capture.jpg", { type: blob.type });

      const res = await searchFace(file);

      const confidence = res.confidence;
      const userId = res.user_id;

      console.log("→ Độ tin cậy:", confidence);
      console.log("→ ID nhân viên:", userId);

      if (confidence > 80 && userId) {
        const matched = employees.find((emp) => emp.id === Number(userId));
        console.log(matched);
        if (matched) {
          setMatchedEmployee(matched);
          console.log(matched);
        } else {
          setError("Hôm nay bạn không có ca làm.");
        }
      } else if (confidence <= 80) {
        setError("Độ tin cậy nhận diện quá thấp. Vui lòng thử lại.");
      } else {
        setError("Không tìm thấy thông tin nhân viên trong hệ thống.");
      }
    } catch (err) {
      console.error("Lỗi khi nhận diện khuôn mặt:", err);
      setError("Không thể nhận diện khuôn mặt. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };
  const captureImage = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    if (canvas.width === 0 || canvas.height === 0) {
      setError("Camera chưa sẵn sàng. Vui lòng đợi một chút.");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageData);

      const now = new Date();
      const timeString = now.toLocaleString("vi-VN");
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
      if (!location.pathname.includes("/chamcong")) {
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
      } else if (location.pathname.includes("/chamcong")) {
        startCamera();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopCamera();
    };
  }, [location.pathname]);

  const handleDiemDanh = async (type: "in" | "out") => {
  if (!capturedImage) return;

  setLoading(true);
  setIsCheck(true);
  setError(null);

  try {
    setIsProcessing(true);

    const blob = await (await fetch(capturedImage)).blob();
    const file = new File([blob], "capture.jpg", { type: blob.type });

    const res = await searchFace(file);
    const confidence = res.confidence;
    const userId = res.user_id;

    console.log("→ Độ tin cậy:", confidence);
    console.log("→ ID nhân viên:", userId);

    if (confidence > 80 && userId) {
      const matched = employees.find((emp) => emp.id === Number(userId));
      if (matched) {
        setMatchedEmployee(matched);

        // Nếu nhân viên hợp lệ, cập nhật giờ vào/ra
        const now = new Date().toISOString();
        const payload = type === "in" ? { time_in: now } : { time_out: now };

        try {
          await updateShiftTime(matched.employeeShifts[0], payload);
        } catch (err) {
          alert("❌ Lỗi khi điểm danh. Vui lòng thử lại.");
        }
      } else {
        setError("Hôm nay bạn không có ca làm.");
      }
    } else if (confidence <= 80) {
      setError("Độ tin cậy nhận diện quá thấp. Vui lòng thử lại.");
    } else {
      setError("Không tìm thấy thông tin nhân viên trong hệ thống.");
    }
  } catch (err) {
    console.error("Lỗi khi nhận diện khuôn mặt:", err);
    setError("Không thể nhận diện khuôn mặt. Vui lòng thử lại.");
  } finally {
    setIsProcessing(false);
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Điểm danh bằng nhận diện gương mặt
        </h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-lg shadow-sm mb-4 animate-fade-in">
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {!capturedImage && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <div className="relative w-full aspect-video mb-4 rounded-lg overflow-hidden border border-gray-200">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
                <div className="absolute inset-0 border border-blue-500 rounded-lg animate-pulse"></div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
                  onClick={captureImage}
                  disabled={!stream || isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Đang xử lý...
                    </span>
                  ) : (
                    "Chấm công"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {matchedEmployee && (
          <div className="mt-4 bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 animate-fade-in">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-green-700">
                  Điểm danh thành công
                </h2>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                {matchedEmployee.image && (
                  <img
                    src={matchedEmployee.image}
                    alt="Avatar"
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                )}
                <div className="space-y-1">
                  <p className="text-gray-700 text-sm">
                    <span className="font-medium">ID:</span>{" "}
                    {matchedEmployee.id}
                  </p>
                  <p className="text-gray-700 text-sm">
                    <span className="font-medium">Họ tên:</span>{" "}
                    {matchedEmployee.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-4">
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-3xl text-blue-500 animate-spin"
            />
          </div>
        )}

        {matchedEmployee && (
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => {
                setCapturedImage(null);
                setIsProcessing(false);
                setMatchedEmployee(null);
                setCaptureTime(null);
                setError(null);
                setLoading(false);
                setIsCheck(false);
                startCamera();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm text-sm"
            >
              Hoàn tất
            </button>
          </div>
        )}

        {error && (
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => {
                setCapturedImage(null);
                setIsProcessing(false);
                setMatchedEmployee(null);
                setCaptureTime(null);
                setError(null);
                setLoading(false);
                setIsCheck(false);
                startCamera();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm text-sm"
            >
              Thử lại
            </button>
          </div>
        )}

        {capturedImage && (
          <div className="mt-4 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Ảnh đã chụp
              </h2>
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full rounded-lg shadow-sm"
                  style={{ transform: "scaleX(-1)" }}
                />
                <p className="text-xs text-gray-600 mt-2">
                  Thời gian: {captureTime}
                </p>
              </div>

              {!isCheck && (
                <div className="flex gap-3 mt-4 justify-center">
                  <button
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm text-sm"
                    onClick={() => {
                      setCapturedImage(null);
                      setIsProcessing(false);
                      setMatchedEmployee(null);
                      setCaptureTime(null);
                      setError(null);
                      setLoading(false);
                      setIsCheck(false);
                      startCamera();
                    }}
                  >
                    Chụp lại
                  </button>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm text-sm"
                    onClick={() => handleDiemDanh("in")}
                  >
                    Điểm danh vào
                  </button>
                  <button
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm text-sm"
                    onClick={() => handleDiemDanh("out")}
                  >
                    Điểm danh ra
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChamCong;
