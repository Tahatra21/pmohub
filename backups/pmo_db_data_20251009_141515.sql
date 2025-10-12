--
-- PostgreSQL database dump
--

\restrict PZMVarHw9SudJvDZnBsvqgmfHcbcSEGQ9ya0F2ajI4ZJUt9g5vFWdvRIQF0yDFE

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
-- Data for Name: tbl_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_roles (id, name, description, permissions, "createdAt", "updatedAt") FROM stdin;
cmghqjcxb00000gz2qxv3b1dm	System Admin	Full system access	{"risks": {"all": true}, "tasks": {"all": true}, "users": {"all": true}, "budgets": {"all": true}, "projects": {"all": true}, "dashboard": {"read": true}, "documents": {"all": true}, "resources": {"all": true}}	2025-10-08 08:37:05.711	2025-10-08 08:37:05.711
cmghqjcxj00010gz2dcr96fxh	Project Manager	Can manage projects and teams	{"risks": {"all": true}, "tasks": {"all": true}, "budgets": {"read": true, "create": true}, "projects": {"read": true, "create": true, "update": true}, "dashboard": {"read": true}, "documents": {"all": true}, "resources": {"read": true, "create": true}}	2025-10-08 08:37:05.72	2025-10-08 08:37:05.72
cmghqjcxl00020gz2ij8l0hzo	Field/Site Engineer	Can work on assigned tasks	{"risks": {"read": true, "create": true}, "tasks": {"read": true, "update": true}, "budgets": {"read": true}, "projects": {"read": true}, "dashboard": {"read": true}, "documents": {"read": true, "create": true}, "resources": {"read": true}}	2025-10-08 08:37:05.722	2025-10-08 08:37:05.722
cmghqjcxn00030gz203tlyxvg	IT Developer / Technical Team	Technical team member	{"risks": {"read": true, "create": true}, "tasks": {"all": true}, "budgets": {"read": true}, "projects": {"read": true}, "dashboard": {"read": true}, "documents": {"all": true}, "resources": {"read": true}}	2025-10-08 08:37:05.723	2025-10-08 08:37:05.723
cmghqjcxo00040gz20b4lbc97	Client / Stakeholder	View-only access	{"risks": {"read": true}, "tasks": {"read": true}, "budgets": {"read": true}, "projects": {"read": true}, "dashboard": {"read": true}, "documents": {"read": true}, "resources": {"read": true}}	2025-10-08 08:37:05.725	2025-10-08 08:37:05.725
\.


--
-- Data for Name: tbl_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_users (id, email, name, password, phone, avatar, "roleId", "isActive", "createdAt", "updatedAt") FROM stdin;
cmghqjd4700060gz27ncnyv1z	admin@projecthub.com	System Administrator	$2b$12$92rWDTTKSaHIjSHBK49c6uo1/fkMwCaw.YH1QKMLcmUtREUTu2ugS	+1234567890	\N	cmghqjcxb00000gz2qxv3b1dm	t	2025-10-08 08:37:05.96	2025-10-08 08:37:05.96
cmghszph600080g2rifo7cphz	manager@projecthub.com	John Manager	$2b$12$LAjGEPa2WMLAqioSKndQMuDxm6LHfrb9oa.j/uQeum923Nga6Zxt.	+1234567891	\N	cmghqjcxj00010gz2dcr96fxh	t	2025-10-08 09:45:47.706	2025-10-08 09:45:47.706
cmghszpn7000a0g2r3l5hb0h2	engineer@projecthub.com	Jane Engineer	$2b$12$Z9DOq1SUnnyw6NSMQb9BduV8Q91AoHTNZ./KbswRcmkKszjR1uUSy	+1234567892	\N	cmghqjcxl00020gz2ij8l0hzo	t	2025-10-08 09:45:47.924	2025-10-08 09:45:47.924
cmghumrb4000t0gk1408czd30	apitest@example.com	API Test User	$2b$12$bwjRS2h/w6T8FqemPWwEFep6Q/ij0O6EkYFiTcUPHaaLO1zS1z902	\N	\N	cmghqjcxo00040gz20b4lbc97	t	2025-10-08 10:31:42.785	2025-10-08 10:31:42.785
\.


--
-- Data for Name: tbl_activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_activity_logs (id, action, entity, "entityId", description, "userId", metadata, "createdAt") FROM stdin;
cmghtszve00150gsz5x60lkf3	CREATE	Project	cmghszpna000c0g2rv4fpv34b	Created new project	cmghszph600080g2rifo7cphz	\N	2025-10-08 10:08:34.203
cmghtszvg00170gsz3vle6h0n	UPDATE	Task	task-1	Updated task progress	cmghszpn7000a0g2r3l5hb0h2	\N	2025-10-08 10:08:34.204
cmghtszvg00190gszunhp6uws	UPLOAD	Document	doc-1	Uploaded system document	cmghszpn7000a0g2r3l5hb0h2	\N	2025-10-08 10:08:34.205
cmghulxro00030gk1pfewy99f	CREATE	Project	cmghulxrj00010gk1ndazmwl1	Created project: API Test Project	cmghqjd4700060gz27ncnyv1z	\N	2025-10-08 10:31:04.501
cmghum0mt00070gk1hh96595p	CREATE	Task	cmghum0mp00050gk1rxgw8sia	Created task: API Test Task	cmghqjd4700060gz27ncnyv1z	\N	2025-10-08 10:31:08.213
cmghum41b000b0gk17211ngy3	CREATE	Resource	cmghum41800090gk13ozu2xnu	Created resource: API Test Resource	cmghqjd4700060gz27ncnyv1z	\N	2025-10-08 10:31:12.623
cmghum74m000f0gk1tmmxar0y	CREATE	Budget	cmghum74k000d0gk1rhodlx9n	Created budget: API_TEST	cmghqjd4700060gz27ncnyv1z	\N	2025-10-08 10:31:16.631
cmghumaij000j0gk1mv824nh7	CREATE	Risk	cmghumaig000h0gk1focsirrt	Created risk: API Test Risk	cmghqjd4700060gz27ncnyv1z	\N	2025-10-08 10:31:21.02
cmghumdp4000n0gk1murnt8q3	UPLOAD	Document	cmghumdp0000l0gk1w6pdqcsl	Uploaded document: API Test Document	cmghqjd4700060gz27ncnyv1z	\N	2025-10-08 10:31:25.144
cmghumrb8000v0gk1be58iu0r	CREATE	User	cmghumrb4000t0gk1408czd30	Created user: API Test User	cmghqjd4700060gz27ncnyv1z	\N	2025-10-08 10:31:42.788
cmghun10h000x0gk1s6r9d3oc	UPDATE	Task	cmghum0mp00050gk1rxgw8sia	Updated task: API Test Task	cmghqjd4700060gz27ncnyv1z	\N	2025-10-08 10:31:55.362
cmghun3qg000z0gk1p7mz010q	DELETE	Task	cmghum0mp00050gk1rxgw8sia	Deleted task: API Test Task	cmghqjd4700060gz27ncnyv1z	\N	2025-10-08 10:31:58.888
cmghv9lz000030gkagqwqhx5f	CREATE	Project	cmghv9lyl00010gka4gow81f6	Created project: Frontend Test Project	cmghqjd4700060gz27ncnyv1z	\N	2025-10-08 10:49:28.956
cmghvl0fq00030gnjt2m8mcp1	CREATE	Project	cmghvl0fk00010gnj7sbtq2h1	Created project: Implementasi MAPPv2	cmghqjd4700060gz27ncnyv1z	\N	2025-10-08 10:58:20.918
cmghx34tv00010g68ko5tbz5e	UPDATE	Project	cmghvl0fk00010gnj7sbtq2h1	Updated project: Implementasi MAPPv2	cmghqjd4700060gz27ncnyv1z	\N	2025-10-08 11:40:26.035
cmghxhebo00010g3zha63o5mc	UPDATE	Project	cmghvl0fk00010gnj7sbtq2h1	Updated project: Implementasi MAPPv2	cmghqjd4700060gz27ncnyv1z	\N	2025-10-08 11:51:31.524
cmgj28mg200010gjj3ou3oedm	UPDATE	Project	cmghvl0fk00010gnj7sbtq2h1	Updated project: Implementasi MAPPv2	cmghqjd4700060gz27ncnyv1z	\N	2025-10-09 06:52:26.402
\.


