21:33:45.683 Running build in Washington, D.C., USA (East) – iad1
21:33:45.684 Build machine configuration: 2 cores, 8 GB
21:33:45.699 Cloning github.com/freelancing-solutions/Lattice-engine (Branch: main, Commit: fe62707)
21:33:45.856 Previous build caches not available
21:33:46.404 Cloning completed: 705.000ms
21:33:46.839 Running "vercel build"
21:33:47.263 Vercel CLI 48.2.9
21:33:47.842 Warning: Detected "engines": { "node": ">=18.0.0" } in your `package.json` that will automatically upgrade when a new major Node.js Version is released. Learn More: http://vercel.link/node-version
21:33:47.846 Installing dependencies...
21:34:25.387 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
21:34:25.686 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
21:34:26.246 npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
21:34:26.400 npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
21:34:26.763 npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
21:34:27.682 npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
21:34:28.176 
21:34:28.177 added 549 packages in 40s
21:34:28.177 
21:34:28.177 95 packages are looking for funding
21:34:28.178   run `npm fund` for details
21:34:28.223 Running "npm run build"
21:34:28.336 
21:34:28.336 > lattice-mcp-server@1.0.0 build
21:34:28.336 > tsc
21:34:28.337 
21:34:31.604 src/config/index.ts(3,10): error TS1484: 'ServerConfig' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
21:34:31.605 src/config/index.ts(3,24): error TS1484: 'LatticeEngineConfig' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
21:34:31.605 src/index.ts(47,28): error TS4111: Property 'npm_package_version' comes from an index signature, so it must be accessed with ['npm_package_version'].
21:34:31.606 src/services/health-monitor.ts(5,10): error TS1484: 'HealthStatus' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
21:34:31.606 src/services/health-monitor.ts(136,28): error TS4111: Property 'npm_package_version' comes from an index signature, so it must be accessed with ['npm_package_version'].
21:34:31.607 src/services/health-monitor.ts(144,13): error TS6133: 'healthCheck' is declared but its value is never read.
21:34:31.607 src/services/health-monitor.ts(264,17): error TS4111: Property 'system' comes from an index signature, so it must be accessed with ['system'].
21:34:31.607 src/services/health-monitor.ts(274,17): error TS4111: Property 'connectivity' comes from an index signature, so it must be accessed with ['connectivity'].
21:34:31.608 src/services/health-monitor.ts(280,17): error TS4111: Property 'performance' comes from an index signature, so it must be accessed with ['performance'].
21:34:31.608 src/services/health-monitor.ts(283,17): error TS4111: Property 'configuration' comes from an index signature, so it must be accessed with ['configuration'].
21:34:31.609 src/services/lattice-client.ts(1,17): error TS1484: 'AxiosInstance' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
21:34:31.609 src/services/lattice-client.ts(1,32): error TS1484: 'AxiosRequestConfig' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
21:34:31.609 src/services/lattice-client.ts(1,32): error TS6133: 'AxiosRequestConfig' is declared but its value is never read.
21:34:31.610 src/services/lattice-client.ts(1,52): error TS1484: 'AxiosResponse' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
21:34:31.613 src/services/lattice-client.ts(1,52): error TS6133: 'AxiosResponse' is declared but its value is never read.
21:34:31.614 src/services/lattice-client.ts(8,3): error TS1484: 'AgentOrchestrationRequest' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
21:34:31.614 src/services/lattice-client.ts(9,3): error TS1484: 'AgentOrchestrationResponse' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
21:34:31.614 src/services/lattice-client.ts(10,3): error TS1484: 'SpecGraph' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
21:34:31.614 src/services/lattice-client.ts(11,3): error TS1484: 'SpecNode' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
21:34:31.614 src/services/lattice-client.ts(12,3): error TS1484: 'SpecEdge' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
21:34:31.615 src/services/lattice-client.ts(13,3): error TS1484: 'ApprovalRequest' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
21:34:31.615 src/services/lattice-client.ts(14,3): error TS1484: 'ValidationResult' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
21:34:31.615 src/services/lattice-client.ts(15,3): error TS1484: 'WSMessage' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
21:34:31.615 src/services/lattice-client.ts(184,27): error TS4111: Property 'status' comes from an index signature, so it must be accessed with ['status'].
21:34:31.615 src/services/lattice-client.ts(186,34): error TS4111: Property 'status' comes from an index signature, so it must be accessed with ['status'].
21:34:31.615 src/services/lattice-client.ts(188,11): error TS2345: Argument of type '{}' is not assignable to parameter of type 'string'.
21:34:31.615 src/services/lattice-client.ts(188,27): error TS4111: Property 'error' comes from an index signature, so it must be accessed with ['error'].
21:34:31.615 src/services/lattice-client.ts(315,11): error TS2322: Type 'AgentOrchestrationRequest' is not assignable to type 'Record<string, unknown>'.
21:34:31.615   Index signature for type 'string' is missing in type 'AgentOrchestrationRequest'.
21:34:31.616 src/services/lattice-client.ts(394,17): error TS6133: 'id' is declared but its value is never read.
21:34:31.616 src/services/mcp-server.ts(19,3): error TS1484: 'AgentOrchestrationRequest' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
21:34:31.616 src/services/mcp-server.ts(20,3): error TS1484: 'SpecNode' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
21:34:31.616 src/services/mcp-server.ts(20,3): error TS6133: 'SpecNode' is declared but its value is never read.
21:34:31.616 src/services/mcp-server.ts(21,3): error TS1484: 'SpecEdge' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
21:34:31.616 src/services/mcp-server.ts(21,3): error TS6133: 'SpecEdge' is declared but its value is never read.
21:34:31.616 src/services/mcp-server.ts(22,3): error TS1484: 'ApprovalRequest' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
21:34:31.617 src/services/mcp-server.ts(23,3): error TS1484: 'ValidationResult' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
21:34:31.617 src/services/mcp-server.ts(100,7): error TS2554: Expected 1 arguments, but got 2.
21:34:31.617 src/services/mcp-server.ts(371,58): error TS2345: Argument of type 'Record<string, string> | undefined' is not assignable to parameter of type 'Record<string, unknown>'.
21:34:31.617   Type 'undefined' is not assignable to type 'Record<string, unknown>'.
21:34:31.617 src/services/mcp-server.ts(374,66): error TS2345: Argument of type 'Record<string, string> | undefined' is not assignable to parameter of type 'Record<string, unknown>'.
21:34:31.617   Type 'undefined' is not assignable to type 'Record<string, unknown>'.
21:34:31.617 src/services/mcp-server.ts(377,62): error TS2345: Argument of type 'Record<string, string> | undefined' is not assignable to parameter of type 'Record<string, unknown>'.
21:34:31.618   Type 'undefined' is not assignable to type 'Record<string, unknown>'.
21:34:31.618 src/services/mcp-server.ts(444,54): error TS2379: Argument of type '{ status: "ACTIVE" | "DEPRECATED" | "DRAFT" | "ARCHIVED"; type: "SPEC" | "MODULE" | "FUNCTION" | "CLASS" | "INTERFACE" | "ENUM" | "TYPE"; name: string; properties: Record<string, unknown>; metadata: Record<...>; version: string; description?: string | undefined; }' is not assignable to parameter of type 'Omit<SpecNode, "id" | "createdAt" | "updatedAt">' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
21:34:31.619   Types of property 'description' are incompatible.
21:34:31.619     Type 'string | undefined' is not assignable to type 'string'.
21:34:31.619       Type 'undefined' is not assignable to type 'string'.
21:34:31.619 src/services/mcp-server.ts(457,62): error TS2379: Argument of type '{ status?: "ACTIVE" | "DEPRECATED" | "DRAFT" | "ARCHIVED" | undefined; name?: string | undefined; description?: string | undefined; properties?: Record<string, unknown> | undefined; metadata?: Record<...> | undefined; version?: string | undefined; }' is not assignable to parameter of type 'Partial<SpecNode>' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
21:34:31.620   Types of property 'name' are incompatible.
21:34:31.621     Type 'string | undefined' is not assignable to type 'string'.
21:34:31.621       Type 'undefined' is not assignable to type 'string'.
21:34:31.621 src/services/mcp-server.ts(497,11): error TS2375: Type '{ id: string; type: "mutation" | "validation" | "conflict_resolution" | "impact_analysis" | "semantic_analysis"; payload: Record<string, unknown>; priority: "low" | "medium" | "high" | "critical"; requester: string; timestamp: string; context: Record<...> | undefined; }' is not assignable to type 'AgentOrchestrationRequest' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
21:34:31.622   Types of property 'context' are incompatible.
21:34:31.622     Type 'Record<string, unknown> | undefined' is not assignable to type 'Record<string, unknown>'.
21:34:31.622       Type 'undefined' is not assignable to type 'Record<string, unknown>'.
21:34:31.623 src/services/mcp-server.ts(605,26): error TS4111: Property 'changes' comes from an index signature, so it must be accessed with ['changes'].
21:34:31.623 src/services/mcp-server.ts(606,25): error TS4111: Property 'scope' comes from an index signature, so it must be accessed with ['scope'].
21:34:31.623 src/services/mcp-server.ts(634,29): error TS4111: Property 'focus_area' comes from an index signature, so it must be accessed with ['focus_area'].
21:34:31.623 src/services/mcp-server.ts(662,31): error TS4111: Property 'conflict_type' comes from an index signature, so it must be accessed with ['conflict_type'].
21:34:31.623 src/services/mcp-server.ts(663,26): error TS4111: Property 'context' comes from an index signature, so it must be accessed with ['context'].
21:34:31.623 src/utils/logger.ts(47,25): error TS4111: Property 'NODE_ENV' comes from an index signature, so it must be accessed with ['NODE_ENV'].
21:34:31.623 src/utils/logger.ts(53,17): error TS4111: Property 'NODE_ENV' comes from an index signature, so it must be accessed with ['NODE_ENV'].
21:34:31.642 Error: Command "npm run build" exited with 2