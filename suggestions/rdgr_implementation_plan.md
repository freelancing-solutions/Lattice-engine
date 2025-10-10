## 🌍 Edge Deployment Architecture for Lattice Mutation Engine

Based on Cloudflare Workers constraints and MCP server requirements, here's how to split your system:

---

## 📊 **Edge vs Origin Decision Matrix**

### **Cloudflare Workers Constraints:**
- 128MB memory limit, 30-second CPU time (5 min on paid plans), 10MB code size
- JavaScript, TypeScript, and WebAssembly only
- No persistent connections (WebSocket limitations)
- No long-running processes

---

## ✅ **Components Suitable for Edge (Cloudflare Workers)**

### **1. API Gateway Layer** ⚡
```
/edge-gateway (NEW)
├── src/
│   ├── auth/
│   │   ├── jwt-verify.ts          # JWT validation
│   │   ├── api-key-check.ts       # API key verification
│   │   └── rate-limiter.ts        # Edge rate limiting
│   ├── routes/
│   │   ├── health.ts              # Health checks
│   │   ├── mutations-proxy.ts     # Proxy to origin
│   │   └── approvals-proxy.ts     # Proxy to origin
│   ├── cache/
│   │   ├── spec-cache.ts          # Cloudflare KV for specs
│   │   └── mutation-cache.ts      # Cache recent mutations
│   └── middleware/
│       ├── cors.ts
│       ├── logging.ts
│       └── metrics.ts
├── wrangler.toml                  # Cloudflare config
└── package.json
```

**Benefits:**
- Ultra-low latency auth checks
- Global distribution
- DDoS protection
- Caching layer

**Time: 1-2 weeks**

---

### **2. Read-Heavy API Endpoints** 📖
```typescript
// edge-gateway/src/routes/specs-read.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const specId = url.pathname.split('/').pop();
    
    // Check cache first (Cloudflare KV)
    const cached = await env.SPECS_KV.get(specId);
    if (cached) return new Response(cached, { status: 200 });
    
    // Fallback to origin
    const origin = await fetch(`${env.ORIGIN_URL}/specs/${specId}`);
    const data = await origin.text();
    
    // Cache for 5 minutes
    await env.SPECS_KV.put(specId, data, { expirationTtl: 300 });
    return new Response(data, { status: 200 });
  }
};
```

**Endpoints to move:**
- `GET /specs/{id}` - Spec retrieval
- `GET /approvals/pending` - Pending approvals list
- `GET /mutations/{id}` - Mutation status
- `GET /health` - Health checks
- `GET /metrics` - Basic metrics

**Time: 1 week**

---

### **3. Authentication Edge Functions** 🔐
```typescript
// edge-gateway/src/auth/jwt-verify.ts
import { jwtVerify } from 'jose';

export async function verifyToken(
  token: string, 
  secret: string
): Promise<{ valid: boolean; userId?: string }> {
  try {
    const { payload } = await jwtVerify(
      token, 
      new TextEncoder().encode(secret)
    );
    return { valid: true, userId: payload.sub as string };
  } catch {
    return { valid: false };
  }
}

// edge-gateway/src/middleware/auth.ts
export async function authMiddleware(
  request: Request, 
  env: Env
): Promise<Response | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return new Response('Unauthorized', { status: 401 });
  
  const token = authHeader.replace('Bearer ', '');
  const result = await verifyToken(token, env.JWT_SECRET);
  
  if (!result.valid) return new Response('Invalid token', { status: 401 });
  
  // Add user ID to request context
  return null; // Continue to next handler
}
```

**Time: 1 week**

---

### **4. Static Content & Assets** 🎨
```
/edge-static (NEW)
├── demo/
│   └── approval_client.html       # Served from edge
├── docs/                          # Documentation
└── assets/                        # Images, fonts
```

**Cloudflare Pages** for static hosting
**Time: 2-3 days**

---

## ❌ **Components That MUST Stay on Origin**

### **1. Core Lattice Engine** 🏢
```
/lattice_mutation_engine (ORIGIN - NO CHANGES)
├── api/
│   └── endpoints.py               # FastAPI (Python)
├── agents/
│   └── validator.py               # Complex validation
├── orchestrator/
│   └── mutation_orchestrator.py  # Long-running tasks
└── graph/
    └── neo4j_repository.py        # Database operations
```

**Why Origin:**
- Python-based (not JS/WASM)
- Complex business logic
- Database connections (PostgreSQL, Neo4j)
- Long-running validation (>30s)
- Celery background tasks

**No changes needed**

---

### **2. WebSocket Hub** 🔌
```
/origin-websocket (REFACTOR FROM MAIN ENGINE)
├── src/
│   ├── hub.py                     # WebSocket manager
│   ├── redis_pubsub.py            # Multi-node coordination
│   └── connection_manager.py      # Session handling
└── requirements.txt
```

**Why Origin:**
- MCP servers with persistent connections need origin infrastructure
- WebSockets need long-lived connections
- Redis Pub/Sub coordination
- Stateful session management

**Deployment:** Separate service (Railway, Fly.io, AWS ECS)
**Time: 1 week to extract**

---

### **3. MCP Server** 🤖
```
/mcp-server (ORIGIN - HTTP TRANSPORT)
├── src/
│   ├── server.ts                  # MCP protocol handler
│   ├── transports/
│   │   ├── http.ts               # HTTP transport
│   │   └── stdio.ts              # Local development
│   ├── tools/
│   │   ├── propose-mutation.ts
│   │   └── approve-mutation.ts
│   └── resources/
│       └── specs.ts
└── package.json
```