--
-- Data for Name: tbl_projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_projects (id, name, description, type, client, location, status, priority, progress, "startDate", "endDate", "createdBy", "createdAt", "updatedAt") FROM stdin;
cmghszpna000c0g2rv4fpv34b	Office Building Electrical Installation	Complete electrical system installation for new office building	ELECTRICAL	ABC Construction Corp	123 Main St, City, State	IN_PROGRESS	HIGH	65	2024-01-15 00:00:00	2024-06-30 00:00:00	cmghszph600080g2rifo7cphz	2025-10-08 09:45:47.927	2025-10-08 09:45:47.927
cmghszpnc000e0g2rh6nykit9	Network Infrastructure Upgrade	Upgrade network infrastructure for better performance and security	IT	Tech Solutions Inc	456 Tech Ave, City, State	PLANNING	MEDIUM	15	2024-03-01 00:00:00	2024-08-15 00:00:00	cmghszph600080g2rifo7cphz	2025-10-08 09:45:47.929	2025-10-08 09:45:47.929
cmght4tac00010ghqbupjalaw	Smart Building Automation	IoT-based building automation system	ELECTRICAL	GreenTech Solutions	Jakarta CBD	IN_PROGRESS	HIGH	65	2024-01-15 00:00:00	2024-06-30 00:00:00	cmghszph600080g2rifo7cphz	2025-10-08 09:49:45.925	2025-10-08 09:49:45.925
cmght4tag00030ghqvd862pv8	Data Center Network Upgrade	Network infrastructure upgrade	IT	Bank Indonesia	Jakarta Selatan	PLANNING	HIGH	10	2024-03-01 00:00:00	2024-08-31 00:00:00	cmghszph600080g2rifo7cphz	2025-10-08 09:49:45.929	2025-10-08 09:49:45.929
cmght4tah00050ghqra2mgvez	Factory Electrical Installation	Complete electrical installation for factory	ELECTRICAL	PT Industri Maju	Bekasi	IN_PROGRESS	MEDIUM	45	2024-02-01 00:00:00	2024-07-15 00:00:00	cmghszph600080g2rifo7cphz	2025-10-08 09:49:45.929	2025-10-08 09:49:45.929
cmght4tai00070ghqwv11bt43	Hospital IT System	Hospital management system deployment	IT	RS Cipto Mangunkusumo	Jakarta Pusat	COMPLETED	HIGH	100	2023-10-01 00:00:00	2024-01-31 00:00:00	cmghszph600080g2rifo7cphz	2025-10-08 09:49:45.93	2025-10-08 09:49:45.93
cmght4tai00090ghq5ztllrle	Shopping Mall Security	Security and surveillance system	ELECTRICAL	Mall Kelapa Gading	Jakarta Utara	ON_HOLD	LOW	20	2024-04-01 00:00:00	2024-09-30 00:00:00	cmghszph600080g2rifo7cphz	2025-10-08 09:49:45.931	2025-10-08 09:49:45.931
cmght4taj000b0ghqlkyynx6z	Cloud Migration	Legacy system migration to cloud	IT	PT Telkom Indonesia	Bandung	IN_PROGRESS	HIGH	55	2024-01-01 00:00:00	2024-12-31 00:00:00	cmghszph600080g2rifo7cphz	2025-10-08 09:49:45.932	2025-10-08 09:49:45.932
cmght4tak000d0ghq9sb3kw01	Warehouse Lighting	LED lighting upgrade	ELECTRICAL	PT Logistik Nusantara	Tangerang	PLANNING	MEDIUM	5	2024-05-01 00:00:00	2024-08-31 00:00:00	cmghszph600080g2rifo7cphz	2025-10-08 09:49:45.932	2025-10-08 09:49:45.932
cmght4tal000f0ghqscrzoph1	School Network Setup	WiFi network and computer lab	IT	SMA Negeri 1 Jakarta	Jakarta Selatan	IN_PROGRESS	MEDIUM	70	2024-03-15 00:00:00	2024-07-15 00:00:00	cmghszph600080g2rifo7cphz	2025-10-08 09:49:45.933	2025-10-08 09:49:45.933
cmght4tal000h0ghqgayyyhlk	Office Power Distribution	Electrical power distribution system	ELECTRICAL	PT Property Development	Jakarta Barat	COMPLETED	HIGH	100	2023-08-01 00:00:00	2023-12-31 00:00:00	cmghszph600080g2rifo7cphz	2025-10-08 09:49:45.934	2025-10-08 09:49:45.934
cmght4tam000j0ghq4fjim3qm	Restaurant POS System	Point of Sale system implementation	IT	Restoran Sederhana	Multiple Locations	IN_PROGRESS	LOW	60	2024-02-15 00:00:00	2024-06-30 00:00:00	cmghszph600080g2rifo7cphz	2025-10-08 09:49:45.934	2025-10-08 09:49:45.934
cmghulxrj00010gk1ndazmwl1	API Test Project	Test project created via API	IT	Test Client	Test Location	PLANNING	HIGH	0	\N	\N	cmghqjd4700060gz27ncnyv1z	2025-10-08 10:31:04.495	2025-10-08 10:31:04.495
cmghv9lyl00010gka4gow81f6	Frontend Test Project	Test project created via frontend	IT	Test Client	Test Location	PLANNING	HIGH	0	2024-01-01 00:00:00	2024-12-31 00:00:00	cmghqjd4700060gz27ncnyv1z	2025-10-08 10:49:28.94	2025-10-08 10:49:28.94
cmghvl0fk00010gnj7sbtq2h1	Implementasi MAPPv2	bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla 	IT	PLN (Persero)	DKI Jakarta	PLANNING	HIGH	77	2025-10-08 00:00:00	2025-10-31 00:00:00	cmghqjd4700060gz27ncnyv1z	2025-10-08 10:58:20.912	2025-10-09 06:52:26.386
\.


