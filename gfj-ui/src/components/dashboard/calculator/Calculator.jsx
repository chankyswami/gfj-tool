import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
// import mockData from "./mockResponse.json";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import DiamondIcon from "@mui/icons-material/Diamond";
import ScaleIcon from "@mui/icons-material/Scale";
import BackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SizeCard from "./SizeCard";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import HeaderCard from "../../HeaderCard";
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import CreateQuotation from "./CreateQuotation";
import Fade from "@mui/material/Fade";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import apiClient from "../../../app/axiosConfig";

const CustomButton = styled(Button)(() => ({
  "&.Mui-disabled": {
    cursor: "not-allowed !important",
    pointerEvents: "auto",
    backgroundColor: "#d1d5db",
    color: "#fff",
  },
}));

const validationSchema = Yup.object({
  client: Yup.string().required("Please select a client"),
});

const Calculator = () => {
  const { token, roles, id } = useSelector((state) => state.user.userDetails || {});
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const dropdownCache = useRef(null);
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [showCreateQuotation, setShowCreateQuotation] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [allClientData, setAllClientData] = useState([]);

  useEffect(() => {
    const fetchDropdownOptions = async () => {
      if (dropdownCache.current) {
        setDropdownOptions(dropdownCache.current);
        return;
      }
      try {
        let response;

        if (roles[0] === "business_admin") {
          response = await apiClient.get(`/businessAdmin/clients`);
        } else if (roles[0] === "agent"){
          response = await apiClient.get(`agent/clients?agentId=${id}`)
        }
        let options = response?.data?.data;
        setAllClientData(options);
        if (Array.isArray(options)) {
          options = options.map((obj) => ({
            label: obj.clientName,
            value: obj.id,
          }));
        } else {
          options = [];
        }
        dropdownCache.current = options;
        setDropdownOptions(options);
      } catch {
        const options = [];
        dropdownCache.current = options;
        setDropdownOptions(options);
      }
    };
    fetchDropdownOptions();
  }, [token]);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiClient.post("/calculator", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setData(response.data);
    } catch (error) {
      console.error("Error while uploading file!", error?.message);
      toast.error(error?.message);
    }
  };

  const handleCreateQuotation = async () => {
    setTransitioning(true);
    setTimeout(() => {
      setShowCreateQuotation(true);
      setTransitioning(false);
    }, 300); // match Fade duration
  };

  const handleBack = () => {
    setTransitioning(true);
    setTimeout(() => {
      setShowCreateQuotation(false);
      setTransitioning(false);
    }, 300);
  };

  return (
    <Box className="bg-white rounded-lg p-2 border border-white h-full flex flex-col relative">
      {/* CreateQuotation View - Completely replaces Calculator when active */}
      <Fade
        in={showCreateQuotation && !transitioning}
        timeout={300}
        unmountOnExit={false}
      >
        <Box className="absolute inset-0 bg-white z-10 overflow-y-auto">
          <Button
            variant="contained"
            onClick={handleBack}
            className={`w-[48px] h-[48px] !rounded-lg flex items-center justify-center shadow-md !absolute !top-[25px] !left-[19px] !z-10 !bg-[var(--brand-purple)] 
              font-semibold hover:!bg-[var(--brand-dark-purple)] transition-all cursor-pointer`}
          >
            <BackIcon />
          </Button>
          {data != null && (
            <CreateQuotation
              calculatorData={data}
              client={
                allClientData.find(
                  (client) => client?.id === selectedClient?.value
                ) || null
              }
            />
          )}
        </Box>
      </Fade>

      {/* Calculator Main View */}
      <Fade
        in={!showCreateQuotation && !transitioning}
        timeout={300}
        unmountOnExit={false}
      >
        <Box
          className="bg-white h-full flex flex-col overflow-hidden"
          sx={{ width: "100%" }}
        >
          <div className="flex-shrink-0">
            <HeaderCard
              title="Calculator"
              icon="🧮"
              color="teal"
              description={"Calculate the data for quotation generation"}
            />
          </div>
          <Formik
            initialValues={{ client: "" }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              handleCreateQuotation(values?.client);
            }}
          >
            {({ errors, touched, setFieldValue, values }) => (
              <Form className="h-full flex flex-col">
                {/* Fixed Header Section */}
                <div className="flex-shrink-0">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 32,
                    }}
                  >
                    <FormControl
                      sx={{
                        minWidth: 300,
                        position: "relative",
                        height: 40,
                        ".MuiInputBase-root": { height: 36, minHeight: 36 },
                      }}
                      error={touched.client && Boolean(errors.client)}
                    >
                      <Autocomplete
                        options={dropdownOptions}
                        getOptionLabel={(option) => option.label || ""}
                        value={
                          dropdownOptions.find(
                            (opt) => opt.value === values.client
                          ) || null
                        }
                        onChange={(_, newValue) => {
                          setFieldValue(
                            "client",
                            newValue ? newValue.value : ""
                          );
                          setSelectedClient(newValue || null);
                        }}
                        isOptionEqualToValue={(option, value) =>
                          option.value === value.value
                        }
                        size="small"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Client"
                            error={touched.client && Boolean(errors.client)}
                            helperText={touched.client && errors.client}
                            size="small"
                          />
                        )}
                        filterOptions={(options, { inputValue }) => {
                          if (!inputValue) return options;
                          const search = inputValue.toLowerCase();
                          return options.filter((opt) =>
                            opt.label.toLowerCase().includes(search)
                          );
                        }}
                        sx={{
                          minHeight: 40,
                          ".MuiInputBase-root": { minHeight: 40, height: 40 },
                        }}
                      />
                    </FormControl>
                    <CustomButton
                      type="submit"
                      disabled={!data}
                      variant="contained"
                      className={
                        !data
                          ? "h-10"
                          : "h-10 !bg-[var(--brand-purple)] hover:!bg-[var(--brand-dark-purple)]"
                      }
                    >
                      Create Quotation
                    </CustomButton>
                  </div>
                  <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
                    <div className="!rounded-xl !shadow-md" style={{ flex: 1 }}>
                      <Card
                        className="!rounded-xl !shadow-md"
                        sx={{
                          height: "100%",
                          width: "100%",
                          backgroundColor: "var(--brand-yellow)",
                        }}
                      >
                        <CardContent>
                          <Typography className="!font-bold !text-[20px] !text-gray-800 !mb-3 !font-sans">
                            Upload File
                          </Typography>
                          <div
                            className="flex items-center gap-2 border-2 border-gray-300 hover:border-gray-400 rounded-md pr-4 mb-3 bg-white hover:bg-gray-50 cursor-pointer transition-all w-full"
                            onClick={() =>
                              document.getElementById("file-upload").click()
                            }
                          >
                            <span className="bg-gray-200 text-gray-600 py-2 px-4 rounded-tl-md rounded-bl-md">
                              Choose File
                            </span>
                            <span className="text-gray-600 ml-2 truncate">
                              {file ? file.name : "No file chosen"}
                            </span>

                            <input
                              id="file-upload"
                              type="file"
                              className="hidden"
                              onChange={(e) => setFile(e.target.files[0])}
                            />
                          </div>

                          <Button
                            variant="contained"
                            startIcon={<CloudUploadIcon />}
                            className="mt-4"
                            sx={{
                              backgroundColor: "#4CAF50",
                              ":hover": { backgroundColor: "#388E3C" },
                            }}
                            onClick={handleUpload}
                          >
                            Upload
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Card
                        className="!rounded-xl !shadow-md text-white"
                        sx={{
                          height: "100%",
                          width: "100%",
                          backgroundColor: "var(--brand-purple)",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="h6"
                            className="!mb-4 !font-semibold flex items-center !text-white"
                          >
                            <DiamondIcon className="mr-4 !h-15 !w-15 !text-gray-300" />{" "}
                            Total Gems: {data?.totalGems || "-"}
                          </Typography>
                          <Typography
                            variant="h6"
                            className="!font-semibold flex items-center !text-white"
                          >
                            <ScaleIcon className="mr-4 !h-14 !w-14 !text-gray-300" />{" "}
                            Total Weight: {data?.totalWeight || "-"}
                          </Typography>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* Scrollable Data Section - Fixed height to prevent page shifts */}
                <div
                  className="flex-1 overflow-y-auto pb-50"
                  style={{ minHeight: 0 }}
                >
                  {/* Rounds Section */}
                  {data?.rounds && (
                    <Box className="mb-8">
                      <Typography
                        variant="h6"
                        className="text-[var(--brand-dark-purple)] !font-bold !mb-4"
                      >
                        Rounds
                      </Typography>
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 24 }}
                      >
                        {Object.entries(data.rounds).map(([range, values]) => (
                          <div
                            key={range}
                            style={{ flex: "0 0 23.8%", maxWidth: "23.8%" }}
                          >
                            <SizeCard
                              sizeRange={range}
                              totalGems={values.totalGems}
                              totalWeight={values.totalWeight}
                              metaData={values.meta}
                            />
                          </div>
                        ))}
                      </div>
                    </Box>
                  )}

                  {/* Baguettes Section */}
                  {data?.baguettes && (
                    <Box>
                      <Typography
                        variant="h6"
                        className="text-[var(--brand-dark-purple)] !font-bold !mb-4"
                      >
                        Baguettes
                      </Typography>
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 24 }}
                      >
                        {Object.entries(data.baguettes).map(
                          ([range, values]) => (
                            <div
                              key={range}
                              style={{ flex: "0 0 23.8%", maxWidth: "23.8%" }}
                            >
                              <SizeCard
                                sizeRange={range}
                                totalGems={values.totalGems}
                                totalWeight={values.totalWeight}
                                metaData={values.meta}
                              />
                            </div>
                          )
                        )}
                      </div>
                    </Box>
                  )}

                  {/* Unused Section */}
                  {data?.unused && (
                    <Box className="overflow-x-auto mt-5">
                      <Typography
                        variant="h6"
                        className="text-[var(--brand-dark-purple)] !font-bold !mb-4"
                      >
                        Unused
                      </Typography>

                      {/* Styled wrapper div */}
                      <div className="mb-4 shadow-md rounded-lg overflow-hidden border border-gray-300">
                        <table className="min-w-full">
                          <thead className="bg-gray-200 sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-300">
                                Cut Type
                              </th>
                              <th className="px-4 py-3 text-center font-semibold text-gray-900 border-b border-gray-300">
                                Quantity
                              </th>
                              <th className="px-4 py-3 text-center font-semibold text-gray-900 border-b border-gray-300">
                                Size-X
                              </th>
                              <th className="px-4 py-3 text-center font-semibold text-gray-900 border-b border-gray-300">
                                Size-Y
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {data.unused.map((item, index) => (
                              <tr
                                key={index}
                                className="border-b border-gray-200 hover:bg-gray-50"
                              >
                                <td className="px-4 py-3 text-left text-gray-900">
                                  {item["Cut Type"]}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-900">
                                  {item["Quantity"]}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-900">
                                  {item["Size-X"]}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-900">
                                  {item["Size-Y"]}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Box>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </Box>
      </Fade>
    </Box>
  );
};

export default Calculator;
