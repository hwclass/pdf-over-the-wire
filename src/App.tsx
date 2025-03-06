import React, { useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { Upload } from "lucide-react";
import { SamplePDF } from "./components/SamplePDF";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  ThemeProvider,
  createTheme,
  CssBaseline,
  TextField,
} from "@mui/material";
import { DataGridPro, LicenseInfo } from "@mui/x-data-grid-pro";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
  },
});

const columns = [
  { field: "product", headerName: "Product", width: 150 },
  { field: "description", headerName: "Description", width: 300 },
  { field: "price", headerName: "Price", width: 120 },
  {
    field: "stock",
    headerName: "Stock",
    width: 120,
    type: "number",
  },
];

const rows = [
  { id: 1, product: "Laptop Pro", description: "High-performance laptop for professionals", price: "$1,299.99", stock: 45 },
  { id: 2, product: "Desktop Ultra", description: "Powerful desktop workstation", price: "$1,899.99", stock: 28 },
  { id: 3, product: "Tablet Air", description: "Lightweight tablet for creatives", price: "$799.99", stock: 92 },
  { id: 4, product: "Smart Monitor", description: "4K HDR Professional Display", price: "$699.99", stock: 15 },
  { id: 5, product: "Wireless Dock", description: "Universal docking station", price: "$249.99", stock: 67 },
];

function App() {
  LicenseInfo.setLicenseKey(import.meta.env.MUI_X_LICENSE_KEY);

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"success" | "error" | null>(null);

  // Handle File Selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  // Handle File Upload
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF file before uploading.");
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Upload the PDF without validation
      const response = await fetch("http://127.0.0.1:3000/upload", {
        method: "POST",
        body: file, // ✅ Send raw file like --data-binary "@Test_Invoice.pdf" in a curl command
        headers: {
          "Content-Type": "application/pdf", // ✅ Ensure correct Content-Type
        },
      });

      const result = await response.json();
      alert(`PDF uploaded successfully! File key: ${result.file_key}`);
      setUploadStatus("success");
    } catch (error) {
      console.error("Upload Error:", error);
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Validate / Convert PDF
  const handleValidateConvert = async () => {
    if (!file) {
      alert("Please select a PDF file before validating.");
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Send the PDF binary to the /convert endpoint
      const response = await fetch("http://127.0.0.1:3000/convert", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.status === "VALID") {
        alert("PDF is already compliant with PDF/A-3.");
      } else {
        alert(`PDF converted to PDF/A-3! Converted file key: ${result.converted_file_key}`);
      }

      setUploadStatus("success");
    } catch (error) {
      console.error("Validation/Conversion Error:", error);
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", p: 4 }}>
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              PDF File Upload & Processing
            </Typography>

            {/* 📂 File Upload Section */}
            <Box sx={{ mb: 3 }}>
              <TextField
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                fullWidth
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                disabled={isUploading}
                onClick={handleUpload}
                startIcon={<Upload />}
              >
                Upload PDF
              </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                disabled={isUploading}
                onClick={handleValidateConvert}
                startIcon={<Upload />}
              >
                Validate / Convert PDF
              </Button>
            </Box>

            {/* ✅ Upload Status Messages */}
            {uploadStatus && (
              <Alert severity={uploadStatus === "success" ? "success" : "error"} sx={{ mb: 3 }}>
                {uploadStatus === "success"
                  ? "Operation completed successfully!"
                  : "Operation failed. Please try again."}
              </Alert>
            )}
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;