--
-- Data for Name: tbl_budgets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_budgets (id, "projectId", category, "estimatedCost", "actualCost", "approvedBy", "approvedAt", "createdAt", "updatedAt") FROM stdin;
cmghszpnk000q0g2r632qcz5b	cmghszpna000c0g2rv4fpv34b	Materials	25000	18500	cmghszph600080g2rifo7cphz	2024-01-10 00:00:00	2025-10-08 09:45:47.936	2025-10-08 09:45:47.936
cmghszpnk000r0g2rzqn2jwi0	cmghszpna000c0g2rv4fpv34b	Labor	35000	22000	cmghszph600080g2rifo7cphz	2024-01-10 00:00:00	2025-10-08 09:45:47.936	2025-10-08 09:45:47.936
cmghszpnk000s0g2r0hjzg2jp	cmghszpnc000e0g2rh6nykit9	Equipment	15000	0	cmghszph600080g2rifo7cphz	2024-02-20 00:00:00	2025-10-08 09:45:47.936	2025-10-08 09:45:47.936
cmghtszv6000n0gszzzna8ve3	cmghszpna000c0g2rv4fpv34b	HARDWARE	50000000	45000000	cmghszph600080g2rifo7cphz	2025-10-08 10:08:34.194	2025-10-08 10:08:34.194	2025-10-08 10:08:34.194
cmghtszv7000p0gszknci0mp0	cmghszpna000c0g2rv4fpv34b	LABOR	80000000	75000000	cmghszph600080g2rifo7cphz	2025-10-08 10:08:34.194	2025-10-08 10:08:34.196	2025-10-08 10:08:34.196
cmghtszv8000r0gszaopa1clr	cmghszpnc000e0g2rh6nykit9	MATERIALS	30000000	28000000	cmghszph600080g2rifo7cphz	2025-10-08 10:08:34.194	2025-10-08 10:08:34.196	2025-10-08 10:08:34.196
cmghum74k000d0gk1rhodlx9n	cmghszpna000c0g2rv4fpv34b	API_TEST	5000000	0	cmghqjd4700060gz27ncnyv1z	2025-10-08 10:31:16.627	2025-10-08 10:31:16.628	2025-10-08 10:31:16.628
\.


--
-- Data for Name: tbl_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_tasks (id, title, description, "projectId", "assigneeId", "creatorId", status, priority, progress, "startDate", "endDate", "estimatedHours", "actualHours", "createdAt", "updatedAt") FROM stdin;
cmghszpnf000h0g2r8ld4pian	Install main electrical panel	Install and configure main electrical distribution panel	cmghszpna000c0g2rv4fpv34b	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	COMPLETED	HIGH	100	2024-01-20 00:00:00	2024-02-15 00:00:00	40	38	2025-10-08 09:45:47.931	2025-10-08 09:45:47.931
cmghszpnf000i0g2rxb96o67c	Run electrical conduits	Install electrical conduits throughout the building	cmghszpna000c0g2rv4fpv34b	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	IN_PROGRESS	HIGH	70	2024-02-01 00:00:00	2024-03-30 00:00:00	80	56	2025-10-08 09:45:47.931	2025-10-08 09:45:47.931
cmghszpnf000j0g2rr9ovqxey	Network assessment	Assess current network infrastructure and identify upgrade requirements	cmghszpnc000e0g2rh6nykit9	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	TODO	MEDIUM	0	2024-03-05 00:00:00	2024-03-20 00:00:00	24	\N	2025-10-08 09:45:47.931	2025-10-08 09:45:47.931
cmghtpciq00010ghsdwv62lnz	System Architecture Design	Design the overall system architecture for the building automation system	cmghszpna000c0g2rv4fpv34b	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	IN_PROGRESS	HIGH	75	2024-01-20 00:00:00	2024-02-15 00:00:00	\N	\N	2025-10-08 10:05:43.97	2025-10-08 10:05:43.97
cmghtqnk800010gxqqctqii1w	System Architecture Design	Design the overall system architecture for the building automation system	cmghszpna000c0g2rv4fpv34b	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	IN_PROGRESS	HIGH	75	2024-01-20 00:00:00	2024-02-15 00:00:00	\N	\N	2025-10-08 10:06:44.937	2025-10-08 10:06:44.937
cmghtqnkb00030gxq1c3j78if	Hardware Installation	Install sensors and control devices throughout the building	cmghszpna000c0g2rv4fpv34b	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	TODO	HIGH	20	2024-02-16 00:00:00	2024-03-30 00:00:00	\N	\N	2025-10-08 10:06:44.939	2025-10-08 10:06:44.939
cmghtqnkc00050gxqhbfbah65	Network Configuration	Configure network infrastructure for data center upgrade	cmghszpnc000e0g2rh6nykit9	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	IN_PROGRESS	HIGH	60	2024-03-05 00:00:00	2024-04-15 00:00:00	\N	\N	2025-10-08 10:06:44.94	2025-10-08 10:06:44.94
cmghtqnkd00070gxq8z2f4uw4	Electrical Wiring	Install electrical wiring for factory facility	cmght4tac00010ghqbupjalaw	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	IN_PROGRESS	MEDIUM	45	2024-02-05 00:00:00	2024-04-20 00:00:00	\N	\N	2025-10-08 10:06:44.941	2025-10-08 10:06:44.941
cmghtqnkd00090gxq4zh684sv	System Testing	Test hospital IT system functionality	cmght4tag00030ghqvd862pv8	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	COMPLETED	HIGH	100	2023-12-01 00:00:00	2024-01-25 00:00:00	\N	\N	2025-10-08 10:06:44.942	2025-10-08 10:06:44.942
cmghtqu9000010g1bir4wvav5	System Architecture Design	Design the overall system architecture for the building automation system	cmghszpna000c0g2rv4fpv34b	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	IN_PROGRESS	HIGH	75	2024-01-20 00:00:00	2024-02-15 00:00:00	\N	\N	2025-10-08 10:06:53.605	2025-10-08 10:06:53.605
cmghtqu9300030g1b6zsi4zr4	Hardware Installation	Install sensors and control devices throughout the building	cmghszpna000c0g2rv4fpv34b	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	TODO	HIGH	20	2024-02-16 00:00:00	2024-03-30 00:00:00	\N	\N	2025-10-08 10:06:53.607	2025-10-08 10:06:53.607
cmghtqu9400050g1b04zce1nd	Network Configuration	Configure network infrastructure for data center upgrade	cmghszpnc000e0g2rh6nykit9	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	IN_PROGRESS	HIGH	60	2024-03-05 00:00:00	2024-04-15 00:00:00	\N	\N	2025-10-08 10:06:53.608	2025-10-08 10:06:53.608
cmghtqu9500070g1bv3fhjyov	Electrical Wiring	Install electrical wiring for factory facility	cmght4tac00010ghqbupjalaw	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	IN_PROGRESS	MEDIUM	45	2024-02-05 00:00:00	2024-04-20 00:00:00	\N	\N	2025-10-08 10:06:53.61	2025-10-08 10:06:53.61
cmghtqu9600090g1bzefjkxg5	System Testing	Test hospital IT system functionality	cmght4tag00030ghqvd862pv8	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	COMPLETED	HIGH	100	2023-12-01 00:00:00	2024-01-25 00:00:00	\N	\N	2025-10-08 10:06:53.611	2025-10-08 10:06:53.611
cmghtqu97000b0g1bhwp13ao0	Security Camera Installation	Install security cameras in shopping mall	cmght4tah00050ghqra2mgvez	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	TODO	LOW	15	2024-04-15 00:00:00	2024-06-30 00:00:00	\N	\N	2025-10-08 10:06:53.611	2025-10-08 10:06:53.611
cmghtqu98000d0g1bf16btdli	Database Migration	Migrate legacy databases to cloud infrastructure	cmghszpnc000e0g2rh6nykit9	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	IN_PROGRESS	HIGH	70	2024-01-15 00:00:00	2024-08-31 00:00:00	\N	\N	2025-10-08 10:06:53.612	2025-10-08 10:06:53.612
cmghtqu98000f0g1b013b8njc	LED Fixture Installation	Install LED lighting fixtures in warehouse	cmght4tac00010ghqbupjalaw	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	TODO	MEDIUM	10	2024-05-15 00:00:00	2024-07-31 00:00:00	\N	\N	2025-10-08 10:06:53.613	2025-10-08 10:06:53.613
cmghtr4mw00010g5w9aj81aek	System Architecture Design	Design the overall system architecture for the building automation system	cmghszpna000c0g2rv4fpv34b	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	IN_PROGRESS	HIGH	75	2024-01-20 00:00:00	2024-02-15 00:00:00	\N	\N	2025-10-08 10:07:07.065	2025-10-08 10:07:07.065
cmghtszuu00010gszbr1uznv1	System Design	Design system architecture	cmghszpna000c0g2rv4fpv34b	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	TODO	HIGH	0	\N	\N	\N	\N	2025-10-08 10:08:34.183	2025-10-08 10:08:34.183
cmghtszux00030gszs1dq9y3i	Hardware Setup	Install hardware components	cmghszpna000c0g2rv4fpv34b	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	IN_PROGRESS	MEDIUM	50	\N	\N	\N	\N	2025-10-08 10:08:34.185	2025-10-08 10:08:34.185
cmghtszux00050gszskd8vjok	Network Configuration	Configure network settings	cmghszpnc000e0g2rh6nykit9	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	REVIEW	HIGH	80	\N	\N	\N	\N	2025-10-08 10:08:34.186	2025-10-08 10:08:34.186
cmghtszuy00070gszb87693t8	Testing Phase	Test system functionality	cmght4tac00010ghqbupjalaw	cmghszpn7000a0g2r3l5hb0h2	cmghszph600080g2rifo7cphz	COMPLETED	HIGH	100	\N	\N	\N	\N	2025-10-08 10:08:34.187	2025-10-08 10:08:34.187
\.


