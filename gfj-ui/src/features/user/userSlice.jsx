import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../app/axiosConfig";
import { Dashboard } from "@mui/icons-material";

// Helper functions for localStorage
const saveUserToStorage = (user) => {
  try {
    localStorage.setItem('user_details', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

const getUserFromStorage = () => {
  try {
    const savedUser = localStorage.getItem('user_details');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
    return null;
  }
};

const removeUserFromStorage = () => {
  try {
    localStorage.removeItem('user_details');
  } catch (error) {
    console.error('Error removing user from localStorage:', error);
  }
};

export const loginUser = createAsyncThunk(
  "user/loginUser",
  async ({ username, password }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const requestBody = {
      username,
      password,
    };
    
    try {
      const response = await apiClient.post("/auth/signin", requestBody);
      if (response?.status === 200) {
        return response?.data;
      }
    } catch (error) {
      console.log("Error message:", error.message);
      console.log("Error response:", error.response);
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401 || status === 403) {
          const errorMessage = data?.message || data?.error || data?.errorMessage || "INVALID_CREDENTIALS";
          throw new Error(errorMessage);
        }
        
        const errorMessage = data?.message || data?.error || data?.errorMessage || "SERVER_ERROR";
        throw new Error(errorMessage);
      }
      
      throw new Error("SERVER_ERROR");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    userDetails: getUserFromStorage(),
    status: "idle",
    error: null,
  },
  reducers: {
    logoutUser: (state) => {
      state.userDetails = null;
      state.status = "idle";
      state.error = null;
      removeUserFromStorage(); // Remove from localStorage on logout
    },
    clearUserError: (state) => {
      state.error = null;
    },
    // Add this reducer to handle rehydration
    rehydrateUser: (state) => {
      const savedUser = getUserFromStorage();
      if (savedUser) {
        state.userDetails = savedUser;
        state.status = "succeeded";
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        const userMap = {
          "agent": "Client",
          "business_admin": "Agent",
          "super_admin": "Business Admin",
        };
        const payload = action.payload;
        const userDetails = {
          ...payload,
          dashboardTabs: [...(payload.dashboardTabs || []), "analytics-dashboard"],
          user: userMap?.[payload?.roles?.[0]] || 'User'
        };
        console.log("User Details", userDetails)
        state.userDetails = userDetails;
        saveUserToStorage(userDetails); // Save to localStorage on successful login
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.userDetails = null;
        removeUserFromStorage(); // Remove from localStorage on failed login
      });
  },
});

export const { logoutUser, clearUserError, rehydrateUser } = userSlice.actions;
export default userSlice.reducer;