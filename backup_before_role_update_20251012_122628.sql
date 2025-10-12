--
-- PostgreSQL database dump
--

\restrict 4NcNeuGneTnWtloJPaWgSamEegOvSWsrP0s3ilmtdI1CohkzcpNP7exd6VIw4R0

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
-- Name: AllocationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AllocationStatus" AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'CANCELLED',
    'EXPIRED'
);


ALTER TYPE public."AllocationStatus" OWNER TO postgres;

--
-- Name: BudgetType; Type: TYPE; Schema: public; Owner: jmaharyuda
--

CREATE TYPE public."BudgetType" AS ENUM (
    'PROJECT',
    'TASK',
    'GENERAL'
);


ALTER TYPE public."BudgetType" OWNER TO jmaharyuda;

--
-- Name: MilestoneStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MilestoneStatus" AS ENUM (
    'UPCOMING',
    'IN_PROGRESS',
    'COMPLETED',
    'OVERDUE'
);


ALTER TYPE public."MilestoneStatus" OWNER TO postgres;

--
-- Name: Priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Priority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."Priority" OWNER TO postgres;

--
-- Name: ProjectStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProjectStatus" AS ENUM (
    'PLANNING',
    'IN_PROGRESS',
    'ON_HOLD',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."ProjectStatus" OWNER TO postgres;

--
-- Name: ResourceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ResourceStatus" AS ENUM (
    'AVAILABLE',
    'ALLOCATED',
    'BUSY',
    'ON_LEAVE'
);


ALTER TYPE public."ResourceStatus" OWNER TO postgres;

--
-- Name: ResourceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ResourceType" AS ENUM (
    'PROJECT_MANAGER',
    'FIELD_ENGINEER',
    'IT_DEVELOPER',
    'TECHNICAL_TEAM',
    'CLIENT_STAKEHOLDER'
);


ALTER TYPE public."ResourceType" OWNER TO postgres;

--
-- Name: RiskLevel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RiskLevel" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


ALTER TYPE public."RiskLevel" OWNER TO postgres;

--
-- Name: RiskStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RiskStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);


ALTER TYPE public."RiskStatus" OWNER TO postgres;

--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'REVIEW',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."TaskStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: tbl_activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_activity_logs (
    id text NOT NULL,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text NOT NULL,
    description text,
    "userId" text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tbl_activity_logs OWNER TO postgres;

--
-- Name: tbl_budgets; Type: TABLE; Schema: public; Owner: jmaharyuda
--

CREATE TABLE public.tbl_budgets (
    id text NOT NULL,
    cost_center text NOT NULL,
    manager text NOT NULL,
    prk_number text NOT NULL,
    prk_name text NOT NULL,
    kategori_beban text NOT NULL,
    coa_number text NOT NULL,
    anggaran_tersedia numeric(65,30) NOT NULL,
    nilai_po numeric(65,30) DEFAULT 0 NOT NULL,
    nilai_non_po numeric(65,30) DEFAULT 0 NOT NULL,
    total_spr numeric(65,30) DEFAULT 0 NOT NULL,
    total_penyerapan numeric(65,30) DEFAULT 0 NOT NULL,
    sisa_anggaran numeric(65,30) DEFAULT 0 NOT NULL,
    tahun integer NOT NULL,
    project_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    task_id text,
    budget_type public."BudgetType" DEFAULT 'PROJECT'::public."BudgetType" NOT NULL
);


ALTER TABLE public.tbl_budgets OWNER TO jmaharyuda;

