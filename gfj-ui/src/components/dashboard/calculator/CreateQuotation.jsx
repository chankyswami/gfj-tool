import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Menu,
  CircularProgress,
} from "@mui/material";
import { Add, Delete, Close, ArrowDropDown } from "@mui/icons-material";
import { toast } from "react-toastify";
import { FaWhatsapp } from "react-icons/fa";

import jsPDF from "jspdf";
import dayjs from "dayjs";
import "jspdf-autotable";
import { Formik, Form, Field } from "formik";
import { useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import HeaderCard from "../../HeaderCard";
import apiClient from "../../../app/axiosConfig";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const purityToPercentMap = {
  22: 92,
  18: 75,
  14: 59,
  10: 43,
  9: 38.5,
  Silver: 100,
};

const roundRanges = {
  "0.50-2.30": "(0.5-2.3mm) Natural Diamonds Round",
  "2.40-2.75": "(2.3-2.7mm) Natural Diamonds Round",
  "2.80-3.30": "(2.7-3.3mm) Natural Diamonds Round",
  "Above-3.30": "(Above 3.3mm) Natural Diamonds Round",
};

const baguetteRanges = {
  "1.50-2.10": "(0.5-2.3mm) Natural Diamonds Baguette",
  "2.20-2.60": "(2.3-2.7mm) Natural Diamonds Baguette",
  "2.70-4.00": "(2.7-4.0mm) Natural Diamonds Baguette",
  "Above-4.00": "(Above 4.0mm) Natural Diamonds Baguette",
};

const CreateQuotation = ({
  calculatorData,
  client,
  isEdit,
  quotationDetails,
  quotationTable,
  quotationId,
  parentContentRows,
  parentTotalsSection,
  parentQuotationDetails,
  isChild,
}) => {
  const { id, token } = useSelector((state) => state.user.userDetails || {});
  const [contentRows, setContentRows] = useState([]);
  const [contentStarted, setContentStarted] = useState(false);
  const [showValuesSection, setShowValuesSection] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);
  const [openClearAll, setOpenClearAll] = useState(false);
  const [profitAndLabour, setProfitAndLabour] = useState();
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showSave, setShowSave] = useState(true);
  const [imageUrl, setImageUrl] = useState();
  const [quotationNumber, setQuotationNumber] = useState("");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState({
    goldPrice: "0.00",
    goldWastage: client?.goldWastagePercentage?.toFixed(2) || "0.00",
    weight: "0.00",
    diamondSetting: client?.diamondSettingPrice?.toFixed(2) || "0.00",
    profitLabour: client?.profitAndLabourPercentage?.toFixed(2) || "0.00",
    purity: "43",
    roundsRange1: "10.00",
    roundsRange2: "20.00",
    roundsRange3: "20.00",
    roundsRange4: "20.00",
    baguettesRange1: "50.00",
    baguettesRange2: "50.00",
    baguettesRange3: "50.00",
    baguettesRange4: "50.00",
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [materials, setMaterials] = useState([]);
  const exportRef = useRef();

  useEffect(() => {
    if (!isEdit) {
      if (materials?.length > 0 && client) {
        const goldMaterial = materials.find(
          (item) => item?.title?.toLowerCase() === "gold"
        );

        setDetails({
          goldPrice: (goldMaterial?.price / 86.46)?.toFixed(2) || "0.00",
          goldWastage: client?.goldWastagePercentage?.toFixed(2) || "0.00",
          weight: "15.00",
          diamondSetting: client?.diamondSettingPrice?.toFixed(2) || "0.00",
          profitLabour: client?.profitAndLabourPercentage?.toFixed(2) || "0.00",
          purity: "43",
          roundsRange1: "10.00",
          roundsRange2: "20.00",
          roundsRange3: "20.00",
          roundsRange4: "20.00",
          baguettesRange1: "50.00",
          baguettesRange2: "50.00",
          baguettesRange3: "50.00",
          baguettesRange4: "50.00",
        });
      }
    }
  }, [materials, client, isEdit]);

  useEffect(() => {
    console.log("Client", client)
    if (isEdit) {
      setDetails(quotationDetails);
      setShowValuesSection(true);
      setContentRows(quotationTable);
      return;
    }
    const fetchMaterials = async () => {
      try {
        const response = await apiClient.get("/businessAdmin/materials");
        console.log("Response Material", response);
        setMaterials(response?.data);
      } catch (error) {
        console.error("Error fetching materials:", error);
      }
    };

    fetchMaterials();
  }, [token, client]);

  const addContentRow = () => {
    if (!contentStarted) setContentStarted(true);
    const newRow = ["", ""];
    setContentRows([...contentRows, newRow]);
  };

  const updateContentCell = (rowIndex, colIndex, value) => {
    const updatedRows = [...contentRows];
    updatedRows[rowIndex][colIndex] = value;
    setContentRows(updatedRows);
  };

  const deleteContentRow = (index) => {
    const updatedRows = contentRows.filter((_, i) => i !== index);
    setContentRows(updatedRows);
  };

  const clearAllEntries = () => {
    setContentRows([]);
    setContentStarted(false);
  };

  const handleCloseValuesSection = () => {
    setOpenWarning(true);
  };

  const handleWarningClose = (confirmed) => {
    setOpenWarning(false);
    if (confirmed) {
      setShowValuesSection(false);
      clearAllEntries();
    }
  };

  const handleStartAddingEntries = (formValues) => {
    const ndrRange = {
      round: {
        "0.50-2.30": formValues?.roundsRange1 || 1,
        "2.40-2.75": formValues?.roundsRange2 || 1,
        "2.80-3.30": formValues?.roundsRange3 || 1,
        "Above-3.30": formValues?.roundsRange4 || 1,
      },
      baguettes: {
        "1.50-2.10": formValues?.baguettesRange1 || 1,
        "2.20-2.60": formValues?.baguettesRange2 || 1,
        "2.70-4.00": formValues?.baguettesRange3 || 1,
        "Above-4.00": formValues?.baguettesRange4 || 1,
      },
    };
    const computedRows = [];

    const currentGoldValue =
      (((parseFloat(formValues?.goldPrice || 0) / 10) *
        (formValues?.purity || 0)) /
        100) *
      formValues?.weight;
    computedRows.push([
      `Current Pure Gold Price \t [ ($${(parseFloat(formValues?.goldPrice || 0) / 10)} x ${formValues?.weight}g) x ${formValues?.purity}% ] `,
      currentGoldValue?.toFixed(2),
    ]);
    computedRows.push([
      `Gold Wastage \t [ ($${currentGoldValue?.toFixed(2)} x ${formValues?.goldWastage}%) / 100 ] `,
      ((currentGoldValue?.toFixed(2) * formValues?.goldWastage) / 100)?.toFixed(
        2
      ),
    ]);

    // Round CTWs
    Object.entries(roundRanges).forEach(([key, label]) => {
      const weight = calculatorData?.rounds?.[key]?.totalWeight || 0;
      const multiplier = ndrRange?.round?.[key] || 0;
      const res = (weight * multiplier)?.toFixed(2);
      if (res > 0) {
        label = `${label} \t [ ${weight}g x $${multiplier} ]`;
        computedRows.push([label, res]);
      }
    });

    // Baguette CTWs
    Object.entries(baguetteRanges).forEach(([key, label]) => {
      const weight = calculatorData?.baguettes?.[key]?.totalWeight || 0;
      const multiplier = ndrRange?.baguettes?.[key] || 0;
      const res = (weight * multiplier)?.toFixed(2);
      if (res > 0) {
        label = `${label} \t [ ${weight}g x $${multiplier} ]`;
        computedRows.push([label, res]);
      }
    });

    computedRows.push([
      `Diamond Setting \t [ ${calculatorData?.totalGems} x $${formValues?.diamondSetting} ] `,
      (calculatorData?.totalGems * formValues?.diamondSetting)?.toFixed(2),
    ]);
    computedRows.push([`Cad-Cam Wax`, client?.cadCamWaxPrice?.toFixed(2)]);

    setContentStarted(true);
    setShowValuesSection(true);
    setContentRows(computedRows);
  };

  useEffect(() => {
    const sum = contentRows?.reduce((acc, row) => {
      if (row[0] === "Profit & Labour" || row[0] === "Total") return acc;
      const value = parseFloat(row[1]);
      return acc + (isNaN(value) ? 0 : value);
    }, 0);

    setSubtotal(sum?.toFixed(2));
    const profitLabour = sum * (details?.profitLabour / 100);
    setProfitAndLabour(profitLabour?.toFixed(2));
    setTotal((sum + profitLabour)?.toFixed(2));
  }, [contentRows, details]);

  // Helper to generate the PDF and return the jsPDF instance
  const generateQuotationPDF = async (
    contentRows,
    subtotal,
    profitAndLabour,
    total,
    quotationNumberParam = null
  ) => {
    const doc = new jsPDF();

    // Helper: Load logo as base64
    const getBase64FromImageUrl = (url) =>
      new Promise((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const base64String = canvas.toDataURL("image/png");
          resolve(base64String);
        };
        img.onerror = reject;
        img.src = url;
      });

    // Try loading logo
    let logoBase64 = "";
    try {
      logoBase64 = await getBase64FromImageUrl("/src/assets/gfj.png");
      if (!logoBase64)
        logoBase64 = await getBase64FromImageUrl("/assets/gfj.png");
    } catch {
      //
    }

    // Add logo
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", 14, 10, 25, 25);
    }

    // Title
    doc.setFontSize(22);
    doc.setFont(undefined, "bold");
    doc.text("QUOTATION", 190, 20, { align: "right" });

    // Client + Quotation Details
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");

    // Client Section
    const clientX = 14;
    const clientY = 40;
    doc.setFillColor(105, 41, 117); // #692975
    doc.setTextColor(255, 255, 255);
    doc.rect(clientX, clientY, 60, 7, "F");
    doc.text("CUSTOMER", clientX + 2, clientY + 5);

    doc.setTextColor(0, 0, 0);
    const customerDetails = [
      `${client?.clientName || "##NAME"}`,
      `${client?.businessAddress || "##STREET NAME"}`,
      `${client?.city || "##CITY"}, ${client?.state || "##STATE"}`,
      `${client?.country || "##COUNTRY"} - ${client?.zipCode || "##PINCODE"}`,
      `Phone: ${client?.phoneNumber || "##PHONE NUMBER"}`,
      `Email: ${client?.email || "##EMAIL"}`,
    ];
    customerDetails.forEach((line, i) => {
      doc.text(line, clientX, clientY + 14 + i * 6);
    });

    // Quotation Info Section
    const formattedDate = dayjs().format("DD-MM-YYYY");
    const quoteInfo = [
      ["DATE", formattedDate],
      ["QUOTE", quotationNumberParam || quotationNumber],
    ];
    const quoteX = 120;
    const quoteY = 40;
    quoteInfo.forEach(([label, value], i) => {
      doc.text(label, quoteX, quoteY + i * 6);
      doc.text(value, quoteX + 30, quoteY + i * 6);
    });

    // Calculate client section end position
    const clientSectionEnd = clientY + 14 + customerDetails.length * 6 + 4; // 15px gap

    // DESCRIPTION SECTION (above table)
    const descY = clientSectionEnd;
    doc.setFillColor(105, 41, 117); // #692975
    doc.setTextColor(255, 255, 255);
    doc.rect(14, descY, 182, 7, "F");
    doc.text("DESCRIPTION", 16, descY + 5);
    doc.setTextColor(0, 0, 0);

    let descEndY = descY + 7; // start after header bar
    if (description && description.trim()) {
      const lineHeight = 6; // consistent spacing
      const descContentLines = description.split("\n");

      descContentLines.forEach((line, i) => {
        doc.text(line, 14, descY + 12 + i * lineHeight); // smaller top padding (12 instead of 14)
      });

      // last line Y position
      descEndY = descY + 12 + descContentLines.length * lineHeight;
    }


    const genKeyLabelMap = {
      goldPrice: "Gold Price ($)",
      goldWastage: "Gold Wastage (%)",
      weight: "Weight (g)",
      diamondSetting: "Diamond Setting ($)",
      profitLabour: "Profit & Labour (%)",
      purity: "Purity (%)",
    };

    const genDetails = details || {};
    const validKeys = Object.keys(genDetails).filter((key) =>
      Object.keys(genKeyLabelMap).includes(key)
    );

    const genHeaders = [validKeys.map((key) => genKeyLabelMap[key])];
    const genBody = [validKeys.map((key) => genDetails[key])];

    doc.autoTable({
      head: genHeaders,
      body: genBody,
      startY: descEndY + 4, // directly below description
      styles: { fontSize: 9, halign: "center" },
      headStyles: { fillColor: [105, 41, 117] },
      margin: { left: 14, right: 14 },
      tableWidth: 182,
    });

    // ✅ Use lastAutoTable.finalY as anchor
    let currentY = doc.lastAutoTable.finalY + 10;

    // --- PRODUCT TABLE (child) ---
    doc.autoTable({
      head: [["PRODUCT", "AMOUNT"]],
      body: contentRows.map((row) => [
        String(row[0].substring(0, row[0].indexOf("[")) || ""),
        String("$ " + row[1] || ""),
      ]),
      startY: currentY,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [105, 41, 117] },
      columnStyles: {
        0: { cellWidth: 145 },
        1: { cellWidth: 37, halign: "left" },
      },
      margin: { left: 14, right: 14 },
      tableWidth: 182,
    });

    const tableY = doc.lastAutoTable.finalY + 10;
    const totals = [
      ["Subtotal", "$ " + subtotal],
      ["Profit & Labour", "$ " + profitAndLabour],
      ["TOTAL", "$ " + total],
    ];
    totals.forEach(([label, value], i) => {
      if (label === "TOTAL") {
        doc.setFont(undefined, "bold");
      }
      doc.text(label, 130, tableY + i * 6);
      doc.text(value, 162, tableY + i * 6);
      doc.setFont(undefined, "normal");
    });
    currentY = doc.lastAutoTable.finalY + 12;

    // --- ORIGINAL QUOTATION (parent) ---
    if (isEdit && isChild) {
      doc.setFillColor(105, 41, 117); // purple
      doc.setTextColor(255, 255, 255);
      doc.rect(14, currentY, 182, 7, "F");
      doc.text("ORIGINAL QUOTATION", 16, currentY + 5);
      doc.setTextColor(0, 0, 0);

      // parent generic details
      const genParentDetails = parentQuotationDetails || {};
      const validParentKeys = Object.keys(genParentDetails).filter((key) =>
        Object.keys(genKeyLabelMap).includes(key)
      );

      doc.autoTable({
        head: [validParentKeys.map((key) => genKeyLabelMap[key])],
        body: [validParentKeys.map((key) => genParentDetails[key])],
        startY: currentY + 12,
        styles: { fontSize: 9, halign: "center" },
        headStyles: { fillColor: [105, 41, 117] },
        margin: { left: 14, right: 14 },
        tableWidth: 182,
      });

      currentY = doc.lastAutoTable.finalY + 10;

      // parent product table
      doc.autoTable({
        head: [["PRODUCT", "AMOUNT"]],
        body: parentContentRows.map((row) => [
          String(row[0].substring(0, row[0].indexOf("[")) || ""),
          String("$ " + row[1] || ""),
        ]),
        startY: currentY,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [105, 41, 117] },
        columnStyles: {
          0: { cellWidth: 145 },
          1: { cellWidth: 37, halign: "left" },
        },
        margin: { left: 14, right: 14 },
        tableWidth: 182,
      });

      currentY = doc.lastAutoTable.finalY + 10;

      // parent totals
      const totals = [
        ["Subtotal", "$ " + parentTotalsSection?.subtotal],
        ["Profit & Labour", "$ " + parentTotalsSection?.profitAndLabour],
        ["TOTAL", "$ " + parentTotalsSection?.total],
      ];
      totals.forEach(([label, value], i) => {
        if (label === "TOTAL") doc.setFont(undefined, "bold");
        doc.text(label, 130, currentY + i * 6);
        doc.text(value, 162, currentY + i * 6);
        doc.setFont(undefined, "normal");
      });
    }

    doc.setFont(undefined, "italic");
    doc.text("Contact Us:", 14, 274);
    doc.text("Email: admin@gemsfromjaipur.com", 14, 280);
    doc.text("Phone: +91-9828882226", 14, 286);
    doc.setFont(undefined, "bolditalic");
    doc.text("Thank You For Your Business!", 14, 292);
    return doc;
  };

  const handleSaveQuotation = async () => {
    setIsSaving(true);
    try {
      const data = {
        quotationTable: contentRows,
        quotationDetails: details,
        client: client,
        description: description,
        contentRows: contentRows,
        calculatorData: calculatorData,
        totalsSection: { subtotal, profitAndLabour, total },
      };

      let requestBody = {
        data: JSON.stringify(data),
        price: total,
        agentId: id,
        clientId: client?.id,
        quotationStatus: "new",
        description: description,
      };

      let response;
      if (isEdit) {
        const { quotationStatus, ...rest } = requestBody;
        requestBody = {
          ...rest,
        };
        if (isChild) {
          requestBody.finalQuotationId = quotationId;
          response = await apiClient.post(
            `/agent/updateFinalQuotation`,
            requestBody,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } else {
          requestBody.quotationId = quotationId;
          response = await apiClient.post(
            `/agent/updateQuotation`,
            requestBody,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      } else {
        response = await apiClient.post(`/agent/createQuotation`, requestBody, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
      console.log("Save Quotation Response", response);
      if (response?.status === 200) {
        if (isChild) {
          setQuotationNumber(quotationId);
          uploadImage(quotationId);
        } else {
          const newQuotationNumber = response?.data?.quotationId || quotationId;
          setQuotationNumber(newQuotationNumber);
          uploadImage(newQuotationNumber);
        }
      }
      toast.success(`Quotation Saved Successfully!`);
    } catch (error) {
      console.error("Error Saving Quotation", error);
      toast.error("Error While Saving Quotation!");
    } finally {
      setIsSaving(false);
    }
  };

  const downloadPDF = async () => {
    const doc = await generateQuotationPDF(
      contentRows,
      subtotal,
      profitAndLabour,
      total
    );
    doc.save(`${client?.clientName}_quotation_${Date.now()}.pdf`);
  };

  const downloadImage = async () => {
    const doc = await generateQuotationPDF(
      contentRows,
      subtotal,
      profitAndLabour,
      total
    );
    const pdfBlob = doc.output("blob");
    const reader = new FileReader();
    reader.onload = async function (e) {
      const typedarray = new Uint8Array(e.target.result);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport: viewport }).promise;
      const link = document.createElement("a");
      link.download = `${client?.clientName}_quotation_${Date.now()}.jpeg`;
      link.href = canvas.toDataURL("image/jpeg");
      link.click();
    };
    reader.readAsArrayBuffer(pdfBlob);
  };

  const uploadImage = async (quotationId) => {
    try {
      const doc = await generateQuotationPDF(
        contentRows,
        subtotal,
        profitAndLabour,
        total,
        quotationId
      );
      const pdfBlob = doc.output("blob");

      const reader = new FileReader();

      reader.onload = async function (e) {
        const typedarray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        canvas.toBlob(async (blob) => {
          if (!blob) {
            console.error("Failed to convert canvas to blob.");
            return;
          }

          const formData = new FormData();
          formData.append(
            "file",
            blob,
            `${client?.clientName}_quotation_${Date.now()}.jpeg`
          );

          try {
            let response;
            if (isChild) {
              response = await apiClient.post(
                `/agent/finalQuotation/upload?quotationId=${quotationId}`,
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );
            } else {
              response = await apiClient.post(
                `/agent/quotation/upload?quotationId=${quotationId}`,
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );
            }

            if (response?.status === 200) {
              setImageUrl(response?.data);
            } else {
              toast.error("Failed to upload quotation image.");
              throw new Error("Upload failed");
            }
          } catch (uploadError) {
            console.error("Image upload failed:", uploadError);
            toast.error("Failed to upload image.");
          }
        }, "image/jpeg");
      };

      reader.readAsArrayBuffer(pdfBlob);
      setShowSave(false);
    } catch (err) {
      console.error("Error generating or uploading image:", err);
    }
  };

  const sendImageToWhatsApp = async () => {
    try {
      if (!imageUrl) {
        toast.error(
          "Please save the quotation first to generate the image URL."
        );
        return;
      }
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
        `Here's your quotation: ${imageUrl}`
      )}`;
      window.open(whatsappUrl, "_blank");
      toast.success("WhatsApp link opened!");
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
      toast.error("Failed to open WhatsApp link.");
    }
  };

  const baguetteFields = [
    { label: "0.50-2.30", name: "baguettesRange1" },
    { label: "2.80-3.30", name: "baguettesRange2" },
    { label: "2.40-2.75", name: "baguettesRange3" },
    { label: "Above-3.30", name: "baguettesRange4" },
  ];

  const roundFields = [
    { label: "0.50-2.30", name: "roundsRange1" },
    { label: "2.80-3.30", name: "roundsRange2" },
    { label: "2.40-2.75", name: "roundsRange3" },
    { label: "Above-3.30", name: "roundsRange4" },
  ];

  const totals = [
    { label: "Sub Total", value: subtotal },
    { label: "Profit and Labour", value: profitAndLabour },
    { label: "Total", value: total },
  ];

  // useEffect(() => {
  //   console.log("Calculator Data", calculatorData);
  // }, [calculatorData]);

  return (
    <Box className="bg-white h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <HeaderCard
          icon="📒"
          title={`${isEdit ? "Edit" : "Create"} Quotation`}
        />
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Details Section */}
        <Fade in={true} timeout={300}>
          <Box className="mb-5 p-6 bg-white rounded shadow-md">
            <Typography variant="h5" className="text-[#4c257e] font-bold pb-10">
              Configure Quotation
            </Typography>
            <Formik
              initialValues={details}
              onSubmit={(values) => {
                setDetails(values);
              }}
              enableReinitialize
            >
              {({ values, setFieldValue }) => (
                <Form>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 24,
                      marginBottom: 24,
                    }}
                  >
                    <Typography
                      variant="h7"
                      className="text-[#4c257e] font-bold pb-5 w-[180px]"
                    >
                      Generic Details
                    </Typography>
                    <TextField
                      label="Current Gold Price"
                      name="goldPrice"
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      value={values?.goldPrice}
                      onChange={(e) =>
                        setFieldValue("goldPrice", e.target.value)
                      }
                      sx={{ width: 180 }}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      label="Gold Wastage"
                      name="goldWastage"
                      type="number"
                      value={values?.goldWastage}
                      onChange={(e) => {
                        let val = Math.max(
                          1,
                          Math.min(15, Number(e.target.value))
                        );
                        setFieldValue("goldWastage", val);
                      }}
                      inputProps={{ min: 1, max: 15, step: 0.01 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                      }}
                      sx={{ width: 180 }}
                      size="small"
                    />
                    <TextField
                      label="Weight"
                      name="weight"
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      value={values?.weight}
                      onChange={(e) => setFieldValue("weight", e.target.value)}
                      sx={{ width: 180 }}
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">g</InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      label="Diamond Setting (Per Stone)"
                      name="diamondSetting"
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      value={values?.diamondSetting}
                      onChange={(e) =>
                        setFieldValue("diamondSetting", e.target.value)
                      }
                      sx={{ width: 180 }}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                      InputLabelProps={{
                        sx: {
                          fontSize: "0.9rem",
                        },
                      }}
                    />
                    <TextField
                      label="Profit & Labour"
                      name="profitLabour"
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      value={values?.profitLabour}
                      onChange={(e) =>
                        setFieldValue("profitLabour", e.target.value)
                      }
                      sx={{ width: 150 }}
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      select
                      label="Purity"
                      name="purity"
                      value={values?.purity}
                      onChange={(e) =>
                        setFieldValue("purity", e?.target?.value)
                      }
                      sx={{ width: 180 }}
                      size="small"
                      SelectProps={{
                        IconComponent: () => null, // Hide the default dropdown icon
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end" sx={{ gap: 0.5 }}>
                            <ArrowDropDown sx={{ pointerEvents: "none" }} />K
                          </InputAdornment>
                        ),
                      }}
                    >
                      {Object.entries(purityToPercentMap).map(
                        ([label, value]) => (
                          <MenuItem key={label} value={value}>
                            {label}
                          </MenuItem>
                        )
                      )}
                    </TextField>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 24,
                      marginBottom: 24,
                    }}
                  >
                    <Typography
                      variant="h7"
                      className="text-[#4c257e] font-bold pb-5 w-[180px]"
                    >
                      CTW for Rounds
                    </Typography>

                    {roundFields.map((field) => (
                      <TextField
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        type="number"
                        inputProps={{ min: 0, step: 0.01 }}
                        value={values?.[field.name]}
                        onChange={(e) =>
                          setFieldValue(field.name, e.target.value)
                        }
                        sx={{ width: 180 }}
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 24,
                      marginBottom: 24,
                    }}
                  >
                    <Typography
                      variant="h7"
                      className="text-[#4c257e] font-bold pb-5 w-[180px]"
                    >
                      CTW for Baguettes
                    </Typography>

                    {baguetteFields.map((field) => (
                      <TextField
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        type="number"
                        inputProps={{ min: 0, step: 0.01 }}
                        value={values?.[field.name]}
                        onChange={(e) =>
                          setFieldValue(field.name, e.target.value)
                        }
                        sx={{ width: 180 }}
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      onClick={() => handleStartAddingEntries(values)}
                      variant="contained"
                      className="!bg-[var(--brand-purple)] font-semibold hover:!bg-[var(--brand-dark-purple)] transition-all"
                    >
                      {!showValuesSection ? (
                        <Typography>Create Quotation</Typography>
                      ) : (
                        <Typography>Update Quotation</Typography>
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </Box>
        </Fade>

        {/* Values Section */}
        <Fade in={showValuesSection} timeout={300}>
          <Box className="mb-5 p-6 bg-white rounded shadow-md" ref={exportRef}>
            <Box className="flex justify-between items-center gap-2">
              <Typography
                variant="h5"
                className="text-[#4c257e] font-bold pb-10"
              >
                Manage Entries
              </Typography>
              <IconButton
                size="small"
                onClick={handleCloseValuesSection}
                style={{ marginTop: "-30px" }}
              >
                <Close />
              </IconButton>
            </Box>

            {contentRows?.length > 0 ? (
              <Table
                sx={{ minWidth: 650, border: 1, borderColor: "grey.400" }}
                aria-label="quotation table"
              >
                <TableHead>
                  <TableRow
                    sx={{
                      borderBottom: 1,
                      borderColor: "grey.400",
                      height: 45,
                    }}
                  >
                    <TableCell
                      sx={{
                        borderRight: 1,
                        borderColor: "grey.400",
                        py: 0.5,
                        minHeight: 24,
                        fontWeight: 700,
                        fontSize: "16px",
                      }}
                    >
                      Product
                    </TableCell>
                    <TableCell
                      sx={{
                        borderRight: 1,
                        borderColor: "grey.400",
                        py: 0.5,
                        minHeight: 24,
                        fontWeight: 700,
                        fontSize: "16px",
                      }}
                    >
                      <TextField
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter quotation description..."
                        multiline
                        // rows={2}
                        sx={{
                          width: "100%",
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "white",
                            },
                            "&:hover fieldset": {
                              borderColor: "white",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "white",
                            },
                            minHeight: 24,
                            fontWeight: 700,
                            fontSize: "16px",
                          },
                          "& .MuiInputBase-input": {
                            py: 0.5,
                            fontSize: "16px",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        borderRight: 1,
                        borderColor: "grey.400",
                        py: 0.5,
                        minHeight: 24,
                        fontWeight: 700,
                        fontSize: "16px",
                      }}
                      align="center"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contentRows.map((row, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      sx={{
                        borderBottom: 1,
                        borderColor: "grey.400",
                        height: 36,
                      }}
                    >
                      <TableCell
                        sx={{
                          borderRight: 1,
                          borderColor: "grey.400",
                          py: 0.5,
                          minHeight: 24,
                        }}
                      >
                        <TextField
                          value={row[0]}
                          onChange={(e) =>
                            updateContentCell(rowIndex, 0, e.target.value)
                          }
                          type="text"
                          sx={{
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                borderColor: "white",
                              },
                              "&:hover fieldset": {
                                borderColor: "white",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "white",
                              },
                              minHeight: 24,
                              fontSize: 14,
                            },
                            "& .MuiInputBase-input": {
                              py: 0.5,
                              fontSize: 14,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          borderRight: 1,
                          borderColor: "grey.400",
                          py: 0.5,
                          minHeight: 24,
                        }}
                      >
                        <TextField
                          value={row[1]}
                          onChange={(e) =>
                            updateContentCell(rowIndex, 1, e.target.value)
                          }
                          type="number"
                          inputProps={{ min: 0, step: 0.01 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                borderColor: "white",
                              },
                              "&:hover fieldset": {
                                borderColor: "white",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "white",
                              },
                              minHeight: 24,
                              fontSize: 14,
                            },
                            "& .MuiInputBase-input": {
                              py: 0.5,
                              fontSize: 14,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          borderColor: "grey.400",
                          py: 0.5,
                          minHeight: 24,
                          width: "231px",
                        }}
                      >
                        <IconButton
                          color="error"
                          onClick={() => deleteContentRow(rowIndex)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {totals.map((item, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        borderBottom: 1,
                        borderColor: "grey.400",
                        height: 36,
                      }}
                    >
                      <TableCell
                        sx={{
                          paddingLeft: 4,
                          borderRight: 1,
                          borderColor: "grey.400",
                          py: 0.5,
                          minHeight: 24,
                          fontWeight: 700,
                          fontSize: "15px",
                        }}
                      >
                        {item.label}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderColor: "grey.400",
                          borderRight: "1px solid white",
                          py: 0.5,
                          minHeight: 24,
                        }}
                      >
                        <TextField
                          value={item?.value}
                          type="number"
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                borderColor: "white",
                              },
                              "&:hover fieldset": {
                                borderColor: "white",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "white",
                              },
                              minHeight: 24,
                              fontSize: 14,
                            },
                            "& .MuiInputBase-input": {
                              py: 0.5,
                              fontSize: 14,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          borderColor: "grey.400",
                          py: 0.5,
                          minHeight: 24,
                          width: "231px",
                        }}
                      >
                        {/* Empty cell for alignment */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography className="text-gray-500 italic mb-2">
                No entries yet
              </Typography>
            )}
            {contentRows?.length > 0 && (
              <Box className="flex justify-end w-full">
                <Box></Box>
              </Box>
            )}

            {/* Buttons */}
            <Box className="flex justify-between items-center mt-6 gap-2">
              <Box className="flex gap-2">
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  className="!bg-[var(--brand-purple)] font-semibold hover:!bg-[var(--brand-dark-purple)] transition-all"
                  onClick={addContentRow}
                >
                  Add Entry
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setOpenClearAll(true)}
                  disabled={contentRows?.length === 0}
                >
                  Clear All
                </Button>
              </Box>
              {contentRows?.length > 0 && (
                <Box className="flex justify-between items-center mt-6 gap-2">
                  <Button
                    variant="outline"
                    onClick={sendImageToWhatsApp}
                    className="whatsapp-btn"
                  >
                    <FaWhatsapp
                      size={35}
                      color="#25D366"
                      className="whatsapp-icon"
                    />
                  </Button>
                  <Box>
                    {showSave ? (
                      <Button
                        variant="contained"
                        className="!bg-[var(--brand-purple)] font-semibold hover:!bg-[var(--brand-dark-purple)] transition-all"
                        onClick={handleSaveQuotation}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <CircularProgress size={20} sx={{ color: "white" }} />
                        ) : (
                          <Typography variant="button" className="text-white">
                            Save
                          </Typography>
                        )}
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="contained"
                          className="!bg-[var(--brand-purple)] font-semibold hover:!bg-[var(--brand-dark-purple)] transition-all"
                          onClick={(e) => setAnchorEl(e.currentTarget)}
                        >
                          Download
                        </Button>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={() => setAnchorEl(null)}
                        >
                          <MenuItem
                            onClick={() => {
                              setAnchorEl(null);
                              downloadPDF();
                            }}
                          >
                            Download as PDF
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              setAnchorEl(null);
                              downloadImage();
                            }}
                          >
                            Download as Image
                          </MenuItem>
                        </Menu>
                      </>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
            {/* Warning Dialog */}
            <Dialog
              open={openWarning}
              onClose={() => handleWarningClose(false)}
            >
              <DialogTitle>Clear and Close Manage Entries?</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  This will clear all entries and close the Manage Entries
                  section. Are you sure you want to proceed?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => handleWarningClose(false)}
                  color="primary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleWarningClose(true)}
                  color="error"
                  autoFocus
                >
                  Yes, Clear & Close
                </Button>
              </DialogActions>
            </Dialog>
            {/* Clear All Dialog */}
            <Dialog open={openClearAll} onClose={() => setOpenClearAll(false)}>
              <DialogTitle>Clear All Entries?</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  This will remove all entries. Are you sure you want to
                  proceed?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenClearAll(false)} color="primary">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    clearAllEntries();
                    setOpenClearAll(false);
                  }}
                  color="error"
                  autoFocus
                >
                  Yes, Clear All
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Fade>
      </div>
    </Box>
  );
};

export default CreateQuotation;

const style = document.createElement("style");
style.innerHTML = `
.whatsapp-btn .whatsapp-icon {
  transition: transform 0.2s;
}
.whatsapp-btn:hover .whatsapp-icon {
  transform: scale(1.2857); /* 35 -> 45 */
}
`;
document.head.appendChild(style);
