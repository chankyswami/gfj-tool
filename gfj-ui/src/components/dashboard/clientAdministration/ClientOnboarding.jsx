import React from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  InputLabel,
  InputAdornment,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import apiClient from "../../../app/axiosConfig";

const validationSchema = Yup.object({
  clientName: Yup.string().required("Business name is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  country: Yup.string().required("Country is required"),
  zipCode: Yup.string().required("ZipCode is required"),
  // logo: Yup.mixed().required("Business logo is required"),
  phoneNumber: Yup.string().required("Contact info is required"),
  businessAddress: Yup.string().required("Business Address is required"),
  shippingAddress: Yup.string().required("Shipping Address is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  taxId: Yup.string(),
  einNumber: Yup.string(),
  diamondSettingPrice: Yup.string().required(
    "Diamond Setting Price is required"
  ),
  goldWastagePercentage: Yup.string().required(
    "Gold Wastage Percentage is required"
  ),
  profitAndLabourPercentage: Yup.string().required(
    "Profit/Labour Percentage is required"
  ),
  cadCamWaxPrice: Yup.string().required("Cad-Cam Price is required"),
});

const initialValues = {
  clientName: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
  logo: null,
  phoneNumber: "",
  businessAddress: "",
  shippingAddress: "",
  email: "",
  taxId: "",
  einNumber: "",
  diamondSettingPrice: "0.00",
  goldWastagePercentage: "0.00",
  profitAndLabourPercentage: "0.00",
  cadCamWaxPrice: "0.00",
};

const ClientOnboarding = ({
  agentId,
  clientData = {},
  isEdit,
}) => {
  const { roles } = useSelector((state) => state.user.userDetails || {});

  const handleSubmit = async (values, { resetForm }) => {
    console.log("Edit Values", values);
    const payload = new FormData();
    Object.entries(values).forEach(([key, val]) => {
      payload.append(key, val);
    });
    if (!isEdit) {
      payload.append("agentId", agentId);
    }

    try {
      let response;
      if (isEdit) {
        response = await apiClient.post(`agent/updateClient`, payload);
      } else {
        response = await apiClient.post(`agent/client`, payload);
      }
      console.log(response)

      if (response?.status === 200) {
        toast.success("Client added successfully!");
        // resetForm();
      } else {
        toast.error(response?.data?.message || "Submission failed");
      }
    } catch (error) {
      toast.error(error?.message || "API call failed");
    }
  };

  return (
    <Box className="p-8 bg-white rounded-xl shadow-lg">
      <Formik
        initialValues={{ ...initialValues, ...(clientData || {}) }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          touched,
          errors,
          handleChange,
          handleBlur,
          setFieldValue,
          handleSubmit,
        }) => (
          <Form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="flex flex-wrap gap-4">
              {/* Row 1 */}
              <div className="w-full md:w-[48.5%]">
                <TextField
                  fullWidth
                  label="Business Name"
                  name="clientName"
                  value={values.clientName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.clientName && Boolean(errors.clientName)}
                  helperText={touched.clientName && errors.clientName}
                />
              </div>

              <div className="w-full md:w-[48.5%]">
                <TextField
                  fullWidth
                  label="Business Address"
                  name="businessAddress"
                  value={values.businessAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.businessAddress && Boolean(errors.businessAddress)
                  }
                  helperText={touched.businessAddress && errors.businessAddress}
                />
              </div>

              <div className="w-full md:w-[48.5%]">
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={values.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.city && Boolean(errors.city)}
                  helperText={touched.city && errors.city}
                />
              </div>
              <div className="w-full md:w-[48.5%]">
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={values.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.state && Boolean(errors.state)}
                  helperText={touched.state && errors.state}
                />
              </div>
              <div className="w-full md:w-[48.5%]">
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={values.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.country && Boolean(errors.country)}
                  helperText={touched.country && errors.country}
                />
              </div>
              <div className="w-full md:w-[48.5%]">
                <TextField
                  fullWidth
                  type="number"
                  label="ZipCode"
                  name="zipCode"
                  value={values.zipCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.zipCode && Boolean(errors.zipCode)}
                  helperText={touched.zipCode && errors.zipCode}
                  InputProps={{
                    inputProps: { inputMode: "numeric", pattern: "[0-9]*" },
                    sx: {
                      "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                        {
                          WebkitAppearance: "none",
                          margin: 0,
                        },
                      "& input[type=number]": {
                        MozAppearance: "textfield",
                      },
                    },
                  }}
                />
              </div>

              {/* Row 2 */}
              <div className="w-full md:w-[48.5%]">
                <PhoneInput
                  country={"us"}
                  inputProps={{
                    name: "phoneNumber",
                    required: true,
                  }}
                  inputStyle={{
                    width: "100%",
                    height: "56px",
                  }}
                  specialLabel="Phone Number"
                  value={values.phoneNumber}
                  onChange={(value, country) => {
                    // Format phone number as +(country code)-(number)
                    const formattedValue = `+${
                      country.dialCode
                    }-${value.replace(country.dialCode, "")}`;
                    setFieldValue("phoneNumber", formattedValue);
                  }}
                  onBlur={handleBlur}
                />
                {touched.phoneNumber && errors.phoneNumber && (
                  <div className="text-[#d32f2f] text-[12px] mt-1">
                    {errors.phoneNumber}
                  </div>
                )}
              </div>

              <div className="w-full md:w-[48.5%]">
                <TextField
                  fullWidth
                  label="Shipping Address"
                  name="shippingAddress"
                  value={values.shippingAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.shippingAddress && Boolean(errors.shippingAddress)
                  }
                  helperText={touched.shippingAddress && errors.shippingAddress}
                />
              </div>

              {/* Row 3 */}
              <div className="w-full md:w-[48.5%]">
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
              </div>

              <div className="w-full md:w-[48.5%]">
                <TextField
                  fullWidth
                  label="EIN Number"
                  name="einNumber"
                  value={values.einNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.einNumber && Boolean(errors.einNumber)}
                  helperText={touched.einNumber && errors.einNumber}
                />
              </div>

              <div className="w-full md:w-[48.5%]">
                <TextField
                  fullWidth
                  label="Tax ID"
                  name="taxId"
                  value={values.taxId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.taxId && Boolean(errors.taxId)}
                  helperText={touched.taxId && errors.taxId}
                />
              </div>

              <div className="w-full md:w-[48.5%]">
                <TextField
                  fullWidth
                  type="number"
                  label="Diamond Setting Price"
                  name="diamondSettingPrice"
                  value={values.diamondSettingPrice}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.diamondSettingPrice &&
                    Boolean(errors.diamondSettingPrice)
                  }
                  helperText={
                    touched.diamondSettingPrice && errors.diamondSettingPrice
                  }
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </div>
              <div className="w-full md:w-[48.5%]">
                <TextField
                  fullWidth
                  type="number"
                  label="Gold Wastage Percentage"
                  name="goldWastagePercentage"
                  value={values.goldWastagePercentage}
                  onChange={(e) => {
                    let value = parseFloat(e.target.value);
                    if (e.target.value === "") {
                      setFieldValue("goldWastagePercentage", "");
                    } else if (!isNaN(value)) {
                      if (value > 15) value = 15;
                      if (value < 1) value = 1;
                      setFieldValue("goldWastagePercentage", value);
                    }
                  }}
                  onBlur={handleBlur}
                  error={
                    touched.goldWastagePercentage &&
                    Boolean(errors.goldWastagePercentage)
                  }
                  helperText={
                    touched.goldWastagePercentage &&
                    errors.goldWastagePercentage
                  }
                  inputProps={{ min: 1, max: 15, step: 0.01 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                />
              </div>
              <div className="w-full md:w-[48.5%]">
                <TextField
                  fullWidth
                  type="number"
                  label="Profit And Labour Percentage"
                  name="profitAndLabourPercentage"
                  value={values.profitAndLabourPercentage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.profitAndLabourPercentage &&
                    Boolean(errors.profitAndLabourPercentage)
                  }
                  helperText={
                    touched.profitAndLabourPercentage &&
                    errors.profitAndLabourPercentage
                  }
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                />
              </div>
              <div className="w-full md:w-[48.5%]">
                <TextField
                  fullWidth
                  type="number"
                  label="Cad-Cam Wax Price"
                  name="cadCamWaxPrice"
                  value={values.cadCamWaxPrice}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.cadCamWaxPrice && Boolean(errors.cadCamWaxPrice)
                  }
                  helperText={touched.cadCamWaxPrice && errors.cadCamWaxPrice}
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </div>

              <div className="w-full md:w-[48.5%]">
                <div
                  className="border-2 border-dashed border-gray-400 rounded-md p-4 text-center cursor-pointer hover:border-[var(--brand-purple)] transition"
                  onClick={() => document.getElementById("logo-upload").click()}
                >
                  <p className="text-sm text-gray-600">
                    {values.logo ? (
                      <span className="text-sm text-gray-600">
                        {values.logo.name}
                      </span>
                    ) : (
                      <>Click to upload business logo</>
                    )}
                  </p>
                </div>

                <input
                  id="logo-upload"
                  name="logo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    setFieldValue("logo", e.currentTarget.files[0]);
                  }}
                  onBlur={handleBlur}
                />

                {touched.logo && errors.logo && (
                  <div className="text-[#d32f2f] text-[12px] mt-2 ml-4 font-arial">
                    {errors.logo}
                  </div>
                )}
              </div>
            </div>

            <Box mt={4}>
              <Button
                variant="contained"
                type="submit"
                className="!bg-[var(--brand-purple)] font-semibold hover:!bg-[var(--brand-dark-purple)] transition-all"
              >
                {isEdit ? (
                  <Typography> Edit Client </Typography>
                ) : (
                  <Typography> Add Client </Typography>
                )}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default ClientOnboarding;