--
-- Name: tbl_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_documents (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "fileName" text NOT NULL,
    "filePath" text NOT NULL,
    "fileSize" integer NOT NULL,
    "fileType" text NOT NULL,
    "projectId" text,
    "taskId" text,
    "uploadedBy" text NOT NULL,
    "isPublic" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_documents OWNER TO postgres;

--
-- Name: tbl_milestones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_milestones (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "projectId" text NOT NULL,
    status public."MilestoneStatus" DEFAULT 'UPCOMING'::public."MilestoneStatus" NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_milestones OWNER TO postgres;

--
-- Name: tbl_project_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_project_members (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "userId" text NOT NULL,
    role text NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tbl_project_members OWNER TO postgres;

--
-- Name: tbl_projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_projects (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    client text NOT NULL,
    location text,
    status public."ProjectStatus" DEFAULT 'PLANNING'::public."ProjectStatus" NOT NULL,
    priority public."Priority" DEFAULT 'MEDIUM'::public."Priority" NOT NULL,
    progress double precision DEFAULT 0 NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    type text NOT NULL
);


ALTER TABLE public.tbl_projects OWNER TO postgres;

--
-- Name: tbl_resource_allocations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_resource_allocations (
    id text NOT NULL,
    "resourceId" text NOT NULL,
    "projectId" text NOT NULL,
    "allocatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "taskId" text,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone,
    status public."AllocationStatus" DEFAULT 'ACTIVE'::public."AllocationStatus" NOT NULL,
    notes text,
    "allocatedBy" text NOT NULL,
    role text,
    "allocationPercentage" integer DEFAULT 100 NOT NULL
);


ALTER TABLE public.tbl_resource_allocations OWNER TO postgres;

--
-- Name: tbl_resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_resources (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text NOT NULL,
    "userId" text NOT NULL,
    skills text,
    department text,
    phone text,
    email text,
    "maxProjects" integer DEFAULT 3 NOT NULL,
    "hourlyRate" double precision,
    status public."ResourceStatus" DEFAULT 'AVAILABLE'::public."ResourceStatus" NOT NULL,
    type public."ResourceType" NOT NULL
);


ALTER TABLE public.tbl_resources OWNER TO postgres;

--
-- Name: tbl_risks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_risks (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "projectId" text NOT NULL,
    severity public."RiskLevel" NOT NULL,
    status public."RiskStatus" DEFAULT 'OPEN'::public."RiskStatus" NOT NULL,
    mitigation text,
    "assigneeId" text,
    "identifiedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "resolvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_risks OWNER TO postgres;

--
-- Name: tbl_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_roles (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    permissions jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_roles OWNER TO postgres;

--
-- Name: tbl_task_dependencies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_task_dependencies (
    id text NOT NULL,
    "taskId" text NOT NULL,
    "dependsOnTaskId" text NOT NULL
);


ALTER TABLE public.tbl_task_dependencies OWNER TO postgres;

--
-- Name: tbl_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_tasks (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "projectId" text NOT NULL,
    "assigneeId" text,
    "creatorId" text NOT NULL,
    status public."TaskStatus" DEFAULT 'TODO'::public."TaskStatus" NOT NULL,
    priority public."Priority" DEFAULT 'MEDIUM'::public."Priority" NOT NULL,
    progress double precision DEFAULT 0 NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "estimatedHours" double precision,
    "actualHours" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_tasks OWNER TO postgres;

--
-- Name: tbl_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_users (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    password text NOT NULL,
    phone text,
    avatar text,
    "roleId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_users OWNER TO postgres;

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
cmgj3dfo500010g2o0pvi5jkz	UPDATE	Project	cmghvl0fk00010gnj7sbtq2h1	Updated project: Implementasi MAPPv2	cmghqjd4700060gz27ncnyv1z	\N	2025-10-09 07:24:10.517
cmgj3dzz600030g2ondubhiv7	UPDATE	Project	cmghvl0fk00010gnj7sbtq2h1	Updated project: Implementasi MAPPv2	cmghqjd4700060gz27ncnyv1z	\N	2025-10-09 07:24:36.834
cmgj6pg6400030goa4vu0gujv	CREATE	Project	cmgj6pg5x00010goavi40x650	Created project: Test Project	cmghqjd4700060gz27ncnyv1z	\N	2025-10-09 08:57:29.885
\.


--
-- Data for Name: tbl_budgets; Type: TABLE DATA; Schema: public; Owner: jmaharyuda
--

COPY public.tbl_budgets (id, cost_center, manager, prk_number, prk_name, kategori_beban, coa_number, anggaran_tersedia, nilai_po, nilai_non_po, total_spr, total_penyerapan, sisa_anggaran, tahun, project_id, created_at, updated_at, task_id, budget_type) FROM stdin;
budget_img_004	I0326	Man Solution Architect PLN 1	IC00892023	Lisensi Sub Bid Solusi Pelanggan PLN - Aplikasi	Produksi Langsung	5211990013	536370819.000000000000000000000000000000	345894140.000000000000000000000000000000	189626922.000000000000000000000000000000	0.000000000000000000000000000000	535521062.000000000000000000000000000000	849757.000000000000000000000000000000	2025	\N	2025-10-10 14:15:46.354	2025-10-10 14:15:46.354	\N	PROJECT
budget_img_005	I0326	Man Solution Architect PLN 1	IC00462022	Jasa Konsultan Survey Kepuasan Pelanggan	Pemasaran	5511110001	84829096.000000000000000000000000000000	0.000000000000000000000000000000	4747000.000000000000000000000000000000	4817511.000000000000000000000000000000	9564511.000000000000000000000000000000	-10816014.000000000000000000000000000000	2025	\N	2025-10-10 14:15:46.354	2025-10-10 14:15:46.354	\N	PROJECT
budget_general_001	I0326	Man Solution Architect PLN 1	IC01002025	General Infrastructure Maintenance	Operasional	5311990001	5000000000.000000000000000000000000000000	2000000000.000000000000000000000000000000	500000000.000000000000000000000000000000	0.000000000000000000000000000000	2500000000.000000000000000000000000000000	2500000000.000000000000000000000000000000	2025	\N	2025-10-10 16:10:55.758	2025-10-10 16:10:55.758	\N	PROJECT
budget_img_001	I0326	Man Solution Architect PLN 1	IC00472022	Project Layanan Ketenagalistrikan	Produksi Langsung	5111110003	10554944475.000000000000000000000000000000	5891664703.000000000000000000000000000000	58431646.000000000000000000000000000000	92500000.000000000000000000000000000000	6998287849.000000000000000000000000000000	3556656626.000000000000000000000000000000	2025	23c8e356-8ee5-45cc-b858-ce2bb3183d9c	2025-10-10 14:15:46.354	2025-10-10 14:15:46.354	\N	PROJECT
budget_img_002	I0326	Man Solution Architect PLN 1	IC01362022	Lisensi Pelanggan Layanan Ketenagalistrikan	Produksi Langsung	5111110003	6742000000.000000000000000000000000000000	7116390980.000000000000000000000000000000	-1339189587.000000000000000000000000000000	0.000000000000000000000000000000	6727451393.000000000000000000000000000000	14548607.000000000000000000000000000000	2025	fb74cddf-b900-4a84-afef-6f3adc0b1b9c	2025-10-10 14:15:46.354	2025-10-10 14:15:46.354	\N	PROJECT
budget_img_003	I0326	Man Solution Architect PLN 1	IC01062023	TAD Sub Bid Solusi Pelanggan PLN - Aplikasi	Produksi Langsung	5211990004	2356560128.000000000000000000000000000000	1398755902.000000000000000000000000000000	-59619571.000000000000000000000000000000	0.000000000000000000000000000000	1339136331.000000000000000000000000000000	1017423797.000000000000000000000000000000	2025	0be88482-ebd6-426a-8337-0867ba8d2630	2025-10-10 14:15:46.354	2025-10-10 14:15:46.354	\N	PROJECT
budget_task_001	I0326	Man Solution Architect PLN 1	IC00992025	Task Budget - Development Phase	Produksi Langsung	5211990005	1500000000.000000000000000000000000000000	750000000.000000000000000000000000000000	250000000.000000000000000000000000000000	0.000000000000000000000000000000	1000000000.000000000000000000000000000000	500000000.000000000000000000000000000000	2025	\N	2025-10-10 16:10:55.757	2025-10-10 16:10:55.757	43f694b7-17c3-4c8a-95fa-0014d740433f	TASK
\.


--
-- Data for Name: tbl_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_documents (id, title, description, "fileName", "filePath", "fileSize", "fileType", "projectId", "taskId", "uploadedBy", "isPublic", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tbl_milestones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_milestones (id, title, description, "projectId", status, "dueDate", "completedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tbl_project_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_project_members (id, "projectId", "userId", role, "joinedAt") FROM stdin;
\.


--
-- Data for Name: tbl_projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_projects (id, name, description, client, location, status, priority, progress, "startDate", "endDate", "createdBy", "createdAt", "updatedAt", type) FROM stdin;
cmgj6pg5x00010goavi40x650	Test Project	Test project with type	Test Client	\N	PLANNING	MEDIUM	0	\N	\N	cmghqjd4700060gz27ncnyv1z	2025-10-09 08:57:29.878	2025-10-09 08:57:29.878	INFRA NETWORK
23c8e356-8ee5-45cc-b858-ce2bb3183d9c	Network Infrastructure Upgrade - Jakarta Office	Complete network infrastructure upgrade for Jakarta main office including fiber optic installation, new switches, and wireless access points.	PT. Teknologi Indonesia	Jakarta, Indonesia	IN_PROGRESS	HIGH	45	2024-01-15 00:00:00	2024-06-30 00:00:00	cmghqjd4700060gz27ncnyv1z	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	INFRA NETWORK
fb74cddf-b900-4a84-afef-6f3adc0b1b9c	5G Network Deployment - Central Java	Deploy 5G network infrastructure across Central Java region including base stations and backhaul connectivity.	Telkom Indonesia	Semarang, Indonesia	IN_PROGRESS	URGENT	70	2023-11-01 00:00:00	2024-04-30 00:00:00	cmghqjd4700060gz27ncnyv1z	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	INFRA NETWORK
0be88482-ebd6-426a-8337-0867ba8d2630	Cloud Migration - Data Center Consolidation	Migrate on-premise servers to AWS cloud infrastructure and consolidate multiple data centers into a single cloud environment.	Bank Digital Nasional	Bandung, Indonesia	PLANNING	URGENT	15	2024-02-01 00:00:00	2024-08-15 00:00:00	cmghqjd4700060gz27ncnyv1z	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	INFRA CLOUD & DC
578d7405-75f7-4ef4-bc05-89e373890e8e	Hybrid Cloud Infrastructure Setup	Setup hybrid cloud infrastructure combining on-premise data center with Microsoft Azure for enterprise client.	Manufacturing Corp Ltd	Tangerang, Indonesia	IN_PROGRESS	HIGH	55	2024-01-10 00:00:00	2024-06-15 00:00:00	cmghqjd4700060gz27ncnyv1z	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	INFRA CLOUD & DC
3ad84bf7-b50f-4d3c-99e7-883629294ab9	Smart Building IoT Implementation	Implement IoT sensors for smart building management including temperature, humidity, lighting, and security monitoring.	Green Building Solutions	Surabaya, Indonesia	IN_PROGRESS	MEDIUM	60	2024-01-01 00:00:00	2024-05-31 00:00:00	cmghqjd4700060gz27ncnyv1z	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	MULTIMEDIA & IOT
5449ec5d-6c4f-4bfa-8119-05c5fcfbf614	Digital Signage & Multimedia System	Install and configure digital signage system with multimedia content management for shopping mall.	Mall Modern Indonesia	Bekasi, Indonesia	COMPLETED	MEDIUM	100	2023-10-01 00:00:00	2024-01-31 00:00:00	cmghqjd4700060gz27ncnyv1z	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	MULTIMEDIA & IOT
eb00e0d5-e8cb-46d2-903d-633250dc4be3	Digital Electricity Management System	Develop and implement digital electricity monitoring and management system for industrial facilities.	PT. Energi Hijau	Medan, Indonesia	IN_PROGRESS	HIGH	35	2024-02-15 00:00:00	2024-07-30 00:00:00	cmghqjd4700060gz27ncnyv1z	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	DIGITAL ELECTRICITY
283811f1-eca2-4db2-964d-907be8dcaaef	Smart Grid Electricity Monitoring	Implement smart grid technology for electricity distribution monitoring and automated load balancing.	PLN Regional Jakarta	Jakarta, Indonesia	IN_PROGRESS	URGENT	40	2024-01-20 00:00:00	2024-07-20 00:00:00	cmghqjd4700060gz27ncnyv1z	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	DIGITAL ELECTRICITY
0e321eb7-c4ab-417e-824a-4d9674708f27	Customer Relationship Management SaaS	Custom CRM SaaS solution for mid-size companies with lead management, customer tracking, and reporting features.	StartupHub Indonesia	Yogyakarta, Indonesia	PLANNING	MEDIUM	10	2024-03-01 00:00:00	2024-09-30 00:00:00	cmghqjd4700060gz27ncnyv1z	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	SAAS BASED
04a8b760-9412-488b-bbcb-7d3dac34df44	E-Learning Platform SaaS	Develop comprehensive e-learning platform with video streaming, assessments, and progress tracking features.	EduTech Solutions	Denpasar, Indonesia	IN_PROGRESS	HIGH	25	2024-02-10 00:00:00	2024-08-10 00:00:00	cmghqjd4700060gz27ncnyv1z	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	SAAS BASED
\.


--
-- Data for Name: tbl_resource_allocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_resource_allocations (id, "resourceId", "projectId", "allocatedAt", "taskId", "startDate", "endDate", status, notes, "allocatedBy", role, "allocationPercentage") FROM stdin;
87ee0a91-928b-43d7-95ee-4c46688628cd	cmghz571x00010g3pfjrldl60	23c8e356-8ee5-45cc-b858-ce2bb3183d9c	2025-10-09 15:42:39.992	43f694b7-17c3-4c8a-95fa-0014d740433f	2024-01-15 00:00:00	2024-02-15 00:00:00	ACTIVE	\N	cmghqjd4700060gz27ncnyv1z	Lead Engineer	100
53671baa-09fe-4a9e-8fc3-654026a57f42	cmghz572100030g3pt10d6ucw	23c8e356-8ee5-45cc-b858-ce2bb3183d9c	2025-10-09 15:42:39.992	422a5891-2b4e-47fc-b50d-550ccba4b264	2024-02-16 00:00:00	2024-03-31 00:00:00	ACTIVE	\N	cmghqjd4700060gz27ncnyv1z	Installation Specialist	100
9cfe9805-9aa7-4b0e-b3b8-5fabce34c4bd	cmghz572300070g3paed921mi	23c8e356-8ee5-45cc-b858-ce2bb3183d9c	2025-10-09 15:42:39.992	18850d46-61f1-4acb-84b9-9401f6fe847a	2024-04-01 00:00:00	2024-04-30 00:00:00	ACTIVE	\N	cmghqjd4700060gz27ncnyv1z	Network Engineer	100
d33dd374-cabe-4a33-91f7-b1d58e9d76ce	cmghz571x00010g3pfjrldl60	23c8e356-8ee5-45cc-b858-ce2bb3183d9c	2025-10-09 15:42:39.992	433ec657-4cc1-446d-821c-85c3eec0dcb9	2024-02-01 00:00:00	2024-02-15 00:00:00	ACTIVE	\N	cmghqjd4700060gz27ncnyv1z	Cloud Architect	100
5b3c020e-9e1e-4712-b11f-5fc896cee032	cmghz572100030g3pt10d6ucw	23c8e356-8ee5-45cc-b858-ce2bb3183d9c	2025-10-09 15:42:39.992	88e37186-9327-4250-9861-fb77df35c1ca	2024-02-16 00:00:00	2024-03-15 00:00:00	ACTIVE	\N	cmghqjd4700060gz27ncnyv1z	Infrastructure Analyst	100
7582a3c4-f699-4656-853e-9aed4937f18c	cmghz572300070g3paed921mi	23c8e356-8ee5-45cc-b858-ce2bb3183d9c	2025-10-09 15:42:39.992	35a56a97-6347-40d7-836d-794bd91343ac	2024-03-16 00:00:00	2024-04-30 00:00:00	ACTIVE	\N	cmghqjd4700060gz27ncnyv1z	DevOps Engineer	100
eb08c9fe-1f9e-49bc-8ac4-48385c78bef2	cmghz571x00010g3pfjrldl60	23c8e356-8ee5-45cc-b858-ce2bb3183d9c	2025-10-09 15:42:39.992	31ea9f03-a4ec-483a-9871-9ce1fa6a55ac	2024-01-01 00:00:00	2024-03-31 00:00:00	ACTIVE	\N	cmghqjd4700060gz27ncnyv1z	IoT Specialist	100
ddafbfb9-4ce5-484a-8ce8-e880b3495135	cmghz572100030g3pt10d6ucw	23c8e356-8ee5-45cc-b858-ce2bb3183d9c	2025-10-09 15:42:39.992	b8c2b2ed-7753-47d6-a14a-2fc33b5e0ee8	2024-04-01 00:00:00	2024-05-15 00:00:00	ACTIVE	\N	cmghqjd4700060gz27ncnyv1z	Integration Engineer	100
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
-- Data for Name: tbl_risks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_risks (id, title, description, "projectId", severity, status, mitigation, "assigneeId", "identifiedAt", "resolvedAt", "createdAt", "updatedAt") FROM stdin;
\.


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
-- Data for Name: tbl_task_dependencies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_task_dependencies (id, "taskId", "dependsOnTaskId") FROM stdin;
\.


--
-- Data for Name: tbl_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_tasks (id, title, description, "projectId", "assigneeId", "creatorId", status, priority, progress, "startDate", "endDate", "estimatedHours", "actualHours", "createdAt", "updatedAt") FROM stdin;
43f694b7-17c3-4c8a-95fa-0014d740433f	Network Infrastructure Design	Design complete network infrastructure including topology, equipment specifications, and implementation plan	23c8e356-8ee5-45cc-b858-ce2bb3183d9c	cmghqjd4700060gz27ncnyv1z	cmghqjd4700060gz27ncnyv1z	IN_PROGRESS	HIGH	75	2024-01-15 00:00:00	2024-02-15 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
422a5891-2b4e-47fc-b50d-550ccba4b264	Fiber Optic Installation	Install fiber optic cables throughout the building according to design specifications	23c8e356-8ee5-45cc-b858-ce2bb3183d9c	cmghszph600080g2rifo7cphz	cmghqjd4700060gz27ncnyv1z	TODO	HIGH	0	2024-02-16 00:00:00	2024-03-31 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
18850d46-61f1-4acb-84b9-9401f6fe847a	Network Equipment Setup	Configure and install switches, routers, and wireless access points	23c8e356-8ee5-45cc-b858-ce2bb3183d9c	cmghumrb4000t0gk1408czd30	cmghqjd4700060gz27ncnyv1z	TODO	MEDIUM	0	2024-04-01 00:00:00	2024-04-30 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
433ec657-4cc1-446d-821c-85c3eec0dcb9	Cloud Migration Planning	Plan migration strategy from on-premise to AWS cloud infrastructure	23c8e356-8ee5-45cc-b858-ce2bb3183d9c	cmghqjd4700060gz27ncnyv1z	cmghqjd4700060gz27ncnyv1z	COMPLETED	URGENT	100	2024-02-01 00:00:00	2024-02-15 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
88e37186-9327-4250-9861-fb77df35c1ca	Data Center Assessment	Assess current data center infrastructure and create migration roadmap	23c8e356-8ee5-45cc-b858-ce2bb3183d9c	cmghszph600080g2rifo7cphz	cmghqjd4700060gz27ncnyv1z	IN_PROGRESS	HIGH	60	2024-02-16 00:00:00	2024-03-15 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
35a56a97-6347-40d7-836d-794bd91343ac	AWS Infrastructure Setup	Set up AWS infrastructure including VPC, EC2 instances, and security groups	23c8e356-8ee5-45cc-b858-ce2bb3183d9c	cmghumrb4000t0gk1408czd30	cmghqjd4700060gz27ncnyv1z	TODO	HIGH	0	2024-03-16 00:00:00	2024-04-30 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
31ea9f03-a4ec-483a-9871-9ce1fa6a55ac	IoT Sensors Installation	Install IoT sensors for temperature, humidity, lighting, and security monitoring	23c8e356-8ee5-45cc-b858-ce2bb3183d9c	cmghqjd4700060gz27ncnyv1z	cmghqjd4700060gz27ncnyv1z	IN_PROGRESS	MEDIUM	45	2024-01-01 00:00:00	2024-03-31 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
b8c2b2ed-7753-47d6-a14a-2fc33b5e0ee8	Smart Building Integration	Integrate IoT sensors with building management system	23c8e356-8ee5-45cc-b858-ce2bb3183d9c	cmghszph600080g2rifo7cphz	cmghqjd4700060gz27ncnyv1z	REVIEW	MEDIUM	80	2024-04-01 00:00:00	2024-05-15 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
33161371-ec94-4867-b89e-21117efaf738	System Testing and Commissioning	Test all IoT systems and commission the smart building solution	23c8e356-8ee5-45cc-b858-ce2bb3183d9c	cmghumrb4000t0gk1408czd30	cmghqjd4700060gz27ncnyv1z	TODO	HIGH	0	2024-05-16 00:00:00	2024-05-31 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
9ba28931-1b14-4dd5-9d7f-7e1532889c71	Project Documentation	Create comprehensive project documentation including user manuals and maintenance guides	23c8e356-8ee5-45cc-b858-ce2bb3183d9c	cmghqjd4700060gz27ncnyv1z	cmghqjd4700060gz27ncnyv1z	TODO	LOW	0	2024-05-01 00:00:00	2024-06-15 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
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
-- Name: tbl_activity_logs tbl_activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_activity_logs
    ADD CONSTRAINT tbl_activity_logs_pkey PRIMARY KEY (id);


--
-- Name: tbl_budgets tbl_budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: jmaharyuda
--

ALTER TABLE ONLY public.tbl_budgets
    ADD CONSTRAINT tbl_budgets_pkey PRIMARY KEY (id);


--
-- Name: tbl_documents tbl_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_documents
    ADD CONSTRAINT tbl_documents_pkey PRIMARY KEY (id);


--
-- Name: tbl_milestones tbl_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_milestones
    ADD CONSTRAINT tbl_milestones_pkey PRIMARY KEY (id);


--
-- Name: tbl_project_members tbl_project_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_project_members
    ADD CONSTRAINT tbl_project_members_pkey PRIMARY KEY (id);


--
-- Name: tbl_projects tbl_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_projects
    ADD CONSTRAINT tbl_projects_pkey PRIMARY KEY (id);


--
-- Name: tbl_resource_allocations tbl_resource_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_resource_allocations
    ADD CONSTRAINT tbl_resource_allocations_pkey PRIMARY KEY (id);


--
-- Name: tbl_resources tbl_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_resources
    ADD CONSTRAINT tbl_resources_pkey PRIMARY KEY (id);


--
-- Name: tbl_risks tbl_risks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_risks
    ADD CONSTRAINT tbl_risks_pkey PRIMARY KEY (id);


--
-- Name: tbl_roles tbl_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles
    ADD CONSTRAINT tbl_roles_pkey PRIMARY KEY (id);


--
-- Name: tbl_task_dependencies tbl_task_dependencies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_task_dependencies
    ADD CONSTRAINT tbl_task_dependencies_pkey PRIMARY KEY (id);


--
-- Name: tbl_tasks tbl_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_tasks
    ADD CONSTRAINT tbl_tasks_pkey PRIMARY KEY (id);


--
-- Name: tbl_users tbl_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_users
    ADD CONSTRAINT tbl_users_pkey PRIMARY KEY (id);


--
-- Name: tbl_project_members_projectId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "tbl_project_members_projectId_userId_key" ON public.tbl_project_members USING btree ("projectId", "userId");


--
-- Name: tbl_resources_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "tbl_resources_userId_key" ON public.tbl_resources USING btree ("userId");


--
-- Name: tbl_roles_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tbl_roles_name_key ON public.tbl_roles USING btree (name);


--
-- Name: tbl_task_dependencies_taskId_dependsOnTaskId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "tbl_task_dependencies_taskId_dependsOnTaskId_key" ON public.tbl_task_dependencies USING btree ("taskId", "dependsOnTaskId");


--
-- Name: tbl_users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tbl_users_email_key ON public.tbl_users USING btree (email);


--
-- Name: tbl_activity_logs tbl_activity_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_activity_logs
    ADD CONSTRAINT "tbl_activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_budgets tbl_budgets_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jmaharyuda
--

ALTER TABLE ONLY public.tbl_budgets
    ADD CONSTRAINT tbl_budgets_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.tbl_projects(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_budgets tbl_budgets_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jmaharyuda
--

ALTER TABLE ONLY public.tbl_budgets
    ADD CONSTRAINT tbl_budgets_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tbl_tasks(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_documents tbl_documents_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_documents
    ADD CONSTRAINT "tbl_documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.tbl_projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_documents tbl_documents_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_documents
    ADD CONSTRAINT "tbl_documents_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tbl_tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_documents tbl_documents_uploadedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_documents
    ADD CONSTRAINT "tbl_documents_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_milestones tbl_milestones_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_milestones
    ADD CONSTRAINT "tbl_milestones_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.tbl_projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_project_members tbl_project_members_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_project_members
    ADD CONSTRAINT "tbl_project_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.tbl_projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_project_members tbl_project_members_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_project_members
    ADD CONSTRAINT "tbl_project_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_projects tbl_projects_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_projects
    ADD CONSTRAINT "tbl_projects_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_resource_allocations tbl_resource_allocations_allocatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_resource_allocations
    ADD CONSTRAINT "tbl_resource_allocations_allocatedBy_fkey" FOREIGN KEY ("allocatedBy") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_resource_allocations tbl_resource_allocations_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_resource_allocations
    ADD CONSTRAINT "tbl_resource_allocations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.tbl_projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_resource_allocations tbl_resource_allocations_resourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_resource_allocations
    ADD CONSTRAINT "tbl_resource_allocations_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES public.tbl_resources(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_resource_allocations tbl_resource_allocations_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_resource_allocations
    ADD CONSTRAINT "tbl_resource_allocations_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tbl_tasks(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_resources tbl_resources_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_resources
    ADD CONSTRAINT "tbl_resources_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_resources tbl_resources_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_resources
    ADD CONSTRAINT "tbl_resources_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_risks tbl_risks_assigneeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_risks
    ADD CONSTRAINT "tbl_risks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_risks tbl_risks_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_risks
    ADD CONSTRAINT "tbl_risks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.tbl_projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_task_dependencies tbl_task_dependencies_dependsOnTaskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_task_dependencies
    ADD CONSTRAINT "tbl_task_dependencies_dependsOnTaskId_fkey" FOREIGN KEY ("dependsOnTaskId") REFERENCES public.tbl_tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_task_dependencies tbl_task_dependencies_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_task_dependencies
    ADD CONSTRAINT "tbl_task_dependencies_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tbl_tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_tasks tbl_tasks_assigneeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_tasks
    ADD CONSTRAINT "tbl_tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_tasks tbl_tasks_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_tasks
    ADD CONSTRAINT "tbl_tasks_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_tasks tbl_tasks_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_tasks
    ADD CONSTRAINT "tbl_tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.tbl_projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_users tbl_users_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_users
    ADD CONSTRAINT "tbl_users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.tbl_roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 4NcNeuGneTnWtloJPaWgSamEegOvSWsrP0s3ilmtdI1CohkzcpNP7exd6VIw4R0

