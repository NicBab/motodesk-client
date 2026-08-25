//************************************************************** */

import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { RootState } from "../store";

//************************************************************** */

type WorkspaceState = {
  activeOrganizationId: string | null;
  activeOrganizationName: string | null;
  activeLocationId: string | null;
};

//************************************************************** */

const initialState: WorkspaceState = {
  activeOrganizationId: null,
  activeOrganizationName: null,
  activeLocationId: null,
};

const workspaceSlice = createSlice({
  name: "workspace",

  initialState,

  reducers: {
    setActiveOrganization: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
      }>,
    ) => {
      state.activeOrganizationId = action.payload.id;
      state.activeOrganizationName = action.payload.name;
      state.activeLocationId = null;
    },

    setActiveLocation: (
      state,
      action: PayloadAction<string | null>,
    ) => {
      state.activeLocationId = action.payload;
    },

    clearWorkspace: (state) => {
      state.activeOrganizationId = null;
      state.activeOrganizationName = null;
      state.activeLocationId = null;
    },
  },
});

//************************************************************** */

export const {
  setActiveOrganization,
  setActiveLocation,
  clearWorkspace,
} = workspaceSlice.actions;

export const workspaceReducer =
  workspaceSlice.reducer;

export const selectActiveOrganizationId = (
  state: RootState,
) => state.workspace.activeOrganizationId;

export const selectActiveOrganizationName = (
  state: RootState,
) => state.workspace.activeOrganizationName;

export const selectActiveLocationId = (
  state: RootState,
) => state.workspace.activeLocationId;

//************************************************************** */