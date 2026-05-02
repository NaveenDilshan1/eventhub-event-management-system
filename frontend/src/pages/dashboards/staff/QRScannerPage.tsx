// src/pages/dashboards/staff/QRScannerPage.tsx
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { QrCode, Camera, CheckCircle, XCircle, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";

interface Scan {
  id: string;
  name: string;
  ticketId: string;
  type: string;
  time: string;
  status: "success" | "failed";
  imageUrl?: string;
  message?: string;
}

const QRScannerPage = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [lastScanResult, setLastScanResult] = useState<Scan | null>(null);
  const html5QrRef = useRef<Html5Qrcode | null>(null);

  // Load recent scans from backend
  const fetchRecentScans = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/staff/recent-scans", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecentScans(data);
      }
    } catch (err) {
      console.error("Failed to fetch scans", err);
    }
  };

  const clearIndividualScan = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/staff/recent-scans/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        setRecentScans(prev => prev.filter(s => s.id !== id));
        toast.success("Scan record cleared");
      }
    } catch (err) {
      toast.error("Failed to delete record");
    }
  };

  useEffect(() => {
    fetchRecentScans();
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleScan = async (ticketId: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/staff/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ qrData: ticketId }),
      });

      const data = await res.json();

      if (!res.ok) {
        const isAlreadyScanned = data.message?.toLowerCase().includes("already");
        toast.error(data.message || "Scan failed!", {
          description: isAlreadyScanned ? "This ticket has already been used." : undefined
        });

        // Still update recent list to show failed attempt (backend now logs this)
        fetchRecentScans();

        // Update last result
        const failedResult: Scan = {
          id: Date.now().toString(),
          name: isAlreadyScanned ? "Already Scanned" : "Invalid Ticket",
          ticketId: ticketId,
          type: "-",
          time: new Date().toLocaleTimeString(),
          status: "failed",
          message: data.message
        };
        setLastScanResult(failedResult);

        // Sound feedback for failure
        const failAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3");
        failAudio.play().catch(() => { });
        return;
      }

      setLastScanResult({
        id: data.scan.id,
        name: data.scan.name,
        ticketId: data.scan.ticketId,
        type: data.scan.type,
        time: new Date().toLocaleTimeString(),
        status: "success",
      });

      fetchRecentScans();
      toast.success("Check-in successful!", {
        description: `${data.scan.name} (${data.scan.type}) confirmed.`,
      });

      // Sound feedback for success
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3");
      audio.play().catch(() => { });

    } catch (err) {
      console.error(err);
      toast.error("Network error during scan");
    }
  };

  const toggleScanner = async () => {
    if (isScanning) {
      if (html5QrRef.current) {
        try {
          await html5QrRef.current.stop();
          html5QrRef.current = null;
        } catch (err) {
          console.error("Stop failed", err);
        }
      }
      setIsScanning(false);
    } else {
      const html5Qr = new Html5Qrcode("qr-reader");
      html5QrRef.current = html5Qr;

      try {
        await html5Qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            handleScan(decodedText);
            if (navigator.vibrate) navigator.vibrate(100);
          },
          () => { } // error callback
        );
        setIsScanning(true);
      } catch (err) {
        toast.error("Could not start camera. Please check permissions.");
        console.error(err);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <QrCode className="h-8 w-8 text-primary" />
            Entry QR Scanner
          </h1>
          <p className="text-muted-foreground mt-1">Activate camera to verify attendee tickets in real-time.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera Section */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-md">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Camera className="h-5 w-5" />
                  Live Scanner View
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 flex flex-col items-center">
                <div
                  id="qr-reader"
                  className={`w-full max-w-sm aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 transition-all duration-500 ${isScanning ? "border-primary ring-8 ring-primary/10" : "border-muted bg-muted/20"
                    }`}
                />

                <div className="mt-8 w-full max-w-sm space-y-4">
                  <Button
                    size="lg"
                    className={`w-full h-14 text-lg font-bold shadow-lg transition-all duration-300 ${isScanning ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "bg-primary hover:bg-primary/90 shadow-primary/20"
                      }`}
                    onClick={toggleScanner}
                  >
                    {isScanning ? "Stop Scanner" : "Camera Active"}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                    {isScanning ? "Scanning for QR codes..." : "Camera is currently offline"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="space-y-6 flex flex-col h-full">
              {/* Last Scan Detail */}
              {lastScanResult && (
                <Card className={`border-2 animate-in fade-in zoom-in duration-300 relative group ${lastScanResult.status === "success" ? "border-green-500 bg-green-500/5" : "border-red-500 bg-red-500/5"
                  }`}>
                  <button
                    onClick={() => setLastScanResult(null)}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${lastScanResult.status === "success" ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
                        }`}>
                        {lastScanResult.status === "success" ? <CheckCircle className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold">{lastScanResult.name}</h3>
                        <p className="text-muted-foreground font-mono truncate">{lastScanResult.ticketId}</p>
                        {lastScanResult.message && <p className="text-sm font-semibold text-red-600 mt-1">{lastScanResult.message}</p>}
                      </div>
                      <Badge variant={lastScanResult.status === "success" ? "default" : "destructive"} className="text-lg py-1 px-4">
                        {lastScanResult.status === "success" ? "VERIFIED" : lastScanResult.message === "Already scanned" ? "RE-ENTRY" : "FAILED"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-4 text-xs h-8 border border-dashed hover:bg-red-50 hover:text-red-600"
                      onClick={() => setLastScanResult(null)}
                    >
                      Clear Result
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* History */}
              <Card className="flex-1 border-none shadow-xl bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {recentScans.map((scan, i) => (
                    <motion.div
                      key={scan.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-4 rounded-xl border transition-all group relative ${scan.status === "success" ? "bg-green-50 border-green-100 hover:bg-green-100/50" : "bg-red-50 border-red-100 hover:bg-red-100/50"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${scan.status === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                            {scan.status === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${scan.status === "success" ? "text-green-700" : "text-red-700"}`}>
                              {scan.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono">{scan.ticketId}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] h-5">{scan.type}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-medium text-muted-foreground">{scan.time}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                            onClick={() => clearIndividualScan(scan.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {recentScans.length === 0 && (
                    <div className="text-center py-12">
                      <QrCode className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground">No scans in this session yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QRScannerPage;
