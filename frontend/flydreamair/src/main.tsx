import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // Import QueryClient and Provider
import { apiClient } from "./utils/axios";
import "./global.css";

// Import the generated route tree
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { routeTree } from "./routeTree.gen";

const basepath = process.env.NODE_ENV === "development" ? "/" : "https://akihiro120.github.io/csit214/";

const queryClient = new QueryClient()

// Create your router instance with the basePath.
const router = createRouter({ routeTree, basepath });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
				<TanStackRouterDevtools router={router} />
			</QueryClientProvider>
		</StrictMode>
	);
}