--
-- Data for Name: tbl_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_documents (id, title, description, "fileName", "filePath", "fileSize", "fileType", "projectId", "taskId", "uploadedBy", "isPublic", "createdAt", "updatedAt") FROM stdin;
cmghtszvc000z0gszgggma0mr	System Architecture	System architecture document	architecture.pdf	/documents/architecture.pdf	2048000	pdf	cmghszpna000c0g2rv4fpv34b	\N	cmghszpn7000a0g2r3l5hb0h2	f	2025-10-08 10:08:34.2	2025-10-08 10:08:34.2
cmghtszvd00110gsz72tfupxf	Network Manual	Network configuration manual	network-manual.pdf	/documents/network-manual.pdf	1536000	pdf	cmghszpnc000e0g2rh6nykit9	\N	cmghszpn7000a0g2r3l5hb0h2	f	2025-10-08 10:08:34.202	2025-10-08 10:08:34.202
cmghtszve00130gszuiz3nwol	Test Results	System testing results	test-results.pdf	/documents/test-results.pdf	1024000	pdf	cmght4tac00010ghqbupjalaw	\N	cmghszpn7000a0g2r3l5hb0h2	f	2025-10-08 10:08:34.202	2025-10-08 10:08:34.202
cmghumdp0000l0gk1w6pdqcsl	API Test Document	Test document created via API	api-test.pdf	/documents/api-test.pdf	1024000	pdf	cmghszpna000c0g2rv4fpv34b	\N	cmghqjd4700060gz27ncnyv1z	f	2025-10-08 10:31:25.141	2025-10-08 10:31:25.141
\.


--
-- Data for Name: tbl_milestones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_milestones (id, title, description, "projectId", status, "dueDate", "completedAt", "createdAt", "updatedAt") FROM stdin;
cmghszpnh000k0g2rk99mq3f6	Electrical Design Approval	Get electrical design approved by client	cmghszpna000c0g2rv4fpv34b	COMPLETED	2024-01-30 00:00:00	2024-01-28 00:00:00	2025-10-08 09:45:47.933	2025-10-08 09:45:47.933
cmghszpnh000l0g2rkrmj3nfj	Rough-in Inspection	Pass rough-in electrical inspection	cmghszpna000c0g2rv4fpv34b	UPCOMING	2024-04-15 00:00:00	\N	2025-10-08 09:45:47.933	2025-10-08 09:45:47.933
cmghszpnh000m0g2rn57ccg25	Network Analysis Complete	Complete network infrastructure analysis	cmghszpnc000e0g2rh6nykit9	UPCOMING	2024-03-25 00:00:00	\N	2025-10-08 09:45:47.933	2025-10-08 09:45:47.933
cmghtqu99000h0g1begktu90m	Phase 1 Complete	Architecture design and planning phase completed	cmghszpna000c0g2rv4fpv34b	COMPLETED	2024-02-15 00:00:00	\N	2025-10-08 10:06:53.613	2025-10-08 10:06:53.613
cmghtqu9a000j0g1bonnqaehy	Hardware Procurement	All hardware components procured and delivered	cmghszpna000c0g2rv4fpv34b	IN_PROGRESS	2024-03-01 00:00:00	\N	2025-10-08 10:06:53.615	2025-10-08 10:06:53.615
cmghtszv000090gsz2hqbk6j7	Project Kickoff	Project initiation milestone	cmghszpna000c0g2rv4fpv34b	COMPLETED	2024-01-15 00:00:00	2024-01-15 00:00:00	2025-10-08 10:08:34.188	2025-10-08 10:08:34.188
cmghtszv1000b0gszhyw3t7p6	Design Phase Complete	System design completed	cmghszpna000c0g2rv4fpv34b	IN_PROGRESS	2024-02-28 00:00:00	\N	2025-10-08 10:08:34.189	2025-10-08 10:08:34.189
cmghtszv2000d0gszcxlchr91	Testing Complete	All testing completed	cmghszpnc000e0g2rh6nykit9	UPCOMING	2024-04-30 00:00:00	\N	2025-10-08 10:08:34.19	2025-10-08 10:08:34.19
\.


