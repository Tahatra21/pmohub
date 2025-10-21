--
-- PostgreSQL database dump
--

\restrict FjkK3nNKSBXUF8SfNsodF881hEAlpGRpT2kdWsJQb5BVHUXNdb5plV3ID8Cqg0U

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


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
-- Name: EstimateLine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EstimateLine" (
    id text NOT NULL,
    "estimateId" text,
    "costEstimatorId" text,
    type text NOT NULL,
    "refId" text,
    description text NOT NULL,
    unit text NOT NULL,
    qty double precision NOT NULL,
    "unitPrice" double precision NOT NULL,
    "isAtCost" boolean DEFAULT false NOT NULL,
    meta jsonb,
    "lineTotal" double precision NOT NULL,
    sort integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."EstimateLine" OWNER TO postgres;

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
-- Name: tbl_cost_estimator; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_cost_estimator (
    id text NOT NULL,
    name text NOT NULL,
    "projectId" text,
    "projectName" text,
    client text,
    description text,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    version text DEFAULT '1.0'::text NOT NULL,
    "markUpPct" double precision DEFAULT 0 NOT NULL,
    "contingencyPct" double precision DEFAULT 0 NOT NULL,
    "discountPct" double precision DEFAULT 0 NOT NULL,
    "ppnPct" double precision DEFAULT 11 NOT NULL,
    "escalationPct" double precision DEFAULT 0 NOT NULL,
    subtotal double precision DEFAULT 0 NOT NULL,
    escalation double precision DEFAULT 0 NOT NULL,
    overhead double precision DEFAULT 0 NOT NULL,
    contingency double precision DEFAULT 0 NOT NULL,
    discount double precision DEFAULT 0 NOT NULL,
    dpp double precision DEFAULT 0 NOT NULL,
    ppn double precision DEFAULT 0 NOT NULL,
    "grandTotal" double precision DEFAULT 0 NOT NULL,
    assumptions jsonb,
    notes text,
    "createdBy" text,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_cost_estimator OWNER TO postgres;

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
-- Name: tbl_hjt; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_hjt (
    id text NOT NULL,
    type text NOT NULL,
    no integer,
    spec text,
    item text,
    ref text NOT NULL,
    khs2022 text,
    monthly integer,
    daily integer,
    "numericValue" integer,
    "isAtCost" boolean DEFAULT false NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_hjt OWNER TO postgres;

--
-- Name: tbl_hjt_blnp; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_hjt_blnp (
    id text NOT NULL,
    item text NOT NULL,
    ref text NOT NULL,
    khs2022 text NOT NULL,
    "numericValue" integer,
    "isAtCost" boolean DEFAULT false NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_hjt_blnp OWNER TO postgres;

--
-- Name: tbl_hjt_blp; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_hjt_blp (
    id text NOT NULL,
    spec text NOT NULL,
    ref text NOT NULL,
    monthly integer NOT NULL,
    daily integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_hjt_blp OWNER TO postgres;

--
-- Name: tbl_kategori; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_kategori (
    id text NOT NULL,
    kategori text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_kategori OWNER TO postgres;

--
-- Name: tbl_license_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_license_notifications (
    id text NOT NULL,
    license_id text,
    notification_type text NOT NULL,
    notification_date timestamp(3) without time zone NOT NULL,
    is_sent boolean DEFAULT false NOT NULL,
    sent_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone
);


ALTER TABLE public.tbl_license_notifications OWNER TO postgres;

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
-- Name: tbl_mon_licenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_mon_licenses (
    id text NOT NULL,
    no_urut integer,
    nama_aplikasi text NOT NULL,
    bpo text,
    jenis_lisensi text,
    jumlah integer,
    harga_satuan numeric(65,30) DEFAULT 0,
    harga_total numeric(65,30) DEFAULT 0,
    periode_po integer,
    kontrak_layanan_bulan integer,
    start_layanan timestamp(3) without time zone,
    akhir_layanan timestamp(3) without time zone,
    metode text,
    keterangan_akun text,
    tanggal_aktivasi timestamp(3) without time zone,
    tanggal_pembaharuan timestamp(3) without time zone,
    status text DEFAULT 'Active'::text NOT NULL,
    created_at timestamp(3) without time zone,
    updated_at timestamp(3) without time zone,
    selling_price numeric(65,30) DEFAULT 0,
    purchase_price_per_unit numeric(65,30) DEFAULT 0,
    total_purchase_price numeric(65,30) DEFAULT 0,
    total_selling_price numeric(65,30) DEFAULT 0
);


ALTER TABLE public.tbl_mon_licenses OWNER TO postgres;

--
-- Name: tbl_produk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_produk (
    id text NOT NULL,
    produk text NOT NULL,
    deskripsi text,
    id_kategori text NOT NULL,
    id_segmen text NOT NULL,
    id_stage text NOT NULL,
    harga text,
    tanggal_launch text,
    pelanggan text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_produk OWNER TO postgres;

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
-- Name: tbl_segmen; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_segmen (
    id text NOT NULL,
    segmen text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_segmen OWNER TO postgres;

--
-- Name: tbl_stage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_stage (
    id text NOT NULL,
    stage text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_stage OWNER TO postgres;

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
-- Data for Name: EstimateLine; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EstimateLine" (id, "estimateId", "costEstimatorId", type, "refId", description, unit, qty, "unitPrice", "isAtCost", meta, "lineTotal", sort, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tbl_activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_activity_logs (id, action, entity, "entityId", description, "userId", metadata, "createdAt") FROM stdin;
3936ffeb-dbf9-4094-8849-bc285f5b5ccd	CREATE	Budget	cmghum74k000d0gk1rhodlx9n	Created budget: API_TEST	85393201-bcf0-435a-a974-f82200c5d796	\N	2025-10-08 10:31:16.631
a34ba49e-4367-4156-bde2-198dba815c92	UPDATE	Task	task-1	Updated task progress	0aa0a5fe-902e-4457-9121-a0624e643283	\N	2025-10-08 10:08:34.204
faa7a68e-2367-4790-a991-2c2977d0e4bc	CREATE	Project	cmghszpna000c0g2rv4fpv34b	Created new project	41883240-1a10-4c33-996f-9e9544f80af1	\N	2025-10-08 10:08:34.203
6aa46c98-2659-4d36-a168-4cdbd1430e96	CREATE	Resource	cmghum41800090gk13ozu2xnu	Created resource: API Test Resource	85393201-bcf0-435a-a974-f82200c5d796	\N	2025-10-08 10:31:12.623
87803433-c278-4cd1-a173-ca835f351dd0	UPLOAD	Document	doc-1	Uploaded system document	0aa0a5fe-902e-4457-9121-a0624e643283	\N	2025-10-08 10:08:34.205
e80640a6-7de9-44ca-87eb-d02222e8000a	CREATE	Risk	cmghumaig000h0gk1focsirrt	Created risk: API Test Risk	85393201-bcf0-435a-a974-f82200c5d796	\N	2025-10-08 10:31:21.02
0ee9fa2c-acad-4197-a30b-9b8197465158	CREATE	Task	cmghum0mp00050gk1rxgw8sia	Created task: API Test Task	85393201-bcf0-435a-a974-f82200c5d796	\N	2025-10-08 10:31:08.213
b66ba2da-e6b3-4865-85cc-7b496da02c57	CREATE	Project	cmghulxrj00010gk1ndazmwl1	Created project: API Test Project	85393201-bcf0-435a-a974-f82200c5d796	\N	2025-10-08 10:31:04.501
2a356a9b-0c05-4369-a769-23d54e1f855c	CREATE	User	cmghumrb4000t0gk1408czd30	Created user: API Test User	85393201-bcf0-435a-a974-f82200c5d796	\N	2025-10-08 10:31:42.788
04428012-365a-460d-a5b2-2d4609358043	UPDATE	Project	cmghvl0fk00010gnj7sbtq2h1	Updated project: Implementasi MAPPv2	85393201-bcf0-435a-a974-f82200c5d796	\N	2025-10-09 06:52:26.402
9fcaee46-0afd-4537-96e3-986d0484a9a8	DELETE	Task	cmghum0mp00050gk1rxgw8sia	Deleted task: API Test Task	85393201-bcf0-435a-a974-f82200c5d796	\N	2025-10-08 10:31:58.888
a64f042d-0774-4805-b9e1-184a50b0a9e6	CREATE	Project	cmghv9lyl00010gka4gow81f6	Created project: Frontend Test Project	85393201-bcf0-435a-a974-f82200c5d796	\N	2025-10-08 10:49:28.956
61769d3a-bead-41d1-99a6-f897482c7bc0	UPDATE	Project	cmghvl0fk00010gnj7sbtq2h1	Updated project: Implementasi MAPPv2	85393201-bcf0-435a-a974-f82200c5d796	\N	2025-10-09 07:24:10.517
1dd307dc-9dad-48de-96b5-740293c6b3e4	UPDATE	Project	cmghvl0fk00010gnj7sbtq2h1	Updated project: Implementasi MAPPv2	85393201-bcf0-435a-a974-f82200c5d796	\N	2025-10-09 07:24:36.834
b78806c3-d019-49fd-9bdc-408340ed15e5	UPDATE	Project	cmghvl0fk00010gnj7sbtq2h1	Updated project: Implementasi MAPPv2	85393201-bcf0-435a-a974-f82200c5d796	\N	2025-10-08 11:51:31.524
1692e55b-71cd-42da-8f1c-79f4add36052	CREATE	Project	cmgj6pg5x00010goavi40x650	Created project: Test Project	85393201-bcf0-435a-a974-f82200c5d796	\N	2025-10-09 08:57:29.885
e3927848-0bca-444a-8fb0-ed6943812dba	UPLOAD	Document	cmghumdp0000l0gk1w6pdqcsl	Uploaded document: API Test Document	85393201-bcf0-435a-a974-f82200c5d796	\N	2025-10-08 10:31:25.144
045c3fcd-4692-4c8e-84dd-b76f1c56478c	UPDATE	Task	cmghum0mp00050gk1rxgw8sia	Updated task: API Test Task	85393201-bcf0-435a-a974-f82200c5d796	\N	2025-10-08 10:31:55.362
9dfd0554-8efd-48ae-bb41-47ebc6d018e9	CREATE	Project	cmghvl0fk00010gnj7sbtq2h1	Created project: Implementasi MAPPv2	85393201-bcf0-435a-a974-f82200c5d796	\N	2025-10-08 10:58:20.918
eae4e3d2-5c0c-490c-a381-75a0d18cd866	UPDATE	Project	cmghvl0fk00010gnj7sbtq2h1	Updated project: Implementasi MAPPv2	85393201-bcf0-435a-a974-f82200c5d796	\N	2025-10-08 11:40:26.035
\.


--
-- Data for Name: tbl_budgets; Type: TABLE DATA; Schema: public; Owner: jmaharyuda
--

COPY public.tbl_budgets (id, cost_center, manager, prk_number, prk_name, kategori_beban, coa_number, anggaran_tersedia, nilai_po, nilai_non_po, total_spr, total_penyerapan, sisa_anggaran, tahun, project_id, created_at, updated_at, task_id, budget_type) FROM stdin;
f33f5067-7f93-49d8-a0b2-26ed7f3fee50	I0326	Man Solution Architect PLN 1	IC01062023	TAD Sub Bid Solusi Pelanggan PLN - Aplikasi	Produksi Langsung	5211990004	2356560128.000000000000000000000000000000	1398755902.000000000000000000000000000000	-59619571.000000000000000000000000000000	0.000000000000000000000000000000	1339136331.000000000000000000000000000000	1017423797.000000000000000000000000000000	2025	6436da19-7298-4ee2-a322-df209f9ede52	2025-10-10 14:15:46.354	2025-10-10 14:15:46.354	\N	PROJECT
a8cd2711-14a4-46ed-a411-e2eff0339551	I0326	Man Solution Architect PLN 1	IC01002025	General Infrastructure Maintenance	Operasional	5311990001	5000000000.000000000000000000000000000000	2000000000.000000000000000000000000000000	500000000.000000000000000000000000000000	0.000000000000000000000000000000	2500000000.000000000000000000000000000000	2500000000.000000000000000000000000000000	2025	\N	2025-10-10 16:10:55.758	2025-10-10 16:10:55.758	\N	PROJECT
d2d6f40d-85cd-46f1-8b61-e0e3604e63d6	I0326	Man Solution Architect PLN 1	IC00992025	Task Budget - Development Phase	Produksi Langsung	5211990005	1500000000.000000000000000000000000000000	750000000.000000000000000000000000000000	250000000.000000000000000000000000000000	0.000000000000000000000000000000	1000000000.000000000000000000000000000000	500000000.000000000000000000000000000000	2025	\N	2025-10-10 16:10:55.757	2025-10-10 16:10:55.757	58475d87-4c90-41ac-80e2-b6e6efe6e7a1	TASK
8177c5eb-7cd1-4e14-a368-0d564c6f8540	I0326	Man Solution Architect PLN 1	IC00892023	Lisensi Sub Bid Solusi Pelanggan PLN - Aplikasi	Produksi Langsung	5211990013	536370819.000000000000000000000000000000	345894140.000000000000000000000000000000	189626922.000000000000000000000000000000	0.000000000000000000000000000000	535521062.000000000000000000000000000000	849757.000000000000000000000000000000	2025	\N	2025-10-10 14:15:46.354	2025-10-10 14:15:46.354	\N	PROJECT
51810aa2-f019-4be8-b5c2-a4924929a0c0	I0326	Man Solution Architect PLN 1	IC01362022	Lisensi Pelanggan Layanan Ketenagalistrikan	Produksi Langsung	5111110003	6742000000.000000000000000000000000000000	7116390980.000000000000000000000000000000	-1339189587.000000000000000000000000000000	0.000000000000000000000000000000	6727451393.000000000000000000000000000000	14548607.000000000000000000000000000000	2025	b5453579-311f-4d50-a898-fba630fa7a12	2025-10-10 14:15:46.354	2025-10-10 14:15:46.354	\N	PROJECT
7b864ef6-0498-4441-9ddf-7ab89b0be81f	I0326	Man Solution Architect PLN 1	IC00462022	Jasa Konsultan Survey Kepuasan Pelanggan	Pemasaran	5511110001	84829096.000000000000000000000000000000	0.000000000000000000000000000000	4747000.000000000000000000000000000000	4817511.000000000000000000000000000000	9564511.000000000000000000000000000000	-10816014.000000000000000000000000000000	2025	\N	2025-10-10 14:15:46.354	2025-10-10 14:15:46.354	\N	PROJECT
47e7fb3d-1245-47ff-9477-824bfadf5fe5	I0326	Man Solution Architect PLN 1	IC00472022	Project Layanan Ketenagalistrikan	Produksi Langsung	5111110003	10554944475.000000000000000000000000000000	5891664703.000000000000000000000000000000	58431646.000000000000000000000000000000	92500000.000000000000000000000000000000	6998287849.000000000000000000000000000000	3556656626.000000000000000000000000000000	2025	f67042b8-7696-4cc0-ad1c-4ebb9a661c96	2025-10-10 14:15:46.354	2025-10-10 14:15:46.354	\N	PROJECT
\.


--
-- Data for Name: tbl_cost_estimator; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_cost_estimator (id, name, "projectId", "projectName", client, description, status, version, "markUpPct", "contingencyPct", "discountPct", "ppnPct", "escalationPct", subtotal, escalation, overhead, contingency, discount, dpp, ppn, "grandTotal", assumptions, notes, "createdBy", "approvedBy", "approvedAt", "createdAt", "updatedAt") FROM stdin;
4aa69868-b100-4005-aff2-31c67f0a5172	Network Infrastructure Cost Estimate	cmgj6pg5x00010goavi40x650	Test Project	Test Client	Detailed cost estimate for network infrastructure project	DRAFT	1.0	15	10	5	11	8	100000	8000	15000	10000	5000	118000	12980	130980	"Based on current market rates and project requirements"	Initial estimate - subject to revision	cmghqjd4700060gz27ncnyv1z	\N	\N	2025-10-21 05:23:55.151	2025-10-21 05:23:55.151
\.


--
-- Data for Name: tbl_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_documents (id, title, description, "fileName", "filePath", "fileSize", "fileType", "projectId", "taskId", "uploadedBy", "isPublic", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tbl_hjt; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_hjt (id, type, no, spec, item, ref, khs2022, monthly, daily, "numericValue", "isAtCost", note, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tbl_hjt_blnp; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_hjt_blnp (id, item, ref, khs2022, "numericValue", "isAtCost", note, "createdAt", "updatedAt") FROM stdin;
ac3f098a-0e5c-49b7-939f-54fd6ec33a5e	Biaya tiket termasuk airport tax	INKINDO	at cost	\N	t	domestik berlaku tarif Garuda kelas ekonomi	2025-10-21 13:23:18.091	2025-10-21 13:23:18.094
63af7c66-db80-4987-84ad-ae877de158de	Biaya Alat Kerja	KHS 2016	100.000	100000	f	per orang per hari atau maksimal 1.000.000 per orang per bulan	2025-10-21 13:23:18.091	2025-10-21 13:23:18.095
e2e7f9e8-dae7-4d99-beef-cfa9b1f8beff	Biaya Dokumentasi	KHS 2016	1.000.000	1000000	f	1 kali per pekerjaan	2025-10-21 13:23:18.091	2025-10-21 13:23:18.095
f30c6968-3001-49fa-819f-0a507f49eac6	Biaya Akomodasi Rapat Sosialisasi / UAT	KHS 2016	at cost	\N	t	1 kali per sosialisasi / UAT	2025-10-21 13:23:18.091	2025-10-21 13:23:18.095
c20ae089-aab8-450f-86e3-68af4d53ac3c	Tunjangan harian	INKINDO	350.000	350000	f	per hari (tidak sama dengan lokasi kantor)	2025-10-21 13:23:18.091	2025-10-21 13:23:18.095
411a7fd7-220c-4009-b0de-e85fafa0f402	Tunjangan tugas luar	INKINDO	350.000	350000	f	per hari (tidak sama dengan lokasi kantor)	2025-10-21 13:23:18.091	2025-10-21 13:23:18.095
1774a9e7-28ab-432d-8194-5b7ced847a4a	Biaya penginapan	KHS 2016	550.000	550000	f	per hari (tidak sama dengan lokasi kantor)	2025-10-21 13:23:18.091	2025-10-21 13:23:18.095
1f165400-7cb3-47a3-a9cb-632afe4105e0	Biaya perjalanan darat	INKINDO	at cost	\N	t	per orang per pekerjaan (dari kantor pelaksana ke bandara pp)	2025-10-21 13:23:18.091	2025-10-21 13:23:18.094
\.


--
-- Data for Name: tbl_hjt_blp; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_hjt_blp (id, spec, ref, monthly, daily, "isActive", "createdAt", "updatedAt") FROM stdin;
63489864-203b-4456-ab1b-16675a4bc038	Systems/Network Admin Junior	KHS PLN	17182000	781000	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.087
68ce3f31-7108-4a5d-9e39-990696dd7819	Quality Assurance Junior	KHS PLN	15620000	710000	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.086
758a0073-8a19-420b-a1e5-38ee23a1f086	Data Recon	INKINDO	21950000	1097500	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.084
cb648e9d-80b5-44af-83d7-fcb553fef706	System Analyst Junior	KHS PLN	17182000	781000	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.087
7943eec1-eec3-4695-8719-5cc796204c9d	Database Administration Junior	INKINDO	21950000	1097500	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.084
cae7b2a1-9e43-413b-9884-4fe504fe5d16	Helpdesk Support	INKINDO	6650000	332500	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.084
18e938f6-49a6-45e1-854d-b2f3357d2f8b	Change Management	INKINDO	36100000	1805000	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.083
45f34fbc-0572-4d38-a39c-d678e48f1e8a	Project Director	INKINDO	75900000	3795000	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.085
2721a320-deb9-4cc8-8983-e29362a83c06	Database Administration Senior	INKINDO	25050000	1252500	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.084
01c9dc74-6643-4afa-8f39-b20d0fb6334a	Desain UI/UX	KHS PLN	17182000	781000	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.088
f9b31c44-55ec-4eea-8f6b-867b7fdf7963	Programmer Senior 2	INKINDO	35850000	1792500	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.085
a82ebbd9-b2c0-4fe2-bde3-8f42a8e09e5b	Systems/Network Admin Madya	INKINDO	21950000	1097500	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.087
a4621189-21d1-4e1e-8a13-7b7d9274808c	Engineer System Contact Center	INKINDO	21950000	1097500	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.084
8677a30d-0d0b-450a-9740-84c5a6aaf556	Quality Assurance Senior	INKINDO	23500000	1175000	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.086
d30ef046-3685-4b99-ac14-37971f680d7d	Application Support	INKINDO	11650000	582500	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.082
f235e99d-c0c3-42ac-b785-5cde83d148a9	Bisnis Proses Madya	INKINDO	25050000	1252500	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.083
a59648ea-3176-4f02-89d3-4ec1f6317c29	Operator DC	INKINDO	13500000	675000	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.085
9680ced3-1ba6-42f2-ba35-afc7d8eea22a	Koordinator Teknis Senior	INKINDO	28150000	1407500	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.085
270608ca-a5f0-45f8-87a5-c2946d39de84	Administration & Contract Leader	INKINDO	47450000	2372500	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.082
7ccbe810-0ae4-4460-b2f1-9382f6f79e1e	Data Migration	INKINDO	26600000	1330000	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.083
dc6221af-c853-422a-954c-03320d50c6fe	Solution Architect	INKINDO	25050000	1252500	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.086
053cb069-3d64-430b-b8d2-63d2fafa9271	Programmer Junior	KHS PLN	17182000	781000	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.085
2be0676e-1032-424a-ba75-35a5fa21fd66	Programmer Senior 1	INKINDO	28150000	1407500	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.085
d44d6f88-3994-40e7-84c5-2917a261bb79	System Analyst Madya	INKINDO	21950000	1097500	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.087
39b82d13-c7c4-411d-af20-8f9c2005253d	Programmer Madya	KHS PLN	21868000	994000	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.085
f5963aa8-afe1-4443-bbf6-77086996ffe7	Project Manager (Project Leader)	INKINDO	56950000	2847500	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.086
2da7f632-d266-4bc5-839d-7e1f35930707	System Analyst Senior	INKINDO	25050000	1252500	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.086
cb9c217a-7a12-4cbe-8cbc-ff9bc8119c26	Server Admin (DEPLOY)	INKINDO	13500000	675000	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.086
21db7f2f-095c-4657-b723-e05a41ae8b93	Koordinator Teknis Junior	KHS PLN	18744000	852000	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.085
01cf62c2-f574-4710-b394-b7bf64dc0785	Administrator System Contact Center	INKINDO	21950000	1097500	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.082
b5ba0410-123e-41b8-92a3-14882a6103b0	Bisnis Proses Senior	INKINDO	28150000	1407500	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.082
499e74d6-7890-4503-b925-f363e31f9add	Training Executive	INKINDO	13500000	675000	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.087
b630468b-ecff-4acc-b552-225130b6e753	Bisnis Proses Junior	KHS PLN	17182000	781000	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.083
84e8bb61-32d8-4446-a9b4-fc3b772125fb	Technical Writer	KHS PLN	11088000	504000	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.087
ce2f6042-9c3a-42d3-b651-47d3697a4455	Administration Staff	INKINDO	7400000	370000	t	2025-10-21 13:23:18.074	2025-10-21 13:23:18.079
\.


--
-- Data for Name: tbl_kategori; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_kategori (id, kategori, created_at, updated_at) FROM stdin;
57d069a8-0eb9-445f-a7d9-2d5cda942974	INFRA NETWORK	2025-10-21 12:43:38.122	2025-10-21 12:43:38.122
ff75e527-c1c6-41fa-a3c8-a849972c9f41	INFRA CLOUD & DC	2025-10-21 12:43:38.124	2025-10-21 12:43:38.124
19c85ac1-105f-42da-8b48-117ca20f28ca	MULTIMEDIA & IOT	2025-10-21 12:43:38.125	2025-10-21 12:43:38.125
958a985d-330f-465b-98e7-aae792940655	DIGITAL ELECTRICITY	2025-10-21 12:43:38.126	2025-10-21 12:43:38.126
01df2bf9-b601-4556-901a-55d1b317dc8b	SAAS BASED	2025-10-21 12:43:38.127	2025-10-21 12:43:38.127
\.


--
-- Data for Name: tbl_license_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_license_notifications (id, license_id, notification_type, notification_date, is_sent, sent_at, created_at) FROM stdin;
\.


--
-- Data for Name: tbl_milestones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_milestones (id, title, description, "projectId", status, "dueDate", "completedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tbl_mon_licenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_mon_licenses (id, no_urut, nama_aplikasi, bpo, jenis_lisensi, jumlah, harga_satuan, harga_total, periode_po, kontrak_layanan_bulan, start_layanan, akhir_layanan, metode, keterangan_akun, tanggal_aktivasi, tanggal_pembaharuan, status, created_at, updated_at, selling_price, purchase_price_per_unit, total_purchase_price, total_selling_price) FROM stdin;
99dc0688-0cf9-4dd3-b20d-a4ddb66a703c	7	ChatGPT	TCO	Subscription License	2	600.000000000000000000000000000000	18840000.000000000000000000000000000000	12	12	2024-10-01 00:00:00	2025-10-01 00:00:00	SPR	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:55:56.75	0.000000000000000000000000000000	600.000000000000000000000000000000	18840000.000000000000000000000000000000	0.000000000000000000000000000000
2615d865-590e-487f-86bf-bed7dddf92ba	10	Jira	internal	Subscription License	1	68500000.000000000000000000000000000000	68500000.000000000000000000000000000000	12	12	2024-09-14 00:00:00	2025-09-14 00:00:00	SPP	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:56:08.053	0.000000000000000000000000000000	68500000.000000000000000000000000000000	68500000.000000000000000000000000000000	0.000000000000000000000000000000
c4a79418-c5d2-4799-86cb-9bd165e44e0d	8	IlovePDF	TCO	Subscription License	1	292800.000000000000000000000000000000	292800.000000000000000000000000000000	12	12	2024-09-30 00:00:00	2025-09-30 00:00:00	SPR	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:56:00.834	0.000000000000000000000000000000	292800.000000000000000000000000000000	292800.000000000000000000000000000000	0.000000000000000000000000000000
c12abf72-57af-4b56-8104-afcb4c34f484	6	ChatGPT	Direksi	Subscription License	10	46932800.000000000000000000000000000000	469328000.000000000000000000000000000000	12	12	2024-11-01 00:00:00	2025-11-01 00:00:00	SPP	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:55:54.375	0.000000000000000000000000000000	46932800.000000000000000000000000000000	469328000.000000000000000000000000000000	0.000000000000000000000000000000
53f35766-6e0b-457d-8439-b0bc038b8bf4	1	Oracle Crystal Ball 1	STI	Perpetual License	8	17196754.000000000000000000000000000000	137574032.000000000000000000000000000000	12	9999999	2024-07-10 00:00:00	9999-12-31 00:00:00	SPP	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:55:29.581	0.000000000000000000000000000000	17196754.000000000000000000000000000000	137574032.000000000000000000000000000000	0.000000000000000000000000000000
2e64a57f-98b2-4044-ae14-2b613a2f4227	3	Trading economic	STI	Subscription License	1	3699.000000000000000000000000000000	59139993.000000000000000000000000000000	12	12	2025-07-09 00:00:00	2026-07-09 00:00:00	SPR	riskcontrolcenterpln@gmail.com	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:55:48.496	0.000000000000000000000000000000	3699.000000000000000000000000000000	59139993.000000000000000000000000000000	0.000000000000000000000000000000
5cfba5a8-c735-4265-962d-127732b448f1	9	ODDO	BAg	Subscription License	1	163200000.000000000000000000000000000000	163200000.000000000000000000000000000000	12	12	2024-09-14 00:00:00	2025-09-14 00:00:00	SPP	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:56:05.828	0.000000000000000000000000000000	163200000.000000000000000000000000000000	163200000.000000000000000000000000000000	0.000000000000000000000000000000
dca95bbf-3adb-4e86-af47-42634796b335	5	Tiny MCE	STI	Subscription License	1	815000000.000000000000000000000000000000	815000000.000000000000000000000000000000	12	12	2024-10-07 00:00:00	2025-10-07 00:00:00	SPP	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:55:52.759	0.000000000000000000000000000000	815000000.000000000000000000000000000000	815000000.000000000000000000000000000000	0.000000000000000000000000000000
44b08e1f-fc60-4eae-8006-5319e156141d	2	Oracle Crystal Ball 2	STI	Perpetual License	10	17196754.000000000000000000000000000000	171967540.000000000000000000000000000000	12	9999999	2024-10-24 00:00:00	9999-12-31 00:00:00	SPP	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:55:35.181	0.000000000000000000000000000000	17196754.000000000000000000000000000000	171967540.000000000000000000000000000000	0.000000000000000000000000000000
6bf143ac-4010-435b-9d62-12047d0245d4	4	MarineTraffic	STI	Subscription License	1	357000000.000000000000000000000000000000	357000000.000000000000000000000000000000	12	12	2025-04-26 00:00:00	2026-04-26 00:00:00	SPP	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:55:50.799	0.000000000000000000000000000000	357000000.000000000000000000000000000000	357000000.000000000000000000000000000000	0.000000000000000000000000000000
aafdf8a0-17e1-43b4-b5d8-07b50e1f8a1a	12	3Dholphins Chat Bot	PLN MOBILE/STI	Subscription License	\N	\N	\N	\N	\N	\N	9999-12-31 00:00:00	SPP	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:56:15.874	0.000000000000000000000000000000	\N	\N	\N
e3a7c557-3ab9-47b1-8836-bb8e72a9a8a2	27	Capcut	TCO	Subscription License	1	1108890.000000000000000000000000000000	1108890.000000000000000000000000000000	12	12	2023-12-20 00:00:00	2024-12-20 00:00:00	SPR	\N	\N	\N	Expired	2025-08-12 17:18:31.267	2025-08-12 17:56:49.684	0.000000000000000000000000000000	1108890.000000000000000000000000000000	1108890.000000000000000000000000000000	0.000000000000000000000000000000
aea8e1b8-31ba-43f3-8527-d7109f0f3548	28	Video Downloader - Story Saver	TCO	Subscription License	1	387390.000000000000000000000000000000	387390.000000000000000000000000000000	12	12	2023-12-20 00:00:00	2024-12-20 00:00:00	SPR	\N	\N	\N	Expired	2025-08-12 17:18:31.267	2025-08-12 18:03:47.202	0.000000000000000000000000000000	387390.000000000000000000000000000000	387390.000000000000000000000000000000	0.000000000000000000000000000000
7c7b2dbb-5557-4f89-b775-a87e3d2ae723	20	Adobe Premiere	\N	Subscription License	\N	46932800.000000000000000000000000000000	0.000000000000000000000000000000	12	12	2024-08-01 00:00:00	2025-08-01 00:00:00	SPR	\N	\N	\N	Expired	2025-08-12 17:18:31.267	2025-08-12 17:56:33.963	0.000000000000000000000000000000	46932800.000000000000000000000000000000	0.000000000000000000000000000000	\N
f2dbf432-7489-4018-a873-116a33448071	32	ArcGIS	STI	\N	\N	\N	\N	\N	\N	\N	9999-12-31 00:00:00	SPR	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:35:02.41	0.000000000000000000000000000000	\N	\N	\N
04afdb75-d0ca-4f0c-b88c-5266751ac692	26	ThinkCell	DIV GA	Subscription License	4	24516900.000000000000000000000000000000	24516900.000000000000000000000000000000	12	12	2025-01-31 00:00:00	2026-01-31 00:00:00	SPR	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:56:47.925	0.000000000000000000000000000000	24516900.000000000000000000000000000000	24516900.000000000000000000000000000000	0.000000000000000000000000000000
f28e1b24-4f96-4372-8343-5ecbdafdf0f5	29	Wondershare Filmora	TCO	Subscription License	1	775097.000000000000000000000000000000	775097.000000000000000000000000000000	12	12	2023-12-20 00:00:00	2024-12-20 00:00:00	SPR	\N	\N	\N	Expired	2025-08-12 17:18:31.267	2025-08-12 18:03:49.21	0.000000000000000000000000000000	775097.000000000000000000000000000000	775097.000000000000000000000000000000	0.000000000000000000000000000000
139207b0-3723-42e7-9665-a09f01e32a10	18	Google Drive 2	TCO	Subscription License	1	2067930.000000000000000000000000000000	2067930.000000000000000000000000000000	12	12	2024-08-01 00:00:00	2025-08-01 00:00:00	SPR	Komtranspln	\N	\N	Expired	2025-08-12 17:18:31.267	2025-08-12 17:56:27.793	0.000000000000000000000000000000	2067930.000000000000000000000000000000	2067930.000000000000000000000000000000	0.000000000000000000000000000000
025fc960-bed1-431e-8cab-2d26c44f4212	19	Figma	MDG	Subscription License	10	9367974.000000000000000000000000000000	93679740.000000000000000000000000000000	12	12	2024-10-01 00:00:00	2025-10-01 00:00:00	SPP	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:56:29.291	0.000000000000000000000000000000	9367974.000000000000000000000000000000	93679740.000000000000000000000000000000	0.000000000000000000000000000000
f01d3516-3dd2-4344-9e46-879dc5c07047	16	Filenet & Datacap	STI	Subscription License	1	605921000.000000000000000000000000000000	605921000.000000000000000000000000000000	12	12	2024-12-31 00:00:00	2025-12-31 00:00:00	SPP	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:56:24.603	0.000000000000000000000000000000	605921000.000000000000000000000000000000	605921000.000000000000000000000000000000	0.000000000000000000000000000000
4736b197-4a41-4369-8f7c-8a3a6057ced7	21	Turboscribe Unlimited	TCO	Subscription License	1	2450880.000000000000000000000000000000	2450880.000000000000000000000000000000	12	12	2024-12-03 00:00:00	2025-12-03 00:00:00	SPR	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:56:39.499	0.000000000000000000000000000000	2450880.000000000000000000000000000000	2450880.000000000000000000000000000000	0.000000000000000000000000000000
ab0375dc-895d-4533-9f83-068a9e3b281e	24	Canva Pro	TCO	Subscription License	1	981629.000000000000000000000000000000	981629.000000000000000000000000000000	12	12	2024-12-31 00:00:00	2025-12-31 00:00:00	SPR	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:56:45.325	0.000000000000000000000000000000	981629.000000000000000000000000000000	981629.000000000000000000000000000000	0.000000000000000000000000000000
e195f29f-ac57-474e-9816-e7431be0096f	23	ElevenLabs Creator	TCO	Subscription License	1	4534128.000000000000000000000000000000	4534128.000000000000000000000000000000	12	12	2024-12-03 00:00:00	2025-12-03 00:00:00	SPR	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:56:43.544	0.000000000000000000000000000000	4534128.000000000000000000000000000000	4534128.000000000000000000000000000000	0.000000000000000000000000000000
665a30fb-b21b-4167-a6fb-11835b39c15b	25	Freepik Premium	TCO	Subscription License	1	3644352.000000000000000000000000000000	3644352.000000000000000000000000000000	12	12	2024-12-03 00:00:00	2025-12-03 00:00:00	SPR	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:56:46.74	0.000000000000000000000000000000	3644352.000000000000000000000000000000	3644352.000000000000000000000000000000	0.000000000000000000000000000000
f0e9f803-517c-4cc5-8e71-a6c4036463ca	11	3Dholphins Live Chat	PLN Kita/STI	Subscription License	1	350000000.000000000000000000000000000000	350000000.000000000000000000000000000000	12	12	2024-10-27 00:00:00	2025-10-27 00:00:00	SPP	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:56:13.677	0.000000000000000000000000000000	350000000.000000000000000000000000000000	350000000.000000000000000000000000000000	0.000000000000000000000000000000
cf3f7c74-1845-422d-9e99-e4ffb79e95a1	22	Veed Pro	TCO	Subscription License	1	5882112.000000000000000000000000000000	5882112.000000000000000000000000000000	12	12	2024-12-03 00:00:00	2025-12-03 00:00:00	SPR	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:56:41.324	0.000000000000000000000000000000	5882112.000000000000000000000000000000	5882112.000000000000000000000000000000	0.000000000000000000000000000000
d8e4cef6-6f26-43e7-ac16-340f7f2d4e8f	15	Craft & LME	STI	Subscription License	1	598800000.000000000000000000000000000000	598800000.000000000000000000000000000000	12	12	2024-11-08 00:00:00	2025-11-08 00:00:00	SPP	\N	\N	\N	Active	2025-08-12 17:18:31.267	2025-08-12 17:56:22.45	0.000000000000000000000000000000	598800000.000000000000000000000000000000	598800000.000000000000000000000000000000	0.000000000000000000000000000000
f6ce267a-cae1-47c5-8f28-de22a7bcfe6f	13	Stata	STI	Subscription License	1	45450000.000000000000000000000000000000	45450000.000000000000000000000000000000	12	12	2023-12-17 00:00:00	2024-12-17 00:00:00	SPP	\N	\N	\N	Expired	2025-08-12 17:18:31.267	2025-08-12 17:56:18.526	0.000000000000000000000000000000	45450000.000000000000000000000000000000	45450000.000000000000000000000000000000	0.000000000000000000000000000000
e87dae7d-73df-4f0a-97b6-1714a97e5edd	17	Google Drive 1	TCO	Subscription License	1	1320900.000000000000000000000000000000	1320900.000000000000000000000000000000	12	12	2024-08-01 00:00:00	2025-08-01 00:00:00	SPR	narasi PLN	\N	\N	Expired	2025-08-12 17:18:31.267	2025-08-12 17:56:25.978	0.000000000000000000000000000000	1320900.000000000000000000000000000000	1320900.000000000000000000000000000000	0.000000000000000000000000000000
5ef9d346-c9eb-49b4-92fa-2dd15616f78a	31	Wondershare PDF Element	TCO	Subscription License	1	1461968.000000000000000000000000000000	1461968.000000000000000000000000000000	12	12	2023-12-22 00:00:00	2024-12-22 00:00:00	SPR	\N	\N	\N	Expired	2025-08-12 17:18:31.267	2025-08-12 18:03:52.059	0.000000000000000000000000000000	1461968.000000000000000000000000000000	1461968.000000000000000000000000000000	0.000000000000000000000000000000
8d3a816c-3b83-4b4e-90f9-ff502eaeed29	30	WARP : Safer Internet	TCO	Subscription License	1	186480.000000000000000000000000000000	186480.000000000000000000000000000000	12	12	2023-12-15 00:00:00	2024-12-15 00:00:00	SPR	\N	\N	\N	Expired	2025-08-12 17:18:31.267	2025-08-12 18:03:50.679	0.000000000000000000000000000000	186480.000000000000000000000000000000	186480.000000000000000000000000000000	0.000000000000000000000000000000
a1735109-5c00-443a-a601-8e052fb35492	14	Maximo Application Suite (MAS 8)	STI	Subscription License	\N	\N	0.000000000000000000000000000000	12	12	2024-08-01 00:00:00	2025-08-01 00:00:00	SPP	\N	\N	\N	Expired	2025-08-12 17:18:31.267	2025-08-12 17:56:20.316	0.000000000000000000000000000000	\N	0.000000000000000000000000000000	\N
\.


--
-- Data for Name: tbl_produk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_produk (id, produk, deskripsi, id_kategori, id_segmen, id_stage, harga, tanggal_launch, pelanggan, created_at, updated_at) FROM stdin;
916f3a2a-d451-40a8-8521-b8c3725fe1a9	PLN PROPERTI		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.279+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
35c30d8a-2c9f-4b57-be37-6ce65ef34a9c	AIR Tax  		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.284+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
1304e00e-3f82-4ed1-aad9-7440a1364280	Portal Scada (Dashboard MCC		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.282+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
34031e46-a5fe-4468-a640-37e405c597de	Georensis		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
98b359a0-2282-4f4c-b228-ffadb990b95f	Aplikasi Centralized Payment untuk Vendor Invoicing Portal (VIP)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
96e9457d-ae72-48d3-947f-d3b1031db4a5	PLN KITA		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
822a6dc2-7979-4dc9-8db8-1352514e1238	Aplikasi PMO dan PLN Cerdas		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
98d9aeed-cb95-4f78-a41c-d3d491965c17	New Virtual Cubicle		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN Enjiniring	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
109eb447-a2ed-414d-b66e-22deedbfaf02	CSMS		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
52154878-bdc5-473c-ab61-46d24800e97e	Inspekta Web		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.281+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
272524ab-c552-45ac-b963-7d5e0705171e	LMS  		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.284+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
c0cd035a-824f-4ce3-a07c-d563003804df	Climate click Modul Simulasi Carbon Trading		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.282+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
3c8f9562-7854-4bdd-b583-e451fda18e82	Aplikasi Monitoring Program Transformasi (MOTION) TCO		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
e8311d19-f592-41fc-8259-5e7e4cf40bcb	Aplikasi Fraud Risk Assesment (FRA)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
756094f9-f5e7-48d0-b3a1-e723e57eb2ad	Executive Dashboard		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
6aa472e8-f5ee-4aca-9624-183fec127f6c	CCTR SYSTEM		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
d05449c5-59b5-4c5d-83f7-952b9b2ecdb7	Web IET		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
ff741de3-b358-4b3f-9070-96d3705e1508	Aplikasi Good Corporate Governance (GCG)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
20f3a1f1-7507-4d3e-a57c-b16c6c573910	Tower ERS (Monster)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
56796a2b-24ac-47fb-a3c1-d8e4bc243be6	ESPPD  		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.283+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
68217dcf-1d5f-40e2-a27a-e71e619636b1	PEREMAJAAN HARDWARE & SOFTWARE P2APST		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.280+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
a2f92791-31d0-4ac9-93e6-08f26c73020c	FRA-ONLINE		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.281+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
a3156020-7640-4e74-ae7a-d0108a4dc136	Aplikasi IAM		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
68f50b8f-474a-4410-98a0-14fde6e7fdfb	New Dreamobile		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
202e468b-4497-417f-a4ea-074f23e65d50	Aplikasi Billman Pro  		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.284+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
0bb77221-d358-4966-b9b7-17c9a97c4ae8	INSPEKTA  		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.283+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
a613ef88-9d70-4815-8e4c-0fe6c7f6fc9e	SMARTER  		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.283+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
588420f0-ecac-45dd-96f3-7e843feace0b	SMAR  		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.283+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
c39e6350-6ead-49d8-891b-7f022b47022a	Product from LIST CR DIRYANTI (ONLY 2025) - Row 35		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.279+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
dad3f9f1-5b2d-4bc0-9160-167980543ca0	Product from LIST CR OPKIT 2024 - Row 1		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.280+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
3de52b9f-8bb9-4ed4-bf71-81c98c985757	EAM Distribusi		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
9f0ad8e0-ab9d-4aec-af24-4fb910c1bb28	F12RB MMNE P2B Jawa Bali		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
d6002101-7653-43da-a127-ed667bccb733	Monitoring Program Transformasi (MOTION) PMO		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
4dc87e61-4664-433f-b25e-55dd73b2e441	MDMS		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
49bbd3f0-a296-4b7f-b4f0-33eeb7840930	Aplikasi ECC		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
8eea2576-c5cf-4bdd-b51a-15b720645af9	AMS KORPORAT		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.284+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
8a3211c1-99ed-4a79-b3c2-f93e0bd7296c	Smart Microgrid		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
07e11e96-9b5c-4a1f-affa-c86389a7dbd4	BAg Daily		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	BAg	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
27c600c7-0f44-45e0-8cfa-a31b2923813c	PLN KLIK		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.280+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
5e94ec7e-3e5c-44e1-a1f8-8183152c846e	SAP FM		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
73f70d81-328e-4989-9310-ff7a22f0878c	Aplikasi E-KHS		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
871e15db-ebbe-4941-a564-8bf1ec251083	Online Monitoring Performance		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
b592cb3e-17de-4b0c-af1c-01518c8f0603	Modul Aplikasi Pengelolaan FABA (MAPP)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.282+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
e198ecfc-762b-448d-9e09-01bc0fadc03f	EAM Legacy Transmisi		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.282+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
bd48b656-2337-46d9-95b3-9a7153909af8	ITEMS		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
8b789b5c-cea7-461f-a0fe-ee204d71fcf8	Portal SCADA		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
86a977f1-1e64-4976-b221-de5fe8877ebc	Product from LIST CR DIRYANTI (ONLY 2025) - Row 41		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.279+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
28227fc4-0efc-4784-a2b1-0538098277d0	New PST		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
5139b4e5-a207-41b9-842c-c440bb9852ed	Aplikasi ECOP		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
4657043d-2723-4a7e-a168-9a3ea25d52fb	ALIH DAYA		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.280+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
e5477b48-b61b-4f7d-8965-9bbbbb3f8112	Product from LIST CR DIRYANTI (2025) - Row 87		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.281+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
5fbb965d-0af2-4201-8c11-b74ed4d6f209	GRITA		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
5739473d-da12-4e89-8b48-19f93a893865	Aplikasi Rekrutment dan Seleksi		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
cbed952e-0af4-45e3-91a4-091880d8392b	Biomassa		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	EPI	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
6bd51980-31a4-425e-80f5-a3bcd4f33033	FOIS		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
c0ad2a7f-9e0d-4b52-ac16-8a83439debb5	Jalur		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
b47b709d-104f-4094-9c40-cc529bc02112	EAM TRANSMISI		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
356676cb-b9d1-450a-8ea5-f93a25d60620	Fuel Monitoring System (FMS)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	BAg	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
08571821-d349-47ea-8cc0-211ed46e242c	ARENA		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
dc12b9a0-771b-4cb6-a8da-459d887c33b8	AP2T	Deskripsi produk contoh	57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
57212f7b-cda2-43b2-b77f-81d3b5fc7307	New Srintami		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
15861f8e-dd0d-44c8-a5f4-dc6de5fb6864	Valiant		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
ccd33157-8cd7-45ba-93bf-caf1ee2181be	e - Logsheet		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
fa9c05e5-2fdd-437f-aad7-13ae67c17fb5	ESDS		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
64242b6d-79b3-42c7-b3e5-7d688efa0dd4	IT Service Management (ITSM)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	BAg	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
1d6e06c2-c03f-4c91-ac68-798dd657c14d	Aplikasi Inspekta		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
bdb39014-c2c9-4c5f-80a4-97aaab980ba6	DMS  		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.283+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
c1f3c8c9-0e53-4d9e-9d28-fb166647b853	HCIS PLN EG		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	Energi Gas	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
d566aef7-6f08-4126-8e90-31a640df8da6	Product from TBC - Row 1		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.281+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
07a35613-4579-4fbf-9531-595b9a4ed3fd	VMS  		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.284+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
1afe100c-e4e9-4d76-b11a-61e125692eb5	AP2T BATAM		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.280+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
7ada75bd-f62d-4814-b30a-b6a9e5af0614	Product from LIST CR DIRYANTI (ONLY 2025) - Row 42		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.280+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
aa6cc53e-11ad-4eee-aa11-f9c2af50658a	Aplikasi Kinerja Fasop		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
368f645b-5a93-46ad-ad0a-3008fb1315d0	Aplikasi Niaga		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.281+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
2a8c4498-fa17-4167-b8e1-38be91944525	F12RB NEON P2B UIKL Sulawesi		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
ff5b0a43-4579-4fe6-b6aa-552c493850df	WAVE		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.280+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
c350a19f-c3d3-4302-86f7-3b0fcc360ee1	Motion PMO		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.284+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
3bcf9cd3-3b6c-4b51-9e81-e700235d8003	Smartproc PLN EG		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	EG	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
7daaf1fb-2376-4599-badc-6196a41685fb	MOTION TCO		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.279+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
6184f1bc-46f1-4af9-8fcc-9e29fe311857	VR LISDES GEOSPASIAL		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
3354e28b-ddd4-4897-b2d9-71352592c11e	Aplikasi Biaya Pokok Produksi (BPP)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
f0fe415d-4db0-4e94-abc8-98aca5e91eb5	ACMT		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
eeab470d-2784-4b74-9d8d-3025afb0c62e	APKT MOBILE		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
e20c5611-9a20-4021-86f9-7941e7fdf0ee	Head End System (HES)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
adf9a731-9d55-4132-b578-8b7cf084b583	AMS		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
f0f51a6c-33ee-4cb6-b9a2-b7789c783681	SIIPP		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.283+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
c4de0cc2-198c-40d1-bba7-fa6a5b97eedf	Product from LIST CR DIRYANTI (2025) - Row 91		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.281+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
707487f1-68ac-4cea-980d-3b5be540cded	NEON (Neraca Energi)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.283+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
64002900-1aec-444d-881b-7ea9670a2568	Dashboard Operasi dan Kinerja Pembangkitan (MAPP)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.282+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
ad16368a-0df5-4d27-9662-562f4521be3d	HSSE Mobile		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
fff7f6ae-2caa-4f81-9363-d29d58ae312b	Product from LIST CR OPKIT 2022 -2023 - Row 1		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.282+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
52ef47b5-d4ef-453e-8167-a2c740d0685e	Power Inspect		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
2f77481c-c0ca-4d4e-978d-22b428ecf832	BPBL		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
f50174cb-48ca-46ca-ba78-e775c7a320ef	APKT		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
8832e160-6f00-45f8-a6fa-f4cb5aad89e7	VCC		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
98f2eeac-1a19-461c-abf4-ecbf368d08d5	Aplikasi Daily Activity Management System (DAMS)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
f19c7437-83a6-4921-ba14-8c98c6360fe6	Aplikasi Komando		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
6f4574ac-0e21-4223-9e8b-838d3ac43f05	IPMS (Integrated Payment Management System)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
62f81a72-712e-4e46-9aae-7520a5349132	FIX		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
17b057f6-d71f-4bc8-a1ee-4f015f9a742c	Product from LIST CR DIRYANTI (ONLY 2025) - Row 36		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.279+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
f59b566e-9b1c-4bd7-9907-1fe2df7183ed	INFRA MDMS		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
f0067c39-54cb-4e20-ac34-05778ad4dfc0	E-SPPD		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
fbe15f01-da80-4d3a-a414-b808a3615b64	Dmovement		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
5daffd42-1d10-4498-a43d-44da722fe3a8	SIMLOAN		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
352abc0e-38d4-4951-ab46-27f33d174037	Product from LIST CR DIRYANTI (2025) - Row 85		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.281+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
b7760567-a610-4951-b0db-647bf4a4ac7e	Aplikasi SILM		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
bb0b10e8-d6af-41f0-8f10-62d5df91c129	PLN Daily		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
badafaec-e06b-4935-9f8c-a5bbcef7e514	Cash Management BAg		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.284+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
394022f0-5f48-4caf-b3d8-f926e2218d15	Digitail		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
6db6bf4c-f99f-4728-b343-5fcd2aac44a3	NEON		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
52abf745-7814-4278-9f93-d4384c729605	Product from LIST CR DIRYANTI (ONLY 2025) - Row 40		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.279+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
8a78e44a-fed1-424d-b50e-7b8f23647b6c	AP3T		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
c576c9f6-4eaa-44c2-b388-28fd946beeaa	ROBOTIC NOTIFICATION		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.280+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
75e7ca66-c665-4898-ac46-b555993a81a0	Digitalisasi AIL  		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.284+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
905965f9-455a-44d5-8f87-3e2c943110f4	MIMS		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
4e8d5796-9247-46e2-84ce-1fcaa17cd658	NEON (Nraca Energi)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.283+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
3263d674-c1ec-4acd-a3b1-5b67d7806f57	VIRTUAL COMMAN CENTER		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.279+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
0b164f6e-c314-4b82-afc2-a96c7d1699b6	YANBUNG		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.280+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
ebaa7279-67ac-4cd3-937f-cce0f8d18e24	F12RB MMNE P3B Sumatera		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
012d6797-9684-455d-9783-b9031c9d9875	Checkmate		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
e74ecd92-757b-439f-899b-f1566176cbc1	Chempion		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
4f4d9011-2b48-43c5-bad5-62268a0fab8b	ChesKP		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
10615d3d-2ca1-4145-b5d3-f74608ad0e27	PLN for Business		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
78e612b5-72ad-4b6c-bcc5-d39456c5cee1	Web Portal Pelanggan		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
1a9bfaa2-7499-4b7e-a8a1-2559c17a9653	CRM Bag		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	BAg	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
1692e826-7e86-497e-98a7-fcfad5a80fc0	SMAR		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
199b6915-724c-43df-8f3e-9b66d0b70636	E-PROC		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
9ab1629e-0582-4fba-b15d-3713bc11a20c	AP2T PLN Batam		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN Batam	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
015775c1-2246-4c1a-b693-2ec8783324d9	CRM		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
a4bde13f-bb11-41b5-a941-0ed049dd5651	Aplikasi Subsidi DJK		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
15f02e1a-9bc6-4774-8cee-cc60561f42be	AVANGER		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
3c49cfd7-9e83-4b55-a7ea-d9c9aa80d0db	AIR TAX		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
efce985d-e4cd-46ed-8ec7-68da25f7efb1	PLTS Atap		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
d205f90b-588e-4eb3-808a-d2f10f3bf183	EBID DOC		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
d0a29ef8-59a2-42b9-9e70-aacb874a1f3d	SMARTER		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
938f5ffa-9885-41c7-8855-11ba51ef62f0	Product from LIST CR DIRYANTI (ONLY 2025) - Row 34		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.279+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
c6c03116-986c-4a22-a255-f91896133c86	Aplikasi E-Budget		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
d7902535-da8d-437b-8f5b-3910375a786c	PLN FIT		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
9d9c7230-f305-4319-b093-dee46c7d7c8d	Web Korporat PLN		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
2af77418-12a2-4423-bf95-78e4856f1762	Unknown Product		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.282+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
db53a863-9206-4538-bf0e-6fdac6a66db4	DMS		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
34dccc25-a68a-421a-919e-14c88b73ebd5	Planned Maintenance System (PMS)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	BAg	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
da4d2018-7e71-42a8-ab02-d6cc4f76fec3	DASHBOARD KORPORAT		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.279+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
a33f2712-4364-4efc-8c8e-74e054082169	Smartproc		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	Energi Gas	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
4557ada9-62c6-4b47-b261-996c184615ad	Transaksi Energi Listrik 		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.282+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
3225d812-cb25-47c2-9622-19ed21f8cccc	SAP SF PMGM		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
c12e5fa7-ddbc-4cf4-88ea-da183144a09a	FSO		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
9530f7d9-2b30-45b0-8053-5388920e5cbc	New ITO		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
3a007331-9c59-4598-af62-3c1cff0f0f1d	E-Arsip		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
fd49793f-a369-47ac-83f2-6eb65eb89b83	AMR		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
4649bdb4-c43c-4029-b759-4035b025e2cc	ERBAS  		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.283+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
65278a7a-6f10-4e8d-8552-d9c08b9c0693	CBM/PST 		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.282+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
055c9fc1-a58d-402c-bee7-60586d34e1aa	Product from LIST CR DIRYANTI (2025) - Row 86		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.281+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
90be0f8a-ecc8-4695-b3c7-1293a52e2cbb	Portal Setper		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	EPI	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
c44665e7-65e2-4f04-878b-d3f1d132919d	E-Transport		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
5bafa994-c027-493a-be0a-c6d025a9b51d	PLN Click		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
843cc6de-1b87-4d4c-892f-26fa9fd2bd74	Aplikasi Fasilitas Operasi PLN UIP P3BS 		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.283+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
706ce812-1a79-43cf-8e61-798922163995	PLN Click  		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.284+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
ccb8e3b6-e927-447d-a494-7578c8ee00ca	Climate Click Modul Inventarisasi GRK		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.282+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
ae09d103-1a26-4e7a-bd5d-d312fee56ade	LIS		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
337d084c-a8e5-44c4-a264-5ed3d3d8e1c9	Aplikasi COS		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
2140c707-a762-420a-80ec-f127e1effc48	AGO		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
282bb302-c48c-4096-9fb4-bb5a1c504e80	Aplikasi PMGM		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
03a1a634-4c28-42b1-b50b-b6fc1315b586	SPIN/ICOFR		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
1134a048-6bbc-4968-8696-c22e4a9ec3a6	Aplikasi SDTHKK		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
e72d99ef-71d9-46bd-b8b7-7b7be748f1a8	Maxico EPI		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	EPI	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
2516f936-93fe-4a12-a25f-b429ad80ab1a	Solar Panel Management System	Comprehensive system for managing solar panel installations and monitoring	57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	150000000	2024-01-15	PLN Distribution	2025-10-21 12:25:28.092	2025-10-21 12:43:55.399
030645c8-720f-493f-a082-440e332173a2	Energy Analytics Dashboard	Real-time analytics dashboard for energy consumption monitoring	57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	75000000	2024-02-20	PLN Corporate	2025-10-21 12:25:28.097	2025-10-21 12:43:55.411
137f1130-f42d-4696-8e2a-5f676e094933	Grid Monitoring Solution	Advanced grid monitoring and control system	57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	200000000	2024-03-10	PLN Transmission	2025-10-21 12:25:28.098	2025-10-21 12:43:55.414
bd22e1e3-25ad-4dc6-b0eb-2467364a26e2	Customer Service Portal	Digital portal for customer service and support	57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	50000000	2024-04-05	PLN Customer Service	2025-10-21 12:25:28.1	2025-10-21 12:43:55.417
0bd93a8d-3515-4da0-8f68-902d3e3fe6a5	Power Plant Management	Integrated management system for power plant operations	57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	300000000	2024-05-15	PLN Generation	2025-10-21 12:25:28.101	2025-10-21 12:43:55.418
2f2a3bf4-3176-4f41-9673-3597813ee018	EPSO		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
7055c0e0-8407-4591-adc7-d4d96d8a7503	Product from LIST CR DIRYANTI (ONLY 2025) - Row 43		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.280+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
b74deb8f-a11d-489a-ab23-0011c6bdb8bb	Upgrade Kartini99 dengan fitur TJB Digital Resources		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.282+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
25e2a9aa-fb48-4a97-b0c2-ca7eaf2a06c5	Product from LIST CR DIRYANTI (2025) - Row 92		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.281+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
8099c1dd-7ef8-4ac4-ad2b-e213cc220e05	TFA		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
c50c501e-ffe5-43e7-af37-390c6cb66531	E-Meeting		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
583520c2-3657-4fdc-9f79-e0483d0875b8	Product from LIST CR DIRYANTI (2025) - Row 94		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.281+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
3bfa579f-6bdf-4497-87e7-d17ae9c17b60	Product from LIST CR DIRYANTI 2023 - Row 1		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.283+07:00	Unknown	2025-08-13 10:30:59.145	2025-10-21 12:43:55.399
1cc99105-3a80-459a-b3c4-22844d18bd82	ERBAS (SPI)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
845f1cc5-ffc0-4728-92e5-ec3f8e220359	PORTAL HXMS		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	0	2025-10-21T13:06:21.280+07:00	Unknown	2025-08-14 15:35:06.346	2025-10-21 12:43:55.399
74ca5d05-5e5a-4767-800c-00377d5a6e06	RPA/ EPIMATES		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	EPI	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
09fe6e39-f3ba-485f-90cf-5d900af01cea	Online Monitoring Losses UPK Bangka		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
b12486a2-a369-4c22-9229-268b23cde508	PLN Smart DVM		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
5ffd7513-4b8f-4ad4-bdb9-8084afc5349c	Aplikasi HXMS		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
5e4a7730-f38f-4e50-a5a9-20efc50c34dc	ERP Financial Management (FM)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	BAg	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
e4e1583c-8f5a-4883-80ef-b600cf3bc9e6	e-Procurement BAG		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	BAg	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
e14f3cec-a0eb-4c52-9bac-99dd9df499a1	VMS (Vendor Management System)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
384cbea0-af1e-48ba-b931-ea4981023608	DIGIPROC		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
4470812b-5e15-4e20-98ba-a09c1bc28fbb	SI IPP		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
5a3406e9-9399-4765-9a2c-59d1dd0c799e	Aplikasi Climate Click		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
c5685bb9-048e-4276-9778-f00d22150bb4	GBMO		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
5a5de99f-ff21-430c-8bc3-154656e4a7d3	MAPP Power		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
912c7efb-f584-40fd-bb6e-5307c9dbf3e6	E-RUPTL		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
2d3d195b-a8e2-4d5a-9d3f-b3451a78d9a6	Maximo		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
7ce67645-4c1b-4f39-8335-2aac0afbc7e6	Charge IN		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
a37b72ce-ae25-492f-bc75-900ff0f539f1	BARISTA		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
0b396662-6dfd-4109-a2a7-52c8ae33a410	Arc GIS		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
05929ada-da56-4057-a228-68e73eb308a1	Aplikasi Modul Instansi Vertikal (Modiv)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
a71fb72b-e136-4ae4-91f4-8acf7e91fb9b	SIMPUS		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
4b1ebad2-d53f-4f17-ad9c-0d838d7bfb3c	Aplikasi Virtual Reality Program Listrik Desa		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
1c6b52d7-f765-4687-946f-02ad07b4e835	Gaspro		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
f94ded4d-075e-473c-872c-916cd59d71e4	LMS		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
1a35c54b-780f-4710-883c-c364636445dc	Digital Learning		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
c9ec241c-95cf-4dac-8da7-a1bdc143a7eb	PLN Mobile		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
68617bc0-64fe-4276-b063-5d2619b0bf42	Dara Monita		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
6fdf7dc9-b734-457d-b55a-993808230677	E-Insurance		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
47c2f706-bb2c-42d3-bbd8-fa05351b99c7	Aplikasi Sinopsis		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
215e1e09-af63-4943-b641-98e53a1ef63a	P2APST		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
e8cb6a46-9729-4972-ad5b-9e7aa485950d	AVMX		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
730738a7-ae84-420f-ba7f-a55366ba4df2	Digital Logsheet TJB		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
f3f030ea-bc5b-44f5-b19c-da254b04a262	EAM PEMBANGKIT		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
5ca6469f-0a4f-4234-9cad-bdfa98d95a80	IoT Pembangkit		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN ND & PLN BATAM	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
af84639c-92ac-46ab-b4d2-2154aa9b1a4e	ISDS		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
f7a9d6b1-a06c-42d7-ba63-4711e8ba3bab	BBO		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	PLN	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
6c6a18b3-0c25-448e-a869-c92e7f28b4e5	ERP Material Management (MM)		57d069a8-0eb9-445f-a7d9-2d5cda942974	f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	511470b9-c2e4-4343-b578-1b3b4999bcd9	100000	1970-01-01T00:00:00.000+07:00	BAg	2025-08-05 09:02:39.09	2025-10-21 12:43:55.414
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
bf3ea009-bbef-45b7-b473-0f3c3531d3d1	E-Learning Platform SaaS	Develop comprehensive e-learning platform with video streaming, assessments, and progress tracking features.	EduTech Solutions	Denpasar, Indonesia	IN_PROGRESS	HIGH	25	2024-02-10 00:00:00	2024-08-10 00:00:00	9be1e16e-9513-467a-9bed-84d9043f541c	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	SAAS BASED
21f47ca1-de13-4b3f-a878-9476f0c3c20f	Smart Grid Electricity Monitoring	Implement smart grid technology for electricity distribution monitoring and automated load balancing.	PLN Regional Jakarta	Jakarta, Indonesia	IN_PROGRESS	URGENT	40	2024-01-20 00:00:00	2024-07-20 00:00:00	9be1e16e-9513-467a-9bed-84d9043f541c	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	DIGITAL ELECTRICITY
77c3c295-7124-4e47-8211-c847552bba14	Customer Relationship Management SaaS	Custom CRM SaaS solution for mid-size companies with lead management, customer tracking, and reporting features.	StartupHub Indonesia	Yogyakarta, Indonesia	PLANNING	MEDIUM	10	2024-03-01 00:00:00	2024-09-30 00:00:00	9be1e16e-9513-467a-9bed-84d9043f541c	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	SAAS BASED
a2da2b01-0a27-4ea3-a104-0e1b9317e69f	Test Project	Test project with type	Test Client	\N	PLANNING	MEDIUM	0	\N	\N	9be1e16e-9513-467a-9bed-84d9043f541c	2025-10-09 08:57:29.878	2025-10-09 08:57:29.878	INFRA NETWORK
714e6690-5414-46a6-8750-12c81b5691de	Digital Electricity Management System	Develop and implement digital electricity monitoring and management system for industrial facilities.	PT. Energi Hijau	Medan, Indonesia	IN_PROGRESS	HIGH	35	2024-02-15 00:00:00	2024-07-30 00:00:00	9be1e16e-9513-467a-9bed-84d9043f541c	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	DIGITAL ELECTRICITY
2892e006-9ec4-4d98-9096-b7d567d733f3	Cloud Migration - Data Center Consolidation	Migrate on-premise servers to AWS cloud infrastructure and consolidate multiple data centers into a single cloud environment.	Bank Digital Nasional	Bandung, Indonesia	PLANNING	URGENT	15	2024-02-01 00:00:00	2024-08-15 00:00:00	9be1e16e-9513-467a-9bed-84d9043f541c	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	INFRA CLOUD & DC
d58e4230-90a3-4776-9a0a-0716cb9de230	Smart Building IoT Implementation	Implement IoT sensors for smart building management including temperature, humidity, lighting, and security monitoring.	Green Building Solutions	Surabaya, Indonesia	IN_PROGRESS	MEDIUM	60	2024-01-01 00:00:00	2024-05-31 00:00:00	9be1e16e-9513-467a-9bed-84d9043f541c	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	MULTIMEDIA & IOT
e7987297-e70f-4583-acaa-a4b8b682184f	Hybrid Cloud Infrastructure Setup	Setup hybrid cloud infrastructure combining on-premise data center with Microsoft Azure for enterprise client.	Manufacturing Corp Ltd	Tangerang, Indonesia	IN_PROGRESS	HIGH	55	2024-01-10 00:00:00	2024-06-15 00:00:00	9be1e16e-9513-467a-9bed-84d9043f541c	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	INFRA CLOUD & DC
f2d88fb0-bc97-4eae-b0ba-25cd5c8df3c4	Digital Signage & Multimedia System	Install and configure digital signage system with multimedia content management for shopping mall.	Mall Modern Indonesia	Bekasi, Indonesia	COMPLETED	MEDIUM	100	2023-10-01 00:00:00	2024-01-31 00:00:00	9be1e16e-9513-467a-9bed-84d9043f541c	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	MULTIMEDIA & IOT
dd380451-766a-4297-b4f1-0cc5d5c6b1bc	5G Network Deployment - Central Java	Deploy 5G network infrastructure across Central Java region including base stations and backhaul connectivity.	Telkom Indonesia	Semarang, Indonesia	IN_PROGRESS	URGENT	70	2023-11-01 00:00:00	2024-04-30 00:00:00	9be1e16e-9513-467a-9bed-84d9043f541c	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	INFRA NETWORK
65ff5f29-fa43-48d8-9d57-d881e4a8207e	Network Infrastructure Upgrade - Jakarta Office	Complete network infrastructure upgrade for Jakarta main office including fiber optic installation, new switches, and wireless access points.	PT. Teknologi Indonesia	Jakarta, Indonesia	IN_PROGRESS	HIGH	45	2024-01-15 00:00:00	2024-06-30 00:00:00	9be1e16e-9513-467a-9bed-84d9043f541c	2025-10-09 15:06:46.015	2025-10-09 15:06:46.015	INFRA NETWORK
\.


--
-- Data for Name: tbl_resource_allocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_resource_allocations (id, "resourceId", "projectId", "allocatedAt", "taskId", "startDate", "endDate", status, notes, "allocatedBy", role, "allocationPercentage") FROM stdin;
c9519004-d65c-4e40-afab-716660be99dc	18fe5f05-449e-437e-ae93-8dfe3eb7ddba	f67042b8-7696-4cc0-ad1c-4ebb9a661c96	2025-10-09 15:42:39.992	57c1937f-a6cd-49d3-b6d4-559c904469fa	2024-01-01 00:00:00	2024-03-31 00:00:00	ACTIVE	\N	85393201-bcf0-435a-a974-f82200c5d796	IoT Specialist	100
d2083da4-7648-4bdc-a0dc-19570a952653	0f1f2a16-959f-4658-9b57-faa789191dee	f67042b8-7696-4cc0-ad1c-4ebb9a661c96	2025-10-09 15:42:39.992	f2ab5885-de2f-44c0-ae57-ee41348162db	2024-02-16 00:00:00	2024-03-31 00:00:00	ACTIVE	\N	85393201-bcf0-435a-a974-f82200c5d796	Installation Specialist	100
d104b01a-93b7-443c-a937-9f793bf5dc37	18fe5f05-449e-437e-ae93-8dfe3eb7ddba	f67042b8-7696-4cc0-ad1c-4ebb9a661c96	2025-10-09 15:42:39.992	58475d87-4c90-41ac-80e2-b6e6efe6e7a1	2024-01-15 00:00:00	2024-02-15 00:00:00	ACTIVE	\N	85393201-bcf0-435a-a974-f82200c5d796	Lead Engineer	100
800980ea-3828-4fd1-8b84-1bd67450022a	8f09a373-7810-43bf-859d-c3299087b0c3	f67042b8-7696-4cc0-ad1c-4ebb9a661c96	2025-10-09 15:42:39.992	ddd076aa-552a-4cfe-b46a-51047d6c737d	2024-04-01 00:00:00	2024-04-30 00:00:00	ACTIVE	\N	85393201-bcf0-435a-a974-f82200c5d796	Network Engineer	100
95b0d2d4-7556-4dbf-9191-c1da327877d2	18fe5f05-449e-437e-ae93-8dfe3eb7ddba	f67042b8-7696-4cc0-ad1c-4ebb9a661c96	2025-10-09 15:42:39.992	351aa208-2e9b-4343-92fb-7e48e218d302	2024-02-01 00:00:00	2024-02-15 00:00:00	ACTIVE	\N	85393201-bcf0-435a-a974-f82200c5d796	Cloud Architect	100
0741cd59-6b2e-4422-aaf5-d763df370725	0f1f2a16-959f-4658-9b57-faa789191dee	f67042b8-7696-4cc0-ad1c-4ebb9a661c96	2025-10-09 15:42:39.992	6c0fdb8f-4e15-4054-bbda-3638e93294db	2024-04-01 00:00:00	2024-05-15 00:00:00	ACTIVE	\N	85393201-bcf0-435a-a974-f82200c5d796	Integration Engineer	100
a4859af7-7352-4278-8fb4-cbd846a60378	0f1f2a16-959f-4658-9b57-faa789191dee	f67042b8-7696-4cc0-ad1c-4ebb9a661c96	2025-10-09 15:42:39.992	fddd5f8b-7121-4e4c-ad12-d43faf9d43d6	2024-02-16 00:00:00	2024-03-15 00:00:00	ACTIVE	\N	85393201-bcf0-435a-a974-f82200c5d796	Infrastructure Analyst	100
35ebf98a-96c8-4038-893c-b7ce09382148	8f09a373-7810-43bf-859d-c3299087b0c3	f67042b8-7696-4cc0-ad1c-4ebb9a661c96	2025-10-09 15:42:39.992	1ffd2e8c-841d-4b42-8921-eb68046a32ef	2024-03-16 00:00:00	2024-04-30 00:00:00	ACTIVE	\N	85393201-bcf0-435a-a974-f82200c5d796	DevOps Engineer	100
\.


--
-- Data for Name: tbl_resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_resources (id, name, description, "createdAt", "updatedAt", "createdBy", "userId", skills, department, phone, email, "maxProjects", "hourlyRate", status, type) FROM stdin;
a34ff661-99c9-42c1-9efc-746484b33010	John Manager	Senior field engineer specializing in electrical installations and site supervision	2025-10-08 12:38:01.466	2025-10-08 12:38:01.509	85393201-bcf0-435a-a974-f82200c5d796	41883240-1a10-4c33-996f-9e9544f80af1	Electrical Systems, Site Supervision, Safety Management, Quality Control	Engineering	+62-813-4567-8901	manager@projecthub.com	4	65	ALLOCATED	FIELD_ENGINEER
36d0f289-7317-4875-b441-c620b5b2163b	System Administrator	Experienced project manager with 10+ years in electrical and IT projects	2025-10-08 12:38:01.462	2025-10-08 12:38:01.508	85393201-bcf0-435a-a974-f82200c5d796	85393201-bcf0-435a-a974-f82200c5d796	Project Management, Risk Assessment, Team Leadership, Budget Planning	Project Management	+62-812-3456-7890	admin@projecthub.com	5	75	ALLOCATED	PROJECT_MANAGER
e4f20a47-6a4f-4269-86cb-20e36ddeeb7e	API Test User	Technical specialist with expertise in system maintenance and troubleshooting	2025-10-08 12:38:01.467	2025-10-08 12:38:01.51	85393201-bcf0-435a-a974-f82200c5d796	3a596806-bba4-4d54-a9f7-91fb19f74160	System Maintenance, Troubleshooting, Technical Support, Documentation	Technical Support	+62-815-6789-0123	apitest@example.com	4	55	ALLOCATED	TECHNICAL_TEAM
ef317b6c-8e5a-4a2f-ac04-618efca14c99	Jane Engineer	Full-stack developer with expertise in web applications and system integration	2025-10-08 12:38:01.467	2025-10-08 12:38:01.51	85393201-bcf0-435a-a974-f82200c5d796	0aa0a5fe-902e-4457-9121-a0624e643283	React, Node.js, PostgreSQL, System Integration, API Development	IT Development	+62-814-5678-9012	engineer@projecthub.com	3	70	ALLOCATED	IT_DEVELOPER
dc991037-2bae-472b-ac81-16f5016652de	Sarah Johnson	Senior Full-Stack Developer with expertise in React, Node.js, and cloud technologies	2025-10-21 07:30:33.513	2025-10-21 07:30:33.513	85393201-bcf0-435a-a974-f82200c5d796	cmh08vv6u00010g5p7ic457cl	React, Node.js, TypeScript, AWS, Docker, PostgreSQL	IT Development	+1-555-0101	sarah.johnson@company.com	3	85	AVAILABLE	IT_DEVELOPER
a9a2dcb7-d5cb-46ed-afcf-9f9bbb900e83	Michael Chen	Backend Developer specializing in microservices and database optimization	2025-10-21 07:30:33.518	2025-10-21 07:30:33.518	85393201-bcf0-435a-a974-f82200c5d796	cmh08vv7100040g5pjls4ovtp	Python, Django, PostgreSQL, Redis, Kubernetes, Microservices	IT Development	+1-555-0102	michael.chen@company.com	2	90	AVAILABLE	IT_DEVELOPER
1ca10036-4a68-47f5-ad42-e115f80ecd32	Emily Rodriguez	Frontend Developer with strong UI/UX design skills and mobile development experience	2025-10-21 07:30:33.52	2025-10-21 07:30:33.52	85393201-bcf0-435a-a974-f82200c5d796	cmh08vv7300070g5p0y5tavl2	Vue.js, React Native, Flutter, Figma, CSS, JavaScript	IT Development	+1-555-0103	emily.rodriguez@company.com	2	75	BUSY	IT_DEVELOPER
180607f0-4b6f-46d9-9343-3c04578b0f31	David Kim	DevOps Engineer with extensive experience in CI/CD pipelines and infrastructure automation	2025-10-21 07:30:33.521	2025-10-21 07:30:33.521	85393201-bcf0-435a-a974-f82200c5d796	cmh08vv74000a0g5po76sy9ti	AWS, Terraform, Jenkins, Docker, Kubernetes, Linux, Bash	IT Operations	+1-555-0104	david.kim@company.com	4	95	AVAILABLE	IT_DEVELOPER
830b929d-27e1-4d6f-8469-b5665bb1188f	Lisa Wang	Data Engineer with expertise in big data processing and machine learning pipelines	2025-10-21 07:30:33.522	2025-10-21 07:30:33.522	85393201-bcf0-435a-a974-f82200c5d796	cmh08vv75000d0g5pifwurnfg	Python, Apache Spark, Kafka, Airflow, TensorFlow, SQL, MongoDB	IT Data	+1-555-0105	lisa.wang@company.com	2	88	AVAILABLE	IT_DEVELOPER
f71960b6-8ea5-4553-959e-8ab6812df4b5	James Thompson	Cybersecurity Specialist with focus on application security and penetration testing	2025-10-21 07:30:33.524	2025-10-21 07:30:33.524	85393201-bcf0-435a-a974-f82200c5d796	cmh08vv77000g0g5p82z1jw58	OWASP, Burp Suite, Metasploit, Python, Security Auditing, Risk Assessment	IT Security	+1-555-0106	james.thompson@company.com	3	92	AVAILABLE	IT_DEVELOPER
08edd973-fff6-4eb7-910f-009b0ce6469a	Maria Garcia	Mobile App Developer with expertise in iOS and Android native development	2025-10-21 07:30:33.525	2025-10-21 07:30:33.525	85393201-bcf0-435a-a974-f82200c5d796	cmh08vv78000j0g5pqu5giaao	Swift, Kotlin, Java, iOS SDK, Android SDK, Firebase, REST APIs	IT Development	+1-555-0107	maria.garcia@company.com	2	80	BUSY	IT_DEVELOPER
1579a0fc-db49-47f6-bf8c-4346a0a35994	Alex Turner	Cloud Solutions Architect with expertise in multi-cloud strategies and migration	2025-10-21 07:30:33.526	2025-10-21 07:30:33.526	85393201-bcf0-435a-a974-f82200c5d796	cmh08vv79000m0g5p2idw2w9a	AWS, Azure, GCP, Terraform, CloudFormation, Architecture Design, Cost Optimization	IT Architecture	+1-555-0108	alex.turner@company.com	3	100	AVAILABLE	IT_DEVELOPER
0d301e88-f33a-4e77-b7c8-645a8319498e	Rachel Green	QA Engineer with expertise in automated testing and quality assurance processes	2025-10-21 07:30:33.527	2025-10-21 07:30:33.527	85393201-bcf0-435a-a974-f82200c5d796	cmh08vv7a000p0g5pxtt3ppet	Selenium, Cypress, Jest, TestNG, API Testing, Performance Testing, CI/CD	IT Quality Assurance	+1-555-0109	rachel.green@company.com	4	70	AVAILABLE	IT_DEVELOPER
f8551c6f-be91-4d23-9bd4-03636bd5bc52	Kevin Park	Blockchain Developer with expertise in smart contracts and decentralized applications	2025-10-21 07:30:33.528	2025-10-21 07:30:33.528	85393201-bcf0-435a-a974-f82200c5d796	cmh08vv7b000s0g5p2i8yx693	Solidity, Web3.js, Ethereum, IPFS, Truffle, Hardhat, DeFi Protocols	IT Innovation	+1-555-0110	kevin.park@company.com	2	110	AVAILABLE	IT_DEVELOPER
\.


--
-- Data for Name: tbl_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_roles (id, name, description, permissions, "createdAt", "updatedAt") FROM stdin;
301d3683-3700-4a62-8374-7d5fce0d568d	IT Developer / Technical Team	Technical team member	{"risks": {"read": true, "create": true}, "tasks": {"all": true}, "budgets": {"read": true}, "projects": {"read": true}, "dashboard": {"read": true}, "documents": {"all": true}, "resources": {"read": true}}	2025-10-08 08:37:05.723	2025-10-08 08:37:05.723
3100690f-7f1f-4eb3-9ed4-425b778fc318	Field/Site Engineer	Can work on assigned tasks	{"risks": {"read": true, "create": true}, "tasks": {"read": true, "update": true}, "budgets": {"read": true}, "projects": {"read": true}, "dashboard": {"read": true}, "documents": {"read": true, "create": true}, "resources": {"read": true}}	2025-10-08 08:37:05.722	2025-10-08 08:37:05.722
2a8527c8-1f92-4426-9880-aa752bb8318b	Project Manager	Can manage projects and teams	{"risks": {"all": true}, "tasks": {"all": true}, "budgets": {"read": true, "create": true}, "projects": {"read": true, "create": true, "update": true}, "dashboard": {"read": true}, "documents": {"all": true}, "resources": {"read": true, "create": true}}	2025-10-08 08:37:05.72	2025-10-08 08:37:05.72
2236f8bc-e4ab-4f21-a79c-6bac098e9727	Client / Stakeholder	View-only access	{"risks": {"read": true}, "tasks": {"read": true}, "budgets": {"read": true}, "projects": {"read": true}, "dashboard": {"read": true}, "documents": {"read": true}, "resources": {"read": true}}	2025-10-08 08:37:05.725	2025-10-08 08:37:05.725
4e7a4bd3-57b0-4e86-ad6e-135dcd253892	System Admin	Full system access	{"risks": {"all": true}, "tasks": {"all": true}, "users": {"all": true}, "budgets": {"all": true}, "projects": {"all": true}, "dashboard": {"read": true}, "documents": {"all": true}, "resources": {"all": true}}	2025-10-08 08:37:05.711	2025-10-08 08:37:05.711
\.


--
-- Data for Name: tbl_segmen; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_segmen (id, segmen, created_at, updated_at) FROM stdin;
f0e0bb97-bc0d-4a9b-bf5f-b88c5eb8c568	EP & Pembangkit	2025-07-29 09:32:39.772	2025-07-29 09:32:39.772
79be239e-f8ac-4e90-a404-30856ba2ea91	Pelayanan Pelanggan	2025-07-29 09:40:13.629	2025-07-29 09:40:13.629
38449816-f479-4d2d-8781-da07b2f9b6be	Distribusi	2025-07-29 09:37:03.085	2025-07-29 09:37:03.085
08dadc78-ffc1-4014-9197-6872966afad8	Transmisi	2025-07-29 09:35:15.386	2025-07-29 09:35:15.386
81b5aeec-175b-4398-a732-323a31602df7	Korporat	2025-07-29 09:38:37.823	2025-07-29 09:38:37.823
\.


--
-- Data for Name: tbl_stage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_stage (id, stage, created_at, updated_at) FROM stdin;
511470b9-c2e4-4343-b578-1b3b4999bcd9	Growth	2025-07-29 09:57:03.464	2025-07-29 09:57:03.464
8818da03-af5a-444f-97a0-8a2779fe52b1	Maturity	2025-07-29 09:57:37.032	2025-07-29 09:57:37.032
d71a9df3-3401-4fd6-bcad-2bbca4f11e69	Decline	2025-07-29 09:57:55.626	2025-07-29 09:57:55.626
dede11af-8df5-44d8-be7b-43e076173c94	Introduction	2025-07-29 09:56:34.758	2025-07-29 09:56:34.758
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
9ead3459-6823-4390-b36a-97f2aa333c9f	Project Documentation	Create comprehensive project documentation including user manuals and maintenance guides	bf3ea009-bbef-45b7-b473-0f3c3531d3d1	9be1e16e-9513-467a-9bed-84d9043f541c	9be1e16e-9513-467a-9bed-84d9043f541c	TODO	LOW	0	2024-05-01 00:00:00	2024-06-15 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
dfbb3b84-b269-4eee-9a3f-03456def6a17	Cloud Migration Planning	Plan migration strategy from on-premise to AWS cloud infrastructure	bf3ea009-bbef-45b7-b473-0f3c3531d3d1	9be1e16e-9513-467a-9bed-84d9043f541c	9be1e16e-9513-467a-9bed-84d9043f541c	COMPLETED	URGENT	100	2024-02-01 00:00:00	2024-02-15 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
3edf7f8b-ddb4-4f0c-80e7-fed6f75b3882	IoT Sensors Installation	Install IoT sensors for temperature, humidity, lighting, and security monitoring	bf3ea009-bbef-45b7-b473-0f3c3531d3d1	9be1e16e-9513-467a-9bed-84d9043f541c	9be1e16e-9513-467a-9bed-84d9043f541c	IN_PROGRESS	MEDIUM	45	2024-01-01 00:00:00	2024-03-31 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
0457e551-e492-4d04-a86d-6ce4c4517609	AWS Infrastructure Setup	Set up AWS infrastructure including VPC, EC2 instances, and security groups	bf3ea009-bbef-45b7-b473-0f3c3531d3d1	9be1e16e-9513-467a-9bed-84d9043f541c	9be1e16e-9513-467a-9bed-84d9043f541c	TODO	HIGH	0	2024-03-16 00:00:00	2024-04-30 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
e3405f4d-c7a7-4641-84e6-9aa8b096c6e5	Network Infrastructure Design	Design complete network infrastructure including topology, equipment specifications, and implementation plan	bf3ea009-bbef-45b7-b473-0f3c3531d3d1	9be1e16e-9513-467a-9bed-84d9043f541c	9be1e16e-9513-467a-9bed-84d9043f541c	IN_PROGRESS	HIGH	75	2024-01-15 00:00:00	2024-02-15 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
0641cb46-980e-4e35-b2d1-50d55ef9e94e	Network Equipment Setup	Configure and install switches, routers, and wireless access points	bf3ea009-bbef-45b7-b473-0f3c3531d3d1	9be1e16e-9513-467a-9bed-84d9043f541c	9be1e16e-9513-467a-9bed-84d9043f541c	TODO	MEDIUM	0	2024-04-01 00:00:00	2024-04-30 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
8473c18b-334f-48c7-922a-78e80c6bc3f6	Fiber Optic Installation	Install fiber optic cables throughout the building according to design specifications	bf3ea009-bbef-45b7-b473-0f3c3531d3d1	9be1e16e-9513-467a-9bed-84d9043f541c	9be1e16e-9513-467a-9bed-84d9043f541c	TODO	HIGH	0	2024-02-16 00:00:00	2024-03-31 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
7b25c138-e01a-445f-8b28-46b1b1232f89	System Testing and Commissioning	Test all IoT systems and commission the smart building solution	bf3ea009-bbef-45b7-b473-0f3c3531d3d1	9be1e16e-9513-467a-9bed-84d9043f541c	9be1e16e-9513-467a-9bed-84d9043f541c	TODO	HIGH	0	2024-05-16 00:00:00	2024-05-31 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
b95ad225-0281-41d0-aac2-922856712962	Smart Building Integration	Integrate IoT sensors with building management system	bf3ea009-bbef-45b7-b473-0f3c3531d3d1	9be1e16e-9513-467a-9bed-84d9043f541c	9be1e16e-9513-467a-9bed-84d9043f541c	REVIEW	MEDIUM	80	2024-04-01 00:00:00	2024-05-15 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
3442c502-5d72-4467-bbbc-a48fbcc5f8fb	Data Center Assessment	Assess current data center infrastructure and create migration roadmap	bf3ea009-bbef-45b7-b473-0f3c3531d3d1	9be1e16e-9513-467a-9bed-84d9043f541c	9be1e16e-9513-467a-9bed-84d9043f541c	IN_PROGRESS	HIGH	60	2024-02-16 00:00:00	2024-03-15 00:00:00	\N	\N	2025-10-09 15:42:39.992	2025-10-09 15:42:39.992
\.


--
-- Data for Name: tbl_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_users (id, email, name, password, phone, avatar, "roleId", "isActive", "createdAt", "updatedAt") FROM stdin;
9be1e16e-9513-467a-9bed-84d9043f541c	engineer@projecthub.com	Jane Engineer	$2b$12$Z9DOq1SUnnyw6NSMQb9BduV8Q91AoHTNZ./KbswRcmkKszjR1uUSy	+1234567892	\N	3100690f-7f1f-4eb3-9ed4-425b778fc318	t	2025-10-08 09:45:47.924	2025-10-08 09:45:47.924
6f83b8cc-acb0-461a-a387-b4a905d85a25	apitest@example.com	API Test User	$2b$12$bwjRS2h/w6T8FqemPWwEFep6Q/ij0O6EkYFiTcUPHaaLO1zS1z902	\N	\N	2236f8bc-e4ab-4f21-a79c-6bac098e9727	t	2025-10-08 10:31:42.785	2025-10-08 10:31:42.785
94dd9cd5-b766-484e-b387-c1d81f74b1e4	manager@projecthub.com	John Manager	$2b$12$LAjGEPa2WMLAqioSKndQMuDxm6LHfrb9oa.j/uQeum923Nga6Zxt.	+1234567891	\N	2a8527c8-1f92-4426-9880-aa752bb8318b	t	2025-10-08 09:45:47.706	2025-10-08 09:45:47.706
56407565-3c32-44ca-aaf0-4fe85caf0603	lisa.wang@company.com	Lisa Wang	$2b$12$92rWDTTKSaHIjSHBK49c6uo1/fkMwCaw.YH1QKMLcmUtREUTu2ugS	+1-555-0105	\N	4e7a4bd3-57b0-4e86-ad6e-135dcd253892	t	2025-10-21 07:30:33.522	2025-10-21 07:30:33.522
ee80da29-73fa-4eac-95ae-d2ef2d50c847	james.thompson@company.com	James Thompson	$2b$12$92rWDTTKSaHIjSHBK49c6uo1/fkMwCaw.YH1QKMLcmUtREUTu2ugS	+1-555-0106	\N	4e7a4bd3-57b0-4e86-ad6e-135dcd253892	t	2025-10-21 07:30:33.523	2025-10-21 07:30:33.523
f1cd2c8a-f5fe-4c6a-aa23-b810b4f961c5	maria.garcia@company.com	Maria Garcia	$2b$12$92rWDTTKSaHIjSHBK49c6uo1/fkMwCaw.YH1QKMLcmUtREUTu2ugS	+1-555-0107	\N	4e7a4bd3-57b0-4e86-ad6e-135dcd253892	t	2025-10-21 07:30:33.524	2025-10-21 07:30:33.524
4d700226-0c68-4ba6-a382-3582112d868a	alex.turner@company.com	Alex Turner	$2b$12$92rWDTTKSaHIjSHBK49c6uo1/fkMwCaw.YH1QKMLcmUtREUTu2ugS	+1-555-0108	\N	4e7a4bd3-57b0-4e86-ad6e-135dcd253892	t	2025-10-21 07:30:33.526	2025-10-21 07:30:33.526
0791e019-2e07-43ee-974c-e4181752e184	rachel.green@company.com	Rachel Green	$2b$12$92rWDTTKSaHIjSHBK49c6uo1/fkMwCaw.YH1QKMLcmUtREUTu2ugS	+1-555-0109	\N	4e7a4bd3-57b0-4e86-ad6e-135dcd253892	t	2025-10-21 07:30:33.527	2025-10-21 07:30:33.527
3b69e82f-eead-41d5-876f-ca086c1dbd25	kevin.park@company.com	Kevin Park	$2b$12$92rWDTTKSaHIjSHBK49c6uo1/fkMwCaw.YH1QKMLcmUtREUTu2ugS	+1-555-0110	\N	4e7a4bd3-57b0-4e86-ad6e-135dcd253892	t	2025-10-21 07:30:33.528	2025-10-21 07:30:33.528
739c0199-15c9-452c-a2d0-bd372a0ce957	admin@projecthub.com	System Administrator	$2b$12$92rWDTTKSaHIjSHBK49c6uo1/fkMwCaw.YH1QKMLcmUtREUTu2ugS	+1234567890	\N	4e7a4bd3-57b0-4e86-ad6e-135dcd253892	t	2025-10-08 08:37:05.96	2025-10-08 08:37:05.96
3dca9a4c-27ea-4dde-af36-15e8dca75bc0	sarah.johnson@company.com	Sarah Johnson	$2b$12$92rWDTTKSaHIjSHBK49c6uo1/fkMwCaw.YH1QKMLcmUtREUTu2ugS	+1-555-0101	\N	4e7a4bd3-57b0-4e86-ad6e-135dcd253892	t	2025-10-21 07:30:33.51	2025-10-21 07:30:33.51
28132168-a2f2-4d0c-8a68-31404209b1fd	michael.chen@company.com	Michael Chen	$2b$12$92rWDTTKSaHIjSHBK49c6uo1/fkMwCaw.YH1QKMLcmUtREUTu2ugS	+1-555-0102	\N	4e7a4bd3-57b0-4e86-ad6e-135dcd253892	t	2025-10-21 07:30:33.517	2025-10-21 07:30:33.517
be2a7871-59d2-41ac-84b9-98de4c11607c	emily.rodriguez@company.com	Emily Rodriguez	$2b$12$92rWDTTKSaHIjSHBK49c6uo1/fkMwCaw.YH1QKMLcmUtREUTu2ugS	+1-555-0103	\N	4e7a4bd3-57b0-4e86-ad6e-135dcd253892	t	2025-10-21 07:30:33.519	2025-10-21 07:30:33.519
9b2c9d03-453b-461a-a3bc-8e74950d5ab3	david.kim@company.com	David Kim	$2b$12$92rWDTTKSaHIjSHBK49c6uo1/fkMwCaw.YH1QKMLcmUtREUTu2ugS	+1-555-0104	\N	4e7a4bd3-57b0-4e86-ad6e-135dcd253892	t	2025-10-21 07:30:33.52	2025-10-21 07:30:33.52
\.


--
-- Name: EstimateLine EstimateLine_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EstimateLine"
    ADD CONSTRAINT "EstimateLine_pkey" PRIMARY KEY (id);


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
-- Name: tbl_cost_estimator tbl_cost_estimator_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_cost_estimator
    ADD CONSTRAINT tbl_cost_estimator_pkey PRIMARY KEY (id);


--
-- Name: tbl_documents tbl_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_documents
    ADD CONSTRAINT tbl_documents_pkey PRIMARY KEY (id);


--
-- Name: tbl_hjt_blnp tbl_hjt_blnp_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_hjt_blnp
    ADD CONSTRAINT tbl_hjt_blnp_pkey PRIMARY KEY (id);


--
-- Name: tbl_hjt_blp tbl_hjt_blp_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_hjt_blp
    ADD CONSTRAINT tbl_hjt_blp_pkey PRIMARY KEY (id);


--
-- Name: tbl_hjt tbl_hjt_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_hjt
    ADD CONSTRAINT tbl_hjt_pkey PRIMARY KEY (id);


--
-- Name: tbl_kategori tbl_kategori_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_kategori
    ADD CONSTRAINT tbl_kategori_pkey PRIMARY KEY (id);


--
-- Name: tbl_license_notifications tbl_license_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_license_notifications
    ADD CONSTRAINT tbl_license_notifications_pkey PRIMARY KEY (id);


--
-- Name: tbl_milestones tbl_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_milestones
    ADD CONSTRAINT tbl_milestones_pkey PRIMARY KEY (id);


--
-- Name: tbl_mon_licenses tbl_mon_licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_mon_licenses
    ADD CONSTRAINT tbl_mon_licenses_pkey PRIMARY KEY (id);


--
-- Name: tbl_produk tbl_produk_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_produk
    ADD CONSTRAINT tbl_produk_pkey PRIMARY KEY (id);


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
-- Name: tbl_roles tbl_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles
    ADD CONSTRAINT tbl_roles_pkey PRIMARY KEY (id);


--
-- Name: tbl_segmen tbl_segmen_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_segmen
    ADD CONSTRAINT tbl_segmen_pkey PRIMARY KEY (id);


--
-- Name: tbl_stage tbl_stage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_stage
    ADD CONSTRAINT tbl_stage_pkey PRIMARY KEY (id);


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
-- Name: EstimateLine_costEstimatorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EstimateLine_costEstimatorId_idx" ON public."EstimateLine" USING btree ("costEstimatorId");


--
-- Name: EstimateLine_estimateId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EstimateLine_estimateId_idx" ON public."EstimateLine" USING btree ("estimateId");


--
-- Name: tbl_kategori_kategori_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tbl_kategori_kategori_key ON public.tbl_kategori USING btree (kategori);


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
-- Name: tbl_segmen_segmen_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tbl_segmen_segmen_key ON public.tbl_segmen USING btree (segmen);


--
-- Name: tbl_stage_stage_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tbl_stage_stage_key ON public.tbl_stage USING btree (stage);


--
-- Name: tbl_task_dependencies_taskId_dependsOnTaskId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "tbl_task_dependencies_taskId_dependsOnTaskId_key" ON public.tbl_task_dependencies USING btree ("taskId", "dependsOnTaskId");


--
-- Name: tbl_users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tbl_users_email_key ON public.tbl_users USING btree (email);


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
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict FjkK3nNKSBXUF8SfNsodF881hEAlpGRpT2kdWsJQb5BVHUXNdb5plV3ID8Cqg0U

