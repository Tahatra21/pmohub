--
-- PostgreSQL database dump
--

\restrict G4xx8v0lFXthPez3MI89WboZPNyIBXFcrwassVZGWDjl2Bzt1c4BDpuqG1GEqNp

-- Dumped from database version 17.6 (Homebrew)
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, permissions, "createdAt", "updatedAt") FROM stdin;
cmghqfh5f00000ghgixlh3trj	System Admin	Full system access	{"risks": {"all": true}, "tasks": {"all": true}, "users": {"all": true}, "budgets": {"all": true}, "projects": {"all": true}, "dashboard": {"read": true}, "documents": {"all": true}, "resources": {"all": true}}	2025-10-08 08:34:04.563	2025-10-08 08:34:04.563
cmghqfh5m00010ghgvnm2eguc	Project Manager	Can manage projects and teams	{"risks": {"all": true}, "tasks": {"all": true}, "budgets": {"read": true, "create": true}, "projects": {"read": true, "create": true, "update": true}, "dashboard": {"read": true}, "documents": {"all": true}, "resources": {"read": true, "create": true}}	2025-10-08 08:34:04.571	2025-10-08 08:34:04.571
cmghqfh5o00020ghgry53cqsc	Field/Site Engineer	Can work on assigned tasks	{"risks": {"read": true, "create": true}, "tasks": {"read": true, "update": true}, "budgets": {"read": true}, "projects": {"read": true}, "dashboard": {"read": true}, "documents": {"read": true, "create": true}, "resources": {"read": true}}	2025-10-08 08:34:04.572	2025-10-08 08:34:04.572
cmghqfh5p00030ghgrxyz9uvv	IT Developer / Technical Team	Technical team member	{"risks": {"read": true, "create": true}, "tasks": {"all": true}, "budgets": {"read": true}, "projects": {"read": true}, "dashboard": {"read": true}, "documents": {"all": true}, "resources": {"read": true}}	2025-10-08 08:34:04.574	2025-10-08 08:34:04.574
cmghqfh5q00040ghg9rlll86q	Client / Stakeholder	View-only access	{"risks": {"read": true}, "tasks": {"read": true}, "budgets": {"read": true}, "projects": {"read": true}, "dashboard": {"read": true}, "documents": {"read": true}, "resources": {"read": true}}	2025-10-08 08:34:04.575	2025-10-08 08:34:04.575
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, name, password, phone, avatar, "roleId", "isActive", "createdAt", "updatedAt") FROM stdin;
cmghqfhc400060ghg3gd57esx	admin@projecthub.com	System Administrator	$2b$12$uVg4MxqFvZZUCXFwgcMdjOi4ikUtwQ4XlQUl63xTj600m0wzpdUci	+1234567890	\N	cmghqfh5f00000ghgixlh3trj	t	2025-10-08 08:34:04.805	2025-10-08 08:34:04.805
cmghqfhi700080ghgsx2f7n64	manager@projecthub.com	John Manager	$2b$12$3CLmCBLQJprPgfyk29ckgOxVtTNpJa.gY06qpg.oI3EupJBBHx9Ve	+1234567891	\N	cmghqfh5m00010ghgvnm2eguc	t	2025-10-08 08:34:05.023	2025-10-08 08:34:05.023
cmghqfho8000a0ghg1btr5eby	engineer@projecthub.com	Jane Engineer	$2b$12$GXttIWOZG.9prAakvQVlGOL74BpvynOJbGErBoRmefoyLCQUF33BO	+1234567892	\N	cmghqfh5o00020ghgry53cqsc	t	2025-10-08 08:34:05.241	2025-10-08 08:34:05.241
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, action, entity, "entityId", description, "userId", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, name, description, type, client, location, status, priority, progress, "startDate", "endDate", "createdBy", "createdAt", "updatedAt") FROM stdin;
cmghqfhob000c0ghg216n90mg	Office Building Electrical Installation	Complete electrical system installation for new office building	ELECTRICAL	ABC Construction Corp	123 Main St, City, State	IN_PROGRESS	HIGH	65	2024-01-15 00:00:00	2024-06-30 00:00:00	cmghqfhi700080ghgsx2f7n64	2025-10-08 08:34:05.243	2025-10-08 08:34:05.243
cmghqfhod000e0ghgnn3u6rzy	Network Infrastructure Upgrade	Upgrade network infrastructure for better performance and security	IT	Tech Solutions Inc	456 Tech Ave, City, State	PLANNING	MEDIUM	15	2024-03-01 00:00:00	2024-08-15 00:00:00	cmghqfhi700080ghgsx2f7n64	2025-10-08 08:34:05.246	2025-10-08 08:34:05.246
\.


