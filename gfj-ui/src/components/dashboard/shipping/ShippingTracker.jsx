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
  TablePagination,
} from "@mui/material";
import { toast } from "react-toastify";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import HeaderCard from "../../HeaderCard";
import GemLoader from "../../loader/GemLoader";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ArrowForward from "@mui/icons-material/ArrowForward";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import apiClient from "../../../app/axiosConfig";
import ShippingStats from "./ShippingStats";

const columns = [
  { columnLabel: "Shipping ID", columnKey: "shippingId" },
  { columnLabel: "Client", columnKey: "clientId" },
  { columnLabel: "Quotations", columnKey: "quotations" },
  { columnLabel: "Status", columnKey: "status" },
  { columnLabel: "Tracking ID", columnKey: "trackingId" },
  { columnLabel: "Note", columnKey: "trackingNote" },
];

const ShippingTracker = () => {
  const { token, id, roles } = useSelector(
    (state) => state.user.userDetails || {}
  );
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
  const [selectedShipment, setSelectedShipment] = useState(null);

  // Dialog state for tracking ID input
  const [openTrackingDialog, setOpenTrackingDialog] = useState(false);
  const [trackingShipment, setTrackingShipment] = useState(null);
  const [trackingId, setTrackingId] = useState("");
  const [trackingError, setTrackingError] = useState("");
  const [trackingNote, setTrackingNote] = useState("");

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

  const fetchClients = useCallback(async (agentId) => {
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
        clientMap = {
          ...Object.fromEntries(
            clientData.map((client) => [
              client?.id,
              client?.clientName || client?.name,
            ])
          ),
          all: "All Clients",
        };
      }
      setClientDropdown(clientMap);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClientDropdown({ all: "All Clients" });
      toast.error("Failed to load clients. Please try again.");
    }
  }, []);

  const fetchShipments = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
      setError(null);
      try {
        const offset = (currentPage - 1) * pageSize;
        const response = await apiClient.get(
          `/shipping/allShipping?offset=${offset}&size=${pageSize}`
        );

        if (response?.data) {
          const fetchedQuotations = response?.data?.data || [];
          setShipments(fetchedQuotations);
          setTotalRecords(response?.data?.totalRecords || 0);
          setTotalPages(
            Math.ceil((response?.data?.totalRecords || 0) / pageSize)
          );
        }
      } catch (err) {
        console.error("Error fetching shipments:", err);
        setError("Failed to fetch shipments. Please try again.");
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
    fetchShipments(page);
  }, [fetchShipments, page, roles, fetchAllUsers, fetchClients, selectedAgent]);

  const handlePageChange = (direction) => {
    const newPage = direction === "next" ? page + 1 : page - 1;
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const handleTablePaginationChange = (event, newPage) => {
    setPage(newPage + 1); // Convert 0-based to 1-based
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    // Note: In a real implementation, you'd want to update pageSize state
    // and refetch data with the new pageSize. For now, this is a placeholder.
    console.log('Rows per page changed to:', newRowsPerPage);
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
  };

  if (isSaving) {
    return (
      <div className="flex justify-center items-center h-screen">
        <GemLoader />
      </div>
    );
  }

  const handlePreview = (quotation) => {
    setPreviewImage(quotation?.finalQuotations?.[0]?.imageUrl || quotation?.imageUrl);
    setOpenPreview(true);
  };

  const handleClosePreview = () => {
    setOpenPreview(false);
    setPreviewImage(null);
    handleOpenQuotationDialog(selectedShipment);
  };

  const handleOpenQuotationDialog = (shipment) => {
    setSelectedShipment(shipment);
    setOpenQuotationDialog(true);
  };

  const handleCloseQuotationDialog = () => {
    setOpenQuotationDialog(false);
    if (openPreview) {
      setSelectedShipment(null);
    }
  };

  const handleQuotationCardClick = (quotation) => {
    handlePreview(quotation);
    handleCloseQuotationDialog();
  };

  const handleStatusChange = async (shipment, newStatus, trackingId, trackingNote) => {
    setIsSaving(true);
    try {
      if (newStatus === "shipped") {
        if (!trackingId) {
          throw new Error("Tracking ID is required for Shipment");
        }
        await apiClient.post(
          `/shipping/addTrackingId?shippingId=${shipment?.shippingId}&trackingId=${trackingId}&trackingNote=${trackingNote}`,
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
        shippingId: shipment?.shippingId,
        status: newStatus,
      };

      const response = await apiClient.post(`/shipping/update`, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      fetchShipments(page);

      toast.success(`Status Changed Successfully!`);
    } catch (error) {
      console.error("Error Saving Status Change", error);
      toast.error("Error While Changing Status of Shipment!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusSelectChange = (shipment, newStatus) => {
    if (newStatus === "shipped") {
      // Open tracking dialog instead of directly changing status
      setTrackingShipment(shipment);
      setTrackingId("");
      setTrackingError("");
      setTrackingNote("");
      setOpenTrackingDialog(true);
    } else {
      // For other statuses, proceed directly
      handleStatusChange(shipment, newStatus);
    }
  };

  const handleTrackingDialogClose = () => {
    setOpenTrackingDialog(false);
    setTrackingShipment(null);
    setTrackingId("");
    setTrackingError("");
    setTrackingNote("");
  };

  const handleTrackingSubmit = () => {
    if (!trackingId.trim()) {
      setTrackingError("Tracking ID is required");
      return;
    }

    if (trackingShipment) {
      handleStatusChange(trackingShipment, "shipped", trackingId.trim(), trackingNote.trim());
      handleTrackingDialogClose();
    }
  };

  const filteredShipments = shipments.filter((q) => {
    const searchMatch = searchTerm
      ? JSON.stringify(q).toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const agentMatch =
      selectedAgent === "all" ||
      (() => {
        try {
          const agentId = String(q?.quotations?.[0]?.agentId || "");
          return agentId === String(selectedAgent);
        } catch {
          return false;
        }
      })();

    const statusMatch = statusFilter === "all" || q?.status === statusFilter;

    const clientMatch =
      selectedClient === "all" ||
      (() => {
        try {
          const clientId = String(q?.quotations?.[0]?.clientId || "");
          return clientId === String(selectedClient);
        } catch {
          return false;
        }
      })();

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
        icon="📦"
        color="teal"
        title="Shipment Tracker"
        description="Track and Manage Shipments"
      ></HeaderCard>

      <Card className="shadow-lg mb-6">
        <div className="mt-4 p-4">
          <ShippingStats shipments={filteredShipments} />
        </div>
        <CardContent>
          <Box className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <Box className="flex-1 w-full md:w-auto mb-10">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search shipments..."
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
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="returned">Returned</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Results Count */}
            <Box className="text-center md:text-right mb-10">
              <Typography variant="body2" className="text-gray-600">
                Showing {filteredShipments.length} of {totalRecords} results
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
              Shipping List
            </Typography>

            {/* TablePagination */}
            <TablePagination
              component="div"
              count={totalRecords}
              page={page - 1} // Convert 1-based to 0-based
              onPageChange={handleTablePaginationChange}
              rowsPerPage={pageSize}
              onRowsPerPageChange={handleRowsPerPageChange}
              sx={{
                border: "none",
                "& .MuiTablePagination-toolbar": {
                  padding: 0,
                },
                "& .MuiTablePagination-selectLabel": {
                  fontSize: "0.875rem",
                  color: "#6b7280",
                },
                "& .MuiTablePagination-displayedRows": {
                  fontSize: "0.875rem",
                  color: "#6b7280",
                },
                "& .MuiTablePagination-actions": {
                  "& .MuiIconButton-root": {
                    color: "#4c257e",
                    "&:hover": {
                      backgroundColor: "#f3f4f6",
                    },
                    "&.Mui-disabled": {
                      color: "#9ca3af",
                    },
                  },
                },
              }}
            />
          </Box>

          {/* Loading State */}
          {loading && (
            <Box className="flex justify-center items-center py-8">
              <GemLoader size={30} />
            </Box>
          )}

          {/* Table */}
          {!loading && shipments.length > 0 && (
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
                aria-label="shipments table"
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
                  {filteredShipments?.map((shipment, index) => (
                    <TableRow
                      key={shipment?.shippingId}
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
                        {shipment?.shippingId}
                      </TableCell>
                      <TableCell sx={{ padding: "12px 16px" }}>
                        <Typography
                          variant="body1"
                          className="font-semibold text-gray-600"
                        >
                          {(() => {
                            try {
                              return (
                                shipment?.clientDetails?.clientName ||
                                "Unknown Client"
                              );
                            } catch {
                              return "Unknown Client";
                            }
                          })()}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ padding: "12px 16px" }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleOpenQuotationDialog(shipment)}
                          sx={{
                            backgroundColor: "#4c257e",
                            color: "white",
                            borderRadius: "8px",
                            textTransform: "none",
                            fontWeight: 600,
                            px: 2,
                            py: 0.5,
                            minWidth: "auto",
                            "&:hover": {
                              backgroundColor: "#3730a3",
                            },
                          }}
                        >
                          {shipment?.count || "0"} Quotations
                        </Button>
                      </TableCell>
                      <TableCell sx={{ padding: "12px 16px" }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={shipment?.status || "pending"}
                            onChange={(e) =>
                              handleStatusSelectChange(shipment, e.target.value)
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
                                  const status = shipment?.status || "pending";
                                  switch (status.toLowerCase()) {
                                    case "pending":
                                      return "#fef3c7";
                                    case "shipped":
                                      return "#d1fae5";
                                    case "delivered":
                                      return "#fee2e2";
                                    case "returned":
                                      return "#8ce8f6ff";
                                    case "cancelled":
                                      return "#ed9c9cff";
                                    default:
                                      return "#f3f4f6";
                                  }
                                },
                                color: () => {
                                  const status = shipment?.status || "pending";
                                  switch (status.toLowerCase()) {
                                    case "pending":
                                      return "#92400e";
                                    case "shipped":
                                      return "#065f46";
                                    case "delivered":
                                      return "#991b1b";
                                    case "returned":
                                      return "#0e76aeff";
                                    case "cancelled":
                                      return "#940808ff";
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
                              value="pending"
                              disabled
                              sx={{
                                color: "#92400e",
                                backgroundColor: "#fef3c7",
                              }}
                            >
                              Pending
                            </MenuItem>
                            <MenuItem
                              value="shipped"
                              disabled={shipment?.trackingId}
                              sx={{
                                color: "#065f46",
                                backgroundColor: "#d1fae5",
                              }}
                            >
                              Shipped
                            </MenuItem>
                            <MenuItem
                              value="delivered"
                              disabled={!shipment?.trackingId}
                              sx={{
                                color: "#991b1b",
                                backgroundColor: "#fee2e2",
                              }}
                            >
                              Delivered
                            </MenuItem>
                            <MenuItem
                              value="returned"
                              disabled={!shipment?.trackingId}
                              sx={{
                                color: "#0e76aeff",
                                backgroundColor: "#8ce8f6ff",
                              }}
                            >
                              Returned
                            </MenuItem>
                            <MenuItem
                              value="cancelled"
                              disabled={!shipment?.trackingId}
                              sx={{
                                color: "#940808ff",
                                backgroundColor: "#ed9c9cff",
                              }}
                            >
                              Cancelled
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell sx={{ padding: "12px 16px" }}>
                        {shipment?.trackingId ? (
                          <Typography
                            variant="body2"
                            className="font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded"
                            sx={{ fontFamily: "monospace" }}
                          >
                            {shipment?.trackingId}
                          </Typography>
                        ) : (
                          <Typography
                            variant="body2"
                            className="italic text-gray-500"
                            sx={{ fontStyle: "italic" }}
                          >
                            Tracking ID not found
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ padding: "12px 16px" }}>
                        {shipment?.trackingNote ? (
                          <Typography
                            variant="body2"
                            className="font-mono text-gray-800"
                            sx={{ fontFamily: "monospace" }}
                          >
                            {shipment?.trackingNote}
                          </Typography>
                        ) : (
                          <Typography
                            variant="body2"
                            className="italic text-gray-500"
                            sx={{ fontStyle: "italic" }}
                          >
                            No note found
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Empty State */}
          {!loading && shipments.length === 0 && (
            <Box className="text-center py-12">
              <ImageIcon className="!text-6xl text-gray-300 mb-4" />
              <Typography variant="h6" className="text-gray-500 mb-2">
                {searchTerm || statusFilter !== "all"
                  ? "No matching shipments found"
                  : "No shipments found"}
              </Typography>
              <Typography variant="body2" className="text-gray-400">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "There are no shipments to display at the moment."}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

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
              Shipping Id:
            </span>{" "}
            {selectedShipment?.shippingId}
          </Typography>
          <IconButton onClick={handleCloseQuotationDialog}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          {selectedShipment?.quotations &&
          selectedShipment.quotations.length > 0 ? (
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
              {selectedShipment.quotations.map((quotation, index) => (
                <Card
                  key={quotation?.finalQuotations[0]?.finalQuotationId || quotation.quotationId || index}
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
                        {quotation?.finalQuotations[0]?.finalQuotationId || quotation?.quotationId}
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
                      {quotation?.finalQuotations[0]?.description || quotation?.description || "No description available"}
                    </Typography>

                    <Box className="flex justify-between items-center">
                      <Typography
                        variant="body1"
                        className="font-bold text-green-600"
                      >
                        ${quotation?.finalQuotations[0]?.price || quotation.price?.toFixed(2) || "0.00"}
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
                No quotations found for this shipment
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
                  {selectedShipment?.clientDetails?.[key] || fallback}
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
            {trackingShipment?.shippingId && (
              <>
                <span style={{ fontWeight: "bold", color: "#4c257e" }}>
                  Shipping Id
                </span>
                : {trackingShipment?.shippingId} &nbsp;|&nbsp;{" "}
                <span style={{ fontWeight: "bold", color: "#4c257e" }}>
                  Client:
                </span>{" "}
                {trackingShipment?.clientDetails?.clientName ||
                  "Unknown Client"}
              </>
            )}
          </Typography>
          <IconButton onClick={handleTrackingDialogClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 4 }}>
          <Box className="space-y-4">
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

            <TextField
              fullWidth
              label="Note"
              variant="outlined"
              value={trackingNote}
              onChange={(e) => {
                setTrackingNote(e.target.value);
                if (trackingError) setTrackingError("");
              }}
              placeholder="Enter Note..."
              multiline
              minRows={4}
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
                mt: 2,
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
    </div>
  );
};

export default ShippingTracker;
