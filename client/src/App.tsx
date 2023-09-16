import {
  AuthBindings,
  Authenticated,
  GitHubBanner,
  Refine,
} from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  ErrorComponent,
  notificationProvider,
  RefineSnackbarProvider,
  ThemedLayoutV2,
} from "@refinedev/mui";

import {AccountCircleOutlined, PeopleAltOutlined, VillaOutlined} from "@mui/icons-material"

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import dataProvider from "@refinedev/simple-rest";
import axios, { AxiosRequestConfig } from "axios";
import { CredentialResponse } from "interfaces/google";

import { Login, Home, Agents, MyProfile, PropertyDetails, AllProperties, CreateProperty, AgentProfile, EditProperty } from "pages";

import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { parseJwt } from "utils/parse-jwt";

import { Header } from "./components/header";
import { Sider } from "components/layout/sider";
import { Title } from "components/layout/title";

import { ColorModeContextProvider } from "./contexts/color-mode";


const axiosInstance = axios.create();
axiosInstance.interceptors.request.use((request: AxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (request.headers) {
    request.headers["Authorization"] = `Bearer ${token}`;
  } else {
    request.headers = {
      Authorization: `Bearer ${token}`,
    };
  }

  return request;
});

function App() {
  const authProvider: AuthBindings = {
    login: async ({ credential }: CredentialResponse) => {
      const profileObj = credential ? parseJwt(credential) : null;

      if (profileObj) {
        const response = await fetch('http://localhost:8080/api/v1/users', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            name: profileObj.name,
            email: profileObj.email,
            avatar: profileObj.picture
          })
        });

        const data = await response.json()
        if (response.status === 200) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...profileObj,
              avatar: profileObj.picture,
              userId: data._id
            })
          );
        }else {
          return Promise.reject();
        }
      
        localStorage.setItem("token", `${credential}`);

        return {
          success: true,
          redirectTo: "/",
        };
      }

      return {
        success: false,
      };
   },
    logout: async () => {
      const token = localStorage.getItem("token");

      if (token && typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        axios.defaults.headers.common = {};
        window.google?.accounts.id.revoke(token, () => {
          return {};
        });
      }

      return {
        success: true,
        redirectTo: "/login",
      };
    },
    onError: async (error) => {
      return { error };
    },
    check: async () => {
      const token = localStorage.getItem("token");

      if (token) {
        return {
          authenticated: true,
        };
      }

      return {
        authenticated: false,
        error: {
          message: "Check failed",
          name: "Token not found",
        },
        logout: true,
        redirectTo: "/login",
      };
    },
    getPermissions: async () => null,
    getIdentity: async () => {
      const user = localStorage.getItem("user");
      if (user) {
        return JSON.parse(user);
      }

      return null;
    },
  };

  return (
    <BrowserRouter>
      <GitHubBanner />
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <CssBaseline />
          <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
          <RefineSnackbarProvider>
            <Refine
              dataProvider={dataProvider("http://localhost:8080/api/v1")}
              notificationProvider={notificationProvider}
              routerProvider={routerBindings}
              authProvider={authProvider}
              DashboardPage={Home}
              resources={[
                {
                  name: "properties",
                  list: "/properties",
                  create: "/properties/create",
                  edit: "/properties/edit/:id",
                  show: '/properties/show/:id',
                  icon: <VillaOutlined/>,
                  meta: {
                    canDelete: true,
                  },
                },
                {
                  name: "agents",
                  list: "/agents",
                  create: "/blog-posts/create",
                  edit: "/blog-posts/edit/:id",
                  show: "/agents/show/:id",
                  icon: <PeopleAltOutlined/>,
                  meta: {
                    canDelete: true,
                  },
                },
                {
                  name: "my-profile",
                  list: "/my-profile",
                  create: "/blog-posts/create",
                  edit: "/blog-posts/edit/:id",
                  show: '/my-profile/properties/show/:id',
                  options:{
                    label:'My Profile'
                  },
                  icon: <AccountCircleOutlined/>,
                  meta: {
                    canDelete: true,
                  },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "FxRAZQ-LNaTGu-CAUyB3",
              }}
            >
              <Routes>
                <Route
                  element={
                    <Authenticated fallback={<CatchAllNavigate to="/login" />}>
                      <ThemedLayoutV2 Header={() => <Header isSticky={true} />} Sider={() => <Sider Title={Title} />}>
                        <Outlet />
                      </ThemedLayoutV2>
                    </Authenticated>
                  }
                >
                  <Route index path="/" element={<Home/>} />
                  <Route
                    index
                    element={<NavigateToResource resource="properties" />}
                  />
                  <Route path="/properties">
                    <Route index element={<AllProperties/>}/>
                    <Route path="create" element={<CreateProperty/>}/>
                    <Route path="show/:id" element={<PropertyDetails/>}/>
                    <Route path="edit/:id" element={<EditProperty />} />
                  </Route>
                  <Route path="/agents">
                    <Route index element={<Agents/>}/>
                    <Route path="show/:id" element={<AgentProfile/>}/>
                  </Route>
                  <Route path="/my-profile">
                    <Route index element={<MyProfile/>}/>
                  </Route>

                  <Route path="*" element={<ErrorComponent />} />
                </Route>
                     
                <Route
                  element={
                    <Authenticated fallback={<Outlet />}>
                      <NavigateToResource />
                    </Authenticated>
                  }
                >
                  <Route path="/login" element={<Login />} />
                </Route>
              </Routes>

              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </RefineSnackbarProvider>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
