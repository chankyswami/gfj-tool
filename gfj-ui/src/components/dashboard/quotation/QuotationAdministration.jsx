import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
  Alert,
  Modal,
  Select,
  MenuItem,
  FormControl,
  TextField,
  InputAdornment,
  Checkbox,
  Collapse,
  TableRow as MuiTableRow
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { toast } from "react-toastify";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import HeaderCard from "../../HeaderCard";
import GemLoader from "../../loader/GemLoader";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ArrowForward from "@mui/icons-material/ArrowForward";
import CreateQuotation from "../calculator/CreateQuotation";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import QuotationStats from "./QuotationStats";
import apiClient from "../../../app/axiosConfig";

const columns = [
  { columnLabel: "", columnKey: "expand" },
  { columnLabel: "", columnKey: "checkbox" },
  { columnLabel: "Quotation ID", columnKey: "id" },
  { columnLabel: "Price", columnKey: "price" },
  { columnLabel: "Client", columnKey: "clientId" },
  { columnLabel: "Status", columnKey: "quotationStatus" },
  { columnLabel: "Created At", columnKey: "createdAt" },
  { columnLabel: "Updated At", columnKey: "updatedAt" },
  { columnLabel: "Actions", columnKey: "actions" },
];

const QuotationAdministration = () => {
  const { token, id, roles } = useSelector((state) => state.user.userDetails || {});
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [quotationDetails, setQuotationDetails] = useState({});
  const [quotationTable, setQuotationTable] = useState([]);
  const [quotationid, setQuotationId] = useState("");
  const [ischild, setIsChild] = useState("");
  const [contentRows, setContentRows] = useState([]);
  const [totalsSection, setTotalsSection] = useState({});
  const [quotationClient, setQuotationClient] = useState({});
  const [calculatorData, setCalculatorData] = useState({});
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAgent, setSelectedAgent] = useState(roles[0] === "business_admin" ? "all" : id);
  const [selectedClient, setSelectedClient] = useState("all");
  const [dropdownUsers, setDropdownUsers] = useState({});
  const [dropdownClients, setClientDropdown] = useState({});
  
  // New state variables for client selection and shipping
  const [selectedQuotations, setSelectedQuotations] = useState([]);
  const [isShipping, setIsShipping] = useState(false);

  // State for expandable rows
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Function to toggle row expansion
  const handleRowToggle = (quotationId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(quotationId)) {
        newSet.delete(quotationId);
      } else {
        newSet.add(quotationId);
      }
      return newSet;
    });
  };

  // Function to render child quotation rows
  const renderChildRows = (quotation, finalQuotations) => {
    if (!finalQuotations || finalQuotations.length === 0) return null;

    return finalQuotations.map((childQuotation, childIndex) => (
      <MuiTableRow
        key={`child-${quotation.quotationId}-${childIndex}`}
        sx={{
          backgroundColor: "#f8fafc",
          "&:hover": {
            backgroundColor: "#f1f5f9",
          },
          borderLeft: "4px solid #4c257e",
        }}
      >
        {/* Empty cells for expand and checkbox columns */}

        {shouldShowCheckboxes && (
          <TableCell sx={{ padding: "8px 16px" }}>
            {/* Empty cell for checkbox column */}
          </TableCell>
        )}

        <TableCell sx={{ padding: "8px 16px" }}>
          <Typography
            variant="body2"
            sx={{ color: "#64748b", fontWeight: 500 }}
          >
            {childQuotation.finalQuotationId}
          </Typography>
        </TableCell>

        <TableCell sx={{ padding: "8px 16px" }}>
          <Typography
            variant="body2"
            sx={{ color: "#059669", fontWeight: 600 }}
          >
            $ {childQuotation.price?.toFixed(2) || "0.00"}
          </Typography>
        </TableCell>

        <TableCell sx={{ padding: "12px 16px" }}>
          <Typography variant="body1" className="font-semibold text-gray-600">
            {(() => {
              try {
                const parsedData = JSON.parse(childQuotation?.data);
                return parsedData?.client?.clientName || "Unknown Client";
              } catch {
                return "Unknown Client";
              }
            })()}
          </Typography>
        </TableCell>

        <TableCell sx={{ padding: "8px 16px" }}>
          <Chip
            label={childQuotation.quotationStatus || "pending"}
            size="small"
            sx={{
              fontSize: "0.65rem",
              fontWeight: 600,
              textTransform: "uppercase",
              borderRadius: "12px",
              backgroundColor: "#d1fae5",
              color: "#065f46",
            }}
          />
        </TableCell>

        <TableCell sx={{ padding: "8px 16px" }}>
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            {childQuotation.createdAt
              ? formatDate(childQuotation.createdAt)
              : "N/A"}
          </Typography>
        </TableCell>

        <TableCell sx={{ padding: "8px 16px" }}>
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            {childQuotation.updatedAt
              ? formatDate(childQuotation.updatedAt)
              : "N/A"}
          </Typography>
        </TableCell>

        <TableCell sx={{ padding: "8px 16px" }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <EditIcon
              style={{ cursor: "pointer", fontSize: "16px" }}
              color="primary"
              onClick={() => handleEdit(childQuotation, true)}
              titleAccess="Edit Child"
              sx={{
                "&:hover": {
                  transform: "scale(1.1)",
                  transition: "transform 0.2s ease-in-out",
                },
              }}
            />
            <VisibilityIcon
              style={{ cursor: "pointer", fontSize: "16px" }}
              color="action"
              onClick={() => handlePreview(childQuotation)}
              titleAccess="Preview Child"
              sx={{
                "&:hover": {
                  transform: "scale(1.1)",
                  transition: "transform 0.2s ease-in-out",
                },
              }}
            />
            {((roles[0] === "agent" &&
              childQuotation.quotationStatus === "new") ||
              roles[0] !== "agent") && (
              <DeleteIcon
                style={{ cursor: "pointer", fontSize: "16px" }}
                color="error"
                onClick={() => handleDelete(childQuotation)}
                titleAccess="Delete Child"
                sx={{
                  "&:hover": {
                    transform: "scale(1.1)",
                    transition: "transform 0.2s ease-in-out",
                  },
                }}
              />
            )}
          </Box>
        </TableCell>
      </MuiTableRow>
    ));
  };
  
  const pageSize = 10;

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await apiClient.get(
        `businessAdmin/getAllAgents?offset=0&size=100`
      );

      let userMap = {};
      if (response?.status === 200) {
        const userData = response?.data?.data;
        userMap = {
          ...Object.fromEntries(userData.map((user) => [user.id, user.username])),
          all: "All",
        };
      }
      setDropdownUsers(userMap);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  }, []);

  const fetchClients = useCallback(async (agentId) => {
    try {
      let response;
      if (agentId === "all" && roles[0] === "business_admin") {
        // Get all clients regardless of agent
        response = await apiClient.get(`/businessAdmin/clients`);
      } else {
        response = await apiClient.get(`agent/clients?agentId=${agentId}&offset=0&size=100`);
      }

      let clientMap = {};
      if (response?.status === 200) {
        const clientData = response?.data?.data || [];
        clientMap = {
          ...Object.fromEntries(clientData.map((client) => [client.id, client.clientName || client.name])),
          all: "All Clients",
        };
      }
      setClientDropdown(clientMap);
    } catch (error) {
      console.error("Error fetching clients:", error);
      // Set default client dropdown with "All Clients" option
      setClientDropdown({ all: "All Clients" });
      toast.error("Failed to load clients. Please try again.");
    }
  }, []);

  const fetchQuotations = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
      setError(null);
      try {
        const offset = (currentPage - 1) * pageSize;
        let response;
        
        if (roles?.[0] === "business_admin" && selectedAgent !== "all") {
          response = await apiClient.get(
            `/agent/getAllQuotationsByAgent?offset=${offset}&size=${pageSize}&agentId=${selectedAgent}`
          );
        } else if (roles?.[0] === "business_admin" && selectedAgent === "all") {
          response = await apiClient.get(
            `businessAdmin/quotations?offset=${offset}&size=${pageSize}&sortBy=id`
          );
        } else {
          response = await apiClient.get(
            `/agent/getAllQuotationsByAgent?offset=${offset}&size=${pageSize}&agentId=${id}`
          );
        }
        
        if (response?.data) {
          const fetchedQuotations = response?.data?.data || [];
          setQuotations(fetchedQuotations);
          setTotalRecords(response?.data?.totalRecords || 0);
          setTotalPages(Math.ceil((response?.data?.totalRecords || 0) / pageSize));
        }
      } catch (err) {
        console.error("Error fetching quotations:", err);
        setError("Failed to fetch quotations. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [id, pageSize, roles, selectedAgent]
  );

    useEffect(() => {
    if (roles?.[0] === "business_admin") {
      fetchAllUsers();
    }
    fetchClients(selectedAgent);
    fetchQuotations(page);
  }, [fetchQuotations, page, roles, fetchAllUsers, fetchClients, selectedAgent]);

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handlePageChange = (direction) => {
    const newPage = direction === "next" ? page + 1 : page - 1;
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const handleAgentChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedAgent(selectedValue);
    setPage(1); // Reset to first page when changing agent
    // Fetch clients for the selected agent
    fetchClients(selectedValue);
  };

  const handleClientChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedClient(selectedValue);
    setPage(1); // Reset to first page when changing client
    // Reset selected quotations when client changes
    setSelectedQuotations([]);
  };

  const handleSelectQuotation = (quotationId) => {
    setSelectedQuotations(prev => 
      prev.includes(quotationId) 
        ? prev.filter(id => id !== quotationId)
        : [...prev, quotationId]
    );
  };

  const handleSelectAllQuotations = () => {
    if (selectedQuotations.length === filteredQuotations.length) {
      setSelectedQuotations([]);
    } else {
      setSelectedQuotations(filteredQuotations.map(q => q.quotationId));
    }
  };

  const handleShipQuotations = async () => {
    if (selectedQuotations.length === 0) {
      toast.error("Please select at least one quotation to ship");
      return;
    }

    if (selectedClient === "all") {
      toast.error("Please select a specific client to ship quotations");
      return;
    }

    setIsShipping(true);
    try {
      const response = await apiClient.post(
        `shipping/markForShipping`,
        selectedQuotations,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.status === 200) {
        for (const quotationId of selectedQuotations) {
          const quotation = filteredQuotations.find(q => q.quotationId === quotationId);
          if (quotation) {
            await handleStatusChange(quotation, "sentforshipping");
          }
        }
        toast.success("Quotations sent for shipping successfully!");
        setSelectedQuotations([]);
        fetchQuotations(page);
      } else {
        toast.error("Failed to ship quotations");
      }
    } catch (error) {
      console.error("Error shipping quotations:", error);
      toast.error("Error while shipping quotations");
    } finally {
      setIsShipping(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handler stubs for actions
  const handleEdit = (quotation, isChild) => {
    console.log("Edit clicked", quotation);
    try {
      setQuotationId(quotation?.finalQuotationId || quotation?.quotationId || "");
      const data = JSON.parse(quotation?.data);
      setQuotationDetails(data?.quotationDetails || {});
      setQuotationTable(data?.quotationTable || []);
      setContentRows(data?.contentRows || []);
      setTotalsSection(data?.totalsSection || {});
      setQuotationClient(data?.client || {});
      setCalculatorData(data?.calculatorData || {});
      setIsChild(isChild || false);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error parsing quotation data for edit:', error);
      toast.error('Error loading quotation data for editing');
    }
  };
  const handlePreview = (quotation) => {
    setPreviewImage(quotation?.imageUrl);
    setOpenPreview(true);
  };

  const handleClosePreview = () => {
    setOpenPreview(false);
    setPreviewImage(null);
  };

  const handleDelete = async (quotation) => {
    setLoading(true);
      setError(null);
      try {
        const response = await apiClient.delete(
          `agent/deleteQuotation?quotationId=${quotation?.quotationId}`
        );
        if (response?.status === 200){
          toast.success(`Quotation Deleted Successfully!`)
          // Refresh the data after deletion
          fetchQuotations(page);
        } else {
          toast.error(`Failed To Delete Quotation!`)
        }
      } catch (err) {
        console.error("Error Deleting quotation:", err);
        setError("Failed to delete quotation. Please try again.");
      } finally {
        setLoading(false);
      }
  };

  const handleStatusChange = async (quotation, newStatus) => {
    setLoading(true);
    try {
      let requestBody = {
        quotationId: quotation?.quotationId,
        quotationStatus: newStatus,
      };

      const response = await apiClient.post(
        `/agent/updateQuotation`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);

      // Update the local state to reflect the change
      // Refresh the data after status change
      fetchQuotations(page);

      toast.success(`Status Changed Successfully!`);
    } catch (error) {
      console.error("Error Saving Status Change", error);
      toast.error("Error While Changing Status of Quotation!");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFinalQuotation = async (quotation) => {
    setLoading(true);
    try {
      const response = await apiClient.post(
        `/agent/createFinalQuotation?quotationId=${quotation?.quotationId}`,
        null,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.status === 200) {
        toast.success("Final quotation created successfully!");
        // Refresh the data to show the new final quotation
        fetchQuotations(page);
      } else {
        toast.error("Failed to create final quotation");
      }
    } catch (error) {
      console.log("Error creating final quotation:", error);
      toast.error(error?.response?.data?.message || "Failed to create final quotation");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotations = quotations.filter((q) => {
    const searchMatch = searchTerm
      ? JSON.stringify(q).toLowerCase().includes(searchTerm.toLowerCase())
      : true;
  
    const statusMatch =
      statusFilter === "all" || q?.quotationStatus === statusFilter;

    const clientMatch = selectedClient === "all" || (() => {
      try {
        const parsedData = JSON.parse(q?.data);
        // Fix: Convert selectedClient to string for proper comparison
        const clientId = String(parsedData?.client?.id || parsedData?.client?.clientId || '');
        return clientId === String(selectedClient);
      } catch {
        return false;
      }
    })();
  
    return searchMatch && statusMatch && clientMatch;
  });

  // Determine if checkboxes should be visible
  const shouldShowCheckboxes = selectedClient !== "all" && statusFilter === "manufacturing complete";
  

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header Section */}
      <HeaderCard icon="💍" color="teal" title="Quotation Management" description="Manage quotations and pricing"></HeaderCard>

      {/* Search and Filter Section */}
      <Card className="shadow-lg mb-6">
        <div className="pt-4 pl-4 pr-4"><QuotationStats quotations={filteredQuotations} /></div>
        <CardContent>
          <Box className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <Box className="flex-1 w-full md:w-auto mb-10">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search quotations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon className="text-gray-400" />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#4c257e',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4c257e',
                      },
                    },
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8fafc',
                  }
                }}
              />
            </Box>

            {/* Agent Filter - Only for business_admin */}
            {roles?.[0] === "business_admin" && (
              <Box className="w-full md:w-48 mb-10">
                <FormControl fullWidth variant="outlined">
                  <Select
                    value={selectedAgent}
                    onChange={handleAgentChange}
                    displayEmpty
                    startAdornment={
                      <InputAdornment position="start">
                        <span className="text-gray-400">👤</span>
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: '12px',
                      backgroundColor: '#f8fafc',
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#4c257e',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4c257e',
                        },
                      },
                    }}
                  >
                    {Object.entries(dropdownUsers).map(([key, value]) => (
                      <MenuItem key={key} value={key} sx={{ fontSize: "0.875rem" }}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* Status Filter */}
            <Box className="w-full md:w-48 mb-10">
              <FormControl fullWidth variant="outlined">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  displayEmpty
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterListIcon className="text-gray-400" />
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#4c257e',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4c257e',
                      },
                    },
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="manufacturing complete">Manufacturing Complete</MenuItem>
                  <MenuItem value="sentforshipping">Sent for Shipping</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="returned">Returned</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="declined">Declined</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Client Filter */}
            <Box className="w-full md:w-48 mb-10">
              <FormControl fullWidth variant="outlined">
                <Select
                  value={selectedClient}
                  onChange={handleClientChange}
                  displayEmpty
                  startAdornment={
                    <InputAdornment position="start">
                      <span className="text-gray-400">👤</span>
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#4c257e',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4c257e',
                      },
                    },
                  }}
                >
                  {Object.entries(dropdownClients).map(([key, value]) => (
                    <MenuItem key={key} value={key} sx={{ fontSize: "0.875rem" }}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Results Count */}
            <Box className="text-center md:text-right mb-10">
              <Typography variant="body2" className="text-gray-600">
                Showing {filteredQuotations.length} of {totalRecords} results
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Main Table Card */}
      <Card className="shadow-lg">
        <CardContent>
          {/* Table Header */}
          <Box className="flex justify-between items-center mb-4">
            <Typography
              variant="h5"
              className="text-[#4c257e] font-bold flex items-center"
            >
              <ImageIcon className="mr-2" />
              Quotations List
            </Typography>

                         {/* Pagination Info */}
             <Box className="flex items-center justify-between flex-wrap gap-4 mt-4">

              <Typography variant="body2" className="text-gray-600">
                {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, totalRecords)} of {totalRecords}
              </Typography>

              <Box className="flex gap-2 items-center">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handlePageChange("prev")}
                  disabled={page === 1 || loading}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    borderColor: '#4c257e',
                    color: '#4c257e',
                    '&:hover': {
                      borderColor: '#3730a3',
                      backgroundColor: '#f3f4f6',
                    },
                    '&:disabled': {
                      borderColor: '#d1d5db',
                      color: '#9ca3af',
                    }
                  }}
                >
                  <ArrowBack />
                </Button>

                <Typography variant="body2" className="text-gray-600">
                  Page {page} of {totalPages}
                </Typography>

                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handlePageChange("next")}
                  disabled={page === totalPages || loading || totalPages === 0}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    borderColor: '#4c257e',
                    color: '#4c257e',
                    '&:hover': {
                      borderColor: '#3730a3',
                      backgroundColor: '#f3f4f6',
                    },
                    '&:disabled': {
                      borderColor: '#d1d5db',
                      color: '#9ca3af',
                    }
                  }}
                >
                  <ArrowForward />
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Loading State */}
          {loading && (
            <Box className="flex justify-center items-center py-8">
              <GemLoader size={30} />
            </Box>
          )}

          {/* Table */}
          {!loading && quotations.length > 0 && (
            <TableContainer 
              component={Paper} 
              className="shadow-md"
              sx={{ 
                maxHeight: '600px',
                paddingBottom: 18,
                '& .MuiTable-root': {
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                }
              }}
            >
              <Table stickyHeader sx={{ minWidth: 650 }} aria-label="quotations table">
                <TableHead>
                  <TableRow className="!bg-gradient-to-r !from-purple-100 !to-indigo-200">
                    {columns?.map((col) => {
                      // Hide checkbox column if conditions are not met
                      if (col.columnKey === 'checkbox' && !shouldShowCheckboxes) {
                        return null;
                      }
                      
                      return (
                        <TableCell
                          key={col.columnKey}
                          className="!font-bold !text-[#4c257e]"
                          sx={{ 
                            fontSize: "0.95rem",
                            backgroundColor: '#f8fafc',
                            borderBottom: '2px solid #e5e7eb',
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                            padding: '12px 16px',
                            fontWeight: 600,
                            width: col.columnKey === 'checkbox' ? '60px' : 'auto',
                          }}
                        >
                          {col.columnKey === 'checkbox' ? (
                            <Checkbox
                              checked={selectedQuotations.length === filteredQuotations.length && filteredQuotations.length > 0}
                              indeterminate={selectedQuotations.length > 0 && selectedQuotations.length < filteredQuotations.length}
                              onChange={handleSelectAllQuotations}
                              sx={{
                                '&.Mui-checked': {
                                  color: '#4c257e',
                                },
                              }}
                            />
                          ) : (
                            col.columnLabel
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredQuotations?.map((quotation, index) => {
                    const isExpanded = expandedRows.has(quotation?.quotationId);
                    const finalQuotations = quotation?.finalQuotations || [];

                    return (
                      <React.Fragment key={quotation?.quotationId}>
                        <TableRow
                          className={`hover:!bg-gray-50 transition-colors ${
                            index % 2 === 0 ? "!bg-white" : "!bg-gray-25"
                          }`}
                          sx={{
                            "&:hover": {
                              backgroundColor: "#f9fafb",
                            },
                            cursor:
                              finalQuotations.length > 0
                                ? "pointer"
                                : "default",
                          }}
                          onClick={() =>
                            finalQuotations.length > 0 &&
                            handleRowToggle(quotation?.quotationId)
                          }
                        >
                          {/* Expand/Collapse Column */}
                          <TableCell
                            sx={{
                              padding: "12px 16px",
                              width: "50px",
                              textAlign: "center",
                            }}
                          >
                            {finalQuotations.length > 0 && (
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowToggle(quotation?.quotationId);
                                }}
                                sx={{
                                  "&:hover": {
                                    backgroundColor: "rgba(76, 37, 126, 0.1)",
                                  },
                                }}
                              >
                                {isExpanded ? (
                                  <KeyboardArrowUpIcon
                                    sx={{ color: "#4c257e" }}
                                  />
                                ) : (
                                  <KeyboardArrowDownIcon
                                    sx={{ color: "#4c257e" }}
                                  />
                                )}
                              </IconButton>
                            )}
                          </TableCell>

                          {shouldShowCheckboxes && (
                            <TableCell
                              className="!font-medium"
                              sx={{ padding: "12px 16px" }}
                            >
                              <Checkbox
                                checked={selectedQuotations.includes(
                                  quotation?.quotationId
                                )}
                                onChange={() =>
                                  handleSelectQuotation(quotation?.quotationId)
                                }
                                onClick={(e) => e.stopPropagation()}
                                sx={{
                                  "&.Mui-checked": {
                                    color: "#4c257e",
                                  },
                                }}
                              />
                            </TableCell>
                          )}

                          <TableCell
                            className="!font-medium"
                            sx={{ padding: "12px 16px" }}
                          >
                            {quotation?.quotationId}
                          </TableCell>

                          <TableCell sx={{ padding: "12px 16px" }}>
                            <Typography
                              variant="body2"
                              className="font-semibold text-green-600"
                            >
                              $ {quotation?.price?.toFixed(2) || "0.00"}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ padding: "12px 16px" }}>
                            <Typography
                              variant="body1"
                              className="font-semibold text-gray-600"
                            >
                              {(() => {
                                try {
                                  const parsedData = JSON.parse(
                                    quotation?.data
                                  );
                                  return (
                                    parsedData?.client?.clientName ||
                                    "Unknown Client"
                                  );
                                } catch {
                                  return "Unknown Client";
                                }
                              })()}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ padding: "12px 16px" }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={quotation?.quotationStatus || "new"}
                                onChange={(e) =>
                                  handleStatusChange(quotation, e.target.value)
                                }
                                disabled={
                                  (roles[0] === "agent" &&
                                    ["approved", "declined"].includes(
                                      quotation?.quotationStatus
                                    )) ||
                                  [
                                    "sentforshipping",
                                    "shipped",
                                    "returned",
                                    "delivered",
                                    "cancelled",
                                  ].includes(quotation?.quotationStatus)
                                }
                                displayEmpty
                                sx={{
                                  "& .MuiSelect-select": {
                                    padding: "4px 8px",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    borderRadius: "16px",
                                    backgroundColor: () => {
                                      const status =
                                        quotation?.quotationStatus || "new";
                                      switch (status.toLowerCase()) {
                                        case "new":
                                          return "#c7f6feff";
                                        case "pending":
                                          return "#fef3c7";
                                        case "approved":
                                          return "#d1fae5";
                                        case "sentforshipping":
                                          return "#fed7aa";
                                        case "shipped":
                                          return "#fed7aa";
                                        case "delivered":
                                          return "#fed7aa";
                                        case "returned":
                                          return "#fed7aa";
                                        case "cancelled":
                                          return "#fed7aa";
                                        case "declined":
                                          return "#fee2e2";
                                        case "send_to_manufacture":
                                          return "#be5cc0ff";
                                        case "manufacturing complete":
                                          return "#f7ffa1ff";
                                        default:
                                          return "#f3f4f6";
                                      }
                                    },
                                    color: () => {
                                      const status =
                                        quotation?.quotationStatus || "new";
                                      switch (status.toLowerCase()) {
                                        case "new":
                                          return "#1c0081ff";
                                        case "pending":
                                          return "#92400e";
                                        case "approved":
                                          return "#065f46";
                                        case "sentforshipping":
                                          return "#7c2d12";
                                        case "shipped":
                                          return "#7c2d12";
                                        case "delivered":
                                          return "#7c2d12";
                                        case "returned":
                                          return "#7c2d12";
                                        case "cancelled":
                                          return "#7c2d12";
                                        case "declined":
                                          return "#991b1b";
                                        case "send_to_manufacture":
                                          return "#6c136bff";
                                        case "manufacturing complete":
                                          return "#494f00ff";
                                        default:
                                          return "#374151";
                                      }
                                    },
                                    border: "none",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                    "&:hover": {
                                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                    },
                                    "&:focus": {
                                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                    },
                                  },
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    border: "none",
                                  },
                                  "&:hover .MuiOutlinedInput-notchedOutline": {
                                    border: "none",
                                  },
                                  "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                      border: "none",
                                    },
                                }}
                                MenuProps={{
                                  PaperProps: {
                                    sx: {
                                      borderRadius: "12px",
                                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                                      "& .MuiMenuItem-root": {
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        textTransform: "uppercase",
                                        padding: "8px 16px",
                                        "&:hover": {
                                          backgroundColor: "#f8fafc",
                                        },
                                        "&.Mui-selected": {
                                          backgroundColor: "#e0e7ff",
                                          color: "#3730a3",
                                          "&:hover": {
                                            backgroundColor: "#c7d2fe",
                                          },
                                        },
                                      },
                                    },
                                  },
                                }}
                              >
                                <MenuItem
                                  value="new"
                                  sx={{
                                    color: "#1c0081ff",
                                    backgroundColor: "#c7f6feff",
                                  }}
                                >
                                  New
                                </MenuItem>
                                <MenuItem
                                  value="pending"
                                  sx={{
                                    color: "#92400e",
                                    backgroundColor: "#fef3c7",
                                  }}
                                >
                                  {roles[0] === "business_admin"
                                    ? "Pending for Approval"
                                    : "Send for Approval"}
                                </MenuItem>
                                <MenuItem
                                  value="approved"
                                  disabled={roles[0] !== "business_admin"}
                                  sx={{
                                    color: "#065f46",
                                    backgroundColor: "#d1fae5",
                                  }}
                                >
                                  Approved
                                </MenuItem>
                                <MenuItem
                                  value="declined"
                                  disabled={roles[0] !== "business_admin"}
                                  sx={{
                                    color: "#991b1b",
                                    backgroundColor: "#fee2e2",
                                  }}
                                >
                                  Declined
                                </MenuItem>
                                <MenuItem
                                  value="send_to_manufacture"
                                  disabled={roles[0] !== "business_admin"}
                                  sx={{
                                    color: "#991b1b",
                                    backgroundColor: "#fee2e2",
                                  }}
                                >
                                  Send to Manufacture
                                </MenuItem>
                                <MenuItem
                                  value="manufacturing complete"
                                  disabled={["approved"].includes(
                                    quotation?.quotationStatus
                                  )}
                                  sx={{
                                    color: "#991b1b",
                                    backgroundColor: "#fee2e2",
                                  }}
                                >
                                  Manufacturing Complete
                                </MenuItem>
                                <MenuItem
                                  value="sentforshipping"
                                  disabled
                                  sx={{
                                    color: "#7c2d12",
                                    backgroundColor: "#fed7aa",
                                  }}
                                >
                                  Sent for Shipping
                                </MenuItem>
                                <MenuItem
                                  value="shipped"
                                  disabled
                                  sx={{
                                    color: "#7c2d12",
                                    backgroundColor: "#fed7aa",
                                  }}
                                >
                                  Shipped
                                </MenuItem>
                                <MenuItem
                                  value="delivered"
                                  disabled
                                  sx={{
                                    color: "#7c2d12",
                                    backgroundColor: "#fed7aa",
                                  }}
                                >
                                  Delivered
                                </MenuItem>
                                <MenuItem
                                  value="returned"
                                  disabled
                                  sx={{
                                    color: "#7c2d12",
                                    backgroundColor: "#fed7aa",
                                  }}
                                >
                                  Returned
                                </MenuItem>
                                <MenuItem
                                  value="cancelled"
                                  disabled
                                  sx={{
                                    color: "#7c2d12",
                                    backgroundColor: "#fed7aa",
                                  }}
                                >
                                  Cancelled
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>

                          <TableCell sx={{ padding: "12px 16px" }}>
                            <Typography
                              variant="body2"
                              className="text-gray-600"
                            >
                              {formatDate(quotation?.createdAt)}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ padding: "12px 16px" }}>
                            <Typography
                              variant="body2"
                              className="text-gray-600"
                            >
                              {formatDate(quotation?.updatedAt)}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ padding: "12px 16px" }}>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                alignItems: "center",
                              }}
                            >
                              <EditIcon
                                style={{ cursor: "pointer" }}
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(quotation, false);
                                }}
                                titleAccess="Edit"
                                sx={{
                                  "&:hover": {
                                    transform: "scale(1.1)",
                                    transition: "transform 0.2s ease-in-out",
                                  },
                                }}
                              />
                              <VisibilityIcon
                                style={{ cursor: "pointer" }}
                                color="action"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreview(quotation);
                                }}
                                titleAccess="Preview"
                                sx={{
                                  "&:hover": {
                                    transform: "scale(1.1)",
                                    transition: "transform 0.2s ease-in-out",
                                  },
                                }}
                              />
                              {/* {((roles[0] === "agent" && quotation?.quotationStatus === "new") || (roles[0] !== "agent")) && ( */}
                              <DeleteIcon
                                style={{ cursor: "pointer" }}
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(quotation);
                                }}
                                titleAccess="Delete"
                                sx={{
                                  "&:hover": {
                                    transform: "scale(1.1)",
                                    transition: "transform 0.2s ease-in-out",
                                  },
                                }}
                              />
                              {/* )} */}
                              {quotation?.finalQuotations?.length === 0 && (
                                <AddIcon
                                  style={{ cursor: "pointer" }}
                                  color="success"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCreateFinalQuotation(quotation);
                                  }}
                                  titleAccess="Create Final Quotation"
                                  sx={{
                                    "&:hover": {
                                      transform: "scale(1.1)",
                                      transition: "transform 0.2s ease-in-out",
                                    },
                                  }}
                                />
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>

                        {/* Expandable Child Rows */}
                        <MuiTableRow>
                          <TableCell
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                            colSpan={columns.length}
                          >
                            <Collapse
                              in={isExpanded}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ margin: 1 }}>
                                <Table
                                  size="small"
                                  aria-label="child quotations"
                                >
                                  <TableHead>
                                    <TableRow
                                      sx={{ backgroundColor: "#f1f5f9" }}
                                    >
                                      {shouldShowCheckboxes && (
                                        <TableCell
                                          sx={{
                                            fontWeight: 600,
                                            color: "#475569",
                                            fontSize: "0.875rem",
                                          }}
                                        >
                                          Select
                                        </TableCell>
                                      )}
                                      <TableCell
                                        sx={{
                                          fontWeight: 600,
                                          color: "#475569",
                                          fontSize: "0.875rem",
                                        }}
                                      >
                                        Quotation ID
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontWeight: 600,
                                          color: "#475569",
                                          fontSize: "0.875rem",
                                        }}
                                      >
                                        Price
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontWeight: 600,
                                          color: "#475569",
                                          fontSize: "0.875rem",
                                        }}
                                      >
                                        Client
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontWeight: 600,
                                          color: "#475569",
                                          fontSize: "0.875rem",
                                        }}
                                      >
                                        Status
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontWeight: 600,
                                          color: "#475569",
                                          fontSize: "0.875rem",
                                        }}
                                      >
                                        Created
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontWeight: 600,
                                          color: "#475569",
                                          fontSize: "0.875rem",
                                        }}
                                      >
                                        Updated
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontWeight: 600,
                                          color: "#475569",
                                          fontSize: "0.875rem",
                                        }}
                                      >
                                        Actions
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {renderChildRows(
                                      quotation,
                                      finalQuotations
                                    )}
                                  </TableBody>
                                </Table>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </MuiTableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Empty State */}
          {!loading && quotations.length === 0 && (
            <Box className="text-center py-12">
              <ImageIcon className="!text-6xl text-gray-300 mb-4" />
              <Typography variant="h6" className="text-gray-500 mb-2">
                {searchTerm || statusFilter !== "all" ? "No matching quotations found" : "No quotations found"}
              </Typography>
              <Typography variant="body2" className="text-gray-400">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search criteria or filters." 
                  : "There are no quotations to display at the moment."
                }
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Ship Button Section - Only show when checkboxes are visible and quotations are selected */}
      {shouldShowCheckboxes && selectedQuotations.length > 0 && (
        <Card className="shadow-lg mb-6">
          <CardContent>
            <Box className="flex justify-between items-center">
              <Typography variant="h6" className="text-[#4c257e] font-semibold">
                Selected Quotations: {selectedQuotations.length}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleShipQuotations}
                disabled={isShipping || selectedClient === "all"}
                startIcon={isShipping ? <CircularProgress size={20} /> : <LocalShippingIcon />}
                sx={{
                  backgroundColor: '#4c257e',
                  '&:hover': {
                    backgroundColor: '#3730a3',
                  },
                  '&:disabled': {
                    backgroundColor: '#d1d5db',
                    color: '#9ca3af',
                  },
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  mb: 2,
                }}
              >
                {isShipping ? 'Shipping...' : 'Ship Selected Quotations'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{ className: "rounded-xl shadow-lg p-4" }}
        TransitionProps={{ timeout: 300 }}
      >
        <Box className="flex justify-between items-center">
          <IconButton onClick={handleDialogClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent>
          <CreateQuotation isEdit={true} quotationDetails={quotationDetails} quotationTable={quotationTable} client={quotationClient} contentRows={contentRows} totalsSection={totalsSection} quotationId={quotationid}
                           parentContentRows={contentRows} parentTotalsSection={totalsSection} parentQuotationDetails={quotationDetails} calculatorData={calculatorData} isChild={ischild}/>
        </DialogContent>
      </Dialog>

      <Modal open={openPreview} onClose={handleClosePreview}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            bgcolor: "rgba(0, 0, 0, 0.9)",
            p: 2,
          }}
        >
          <Box
            sx={{
              position: "relative",
              maxWidth: "90%",
              maxHeight: "90%",
              bgcolor: "#111",
              borderRadius: 3,
              boxShadow: 8,
              overflow: "hidden",
            }}
          >
            {/* Close Button Top Right */}
            <IconButton
              onClick={handleClosePreview}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "white",
                backgroundColor: "rgba(255,255,255,0.1)",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Image */}
            <img
              src={previewImage}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                display: "block",
                borderRadius: "12px",
                margin: "auto",
              }}
            />

            {/* Button Group */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mt: 2,
                mb: 2,
              }}
            >
              <Button
                variant="outlined"
                color="error"
                startIcon={<CloseIcon />}
                onClick={handleClosePreview}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = previewImage;
                  link.download = "quotation-image.jpg";
                  link.click();
                }}
              >
                Download
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default QuotationAdministration;