--
-- Data for Name: tbl_project_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_project_members (id, "projectId", "userId", role, "joinedAt") FROM stdin;
cmghszpnd000f0g2ruccava50	cmghszpna000c0g2rv4fpv34b	cmghszpn7000a0g2r3l5hb0h2	Lead Engineer	2025-10-08 09:45:47.93
cmghszpnd000g0g2rjxgcfy7d	cmghszpnc000e0g2rh6nykit9	cmghszpn7000a0g2r3l5hb0h2	Technical Lead	2025-10-08 09:45:47.93
\.


--
-- Data for Name: tbl_resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_resources (id, name, description, "createdAt", "updatedAt", "createdBy", "userId", skills, department, phone, email, "maxProjects", "hourlyRate", status, type) FROM stdin;
cmghz572300070g3paed921mi	API Test User	Technical specialist with expertise in system maintenance and troubleshooting	2025-10-08 12:38:01.467	2025-10-08 12:38:01.51	cmghqjd4700060gz27ncnyv1z	cmghumrb4000t0gk1408czd30	System Maintenance, Troubleshooting, Technical Support, Documentation	Technical Support	+62-815-6789-0123	apitest@example.com	4	55	ALLOCATED	TECHNICAL_TEAM
cmghz571x00010g3pfjrldl60	System Administrator	Experienced project manager with 10+ years in electrical and IT projects	2025-10-08 12:38:01.462	2025-10-08 12:38:01.508	cmghqjd4700060gz27ncnyv1z	cmghqjd4700060gz27ncnyv1z	Project Management, Risk Assessment, Team Leadership, Budget Planning	Project Management	+62-812-3456-7890	admin@projecthub.com	5	75	ALLOCATED	PROJECT_MANAGER
cmghz572100030g3pt10d6ucw	John Manager	Senior field engineer specializing in electrical installations and site supervision	2025-10-08 12:38:01.466	2025-10-08 12:38:01.509	cmghqjd4700060gz27ncnyv1z	cmghszph600080g2rifo7cphz	Electrical Systems, Site Supervision, Safety Management, Quality Control	Engineering	+62-813-4567-8901	manager@projecthub.com	4	65	ALLOCATED	FIELD_ENGINEER
cmghz572200050g3p7lu3w6xr	Jane Engineer	Full-stack developer with expertise in web applications and system integration	2025-10-08 12:38:01.467	2025-10-08 12:38:01.51	cmghqjd4700060gz27ncnyv1z	cmghszpn7000a0g2r3l5hb0h2	React, Node.js, PostgreSQL, System Integration, API Development	IT Development	+62-814-5678-9012	engineer@projecthub.com	3	70	ALLOCATED	IT_DEVELOPER
\.


