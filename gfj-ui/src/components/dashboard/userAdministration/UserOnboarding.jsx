import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import { toast } from "react-toastify";
import apiClient from "../../../app/axiosConfig";

const validationSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  email: Yup.string().required("Email is required"),
  password: Yup.string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  phoneNumber: Yup.string()
    .min(10, "Invalid Number")
    .required("Phone number is required"),
  // role: Yup.string().required("Role is required"),
});

const initialFormData = {
  username: "",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
};

const UserOnboarding = ({ userData, isEdit }) => {
  const { user, token } = useSelector((state) => state.user.userDetails || {});
  const [showPassword, setShowPassword] = useState(false);

  const addEditUser = async (values) => {
    const requestBody = {
      id: userData?.id,
      username: values?.username,
      firstName: values?.firstName,
      lastName: values?.lastName,
      password: values?.password,
      email: values?.email,
      phoneNumber: values?.phoneNumber,
      isActive: true
    };

    let response;

    if (isEdit) {
      if (user === "Agent") {
        response = await apiClient.post(`/businessAdmin/updateAgent`, requestBody, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (response?.status === 200) {
        toast.success(`${user} Updated Successfully!`);
      } else {
        toast.error(`Failed to Updated ${user}!`);
      }
    } else {
      if (user === "Business Admin") {
        response = await apiClient.post(
          `/systemAdministration/user`,
          requestBody,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else if (user === "Agent") {
        response = await apiClient.post(`/businessAdmin/agent`, requestBody, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      console.log("Add Update Response", response)
      if (response?.status === 200) {
        toast.success(`${user} Added Successfully!`);
      } else {
        toast.error(`Failed to Add ${user}!`);
      }
    }
  };

  const formik = useFormik({
    initialValues: { ...initialFormData, ...userData },
    enableReinitialize: true,
    // validationSchema: !isEdit ? validationSchema : Yup.object({}),
    validationSchema: validationSchema,
    onSubmit: (values) => {
      addEditUser(values);
      // formik.resetForm();
    },
  });

  return (
    <Box>
      <form onSubmit={formik.handleSubmit}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            width: "100%",
          }}
        >
          {/* Username */}
          <div
            style={{ flex: "0 0 calc(50% - 12px)", width: "calc(50% - 12px)" }}
          >
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
            />
          </div>

          {/* Email */}
          <div
            style={{ flex: "0 0 calc(50% - 12px)", width: "calc(50% - 12px)" }}
          >
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </div>

          {/* Password */}
          <div
            style={{ flex: "0 0 calc(50% - 12px)", width: "calc(50% - 12px)" }}
          >
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          {/* First Name */}
          <div
            style={{ flex: "0 0 calc(50% - 12px)", width: "calc(50% - 12px)" }}
          >
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.firstName && Boolean(formik.errors.firstName)
              }
              helperText={formik.touched.firstName && formik.errors.firstName}
            />
          </div>

          {/* Last Name */}
          <div
            style={{ flex: "0 0 calc(50% - 12px)", width: "calc(50% - 12px)" }}
          >
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
            />
          </div>

          {/* Phone */}
          <div
            style={{ flex: "0 0 calc(50% - 12px)", width: "calc(50% - 12px)" }}
          >
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
              value={formik.values.phoneNumber}
              onChange={(value, country) => {
                const formattedValue = `+${country.dialCode}-${value.replace(country.dialCode, '')}`;
                formik.setFieldValue("phoneNumber", formattedValue);
              }}
              onBlur={formik.handleBlur}
            />
            {formik.touched.phoneNumber && formik.errors.phoneNumber && (
              <div className="text-[#d32f2f] text-[12px] mt-1">
                {formik.errors.phoneNumber}
              </div>
            )}
          </div>
        </div>

        <Box mt={4}>
          <Button
            variant="contained"
            type="submit"
            className="!bg-[var(--brand-purple)] hover:!bg-[var(--brand-dark-purple)] font-semibold transition-all"
          >
            {isEdit && <Typography>Edit {user}</Typography>}
            {!isEdit && <Typography>Add {user}</Typography>}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default UserOnboarding;
