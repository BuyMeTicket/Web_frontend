import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import "./styles/globals.css";
import { icons } from './assets/icons'
import { Provider } from 'react-redux'
import store from './store'
import { CLIENT_ID } from "./const/backend";
React.icons = icons
// This is the chain your dApp will work on.
// Change this to the chain your app is built for.
// You can also import additional chains from `@thirdweb-dev/chains` and pass them directly.
const activeChain = "goerli";
const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ThirdwebProvider activeChain={activeChain} clientId={CLIENT_ID} >
      <Provider store={store}>
        <App />
      </Provider>
    </ThirdwebProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
