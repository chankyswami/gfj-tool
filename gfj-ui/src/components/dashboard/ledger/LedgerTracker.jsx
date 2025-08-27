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
  TablePagination,
} from "@mui/material";
import { toast } from "react-toastify";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import HeaderCard from "../../HeaderCard";
import GemLoader from "../../loader/GemLoader";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ArrowForward from "@mui/icons-material/ArrowForward";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import apiClient from "../../../app/axiosConfig";
import LedgerStats from "./LedgerStats";

const columns = [
  { columnLabel: "Transaction ID", columnKey: "transactionId" },
  { columnLabel: "Created At", columnKey: "createDate" },
  { columnLabel: "Amount", columnKey: "amount" },
  { columnLabel: "Transaction Type", columnKey: "transactionType" },
  { columnLabel: "Note", columnKey: "note" },
];

const MOCK_DATA = {
  clientId: "C-1001",
  clientName: "John Doe Enterprises",
  email: "contact@johndoeent.com",
  agentName: "Alice Johnson",
  einNumber: "12-3456789",
  clientSince: "2021-05-14",
  transactions: [
    {
      transactionId: "T-9001",
      amount: 1200.5,
      transactionType: "CREDIT",
      description: "Invoice Payment",
      note: "Paid via bank transfer",
      createDate: "2025-08-01",
    },
    {
      transactionId: "T-9002",
      amount: 450.0,
      transactionType: "DEBIT",
      description: "Service Charges",
      note: "Monthly subscription fee",
      createDate: "2025-08-05",
    },
    {
      transactionId: "T-9003",
      amount: 300.0,
      transactionType: "CREDIT",
      description: "Refund Received",
      note: "Refund for overpayment",
      createDate: "2025-08-12",
    },
    {
      transactionId: "T-9004",
      amount: 100.0,
      transactionType: "DEBIT",
      description: "Transaction Fee",
      note: "Processing fee",
      createDate: "2025-08-20",
    },
  ],
  totalCredit: 1500.5,
  totalCreditTransactions: 2,
  totalDebit: 550.0,
  totalDebitTransactions: 2,
  totalTransactions: 4,
};

