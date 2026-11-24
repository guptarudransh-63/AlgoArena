# AlgoArena — Architecture & System Design

AlgoArena is an asynchronous, isolated online judge and algorithmic practice platform modeled after industry standards like LeetCode and Codeforces.

---

## 1. System Overview

```
                                      +------------------------+
                                      |   Browser (React/Vite) |
                                      +-----------+------------+
                                                  |
                                   HTTP / REST    |  WebSocket (Socket.IO)
                                  Cookie JWT Auth |  Real-time Status Updates
                                                  v
                                      +------------------------+
                                      |   Express API Server   |
                                      +-----+------------+-----+
                                            |            |
                               Read / Write |            | Enqueue Jobs
                                            v            v
                                   +------------+  +------------+
                                   |  MongoDB   |  |   Redis    |
                                   +------------+  |  (BullMQ)  |
                                            ^      +-----+------+
                                            |            |
                               Persist Final|            | Dequeue & Claim
                               Verdicts     |            v
                                      +-----+------------+-----+
                                      | BullMQ Judge Worker    |
                                      +-----------+------------+
                                                  |
                                    Submit Code & | Execution Results
                                    Resource Limits| (stdout, time, mem)
                                                  v
                                      +------------------------+
                                      | Judge0 Sandbox Engine  |
                                      | (Isolated Container)   |
                                      +------------------------+
```

---

## 2. Asynchronous Submission Lifecycle

```
[User submits code]
         |
         v
1. API validates problem, language, length
         |
         v
2. API persists Submission (status = "queued")
         |
         v
3. API enqueues job into BullMQ ("submissions")
         |
         v
4. API immediately returns HTTP 202 { submissionId }
         |
         +--------------------+ (User UI begins polling or listens via Socket.IO)
         |
         v
5. Background Worker claims job atomically
         |
         v
6. Worker updates status: "processing" -> "running"
         |
         v
7. Evaluator submits source code + inputs to Judge0 Execution Service
         |
         v
8. Evaluator compares program stdout against expected test outputs
   using normalized line/whitespace/JSON comparator
         |
         v
9. Worker persists final verdict ("Accepted", "Wrong Answer", "TLE", "MLE", "CE", "RE")
   and aggregate runtime (ms) + peak memory (KB)
         |
         v
10. If full submission & Accepted -> Update UserProblemProgress (status = "solved")
         |
         v
11. Worker emits "submission:status" event to Socket.IO room & closes job
```

---

## 3. Security Boundaries & Execution Isolation

1. **Express API Server Isolation**:
   - Untrusted user code is **never** executed inside Node.js or via host shell (`exec`, `spawn`, `eval`).
   - The API server only orchestrates HTTP requests and database records.

2. **Judge0 Execution Sandbox**:
   - Code runs inside isolated Linux cgroups/chroot/container environments managed by Judge0.
   - Resource controls strictly enforced:
     - CPU time limits (e.g., 2.0 seconds)
     - Wall-clock time limits
     - Memory limits (e.g., 256,000 KB)
     - Process/thread count limits (fork bomb protection)
     - Output size limits (50 KB max stdout/stderr)
     - Network isolation: User programs have zero outbound network access.

3. **Private Test Case Isolation**:
   - Test cases are partitioned into `isPublic: true` and `isPublic: false`.
   - Public APIs (`/problems/:slug`, `/test-samples`) only select `{ isPublic: true }`.
   - Evaluation runs all test cases on the server; private inputs and outputs are never returned in HTTP responses.

4. **Authentication & Session Security**:
   - Authentication tokens are issued as cryptographically signed JWTs stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
   - Cross-user authorization: Users cannot access another user's submission details or drafts.