--
-- Data for Name: budgets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.budgets (id, "projectId", category, "estimatedCost", "actualCost", "approvedBy", "approvedAt", "createdAt", "updatedAt") FROM stdin;
cmghqfhom000q0ghg3adrxnmw	cmghqfhob000c0ghg216n90mg	Materials	25000	18500	cmghqfhi700080ghgsx2f7n64	2024-01-10 00:00:00	2025-10-08 08:34:05.254	2025-10-08 08:34:05.254
cmghqfhom000r0ghgfg7o922z	cmghqfhob000c0ghg216n90mg	Labor	35000	22000	cmghqfhi700080ghgsx2f7n64	2024-01-10 00:00:00	2025-10-08 08:34:05.254	2025-10-08 08:34:05.254
cmghqfhom000s0ghgtr34k1u7	cmghqfhod000e0ghgnn3u6rzy	Equipment	15000	0	cmghqfhi700080ghgsx2f7n64	2024-02-20 00:00:00	2025-10-08 08:34:05.254	2025-10-08 08:34:05.254
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, title, description, "projectId", "assigneeId", "creatorId", status, priority, progress, "startDate", "endDate", "estimatedHours", "actualHours", "createdAt", "updatedAt") FROM stdin;
cmghqfhog000h0ghgjdq17w7n	Install main electrical panel	Install and configure main electrical distribution panel	cmghqfhob000c0ghg216n90mg	cmghqfho8000a0ghg1btr5eby	cmghqfhi700080ghgsx2f7n64	COMPLETED	HIGH	100	2024-01-20 00:00:00	2024-02-15 00:00:00	40	38	2025-10-08 08:34:05.248	2025-10-08 08:34:05.248
cmghqfhog000i0ghg62brg9au	Run electrical conduits	Install electrical conduits throughout the building	cmghqfhob000c0ghg216n90mg	cmghqfho8000a0ghg1btr5eby	cmghqfhi700080ghgsx2f7n64	IN_PROGRESS	HIGH	70	2024-02-01 00:00:00	2024-03-30 00:00:00	80	56	2025-10-08 08:34:05.248	2025-10-08 08:34:05.248
cmghqfhog000j0ghgd6bvdyzd	Network assessment	Assess current network infrastructure and identify upgrade requirements	cmghqfhod000e0ghgnn3u6rzy	cmghqfho8000a0ghg1btr5eby	cmghqfhi700080ghgsx2f7n64	TODO	MEDIUM	0	2024-03-05 00:00:00	2024-03-20 00:00:00	24	\N	2025-10-08 08:34:05.248	2025-10-08 08:34:05.248
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, title, description, "fileName", "filePath", "fileSize", "fileType", "projectId", "taskId", "uploadedBy", "isPublic", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: milestones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.milestones (id, title, description, "projectId", status, "dueDate", "completedAt", "createdAt", "updatedAt") FROM stdin;
cmghqfhoi000k0ghg29d9km2t	Electrical Design Approval	Get electrical design approved by client	cmghqfhob000c0ghg216n90mg	COMPLETED	2024-01-30 00:00:00	2024-01-28 00:00:00	2025-10-08 08:34:05.251	2025-10-08 08:34:05.251
cmghqfhoi000l0ghgdkb2aun0	Rough-in Inspection	Pass rough-in electrical inspection	cmghqfhob000c0ghg216n90mg	UPCOMING	2024-04-15 00:00:00	\N	2025-10-08 08:34:05.251	2025-10-08 08:34:05.251
cmghqfhoi000m0ghg188xyhmh	Network Analysis Complete	Complete network infrastructure analysis	cmghqfhod000e0ghgnn3u6rzy	UPCOMING	2024-03-25 00:00:00	\N	2025-10-08 08:34:05.251	2025-10-08 08:34:05.251
\.


