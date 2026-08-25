//************************************************************** */

import {
  configureStore,
} from "@reduxjs/toolkit";

import { baseApi } from "./api/baseApi";
import { workspaceReducer } from "./slices/workspaceSlice";

//************************************************************** */

export const makeStore = () =>
  configureStore({
    reducer: {
      workspace: workspaceReducer,

      [baseApi.reducerPath]: baseApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        baseApi.middleware,
      ),

    devTools:
      process.env.NODE_ENV !== "production",
  });

//************************************************************** */

export type AppStore =
  ReturnType<typeof makeStore>;

export type RootState =
  ReturnType<AppStore["getState"]>;

export type AppDispatch =
  AppStore["dispatch"];

//************************************************************** */
