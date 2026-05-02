import { useState } from "react";
import { Download, FileText, FileSpreadsheet, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "attendees" | "reports" | "tickets" | "users";
}

const exportFields = {
  attendees: ["Name", "Email", "Phone", "Ticket Type", "Check-in Status", "Check-in Time"],
  reports: ["Event Name", "Total Tickets", "Revenue", "Attendance Rate", "Date"],
  tickets: ["Ticket ID", "Event", "Buyer Name", "Price", "Status", "Purchase Date"],
  users: ["Name", "Email", "Role", "Department", "Status", "Created Date"],
};

export const ExportModal = ({ open, onOpenChange, type }: ExportModalProps) => {
  const { toast } = useToast();
  const [format, setFormat] = useState("excel");
  const [dateRange, setDateRange] = useState("all");
  const [selectedFields, setSelectedFields] = useState<string[]>(exportFields[type]);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    toast({
      title: "Export Complete",
      description: `Your ${type} data has been exported as ${format.toUpperCase()}.`,
    });
    
    setIsExporting(false);
    onOpenChange(false);
  };

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Configure your export settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={setFormat} className="flex gap-4">
              <div 
                className={`flex items-center gap-2 p-4 rounded-lg border-2 cursor-pointer flex-1 transition-all ${
                  format === "excel" ? "border-primary bg-primary/5" : "border-border"
                }`}
                onClick={() => setFormat("excel")}
              >
                <RadioGroupItem value="excel" id="excel" />
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                <Label htmlFor="excel" className="cursor-pointer">Excel</Label>
              </div>

              <div 
                className={`flex items-center gap-2 p-4 rounded-lg border-2 cursor-pointer flex-1 transition-all ${
                  format === "pdf" ? "border-primary bg-primary/5" : "border-border"
                }`}
                onClick={() => setFormat("pdf")}
              >
                <RadioGroupItem value="pdf" id="pdf" />
                <FileText className="h-5 w-5 text-red-600" />
                <Label htmlFor="pdf" className="cursor-pointer">PDF</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fields Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Fields to Include</Label>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedFields(
                  selectedFields.length === exportFields[type].length ? [] : exportFields[type]
                )}
              >
                {selectedFields.length === exportFields[type].length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 bg-secondary/30 rounded-lg">
              {exportFields[type].map((field) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={selectedFields.includes(field)}
                    onCheckedChange={() => toggleField(field)}
                  />
                  <label
                    htmlFor={field}
                    className="text-sm cursor-pointer"
                  >
                    {field}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleExport} 
              disabled={isExporting || selectedFields.length === 0}
            >
              {isExporting ? (
                "Exporting..."
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {format.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
