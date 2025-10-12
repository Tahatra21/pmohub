--
-- PostgreSQL database dump
--

\restrict fws0xOnUwA6M1SdXiv7zrRFz7lzGaCJCXiGQcLrQAhMynBsIfTYADBXOl8LJdXb

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
-- Name: ProjectType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProjectType" AS ENUM (
    'ELECTRICAL',
    'IT',
    'CONSTRUCTION',
    'MAINTENANCE',
    'CONSULTING'
);


ALTER TYPE public."ProjectType" OWNER TO postgres;

--
-- Name: ResourceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ResourceType" AS ENUM (
    'MANPOWER',
    'EQUIPMENT',
    'MATERIAL',
    'TOOL',
    'SOFTWARE',
    'OTHER'
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
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id text NOT NULL,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text NOT NULL,
    description text,
    "userId" text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budgets (
    id text NOT NULL,
    "projectId" text NOT NULL,
    category text NOT NULL,
    "estimatedCost" double precision NOT NULL,
    "actualCost" double precision DEFAULT 0 NOT NULL,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.budgets OWNER TO postgres;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
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


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: milestones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.milestones (
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


ALTER TABLE public.milestones OWNER TO postgres;

--
-- Name: project_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_members (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "userId" text NOT NULL,
    role text NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.project_members OWNER TO postgres;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    type public."ProjectType" NOT NULL,
    client text NOT NULL,
    location text,
    status public."ProjectStatus" DEFAULT 'PLANNING'::public."ProjectStatus" NOT NULL,
    priority public."Priority" DEFAULT 'MEDIUM'::public."Priority" NOT NULL,
    progress double precision DEFAULT 0 NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: resource_allocations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_allocations (
    id text NOT NULL,
    "resourceId" text NOT NULL,
    "projectId" text NOT NULL,
    "userId" text,
    quantity double precision NOT NULL,
    "allocatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.resource_allocations OWNER TO postgres;

--
-- Name: resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resources (
    id text NOT NULL,
    name text NOT NULL,
    type public."ResourceType" NOT NULL,
    description text,
    quantity double precision,
    unit text,
    "costPerUnit" double precision,
    "projectId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.resources OWNER TO postgres;

--
-- Name: risks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.risks (
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


ALTER TABLE public.risks OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    permissions jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: task_dependencies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_dependencies (
    id text NOT NULL,
    "taskId" text NOT NULL,
    "dependsOnTaskId" text NOT NULL
);


ALTER TABLE public.task_dependencies OWNER TO postgres;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
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


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
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


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, action, entity, "entityId", description, "userId", metadata, "createdAt") FROM stdin;
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
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, name, description, type, client, location, status, priority, progress, "startDate", "endDate", "createdBy", "createdAt", "updatedAt") FROM stdin;
cmghqfhob000c0ghg216n90mg	Office Building Electrical Installation	Complete electrical system installation for new office building	ELECTRICAL	ABC Construction Corp	123 Main St, City, State	IN_PROGRESS	HIGH	65	2024-01-15 00:00:00	2024-06-30 00:00:00	cmghqfhi700080ghgsx2f7n64	2025-10-08 08:34:05.243	2025-10-08 08:34:05.243
cmghqfhod000e0ghgnn3u6rzy	Network Infrastructure Upgrade	Upgrade network infrastructure for better performance and security	IT	Tech Solutions Inc	456 Tech Ave, City, State	PLANNING	MEDIUM	15	2024-03-01 00:00:00	2024-08-15 00:00:00	cmghqfhi700080ghgsx2f7n64	2025-10-08 08:34:05.246	2025-10-08 08:34:05.246
\.


--
-- Data for Name: resource_allocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_allocations (id, "resourceId", "projectId", "userId", quantity, "allocatedAt") FROM stdin;
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
-- Data for Name: risks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.risks (id, title, description, "projectId", severity, status, mitigation, "assigneeId", "identifiedAt", "resolvedAt", "createdAt", "updatedAt") FROM stdin;
cmghqfhoo000t0ghgqpqwlynm	Supply Chain Delays	Potential delays in electrical component delivery	cmghqfhob000c0ghg216n90mg	MEDIUM	OPEN	Order components early and have backup suppliers	cmghqfhi700080ghgsx2f7n64	2025-10-08 08:34:05.256	\N	2025-10-08 08:34:05.256	2025-10-08 08:34:05.256
cmghqfhoo000u0ghgfkwpagb2	Weather Impact	Weather conditions may delay outdoor work	cmghqfhob000c0ghg216n90mg	LOW	OPEN	Plan work schedule around weather forecast	cmghqfho8000a0ghg1btr5eby	2025-10-08 08:34:05.256	\N	2025-10-08 08:34:05.256	2025-10-08 08:34:05.256
cmghqfhoo000v0ghg0ju4hfbj	System Compatibility	New network equipment may not be compatible with existing systems	cmghqfhod000e0ghgnn3u6rzy	HIGH	OPEN	Thorough testing before full deployment	cmghqfho8000a0ghg1btr5eby	2025-10-08 08:34:05.256	\N	2025-10-08 08:34:05.256	2025-10-08 08:34:05.256
\.


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
-- Data for Name: task_dependencies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_dependencies (id, "taskId", "dependsOnTaskId") FROM stdin;
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
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, name, password, phone, avatar, "roleId", "isActive", "createdAt", "updatedAt") FROM stdin;
cmghqfhc400060ghg3gd57esx	admin@projecthub.com	System Administrator	$2b$12$uVg4MxqFvZZUCXFwgcMdjOi4ikUtwQ4XlQUl63xTj600m0wzpdUci	+1234567890	\N	cmghqfh5f00000ghgixlh3trj	t	2025-10-08 08:34:04.805	2025-10-08 08:34:04.805
cmghqfhi700080ghgsx2f7n64	manager@projecthub.com	John Manager	$2b$12$3CLmCBLQJprPgfyk29ckgOxVtTNpJa.gY06qpg.oI3EupJBBHx9Ve	+1234567891	\N	cmghqfh5m00010ghgvnm2eguc	t	2025-10-08 08:34:05.023	2025-10-08 08:34:05.023
cmghqfho8000a0ghg1btr5eby	engineer@projecthub.com	Jane Engineer	$2b$12$GXttIWOZG.9prAakvQVlGOL74BpvynOJbGErBoRmefoyLCQUF33BO	+1234567892	\N	cmghqfh5o00020ghgry53cqsc	t	2025-10-08 08:34:05.241	2025-10-08 08:34:05.241
\.


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: milestones milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT milestones_pkey PRIMARY KEY (id);


--
-- Name: project_members project_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: resource_allocations resource_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_allocations
    ADD CONSTRAINT resource_allocations_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: risks risks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.risks
    ADD CONSTRAINT risks_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: task_dependencies task_dependencies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_dependencies
    ADD CONSTRAINT task_dependencies_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: project_members_projectId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "project_members_projectId_userId_key" ON public.project_members USING btree ("projectId", "userId");


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: task_dependencies_taskId_dependsOnTaskId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "task_dependencies_taskId_dependsOnTaskId_key" ON public.task_dependencies USING btree ("taskId", "dependsOnTaskId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: activity_logs activity_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: budgets budgets_approvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT "budgets_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: budgets budgets_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT "budgets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: documents documents_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: documents documents_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: documents documents_uploadedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: milestones milestones_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT "milestones_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_members project_members_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT "project_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_members project_members_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT "project_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: projects projects_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "projects_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: resource_allocations resource_allocations_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_allocations
    ADD CONSTRAINT "resource_allocations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: resource_allocations resource_allocations_resourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_allocations
    ADD CONSTRAINT "resource_allocations_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: resource_allocations resource_allocations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_allocations
    ADD CONSTRAINT "resource_allocations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: resources resources_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT "resources_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: risks risks_assigneeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.risks
    ADD CONSTRAINT "risks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: risks risks_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.risks
    ADD CONSTRAINT "risks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_dependencies task_dependencies_dependsOnTaskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_dependencies
    ADD CONSTRAINT "task_dependencies_dependsOnTaskId_fkey" FOREIGN KEY ("dependsOnTaskId") REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_dependencies task_dependencies_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_dependencies
    ADD CONSTRAINT "task_dependencies_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tasks tasks_assigneeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tasks tasks_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tasks tasks_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict fws0xOnUwA6M1SdXiv7zrRFz7lzGaCJCXiGQcLrQAhMynBsIfTYADBXOl8LJdXb