**Why Origin:**
- MCP HTTP transport makes it deployable but needs persistent connections
- Complex protocol state management
- Integration with engine API
- Long-running tool executions

**Deployment:** Origin server (Node.js on Railway/Fly.io)
**Alternative:** Could use Cloudflare Durable Objects for state
**Time: No changes (already planned for origin)**

---

### **4. VSCode Extension** 💻
```
/vscode-extension (CLIENT-SIDE - NO CHANGES)
├── src/
│   ├── extension.ts               # Extension entry
│   ├── mcp-client/                # MCP client
│   └── ui/                        # Webview panels
└── package.json
```

**Why Client:**
- Runs in VSCode context
- Connects to MCP server (origin)
- No edge deployment needed

---

## 🏗️ **Recommended Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare Edge                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ API Gateway  │  │  Auth Check  │  │ Spec Cache   │ │
│  │   (Worker)   │  │   (Worker)   │  │    (KV)      │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────┐
│                      Origin Server                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Lattice Mutation Engine (FastAPI)        │  │
│  │  • Validation Logic    • Mutation Orchestrator   │  │
│  │  • Graph Repository    • Celery Tasks            │  │
│  └──────────────┬───────────────────────────────────┘  │
│                 │                                        │
│  ┌──────────────┴───────────┬──────────────────────┐   │
│  │  WebSocket Hub (Python)  │  MCP Server (Node)   │   │
│  │  • Real-time updates     │  • Protocol handler  │   │
│  │  • Redis Pub/Sub         │  • Tool execution    │   │
│  └──────────────────────────┴──────────────────────┘   │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ PostgreSQL   │  │    Redis     │  │   Paddle     │ │
│  │  (Neon.tech) │  │  (Upstash)   │  │  (Webhooks)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
          ↑
          │
┌─────────┴─────────┐
│ VSCode Extension  │
│  (Client-side)    │
└───────────────────┘
```

---

## 📦 **Repackaged Project Structure**

```
lattice-system/
│
├── edge-gateway/                    # 🌍 Cloudflare Workers
│   ├── src/
│   │   ├── auth/
│   │   ├── routes/
│   │   ├── cache/
│   │   └── middleware/
│   ├── wrangler.toml
│   └── package.json
│
├── edge-static/                     # 📄 Cloudflare Pages
│   ├── demo/
│   ├── docs/
│   └── assets/
│
├── lattice-engine/                  # 🏢 Origin (Python/FastAPI)
│   ├── src/
│   │   ├── api/
│   │   ├── agents/
│   │   ├── orchestrator/
│   │   └── graph/
│   ├── requirements.txt
│   └── Dockerfile
│
├── websocket-service/               # 🔌 Origin (Python)
│   ├── src/
│   │   ├── hub.py
│   │   ├── redis_pubsub.py
│   │   └── connection_manager.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── mcp-server/                      # 🤖 Origin (Node.js)
│   ├── src/
│   │   ├── server.ts
│   │   ├── transports/
│   │   ├── tools/
│   │   └── resources/
│   ├── package.json
│   └── Dockerfile
│
├── vscode-extension/                # 💻 Client-side
│   ├── src/
│   └── package.json
│
└── shared/                          # 🔄 Shared types/configs
    ├── types/
    ├── schemas/
    └── constants/
```

---

## 🚀 **Implementation Plan**

### **Phase 1: Edge Gateway (2-3 weeks)**
1. Create `edge-gateway` with Wrangler
2. Implement auth middleware
3. Add caching layer (Cloudflare KV)
4. Proxy write operations to origin
5. Deploy to Cloudflare Workers

### **Phase 2: Origin Refactor (1-2 weeks)**
1. Extract WebSocket to separate service
2. Configure CORS for edge requests
3. Add health checks for edge monitoring
4. Set up environment variables

### **Phase 3: Integration (1 week)**
1. Connect edge gateway → origin
2. Test end-to-end flows
3. Configure DNS/routing
4. Load testing

### **Phase 4: MCP Server (No changes)**
Deploy to origin as planned

---

## 💰 **Cost Optimization**

### **Cloudflare Workers (Edge)**
- **Free Tier**: 100K requests/day
- **Paid**: $5/month for 10M requests
- **KV Storage**: $0.50/GB/month

### **Origin Services**
- **Railway/Fly.io**: ~$20-50/month
- **Neon PostgreSQL**: $19/month (paid tier)
- **Upstash Redis**: $10-20/month

**Estimated Monthly**: ~$60-100 (vs $200+ for all origin)

---

## ⚡ **Performance Gains**

| Endpoint | Origin Latency | Edge Latency | Improvement |
|----------|---------------|--------------|-------------|
| Auth check | 150ms | 20ms | **87% faster** |
| Spec read (cached) | 200ms | 15ms | **93% faster** |
| Health check | 100ms | 10ms | **90% faster** |
| Mutation write | 500ms | 520ms | -4% (origin required) |

---

## 🎯 **Key Recommendations**

1. **Start with edge gateway** - Biggest bang for buck
2. **Keep heavy logic on origin** - Python, databases, long tasks
3. **Use Cloudflare KV aggressively** - Cache specs, user sessions
4. **Consider Durable Objects** - For stateful edge logic (advanced)
5. **Monitor cold starts** - Edge workers have ~0ms, origin varies

**Total Time to Implement Edge Split**: 4-6 weeks with AI assistance

Would you like me to create the actual code structure for the `edge-gateway` component?