--
-- Data for Name: tbl_resource_allocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_resource_allocations (id, "resourceId", "projectId", "allocatedAt", "taskId", "startDate", "endDate", status, notes, "allocatedBy", role, "allocationPercentage") FROM stdin;
cmghz572800090g3p7kftm5n3	cmghz571x00010g3pfjrldl60	cmghszpna000c0g2rv4fpv34b	2025-10-08 12:38:01.472	\N	2025-10-08 12:38:01.472	\N	ACTIVE	Project manager for Office Building Electrical Installation	cmghqjd4700060gz27ncnyv1z	Project Manager	50
cmghz572b000b0g3pyvbmncyn	cmghz572100030g3pt10d6ucw	cmghszpna000c0g2rv4fpv34b	2025-10-08 12:38:01.475	\N	2025-10-08 12:38:01.475	\N	ACTIVE	Field engineer for Office Building Electrical Installation	cmghqjd4700060gz27ncnyv1z	Site Supervisor	80
cmghz572b000d0g3puest2i2v	cmghz572300070g3paed921mi	cmghszpna000c0g2rv4fpv34b	2025-10-08 12:38:01.476	\N	2025-10-08 12:38:01.476	\N	ACTIVE	Technical support for Office Building Electrical Installation	cmghqjd4700060gz27ncnyv1z	Technical Support	60
cmghz572c000f0g3pckck1j76	cmghz572100030g3pt10d6ucw	cmghszpna000c0g2rv4fpv34b	2025-10-08 12:38:01.476	cmghszpnf000h0g2r8ld4pian	2025-10-08 12:38:01.476	\N	ACTIVE	Task lead for Install main electrical panel	cmghqjd4700060gz27ncnyv1z	Task Lead	100
cmghz572d000h0g3p2r5cq22n	cmghz572100030g3pt10d6ucw	cmghszpna000c0g2rv4fpv34b	2025-10-08 12:38:01.477	cmghszpnf000i0g2rxb96o67c	2025-10-08 12:38:01.477	\N	ACTIVE	Task lead for Run electrical conduits	cmghqjd4700060gz27ncnyv1z	Task Lead	100
cmghz572e000j0g3p0ie24vaw	cmghz571x00010g3pfjrldl60	cmghszpnc000e0g2rh6nykit9	2025-10-08 12:38:01.478	\N	2025-10-08 12:38:01.478	\N	ACTIVE	Project manager for Network Infrastructure Upgrade	cmghqjd4700060gz27ncnyv1z	Project Manager	50
cmghz572e000l0g3pid9rmytb	cmghz572100030g3pt10d6ucw	cmghszpnc000e0g2rh6nykit9	2025-10-08 12:38:01.479	\N	2025-10-08 12:38:01.479	\N	ACTIVE	Field engineer for Network Infrastructure Upgrade	cmghqjd4700060gz27ncnyv1z	Site Supervisor	80
cmghz572f000n0g3pezfijgrq	cmghz572200050g3p7lu3w6xr	cmghszpnc000e0g2rh6nykit9	2025-10-08 12:38:01.479	\N	2025-10-08 12:38:01.479	\N	ACTIVE	Lead developer for Network Infrastructure Upgrade	cmghqjd4700060gz27ncnyv1z	Lead Developer	100
cmghz572f000p0g3p582cf75b	cmghz572300070g3paed921mi	cmghszpnc000e0g2rh6nykit9	2025-10-08 12:38:01.479	\N	2025-10-08 12:38:01.479	\N	ACTIVE	Technical support for Network Infrastructure Upgrade	cmghqjd4700060gz27ncnyv1z	Technical Support	60
cmghz572f000r0g3pae2mouux	cmghz571x00010g3pfjrldl60	cmght4tac00010ghqbupjalaw	2025-10-08 12:38:01.48	\N	2025-10-08 12:38:01.48	\N	ACTIVE	Project manager for Smart Building Automation	cmghqjd4700060gz27ncnyv1z	Project Manager	50
cmghz572g000t0g3pj4guc4wi	cmghz572100030g3pt10d6ucw	cmght4tac00010ghqbupjalaw	2025-10-08 12:38:01.48	\N	2025-10-08 12:38:01.48	\N	ACTIVE	Field engineer for Smart Building Automation	cmghqjd4700060gz27ncnyv1z	Site Supervisor	80
cmghz572g000v0g3pmbgvfp85	cmghz572300070g3paed921mi	cmght4tac00010ghqbupjalaw	2025-10-08 12:38:01.481	\N	2025-10-08 12:38:01.481	\N	ACTIVE	Technical support for Smart Building Automation	cmghqjd4700060gz27ncnyv1z	Technical Support	60
cmghz572h000x0g3py5lbhj6u	cmghz572100030g3pt10d6ucw	cmght4tac00010ghqbupjalaw	2025-10-08 12:38:01.481	cmghtqnkd00070gxq8z2f4uw4	2025-10-08 12:38:01.481	\N	ACTIVE	Task lead for Electrical Wiring	cmghqjd4700060gz27ncnyv1z	Task Lead	100
cmghz572h000z0g3po5z42nxp	cmghz572100030g3pt10d6ucw	cmght4tac00010ghqbupjalaw	2025-10-08 12:38:01.482	cmghtqu9500070g1bv3fhjyov	2025-10-08 12:38:01.482	\N	ACTIVE	Task lead for Electrical Wiring	cmghqjd4700060gz27ncnyv1z	Task Lead	100
cmghz572i00110g3pu9dghob2	cmghz572100030g3pt10d6ucw	cmght4tac00010ghqbupjalaw	2025-10-08 12:38:01.482	cmghtqu98000f0g1b013b8njc	2025-10-08 12:38:01.482	\N	ACTIVE	Task lead for LED Fixture Installation	cmghqjd4700060gz27ncnyv1z	Task Lead	100
cmghz572i00130g3p33u4lt68	cmghz571x00010g3pfjrldl60	cmght4tag00030ghqvd862pv8	2025-10-08 12:38:01.483	\N	2025-10-08 12:38:01.483	\N	ACTIVE	Project manager for Data Center Network Upgrade	cmghqjd4700060gz27ncnyv1z	Project Manager	50
cmghz572i00150g3pzw72968c	cmghz572100030g3pt10d6ucw	cmght4tag00030ghqvd862pv8	2025-10-08 12:38:01.483	\N	2025-10-08 12:38:01.483	\N	ACTIVE	Field engineer for Data Center Network Upgrade	cmghqjd4700060gz27ncnyv1z	Site Supervisor	80
cmghz572j00170g3pdrrjlzx3	cmghz572200050g3p7lu3w6xr	cmght4tag00030ghqvd862pv8	2025-10-08 12:38:01.483	\N	2025-10-08 12:38:01.483	\N	ACTIVE	Lead developer for Data Center Network Upgrade	cmghqjd4700060gz27ncnyv1z	Lead Developer	100
cmghz572j00190g3pvkhtd8nv	cmghz572300070g3paed921mi	cmght4tag00030ghqvd862pv8	2025-10-08 12:38:01.484	\N	2025-10-08 12:38:01.484	\N	ACTIVE	Technical support for Data Center Network Upgrade	cmghqjd4700060gz27ncnyv1z	Technical Support	60
cmghz572k001b0g3ptzieickc	cmghz572300070g3paed921mi	cmght4tag00030ghqvd862pv8	2025-10-08 12:38:01.484	cmghtqnkd00090gxq4zh684sv	2025-10-08 12:38:01.484	\N	ACTIVE	QA for System Testing	cmghqjd4700060gz27ncnyv1z	Quality Assurance	80
cmghz572m001d0g3p99s3yvxu	cmghz572300070g3paed921mi	cmght4tag00030ghqvd862pv8	2025-10-08 12:38:01.487	cmghtqu9600090g1bzefjkxg5	2025-10-08 12:38:01.487	\N	ACTIVE	QA for System Testing	cmghqjd4700060gz27ncnyv1z	Quality Assurance	80
cmghz572n001f0g3pjhpxf3rn	cmghz571x00010g3pfjrldl60	cmght4tah00050ghqra2mgvez	2025-10-08 12:38:01.487	\N	2025-10-08 12:38:01.487	\N	ACTIVE	Project manager for Factory Electrical Installation	cmghqjd4700060gz27ncnyv1z	Project Manager	50
cmghz572n001h0g3p2cz5cbq6	cmghz572100030g3pt10d6ucw	cmght4tah00050ghqra2mgvez	2025-10-08 12:38:01.488	\N	2025-10-08 12:38:01.488	\N	ACTIVE	Field engineer for Factory Electrical Installation	cmghqjd4700060gz27ncnyv1z	Site Supervisor	80
cmghz572o001j0g3pbyn45nd0	cmghz572300070g3paed921mi	cmght4tah00050ghqra2mgvez	2025-10-08 12:38:01.488	\N	2025-10-08 12:38:01.488	\N	ACTIVE	Technical support for Factory Electrical Installation	cmghqjd4700060gz27ncnyv1z	Technical Support	60
cmghz572o001l0g3pgtzcksoc	cmghz572100030g3pt10d6ucw	cmght4tah00050ghqra2mgvez	2025-10-08 12:38:01.489	cmghtqu97000b0g1bhwp13ao0	2025-10-08 12:38:01.489	\N	ACTIVE	Task lead for Security Camera Installation	cmghqjd4700060gz27ncnyv1z	Task Lead	100
cmghz572p001n0g3pj8ywchtd	cmghz571x00010g3pfjrldl60	cmght4tai00070ghqwv11bt43	2025-10-08 12:38:01.489	\N	2025-10-08 12:38:01.489	\N	ACTIVE	Project manager for Hospital IT System	cmghqjd4700060gz27ncnyv1z	Project Manager	50
cmghz572p001p0g3pulqv9l47	cmghz572100030g3pt10d6ucw	cmght4tai00070ghqwv11bt43	2025-10-08 12:38:01.49	\N	2025-10-08 12:38:01.49	\N	ACTIVE	Field engineer for Hospital IT System	cmghqjd4700060gz27ncnyv1z	Site Supervisor	80
cmghz572q001r0g3ptl8asi87	cmghz572200050g3p7lu3w6xr	cmght4tai00070ghqwv11bt43	2025-10-08 12:38:01.49	\N	2025-10-08 12:38:01.49	\N	ACTIVE	Lead developer for Hospital IT System	cmghqjd4700060gz27ncnyv1z	Lead Developer	100
cmghz572q001t0g3pzhcnhp85	cmghz572300070g3paed921mi	cmght4tai00070ghqwv11bt43	2025-10-08 12:38:01.49	\N	2025-10-08 12:38:01.49	\N	ACTIVE	Technical support for Hospital IT System	cmghqjd4700060gz27ncnyv1z	Technical Support	60
cmghz572q001v0g3pkk88nc3j	cmghz571x00010g3pfjrldl60	cmght4tai00090ghq5ztllrle	2025-10-08 12:38:01.491	\N	2025-10-08 12:38:01.491	\N	ACTIVE	Project manager for Shopping Mall Security	cmghqjd4700060gz27ncnyv1z	Project Manager	50
cmghz572r001x0g3p3wokfq2b	cmghz572100030g3pt10d6ucw	cmght4tai00090ghq5ztllrle	2025-10-08 12:38:01.491	\N	2025-10-08 12:38:01.491	\N	ACTIVE	Field engineer for Shopping Mall Security	cmghqjd4700060gz27ncnyv1z	Site Supervisor	80
cmghz572r001z0g3pde62kt0t	cmghz572300070g3paed921mi	cmght4tai00090ghq5ztllrle	2025-10-08 12:38:01.492	\N	2025-10-08 12:38:01.492	\N	ACTIVE	Technical support for Shopping Mall Security	cmghqjd4700060gz27ncnyv1z	Technical Support	60
cmghz572s00210g3plj8coq3s	cmghz571x00010g3pfjrldl60	cmght4taj000b0ghqlkyynx6z	2025-10-08 12:38:01.492	\N	2025-10-08 12:38:01.492	\N	ACTIVE	Project manager for Cloud Migration	cmghqjd4700060gz27ncnyv1z	Project Manager	50
cmghz572s00230g3pqqh9of1x	cmghz572100030g3pt10d6ucw	cmght4taj000b0ghqlkyynx6z	2025-10-08 12:38:01.493	\N	2025-10-08 12:38:01.493	\N	ACTIVE	Field engineer for Cloud Migration	cmghqjd4700060gz27ncnyv1z	Site Supervisor	80
cmghz572t00250g3ppxhgk1in	cmghz572200050g3p7lu3w6xr	cmght4taj000b0ghqlkyynx6z	2025-10-08 12:38:01.493	\N	2025-10-08 12:38:01.493	\N	ACTIVE	Lead developer for Cloud Migration	cmghqjd4700060gz27ncnyv1z	Lead Developer	100
cmghz572t00270g3pl4rn4qec	cmghz572300070g3paed921mi	cmght4taj000b0ghqlkyynx6z	2025-10-08 12:38:01.494	\N	2025-10-08 12:38:01.494	\N	ACTIVE	Technical support for Cloud Migration	cmghqjd4700060gz27ncnyv1z	Technical Support	60
cmghz572u00290g3p63sfu534	cmghz571x00010g3pfjrldl60	cmght4tak000d0ghq9sb3kw01	2025-10-08 12:38:01.494	\N	2025-10-08 12:38:01.494	\N	ACTIVE	Project manager for Warehouse Lighting	cmghqjd4700060gz27ncnyv1z	Project Manager	50
cmghz572u002b0g3pdx73f8n6	cmghz572100030g3pt10d6ucw	cmght4tak000d0ghq9sb3kw01	2025-10-08 12:38:01.495	\N	2025-10-08 12:38:01.495	\N	ACTIVE	Field engineer for Warehouse Lighting	cmghqjd4700060gz27ncnyv1z	Site Supervisor	80
cmghz572v002d0g3p3uo1qk3a	cmghz572300070g3paed921mi	cmght4tak000d0ghq9sb3kw01	2025-10-08 12:38:01.495	\N	2025-10-08 12:38:01.495	\N	ACTIVE	Technical support for Warehouse Lighting	cmghqjd4700060gz27ncnyv1z	Technical Support	60
cmghz572v002f0g3p3qsn7ybv	cmghz571x00010g3pfjrldl60	cmght4tal000f0ghqscrzoph1	2025-10-08 12:38:01.496	\N	2025-10-08 12:38:01.496	\N	ACTIVE	Project manager for School Network Setup	cmghqjd4700060gz27ncnyv1z	Project Manager	50
cmghz572w002h0g3pr6meo2dy	cmghz572100030g3pt10d6ucw	cmght4tal000f0ghqscrzoph1	2025-10-08 12:38:01.496	\N	2025-10-08 12:38:01.496	\N	ACTIVE	Field engineer for School Network Setup	cmghqjd4700060gz27ncnyv1z	Site Supervisor	80
cmghz572w002j0g3p2p0ezouc	cmghz572200050g3p7lu3w6xr	cmght4tal000f0ghqscrzoph1	2025-10-08 12:38:01.497	\N	2025-10-08 12:38:01.497	\N	ACTIVE	Lead developer for School Network Setup	cmghqjd4700060gz27ncnyv1z	Lead Developer	100
cmghz572x002l0g3po2e5ivma	cmghz572300070g3paed921mi	cmght4tal000f0ghqscrzoph1	2025-10-08 12:38:01.497	\N	2025-10-08 12:38:01.497	\N	ACTIVE	Technical support for School Network Setup	cmghqjd4700060gz27ncnyv1z	Technical Support	60
cmghz572y002n0g3p328ik7b7	cmghz571x00010g3pfjrldl60	cmght4tal000h0ghqgayyyhlk	2025-10-08 12:38:01.498	\N	2025-10-08 12:38:01.498	\N	ACTIVE	Project manager for Office Power Distribution	cmghqjd4700060gz27ncnyv1z	Project Manager	50
cmghz572y002p0g3p4lcq0lqg	cmghz572100030g3pt10d6ucw	cmght4tal000h0ghqgayyyhlk	2025-10-08 12:38:01.498	\N	2025-10-08 12:38:01.498	\N	ACTIVE	Field engineer for Office Power Distribution	cmghqjd4700060gz27ncnyv1z	Site Supervisor	80
cmghz572y002r0g3ptl0aqhf6	cmghz572300070g3paed921mi	cmght4tal000h0ghqgayyyhlk	2025-10-08 12:38:01.499	\N	2025-10-08 12:38:01.499	\N	ACTIVE	Technical support for Office Power Distribution	cmghqjd4700060gz27ncnyv1z	Technical Support	60
cmghz572z002t0g3pj7b2sqo8	cmghz571x00010g3pfjrldl60	cmght4tam000j0ghq4fjim3qm	2025-10-08 12:38:01.5	\N	2025-10-08 12:38:01.5	\N	ACTIVE	Project manager for Restaurant POS System	cmghqjd4700060gz27ncnyv1z	Project Manager	50
cmghz5730002v0g3pkqgq0b72	cmghz572100030g3pt10d6ucw	cmght4tam000j0ghq4fjim3qm	2025-10-08 12:38:01.5	\N	2025-10-08 12:38:01.5	\N	ACTIVE	Field engineer for Restaurant POS System	cmghqjd4700060gz27ncnyv1z	Site Supervisor	80
cmghz5730002x0g3pnp5qivwh	cmghz572200050g3p7lu3w6xr	cmght4tam000j0ghq4fjim3qm	2025-10-08 12:38:01.5	\N	2025-10-08 12:38:01.5	\N	ACTIVE	Lead developer for Restaurant POS System	cmghqjd4700060gz27ncnyv1z	Lead Developer	100
cmghz5730002z0g3p79hx5r9u	cmghz572300070g3paed921mi	cmght4tam000j0ghq4fjim3qm	2025-10-08 12:38:01.501	\N	2025-10-08 12:38:01.501	\N	ACTIVE	Technical support for Restaurant POS System	cmghqjd4700060gz27ncnyv1z	Technical Support	60
cmghz573100310g3p5w4fw1sw	cmghz571x00010g3pfjrldl60	cmghulxrj00010gk1ndazmwl1	2025-10-08 12:38:01.501	\N	2025-10-08 12:38:01.501	\N	ACTIVE	Project manager for API Test Project	cmghqjd4700060gz27ncnyv1z	Project Manager	50
cmghz573100330g3pby8hz2ix	cmghz572100030g3pt10d6ucw	cmghulxrj00010gk1ndazmwl1	2025-10-08 12:38:01.502	\N	2025-10-08 12:38:01.502	\N	ACTIVE	Field engineer for API Test Project	cmghqjd4700060gz27ncnyv1z	Site Supervisor	80
cmghz573100350g3p8c2ca36d	cmghz572200050g3p7lu3w6xr	cmghulxrj00010gk1ndazmwl1	2025-10-08 12:38:01.502	\N	2025-10-08 12:38:01.502	\N	ACTIVE	Lead developer for API Test Project	cmghqjd4700060gz27ncnyv1z	Lead Developer	100
cmghz573200370g3pmb099nlp	cmghz572300070g3paed921mi	cmghulxrj00010gk1ndazmwl1	2025-10-08 12:38:01.502	\N	2025-10-08 12:38:01.502	\N	ACTIVE	Technical support for API Test Project	cmghqjd4700060gz27ncnyv1z	Technical Support	60
cmghz573200390g3p5st71y3v	cmghz571x00010g3pfjrldl60	cmghv9lyl00010gka4gow81f6	2025-10-08 12:38:01.502	\N	2025-10-08 12:38:01.502	\N	ACTIVE	Project manager for Frontend Test Project	cmghqjd4700060gz27ncnyv1z	Project Manager	50
cmghz5732003b0g3pekqthzn5	cmghz572100030g3pt10d6ucw	cmghv9lyl00010gka4gow81f6	2025-10-08 12:38:01.503	\N	2025-10-08 12:38:01.503	\N	ACTIVE	Field engineer for Frontend Test Project	cmghqjd4700060gz27ncnyv1z	Site Supervisor	80
cmghz5733003d0g3p55xigpjh	cmghz572200050g3p7lu3w6xr	cmghv9lyl00010gka4gow81f6	2025-10-08 12:38:01.503	\N	2025-10-08 12:38:01.503	\N	ACTIVE	Lead developer for Frontend Test Project	cmghqjd4700060gz27ncnyv1z	Lead Developer	100
cmghz5733003f0g3p23uuu54g	cmghz572300070g3paed921mi	cmghv9lyl00010gka4gow81f6	2025-10-08 12:38:01.503	\N	2025-10-08 12:38:01.503	\N	ACTIVE	Technical support for Frontend Test Project	cmghqjd4700060gz27ncnyv1z	Technical Support	60
cmghz5733003h0g3px6l4vzr7	cmghz571x00010g3pfjrldl60	cmghvl0fk00010gnj7sbtq2h1	2025-10-08 12:38:01.504	\N	2025-10-08 12:38:01.504	\N	ACTIVE	Project manager for Implementasi MAPPv2	cmghqjd4700060gz27ncnyv1z	Project Manager	50
cmghz5734003j0g3pu9br38it	cmghz572100030g3pt10d6ucw	cmghvl0fk00010gnj7sbtq2h1	2025-10-08 12:38:01.504	\N	2025-10-08 12:38:01.504	\N	ACTIVE	Field engineer for Implementasi MAPPv2	cmghqjd4700060gz27ncnyv1z	Site Supervisor	80
cmghz5734003l0g3paqm4jndf	cmghz572200050g3p7lu3w6xr	cmghvl0fk00010gnj7sbtq2h1	2025-10-08 12:38:01.505	\N	2025-10-08 12:38:01.505	\N	ACTIVE	Lead developer for Implementasi MAPPv2	cmghqjd4700060gz27ncnyv1z	Lead Developer	100
cmghz5735003n0g3p38n2wye7	cmghz572300070g3paed921mi	cmghvl0fk00010gnj7sbtq2h1	2025-10-08 12:38:01.505	\N	2025-10-08 12:38:01.505	\N	ACTIVE	Technical support for Implementasi MAPPv2	cmghqjd4700060gz27ncnyv1z	Technical Support	60
\.