const LedgerTracker = () => {
  const { token, id, roles } = useSelector(
    (state) => state.user.userDetails || {}
  );
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [clientDetails, setClientDetails] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAgent, setSelectedAgent] = useState(
    roles[0] === "business_admin" ? "all" : id
  );
  const [selectedClient, setSelectedClient] = useState("all");
  const [dropdownUsers, setDropdownUsers] = useState({});
  const [dropdownClients, setClientDropdown] = useState({});

  // Dialog states for quotation preview
  const [openQuotationDialog, setOpenQuotationDialog] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState(null);

  // Dialog state for tracking ID input
  const [openTrackingDialog, setOpenTrackingDialog] = useState(false);
  const [trackingLedger, setTrackingLedger] = useState(null);
  const [trackingId, setTrackingId] = useState("");
  const [trackingError, setTrackingError] = useState("");

  // Dialog state for adding ledger
  const [openAddLedgerDialog, setOpenAddLedgerDialog] = useState(false);
  const [ledgerFormData, setLedgerFormData] = useState({
    amount: "",
    transactionType: "",
    note: "",
  });
  const [ledgerFormErrors, setLedgerFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          ...Object.fromEntries(
            userData.map((user) => [user.id, user.username])
          ),
          all: "All",
        };
      }
      setDropdownUsers(userMap);
    } catch (error) {
      setDropdownUsers({ all: "All" });
      console.error("Error fetching agents:", error);
    }
  }, []);

  const fetchClients = useCallback(async (agentId, shouldAutoSelect = true) => {
    try {
      let response;
      if (agentId === "all" && roles[0] === "business_admin") {
        response = await apiClient.get(`/businessAdmin/clients`);
      } else {
        response = await apiClient.get(
          `agent/clients?agentId=${agentId}&offset=0&size=100`
        );
      }

      let clientMap = {};
      if (response?.status === 200) {
        const clientData = response?.data?.data || [];
        if (clientData.length > 0) {
          clientMap = {
            ...Object.fromEntries(
              clientData.map((client) => [
                client?.id,
                client?.clientName || client?.name,
              ])
            ),
          };
          // Set the first client as selected by default only on initial load
          if (shouldAutoSelect && (!selectedClient || selectedClient === "all")) {
            const firstClientId = Object.keys(clientMap)[0];
            setSelectedClient(firstClientId);
          }
        } else {
          clientMap = { "no-clients": "No clients available" };
          if (shouldAutoSelect) {
            setSelectedClient("no-clients");
          }
        }
      }
      setClientDropdown(clientMap);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClientDropdown({ "no-clients": "No clients available" });
      if (shouldAutoSelect) {
        setSelectedClient("no-clients");
      }
      toast.error("Failed to load clients. Please try again.");
    }
  }, [selectedClient]);

  const fetchLedgers = useCallback(
    async (currentPage = 1) => {
      // Don't fetch if no client is selected or if it's "no-clients"
      if (!selectedClient || selectedClient === "no-clients") {
        setLedgers([]);
        setTotalRecords(0);
        setClientDetails({});
        setTotalPages(0);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const offset = (currentPage - 1) * pageSize;
        const response = await apiClient.get(
          `/client-ledger/client/${selectedClient}?offset=${offset}&size=${pageSize}`
        );

        console.log("Response Ledger", response?.data);
        if (response?.data && response?.status === 200) {
          const fetchedLedgers = response?.data?.transactions || [];
          setLedgers(fetchedLedgers);
          setTotalRecords(fetchedLedgers?.length || 0);
          setClientDetails(response?.data);
          setTotalPages(Math.ceil((fetchedLedgers?.length || 0) / pageSize));
        }
      } catch (err) {
        console.error("Error fetching ledgers:", err);
        setError("Failed to fetch ledgers. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [id, pageSize, roles, selectedAgent, selectedClient]
  );

  useEffect(() => {
    if (roles?.[0] === "business_admin") {
      fetchAllUsers();
    }
    fetchClients(selectedAgent);
    fetchLedgers(page);
  }, [fetchLedgers, page, roles, fetchAllUsers, fetchClients, selectedAgent, selectedClient]);

  const handlePageChange = (direction) => {
    const newPage = direction === "next" ? page + 1 : page - 1;
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const handleAgentChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedAgent(selectedValue);
    setPage(1);
    fetchClients(selectedValue);
  };

  const handleClientChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedClient(selectedValue);
    setPage(1);
    // Don't call fetchClients here to avoid resetting client selection
    // fetchClients(selectedValue, false); // Only pass false to prevent auto-selection
  };

  const handlePreview = (quotation) => {
    setPreviewImage(quotation?.imageUrl);
    setOpenPreview(true);
  };

  const handleOpenQuotationDialog = (ledger) => {
    setSelectedLedger(ledger);
    setOpenQuotationDialog(true);
  };

  const handleCloseQuotationDialog = () => {
    setOpenQuotationDialog(false);
    if (openPreview) {
      setSelectedLedger(null);
    }
  };

  const handleQuotationCardClick = (quotation) => {
    handlePreview(quotation);
    handleCloseQuotationDialog();
  };

  const handleAddLedger = () => {
    setLedgerFormData({
      amount: "",
      transactionType: "",
      note: "",
    });
    setLedgerFormErrors({});
    setOpenAddLedgerDialog(true);
  };

  const validateLedgerForm = () => {
    const errors = {};

    if (!ledgerFormData.amount || ledgerFormData.amount <= 0) {
      errors.amount = "Amount must be greater than 0";
    }

    if (!ledgerFormData.transactionType) {
      errors.transactionType = "Transaction type is required";
    } else if (!["CREDIT", "DEBIT"].includes(ledgerFormData.transactionType.toUpperCase())) {
      errors.transactionType = "Transaction type must be either CREDIT or DEBIT";
    }

    if (!ledgerFormData.note || ledgerFormData.note.trim().length === 0) {
      errors.note = "Note is required";
    }

    setLedgerFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLedgerFormChange = (field, value) => {
    setLedgerFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (ledgerFormErrors[field]) {
      setLedgerFormErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleAddLedgerSubmit = async () => {
    if (!validateLedgerForm()) {
      return;
    }

    if (selectedClient === "all" || selectedClient === "no-clients" || !selectedClient) {
      toast.error("Please select a specific client to add a transaction");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestBody = {
        clientId: selectedClient,
        amount: parseFloat(ledgerFormData.amount),
        transactionType: ledgerFormData.transactionType.toUpperCase(),
        note: ledgerFormData.note.trim(),
      };

      // Mock API call - replace with actual API endpoint
      console.log("Adding ledger transaction:", requestBody);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For now, just add to local state (mock implementation)
      const newTransaction = {
        transactionId: `T-${Date.now()}`,
        amount: requestBody.amount,
        transactionType: requestBody.transactionType,
        note: requestBody.note,
        createDate: new Date().toISOString().split('T')[0],
      };

      setLedgers(prev => [newTransaction, ...prev]);
      setTotalRecords(prev => prev + 1);
      setTotalPages(Math.ceil((totalRecords + 1) / pageSize));

      toast.success("Transaction added successfully!");
      setOpenAddLedgerDialog(false);

      // Reset form
      setLedgerFormData({
        amount: "",
        transactionType: "",
        note: "",
      });

    } catch (error) {
      console.error("Error adding ledger transaction:", error);
      toast.error("Failed to add transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLedgerDialogClose = () => {
    if (!isSubmitting) {
      setOpenAddLedgerDialog(false);
      setLedgerFormErrors({});
      setLedgerFormData({
        amount: "",
        transactionType: "",
        note: "",
      });
    }
  };

  const handleStatusChange = async (ledger, newStatus, trackingId) => {
    setLoading(true);
    try {
      if (newStatus === "shipped") {
        if (!trackingId) {
          throw new Error("Tracking ID is required for Ledger");
        }
        await apiClient.post(
          `/shipping/addTrackingId?shippingId=${ledger?.shippingId}&trackingId=${trackingId}`,
          null,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      let requestBody = {
        shippingId: ledger?.shippingId,
        status: newStatus,
      };

      const response = await apiClient.post(`/shipping/update`, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      fetchLedgers(page);

      toast.success(`Status Changed Successfully!`);
    } catch (error) {
      console.error("Error Saving Status Change", error);
      toast.error("Error While Changing Status of Ledger!");
    } finally {
      setLoading(false);
    }
  };

  const handleTrackingDialogClose = () => {
    setOpenTrackingDialog(false);
    setTrackingLedger(null);
    setTrackingId("");
    setTrackingError("");
  };

  const handleTrackingSubmit = () => {
    if (!trackingId.trim()) {
      setTrackingError("Tracking ID is required");
      return;
    }

    if (trackingLedger) {
      handleStatusChange(trackingLedger, "shipped", trackingId.trim());
      handleTrackingDialogClose();
    }
  };

  const filteredLedgers = ledgers.filter((q) => {
    const searchMatch = searchTerm
      ? JSON.stringify(q).toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    // For ledger data, we don't have agent information in the transaction records
    // So agent filtering is not applicable for ledger transactions
    const agentMatch = true; // Always true since we don't filter by agent in ledger

    // Convert statusFilter to uppercase to match transactionType format
    const statusMatch = statusFilter === "all" ||
      q?.transactionType?.toLowerCase() === statusFilter.toLowerCase();

    // For ledger data, client filtering happens at the API level
    // Since we're fetching data for a specific client, all records belong to that client
    const clientMatch = true; // Always true since API filters by client

    return searchMatch && agentMatch && statusMatch && clientMatch;
  });

  const clientDetailFields = [
    { label: "Client", key: "clientName", fallback: "Unknown Client" },
    { label: "Email", key: "email", fallback: "No Email" },
    {
      label: "Shipping Address",
      key: "shippingAddress",
      fallback: "No Shipping Address",
    },
    { label: "City", key: "city", fallback: "No City" },
    { label: "State", key: "state", fallback: "No State" },
    { label: "Country", key: "country", fallback: "No Country" },
    { label: "Zip Code", key: "zipCode", fallback: "No Zip Code" },
    { label: "EIN Number", key: "einNumber", fallback: "No EIN Number" },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header Section */}
      <HeaderCard
        icon="📒"
        color="teal"
        title="Ledger Tracker"
        description="Track and Manage Ledgers"
      ></HeaderCard>

      <Card className="shadow-lg mb-6">
        <div className="mt-4 p-4">
          {/* <LedgerStats ledgers={clientDetails} /> */}
        </div>
        <CardContent>
          <Box className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <Box className="flex-1 w-full md:w-auto mb-10">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search ledgers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon className="text-gray-400" />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: "12px",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#4c257e",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#4c257e",
                      },
                    },
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f8fafc",
                  },
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
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "#4c257e",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#4c257e",
                        },
                      },
                    }}
                  >
                    {Object.entries(dropdownUsers).map(([key, value]) => (
                      <MenuItem
                        key={key}
                        value={key}
                        sx={{ fontSize: "0.875rem" }}
                      >
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

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
                    borderRadius: "12px",
                    backgroundColor: "#f8fafc",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#4c257e",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#4c257e",
                      },
                    },
                  }}
                >
                  {Object.entries(dropdownClients).map(([key, value]) => (
                    <MenuItem
                      key={key}
                      value={key}
                      sx={{ fontSize: "0.875rem" }}
                    >
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

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
                    borderRadius: "12px",
                    backgroundColor: "#f8fafc",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#4c257e",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#4c257e",
                      },
                    },
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="debit">Debit</MenuItem>
                  <MenuItem value="credit">Credit</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box className="w-full md:w-48 mb-10">
            <Button
            type="button"
            variant="contained"
            disabled={selectedClient === "all" || selectedClient === "no-clients" || !selectedClient}
            onClick={() => handleAddLedger()}
            className="h-12 !bg-[var(--brand-purple)] hover:!bg-[var(--brand-dark-purple)]"
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              "&:hover": {
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            <AddIcon className="mr-2" />
            Add Ledger
          </Button>
          </Box>

            {/* Results Count */}
            <Box className="text-center md:text-right mb-10">
              <Typography variant="body2" className="text-gray-600">
                Showing {filteredLedgers.length} of {totalRecords} results
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
              Ledger List
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
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 500,
                    borderColor: "#4c257e",
                    color: "#4c257e",
                    "&:hover": {
                      borderColor: "#3730a3",
                      backgroundColor: "#f3f4f6",
                    },
                    "&:disabled": {
                      borderColor: "#d1d5db",
                      color: "#9ca3af",
                    },
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
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 500,
                    borderColor: "#4c257e",
                    color: "#4c257e",
                    "&:hover": {
                      borderColor: "#3730a3",
                      backgroundColor: "#f3f4f6",
                    },
                    "&:disabled": {
                      borderColor: "#d1d5db",
                      color: "#9ca3af",
                    },
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
          {!loading && ledgers.length > 0 && (
            <TableContainer
              component={Paper}
              className="shadow-md"
              sx={{
                maxHeight: "600px",
                paddingBottom: 18,
                "& .MuiTable-root": {
                  borderCollapse: "separate",
                  borderSpacing: 0,
                },
              }}
            >
              <Table
                stickyHeader
                sx={{ minWidth: 650 }}
                aria-label="ledgers table"
              >
                <TableHead>
                  <TableRow className="!bg-gradient-to-r !from-purple-100 !to-indigo-200">
                    {columns?.map((col) => {
                      return (
                        <TableCell
                          key={col.columnKey}
                          className="!font-bold !text-[#4c257e]"
                          sx={{
                            fontSize: "0.95rem",
                            backgroundColor: "#f8fafc",
                            borderBottom: "2px solid #e5e7eb",
                            position: "sticky",
                            top: 0,
                            zIndex: 1,
                            padding: "12px 16px",
                            fontWeight: 600,
                            width: "auto",
                          }}
                        >
                          {col.columnLabel}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLedgers?.map((ledger, index) => (
                    <TableRow
                      key={ledger?.shippingId}
                      className={`hover:!bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "!bg-white" : "!bg-gray-25"
                      }`}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f9fafb",
                        },
                      }}
                    >
                      <TableCell
                        className="!font-medium"
                        sx={{ padding: "12px 16px" }}
                      >
                        {ledger?.transactionId}
                      </TableCell>
                      <TableCell
                        className="!font-medium"
                        sx={{ padding: "12px 16px" }}
                      >
                        {ledger?.createdAt}
                      </TableCell>
                      <TableCell sx={{ padding: "12px 16px" }}>
                        <Typography
                          variant="body2"
                          className="font-semibold text-green-600"
                        >
                          $ {ledger?.amount?.toFixed(2) || "0.00"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ padding: "12px 16px" }}>
                        <Chip
                          label={ledger?.transactionType}
                          sx={{
                            width: 100,
                            fontWeight: "bold",
                            color: "#fff",
                            backgroundColor:
                              ledger?.transactionType === "DEBIT"
                                ? "#e53935"
                                : "#43a047",
                            "& .MuiChip-label": {
                              width: "100%",
                              textAlign: "center",
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell
                        className="!font-medium"
                        sx={{ padding: "12px 16px" }}
                      >
                        {ledger?.note}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Empty State */}
          {!loading && ledgers.length === 0 && selectedClient && selectedClient !== "all" && selectedClient !== "no-clients" && (
            <Box className="text-center py-12">
              <ImageIcon className="!text-6xl text-gray-300 mb-4" />
              <Typography variant="h6" className="text-gray-500 mb-2">
                {searchTerm || statusFilter !== "all"
                  ? "No matching transactions found"
                  : "No transactions found for this client"}
              </Typography>
              <Typography variant="body2" className="text-gray-400">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "This client doesn't have any transactions yet."}
              </Typography>
            </Box>
          )}

          {/* Empty State - No client selected */}
          {!loading && ledgers.length === 0 && (!selectedClient || selectedClient === "all" || selectedClient === "no-clients") && (
            <Box className="text-center py-12">
              <ImageIcon className="!text-6xl text-gray-300 mb-4" />
              <Typography variant="h6" className="text-gray-500 mb-2">
                Please select a client
              </Typography>
              <Typography variant="body2" className="text-gray-400">
                Choose a client from the dropdown to view their transactions.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Quotation Dialog */}
      <Dialog
        open={openQuotationDialog}
        onClose={handleCloseQuotationDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "rounded-xl shadow-lg",
          sx: {
            maxHeight: "80vh",
          },
        }}
        TransitionProps={{ timeout: 300 }}
      >
        <Box className="flex justify-between items-center p-4 border-b">
          <Typography variant="h6" className="font-bold text-[#4c257e]">
            <span style={{ fontWeight: "bold", color: "#4c257e" }}>
              Transaction Id:
            </span>{" "}
            {selectedLedger?.shippingId}
          </Typography>
          <IconButton onClick={handleCloseQuotationDialog}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          {selectedLedger?.quotations &&
          selectedLedger.quotations.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 2,
                maxHeight: "60vh",
                overflowY: "auto",
                p: 1,
              }}
            >
              {selectedLedger.quotations.map((quotation, index) => (
                <Card
                  key={quotation.quotationId || index}
                  onClick={() => handleQuotationCardClick(quotation)}
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.1s ease-in-out",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 8px 25px rgba(76, 37, 126, 0.15)",
                      border: "2px solid #4c257e",
                    },
                    "&:active": {
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box className="flex justify-between items-start mb-3">
                      <Typography
                        variant="subtitle1"
                        className="font-bold text-[#4c257e]"
                        sx={{ mb: 1 }}
                      >
                        {quotation.quotationId}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      className="text-gray-600 mb-2"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "40px",
                      }}
                    >
                      {quotation?.description || "No description available"}
                    </Typography>

                    <Box className="flex justify-between items-center">
                      <Typography
                        variant="body1"
                        className="font-bold text-green-600"
                      >
                        ${quotation.price?.toFixed(2) || "0.00"}
                      </Typography>
                      <Typography variant="caption" className="text-gray-500">
                        Click to preview
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Box className="text-center py-8">
              <ImageIcon className="!text-4xl text-gray-300 mb-3" />
              <Typography variant="body1" className="text-gray-500">
                No quotations found for this ledger
              </Typography>
            </Box>
          )}
        </DialogContent>
        <Box className="p-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {clientDetailFields.map(({ label, key, fallback }) => (
              <div key={key}>
                <Typography variant="h6" className="font-bold text-[#4c257e]">
                  <span style={{ fontWeight: "bold", color: "#4c257e" }}>
                    {label}:
                  </span>{" "}
                  {selectedLedger?.clientDetails?.[key] || fallback}
                </Typography>
              </div>
            ))}
          </div>
        </Box>
      </Dialog>

      {/* Tracking ID Dialog */}
      <Dialog
        open={openTrackingDialog}
        onClose={handleTrackingDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "rounded-xl shadow-lg",
        }}
        TransitionProps={{ timeout: 300 }}
      >
        <Box className="flex justify-between items-center p-4 border-b">
          <Typography variant="h6" className="font-bold text-[#4c257e]">
            {trackingLedger?.shippingId && (
              <>
                <span style={{ fontWeight: "bold", color: "#4c257e" }}>
                  Shipping Id
                </span>
                : {trackingLedger?.shippingId} &nbsp;|&nbsp;{" "}
                <span style={{ fontWeight: "bold", color: "#4c257e" }}>
                  Client:
                </span>{" "}
                {trackingLedger?.clientDetails?.clientName || "Unknown Client"}
              </>
            )}
          </Typography>
          <IconButton onClick={handleTrackingDialogClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 4 }}>
          <Box className="space-y-4">
            <Typography variant="body1" className="text-gray-600 pb-4">
              Enter the tracking ID for the ledger.
            </Typography>

            <TextField
              fullWidth
              label="Tracking ID"
              variant="outlined"
              value={trackingId}
              onChange={(e) => {
                setTrackingId(e.target.value);
                if (trackingError) setTrackingError("");
              }}
              error={!!trackingError}
              helperText={trackingError}
              placeholder="Enter tracking ID..."
              InputProps={{
                sx: {
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#4c257e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#4c257e",
                    },
                  },
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f8fafc",
                },
              }}
            />
          </Box>
        </DialogContent>
        <Box className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <Button
            variant="outlined"
            onClick={handleTrackingDialogClose}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1,
              borderColor: "#d1d5db",
              color: "#6b7280",
              "&:hover": {
                borderColor: "#9ca3af",
                backgroundColor: "#f9fafb",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleTrackingSubmit}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1,
              backgroundColor: "#4c257e",
              "&:hover": {
                backgroundColor: "#3730a3",
              },
            }}
          >
            Submit & Mark as Shipped
          </Button>
        </Box>
      </Dialog>

      {/* Add Ledger Dialog */}
      <Dialog
        open={openAddLedgerDialog}
        onClose={handleAddLedgerDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "rounded-xl shadow-lg",
        }}
        TransitionProps={{ timeout: 300 }}
      >
        <Box className="flex justify-between items-center p-4 border-b">
          <Typography variant="h6" className="font-bold text-[#4c257e]">
            Add Transaction
          </Typography>
          <IconButton onClick={handleAddLedgerDialogClose} disabled={isSubmitting}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 4 }}>
          <Box className="space-y-6">
            <Typography variant="body1" className="text-gray-600 pb-4">
              Enter transaction details below.
            </Typography>

            {/* Form Fields */}
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount Field */}
              <TextField
                fullWidth
                label="Amount"
                variant="outlined"
                type="number"
                value={ledgerFormData.amount}
                onChange={(e) => handleLedgerFormChange("amount", e.target.value)}
                error={!!ledgerFormErrors.amount}
                helperText={ledgerFormErrors.amount}
                placeholder="Enter amount..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <span className="text-gray-400">$</span>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: "12px",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#4c257e",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#4c257e",
                      },
                    },
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f8fafc",
                  },
                }}
                disabled={isSubmitting}
              />

              {/* Transaction Type Field */}
              <FormControl fullWidth variant="outlined" error={!!ledgerFormErrors.transactionType}>
                <Select
                  value={ledgerFormData.transactionType}
                  onChange={(e) => handleLedgerFormChange("transactionType", e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: "12px",
                    backgroundColor: "#f8fafc",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#4c257e",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#4c257e",
                      },
                    },
                  }}
                  disabled={isSubmitting}
                >
                  <MenuItem value="" disabled>
                    Select transaction type
                  </MenuItem>
                  <MenuItem value="CREDIT" sx={{ fontWeight: 600, color: "#43a047" }}>
                    CREDIT
                  </MenuItem>
                  <MenuItem value="DEBIT" sx={{ fontWeight: 600, color: "#e53935" }}>
                    DEBIT
                  </MenuItem>
                </Select>
                {ledgerFormErrors.transactionType && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                    {ledgerFormErrors.transactionType}
                  </Typography>
                )}
              </FormControl>
            </Box>

            {/* Note Field - Full Width */}
            <TextField
              fullWidth
              label="Note"
              variant="outlined"
              multiline
              rows={3}
              value={ledgerFormData.note}
              onChange={(e) => handleLedgerFormChange("note", e.target.value)}
              error={!!ledgerFormErrors.note}
              helperText={ledgerFormErrors.note}
              placeholder="Enter transaction note..."
              InputProps={{
                sx: {
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#4c257e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#4c257e",
                    },
                  },
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f8fafc",
                },
              }}
              disabled={isSubmitting}
            />

            {/* Client Info Display */}
            <Box className="bg-gray-50 p-3 mt-3 rounded-lg">
              <Typography variant="body2" className="text-gray-600 mb-1">
                <strong>Selected Client:</strong> {dropdownClients[selectedClient] || "Please select a client"}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <Box className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <Button
            variant="outlined"
            onClick={handleAddLedgerDialogClose}
            disabled={isSubmitting}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1,
              borderColor: "#d1d5db",
              color: "#6b7280",
              "&:hover": {
                borderColor: "#9ca3af",
                backgroundColor: "#f9fafb",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddLedgerSubmit}
            disabled={isSubmitting}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1,
              backgroundColor: "#4c257e",
              "&:hover": {
                backgroundColor: "#3730a3",
              },
              "&:disabled": {
                backgroundColor: "#9ca3af",
              },
            }}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                Adding Transaction...
              </>
            ) : (
              "Add Transaction"
            )}
          </Button>
        </Box>
      </Dialog>
    </div>
  );
};

export default LedgerTracker;