--
-- Data for Name: project_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_members (id, "projectId", "userId", role, "joinedAt") FROM stdin;
cmghqfhoe000f0ghgxvra9g55	cmghqfhob000c0ghg216n90mg	cmghqfho8000a0ghg1btr5eby	Lead Engineer	2025-10-08 08:34:05.246
cmghqfhoe000g0ghgwvjapxa0	cmghqfhod000e0ghgnn3u6rzy	cmghqfho8000a0ghg1btr5eby	Technical Lead	2025-10-08 08:34:05.246
\.


--
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resources (id, name, type, description, quantity, unit, "costPerUnit", "projectId", "createdAt", "updatedAt") FROM stdin;
cmghqfhok000n0ghg0fj5z338	Electrical Cable (500 ft)	MATERIAL	High-quality electrical cable for main circuits	500	ft	2.5	cmghqfhob000c0ghg216n90mg	2025-10-08 08:34:05.253	2025-10-08 08:34:05.253
cmghqfhok000o0ghg4oph3sa5	Circuit Breakers	MATERIAL	20A circuit breakers for distribution panel	50	pieces	25	cmghqfhob000c0ghg216n90mg	2025-10-08 08:34:05.253	2025-10-08 08:34:05.253
cmghqfhok000p0ghgmp9mzs5w	Network Switches	EQUIPMENT	24-port managed network switches	5	pieces	500	cmghqfhod000e0ghgnn3u6rzy	2025-10-08 08:34:05.253	2025-10-08 08:34:05.253
\.


--
-- Data for Name: resource_allocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_allocations (id, "resourceId", "projectId", "userId", quantity, "allocatedAt") FROM stdin;
\.


--
-- Data for Name: risks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.risks (id, title, description, "projectId", severity, status, mitigation, "assigneeId", "identifiedAt", "resolvedAt", "createdAt", "updatedAt") FROM stdin;
cmghqfhoo000t0ghgqpqwlynm	Supply Chain Delays	Potential delays in electrical component delivery	cmghqfhob000c0ghg216n90mg	MEDIUM	OPEN	Order components early and have backup suppliers	cmghqfhi700080ghgsx2f7n64	2025-10-08 08:34:05.256	\N	2025-10-08 08:34:05.256	2025-10-08 08:34:05.256
cmghqfhoo000u0ghgfkwpagb2	Weather Impact	Weather conditions may delay outdoor work	cmghqfhob000c0ghg216n90mg	LOW	OPEN	Plan work schedule around weather forecast	cmghqfho8000a0ghg1btr5eby	2025-10-08 08:34:05.256	\N	2025-10-08 08:34:05.256	2025-10-08 08:34:05.256
cmghqfhoo000v0ghg0ju4hfbj	System Compatibility	New network equipment may not be compatible with existing systems	cmghqfhod000e0ghgnn3u6rzy	HIGH	OPEN	Thorough testing before full deployment	cmghqfho8000a0ghg1btr5eby	2025-10-08 08:34:05.256	\N	2025-10-08 08:34:05.256	2025-10-08 08:34:05.256
\.


--
-- Data for Name: task_dependencies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_dependencies (id, "taskId", "dependsOnTaskId") FROM stdin;
\.


--
-- PostgreSQL database dump complete
--

\unrestrict G4xx8v0lFXthPez3MI89WboZPNyIBXFcrwassVZGWDjl2Bzt1c4BDpuqG1GEqNp