--
-- Data for Name: tbl_risks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_risks (id, title, description, "projectId", severity, status, mitigation, "assigneeId", "identifiedAt", "resolvedAt", "createdAt", "updatedAt") FROM stdin;
cmghszpnm000t0g2rtsgkvt6c	Supply Chain Delays	Potential delays in electrical component delivery	cmghszpna000c0g2rv4fpv34b	MEDIUM	OPEN	Order components early and have backup suppliers	cmghszph600080g2rifo7cphz	2025-10-08 09:45:47.938	\N	2025-10-08 09:45:47.938	2025-10-08 09:45:47.938
cmghszpnm000u0g2rydo1pevt	Weather Impact	Weather conditions may delay outdoor work	cmghszpna000c0g2rv4fpv34b	LOW	OPEN	Plan work schedule around weather forecast	cmghszpn7000a0g2r3l5hb0h2	2025-10-08 09:45:47.938	\N	2025-10-08 09:45:47.938	2025-10-08 09:45:47.938
cmghszpnm000v0g2rh6d4q6fq	System Compatibility	New network equipment may not be compatible with existing systems	cmghszpnc000e0g2rh6nykit9	HIGH	OPEN	Thorough testing before full deployment	cmghszpn7000a0g2r3l5hb0h2	2025-10-08 09:45:47.938	\N	2025-10-08 09:45:47.938	2025-10-08 09:45:47.938
cmghtszv8000t0gsz1z0d0wbq	Hardware Delay	Potential delay in hardware delivery	cmghszpna000c0g2rv4fpv34b	MEDIUM	OPEN	Maintain backup suppliers	cmghszpn7000a0g2r3l5hb0h2	2025-10-08 10:08:34.197	\N	2025-10-08 10:08:34.197	2025-10-08 10:08:34.197
cmghtszva000v0gszbpo4mfvc	Budget Overrun	Risk of exceeding allocated budget	cmghszpnc000e0g2rh6nykit9	HIGH	OPEN	Regular budget monitoring	cmghszph600080g2rifo7cphz	2025-10-08 10:08:34.199	\N	2025-10-08 10:08:34.199	2025-10-08 10:08:34.199
cmghtszvb000x0gszilsyhv0x	Security Breach	Risk of security breach during upgrade	cmght4tac00010ghqbupjalaw	HIGH	RESOLVED	Implement security protocols	cmghszpn7000a0g2r3l5hb0h2	2025-10-08 10:08:34.199	2025-10-08 10:08:34.196	2025-10-08 10:08:34.199	2025-10-08 10:08:34.199
cmghumaig000h0gk1focsirrt	API Test Risk	Test risk created via API	cmghszpna000c0g2rv4fpv34b	MEDIUM	OPEN	Test mitigation plan	\N	2025-10-08 10:31:21.016	\N	2025-10-08 10:31:21.016	2025-10-08 10:31:21.016
\.


--
-- Data for Name: tbl_task_dependencies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_task_dependencies (id, "taskId", "dependsOnTaskId") FROM stdin;
\.


--
-- PostgreSQL database dump complete
--

\unrestrict PZMVarHw9SudJvDZnBsvqgmfHcbcSEGQ9ya0F2ajI4ZJUt9g5vFWdvRIQF0yDFE

